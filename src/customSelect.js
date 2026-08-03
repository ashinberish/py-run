import { createElement, ChevronDown } from 'lucide';

// Wraps a plain <select> with a fully custom-styled trigger + popover menu,
// since a native <select>'s open state can't be styled to actually match the
// rest of the UI (rounded corners, shadow, hover states, animation — the
// browser owns that chrome). The original <select> stays in the DOM, hidden,
// as the source of truth: its `.value`/`.disabled` and its `change` event
// keep working exactly as before, so callers don't need to change.
export function enhanceSelect(select) {
  const wrapper = document.createElement('div');
  wrapper.className = 'customSelect';
  select.parentNode.insertBefore(wrapper, select);
  wrapper.appendChild(select);
  select.tabIndex = -1;
  select.classList.add('customSelect-native');

  const trigger = document.createElement('button');
  trigger.type = 'button';
  trigger.className = 'btn customSelectTrigger';
  const label = document.createElement('span');
  trigger.appendChild(label);
  trigger.appendChild(createElement(ChevronDown));
  wrapper.appendChild(trigger);

  const menu = document.createElement('div');
  menu.className = 'customSelectMenu';
  menu.setAttribute('role', 'listbox');
  wrapper.appendChild(menu);

  let options = [];

  function buildOptions() {
    menu.innerHTML = '';
    options = Array.from(select.options).map((opt) => {
      const item = document.createElement('div');
      item.className = 'customSelectOption';
      item.setAttribute('role', 'option');
      item.tabIndex = -1;
      item.dataset.value = opt.value;
      item.textContent = opt.textContent;
      item.addEventListener('click', () => {
        select.value = opt.value;
        select.dispatchEvent(new Event('change', { bubbles: true }));
        sync();
        closeMenu();
        trigger.focus();
      });
      menu.appendChild(item);
      return item;
    });
  }

  function sync() {
    const current = select.options[select.selectedIndex];
    label.textContent = current ? current.textContent : '';
    trigger.disabled = select.disabled;
    options.forEach((item) => {
      item.classList.toggle('selected', item.dataset.value === select.value);
    });
  }

  function setActive(index) {
    options.forEach((item) => item.classList.remove('active'));
    const clamped = Math.max(0, Math.min(options.length - 1, index));
    options[clamped]?.classList.add('active');
    options[clamped]?.scrollIntoView({ block: 'nearest' });
  }

  function openMenu() {
    if (trigger.disabled || menu.classList.contains('open')) return;
    menu.classList.add('open');
    setActive(options.findIndex((item) => item.classList.contains('selected')));
    document.addEventListener('click', onDocClick, true);
  }

  function closeMenu() {
    menu.classList.remove('open');
    document.removeEventListener('click', onDocClick, true);
  }

  function onDocClick(e) {
    if (!wrapper.contains(e.target)) closeMenu();
  }

  trigger.addEventListener('click', () => {
    if (menu.classList.contains('open')) closeMenu();
    else openMenu();
  });

  // Focus never actually moves into the menu (it's a plain popover, not a
  // native listbox), so all keyboard handling — open, navigate, and commit —
  // happens through the trigger, which keeps focus throughout.
  trigger.addEventListener('keydown', (e) => {
    if (!menu.classList.contains('open')) {
      if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openMenu();
      }
      return;
    }
    const activeIndex = options.findIndex((item) => item.classList.contains('active'));
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive(activeIndex + 1); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive(activeIndex - 1); }
    else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); options[activeIndex]?.click(); }
    else if (e.key === 'Escape') { e.preventDefault(); closeMenu(); }
  });

  buildOptions();
  sync();

  return { sync };
}
