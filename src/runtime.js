import { state } from './state.js';
import { SHORTCUT_LABEL, PYTHON_VERSIONS, pyodideScriptUrl, pyodideBaseUrl } from './constants.js';
import {
  setStatus, appendSystem, appendLine, clearOutput,
  setRunBtnReady, setRunBtnBusy, setRunBtnLoading,
  enableIntellisenseToggle, enablePythonVersionSelect,
} from './ui.js';

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.onload = resolve;
    script.onerror = () => reject(new Error('Failed to load ' + src));
    document.body.appendChild(script);
  });
}

function pythonLabel(versionId) {
  const entry = PYTHON_VERSIONS.find((v) => v.id === versionId);
  return entry ? entry.python : versionId;
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
  } catch (err) {
    setStatus('Failed to load runtime', false);
    appendLine('Failed to initialize Python runtime: ' + err, 'stderr');
  }
}

export async function runCode() {
  if (!state.pyodide || state.running) return;
  state.running = true;
  setRunBtnBusy();
  setStatus('Running…', true);
  clearOutput();
  appendSystem('$ python main.py');

  const code = state.editor ? state.editor.getValue() : '';
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
