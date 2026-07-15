window.PyRun = window.PyRun || {};

PyRun.DEFAULT_CODE = `# Welcome to py//run — a full Python interpreter running right in this tab.
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
PyRun.IS_MAC = (() => {
  const platform = (navigator.userAgentData?.platform ?? navigator.platform ?? '').toLowerCase();
  return platform.includes('mac');
})();

PyRun.SHORTCUT_LABEL = PyRun.IS_MAC ? '⌘↵' : '⌃↵';
PyRun.SHORTCUT_TITLE = PyRun.IS_MAC ? 'Cmd+Enter' : 'Ctrl+Enter';
