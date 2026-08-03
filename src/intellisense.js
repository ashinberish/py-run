import { state } from './state.js';

// Runs inside Pyodide. Uses jedi.Interpreter (not jedi.Script) so completions
// and hovers also see variables/functions the user has already defined by
// pressing Run, not just what's statically visible in the current buffer.
const PY_BRIDGE = `
import json
import __main__

def __intellisense_complete(code, line, column):
    try:
        import jedi
        script = jedi.Interpreter(code, [__main__.__dict__])
        items = []
        for c in script.complete(line, column):
            try:
                doc = c.docstring(raw=True)
            except Exception:
                doc = ''
            items.append({
                'label': c.name,
                'kind': c.type,
                'detail': c.description,
                'documentation': doc,
            })
        return json.dumps(items)
    except Exception:
        return '[]'

def __intellisense_hover(code, line, column):
    try:
        import jedi
        script = jedi.Interpreter(code, [__main__.__dict__])
        items = []
        for n in script.help(line, column):
            try:
                doc = n.docstring(raw=True)
            except Exception:
                doc = ''
            items.append({'name': n.name, 'kind': n.type, 'documentation': doc})
        return json.dumps(items)
    except Exception:
        return '[]'

def __intellisense_signatures(code, line, column):
    try:
        import jedi
        script = jedi.Interpreter(code, [__main__.__dict__])
        sigs = []
        for s in script.get_signatures(line, column):
            try:
                doc = s.docstring(raw=True)
            except Exception:
                doc = ''
            sigs.append({
                'label': s.to_string(),
                'params': [p.to_string() for p in s.params],
                'index': s.index if s.index is not None else -1,
                'documentation': doc,
            })
        return json.dumps(sigs)
    except Exception:
        return '[]'
`;

export async function initJedi(pyodide) {
  await pyodide.loadPackage('micropip');
  const micropip = pyodide.pyimport('micropip');
  await micropip.install('jedi');
  pyodide.runPython(PY_BRIDGE);
}

// Installing jedi costs a micropip download, so it only happens once, lazily,
// the first time the user actually turns IntelliSense on.
let jediInstall = null;

export async function enableIntellisense(pyodide) {
  state.intellisenseEnabled = true;
  if (!jediInstall) {
    jediInstall = initJedi(pyodide).then(() => {
      state.jediReady = true;
    });
  }
  try {
    await jediInstall;
  } catch (err) {
    jediInstall = null; // allow retrying on the next toggle
    throw err;
  }
}

export function disableIntellisense() {
  state.intellisenseEnabled = false;
}

function jediKindToMonacoKind(monaco, kind) {
  const K = monaco.languages.CompletionItemKind;
  switch (kind) {
    case 'module':
    case 'namespace': return K.Module;
    case 'class': return K.Class;
    case 'function': return K.Function;
    case 'instance':
    case 'param':
    case 'statement': return K.Variable;
    case 'path': return K.File;
    case 'keyword': return K.Keyword;
    case 'property': return K.Property;
    default: return K.Text;
  }
}

function callBridge(name, code, line, column) {
  const fn = state.pyodide.globals.get(name);
  try {
    return JSON.parse(fn(code, line, column));
  } finally {
    fn.destroy();
  }
}

export function registerCompletionProviders(monaco) {
  monaco.languages.registerCompletionItemProvider('python', {
    triggerCharacters: ['.'],
    provideCompletionItems(model, position) {
      if (!state.intellisenseEnabled || !state.pyodide || !state.jediReady) return { suggestions: [] };

      let items;
      try {
        items = callBridge(
          '__intellisense_complete',
          model.getValue(),
          position.lineNumber,
          position.column - 1
        );
      } catch (e) {
        return { suggestions: [] };
      }

      const word = model.getWordUntilPosition(position);
      const range = {
        startLineNumber: position.lineNumber,
        endLineNumber: position.lineNumber,
        startColumn: word.startColumn,
        endColumn: word.endColumn,
      };

      return {
        suggestions: items.map((it) => ({
          label: it.label,
          kind: jediKindToMonacoKind(monaco, it.kind),
          detail: it.detail,
          documentation: it.documentation
            ? { value: '```python\n' + it.documentation + '\n```' }
            : undefined,
          insertText: it.label,
          range,
        })),
      };
    },
  });

  monaco.languages.registerHoverProvider('python', {
    provideHover(model, position) {
      if (!state.intellisenseEnabled || !state.pyodide || !state.jediReady) return null;

      const word = model.getWordAtPosition(position);
      if (!word) return null;

      let items;
      try {
        items = callBridge(
          '__intellisense_hover',
          model.getValue(),
          position.lineNumber,
          position.column - 1
        );
      } catch (e) {
        return null;
      }
      if (!items.length || !items[0].documentation) return null;

      return {
        range: new monaco.Range(position.lineNumber, word.startColumn, position.lineNumber, word.endColumn),
        contents: [{ value: '```python\n' + items[0].documentation + '\n```' }],
      };
    },
  });

  monaco.languages.registerSignatureHelpProvider('python', {
    signatureHelpTriggerCharacters: ['(', ','],
    provideSignatureHelp(model, position) {
      if (!state.intellisenseEnabled || !state.pyodide || !state.jediReady) return null;

      let sigs;
      try {
        sigs = callBridge(
          '__intellisense_signatures',
          model.getValue(),
          position.lineNumber,
          position.column - 1
        );
      } catch (e) {
        return null;
      }
      if (!sigs.length) return null;

      return {
        value: {
          signatures: sigs.map((s) => ({
            label: s.label,
            documentation: s.documentation ? { value: '```python\n' + s.documentation + '\n```' } : undefined,
            parameters: s.params.map((p) => ({ label: p })),
          })),
          activeSignature: 0,
          activeParameter: Math.max(sigs[0].index, 0),
        },
        dispose() {},
      };
    },
  });
}
