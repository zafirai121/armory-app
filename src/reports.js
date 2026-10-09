// Printed reports (inventory, a soldier's custody receipt, the movement log)
// and spreadsheet exports. Printing fills #print-area, which is the only thing
// the print stylesheet shows.
import { WEAPON_STATUS, LOG_KINDS, personLabel } from './store.js';
import { esc, fmtNum, fmtDate, fmtDateTime, download, isolateLtr } from './ui.js';
import * as native from './native.js';

const { isAndroidApp } = native;
import { describe } from './views.js';

let store;
export const initReports = (s) => { store = s; };

const unitTitle = () => store.data.settings.unitName || 'السرية';
const today = () => new Date().toISOString();

function header(title, subtitle = '') {
  return `<header class="p-head">
    <div><b>${esc(unitTitle())}</b><span>مستودع الأسلحة والأعتدة</span></div>
    <div class="p-title"><h1>${esc(title)}</h1>${subtitle ? `<p>${subtitle}</p>` : ''}</div>
    <div class="p-date">التاريخ: ${fmtDate(today())}</div>
  </header>`;
}

function signatures(roles) {
  const s = store.data.settings;
  const names = { 'أمين المستودع': s.keeperName, 'آمر السرية': s.commanderName };
  return `<div class="p-signs">${roles.map(([role, name]) => `
    <div class="p-sign"><span>${esc(role)}</span><div class="p-line"></div><small>${esc(name ?? names[role] ?? '')}</small></div>`).join('')}
  </div>`;
}

const table = (head, rows, empty = 'لا يوجد') => `<table class="p-table">
  <thead><tr><th>ت</th>${head.map((h) => `<th>${esc(h)}</th>`).join('')}</tr></thead>
  <tbody>${rows.length ? rows.map((r, i) => `<tr><td>${i + 1}</td>${r.map((c) => `<td>${c}</td>`).join('')}</tr>`).join('')
    : `<tr><td colspan="${head.length + 1}" class="p-empty">${empty}</td></tr>`}</tbody>
</table>`;

function print(html, title) {
  const area = document.getElementById('print-area');
  area.innerHTML = html;
  isolateLtr(area);
  // Android prints the page after its print screen opens, so the report stays
  // in place there (hidden on screen) until the next one replaces it
  if (isAndroidApp) { native.print(`${title} - ${unitTitle()}`); return; }
  window.addEventListener('afterprint', () => { area.innerHTML = ''; }, { once: true });
  window.print();
}

export function printInventory() {
  const { weapons, ammo } = store.data;
  const byType = new Map();
  for (const w of weapons) {
    const t = w.type || 'غير محدد';
    const c = byType.get(t) || { total: 0, in_store: 0, issued: 0, other: 0 };
    c.total++;
    if (w.status === 'in_store' || w.status === 'issued') c[w.status]++; else c.other++;
    byType.set(t, c);
  }
  const sorted = [...weapons].sort((a, b) => (a.type || '').localeCompare(b.type || '', 'ar') || a.serial.localeCompare(b.serial, 'en', { numeric: true }));
  const holder = (w) => (w.holderId && store.findPerson(w.holderId) ? personLabel(store.findPerson(w.holderId)) : '');
  print(`
    ${header('تقرير الجرد العام', `عدد الأسلحة ${fmtNum(weapons.length)} · أصناف العتاد ${fmtNum(ammo.length)}`)}
    <h2>خلاصة الأسلحة حسب النوع</h2>
    ${table(['النوع', 'المجموع', 'في المستودع', 'مسلّم', 'صيانة / عاطل / مفقود'],
      [...byType].map(([t, c]) => [esc(t), fmtNum(c.total), fmtNum(c.in_store), fmtNum(c.issued), fmtNum(c.other)]))}
    <h2>الأسلحة</h2>
    ${table(['النوع', 'الطراز', 'الرقم التسلسلي', 'العيار', 'الحالة', 'بذمة'],
      sorted.map((w) => [esc(w.type), esc(w.model), `<span class="mono">${esc(w.serial)}</span>`, esc(w.caliber), WEAPON_STATUS[w.status].label, esc(holder(w))]))}
    <h2>الأعتدة</h2>
    ${table(['الصنف', 'العيار', 'الوجبة', 'الوحدة', 'في المستودع', 'بذمة المنتسبين', 'المجموع'],
      ammo.map((a) => {
        const b = store.balanceOf(a.id);
        return [esc(a.name), esc(a.caliber), esc(a.lot), esc(a.unit), fmtNum(b.store), fmtNum(b.issued), `<b>${fmtNum(b.store + b.issued)}</b>`];
      }))}
    ${signatures([['أمين المستودع'], ['آمر السرية']])}`, 'تقرير الجرد العام');
}

export function printCustody(personId) {
  const p = store.findPerson(personId);
  const c = store.custodyOf(personId);
  print(`
    ${header('سند ذمة', 'الأسلحة والأعتدة المسلّمة للمنتسب')}
    <dl class="p-kv">
      <div><dt>الاسم</dt><dd>${esc(p.name)}</dd></div>
      <div><dt>الرتبة</dt><dd>${esc(p.rank) || '—'}</dd></div>
      <div><dt>الرقم العسكري</dt><dd class="mono">${esc(p.milNo) || '—'}</dd></div>
      <div><dt>الفصيل</dt><dd>${esc(p.platoon) || '—'}</dd></div>
    </dl>
    <h2>الأسلحة</h2>
    ${table(['النوع', 'الطراز', 'الرقم التسلسلي', 'العيار'],
      c.weapons.map((w) => [esc(w.type), esc(w.model), `<span class="mono">${esc(w.serial)}</span>`, esc(w.caliber)]), 'لا توجد أسلحة بذمته')}
    <h2>الأعتدة</h2>
    ${table(['الصنف', 'العيار', 'الوجبة', 'الكمية', 'الوحدة'],
      c.ammo.map(({ ammo: a, qty }) => [esc(a.name), esc(a.caliber), esc(a.lot), `<b>${fmtNum(qty)}</b>`, esc(a.unit)]), 'لا يوجد عتاد بذمته')}
    <p class="p-pledge">أتعهد بالمحافظة على المواد المثبتة أعلاه واستخدامها للأغراض الرسمية فقط وإعادتها عند الطلب، وأتحمل المسؤولية في حال فقدانها أو إتلافها.</p>
    ${signatures([['المستلم', personLabel(p)], ['أمين المستودع'], ['آمر السرية']])}`, `سند ذمة ${p.name}`);
}

export function printLog(entries, rangeText) {
  print(`
    ${header('سجل الحركات', rangeText)}
    ${table(['التاريخ', 'الحركة', 'التفاصيل', 'المنتسب', 'ملاحظات'],
      entries.map((e) => {
        const d = describe(e);
        return [fmtDateTime(e.at), LOG_KINDS[e.kind].label, esc(d.what) + (d.amount ? ` — <b>${esc(d.amount)}</b>` : ''), esc(e.p || ''), esc(e.note || '')];
      }))}
    ${signatures([['أمين المستودع'], ['آمر السرية']])}`, 'سجل الحركات');
}

// ── Spreadsheet (CSV, opens in Excel with Arabic intact) ──
const csvCell = (v) => {
  const s = String(v ?? '');
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};
const csv = (rows) => '﻿' + rows.map((r) => r.map(csvCell).join(',')).join('\r\n');
const stamp = () => fmtDate(today()).replace(/\//g, '-');

export function exportCsv(what, entries) {
  const d = store.data;
  const person = (id) => (id && store.findPerson(id) ? personLabel(store.findPerson(id)) : '');
  // File names stay in Latin letters: some browsers drop non-Latin download names
  const sheets = {
    weapons: ['weapons', [['النوع', 'الطراز', 'الرقم التسلسلي', 'العيار', 'الحالة', 'بذمة', 'مكان الخزن', 'ملاحظات'],
      ...d.weapons.map((w) => [w.type, w.model, w.serial, w.caliber, WEAPON_STATUS[w.status].label, person(w.holderId), w.location, w.notes])]],
    ammo: ['ammo', [['الصنف', 'العيار', 'الوجبة', 'الوحدة', 'في المستودع', 'بذمة المنتسبين', 'المجموع', 'الحد الأدنى', 'مكان الخزن'],
      ...d.ammo.map((a) => { const b = store.balanceOf(a.id); return [a.name, a.caliber, a.lot, a.unit, b.store, b.issued, b.store + b.issued, a.minQty || '', a.location]; })]],
    people: ['personnel', [['الاسم', 'الرتبة', 'الرقم العسكري', 'الفصيل', 'الهاتف', 'أسلحة بذمته', 'عتاد بذمته'],
      ...d.people.map((p) => {
        const c = store.custodyOf(p.id);
        return [p.name, p.rank, p.milNo, p.platoon, p.phone,
          c.weapons.map((w) => `${w.model || w.type} ${w.serial}`).join(' / '),
          c.ammo.map(({ ammo: a, qty }) => `${a.name} ${a.caliber}: ${qty} ${a.unit}`).join(' / ')];
      })]],
    log: ['movements', [['التاريخ', 'الوقت', 'الحركة', 'السلاح', 'العتاد', 'الكمية', 'المنتسب', 'ملاحظات'],
      ...(entries || d.log).map((e) => [fmtDate(e.at), new Date(e.at).toTimeString().slice(0, 5), LOG_KINDS[e.kind].label,
        e.w || '', e.a || '', e.qty ?? '', e.p || '', e.note || ''])]],
  };
  const [name, rows] = sheets[what];
  return download(`armory-${name}-${stamp()}.csv`, csv(rows), 'text/csv;charset=utf-8');
}

// Resolves to 'saved', 'cancelled' or 'failed'; only a saved file counts as a backup
export async function downloadBackup() {
  const status = await download(`armory-backup-${stamp()}.json`, store.exportJSON(), 'application/json');
  if (status === 'saved') store.markBackedUp();
  return status;
}
