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
  startRename(name);
  persistSession();
}

// Tracks which tab (if any) is currently showing its inline rename input.
let renamingName = null;

export function startRename(name) {
  if (name === 'main.py') return; // the entry point's name is fixed
  renamingName = name;
  renderTabs();
}

function cancelRename() {
  renamingName = null;
  renderTabs();
}

// Renames a file (and its Monaco model, which can't change URI in place —
// so this creates a fresh model with the same content/language and disposes
// the old one). The new name becomes importable from other files immediately.
export function renameFile(name, rawNewName) {
  renamingName = null;
  const file = findFile(name);
  if (!file || name === 'main.py') { renderTabs(); return; }

  let newName = (rawNewName || '').trim();
  if (!newName) { renderTabs(); return; }

  // Enforce the extension matching this file's language, so a rename can't
  // accidentally turn a Python file into a Markdown one or vice versa.
  const wantExt = file.language === 'markdown' ? '.md' : '.py';
  if (!newName.toLowerCase().endsWith(wantExt)) {
    newName = newName.replace(/\.[^./]*$/, '') + wantExt;
  }
  if (newName === name) { renderTabs(); return; }

  if (findFile(newName)) {
    newName = nextAvailableName(newName.slice(0, -wantExt.length), wantExt.slice(1));
  }

  const wasActive = state.activeFileId === name;
  const content = file.model.getValue();
  file.model.dispose();
  file.name = newName;
  file.model = monaco.editor.createModel(
    content, file.language, monaco.Uri.parse('inmemory://py-run/' + newName)
  );

  if (wasActive) {
    state.activeFileId = newName;
    state.editor.setModel(file.model);
    saveActiveFile(newName);
  }
  renderTabs();
  persistSession();
}

export function closeFile(name) {
  if (name === 'main.py') return; // the entry point always stays open
  const file = findFile(name);
  if (!file) return;
  if (renamingName === name) renamingName = null;
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

  if (file.name === renamingName) {
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'tabRenameInput';
    input.spellcheck = false;
    input.value = file.name;
    tab.appendChild(input);

    const commit = function () { renameFile(file.name, input.value); };
    input.addEventListener('keydown', function (e) {
      e.stopPropagation();
      if (e.key === 'Enter') { e.preventDefault(); commit(); }
      else if (e.key === 'Escape') { e.preventDefault(); cancelRename(); }
    });
    input.addEventListener('blur', commit);
    input.addEventListener('click', function (e) { e.stopPropagation(); });

    // Focus and select just the basename (like Finder/VS Code rename),
    // so typing replaces the name but leaves the extension alone.
    requestAnimationFrame(function () {
      input.focus();
      const dot = file.name.lastIndexOf('.');
      input.setSelectionRange(0, dot > 0 ? dot : file.name.length);
    });
  } else {
    const name = document.createElement('span');
    name.className = 'tabName';
    name.textContent = file.name;
    tab.appendChild(name);

    if (file.name !== 'main.py') {
      name.title = 'Double-click to rename';
      name.addEventListener('dblclick', function (e) {
        e.stopPropagation();
        startRename(file.name);
      });
    }
  }

  if (file.name !== 'main.py' && file.name !== renamingName) {
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
    if (file.name !== renamingName) switchToFile(file.name);
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
// code blob into main.py if that's all that's there. A brand-new session
// (nothing saved at all) is seeded with both main.py and a starter notes.md
// — closing notes.md afterwards is respected on later loads, since this
// only fires when there's no saved session to restore. Called once after
// the Monaco editor instance is created.
export function loadSession() {
  const saved = loadSavedFiles();
  if (saved && saved.length) {
    saved.forEach(function (f) { addFile(f.name, f.language, f.content); });
  } else {
    addFile('main.py', 'python', loadLegacyCode() ?? DEFAULT_CODE);
    addFile('notes.md', 'markdown');
  }
  if (!mainFile()) {
    // Defensive: a saved session that somehow lost main.py.
    addFile('main.py', 'python', DEFAULT_CODE);
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
