(function () {
  const R = window.PyRun;

  R.pyodide = null;
  R.running = false;

  R.boot = async function () {
    R.setStatus('Booting Python runtime…', true);
    R.appendSystem('Starting Pyodide (Python 3.11 via WebAssembly)…');
    try {
      R.pyodide = await loadPyodide();

      R.pyodide.setStdout({ batched: (s) => R.appendLine(s, 'stdout') });
      R.pyodide.setStderr({ batched: (s) => R.appendLine(s, 'stderr') });

      // Intercept Python's input() — shows a browser prompt synchronously
      R.pyodide.setStdin({
        stdin: () => {
          const val = window.prompt('stdin ›') ?? '';
          R.appendLine('› ' + val, 'system');
          return val;
        },
      });

      R.setStatus('Ready', false);
      R.appendSystem('Runtime ready. Press Run or ' + R.SHORTCUT_LABEL + '.');
      R.appendSystem('Tip: "import micropip; await micropip.install(\'pkg\')" to add packages.');
      R.setRunBtnReady();
    } catch (err) {
      R.setStatus('Failed to load runtime', false);
      R.appendLine('Failed to initialize Python runtime: ' + err, 'stderr');
    }
  };

  R.runCode = async function () {
    if (!R.pyodide || R.running) return;
    R.running = true;
    R.setRunBtnBusy();
    R.setStatus('Running…', true);
    R.clearOutput();
    R.appendSystem('$ python main.py');

    const code = R.editor ? R.editor.getValue() : '';
    const t0 = performance.now();

    try {
      const result = await R.pyodide.runPythonAsync(code);
      const elapsed = ((performance.now() - t0) / 1000).toFixed(2);
      if (result !== undefined && result !== null) {
        R.appendLine('→ ' + result, 'result');
      }
      R.setStatus('Finished in ' + elapsed + 's', false);
    } catch (err) {
      const elapsed = ((performance.now() - t0) / 1000).toFixed(2);
      R.appendLine(String(err), 'stderr');
      R.setStatus('Error · ' + elapsed + 's', false);
    } finally {
      R.running = false;
      R.setRunBtnReady();
    }
  };
}());
