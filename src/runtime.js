import { state } from './state.js';
import { SHORTCUT_LABEL } from './constants.js';
import {
  setStatus, appendSystem, appendLine, clearOutput,
  setRunBtnReady, setRunBtnBusy,
} from './ui.js';

export async function boot() {
  setStatus('Booting Python runtime…', true);
  appendSystem('Starting Pyodide (Python 3.11 via WebAssembly)…');
  try {
    state.pyodide = await loadPyodide();

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
