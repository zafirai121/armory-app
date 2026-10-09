// The armory's records and every movement, kept on this device.
// Weapons are tracked one by one (by serial number) and ammunition by quantity.
// Ammunition balances are never stored: they are summed from the movement log,
// so the log is the one record of what came in, what went out and who holds what.

export class UserError extends Error {}

const KEY = 'armory-app:data:v1';
const CORRUPT_KEY = 'armory-app:unreadable-copy';

export const WEAPON_STATUS = {
  in_store: { label: 'في المستودع', tone: 'ok' },
  issued: { label: 'مسلّم', tone: 'warn' },
  maintenance: { label: 'في الصيانة', tone: 'info' },
  unserviceable: { label: 'عاطل', tone: 'muted' },
  lost: { label: 'مفقود', tone: 'danger' },
};

export const LOG_KINDS = {
  w_add: { label: 'إدخال سلاح', icon: 'plus', group: 'weapons' },
  w_issue: { label: 'تسليم سلاح', icon: 'issue', group: 'weapons' },
  w_return: { label: 'إرجاع سلاح', icon: 'return', group: 'weapons' },
  w_status: { label: 'تغيير حالة سلاح', icon: 'wrench', group: 'weapons' },
  w_remove: { label: 'شطب سلاح', icon: 'trash', group: 'weapons' },
  a_in: { label: 'استلام عتاد وارد', icon: 'receive', group: 'ammo' },
  a_issue: { label: 'صرف عتاد', icon: 'issue', group: 'ammo' },
  a_return: { label: 'إرجاع عتاد', icon: 'return', group: 'ammo' },
  a_consume: { label: 'استهلاك عتاد', icon: 'flame', group: 'ammo' },
  a_out: { label: 'إخراج عتاد', icon: 'send', group: 'ammo' },
  a_adjust: { label: 'تسوية جرد', icon: 'scale', group: 'ammo' },
};

// Arabic-Indic and Persian digits typed on an Arabic keyboard count as digits
export const toLatinDigits = (s) => String(s ?? '')
  .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660))
  .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06f0));

const clean = (v) => String(v ?? '').replace(/[\u2066-\u2069]/g, '').trim().replace(/\s+/g, ' ');
const cleanCode = (v) => toLatinDigits(clean(v));
const uid = () => globalThis.crypto?.randomUUID?.()
  ?? `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;

export const personLabel = (p) => [p.rank, p.name].filter(Boolean).join(' ');
export const weaponLabel = (w) => `${w.model || w.type} — ${w.serial}`;
export const ammoLabel = (a) => [a.name, a.caliber].filter(Boolean).join(' ') + (a.lot ? ` (وجبة ${a.lot})` : '');

function count(value, what, { allowZero = false } = {}) {
  const raw = toLatinDigits(value).trim().replace(/[,،]/g, '');
  const n = raw === '' ? NaN : Number(raw);
  if (!Number.isInteger(n) || n < 0 || (!allowZero && n === 0)) {
    throw new UserError(`${what} يجب أن تكون عدداً صحيحاً ${allowZero ? 'لا يقل عن صفر' : 'أكبر من صفر'}`);
  }
  return n;
}

// A datetime-local value ("2026-10-07T14:30") or nothing for now
function when(value, now) {
  if (!value) return now().toISOString();
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) throw new UserError('التاريخ غير صحيح');
  return d.toISOString();
}

export function emptyData() {
  return {
    version: 1,
    settings: { unitName: '', keeperName: '', commanderName: '', lastBackupAt: null, lock: null },
    people: [],
    weapons: [],
    ammo: [],
    log: [],
  };
}

function normalize(raw) {
  if (!raw || typeof raw !== 'object' || ['people', 'weapons', 'ammo', 'log'].some((k) => !Array.isArray(raw[k]))) {
    throw new UserError('الملف ليس نسخة احتياطية من هذا التطبيق');
  }
  const base = emptyData();
  const isObj = (r) => r && typeof r === 'object' && typeof r.id === 'string';
  return {
    version: 1,
    settings: { ...base.settings, ...(raw.settings && typeof raw.settings === 'object' ? raw.settings : {}) },
    people: raw.people.filter((p) => isObj(p) && p.name),
    weapons: raw.weapons
      .filter((w) => isObj(w) && w.serial)
      .map((w) => (WEAPON_STATUS[w.status] ? w : { ...w, status: 'in_store', holderId: null })),
    ammo: raw.ammo.filter((a) => isObj(a) && a.name),
    log: raw.log.filter((e) => isObj(e) && LOG_KINDS[e.kind] && !Number.isNaN(new Date(e.at).getTime())),
  };
}

export function createStore({ storage = globalThis.localStorage, now = () => new Date() } = {}) {
  let persistent = true;
  let loadProblem = null;
  let lastSaved = null;
  let data = load();
  let balanceCache = null;
  const listeners = new Set();

  function load() {
    let raw = null;
    try {
      raw = storage ? storage.getItem(KEY) : null;
      if (!storage) persistent = false;
    } catch {
      persistent = false;
    }
    if (!raw) return emptyData();
    try {
      const parsed = normalize(JSON.parse(raw));
      lastSaved = raw;
      return parsed;
    } catch {
      // Keep the unreadable copy so nothing is silently lost, then start clean
      try { storage.setItem(CORRUPT_KEY, raw); } catch { /* nothing more to do */ }
      loadProblem = 'تعذّرت قراءة البيانات المحفوظة، فبدأ التطبيق بسجل فارغ. احتُفظ بالنسخة التالفة على الجهاز.';
      return emptyData();
    }
  }

  // Every change goes through here: validate first inside `fn`, then change
  // `data`; if saving fails the change is rolled back and reported.
  function mutate(fn) {
    const result = fn();
    balanceCache = null;
    if (persistent) {
      const json = JSON.stringify(data);
      try {
        storage.setItem(KEY, json);
        lastSaved = json;
      } catch {
        data = lastSaved ? normalize(JSON.parse(lastSaved)) : emptyData();
        listeners.forEach((l) => l());
        throw new UserError('تعذّر الحفظ: مساحة التخزين على هذا الجهاز ممتلئة أو محجوبة');
      }
    }
    listeners.forEach((l) => l());
    return result;
  }

  const log = (entry) => data.log.push({ id: uid(), ...entry });

  const findPerson = (id) => data.people.find((p) => p.id === id);
  const findWeapon = (id) => data.weapons.find((w) => w.id === id);
  const findAmmo = (id) => data.ammo.find((a) => a.id === id);
  const need = (rec, msg) => { if (!rec) throw new UserError(msg); return rec; };

  // ── Ammunition balances, summed from the log ──
  function balances() {
    if (balanceCache) return balanceCache;
    const map = new Map();
    for (const e of data.log) {
      if (!e.ammoId) continue;
      let b = map.get(e.ammoId);
      if (!b) map.set(e.ammoId, (b = { store: 0, issued: 0, byPerson: new Map() }));
      const q = e.qty || 0;
      const hold = (d) => {
        const v = (b.byPerson.get(e.personId) || 0) + d;
        if (v) b.byPerson.set(e.personId, v); else b.byPerson.delete(e.personId);
        b.issued += d;
      };
      switch (e.kind) {
        case 'a_in': case 'a_adjust': b.store += q; break;
        case 'a_out': b.store -= q; break;
        case 'a_issue': b.store -= q; hold(q); break;
        case 'a_return': b.store += q; hold(-q); break;
        case 'a_consume': hold(-q); break;
      }
    }
    return (balanceCache = map);
  }
  const balanceOf = (ammoId) => balances().get(ammoId) || { store: 0, issued: 0, byPerson: new Map() };

  function custodyOf(personId) {
    const weapons = data.weapons.filter((w) => w.status === 'issued' && w.holderId === personId);
    const ammo = [];
    for (const a of data.ammo) {
      const qty = balanceOf(a.id).byPerson.get(personId) || 0;
      if (qty) ammo.push({ ammo: a, qty });
    }
    return { weapons, ammo };
  }

  // ── Personnel ──
  function personFields(f, selfId) {
    const p = {
      name: clean(f.name), rank: clean(f.rank), milNo: cleanCode(f.milNo),
      platoon: clean(f.platoon), phone: cleanCode(f.phone), notes: clean(f.notes),
    };
    if (!p.name) throw new UserError('اكتب اسم المنتسب');
    if (p.milNo && data.people.some((x) => x.id !== selfId && x.milNo === p.milNo)) {
      throw new UserError(`الرقم العسكري ${p.milNo} مسجّل لمنتسب آخر`);
    }
    return p;
  }

  // ── Weapons ──
  function weaponFields(f, selfId) {
    const w = {
      type: clean(f.type), model: clean(f.model), serial: cleanCode(f.serial),
      caliber: clean(f.caliber), location: clean(f.location), notes: clean(f.notes),
    };
    if (!w.type && !w.model) throw new UserError('اكتب نوع السلاح أو طرازه');
    if (!w.serial) throw new UserError('اكتب الرقم التسلسلي للسلاح');
    const key = (x) => `${x.type}|${x.model}|${x.serial}`.toLowerCase();
    if (data.weapons.some((x) => x.id !== selfId && key(x) === key(w))) {
      throw new UserError(`السلاح ${w.model || w.type} بالرقم التسلسلي ${w.serial} مسجّل مسبقاً`);
    }
    return w;
  }

  // ── Ammunition items ──
  function ammoFields(f, selfId) {
    const a = {
      name: clean(f.name), caliber: clean(f.caliber), lot: cleanCode(f.lot),
      unit: clean(f.unit) || 'طلقة', minQty: f.minQty ? count(f.minQty, 'الحد الأدنى', { allowZero: true }) : 0,
      location: clean(f.location), notes: clean(f.notes),
    };
    if (!a.name) throw new UserError('اكتب اسم صنف العتاد');
    const key = (x) => `${x.name}|${x.caliber}|${x.lot}`.toLowerCase();
    if (data.ammo.some((x) => x.id !== selfId && key(x) === key(a))) {
      throw new UserError('هذا الصنف مسجّل مسبقاً بنفس العيار ورقم الوجبة');
    }
    return a;
  }

  const api = {
    get data() { return data; },
    get persistent() { return persistent; },
    get loadProblem() { return loadProblem; },
    subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); },

    findPerson, findWeapon, findAmmo, balanceOf, custodyOf,

    updateSettings(patch) {
      return mutate(() => { data.settings = { ...data.settings, ...patch }; });
    },

    addPerson(f) {
      const p = personFields(f);
      return mutate(() => {
        const rec = { id: uid(), ...p, createdAt: now().toISOString() };
        data.people.push(rec);
        return rec;
      });
    },
    updatePerson(id, f) {
      const rec = need(findPerson(id), 'المنتسب غير موجود');
      const p = personFields(f, id);
      return mutate(() => Object.assign(rec, p));
    },
    removePerson(id) {
      need(findPerson(id), 'المنتسب غير موجود');
      const c = custodyOf(id);
      if (c.weapons.length || c.ammo.length) {
        throw new UserError('لا يمكن حذف منتسب بذمته أسلحة أو أعتدة. أرجعها أولاً');
      }
      return mutate(() => { data.people = data.people.filter((p) => p.id !== id); });
    },

    addWeapon(f, { at, note } = {}) {
      const w = weaponFields(f);
      const time = when(at, now);
      return mutate(() => {
        const rec = { id: uid(), ...w, status: 'in_store', holderId: null, createdAt: now().toISOString() };
        data.weapons.push(rec);
        log({ at: time, kind: 'w_add', weaponId: rec.id, w: weaponLabel(rec), note: clean(note) });
        return rec;
      });
    },
    updateWeapon(id, f) {
      const rec = need(findWeapon(id), 'السلاح غير موجود');
      const w = weaponFields(f, id);
      return mutate(() => Object.assign(rec, w));
    },
    removeWeapon(id, { note } = {}) {
      const rec = need(findWeapon(id), 'السلاح غير موجود');
      if (rec.status === 'issued') throw new UserError('السلاح بذمة منتسب. أرجعه أولاً ثم اشطبه');
      return mutate(() => {
        log({ at: now().toISOString(), kind: 'w_remove', weaponId: id, w: weaponLabel(rec), from: rec.status, note: clean(note) });
        data.weapons = data.weapons.filter((w) => w.id !== id);
      });
    },
    issueWeapon(weaponId, personId, { at, note } = {}) {
      const w = need(findWeapon(weaponId), 'اختر السلاح');
      const p = need(findPerson(personId), 'اختر المنتسب المستلم');
      if (w.status !== 'in_store') throw new UserError(`لا يمكن تسليم السلاح: حالته الآن «${WEAPON_STATUS[w.status].label}»`);
      const time = when(at, now);
      return mutate(() => {
        w.status = 'issued';
        w.holderId = p.id;
        log({ at: time, kind: 'w_issue', weaponId: w.id, personId: p.id, w: weaponLabel(w), p: personLabel(p), note: clean(note) });
      });
    },
    // Ends a weapon's custody: back to the store (sound, needing repair or
    // unserviceable), or reported lost by the soldier who held it.
    returnWeapon(weaponId, { status = 'in_store', at, note } = {}) {
      const w = need(findWeapon(weaponId), 'اختر السلاح');
      if (w.status !== 'issued') throw new UserError('السلاح ليس بذمة أحد');
      if (!['in_store', 'maintenance', 'unserviceable', 'lost'].includes(status)) throw new UserError('اختر حالة السلاح');
      const p = findPerson(w.holderId);
      const time = when(at, now);
      return mutate(() => {
        log({
          at: time, kind: status === 'lost' ? 'w_status' : 'w_return', weaponId: w.id, personId: w.holderId,
          w: weaponLabel(w), p: p ? personLabel(p) : '', from: 'issued', to: status, note: clean(note),
        });
        w.status = status;
        w.holderId = null;
      });
    },
    setWeaponStatus(weaponId, status, { at, note } = {}) {
      const w = need(findWeapon(weaponId), 'اختر السلاح');
      if (w.status === 'issued') throw new UserError('السلاح بذمة منتسب. استخدم «إرجاع» لإنهاء الذمة');
      if (!WEAPON_STATUS[status] || status === 'issued') throw new UserError('اختر الحالة الجديدة');
      if (status === w.status) throw new UserError('هذه هي حالة السلاح الحالية');
      const time = when(at, now);
      return mutate(() => {
        log({ at: time, kind: 'w_status', weaponId: w.id, w: weaponLabel(w), from: w.status, to: status, note: clean(note) });
        w.status = status;
      });
    },

    addAmmo(f, { qty, at, note } = {}) {
      const a = ammoFields(f);
      const q = qty ? count(qty, 'الكمية الأولية', { allowZero: true }) : 0;
      const time = when(at, now);
      return mutate(() => {
        const rec = { id: uid(), ...a, createdAt: now().toISOString() };
        data.ammo.push(rec);
        if (q) log({ at: time, kind: 'a_in', ammoId: rec.id, qty: q, a: ammoLabel(rec), u: rec.unit, note: clean(note) || 'رصيد افتتاحي' });
        return rec;
      });
    },
    updateAmmo(id, f) {
      const rec = need(findAmmo(id), 'الصنف غير موجود');
      const a = ammoFields(f, id);
      return mutate(() => Object.assign(rec, a));
    },
    removeAmmo(id) {
      need(findAmmo(id), 'الصنف غير موجود');
      const b = balanceOf(id);
      if (b.issued) throw new UserError('بعض هذا العتاد بذمة منتسبين. أرجعه أو سجّل استهلاكه أولاً');
      if (b.store) throw new UserError('في المستودع رصيد من هذا الصنف. سجّل إخراجه أو صفّره بتسوية جرد أولاً');
      return mutate(() => { data.ammo = data.ammo.filter((a) => a.id !== id); });
    },
    // kind: a_in | a_out | a_issue | a_return | a_consume | a_adjust
    ammoMove(kind, { ammoId, personId, qty, counted, at, note } = {}) {
      if (LOG_KINDS[kind]?.group !== 'ammo') throw new UserError('نوع حركة غير معروف');
      const a = need(findAmmo(ammoId), 'اختر صنف العتاد');
      const b = balanceOf(a.id);
      const entry = { kind, ammoId: a.id, a: ammoLabel(a), u: a.unit, note: clean(note) };
      if (kind === 'a_adjust') {
        const c = count(counted, 'الكمية الموجودة فعلاً', { allowZero: true });
        if (c === b.store) throw new UserError('الكمية مطابقة لرصيد المستودع، لا حاجة للتسوية');
        entry.qty = c - b.store;
        entry.counted = c;
      } else {
        const q = count(qty, 'الكمية');
        entry.qty = q;
        if (kind === 'a_issue' || kind === 'a_return' || kind === 'a_consume') {
          const p = need(findPerson(personId), 'اختر المنتسب');
          entry.personId = p.id;
          entry.p = personLabel(p);
          if (kind !== 'a_issue') {
            const held = b.byPerson.get(p.id) || 0;
            if (q > held) throw new UserError(`بذمة ${personLabel(p)} ${held} ${a.unit} فقط من هذا الصنف`);
          }
        }
        if ((kind === 'a_issue' || kind === 'a_out') && q > b.store) {
          throw new UserError(`الرصيد في المستودع ${b.store} ${a.unit} فقط`);
        }
      }
      entry.at = when(at, now);
      return mutate(() => log(entry));
    },

    // ── Backup ──
    exportJSON() {
      const out = { app: 'armory-app', exportedAt: now().toISOString(), ...data, settings: { ...data.settings, lock: null } };
      return JSON.stringify(out, null, 2);
    },
    markBackedUp() {
      return mutate(() => { data.settings.lastBackupAt = now().toISOString(); });
    },
    importJSON(text) {
      let parsed;
      try { parsed = JSON.parse(text); } catch { throw new UserError('تعذّرت قراءة الملف'); }
      const next = normalize(parsed);
      return mutate(() => {
        next.settings.lock = data.settings.lock; // the device's own lock stays as it is
        data = next;
      });
    },
    reset() {
      return mutate(() => {
        const lock = data.settings.lock;
        data = emptyData();
        data.settings.lock = lock;
      });
    },
  };
  return api;
}
