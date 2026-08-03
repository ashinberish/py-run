# py//run

A full Python interpreter running entirely in your browser tab — no server, no signup, no
install. Powered by [Pyodide](https://pyodide.org) (CPython compiled to WebAssembly) and the
[Monaco Editor](https://microsoft.github.io/monaco-editor/) (the editor behind VS Code).

Everything executes client-side. Your code never leaves the browser unless you choose to
`import micropip` and fetch a package.

## Features

- **Run Python in the browser** — press Run (or `Ctrl`/`Cmd`+`Enter`) to execute via Pyodide.
  `input()` is intercepted with a browser prompt.
- **Multiple files per session** — the `+ New` button creates a Python file by default and
  immediately lets you rename it in place; its dropdown (chevron) also offers a Markdown file for
  freeform notes (double-click any tab to rename it later too). A fresh session opens with both
  `main.py` and a starter `notes.md`. Python files can `import` each other as ordinary modules —
  Run executes the active file if it's Python, or falls back to `main.py` (e.g. when a notes tab
  is open). Editing a module picks up on the next run instead of using Python's cached import,
  and closing a file that's still `import`-ed elsewhere correctly raises `ModuleNotFoundError` on
  the next run rather than silently keeping the stale cached module. `main.py` always exists and
  can't be closed or renamed; every other tab can be.
- **Selectable Python version** — pick between Python 3.11, 3.12, 3.13, or a pre-release 3.14
  build (Pyodide's rolling `dev` channel) from Settings. Switching versions reloads the page to
  boot a clean runtime — your files are preserved.
- **Optional IntelliSense** — a Settings toggle (off by default) that installs
  [jedi](https://github.com/davidhalter/jedi) *inside* the Pyodide runtime via `micropip`,
  giving real autocomplete, hover docs, and signature help based on the actual stdlib/packages,
  anything you've already defined by pressing Run, and user-defined functions/classes in *other*
  files in the session (resolved statically — the other file doesn't need to have been run) —
  not just static text in the current buffer.
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
- `src/pyfs.js` writes the session's Python files into Pyodide's filesystem and extends
  `sys.path` to include them — shared by both `runtime.js` (before Run) and `intellisense.js`
  (before every completion/hover/signature request, so cross-file IntelliSense doesn't require
  having run the other file first).
- `src/runtime.js` dynamically loads the selected Pyodide version's script, boots the WASM
  runtime, wires up stdout/stderr/stdin, and — on Run — syncs files via `pyfs.js` and invalidates
  `sys.modules` for anything besides the file being run (so edits, and files that got closed,
  aren't served from Python's import cache).
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
