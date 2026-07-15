(function () {
  const R = window.PyRun;

  R._unsaved = false;
  R._suppressUnsaved = false;

  R.dom = {
    runBtn:     document.getElementById('runBtn'),
    statusbar:  document.getElementById('statusbar'),
    statusText: document.getElementById('statusText'),
    posText:    document.getElementById('posText'),
    output:     document.getElementById('output'),
    unsavedDot: document.getElementById('unsavedDot'),
  };

  R.setStatus = function (text, busy) {
    R.dom.statusText.textContent = text;
    R.dom.statusbar.classList.toggle('busy', !!busy);
  };

  R.appendLine = function (text, cls) {
    if (text === '') return;
    const div = document.createElement('div');
    div.className = 'line-' + cls;
    div.textContent = text;
    R.dom.output.appendChild(div);
    R.dom.output.scrollTop = R.dom.output.scrollHeight;
  };

  R.appendSystem = function (text) { R.appendLine(text, 'system'); };

  R.clearOutput = function () { R.dom.output.innerHTML = ''; };

  R.markUnsaved = function () {
    if (R._suppressUnsaved) return;
    R._unsaved = true;
    R.dom.unsavedDot.style.opacity = 1;
  };

  R.markSaved = function () {
    R._unsaved = false;
    R.dom.unsavedDot.style.opacity = 0;
  };

  R.setRunBtnReady = function () {
    R.dom.runBtn.disabled = false;
    R.dom.runBtn.innerHTML =
      '&#9654; Run <span class="shortcut">' + R.SHORTCUT_LABEL + '</span>';
    R.dom.runBtn.title = 'Run (' + R.SHORTCUT_TITLE + ')';
  };

  R.setRunBtnBusy = function () {
    R.dom.runBtn.disabled = true;
    R.dom.runBtn.textContent = '⏳ Running…';
  };

  // Clipboard helper with execCommand fallback for file:// contexts
  R.copyText = function (text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text);
    }
    const ta = document.createElement('textarea');
    ta.value = text;
    Object.assign(ta.style, { position: 'fixed', opacity: '0', top: '0', left: '0' });
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    try { document.execCommand('copy'); } catch (_) {}
    document.body.removeChild(ta);
    return Promise.resolve();
  };
}());
