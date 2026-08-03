import { createIcons, Download, FilePlus, Copy, Trash2, Sparkles, SquareTerminal, Settings, X } from 'lucide';

// Replaces every static <i data-lucide="..."> placeholder in the DOM with
// its inline SVG. Icons that are swapped dynamically at runtime (the Run
// button's Play/LoaderCircle) are created directly in ui.js instead.
export function initIcons() {
  createIcons({
    icons: { Download, FilePlus, Copy, Trash2, Sparkles, SquareTerminal, Settings, X },
  });
}
