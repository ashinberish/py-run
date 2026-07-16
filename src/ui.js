import { state } from './state.js';
import { SHORTCUT_LABEL, SHORTCUT_TITLE } from './constants.js';

export const dom = {
  runBtn:     document.getElementById('runBtn'),
  statusbar:  document.getElementById('statusbar'),
  statusText: document.getElementById('statusText'),
  posText:    document.getElementById('posText'),
  output:     document.getElementById('output'),
  unsavedDot: document.getElementById('unsavedDot'),
};

export function setStatus(text, busy) {
  dom.statusText.textContent = text;
  dom.statusbar.classList.toggle('busy', !!busy);
}

export function appendLine(text, cls) {
  if (text === '') return;
  const div = document.createElement('div');
  div.className = 'line-' + cls;
  div.textContent = text;
  dom.output.appendChild(div);
  dom.output.scrollTop = dom.output.scrollHeight;
}

export function appendSystem(text) { appendLine(text, 'system'); }

export function clearOutput() { dom.output.innerHTML = ''; }

export function markUnsaved() {
  if (state.suppressUnsaved) return;
  state.unsaved = true;
  dom.unsavedDot.style.opacity = 1;
}

export function markSaved() {
  state.unsaved = false;
  dom.unsavedDot.style.opacity = 0;
}

export function setRunBtnReady() {
  dom.runBtn.disabled = false;
  dom.runBtn.innerHTML =
    '&#9654; Run <span class="shortcut">' + SHORTCUT_LABEL + '</span>';
  dom.runBtn.title = 'Run (' + SHORTCUT_TITLE + ')';
}

export function setRunBtnBusy() {
  dom.runBtn.disabled = true;
  dom.runBtn.textContent = '⏳ Running…';
}

// Clipboard helper with execCommand fallback for file:// contexts
export function copyText(text) {
  if (navigator.clipboard && window.isSecureContext) {
    return navigator.clipboard.writeText(text);
  }
  const ta = document.createElement('textarea');
  ta.value = text;
  Object.assign(ta.style, { position: 'fixed', opacity: '0', top: '0', left: '0' });
  document.body.appendChild(ta);
  ta.focus();
  ta.select();
  try { document.execCommand('copy'); } catch (_) {}
  document.body.removeChild(ta);
  return Promise.resolve();
}
