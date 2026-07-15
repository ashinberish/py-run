(function () {
  const R = window.PyRun;

  require.config({
    paths: { vs: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.45.0/min/vs' },
  });

  require(['vs/editor/editor.main'], function () {
    R.editor = monaco.editor.create(document.getElementById('editor'), {
      value: R.DEFAULT_CODE,
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

    R.editor.onDidChangeCursorPosition(function (e) {
      R.dom.posText.textContent =
        'Ln ' + e.position.lineNumber + ', Col ' + e.position.column;
    });

    R.editor.onDidChangeModelContent(function () {
      R.markUnsaved();
    });

    R.editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, function () {
      R.runCode();
    });

    R.boot();
  });
}());
