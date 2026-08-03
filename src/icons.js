import { createIcons, Download, FilePlus, Copy, Trash2, SquareTerminal, Settings, X, ChevronDown } from 'lucide';

// Replaces every static <i data-lucide="..."> placeholder in the DOM with
// its inline SVG. Icons that are swapped dynamically at runtime (the Run
// button's Play/LoaderCircle, tab close buttons) are created directly via
// createElement() in ui.js/tabs.js instead.
export function initIcons() {
  createIcons({
    icons: { Download, FilePlus, Copy, Trash2, SquareTerminal, Settings, X, ChevronDown },
  });
}
