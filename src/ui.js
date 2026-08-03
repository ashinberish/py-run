import { createElement, Play, LoaderCircle } from 'lucide';
import { SHORTCUT_LABEL, SHORTCUT_TITLE } from './constants.js';
import { enhanceSelect } from './customSelect.js';

export const dom = {
  runBtn:              document.getElementById('runBtn'),
  statusbar:           document.getElementById('statusbar'),
  statusText:          document.getElementById('statusText'),
  posText:             document.getElementById('posText'),
  pythonVersionText:   document.getElementById('pythonVersionText'),
  output:              document.getElementById('output'),
  tabstrip:            document.getElementById('tabstrip'),
  newFileBtn:          document.getElementById('newFileBtn'),
  newFileMenuBtn:      document.getElementById('newFileMenuBtn'),
  newFileMenu:         document.getElementById('newFileMenu'),
  settingsBtn:         document.getElementById('settingsBtn'),
  settingsDialog:      document.getElementById('settingsDialog'),
  settingsCloseBtn:    document.getElementById('settingsCloseBtn'),
  intellisenseToggle:  document.getElementById('intellisenseToggle'),
  pythonVersionSelect: document.getElementById('pythonVersionSelect'),
  themeToggle:         document.getElementById('themeToggle'),
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

export function setRunBtnReady() {
  dom.runBtn.disabled = false;
  dom.runBtn.innerHTML = '';
  dom.runBtn.appendChild(createElement(Play));
  dom.runBtn.appendChild(document.createTextNode(' Run '));
  const shortcut = document.createElement('span');
  shortcut.className = 'shortcut';
  shortcut.textContent = SHORTCUT_LABEL;
  dom.runBtn.appendChild(shortcut);
  dom.runBtn.title = 'Run (' + SHORTCUT_TITLE + ')';
}

export function setRunBtnBusy() {
  dom.runBtn.disabled = true;
  dom.runBtn.innerHTML = '';
  const spinner = createElement(LoaderCircle);
  spinner.classList.add('spin');
  dom.runBtn.appendChild(spinner);
  dom.runBtn.appendChild(document.createTextNode(' Running…'));
}

export function setRunBtnLoading() {
  dom.runBtn.disabled = true;
  dom.runBtn.innerHTML = '';
  const spinner = createElement(LoaderCircle);
  spinner.classList.add('spin');
  dom.runBtn.appendChild(spinner);
  dom.runBtn.appendChild(document.createTextNode(' Loading…'));
}

export function enableIntellisenseToggle() {
  dom.intellisenseToggle.disabled = false;
}

const pythonVersionSelectWidget = enhanceSelect(dom.pythonVersionSelect);

export function enablePythonVersionSelect() {
  dom.pythonVersionSelect.disabled = false;
  pythonVersionSelectWidget.sync();
}

// Call after setting dom.pythonVersionSelect.value programmatically — unlike
// picking an option through the custom trigger itself (which calls sync()
// directly), a plain `.value = ...` assignment doesn't fire a 'change' event
// for the trigger to react to.
export function syncPythonVersionSelect() {
  pythonVersionSelectWidget.sync();
}

export function setPythonVersionLabel(label) {
  dom.pythonVersionText.textContent = label;
}

export function openSettingsDialog() {
  dom.settingsDialog.classList.remove('closing');
  dom.settingsDialog.showModal();
}

// Plays the .closing exit animation (see style.css) before actually closing
// the <dialog>, instead of it just vanishing instantly.
export function closeSettingsDialog() {
  if (!dom.settingsDialog.open || dom.settingsDialog.classList.contains('closing')) return;
  dom.settingsDialog.classList.add('closing');
  dom.settingsDialog.addEventListener('animationend', function handler() {
    dom.settingsDialog.classList.remove('closing');
    dom.settingsDialog.close();
  }, { once: true });
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
