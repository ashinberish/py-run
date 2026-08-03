export const DEFAULT_CODE = `# Welcome to py//run — a full Python interpreter running right in this tab.
# No server, no signup. Edit code and press Run (or Ctrl/Cmd+Enter).
# Use input() for stdin — a browser prompt will appear.

def fibonacci(n):
    a, b = 0, 1
    for _ in range(n):
        yield a
        a, b = b, a + b

print("First 10 Fibonacci numbers:")
print(list(fibonacci(10)))

for i in range(3):
    print(f"Line {i}: hello from Pyodide 🐍")
`;

// Detect Mac vs Win/Linux for keyboard shortcut display
export const IS_MAC = (() => {
  const platform = (navigator.userAgentData?.platform ?? navigator.platform ?? '').toLowerCase();
  return platform.includes('mac');
})();

export const SHORTCUT_LABEL = IS_MAC ? '⌘↵' : '⌃↵';
export const SHORTCUT_TITLE = IS_MAC ? 'Cmd+Enter' : 'Ctrl+Enter';

// Pyodide releases, each bundling one specific CPython build. "dev" tracks
// Pyodide's rolling dev channel, which is how a pre-release/not-yet-cut
// CPython (currently 3.14) becomes selectable here.
export const PYTHON_VERSIONS = [
  { id: 'v0.25.1', label: 'Python 3.11', python: '3.11.3' },
  { id: 'v0.27.2', label: 'Python 3.12', python: '3.12.7' },
  { id: 'v0.29.3', label: 'Python 3.13', python: '3.13.2' },
  { id: 'dev', label: 'Python 3.14 (pre-release)', python: '3.14.0' },
];

export const DEFAULT_PYTHON_VERSION = 'v0.29.3';

export function pyodideBaseUrl(versionId) {
  return 'https://cdn.jsdelivr.net/pyodide/' + versionId + '/full/';
}

export function pyodideScriptUrl(versionId) {
  return pyodideBaseUrl(versionId) + 'pyodide.js';
}
