# py//run

A full Python interpreter running entirely in your browser tab — no server, no signup, no
install. Powered by [Pyodide](https://pyodide.org) (CPython compiled to WebAssembly) and the
[Monaco Editor](https://microsoft.github.io/monaco-editor/) (the editor behind VS Code).

Everything executes client-side. Your code never leaves the browser unless you choose to
`import micropip` and fetch a package.

## Features

- **Run Python in the browser** — press Run (or `Ctrl`/`Cmd`+`Enter`) to execute via Pyodide.
  `input()` is intercepted with a browser prompt.
- **Multiple files per session** — the `+ New` button creates a Python file by default; its
  dropdown (chevron) also offers a Markdown file for freeform notes. Python files can `import`
  each other as ordinary modules — Run executes the active file if it's Python, or falls back to
  `main.py` (e.g. when a notes tab is open), and editing a module picks up on the next run
  instead of using Python's cached import. `main.py` always exists and can't be closed; every
  other tab can be.
- **Selectable Python version** — pick between Python 3.11, 3.12, 3.13, or a pre-release 3.14
  build (Pyodide's rolling `dev` channel) from Settings. Switching versions reloads the page to
  boot a clean runtime — your files are preserved.
- **Optional IntelliSense** — a Settings toggle (off by default) that installs
  [jedi](https://github.com/davidhalter/jedi) *inside* the Pyodide runtime via `micropip`,
  giving real autocomplete, hover docs, and signature help based on the actual stdlib/packages
  and anything you've already defined by pressing Run — not just static text in the buffer.
- **Dark / light theme**, synced with Monaco's own editor theme.
- **Auto-saved session** — every file's content, plus which one was open, is saved to
  `localStorage` as you type and restored the next time you open the app. Nothing is sent to a
  server.
- **Download** — export the currently open file under its own name.

## Getting started

```bash
git clone https://github.com/ashinberish/py-run.git
cd py-run
npm install
npm run dev
```

Then open the printed local URL. Monaco and Pyodide load from public CDNs at runtime, so an
internet connection is required.

```bash
npm run build     # production build into dist/
npm run preview   # serve the production build locally
```

## How it works

- `index.html` / `src/main.js` wire up the static UI and event listeners.
- `src/editor.js` configures Monaco and kicks off the Pyodide boot.
- `src/tabs.js` owns the multi-file session: creating/closing files, the tab strip, switching
  Monaco models, and loading/persisting the whole file set (with migration from older
  single-file sessions).
- `src/runtime.js` dynamically loads the selected Pyodide version's script, boots the WASM
  runtime, wires up stdout/stderr/stdin, and — on Run — writes every Python file into Pyodide's
  filesystem so they can import each other as modules.
- `src/intellisense.js` bridges Monaco's completion/hover/signature-help providers to `jedi`
  running inside Pyodide.
- `src/persistence.js` handles `localStorage` for the saved files, Python version, and theme.

See [CONTRIBUTING.md](./CONTRIBUTING.md) for a fuller tour of the codebase.

## Contributing

Contributions are welcome — bug fixes, features, or just cleanup. This is a small, all
client-side project (no backend, no build secrets), so the barrier to entry is low. See
[CONTRIBUTING.md](./CONTRIBUTING.md) for how to get set up, the project layout, and what a good
pull request looks like.

## License

[MIT](./LICENSE)
