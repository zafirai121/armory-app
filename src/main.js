import '@fontsource/tajawal/400.css';
import '@fontsource/tajawal/500.css';
import '@fontsource/tajawal/700.css';
import '@fontsource/tajawal/800.css';
import './style.css';

import { createStore, UserError } from './store.js';
import { drawIcons } from './icons.js';
import { initSheet, toast, go, confirmSheet, pickFile, field, esc, fmtNum, fmtDateTime, isolateLtr } from './ui.js';
import * as F from './forms.js';
import * as V from './views.js';
import * as R from './reports.js';
import { initLock, lockNow, setLockForm, removeLockForm } from './lock.js';
import { loadDemo } from './demo.js';

const store = createStore();
F.initForms(store);
V.initViews(store);
R.initReports(store);

// ── Routing: #/section or #/section/id ──
const ROUTES = {
  home: () => V.homeView(),
  weapons: (id) => (id ? V.weaponView(id) : V.weaponsView()),
  ammo: (id) => (id ? V.ammoView(id) : V.ammoListView()),
  people: (id) => (id ? V.personView(id) : V.peopleView()),
  log: () => V.logView(),
  settings: () => V.settingsView(),
};

function route() {
  const [section, id = ''] = location.hash.replace(/^#\/?/, '').split('/');
  return ROUTES[section] ? { section, id: decodeURIComponent(id) } : { section: 'home', id: '' };
}

const $ = (sel) => document.querySelector(sel);
const scrollMemory = new Map();
let current = null;

function render({ sameView = false } = {}) {
  const { section, id } = route();
  const key = `${section}/${id}`;
  const scroller = document.scrollingElement;
  const stayed = current?.key === key;
  if (current && !stayed) scrollMemory.set(current.key, scroller.scrollTop);
  const view = ROUTES[section](id || undefined);

  $('#page-title').textContent = view.title;
  document.title = `${view.title} · مستودع السرية`;
  const back = $('#back-btn');
  back.hidden = !view.back;
  back.dataset.to = view.back || '';
  $('#brand-unit').textContent = `مستودع ${store.data.settings.unitName || 'السرية'}`;
  $('#lock-btn').hidden = !store.data.settings.lock;
  $('.topbar-settings').hidden = section === 'settings';
  document.querySelectorAll('[data-nav]').forEach((a) => {
    const on = a.dataset.nav === section;
    a.classList.toggle('active', on);
    if (on) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
  });

  const main = $('#view');
  main.innerHTML = view.html;
  current = { key, view };
  main.querySelectorAll('[data-bind]').forEach((input) => {
    const [sec, prop] = input.dataset.bind.split('.');
    input.value = V.ui[sec][prop];
    input.addEventListener('input', () => { V.ui[sec][prop] = input.value; renderList(); });
  });
  renderList();
  isolateLtr(document.querySelector('.app'));

  // A change saved on this screen keeps the scroll position; moving to a
  // screen restores where it was last left
  if (!(sameView && stayed)) scroller.scrollTop = scrollMemory.get(key) || 0;
}

function renderList() {
  const list = $('#list');
  if (!list || !current?.view.list) return;
  list.innerHTML = current.view.list();
  isolateLtr(list);
}

// ── Back button: step back through the app's own history, or up to the parent list ──
function initHistoryDepth() {
  let depth = history.state?.depth ?? 0;
  if (history.state?.depth === undefined) history.replaceState({ ...history.state, depth }, '');
  window.addEventListener('hashchange', () => {
    if (history.state?.depth === undefined) history.replaceState({ depth: ++depth }, '');
    else depth = history.state.depth;
    render();
  });
  window.addEventListener('popstate', () => { if (history.state?.depth !== undefined) depth = history.state.depth; });
  $('#back-btn').addEventListener('click', () => {
    if (history.state?.depth > 0) history.back();
    else location.replace(`#${$('#back-btn').dataset.to.replace(/^#/, '')}`);
  });
}

// ── Actions (buttons carry data-action and data-*) ──
const actions = {
  'add-person': () => F.personForm(),
  'edit-person': (d) => F.personForm(d.id),
  'remove-person': (d) => F.removePerson(d.id),
  'add-weapon': () => F.weaponForm(),
  'edit-weapon': (d) => F.weaponForm(d.id),
  'remove-weapon': (d) => F.removeWeapon(d.id),
  'issue-weapon': (d) => F.issueWeaponForm({ weaponId: d.id, personId: d.person }),
  'return-weapon': (d) => F.returnWeaponForm({ weaponId: d.id, personId: d.person }),
  'weapon-status': (d) => F.weaponStatusForm(d.id),
  'add-ammo': () => F.ammoForm(),
  'edit-ammo': (d) => F.ammoForm(d.id),
  'remove-ammo': (d) => F.removeAmmo(d.id),
  'ammo-move': (d) => F.ammoMoveForm(d.kind, { ammoId: d.id, personId: d.person }),

  'weapons-filter': (d) => {
    Object.assign(V.ui.weapons, { status: d.status, q: '' });
    go('#/weapons');
  },
  chip: (d, el) => {
    const [sec, prop] = d.bind.split('.');
    V.ui[sec][prop] = d.value;
    el.parentElement.querySelectorAll(`.chip[data-bind="${d.bind}"]`).forEach((c) => {
      c.classList.toggle('active', c === el);
      c.setAttribute('aria-pressed', c === el);
    });
    renderList();
  },

  'print-inventory': () => R.printInventory(),
  'print-custody': (d) => R.printCustody(d.id),
  'print-log': () => {
    const { from, to } = V.ui.log;
    const day = (d) => d.replaceAll('-', '/');
    const range = from || to ? `من ${from ? day(from) : 'البداية'} إلى ${to ? day(to) : 'اليوم'}` : 'كل الحركات';
    R.printLog(V.filteredLog(), range);
  },
  'export-csv': (d) => R.exportCsv(d.what, d.what === 'log' && route().section === 'log' ? V.filteredLog() : undefined),

  backup: () => { R.downloadBackup(); toast('نُزّلت النسخة الاحتياطية، احفظها في مكان آمن'); },
  restore: restoreBackup,
  reset: resetAll,
  demo: () => { loadDemo(store); toast('حُمّلت بيانات نموذجية للتجربة'); },
  'lock-now': () => lockNow(),
  'set-lock': () => setLockForm(),
  'remove-lock': () => removeLockForm(),
};

async function restoreBackup() {
  const file = await pickFile('application/json,.json');
  if (!file) return;
  const text = await file.text();
  let info = {};
  try { info = JSON.parse(text); } catch { /* importJSON reports it */ }
  const n = (k) => (Array.isArray(info[k]) ? fmtNum(info[k].length) : '؟');
  const ok = await confirmSheet({
    title: 'استعادة نسخة احتياطية',
    message: `ستُستبدل كل البيانات الحالية على هذا الجهاز بمحتوى النسخة${info.exportedAt ? ` المأخوذة في <b>${esc(fmtDateTime(info.exportedAt))}</b>` : ''}:
      ${n('weapons')} سلاح، ${n('ammo')} صنف عتاد، ${n('people')} منتسب، ${n('log')} حركة. لا يمكن التراجع عن ذلك.`,
    confirmLabel: 'استعادة',
    validate: () => store.importJSON(text),
  });
  if (!ok) return;
  toast('اُستعيدت البيانات');
  go('#/home');
}

async function resetAll() {
  const ok = await confirmSheet({
    title: 'مسح جميع البيانات',
    message: 'سيُحذف كل شيء من هذا الجهاز نهائياً: الأسلحة والأعتدة والمنتسبون والسجل. للتأكيد اكتب كلمة <b>مسح</b>.',
    confirmLabel: 'مسح نهائي',
    extra: field({ label: 'كلمة التأكيد', name: 'confirm' }),
    validate: (v) => {
      if (v.confirm.trim() !== 'مسح') throw new UserError('اكتب كلمة «مسح» للتأكيد');
      store.reset();
    },
  });
  if (!ok) return;
  toast('مُسحت البيانات');
  go('#/home');
}

document.addEventListener('click', (e) => {
  const el = e.target.closest('[data-action]');
  if (!el || el.closest('#sheet')) return;
  const fn = actions[el.dataset.action];
  if (!fn) return;
  e.preventDefault();
  Promise.resolve(fn(el.dataset, el)).catch((err) => {
    if (!(err instanceof UserError)) console.error(err);
    toast(err instanceof UserError ? err.message : 'حدث خطأ غير متوقع', 'error');
  });
});

document.addEventListener('submit', (e) => {
  const form = e.target.closest('form[data-form="settings"]');
  if (!form) return;
  e.preventDefault();
  const v = Object.fromEntries(new FormData(form));
  try {
    store.updateSettings({ unitName: v.unitName.trim(), keeperName: v.keeperName.trim(), commanderName: v.commanderName.trim() });
    toast('حُفظت بيانات السرية');
  } catch (err) { toast(err.message, 'error'); }
});

// ── Start ──
drawIcons();
initSheet();
initHistoryDepth();
initLock(store);
store.subscribe(() => render({ sameView: true }));
render();

navigator.storage?.persist?.().catch(() => {});
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
}
