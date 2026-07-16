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
