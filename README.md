# py//run

A full Python interpreter running entirely in your browser tab — no server, no signup, no
install. Powered by [Pyodide](https://pyodide.org) (CPython compiled to WebAssembly) and the
[Monaco Editor](https://microsoft.github.io/monaco-editor/) (the editor behind VS Code).

Everything executes client-side. Your code never leaves the browser unless you choose to
`import micropip` and fetch a package.

## Features

- **Run Python in the browser** — press Run (or `Ctrl`/`Cmd`+`Enter`) to execute the current
  buffer via Pyodide. `input()` is intercepted with a browser prompt.
- **Selectable Python version** — pick between Python 3.11, 3.12, 3.13, or a pre-release 3.14
  build (Pyodide's rolling `dev` channel) from the topbar. Switching versions reloads the page
  to boot a clean runtime — your code is preserved.
- **Optional IntelliSense** — a topbar toggle (off by default) that installs
  [jedi](https://github.com/davidhalter/jedi) *inside* the Pyodide runtime via `micropip`,
  giving real autocomplete, hover docs, and signature help based on the actual stdlib/packages
  and anything you've already defined by pressing Run — not just static text in the buffer.
- **Auto-saved code** — your code is saved to `localStorage` as you type and restored the next
  time you open the app. Nothing is sent to a server.
- **Download / new file** — export the current buffer as `main.py`, or start a fresh file.

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
- `src/runtime.js` dynamically loads the selected Pyodide version's script, boots the WASM
  runtime, and wires up stdout/stderr/stdin.
- `src/intellisense.js` bridges Monaco's completion/hover/signature-help providers to `jedi`
  running inside Pyodide.
- `src/persistence.js` handles `localStorage` for the saved code and Python version choice.

See [CONTRIBUTING.md](./CONTRIBUTING.md) for a fuller tour of the codebase.

## Contributing

Contributions are welcome — bug fixes, features, or just cleanup. This is a small, all
client-side project (no backend, no build secrets), so the barrier to entry is low. See
[CONTRIBUTING.md](./CONTRIBUTING.md) for how to get set up, the project layout, and what a good
pull request looks like.

## License

[MIT](./LICENSE)
