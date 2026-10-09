// Optional passcode lock. The passcode itself is never stored, only a salted
// PBKDF2 hash. This keeps casual hands out; it does not encrypt the data.
import { UserError, toLatinDigits } from './store.js';
import { field, openSheet, toast } from './ui.js';

const ITERATIONS = 150000;
const BACKGROUND_LIMIT_MS = 2 * 60 * 1000;

let store;
let hiddenAt = 0;

const b64 = (buf) => btoa(String.fromCharCode(...new Uint8Array(buf)));
const unb64 = (s) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));

async function hash(pin, salt, iterations) {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(pin), 'PBKDF2', false, ['deriveBits']);
  return b64(await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt, iterations }, key, 256));
}

async function verify(pin) {
  const l = store.data.settings.lock;
  return !l || (await hash(pin, unb64(l.salt), l.iterations)) === l.hash;
}

const screen = () => document.getElementById('lock-screen');
export const isLocked = () => !screen().hidden;

export function lockNow() {
  if (!store.data.settings.lock) return;
  document.getElementById('sheet').close();
  const s = screen();
  s.hidden = false;
  document.querySelector('.app').inert = true;
  const input = s.querySelector('input');
  input.value = '';
  s.querySelector('.lock-error').hidden = true;
  input.focus();
}

export function initLock(s) {
  store = s;
  const form = screen().querySelector('form');
  const input = form.querySelector('input');
  const error = form.querySelector('.lock-error');
  let busy = false;
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (busy) return;
    busy = true;
    const ok = await verify(toLatinDigits(input.value));
    busy = false;
    if (ok) {
      screen().hidden = true;
      document.querySelector('.app').inert = false;
    } else {
      error.hidden = false;
      input.value = '';
      form.classList.remove('shake');
      void form.offsetWidth;
      form.classList.add('shake');
      input.focus();
    }
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) hiddenAt = Date.now();
    else if (hiddenAt && Date.now() - hiddenAt > BACKGROUND_LIMIT_MS) lockNow();
  });
  lockNow();
}

export function setLockForm() {
  const has = !!store.data.settings.lock;
  openSheet({
    title: has ? 'تغيير رمز القفل' : 'تفعيل قفل التطبيق',
    submitLabel: has ? 'تغيير' : 'تفعيل',
    body: `
      ${has ? field({ label: 'الرمز الحالي', name: 'current', type: 'password', inputmode: 'numeric' }) : ''}
      ${field({ label: 'الرمز الجديد', name: 'pin', type: 'password', inputmode: 'numeric', hint: '4 أرقام على الأقل' })}
      ${field({ label: 'تأكيد الرمز', name: 'confirm', type: 'password', inputmode: 'numeric' })}
      <p class="sheet-text small">إذا نسيت الرمز فلا يمكن فتح التطبيق إلا بمسح بيانات المتصفح، لذا خذ نسخة احتياطية أولاً.</p>`,
    onSubmit: async (v) => {
      if (has && !(await verify(toLatinDigits(v.current)))) throw new UserError('الرمز الحالي غير صحيح');
      const pin = toLatinDigits(v.pin).trim();
      if (!/^\d{4,}$/.test(pin)) throw new UserError('الرمز يجب أن يكون 4 أرقام على الأقل');
      if (pin !== toLatinDigits(v.confirm).trim()) throw new UserError('الرمزان غير متطابقين');
      const salt = crypto.getRandomValues(new Uint8Array(16));
      store.updateSettings({ lock: { salt: b64(salt), hash: await hash(pin, salt, ITERATIONS), iterations: ITERATIONS } });
      toast(has ? 'تغيّر الرمز' : 'فُعّل القفل');
    },
  });
}

export function removeLockForm() {
  openSheet({
    title: 'إلغاء قفل التطبيق',
    submitLabel: 'إلغاء القفل',
    tone: 'danger',
    body: field({ label: 'الرمز الحالي', name: 'current', type: 'password', inputmode: 'numeric' }),
    onSubmit: async (v) => {
      if (!(await verify(toLatinDigits(v.current)))) throw new UserError('الرمز غير صحيح');
      store.updateSettings({ lock: null });
      toast('أُلغي القفل');
    },
  });
}
