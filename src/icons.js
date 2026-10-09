// Lucide icons. Markup uses <i class="ic" data-icon="name"></i> or icon('name');
// the SVG is drawn at 1em, so the element's font-size and color size and tint it.
import {
  House, Crosshair, Boxes, Users, ScrollText, Settings, Plus, Search, X, ArrowRight, ChevronLeft,
  Pencil, Trash2, ArrowUpFromLine, ArrowDownToLine, Wrench, TriangleAlert, Printer, FileSpreadsheet,
  HardDriveDownload, HardDriveUpload, Lock, LockOpen, ShieldCheck, Flame, Scale, PackagePlus, Send,
  User, Info, Eraser, KeyRound, Database, SearchX, Inbox, CircleCheck,
} from 'lucide';

const ICONS = {
  home: House, weapon: Crosshair, ammo: Boxes, people: Users, log: ScrollText, settings: Settings,
  plus: Plus, search: Search, close: X, back: ArrowRight, chevron: ChevronLeft, edit: Pencil,
  trash: Trash2, issue: ArrowUpFromLine, return: ArrowDownToLine, wrench: Wrench, alert: TriangleAlert,
  print: Printer, sheet: FileSpreadsheet, backup: HardDriveDownload, restore: HardDriveUpload,
  lock: Lock, unlock: LockOpen, shield: ShieldCheck, flame: Flame, scale: Scale, receive: PackagePlus,
  send: Send, user: User, info: Info, erase: Eraser, key: KeyRound, data: Database, 'no-results': SearchX,
  empty: Inbox, check: CircleCheck,
};

const attr = (v) => String(v).replace(/&/g, '&amp;').replace(/"/g, '&quot;');

export function iconSvg(name) {
  const node = ICONS[name];
  if (!node) return '';
  const children = node
    .map(([tag, attrs]) => `<${tag} ${Object.entries(attrs).map(([k, v]) => `${k}="${attr(v)}"`).join(' ')}/>`)
    .join('');
  return '<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" ' +
    `stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${children}</svg>`;
}

// Inline markup for templates
export const icon = (name) => `<i class="ic" data-icon="${name}" data-drawn>${iconSvg(name)}</i>`;

// Draw static placeholders (in index.html)
export function drawIcons(root = document) {
  root.querySelectorAll('[data-icon]:not([data-drawn])').forEach((el) => {
    el.innerHTML = iconSvg(el.dataset.icon);
    el.dataset.drawn = '';
  });
}
