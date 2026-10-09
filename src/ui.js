// Small UI helpers shared by every screen: escaping and formatting, the
// bottom sheet that holds every form, form fields, toasts and downloads.
import { icon } from './icons.js';
import { UserError, toLatinDigits } from './store.js';
import { isAndroidApp, saveFile } from './native.js';

export const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => (
  { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
));

export const fmtNum = (n) => Number(n || 0).toLocaleString('en-US');
const pad = (n) => String(n).padStart(2, '0');
export const fmtDate = (iso) => { const d = new Date(iso); return `${d.getFullYear()}/${pad(d.getMonth() + 1)}/${pad(d.getDate())}`; };
export const fmtTime = (iso) => { const d = new Date(iso); return `${pad(d.getHours())}:${pad(d.getMinutes())}`; };
export const fmtDateTime = (iso) => `${fmtDate(iso)} ${fmtTime(iso)}`;
export const localInputValue = (d = new Date()) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
export const dayKey = (iso) => { const d = new Date(iso); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; };

// Search that forgives the usual Arabic spelling variants (أ/إ/آ/ا، ة/ه، ى/ي)
// and diacritics, and treats Arabic-Indic digits as digits.
export const searchKey = (s) => toLatinDigits(s)
  .toLowerCase()
  .replace(/[ً-ْـ]/g, '')
  .replace(/[أإآ]/g, 'ا')
  .replace(/ة/g, 'ه')
  .replace(/ى/g, 'ي');
export const matches = (q, ...parts) => {
  const k = searchKey(q).trim();
  return !k || k.split(/\s+/).every((w) => searchKey(parts.filter(Boolean).join(' ')).includes(w));
};

// Inside Arabic text, numbers joined by × or - read backwards ("7.62×39"
// shows as "39×7.62", lot "2024-17" as "17-2024"), so such runs get Unicode
// LTR isolates when shown. Only text nodes are touched, never form values.
const LTR_RUN = /[0-9][0-9A-Za-z.]*(?:\s?[×xX*-]\s?[0-9][0-9A-Za-z.]*)+/g;
export function isolateLtr(root) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    if (n.parentNode.nodeName === 'TEXTAREA' || n.data.includes('\u2066')) continue;
    const next = n.data.replace(LTR_RUN, (m) => `\u2066${m}\u2069`);
    if (next !== n.data) n.data = next;
  }
}

// ── Toast ──
let toastTimer;
export function toast(message, tone = 'ok') {
  const el = document.getElementById('toast');
  el.innerHTML = `${icon(tone === 'error' ? 'alert' : 'check')}<span>${esc(message)}</span>`;
  isolateLtr(el);
  el.className = `toast show ${tone}`;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { el.className = 'toast'; }, 2600);
}

// ── Bottom sheet (one <dialog>, reused) ──
// The sheet adds a history entry so the phone's back button closes it
// instead of leaving the page underneath.
const dlg = () => document.getElementById('sheet');
let sheetInHistory = false;
let backPending = false;
let queuedHash = null;

export function initSheet() {
  const d = dlg();
  d.addEventListener('close', () => {
    d.innerHTML = '';
    if (sheetInHistory) { sheetInHistory = false; backPending = true; history.back(); }
  });
  d.addEventListener('click', (e) => { if (e.target === d) d.close(); });
  window.addEventListener('popstate', () => {
    if (backPending) {
      backPending = false;
      if (queuedHash !== null) { const h = queuedHash; queuedHash = null; location.hash = h; }
      return;
    }
    if (d.open) { sheetInHistory = false; d.close(); }
  });
}

// Navigate, waiting for a closing sheet to give back its history entry first
export function go(hash) {
  if (backPending) queuedHash = hash; else location.hash = hash;
}

export function openSheet({ title, body, submitLabel = 'حفظ', tone = 'primary', onSubmit, onOpen }) {
  const d = dlg();
  if (d.open) return; // one sheet at a time; never open one from another's submit
  d.innerHTML = `
    <form class="sheet" novalidate>
      <header class="sheet-head">
        <h2>${esc(title)}</h2>
        <button type="button" class="icon-btn" data-close aria-label="إغلاق">${icon('close')}</button>
      </header>
      <div class="sheet-body">${body}</div>
      <p class="form-error" role="alert" hidden></p>
      <footer class="sheet-foot">
        <button type="submit" class="btn ${tone}">${esc(submitLabel)}</button>
        <button type="button" class="btn ghost" data-close>إلغاء</button>
      </footer>
    </form>`;
  const form = d.querySelector('form');
  const error = form.querySelector('.form-error');
  form.querySelectorAll('[data-close]').forEach((b) => b.addEventListener('click', () => d.close()));
  wirePickers(form);
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    error.hidden = true;
    try {
      await onSubmit(Object.fromEntries(new FormData(form)), form);
      d.close();
    } catch (err) {
      if (!(err instanceof UserError)) console.error(err);
      error.innerHTML = `${icon('alert')} ${esc(err instanceof UserError ? err.message : 'حدث خطأ غير متوقع، حاول مرة أخرى')}`;
      error.hidden = false;
      error.scrollIntoView({ block: 'nearest' });
    }
  });
  isolateLtr(form);
  history.pushState({ sheet: true }, '');
  sheetInHistory = true;
  d.showModal();
  if (matchMedia('(pointer: fine)').matches) form.querySelector('.sheet-body input:not([type=hidden]):not([type=radio]), .sheet-body textarea')?.focus();
  else d.querySelector('.sheet').focus();
  onOpen?.(form);
}

// Resolves to the form's values when confirmed, false otherwise. `validate`
// may throw a UserError to keep the sheet open with a message.
export const confirmSheet = ({ title, message, confirmLabel, tone = 'danger', extra = '', validate }) =>
  new Promise((resolve) => {
    let ok = false;
    openSheet({
      title, submitLabel: confirmLabel, tone,
      body: `<p class="sheet-text">${message}</p>${extra}`,
      onSubmit: (values) => { validate?.(values); ok = values; },
    });
    dlg().addEventListener('close', () => resolve(ok), { once: true });
  });

// ── Form fields ──
export function field({ label, name, value = '', type = 'text', placeholder = '', list = '', inputmode = '', required = false, hint = '', mono = false }) {
  return `<label class="field">
    <span class="field-label">${esc(label)}${required ? ' <b class="req" aria-hidden="true">*</b>' : ''}</span>
    <input class="input${mono ? ' mono' : ''}" name="${name}" type="${type}" value="${esc(value)}" placeholder="${esc(placeholder)}"
      ${list ? `list="${list}"` : ''} ${inputmode ? `inputmode="${inputmode}"` : ''} autocomplete="off" ${required ? 'aria-required="true"' : ''}>
    ${hint ? `<small class="field-hint">${hint}</small>` : ''}
  </label>`;
}
export const textArea = ({ label, name, value = '', placeholder = '' }) => `<label class="field">
    <span class="field-label">${esc(label)}</span>
    <textarea class="input" name="${name}" rows="2" placeholder="${esc(placeholder)}">${esc(value)}</textarea>
  </label>`;
export const dateField = (label = 'التاريخ والوقت') => field({ label, name: 'at', type: 'datetime-local', value: localInputValue() });
export const datalist = (id, values) => `<datalist id="${id}">${[...new Set(values.filter(Boolean))].map((v) => `<option value="${esc(v)}">`).join('')}</datalist>`;
export const row = (...cells) => `<div class="field-row">${cells.join('')}</div>`;

// A searchable single choice; options: [{ value, label, sub, meta }]
export function picker({ label, name, options, selected = '', empty = 'لا توجد عناصر متاحة' }) {
  const head = `<span class="field-label">${esc(label)} <b class="req" aria-hidden="true">*</b></span>`;
  if (!options.length) return `<div class="field">${head}<div class="picker-empty">${icon('empty')} ${esc(empty)}</div></div>`;
  const search = options.length > 5
    ? `<div class="search-box small">${icon('search')}<input type="search" class="picker-search" placeholder="ابحث…" aria-label="بحث في ${esc(label)}"></div>`
    : '';
  return `<div class="field" role="group" aria-label="${esc(label)}">${head}<div class="picker">${search}
    <div class="picker-list">${options.map((o) => `
      <label class="picker-opt" data-key="${esc(searchKey(`${o.label} ${o.sub || ''} ${o.meta || ''}`))}">
        <input type="radio" name="${name}" value="${esc(o.value)}"${o.value === selected ? ' checked' : ''}>
        <span class="picker-text"><b>${esc(o.label)}</b>${o.sub ? `<small>${esc(o.sub)}</small>` : ''}</span>
        ${o.meta ? `<span class="picker-meta">${esc(o.meta)}</span>` : ''}
      </label>`).join('')}
    </div><p class="picker-none" hidden>لا نتائج مطابقة</p></div></div>`;
}

// A choice already made by the page the form was opened from
export const fixed = ({ label, name, value, text, sub = '' }) => `<div class="field">
    <span class="field-label">${esc(label)}</span>
    <div class="fixed-value"><b>${esc(text)}</b>${sub ? `<small>${esc(sub)}</small>` : ''}</div>
    <input type="hidden" name="${name}" value="${esc(value)}">
  </div>`;

function wirePickers(root) {
  root.querySelectorAll('.picker').forEach((p) => {
    const input = p.querySelector('.picker-search');
    const opts = [...p.querySelectorAll('.picker-opt')];
    const none = p.querySelector('.picker-none');
    input?.addEventListener('input', () => {
      const k = searchKey(input.value).trim().split(/\s+/);
      let shown = 0;
      opts.forEach((o) => { const hit = k.every((w) => o.dataset.key.includes(w)); o.hidden = !hit; shown += hit; });
      none.hidden = shown > 0;
    });
    input?.addEventListener('keydown', (e) => { if (e.key === 'Enter') e.preventDefault(); });
    p.querySelector('input:checked')?.closest('.picker-opt')?.scrollIntoView({ block: 'nearest' });
  });
}

// ── Files ──
// Saves a text file. In the Android app the system's "save to" picker opens
// and this resolves to 'saved', 'cancelled' or 'failed'; in a browser the
// file is downloaded and this resolves to 'saved'.
export async function download(filename, text, type) {
  if (isAndroidApp) return saveFile(filename, type, text);
  const url = URL.createObjectURL(new Blob([text], { type }));
  const a = Object.assign(document.createElement('a'), { href: url, download: filename });
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  return 'saved';
}

export function pickFile(accept) {
  return new Promise((resolve) => {
    const input = Object.assign(document.createElement('input'), { type: 'file', accept });
    input.addEventListener('change', () => resolve(input.files[0] || null), { once: true });
    input.click();
  });
}
