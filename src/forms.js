// Every form the app opens: records (personnel, weapons, ammunition) and
// movements (issue, return, receive, consume, adjust).
import {
  WEAPON_STATUS, personLabel, weaponLabel, ammoLabel,
} from './store.js';
import {
  esc, fmtNum, field, textArea, dateField, datalist, row, picker, fixed, openSheet, confirmSheet, toast, go,
} from './ui.js';

const WEAPON_TYPES = ['بندقية', 'بندقية قنص', 'مسدس', 'رشاش خفيف', 'رشاش متوسط', 'رشاش ثقيل', 'قاذفة', 'هاون'];
const AMMO_UNITS = ['طلقة', 'صندوق', 'قنبلة', 'قذيفة', 'صاروخ', 'مخزن'];
const RANKS = ['جندي', 'جندي أول', 'نائب عريف', 'عريف', 'رقيب', 'رئيس عرفاء', 'نائب ضابط', 'ملازم', 'ملازم أول', 'نقيب', 'رائد', 'مقدم', 'عقيد'];

let store;
export const initForms = (s) => { store = s; };

const values = (list, key) => list.map((x) => x[key]);
const note = (placeholder = 'مثال: رقم الكتاب أو سبب الحركة') => textArea({ label: 'ملاحظات', name: 'note', placeholder });

// ── Option lists for pickers ──
const personOption = (p) => ({ value: p.id, label: personLabel(p), sub: [p.milNo && `ر.ع ${p.milNo}`, p.platoon].filter(Boolean).join(' · ') });
const peopleOptions = () => store.data.people.map(personOption);
const weaponOption = (w) => ({ value: w.id, label: w.model || w.type, sub: [w.type !== w.model && w.type, w.caliber].filter(Boolean).join(' · '), meta: w.serial });
const ammoOption = (a, qtyLabel) => ({ value: a.id, label: [a.name, a.caliber].filter(Boolean).join(' '), sub: a.lot ? `وجبة ${a.lot}` : '', meta: qtyLabel });

const personChoice = (personId, label = 'المنتسب') => {
  const p = personId && store.findPerson(personId);
  return p
    ? fixed({ label, name: 'personId', value: p.id, text: personLabel(p), sub: p.milNo ? `ر.ع ${p.milNo}` : '' })
    : picker({ label, name: 'personId', options: peopleOptions(), empty: 'لا يوجد منتسبون. أضفهم من صفحة المنتسبين' });
};
const weaponChoice = (weaponId, options, empty) => {
  const w = weaponId && store.findWeapon(weaponId);
  return w
    ? fixed({ label: 'السلاح', name: 'weaponId', value: w.id, text: w.model || w.type, sub: `الرقم التسلسلي ${w.serial}` })
    : picker({ label: 'السلاح', name: 'weaponId', options, empty });
};
const ammoChoice = (ammoId, options, empty) => {
  const a = ammoId && store.findAmmo(ammoId);
  return a
    ? fixed({ label: 'صنف العتاد', name: 'ammoId', value: a.id, text: ammoLabel(a), sub: `في المستودع: ${fmtNum(store.balanceOf(a.id).store)} ${a.unit}` })
    : picker({ label: 'صنف العتاد', name: 'ammoId', options, empty });
};

// ── Personnel ──
export function personForm(id) {
  const p = id ? store.findPerson(id) : {};
  const people = store.data.people;
  openSheet({
    title: id ? 'تعديل بيانات المنتسب' : 'إضافة منتسب',
    submitLabel: id ? 'حفظ التعديلات' : 'إضافة',
    body: `
      ${field({ label: 'الاسم الثلاثي', name: 'name', value: p.name, required: true })}
      ${row(
        field({ label: 'الرتبة', name: 'rank', value: p.rank, list: 'dl-ranks' }),
        field({ label: 'الرقم العسكري', name: 'milNo', value: p.milNo, inputmode: 'numeric', mono: true }),
      )}
      ${row(
        field({ label: 'الفصيل / الحضيرة', name: 'platoon', value: p.platoon, list: 'dl-platoons' }),
        field({ label: 'رقم الهاتف', name: 'phone', value: p.phone, type: 'tel', inputmode: 'tel', mono: true }),
      )}
      ${textArea({ label: 'ملاحظات', name: 'notes', value: p.notes })}
      ${datalist('dl-ranks', [...RANKS, ...values(people, 'rank')])}
      ${datalist('dl-platoons', values(people, 'platoon'))}`,
    onSubmit: (v) => {
      if (id) store.updatePerson(id, v); else store.addPerson(v);
      toast(id ? 'حُفظت التعديلات' : `أُضيف ${v.name.trim()}`);
    },
  });
}

export async function removePerson(id) {
  const p = store.findPerson(id);
  const ok = await confirmSheet({
    title: 'حذف المنتسب',
    message: `سيُحذف <b>${esc(personLabel(p))}</b> من قائمة المنتسبين. تبقى حركاته السابقة في السجل.`,
    confirmLabel: 'حذف',
    validate: () => store.removePerson(id),
  });
  if (!ok) return;
  toast('حُذف المنتسب');
  go('#/people');
}

// ── Weapons ──
export function weaponForm(id) {
  const w = id ? store.findWeapon(id) : {};
  const all = store.data.weapons;
  openSheet({
    title: id ? 'تعديل بيانات السلاح' : 'إدخال سلاح للمستودع',
    submitLabel: id ? 'حفظ التعديلات' : 'إدخال',
    body: `
      ${row(
        field({ label: 'النوع', name: 'type', value: w.type, list: 'dl-wtypes', placeholder: 'بندقية' }),
        field({ label: 'الطراز', name: 'model', value: w.model, list: 'dl-wmodels', placeholder: 'AK-47', mono: true }),
      )}
      ${field({ label: 'الرقم التسلسلي', name: 'serial', value: w.serial, required: true, mono: true })}
      ${row(
        field({ label: 'العيار', name: 'caliber', value: w.caliber, list: 'dl-calibers', placeholder: '7.62×39', mono: true }),
        field({ label: 'مكان الخزن', name: 'location', value: w.location, list: 'dl-wloc', placeholder: 'خزانة 1' }),
      )}
      ${textArea({ label: 'ملاحظات', name: 'notes', value: w.notes, placeholder: 'الملحقات، الحالة الفنية…' })}
      ${id ? '' : dateField('تاريخ الإدخال')}
      ${datalist('dl-wtypes', [...WEAPON_TYPES, ...values(all, 'type')])}
      ${datalist('dl-wmodels', values(all, 'model'))}
      ${datalist('dl-calibers', [...values(all, 'caliber'), ...values(store.data.ammo, 'caliber')])}
      ${datalist('dl-wloc', values(all, 'location'))}`,
    onSubmit: (v) => {
      if (id) { store.updateWeapon(id, v); toast('حُفظت التعديلات'); } else {
        const rec = store.addWeapon(v, { at: v.at });
        toast(`أُدخل السلاح ${rec.serial}`);
      }
    },
  });
}

export async function removeWeapon(id) {
  const w = store.findWeapon(id);
  const ok = await confirmSheet({
    title: 'شطب السلاح',
    message: `سيُشطب السلاح <b>${esc(weaponLabel(w))}</b> من قيود المستودع، ويُسجَّل الشطب في السجل.`,
    confirmLabel: 'شطب',
    extra: note('سبب الشطب'),
    validate: (v) => store.removeWeapon(id, { note: v.note }),
  });
  if (!ok) return;
  toast('شُطب السلاح');
  go('#/weapons');
}

export function issueWeaponForm({ weaponId, personId } = {}) {
  const available = store.data.weapons.filter((w) => w.status === 'in_store').map(weaponOption);
  openSheet({
    title: 'تسليم سلاح لمنتسب',
    submitLabel: 'تسليم',
    body: `
      ${weaponChoice(weaponId, available, 'لا توجد أسلحة في المستودع جاهزة للتسليم')}
      ${personChoice(personId, 'المستلم')}
      ${dateField()}
      ${note()}`,
    onSubmit: (v) => {
      store.issueWeapon(v.weaponId, v.personId, v);
      toast('سُلّم السلاح وأُضيف إلى ذمة المنتسب');
    },
  });
}

const RETURN_STATES = [
  ['in_store', 'سليم', 'يعود إلى المستودع جاهزاً'],
  ['maintenance', 'يحتاج صيانة', 'يدخل المستودع ويُحوّل للصيانة'],
  ['unserviceable', 'عاطل', 'غير صالح للاستخدام'],
  ['lost', 'مفقود', 'أبلغ المنتسب بفقدانه'],
];

export function returnWeaponForm({ weaponId, personId } = {}) {
  const issued = store.data.weapons
    .filter((w) => w.status === 'issued' && (!personId || w.holderId === personId))
    .map((w) => {
      const p = store.findPerson(w.holderId);
      return { ...weaponOption(w), sub: p ? `بذمة ${personLabel(p)}` : '' };
    });
  openSheet({
    title: 'إرجاع سلاح',
    submitLabel: 'تسجيل',
    body: `
      ${weaponChoice(weaponId, issued, 'لا توجد أسلحة مسلّمة حالياً')}
      <fieldset class="field segmented-field">
        <legend class="field-label">حالة السلاح عند الإرجاع</legend>
        <div class="segmented">${RETURN_STATES.map(([v, label, hint], i) => `
          <label class="seg seg-${WEAPON_STATUS[v].tone}"><input type="radio" name="status" value="${v}"${i === 0 ? ' checked' : ''}>
            <span><b>${label}</b><small>${hint}</small></span></label>`).join('')}
        </div>
      </fieldset>
      ${dateField()}
      ${note('مثال: نواقص في الملحقات، تفاصيل الفقدان…')}`,
    onSubmit: (v) => {
      store.returnWeapon(v.weaponId, v);
      toast(v.status === 'lost' ? 'سُجّل السلاح مفقوداً' : 'أُرجع السلاح إلى المستودع');
    },
  });
}

export function weaponStatusForm(weaponId) {
  const w = store.findWeapon(weaponId);
  const choices = Object.entries(WEAPON_STATUS).filter(([k]) => k !== 'issued' && k !== w.status);
  openSheet({
    title: 'تغيير حالة السلاح',
    submitLabel: 'تغيير الحالة',
    body: `
      ${fixed({ label: 'السلاح', name: 'weaponId', value: w.id, text: w.model || w.type, sub: `الحالة الآن: ${WEAPON_STATUS[w.status].label}` })}
      <fieldset class="field segmented-field">
        <legend class="field-label">الحالة الجديدة</legend>
        <div class="segmented">${choices.map(([k, s]) => `
          <label class="seg seg-${s.tone}"><input type="radio" name="status" value="${k}"><span><b>${s.label}</b></span></label>`).join('')}
        </div>
      </fieldset>
      ${dateField()}
      ${note()}`,
    onSubmit: (v) => {
      store.setWeaponStatus(w.id, v.status, v);
      toast('تغيّرت حالة السلاح');
    },
  });
}

// ── Ammunition ──
export function ammoForm(id) {
  const a = id ? store.findAmmo(id) : {};
  const all = store.data.ammo;
  openSheet({
    title: id ? 'تعديل صنف العتاد' : 'إضافة صنف عتاد',
    submitLabel: id ? 'حفظ التعديلات' : 'إضافة',
    body: `
      ${field({ label: 'اسم الصنف', name: 'name', value: a.name, required: true, list: 'dl-anames', placeholder: 'عتاد بندقية' })}
      ${row(
        field({ label: 'العيار', name: 'caliber', value: a.caliber, list: 'dl-acal', placeholder: '7.62×39', mono: true }),
        field({ label: 'رقم الوجبة', name: 'lot', value: a.lot, mono: true }),
      )}
      ${row(
        field({ label: 'وحدة القياس', name: 'unit', value: a.unit || 'طلقة', list: 'dl-units' }),
        field({ label: 'الحد الأدنى للتنبيه', name: 'minQty', value: a.minQty || '', inputmode: 'numeric', placeholder: '0', hint: 'يظهر تنبيه حين يقل الرصيد عنه' }),
      )}
      ${field({ label: 'مكان الخزن', name: 'location', value: a.location, list: 'dl-aloc' })}
      ${id ? '' : `<div class="field-group">${row(
        field({ label: 'الرصيد الافتتاحي', name: 'qty', inputmode: 'numeric', placeholder: '0', hint: 'الكمية الموجودة الآن في المستودع' }),
        dateField('بتاريخ'),
      )}</div>`}
      ${textArea({ label: 'ملاحظات', name: 'notes', value: a.notes })}
      ${datalist('dl-anames', values(all, 'name'))}
      ${datalist('dl-acal', [...values(all, 'caliber'), ...values(store.data.weapons, 'caliber')])}
      ${datalist('dl-units', [...AMMO_UNITS, ...values(all, 'unit')])}
      ${datalist('dl-aloc', values(all, 'location'))}`,
    onSubmit: (v) => {
      if (id) { store.updateAmmo(id, v); toast('حُفظت التعديلات'); } else {
        store.addAmmo(v, { qty: v.qty, at: v.at });
        toast(`أُضيف الصنف ${v.name.trim()}`);
      }
    },
  });
}

export async function removeAmmo(id) {
  const a = store.findAmmo(id);
  const ok = await confirmSheet({
    title: 'حذف صنف العتاد',
    message: `سيُحذف الصنف <b>${esc(ammoLabel(a))}</b>. تبقى حركاته السابقة في السجل.`,
    confirmLabel: 'حذف',
    validate: () => store.removeAmmo(id),
  });
  if (!ok) return;
  toast('حُذف الصنف');
  go('#/ammo');
}

const MOVES = {
  a_in: { title: 'استلام عتاد وارد', submit: 'استلام', qtyLabel: 'الكمية المستلمة', notePh: 'الجهة المسلِّمة، رقم الكتاب أو المستند' },
  a_out: { title: 'إخراج عتاد من المستودع', submit: 'إخراج', qtyLabel: 'الكمية المُخرجة', notePh: 'السبب: إتلاف، تسليم لجهة أخرى… ورقم الكتاب' },
  a_issue: { title: 'صرف عتاد لمنتسب', submit: 'صرف', qtyLabel: 'الكمية المصروفة', notePh: 'الغرض: واجب، رمي تدريبي…' },
  a_return: { title: 'إرجاع عتاد للمستودع', submit: 'إرجاع', qtyLabel: 'الكمية المُرجعة', notePh: '' },
  a_consume: { title: 'تسجيل استهلاك عتاد', submit: 'تسجيل الاستهلاك', qtyLabel: 'الكمية المستهلكة', notePh: 'مثال: رمي تدريبي، واجب…' },
  a_adjust: { title: 'تسوية جرد', submit: 'تسوية', qtyLabel: 'الكمية الموجودة فعلاً', notePh: 'سبب الفرق ورقم محضر الجرد' },
};

export function ammoMoveForm(kind, { ammoId, personId } = {}) {
  const m = MOVES[kind];
  const qtyName = kind === 'a_adjust' ? 'counted' : 'qty';
  let choice;

  if (kind === 'a_return' || kind === 'a_consume') {
    // Pick one custody line: who holds how much of what
    const lines = [];
    for (const a of store.data.ammo) {
      if (ammoId && a.id !== ammoId) continue;
      for (const [pid, qty] of store.balanceOf(a.id).byPerson) {
        if (personId && pid !== personId) continue;
        const p = store.findPerson(pid);
        lines.push({
          value: `${a.id}|${pid}`, label: p ? personLabel(p) : 'منتسب محذوف',
          sub: ammoLabel(a), meta: `${fmtNum(qty)} ${a.unit}`,
        });
      }
    }
    choice = picker({ label: 'العتاد بالذمة', name: 'line', options: lines, selected: lines.length === 1 ? lines[0].value : '', empty: 'لا يوجد عتاد بالذمة' });
  } else {
    const opts = store.data.ammo
      .map((a) => ({ a, store: store.balanceOf(a.id).store }))
      .filter(({ store: q }) => kind === 'a_in' || kind === 'a_adjust' || q > 0)
      .map(({ a, store: q }) => ammoOption(a, `${fmtNum(q)} ${a.unit}`));
    choice = ammoChoice(ammoId, opts, store.data.ammo.length ? 'لا يوجد رصيد في المستودع' : 'لا توجد أصناف عتاد. أضفها من صفحة الأعتدة');
    if (kind === 'a_issue') choice += personChoice(personId, 'المستلم');
  }

  openSheet({
    title: m.title,
    submitLabel: m.submit,
    tone: kind === 'a_out' || kind === 'a_consume' ? 'warn' : 'primary',
    body: `
      ${choice}
      ${row(
        field({ label: m.qtyLabel, name: qtyName, inputmode: 'numeric', required: true, mono: true,
          hint: kind === 'a_adjust' ? 'اكتب العدد الفعلي بعد العدّ، ويُحسب الفرق تلقائياً' : '' }),
        dateField(),
      )}
      ${note(m.notePh)}`,
    onSubmit: (v) => {
      if (v.line) [v.ammoId, v.personId] = v.line.split('|');
      store.ammoMove(kind, v);
      toast(`تم: ${m.title}`);
    },
  });
}
