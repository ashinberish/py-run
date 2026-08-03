import { state } from './state.js';
import { SHORTCUT_LABEL, PYTHON_VERSIONS, pyodideScriptUrl, pyodideBaseUrl } from './constants.js';
import {
  setStatus, appendSystem, appendLine, clearOutput,
  setRunBtnReady, setRunBtnBusy, setRunBtnLoading,
  enableIntellisenseToggle, enablePythonVersionSelect, setPythonVersionLabel,
} from './ui.js';
import { activeFile, mainFile } from './tabs.js';

const FS_DIR = '/home/pyodide';

// Run always targets a runnable (Python) file: the active tab if it's one,
// otherwise falling back to main.py (e.g. when a Markdown notes tab is open).
function targetFile() {
  const active = activeFile();
  return active && active.language === 'python' ? active : mainFile();
}

// Writes every .py file in the session into Pyodide's filesystem so they can
// import each other as modules, removes any that were closed since the last
// run, and drops the target's sibling modules from sys.modules so edits to
// them are picked up on re-run instead of using Python's cached import.
function syncFilesToFS(pyodide, target) {
  const FS = pyodide.FS;
  const pyFiles = state.files.filter((f) => f.language === 'python');
  const currentNames = new Set(pyFiles.map((f) => f.name));

  for (const name of state.writtenFiles) {
    if (!currentNames.has(name)) {
      try { FS.unlink(FS_DIR + '/' + name); } catch (_) { /* already gone */ }
    }
  }
  for (const f of pyFiles) {
    FS.writeFile(FS_DIR + '/' + f.name, f.model.getValue());
  }
  state.writtenFiles = currentNames;

  const moduleNames = pyFiles
    .filter((f) => f.name !== target.name)
    .map((f) => f.name.replace(/\.py$/, ''));

  pyodide.runPython(
    "import sys\n" +
    "if '" + FS_DIR + "' not in sys.path:\n" +
    "    sys.path.insert(0, '" + FS_DIR + "')\n" +
    (moduleNames.length
      ? 'for _m in ' + JSON.stringify(moduleNames) + ':\n    sys.modules.pop(_m, None)\n'
      : '')
  );
}

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.onload = resolve;
    script.onerror = () => reject(new Error('Failed to load ' + src));
    document.body.appendChild(script);
  });
}

function pythonVersionEntry(versionId) {
  return PYTHON_VERSIONS.find((v) => v.id === versionId);
}

function pythonLabel(versionId) {
  return pythonVersionEntry(versionId)?.python ?? versionId;
}

export async function boot(versionId) {
  setStatus('Booting Python runtime…', true);
  setRunBtnLoading();
  appendSystem('Starting Pyodide (Python ' + pythonLabel(versionId) + ' via WebAssembly)…');
  try {
    await loadScript(pyodideScriptUrl(versionId));
    // Passing indexURL explicitly (we already know it — we just loaded the
    // script from there) skips Pyodide's stack-trace-based path detection,
    // which older Pyodide releases implement with a vendored UMD library
    // that misbehaves next to Monaco's RequireJS loader on the same page.
    state.pyodide = await loadPyodide({ indexURL: pyodideBaseUrl(versionId) });
    state.pythonVersion = versionId;

    state.pyodide.setStdout({ batched: (s) => appendLine(s, 'stdout') });
    state.pyodide.setStderr({ batched: (s) => appendLine(s, 'stderr') });

    // Intercept Python's input() — shows a browser prompt synchronously
    state.pyodide.setStdin({
      stdin: () => {
        const val = window.prompt('stdin ›') ?? '';
        appendLine('› ' + val, 'system');
        return val;
      },
    });

    setStatus('Ready', false);
    appendSystem('Runtime ready. Press Run or ' + SHORTCUT_LABEL + '.');
    appendSystem('Tip: "import micropip; await micropip.install(\'pkg\')" to add packages.');
    setRunBtnReady();
    enableIntellisenseToggle();
    enablePythonVersionSelect();
    setPythonVersionLabel(pythonVersionEntry(versionId)?.label ?? versionId);
  } catch (err) {
    setStatus('Failed to load runtime', false);
    appendLine('Failed to initialize Python runtime: ' + err, 'stderr');
  }
}

export async function runCode() {
  if (!state.pyodide || state.running) return;
  const file = targetFile();
  if (!file) return;

  state.running = true;
  setRunBtnBusy();
  setStatus('Running…', true);
  clearOutput();
  appendSystem('$ python ' + file.name);

  syncFilesToFS(state.pyodide, file);
  const code = file.model.getValue();
  const t0 = performance.now();

  try {
    const result = await state.pyodide.runPythonAsync(code);
    const elapsed = ((performance.now() - t0) / 1000).toFixed(2);
    if (result !== undefined && result !== null) {
      appendLine('→ ' + result, 'result');
    }
    setStatus('Finished in ' + elapsed + 's', false);
  } catch (err) {
    const elapsed = ((performance.now() - t0) / 1000).toFixed(2);
    appendLine(String(err), 'stderr');
    setStatus('Error · ' + elapsed + 's', false);
  } finally {
    state.running = false;
    setRunBtnReady();
  }
}
