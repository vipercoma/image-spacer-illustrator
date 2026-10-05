(function () {
  'use strict';
  var select = document.getElementById('mode');
  var track = document.createElement('div');
  track.className = 'rubber-segment';
  track.setAttribute('role', 'radiogroup');
  track.setAttribute('aria-label', 'Distribution');
  var thumb = document.createElement('span');
  thumb.className = 'rubber-segment__thumb';
  thumb.setAttribute('aria-hidden', 'true');
  track.appendChild(thumb);
  var labels = ['Grid', 'Spread', 'Wrap', 'Row', 'Column'];
  var buttons = [], drag = null, frame = 0, phase = 0;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  function duration(name, fallback) { var n = parseFloat(getComputedStyle(track).getPropertyValue(name)); return isFinite(n) ? n : fallback; }
  function selected() { return select.selectedIndex; }
  function bounds(i) { var b = buttons[i]; return { left: b.offsetLeft, width: b.offsetWidth }; }
  function paint(left, width) { thumb.style.left = left + 'px'; thumb.style.width = width + 'px'; }
  function sync(animate) {
    var i = selected(), target = bounds(i), old = { left: thumb.offsetLeft, width: thumb.offsetWidth };
    clearTimeout(phase); cancelAnimationFrame(frame);
    buttons.forEach(function (b, n) {
      b.disabled = select.disabled;
      b.setAttribute('aria-checked', n === i ? 'true' : 'false');
      b.tabIndex = n === i ? 0 : -1;
    });
    track.setAttribute('aria-disabled', String(select.disabled));
    if (animate && !reduce.matches) {
      var expand = duration('--vc-motion-expand', 150);
      thumb.style.transition = 'left ' + expand + 'ms cubic-bezier(.23,1,.32,1), width ' + expand + 'ms cubic-bezier(.23,1,.32,1)';
      paint(Math.min(old.left, target.left), Math.max(old.left + old.width, target.left + target.width) - Math.min(old.left, target.left));
      phase = setTimeout(function () {
        var land = duration('--vc-motion-land', 230);
        thumb.style.transition = 'left ' + land + 'ms cubic-bezier(.23,1,.32,1), width ' + land + 'ms cubic-bezier(.23,1,.32,1)';
        paint(target.left, target.width);
      }, duration('--vc-motion-handoff', 140));
    } else { thumb.style.transition = 'none'; paint(target.left, target.width); }
  }
  function choose(i, animated) {
    if (select.disabled) return;
    var oldLeft = thumb.offsetLeft, oldWidth = thumb.offsetWidth;
    if (i !== selected()) {
      select.selectedIndex = i;
      select.dispatchEvent(new Event('change', { bubbles: true }));
    }
    paint(oldLeft, oldWidth);
    sync(animated);
  }
  labels.forEach(function (label, i) {
    var b = document.createElement('button');
    b.type = 'button'; b.className = 'rubber-segment__item';
    b.textContent = label; b.title = select.options[i].text;
    b.setAttribute('role', 'radio');
    b.setAttribute('aria-label', select.options[i].text);
    b.addEventListener('click', function (e) {
      if (track.dataset.dragged === 'true') { e.preventDefault(); return; }
      choose(i, true);
    });
    b.addEventListener('keydown', function (e) {
      var next = selected();
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = Math.min(buttons.length - 1, next + 1);
      else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = Math.max(0, next - 1);
      else if (e.key === 'Home') next = 0;
      else if (e.key === 'End') next = buttons.length - 1;
      else return;
      e.preventDefault(); choose(next, false); buttons[next].focus();
    });
    buttons.push(b); track.appendChild(b);
  });
  select.parentNode.insertBefore(track, select);
  // Keep the original select as the panel's settings interface and fallback.
  select.hidden = true;
  document.querySelector('label[for="mode"]').removeAttribute('for');
  track.addEventListener('pointerdown', function (e) {
    track.dataset.dragged = 'false';
    if (select.disabled || e.button !== 0 || drag) return;
    var x = e.clientX - track.getBoundingClientRect().left;
    if (x < thumb.offsetLeft || x > thumb.offsetLeft + thumb.offsetWidth) return;
    clearTimeout(phase); thumb.style.transition = 'none';
    drag = { id: e.pointerId, x: e.clientX, left: thumb.offsetLeft, width: thumb.offsetWidth, lastX: e.clientX, time: e.timeStamp, velocity: 0, live: false, target: e.target };
    e.target.setPointerCapture(e.pointerId);
  });
  track.addEventListener('pointermove', function (e) {
    if (!drag || drag.id !== e.pointerId) return;
    var delta = e.clientX - drag.x;
    if (!drag.live && Math.abs(delta) < 4) return;
    drag.live = true; track.dataset.dragged = 'true'; track.dataset.held = 'true';
    var dt = e.timeStamp - drag.time;
    if (dt > 0) drag.velocity = (e.clientX - drag.lastX) / dt;
    drag.lastX = e.clientX; drag.time = e.timeStamp;
    paint(Math.max(3, Math.min(track.clientWidth - 3 - drag.width, drag.left + delta)), drag.width);
  });
  function finish(e, cancelled) {
    if (!drag || drag.id !== e.pointerId) return;
    var d = drag; drag = null; delete track.dataset.held;
    if (d.target.hasPointerCapture(e.pointerId)) d.target.releasePointerCapture(e.pointerId);
    if (d.live && !cancelled && !select.disabled) {
      var momentum = !reduce.matches && e.timeStamp - d.time < 100 ? Math.max(-80, Math.min(80, d.velocity * 75)) : 0;
      var center = thumb.offsetLeft + d.width / 2 + momentum;
      var best = 0, distance = Infinity;
      buttons.forEach(function (_, i) { var b = bounds(i), dist = Math.abs(b.left + b.width / 2 - center); if (dist < distance) { distance = dist; best = i; } });
      choose(best, true); buttons[best].focus();
    } else sync(false);
    // A synthetic click follows pointerup; suppress it only for this gesture.
    setTimeout(function () { track.dataset.dragged = 'false'; }, 0);
  }
  track.addEventListener('pointerup', function (e) { finish(e, false); });
  track.addEventListener('pointercancel', function (e) { finish(e, true); });
  track.addEventListener('lostpointercapture', function (e) { finish(e, true); });
  select.addEventListener('change', function () { sync(false); });
  new MutationObserver(function () { if (select.disabled && drag) { drag = null; delete track.dataset.held; } sync(false); }).observe(select, { attributes: true, attributeFilter: ['disabled'] });
  if (window.ResizeObserver) new ResizeObserver(function () { sync(false); }).observe(track);
  window.addEventListener('resize', function () { sync(false); });
  if (document.fonts) document.fonts.ready.then(function () { sync(false); });
  sync(false);
})();
