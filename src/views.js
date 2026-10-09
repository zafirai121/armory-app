// The screens. Each view returns { title, back, html } and, for the list
// screens, a list() that redraws only the results as the search or filter
// changes (so the search box keeps its focus).
import { WEAPON_STATUS, LOG_KINDS, personLabel } from './store.js';
import { icon } from './icons.js';
import { esc, fmtNum, fmtDate, fmtTime, fmtDateTime, dayKey, matches } from './ui.js';

let store;
export const initViews = (s) => { store = s; };

// List filters, kept while moving between screens
export const ui = {
  weapons: { q: '', status: 'all' },
  ammo: { q: '', filter: 'all' },
  people: { q: '', platoon: 'all' },
  log: { q: '', group: 'all', from: '', to: '' },
};

const BACKUP_NUDGE_DAYS = 7;

// ── Shared pieces ──
const pill = (status) => `<span class="pill tone-${WEAPON_STATUS[status].tone}">${WEAPON_STATUS[status].label}</span>`;
const empty = (text, iconName = 'empty', action = '') => `<div class="empty">${icon(iconName)}<p>${text}</p>${action}</div>`;
const noResults = () => empty('لا توجد نتائج مطابقة', 'no-results');
const btn = (action, iconName, label, { tone = 'ghost', data = {} } = {}) =>
  `<button type="button" class="btn ${tone}" data-action="${action}"${Object.entries(data).map(([k, v]) => ` data-${k}="${esc(v)}"`).join('')}>${icon(iconName)}<span>${label}</span></button>`;
const chip = (bind, value, label, current, n) =>
  `<button type="button" class="chip${current === value ? ' active' : ''}" data-action="chip" data-bind="${bind}" data-value="${esc(value)}" aria-pressed="${current === value}">${esc(label)}${n === undefined ? '' : ` <span class="chip-n">${fmtNum(n)}</span>`}</button>`;
const search = (bind, placeholder) =>
  `<div class="search-box">${icon('search')}<input type="search" data-bind="${bind}" placeholder="${esc(placeholder)}" aria-label="${esc(placeholder)}" autocomplete="off"></div>`;
const kv = (pairs) => `<dl class="kv">${pairs.filter(([, v]) => v).map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${v}</dd></div>`).join('')}</dl>`;
const personLink = (id, fallback = '') => {
  const p = id && store.findPerson(id);
  return p ? `<a href="#/people/${p.id}">${esc(personLabel(p))}</a>` : esc(fallback);
};
const lowStock = (a, b = store.balanceOf(a.id)) => a.minQty > 0 && b.store < a.minQty;
const sortByAt = (list) => [...list].sort((x, y) => (y.at > x.at ? 1 : y.at < x.at ? -1 : 0));

// What a log entry was about, in words
export function describe(e) {
  const st = (s) => WEAPON_STATUS[s]?.label || '';
  switch (e.kind) {
    case 'w_add': case 'w_remove': return { what: e.w };
    case 'w_issue': return { what: e.w, who: `إلى ${e.p}` };
    case 'w_return': return { what: e.w, who: e.p ? `من ${e.p}` : '', detail: e.to && e.to !== 'in_store' ? `الحالة: ${st(e.to)}` : '' };
    case 'w_status': return { what: e.w, who: e.p ? `بذمة ${e.p}` : '', detail: `${st(e.from)} ← ${st(e.to)}`.replace(/^ ← /, '') };
    case 'a_adjust': return {
      what: e.a, amount: `${e.qty > 0 ? '+' : '−'}${fmtNum(Math.abs(e.qty))} ${e.u || ''}`.trim(),
      detail: e.counted !== undefined ? `الموجود فعلاً ${fmtNum(e.counted)}` : '',
    };
    default: return {
      what: e.a, amount: `${fmtNum(e.qty)} ${e.u || ''}`.trim(),
      who: e.p ? (e.kind === 'a_issue' ? `إلى ${e.p}` : e.kind === 'a_return' ? `من ${e.p}` : e.p) : '',
    };
  }
}

function logRow(e, { withDate = true } = {}) {
  const k = LOG_KINDS[e.kind];
  const d = describe(e);
  const target = e.weaponId && store.findWeapon(e.weaponId) ? `#/weapons/${e.weaponId}`
    : e.ammoId && store.findAmmo(e.ammoId) ? `#/ammo/${e.ammoId}` : '';
  const what = target ? `<a href="${target}">${esc(d.what)}</a>` : esc(d.what);
  const who = d.who && e.personId && store.findPerson(e.personId)
    ? esc(d.who).replace(esc(e.p), personLink(e.personId)) : esc(d.who || '');
  return `<li class="log-row kind-${e.kind}">
    <span class="log-icon">${icon(k.icon)}</span>
    <div class="log-main">
      <div class="log-line"><b>${k.label}</b>${d.amount ? `<span class="log-amount">${esc(d.amount)}</span>` : ''}</div>
      <div class="log-what">${what}${who ? ` · ${who}` : ''}${d.detail ? ` · ${esc(d.detail)}` : ''}</div>
      ${e.note ? `<div class="log-note">${esc(e.note)}</div>` : ''}
    </div>
    <time class="log-time" datetime="${esc(e.at)}">${withDate ? `${fmtDate(e.at)}<br>` : ''}${fmtTime(e.at)}</time>
  </li>`;
}
const logList = (entries, opts) => `<ul class="log-list">${entries.map((e) => logRow(e, opts)).join('')}</ul>`;

function banners() {
  const out = [];
  const s = store.data.settings;
  if (store.loadProblem) out.push(['danger', 'alert', store.loadProblem]);
  if (!store.persistent) out.push(['danger', 'alert', 'التخزين محجوب في هذا المتصفح: لن تُحفظ البيانات بعد إغلاق الصفحة. افتح التطبيق في نافذة عادية (غير خاصة).']);
  if (s.demo) {
    out.push(['info', 'info', 'تستعرض الآن بيانات نموذجية للتجربة. امسحها حين تبدأ الاستخدام الفعلي.',
      '<button type="button" class="btn small" data-action="reset">مسح البيانات النموذجية</button>']);
    return out.map(bannerHtml).join('');
  }
  const hasData = store.data.weapons.length || store.data.ammo.length || store.data.people.length;
  const stale = !s.lastBackupAt || Date.now() - new Date(s.lastBackupAt).getTime() > BACKUP_NUDGE_DAYS * 864e5;
  if (hasData && stale) {
    out.push(['warn', 'backup', `البيانات محفوظة على هذا الجهاز فقط. ${s.lastBackupAt ? `آخر نسخة احتياطية قبل أكثر من ${BACKUP_NUDGE_DAYS} أيام.` : 'لم تُؤخذ نسخة احتياطية بعد.'}`,
      '<button type="button" class="btn small" data-action="backup">أخذ نسخة الآن</button>']);
  }
  return out.map(bannerHtml).join('');
}
const bannerHtml = ([tone, ic, text, action = '']) => `<div class="banner tone-${tone}">${icon(ic)}<p>${text}</p>${action}</div>`;

// ── Home ──
export function homeView() {
  const { weapons, ammo, people, log } = store.data;
  const title = `مستودع ${store.data.settings.unitName || 'السرية'}`;
  if (!weapons.length && !ammo.length) {
    const done = (on) => (on ? ' class="done"' : '');
    return {
      title,
      html: `${banners()}<section class="card welcome">
        <span class="welcome-mark">${icon('shield')}</span>
        <h2>أهلاً بك في تطبيق مستودع السرية</h2>
        <p>سجّل أسلحة السرية وأعتدتها، وتابع ما بذمة كل منتسب، واطبع تقارير الجرد وسندات الذمة. البيانات تُحفظ على هذا الجهاز.</p>
        <ol class="steps">
          <li${done(people.length)}><b>أضف المنتسبين</b><span>${people.length ? `أُضيف ${fmtNum(people.length)} منتسب` : 'الاسم والرتبة والرقم العسكري'}</span></li>
          <li><b>أدخل الأسلحة</b><span>كل سلاح برقمه التسلسلي</span></li>
          <li><b>أضف أصناف العتاد</b><span>مع الرصيد الموجود حالياً</span></li>
        </ol>
        <div class="actions">
          ${btn('add-person', 'people', 'إضافة منتسب', { tone: 'primary' })}
          ${btn('add-weapon', 'weapon', 'إدخال سلاح')}
          ${btn('add-ammo', 'ammo', 'إضافة صنف عتاد')}
        </div>
        ${people.length ? '' : '<p class="welcome-demo">تريد أن ترى التطبيق أولاً؟ <button type="button" class="link" data-action="demo">جرّبه ببيانات نموذجية</button></p>'}
      </section>`,
    };
  }

  const n = Object.fromEntries(Object.keys(WEAPON_STATUS).map((k) => [k, 0]));
  weapons.forEach((w) => n[w.status]++);
  const total = weapons.length;
  const bar = total ? Object.keys(WEAPON_STATUS).filter((k) => n[k])
    .map((k) => `<span class="bar-seg tone-${WEAPON_STATUS[k].tone}" style="flex:${n[k]}" title="${WEAPON_STATUS[k].label}: ${n[k]}"></span>`).join('') : '';
  const stat = (status, value, label) => `<button type="button" class="stat${status !== 'all' ? ` tone-${WEAPON_STATUS[status].tone}` : ''}" data-action="weapons-filter" data-status="${status}">
      <b>${fmtNum(value)}</b><span>${label}</span></button>`;

  const lows = ammo.filter((a) => lowStock(a));
  const lost = weapons.filter((w) => w.status === 'lost');
  const alerts = [
    ...lost.map((w) => `<a class="alert-row tone-danger" href="#/weapons/${w.id}">${icon('alert')}<span>سلاح مفقود: <b>${esc(w.model || w.type)}</b> <span class="mono">${esc(w.serial)}</span></span></a>`),
    ...lows.map((a) => `<a class="alert-row tone-warn" href="#/ammo/${a.id}">${icon('alert')}<span>رصيد منخفض: <b>${esc(a.name)} ${esc(a.caliber)}</b> — ${fmtNum(store.balanceOf(a.id).store)} من حد ${fmtNum(a.minQty)}</span></a>`),
  ];

  const ammoRows = ammo.map((a) => {
    const b = store.balanceOf(a.id);
    return `<a class="mini-row" href="#/ammo/${a.id}">
      <span class="mini-main"><b>${esc(a.name)}</b><small>${esc([a.caliber, a.lot && `وجبة ${a.lot}`].filter(Boolean).join(' · '))}</small></span>
      <span class="mini-num${lowStock(a, b) ? ' low' : ''}"><b>${fmtNum(b.store)}</b><small>في المستودع</small></span>
      <span class="mini-num muted"><b>${fmtNum(b.issued)}</b><small>بالذمة</small></span>
    </a>`;
  }).join('');

  return {
    title,
    html: `${banners()}
      <div class="quick">
        ${btn('issue-weapon', 'issue', 'تسليم سلاح', { tone: 'tile' })}
        ${btn('return-weapon', 'return', 'إرجاع سلاح', { tone: 'tile' })}
        ${btn('ammo-move', 'issue', 'صرف عتاد', { tone: 'tile', data: { kind: 'a_issue' } })}
        ${btn('ammo-move', 'receive', 'استلام عتاد', { tone: 'tile', data: { kind: 'a_in' } })}
      </div>
      ${alerts.length ? `<section class="card alerts"><h2 class="card-title">تنبيهات</h2>${alerts.join('')}</section>` : ''}
      <div class="home-grid">
        <section class="card">
          <div class="card-head"><h2 class="card-title">${icon('weapon')} الأسلحة</h2><a href="#/weapons" class="more">الكل ${icon('chevron')}</a></div>
          <div class="stat-grid">
            ${stat('all', total, 'المجموع')}
            ${stat('in_store', n.in_store, 'في المستودع')}
            ${stat('issued', n.issued, 'مسلّمة')}
            ${stat('maintenance', n.maintenance, 'في الصيانة')}
            ${n.unserviceable ? stat('unserviceable', n.unserviceable, 'عاطلة') : ''}
            ${n.lost ? stat('lost', n.lost, 'مفقودة') : ''}
          </div>
          ${bar ? `<div class="bar" aria-hidden="true">${bar}</div>` : ''}
        </section>
        <section class="card">
          <div class="card-head"><h2 class="card-title">${icon('ammo')} الأعتدة</h2><a href="#/ammo" class="more">الكل ${icon('chevron')}</a></div>
          ${ammoRows || empty('لا توجد أصناف عتاد بعد', 'ammo', btn('add-ammo', 'plus', 'إضافة صنف'))}
        </section>
        <section class="card">
          <div class="card-head"><h2 class="card-title">${icon('people')} المنتسبون</h2><a href="#/people" class="more">الكل ${icon('chevron')}</a></div>
          <div class="stat-grid">
            <a class="stat" href="#/people"><b>${fmtNum(people.length)}</b><span>المجموع</span></a>
            <a class="stat" href="#/people"><b>${fmtNum(people.filter((p) => { const c = store.custodyOf(p.id); return c.weapons.length || c.ammo.length; }).length)}</b><span>بذمتهم مواد</span></a>
          </div>
        </section>
        <section class="card wide">
          <div class="card-head"><h2 class="card-title">${icon('log')} آخر الحركات</h2><a href="#/log" class="more">السجل ${icon('chevron')}</a></div>
          ${log.length ? logList(sortByAt(log).slice(0, 6)) : empty('لا توجد حركات بعد', 'log')}
        </section>
      </div>`,
  };
}

// ── Weapons ──
export function weaponsView() {
  const ws = store.data.weapons;
  const counts = Object.fromEntries(Object.keys(WEAPON_STATUS).map((k) => [k, ws.filter((w) => w.status === k).length]));
  const s = ui.weapons;
  return {
    title: 'الأسلحة',
    html: `
      <div class="toolbar">
        ${search('weapons.q', 'ابحث بالرقم التسلسلي أو الطراز أو اسم الحائز')}
        ${btn('add-weapon', 'plus', 'إدخال سلاح', { tone: 'primary' })}
      </div>
      <div class="chips">
        ${chip('weapons.status', 'all', 'الكل', s.status, ws.length)}
        ${Object.entries(WEAPON_STATUS).filter(([k]) => counts[k] || s.status === k).map(([k, v]) => chip('weapons.status', k, v.label, s.status, counts[k])).join('')}
      </div>
      <div id="list"></div>`,
    list() {
      if (!ws.length) return empty('لم يُدخل أي سلاح بعد', 'weapon', btn('add-weapon', 'plus', 'إدخال سلاح', { tone: 'primary' }));
      const rows = ws
        .filter((w) => s.status === 'all' || w.status === s.status)
        .filter((w) => matches(s.q, w.serial, w.model, w.type, w.caliber, w.location, w.holderId && store.findPerson(w.holderId) && personLabel(store.findPerson(w.holderId))))
        .sort((a, b) => (a.model || a.type).localeCompare(b.model || b.type, 'ar') || a.serial.localeCompare(b.serial, 'en', { numeric: true }));
      if (!rows.length) return noResults();
      return `<p class="list-count">${fmtNum(rows.length)} سلاح</p><div class="list">${rows.map((w) => `
        <a class="item" href="#/weapons/${w.id}">
          <span class="item-icon tone-${WEAPON_STATUS[w.status].tone}">${icon('weapon')}</span>
          <span class="item-main">
            <b>${esc(w.model || w.type)}</b>
            <small>${esc([w.model && w.type, w.caliber].filter(Boolean).join(' · '))}</small>
            ${w.status === 'issued' ? `<small class="item-holder">${icon('user')}${esc(personLabel(store.findPerson(w.holderId) || { name: 'منتسب محذوف' }))}</small>` : ''}
          </span>
          <span class="item-side"><span class="mono serial">${esc(w.serial)}</span>${pill(w.status)}</span>
        </a>`).join('')}</div>`;
    },
  };
}

export function weaponView(id) {
  const w = store.findWeapon(id);
  if (!w) return missing('السلاح', '#/weapons');
  const history = sortByAt(store.data.log.filter((e) => e.weaponId === id));
  const issuedAt = w.status === 'issued' ? history.find((e) => e.kind === 'w_issue')?.at : null;
  const actions = {
    in_store: [btn('issue-weapon', 'issue', 'تسليم لمنتسب', { tone: 'primary', data: { id } }), btn('weapon-status', 'wrench', 'تغيير الحالة', { data: { id } })],
    issued: [btn('return-weapon', 'return', 'إرجاع للمستودع', { tone: 'primary', data: { id } })],
  }[w.status] || [btn('weapon-status', 'wrench', 'تغيير الحالة', { tone: 'primary', data: { id } })];
  return {
    title: w.model || w.type,
    back: '#/weapons',
    html: `
      <section class="card detail">
        <div class="detail-head">
          <span class="item-icon big tone-${WEAPON_STATUS[w.status].tone}">${icon('weapon')}</span>
          <div class="detail-name"><h2>${esc(w.model || w.type)}</h2><p class="mono serial">${esc(w.serial)}</p></div>
          ${pill(w.status)}
        </div>
        ${w.status === 'issued' ? `<div class="holder">${icon('user')}<span>بذمة ${personLink(w.holderId, 'منتسب محذوف')}${issuedAt ? ` منذ ${fmtDate(issuedAt)}` : ''}</span></div>` : ''}
        ${kv([['النوع', esc(w.type)], ['الطراز', esc(w.model)], ['العيار', esc(w.caliber)], ['مكان الخزن', esc(w.location)],
          ['تاريخ الإدخال', w.createdAt && fmtDate(history.findLast?.((e) => e.kind === 'w_add')?.at || w.createdAt)], ['ملاحظات', esc(w.notes)]])}
        <div class="actions">
          ${actions.join('')}
          ${btn('edit-weapon', 'edit', 'تعديل', { data: { id } })}
          ${w.status !== 'issued' ? btn('remove-weapon', 'trash', 'شطب', { tone: 'ghost danger-text', data: { id } }) : ''}
        </div>
      </section>
      <section class="card">
        <h2 class="card-title">سجل السلاح</h2>
        ${history.length ? logList(history) : empty('لا توجد حركات')}
      </section>`,
  };
}

// ── Ammunition ──
export function ammoListView() {
  const all = store.data.ammo;
  const s = ui.ammo;
  const lowCount = all.filter((a) => lowStock(a)).length;
  const heldCount = all.filter((a) => store.balanceOf(a.id).issued).length;
  return {
    title: 'الأعتدة',
    html: `
      <div class="toolbar">
        ${search('ammo.q', 'ابحث بالصنف أو العيار أو رقم الوجبة')}
        ${btn('add-ammo', 'plus', 'إضافة صنف', { tone: 'primary' })}
      </div>
      <div class="chips">
        ${chip('ammo.filter', 'all', 'الكل', s.filter, all.length)}
        ${lowCount || s.filter === 'low' ? chip('ammo.filter', 'low', 'رصيد منخفض', s.filter, lowCount) : ''}
        ${heldCount || s.filter === 'held' ? chip('ammo.filter', 'held', 'بذمة المنتسبين', s.filter, heldCount) : ''}
      </div>
      <div class="quick compact">
        ${btn('ammo-move', 'receive', 'استلام وارد', { tone: 'tile', data: { kind: 'a_in' } })}
        ${btn('ammo-move', 'issue', 'صرف لمنتسب', { tone: 'tile', data: { kind: 'a_issue' } })}
        ${btn('ammo-move', 'return', 'إرجاع', { tone: 'tile', data: { kind: 'a_return' } })}
        ${btn('ammo-move', 'flame', 'استهلاك', { tone: 'tile', data: { kind: 'a_consume' } })}
      </div>
      <div id="list"></div>`,
    list() {
      if (!all.length) return empty('لا توجد أصناف عتاد بعد', 'ammo', btn('add-ammo', 'plus', 'إضافة صنف', { tone: 'primary' }));
      const rows = all
        .filter((a) => s.filter === 'all' || (s.filter === 'low' ? lowStock(a) : store.balanceOf(a.id).issued))
        .filter((a) => matches(s.q, a.name, a.caliber, a.lot, a.location, a.unit));
      if (!rows.length) return noResults();
      return `<div class="list">${rows.map((a) => {
        const b = store.balanceOf(a.id);
        const low = lowStock(a, b);
        return `<a class="item" href="#/ammo/${a.id}">
          <span class="item-icon${low ? ' tone-warn' : ''}">${icon('ammo')}</span>
          <span class="item-main"><b>${esc(a.name)}${a.caliber ? ` <span class="mono">${esc(a.caliber)}</span>` : ''}</b>
            <small>${esc([a.lot && `وجبة ${a.lot}`, a.location].filter(Boolean).join(' · ')) || esc(a.unit)}${low ? ' · <span class="text-warn">رصيد منخفض</span>' : ''}</small></span>
          <span class="item-qty"><b>${fmtNum(b.store)}</b><small>${esc(a.unit)} في المستودع</small>${b.issued ? `<small class="muted">+ ${fmtNum(b.issued)} بالذمة</small>` : ''}</span>
        </a>`;
      }).join('')}</div>`;
    },
  };
}

export function ammoView(id) {
  const a = store.findAmmo(id);
  if (!a) return missing('صنف العتاد', '#/ammo');
  const b = store.balanceOf(id);
  const history = sortByAt(store.data.log.filter((e) => e.ammoId === id));
  const holders = [...b.byPerson].sort((x, y) => y[1] - x[1]);
  const d = { id };
  return {
    title: [a.name, a.caliber].filter(Boolean).join(' '),
    back: '#/ammo',
    html: `
      <section class="card detail">
        <div class="detail-head">
          <span class="item-icon big${lowStock(a, b) ? ' tone-warn' : ''}">${icon('ammo')}</span>
          <div class="detail-name"><h2>${esc(a.name)}</h2><p>${esc([a.caliber, a.lot && `وجبة ${a.lot}`].filter(Boolean).join(' · '))}</p></div>
        </div>
        <div class="figures">
          <div class="figure${lowStock(a, b) ? ' low' : ''}"><b>${fmtNum(b.store)}</b><span>في المستودع</span></div>
          <div class="figure"><b>${fmtNum(b.issued)}</b><span>بذمة المنتسبين</span></div>
          <div class="figure"><b>${fmtNum(b.store + b.issued)}</b><span>المجموع (${esc(a.unit)})</span></div>
        </div>
        ${lowStock(a, b) ? `<div class="banner tone-warn">${icon('alert')}<p>الرصيد أقل من الحد الأدنى (${fmtNum(a.minQty)} ${esc(a.unit)})</p></div>` : ''}
        ${kv([['وحدة القياس', esc(a.unit)], ['الحد الأدنى', a.minQty ? fmtNum(a.minQty) : ''], ['مكان الخزن', esc(a.location)], ['ملاحظات', esc(a.notes)]])}
        <div class="actions">
          ${btn('ammo-move', 'receive', 'استلام وارد', { tone: 'primary', data: { ...d, kind: 'a_in' } })}
          ${b.store ? btn('ammo-move', 'issue', 'صرف لمنتسب', { data: { ...d, kind: 'a_issue' } }) : ''}
          ${b.store ? btn('ammo-move', 'send', 'إخراج', { data: { ...d, kind: 'a_out' } }) : ''}
          ${btn('ammo-move', 'scale', 'تسوية جرد', { data: { ...d, kind: 'a_adjust' } })}
          ${btn('edit-ammo', 'edit', 'تعديل', { data: d })}
          ${btn('remove-ammo', 'trash', 'حذف', { tone: 'ghost danger-text', data: d })}
        </div>
      </section>
      <section class="card">
        <h2 class="card-title">بذمة المنتسبين</h2>
        ${holders.length ? `<div class="list flat">${holders.map(([pid, q]) => `
          <div class="item static">
            <span class="item-main"><b>${personLink(pid, 'منتسب محذوف')}</b></span>
            <span class="item-qty"><b>${fmtNum(q)}</b><small>${esc(a.unit)}</small></span>
            <span class="item-actions">
              ${btn('ammo-move', 'return', 'إرجاع', { tone: 'small', data: { ...d, kind: 'a_return', person: pid } })}
              ${btn('ammo-move', 'flame', 'استهلاك', { tone: 'small', data: { ...d, kind: 'a_consume', person: pid } })}
            </span>
          </div>`).join('')}</div>` : empty('لا يوجد شيء من هذا الصنف بذمة أحد')}
      </section>
      <section class="card">
        <h2 class="card-title">سجل الصنف</h2>
        ${history.length ? logList(history) : empty('لا توجد حركات')}
      </section>`,
  };
}

// ── Personnel ──
export function peopleView() {
  const all = store.data.people;
  const s = ui.people;
  const platoons = [...new Set(all.map((p) => p.platoon).filter(Boolean))].sort((x, y) => x.localeCompare(y, 'ar'));
  return {
    title: 'المنتسبون',
    html: `
      <div class="toolbar">
        ${search('people.q', 'ابحث بالاسم أو الرقم العسكري')}
        ${btn('add-person', 'plus', 'إضافة منتسب', { tone: 'primary' })}
      </div>
      ${platoons.length ? `<div class="chips">${chip('people.platoon', 'all', 'الكل', s.platoon, all.length)}${platoons.map((pl) => chip('people.platoon', pl, pl, s.platoon, all.filter((p) => p.platoon === pl).length)).join('')}</div>` : ''}
      <div id="list"></div>`,
    list() {
      if (!all.length) return empty('لا يوجد منتسبون بعد', 'people', btn('add-person', 'plus', 'إضافة منتسب', { tone: 'primary' }));
      const rows = all
        .filter((p) => s.platoon === 'all' || p.platoon === s.platoon)
        .filter((p) => matches(s.q, p.name, p.rank, p.milNo, p.platoon, p.phone))
        .sort((x, y) => x.name.localeCompare(y.name, 'ar'));
      if (!rows.length) return noResults();
      return `<p class="list-count">${fmtNum(rows.length)} منتسب</p><div class="list">${rows.map((p) => {
        const c = store.custodyOf(p.id);
        return `<a class="item" href="#/people/${p.id}">
          <span class="avatar">${esc(p.name.trim()[0] || '؟')}</span>
          <span class="item-main"><b>${esc(personLabel(p))}</b><small>${esc([p.milNo && `ر.ع ${p.milNo}`, p.platoon].filter(Boolean).join(' · '))}</small></span>
          <span class="item-side">
            ${c.weapons.length ? `<span class="count-badge" title="أسلحة بذمته">${icon('weapon')}${fmtNum(c.weapons.length)}</span>` : ''}
            ${c.ammo.length ? `<span class="count-badge" title="أصناف عتاد بذمته">${icon('ammo')}${fmtNum(c.ammo.length)}</span>` : ''}
          </span>
        </a>`;
      }).join('')}</div>`;
    },
  };
}

export function personView(id) {
  const p = store.findPerson(id);
  if (!p) return missing('المنتسب', '#/people');
  const c = store.custodyOf(id);
  const history = sortByAt(store.data.log.filter((e) => e.personId === id));
  const d = { person: id };
  return {
    title: p.name,
    back: '#/people',
    html: `
      <section class="card detail">
        <div class="detail-head">
          <span class="avatar big">${esc(p.name.trim()[0] || '؟')}</span>
          <div class="detail-name"><h2>${esc(personLabel(p))}</h2><p>${esc([p.milNo && `الرقم العسكري ${p.milNo}`, p.platoon].filter(Boolean).join(' · '))}</p></div>
        </div>
        ${kv([['الهاتف', p.phone && `<a href="tel:${esc(p.phone)}" class="mono" dir="ltr">${esc(p.phone)}</a>`], ['ملاحظات', esc(p.notes)]])}
        <div class="actions">
          ${btn('issue-weapon', 'issue', 'تسليم سلاح', { tone: 'primary', data: d })}
          ${btn('ammo-move', 'issue', 'صرف عتاد', { data: { ...d, kind: 'a_issue' } })}
          ${btn('print-custody', 'print', 'طباعة سند الذمة', { data: { id } })}
          ${btn('edit-person', 'edit', 'تعديل', { data: { id } })}
          ${btn('remove-person', 'trash', 'حذف', { tone: 'ghost danger-text', data: { id } })}
        </div>
      </section>
      <section class="card">
        <h2 class="card-title">${icon('weapon')} الأسلحة بذمته</h2>
        ${c.weapons.length ? `<div class="list flat">${c.weapons.map((w) => `
          <div class="item static">
            <span class="item-main"><b><a href="#/weapons/${w.id}">${esc(w.model || w.type)}</a></b><small>${esc([w.type, w.caliber].filter(Boolean).join(' · '))}</small></span>
            <span class="mono serial">${esc(w.serial)}</span>
            <span class="item-actions">${btn('return-weapon', 'return', 'إرجاع', { tone: 'small', data: { id: w.id } })}</span>
          </div>`).join('')}</div>` : empty('لا توجد أسلحة بذمته')}
      </section>
      <section class="card">
        <h2 class="card-title">${icon('ammo')} العتاد بذمته</h2>
        ${c.ammo.length ? `<div class="list flat">${c.ammo.map(({ ammo: a, qty }) => `
          <div class="item static">
            <span class="item-main"><b><a href="#/ammo/${a.id}">${esc(a.name)}</a></b><small>${esc([a.caliber, a.lot && `وجبة ${a.lot}`].filter(Boolean).join(' · '))}</small></span>
            <span class="item-qty"><b>${fmtNum(qty)}</b><small>${esc(a.unit)}</small></span>
            <span class="item-actions">
              ${btn('ammo-move', 'return', 'إرجاع', { tone: 'small', data: { id: a.id, ...d, kind: 'a_return' } })}
              ${btn('ammo-move', 'flame', 'استهلاك', { tone: 'small', data: { id: a.id, ...d, kind: 'a_consume' } })}
            </span>
          </div>`).join('')}</div>` : empty('لا يوجد عتاد بذمته')}
      </section>
      <section class="card">
        <h2 class="card-title">سجل المنتسب</h2>
        ${history.length ? logList(history) : empty('لا توجد حركات')}
      </section>`,
  };
}

// ── Movement log ──
export function filteredLog() {
  const s = ui.log;
  return sortByAt(store.data.log).filter((e) => {
    if (s.group !== 'all' && LOG_KINDS[e.kind].group !== s.group) return false;
    const day = dayKey(e.at);
    if (s.from && day < s.from) return false;
    if (s.to && day > s.to) return false;
    return matches(s.q, e.w, e.a, e.p, e.note, LOG_KINDS[e.kind].label);
  });
}

export function logView() {
  const s = ui.log;
  return {
    title: 'سجل الحركات',
    html: `
      <div class="toolbar">
        ${search('log.q', 'ابحث في الحركات')}
        <div class="toolbar-actions">
          ${btn('print-log', 'print', 'طباعة')}
          ${btn('export-csv', 'sheet', 'Excel', { data: { what: 'log' } })}
        </div>
      </div>
      <div class="chips">
        ${chip('log.group', 'all', 'الكل', s.group)}
        ${chip('log.group', 'weapons', 'الأسلحة', s.group)}
        ${chip('log.group', 'ammo', 'الأعتدة', s.group)}
      </div>
      <div class="date-range">
        <label>من تاريخ <input type="date" class="input small" data-bind="log.from"></label>
        <label>إلى تاريخ <input type="date" class="input small" data-bind="log.to"></label>
      </div>
      <div id="list"></div>`,
    list() {
      if (!store.data.log.length) return empty('لا توجد حركات بعد. كل تسليم وإرجاع وصرف يُسجَّل هنا تلقائياً', 'log');
      const entries = filteredLog();
      if (!entries.length) return noResults();
      const days = new Map();
      for (const e of entries) { const k = dayKey(e.at); if (!days.has(k)) days.set(k, []); days.get(k).push(e); }
      return `<p class="list-count">${fmtNum(entries.length)} حركة</p>${[...days].map(([, list]) => `
        <section class="day"><h3 class="day-title">${fmtDate(list[0].at)}</h3>${logList(list, { withDate: false })}</section>`).join('')}`;
    },
  };
}

// ── Settings ──
export function settingsView() {
  const s = store.data.settings;
  return {
    title: 'الإعدادات',
    back: '#/home',
    html: `
      <section class="card">
        <h2 class="card-title">${icon('shield')} بيانات السرية</h2>
        <p class="card-sub">تظهر في عنوان التطبيق وفي التقارير المطبوعة وتواقيعها.</p>
        <form data-form="settings" class="settings-form">
          <label class="field"><span class="field-label">اسم السرية</span><input class="input" name="unitName" value="${esc(s.unitName)}" placeholder="مثال: السرية الأولى" autocomplete="off"></label>
          <div class="field-row">
            <label class="field"><span class="field-label">أمين المستودع</span><input class="input" name="keeperName" value="${esc(s.keeperName)}" autocomplete="off"></label>
            <label class="field"><span class="field-label">آمر السرية</span><input class="input" name="commanderName" value="${esc(s.commanderName)}" autocomplete="off"></label>
          </div>
          <button type="submit" class="btn primary">${icon('check')}<span>حفظ</span></button>
        </form>
      </section>

      <section class="card">
        <h2 class="card-title">${icon('lock')} قفل التطبيق</h2>
        <p class="card-sub">${s.lock
          ? 'القفل مفعّل: يُطلب الرمز عند فتح التطبيق وبعد بقائه في الخلفية أكثر من دقيقتين.'
          : 'اطلب رمزاً سرياً عند فتح التطبيق، لمنع من يمسك الجهاز من الاطلاع على البيانات.'}</p>
        <div class="actions">
          ${s.lock ? `${btn('set-lock', 'key', 'تغيير الرمز')}${btn('remove-lock', 'unlock', 'إلغاء القفل', { tone: 'ghost danger-text' })}` : btn('set-lock', 'lock', 'تفعيل القفل', { tone: 'primary' })}
        </div>
      </section>

      <section class="card">
        <h2 class="card-title">${icon('data')} النسخ الاحتياطي</h2>
        <p class="card-sub">البيانات محفوظة في هذا الجهاز فقط. خذ نسخة احتياطية بانتظام واحفظها في مكان آمن، ويمكنك استعادتها على هذا الجهاز أو جهاز آخر.</p>
        <p class="backup-state">${s.lastBackupAt ? `آخر نسخة احتياطية: <b>${fmtDateTime(s.lastBackupAt)}</b>` : '<b class="text-warn">لم تُؤخذ نسخة احتياطية بعد</b>'}</p>
        <div class="actions">
          ${btn('backup', 'backup', 'تنزيل نسخة احتياطية', { tone: 'primary' })}
          ${btn('restore', 'restore', 'استعادة من نسخة')}
        </div>
      </section>

      <section class="card">
        <h2 class="card-title">${icon('print')} التقارير والتصدير</h2>
        <div class="actions">
          ${btn('print-inventory', 'print', 'طباعة تقرير الجرد', { tone: 'primary' })}
        </div>
        <p class="card-sub">تصدير جداول تُفتح في Excel:</p>
        <div class="actions">
          ${btn('export-csv', 'sheet', 'الأسلحة', { data: { what: 'weapons' } })}
          ${btn('export-csv', 'sheet', 'الأعتدة', { data: { what: 'ammo' } })}
          ${btn('export-csv', 'sheet', 'المنتسبون', { data: { what: 'people' } })}
          ${btn('export-csv', 'sheet', 'سجل الحركات', { data: { what: 'log' } })}
        </div>
      </section>

      <section class="card danger-zone">
        <h2 class="card-title">${icon('erase')} مسح البيانات</h2>
        <p class="card-sub">يحذف كل السجلات من هذا الجهاز نهائياً. خذ نسخة احتياطية قبل ذلك.</p>
        <div class="actions">${btn('reset', 'trash', 'مسح جميع البيانات', { tone: 'danger' })}</div>
      </section>`,
  };
}

function missing(what, back) {
  return {
    title: 'غير موجود',
    back,
    html: empty(`${what} غير موجود، ربما حُذف.`, 'no-results', `<a class="btn" href="${back}">رجوع</a>`),
  };
}
