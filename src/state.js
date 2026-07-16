// Shared mutable runtime state, referenced across modules.
export const state = {
  pyodide: null,
  running: false,
  editor: null,
  unsaved: false,
  suppressUnsaved: false,
};
