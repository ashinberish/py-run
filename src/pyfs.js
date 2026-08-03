// Shared between runtime.js (Run) and intellisense.js (completions/hover/
// signatures) — both need the session's .py files sitting on Pyodide's
// filesystem so Python (jedi included) can resolve `import othermodule`.
export const PY_FS_DIR = '/home/pyodide';

export function ensureSysPath(pyodide) {
  pyodide.runPython(
    "import sys\n" +
    "if '" + PY_FS_DIR + "' not in sys.path:\n" +
    "    sys.path.insert(0, '" + PY_FS_DIR + "')\n"
  );
}

export function writePythonFiles(pyodide, pyFiles) {
  const FS = pyodide.FS;
  for (const f of pyFiles) {
    FS.writeFile(PY_FS_DIR + '/' + f.name, f.model.getValue());
  }
}
