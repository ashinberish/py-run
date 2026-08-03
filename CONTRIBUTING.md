# Contributing to py//run

Thanks for considering a contribution! py//run is a small, all-client-side project, so the
bar to get started is low — no backend, no database, no build secrets.

## Getting set up

```bash
git clone https://github.com/ashinberish/py-run.git
cd py-run
npm install
npm run dev
```

This starts a Vite dev server (prints a local URL). Monaco and Pyodide are loaded from public
CDNs at runtime, so an internet connection is required even in dev.

Other scripts:

```bash
npm run build     # production build into dist/
npm run preview   # serve the production build locally
```

## Project layout

```
index.html         entry HTML — topbar, panes, and the CDN <script> tags
src/main.js         wires up DOM event listeners, boots the editor
src/editor.js        Monaco setup, editor options, autosave wiring
src/runtime.js       Pyodide boot/reboot, running code, stdout/stderr/stdin
src/intellisense.js  jedi-in-Pyodide bridge for completion/hover/signature help
src/persistence.js   localStorage helpers (saved code, saved Python version)
src/state.js         shared mutable app state
src/ui.js            small DOM helpers (status bar, buttons, output lines)
src/icons.js         Lucide icon registration
src/constants.js     default code, keyboard shortcuts, Python version list
src/style.css        all styling
```

## Making a change

1. Fork the repo and create a branch off `main`.
2. Make your change. Keep it focused — small, single-purpose PRs are much easier to review
   than ones that mix a bug fix with a refactor.
3. Run `npm run build` and confirm it succeeds.
4. If you touched the editor, runtime boot, or IntelliSense, please actually click through the
   app in a browser (`npm run dev`) rather than relying on the build alone — most of the
   interesting bugs here only show up at runtime (Pyodide boot failures, Monaco provider
   wiring, etc.).
5. Open a pull request describing what changed and why. Screenshots or a short clip are
   appreciated for UI changes.

## Style

- No build-time transpilation beyond what Vite does by default — plain modern JS (ES modules),
  no TypeScript, no framework.
- Match the existing code's conventions (2-space indent, `function` expressions in event
  handlers, etc.) rather than introducing a new style in one file.
- Prefer small, readable functions over clever one-liners.
- Don't add a dependency for something a few lines of vanilla JS can do.

## Reporting bugs / suggesting features

Open a GitHub issue. For bugs, include: what you expected, what happened instead, and your
browser. For features, a short description of the use case is more useful than a full spec —
happy to iterate in the issue thread.

## Code of conduct

Be respectful and constructive. Disagreements about code are fine; personal attacks aren't.
