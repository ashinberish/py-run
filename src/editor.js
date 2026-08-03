import { state } from './state.js';
import { DEFAULT_CODE, DEFAULT_PYTHON_VERSION } from './constants.js';
import { dom, markUnsaved } from './ui.js';
import { boot, runCode } from './runtime.js';
import { registerCompletionProviders } from './intellisense.js';
import { loadSavedCode, saveCode, loadSavedPythonVersion } from './persistence.js';

function debounce(fn, delayMs) {
  let timer = null;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(null, args), delayMs);
  };
}

export function initEditor() {
  // Kick off the Pyodide boot in parallel with Monaco's own loading below —
  // the two are independent, so there's no reason to wait for Monaco first.
  const initialVersion = loadSavedPythonVersion() ?? DEFAULT_PYTHON_VERSION;
  dom.pythonVersionSelect.value = initialVersion;
  boot(initialVersion);

  require.config({
    paths: { vs: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.45.0/min/vs' },
  });

  require(['vs/editor/editor.main'], function () {
    registerCompletionProviders(monaco);

    const isLight = document.documentElement.getAttribute('data-theme') === 'light';

    state.editor = monaco.editor.create(document.getElementById('editor'), {
      value: loadSavedCode() ?? DEFAULT_CODE,
      language: 'python',
      theme: isLight ? 'vs' : 'vs-dark',
      fontFamily: "'JetBrains Mono', 'Fira Code', ui-monospace, Consolas, monospace",
      fontSize: 14,
      lineHeight: 22,
      minimap: { enabled: false },
      automaticLayout: true,
      scrollBeyondLastLine: false,
      tabSize: 4,
      padding: { top: 12 },
      cursorBlinking: 'smooth',
      renderLineHighlight: 'gutter',
    });

    state.editor.onDidChangeCursorPosition(function (e) {
      dom.posText.textContent =
        'Ln ' + e.position.lineNumber + ', Col ' + e.position.column;
    });

    const persistCode = debounce(function () {
      saveCode(state.editor.getValue());
    }, 400);

    state.editor.onDidChangeModelContent(function () {
      markUnsaved();
      persistCode();
    });

    state.editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, function () {
      runCode();
    });
  });
}
