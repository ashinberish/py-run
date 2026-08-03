import { createElement, X } from 'lucide';
import { state } from './state.js';
import { DEFAULT_CODE, DEFAULT_NOTES_CONTENT } from './constants.js';
import { dom } from './ui.js';
import {
  loadSavedFiles, saveFiles, loadSavedActiveFile, saveActiveFile, loadLegacyCode,
} from './persistence.js';

export function languageForName(name) {
  return name.endsWith('.md') ? 'markdown' : 'python';
}

function defaultContentFor(language) {
  return language === 'markdown' ? DEFAULT_NOTES_CONTENT : '';
}

export function nextAvailableName(base, ext) {
  const existing = new Set(state.files.map((f) => f.name));
  if (!existing.has(base + '.' + ext)) return base + '.' + ext;
  let n = 2;
  while (existing.has(base + n + '.' + ext)) n++;
  return base + n + '.' + ext;
}

export function findFile(name) {
  return state.files.find((f) => f.name === name);
}

export function mainFile() {
  return findFile('main.py');
}

export function activeFile() {
  return findFile(state.activeFileId) ?? mainFile();
}

// Requires Monaco to already be loaded — only called from within editor.js's
// require(['vs/editor/editor.main'], ...) callback, or later in response to
// user actions (which by definition happen after that).
function addFile(name, language, content) {
  const model = monaco.editor.createModel(
    content ?? defaultContentFor(language),
    language,
    monaco.Uri.parse('inmemory://py-run/' + name)
  );
  const file = { name, language, model, dirty: false };
  state.files.push(file);
  return file;
}

function persistSession() {
  saveFiles(state.files);
}

export function switchToFile(name) {
  const file = findFile(name);
  if (!file) return;
  state.activeFileId = name;
  state.editor.setModel(file.model);
  saveActiveFile(name);
  renderTabs();
}

export function markActiveDirty() {
  const file = activeFile();
  if (!file) return;
  file.dirty = true;
  renderTabs();
}

export function createNewFile(language) {
  const name = language === 'markdown'
    ? nextAvailableName('notes', 'md')
    : nextAvailableName('untitled', 'py');
  addFile(name, language);
  switchToFile(name);
  persistSession();
}

export function closeFile(name) {
  if (name === 'main.py') return; // the entry point always stays open
  const file = findFile(name);
  if (!file) return;
  const wasActive = state.activeFileId === name;
  file.model.dispose();
  state.files = state.files.filter((f) => f.name !== name);
  if (wasActive) {
    switchToFile('main.py');
  } else {
    renderTabs();
  }
  persistSession();
}

function buildTabElement(file) {
  const tab = document.createElement('div');
  tab.className = 'tab' + (file.name === state.activeFileId ? ' active' : '');

  const dot = document.createElement('span');
  dot.className = 'unsaved';
  dot.style.opacity = file.dirty ? 1 : 0;
  tab.appendChild(dot);

  const name = document.createElement('span');
  name.className = 'tabName';
  name.textContent = file.name;
  tab.appendChild(name);

  if (file.name !== 'main.py') {
    const close = document.createElement('button');
    close.type = 'button';
    close.className = 'tabClose';
    close.title = 'Close ' + file.name;
    close.appendChild(createElement(X));
    close.addEventListener('click', function (e) {
      e.stopPropagation();
      closeFile(file.name);
    });
    tab.appendChild(close);
  }

  tab.addEventListener('click', function () {
    switchToFile(file.name);
  });

  return tab;
}

export function renderTabs() {
  dom.tabstrip.innerHTML = '';
  state.files.forEach(function (file) {
    dom.tabstrip.appendChild(buildTabElement(file));
  });
}

// Loads the saved multi-file session, migrating a pre-multi-file single
// code blob into main.py if that's all that's there, and always guarantees
// main.py exists as the permanent entry point. Called once after the Monaco
// editor instance is created.
export function loadSession() {
  const saved = loadSavedFiles();
  if (saved && saved.length) {
    saved.forEach(function (f) { addFile(f.name, f.language, f.content); });
  }
  if (!mainFile()) {
    addFile('main.py', 'python', loadLegacyCode() ?? DEFAULT_CODE);
  }

  const savedActive = loadSavedActiveFile();
  switchToFile(savedActive && findFile(savedActive) ? savedActive : 'main.py');
}

export function attachPersistenceListener() {
  let timer = null;
  state.editor.onDidChangeModelContent(function () {
    markActiveDirty();
    clearTimeout(timer);
    timer = setTimeout(persistSession, 400);
  });
}
