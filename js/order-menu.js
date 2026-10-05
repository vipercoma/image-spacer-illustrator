(function () {
  'use strict';
  var select = document.getElementById('sort'), wrap = document.createElement('div');
  wrap.className = 'order-menu';
  var trigger = document.createElement('button'); trigger.type = 'button';
  trigger.className = 'order-menu__trigger'; trigger.id = 'order-trigger';
  trigger.setAttribute('aria-haspopup', 'listbox'); trigger.setAttribute('aria-controls', 'order-list');
  var label = document.createElement('span'), arrow = document.createElement('span');
  arrow.className = 'order-menu__chevron'; arrow.setAttribute('aria-hidden', 'true');
  trigger.appendChild(label); trigger.appendChild(arrow);
  var menu = document.createElement('div'); menu.className = 'order-menu__list'; menu.id = 'order-list';
  menu.setAttribute('role', 'listbox'); menu.setAttribute('aria-label', 'Image order'); menu.hidden = true;
  var items = [], opened = false;
  function close(focus) { opened = false; menu.hidden = true; trigger.setAttribute('aria-expanded', 'false'); if (focus) trigger.focus(); }
  function sync() {
    label.textContent = select.options[select.selectedIndex].text;
    trigger.disabled = select.disabled;
    items.forEach(function (b, i) { b.setAttribute('aria-selected', String(i === select.selectedIndex)); b.disabled = select.disabled; });
    if (select.disabled) close(false);
  }
  function open(index) {
    if (select.disabled) return;
    opened = true; menu.hidden = false; trigger.setAttribute('aria-expanded', 'true');
    items[index === undefined ? select.selectedIndex : index].focus();
  }
  function choose(i) {
    if (select.disabled) return;
    if (select.selectedIndex !== i) { select.selectedIndex = i; select.dispatchEvent(new Event('change', { bubbles: true })); }
    sync(); close(true);
  }
  Array.prototype.forEach.call(select.options, function (option, i) {
    var b = document.createElement('button'); b.type = 'button'; b.className = 'order-menu__option';
    b.setAttribute('role', 'option'); b.tabIndex = -1; b.textContent = option.text;
    b.addEventListener('click', function () { choose(i); });
    b.addEventListener('keydown', function (e) {
      var next = i;
      if (e.key === 'ArrowDown') next = (i + 1) % items.length;
      else if (e.key === 'ArrowUp') next = (i + items.length - 1) % items.length;
      else if (e.key === 'Home') next = 0;
      else if (e.key === 'End') next = items.length - 1;
      else if (e.key === 'Escape') { e.preventDefault(); close(true); return; }
      else return;
      e.preventDefault(); items[next].focus();
    });
    items.push(b); menu.appendChild(b);
  });
  wrap.appendChild(trigger); wrap.appendChild(menu); select.parentNode.insertBefore(wrap, select);
  select.hidden = true;
  document.querySelector('label[for="sort"]').setAttribute('for', trigger.id);
  trigger.addEventListener('click', function () { if (opened) close(false); else open(); });
  trigger.addEventListener('keydown', function (e) { if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); open(); } });
  document.addEventListener('pointerdown', function (e) { if (!wrap.contains(e.target)) close(false); });
  wrap.addEventListener('focusout', function (e) { if (!wrap.contains(e.relatedTarget)) close(false); });
  select.addEventListener('change', sync);
  new MutationObserver(sync).observe(select, { attributes: true, attributeFilter: ['disabled'] });
  close(false); sync();
})();
