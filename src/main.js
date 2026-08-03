import './style.css';

import { createElement, Copy, Check } from 'lucide';
import { state } from './state.js';
import { dom, clearOutput, markSaved, copyText, appendSystem } from './ui.js';
import { runCode } from './runtime.js';
import { initEditor } from './editor.js';
import { enableIntellisense, disableIntellisense } from './intellisense.js';
import { initIcons } from './icons.js';

initIcons();

// Run
document.getElementById('runBtn').addEventListener('click', function () {
  runCode();
});

// Clear console
document.getElementById('clearConsoleBtn').addEventListener('click', function () {
  clearOutput();
});

// Copy output to clipboard
document.getElementById('copyOutputBtn').addEventListener('click', function () {
  const btn = this;
  const lines = Array.from(dom.output.children)
    .map(function (el) { return el.textContent; })
    .join('\n');
  copyText(lines).then(function () {
    btn.innerHTML = '';
    btn.appendChild(createElement(Check));
    setTimeout(function () {
      btn.innerHTML = '';
      btn.appendChild(createElement(Copy));
    }, 1500);
  });
});

// IntelliSense toggle — off by default; installs jedi into Pyodide on first enable
dom.intellisenseToggle.addEventListener('change', function () {
  if (this.checked) {
    appendSystem('Enabling IntelliSense (installing jedi via micropip)…');
    enableIntellisense(state.pyodide).then(function () {
      appendSystem('IntelliSense ready — autocomplete, hover docs, and signature help enabled.');
    }).catch(function (err) {
      appendSystem('Failed to enable IntelliSense: ' + err);
      dom.intellisenseToggle.checked = false;
    });
  } else {
    disableIntellisense();
    appendSystem('IntelliSense disabled.');
  }
});

// New file — confirm if there are unsaved changes
document.getElementById('clearAllBtn').addEventListener('click', function () {
  if (state.unsaved && !window.confirm('Discard unsaved changes and start a new file?')) return;
  if (!state.editor) return;
  state.suppressUnsaved = true;
  state.editor.setValue('# New file\n');
  state.suppressUnsaved = false;
  markSaved();
  clearOutput();
});

// Download .py
document.getElementById('downloadBtn').addEventListener('click', function () {
  if (!state.editor) return;
  const blob = new Blob([state.editor.getValue()], { type: 'text/x-python' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'main.py';
  a.click();
  URL.revokeObjectURL(url);
});

// Resizable divider
const divider     = document.getElementById('divider');
const editorPane  = document.getElementById('editorPane');
const consolePane = document.getElementById('consolePane');
let dragging = false;

divider.addEventListener('mousedown', function (e) {
  e.preventDefault();
  dragging = true;
  divider.classList.add('dragging');
  document.body.style.cursor = 'col-resize';
  document.body.style.userSelect = 'none';
});

window.addEventListener('mousemove', function (e) {
  if (!dragging) return;
  const main = document.getElementById('main');
  const rect = main.getBoundingClientRect();
  const ratio = (e.clientX - rect.left) / rect.width;
  if (ratio > 0.2 && ratio < 0.85) {
    editorPane.style.flex = ratio;
    consolePane.style.flex = (1 - ratio);
  }
});

window.addEventListener('mouseup', function () {
  if (!dragging) return;
  dragging = false;
  divider.classList.remove('dragging');
  document.body.style.cursor = '';
  document.body.style.userSelect = '';
});

initEditor();
