// All state lives in the browser's own localStorage — nothing is ever sent
// to a server, so "secure" here just means it never leaves the machine.
const LEGACY_CODE_KEY = 'py-run:code'; // single-file sessions, pre-multi-file
const FILES_KEY = 'py-run:files';
const ACTIVE_FILE_KEY = 'py-run:activeFile';
const VERSION_KEY = 'py-run:pythonVersion';
const THEME_KEY = 'py-run:theme';

// One-time migration read for sessions saved before multi-file support.
export function loadLegacyCode() {
  try {
    return localStorage.getItem(LEGACY_CODE_KEY);
  } catch (_) {
    return null;
  }
}

export function loadSavedFiles() {
  try {
    const raw = localStorage.getItem(FILES_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (_) {
    return null; // private-browsing / storage disabled / corrupt JSON
  }
}

export function saveFiles(files) {
  try {
    const plain = files.map((f) => ({ name: f.name, language: f.language, content: f.model.getValue() }));
    localStorage.setItem(FILES_KEY, JSON.stringify(plain));
  } catch (_) {
    // quota exceeded or storage disabled — nothing we can do, skip persisting
  }
}

export function loadSavedActiveFile() {
  try {
    return localStorage.getItem(ACTIVE_FILE_KEY);
  } catch (_) {
    return null;
  }
}

export function saveActiveFile(name) {
  try {
    localStorage.setItem(ACTIVE_FILE_KEY, name);
  } catch (_) {
    // ignore
  }
}

export function loadSavedPythonVersion() {
  try {
    return localStorage.getItem(VERSION_KEY);
  } catch (_) {
    return null;
  }
}

export function savePythonVersion(versionId) {
  try {
    localStorage.setItem(VERSION_KEY, versionId);
  } catch (_) {
    // ignore
  }
}

export function saveTheme(theme) {
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch (_) {
    // ignore
  }
}
