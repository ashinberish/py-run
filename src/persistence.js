// All state lives in the browser's own localStorage — nothing is ever sent
// to a server, so "secure" here just means it never leaves the machine.
const CODE_KEY = 'py-run:code';
const VERSION_KEY = 'py-run:pythonVersion';
const THEME_KEY = 'py-run:theme';

export function loadSavedCode() {
  try {
    return localStorage.getItem(CODE_KEY);
  } catch (_) {
    return null; // private-browsing / storage disabled — fall back to defaults
  }
}

export function saveCode(code) {
  try {
    localStorage.setItem(CODE_KEY, code);
  } catch (_) {
    // quota exceeded or storage disabled — nothing we can do, skip persisting
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
