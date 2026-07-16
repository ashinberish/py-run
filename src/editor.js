import { state } from './state.js';
import { DEFAULT_CODE } from './constants.js';
import { dom, markUnsaved } from './ui.js';
import { boot, runCode } from './runtime.js';

export function initEditor() {
  require.config({
    paths: { vs: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.45.0/min/vs' },
  });

  require(['vs/editor/editor.main'], function () {
    state.editor = monaco.editor.create(document.getElementById('editor'), {
      value: DEFAULT_CODE,
      language: 'python',
      theme: 'vs-dark',
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

    state.editor.onDidChangeModelContent(function () {
      markUnsaved();
    });

    state.editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, function () {
      runCode();
    });

    boot();
  });
}
