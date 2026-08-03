// Shared mutable runtime state, referenced across modules.
export const state = {
  pyodide: null,
  running: false,
  editor: null,
  jediReady: false,
  intellisenseEnabled: false,
  pythonVersion: null,
  // Multi-file session: each entry is { name, language, model, dirty }.
  // 'main.py' always exists — it's the fallback Run target and can't be closed.
  files: [],
  activeFileId: null,
  // .py filenames currently written into Pyodide's filesystem, so runtime.js
  // can clean up ones that got closed since the last Run.
  writtenFiles: new Set(),
};
