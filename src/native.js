// Inside the Android app (android/), the page runs in a WebView whose
// MainActivity exposes window.AndroidBridge for what a WebView cannot do on its
// own: saving a file through the system's "save to" picker, and printing.
const bridge = globalThis.AndroidBridge;

export const isAndroidApp = !!bridge;

// Resolves to 'saved', 'cancelled' or 'failed' (MainActivity calls back
// window.__armoryFileSaved once the picker closes).
let pendingSave = null;
globalThis.__armoryFileSaved = (status) => {
  const resolve = pendingSave;
  pendingSave = null;
  resolve?.(status);
};

export function saveFile(filename, mimeType, text) {
  pendingSave?.('cancelled');
  return new Promise((resolve) => {
    pendingSave = resolve;
    bridge.saveFile(filename, mimeType.split(';')[0], text);
  });
}

export const print = (jobName) => bridge.print(jobName);
