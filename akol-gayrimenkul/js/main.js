/* AKOL EMLAK — ortak site betiği (bağımlılıksız) */
(function () {
  'use strict';

  /* ---------- mobil menü ---------- */
  var burger = document.querySelector('.burger');
  var body = document.body;
  if (burger) {
    burger.addEventListener('click', function () {
      body.classList.toggle('menu-open');
      burger.setAttribute('aria-expanded', body.classList.contains('menu-open') ? 'true' : 'false');
    });
    document.querySelectorAll('.mobile-menu a').forEach(function (a) {
      a.addEventListener('click', function () { body.classList.remove('menu-open'); });
    });
  }

  /* ---------- reveal: IO + scroll fallback + emniyet zamanlayıcısı ---------- */
  var reveals = Array.prototype.slice.call(document.querySelectorAll('.reveal'));
  function showAll() { reveals.forEach(function (el) { el.classList.add('in'); }); }
  if (reveals.length) {
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
        });
      }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
      reveals.forEach(function (el) { io.observe(el); });
    }
    function rectCheck() {
      var vh = window.innerHeight || 800;
      reveals.forEach(function (el) {
        if (el.classList.contains('in')) return;
        var r = el.getBoundingClientRect();
        if (r.top < vh * 0.95 && r.bottom > 0) el.classList.add('in');
      });
    }
    window.addEventListener('scroll', rectCheck, { passive: true });
    window.addEventListener('load', rectCheck);
    rectCheck();
    setTimeout(showAll, 2600); /* IO/scroll hiç ateşlenmezse içerik asla gizli kalmasın */
  }

  /* ---------- açık/kapalı rozeti (her gün 09:00–20:30, TSİ) ---------- */
  document.querySelectorAll('[data-open-badge]').forEach(function (el) {
    var now;
    try {
      now = new Date(new Date().toLocaleString('en-US', { timeZone: 'Europe/Istanbul' }));
    } catch (e) { now = new Date(); }
    var mins = now.getHours() * 60 + now.getMinutes();
    var open = mins >= 9 * 60 && mins < 20 * 60 + 30;
    el.classList.toggle('closed', !open);
    var label = el.querySelector('[data-open-label]');
    if (label) {
      label.textContent = open
        ? 'Şu an açığız · bugün 20:30’a kadar'
        : 'Şu an kapalıyız · her gün 09:00–20:30';
    }
  });

  /* ---------- aktif nav vurgusu ---------- */
  var here = (location.pathname.split('/').pop() || 'index.html').replace('.html', '') || 'index';
  document.querySelectorAll('[data-nav]').forEach(function (a) {
    if (a.getAttribute('data-nav') === here) a.classList.add('active');
  });

  /* ---------- portföy filtresi ---------- */
  var grid = document.querySelector('[data-listing-grid]');
  if (grid) {
    var cards = Array.prototype.slice.call(grid.querySelectorAll('.listing-card'));
    var chips = Array.prototype.slice.call(document.querySelectorAll('.filterbar .chip'));
    var search = document.querySelector('[data-listing-search]');
    var empty = document.querySelector('.filter-empty');
    var activeCat = 'hepsi';

    function normalize(s) {
      return (s || '').toLocaleLowerCase('tr-TR');
    }
    function apply() {
      var q = normalize(search ? search.value.trim() : '');
      var visible = 0;
      cards.forEach(function (c) {
        var okCat = activeCat === 'hepsi' || (c.getAttribute('data-cat') || '').split(' ').indexOf(activeCat) !== -1;
        var okQ = !q || normalize(c.textContent).indexOf(q) !== -1;
        var show = okCat && okQ;
        c.style.display = show ? '' : 'none';
        if (show) visible++;
      });
      if (empty) empty.style.display = visible ? 'none' : 'block';
    }
    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        chips.forEach(function (c) { c.classList.remove('on'); });
        chip.classList.add('on');
        activeCat = chip.getAttribute('data-cat');
        apply();
      });
    });
    if (search) search.addEventListener('input', apply);
    /* URL parametresiyle ön filtre: portfoy.html?f=arsa */
    var m = location.search.match(/[?&]f=([a-z-]+)/);
    if (m) {
      var target = chips.filter(function (c) { return c.getAttribute('data-cat') === m[1]; })[0];
      if (target) target.click();
    }
  }

  /* ---------- WhatsApp talep sihirbazı ---------- */
  var wizard = document.querySelector('[data-wizard]');
  if (wizard) {
    var state = { islem: 'Satılık arıyorum', tip: 'Daire', mahalle: '' };
    var note = wizard.querySelector('textarea');
    var mahalleSel = wizard.querySelector('select');
    var preview = wizard.querySelector('.wizard__preview');
    var waBtn = wizard.querySelector('[data-wizard-send]');

    function buildMsg() {
      var lines = ['Merhaba Akol Emlak,', ''];
      lines.push('İşlem: ' + state.islem);
      lines.push('Mülk tipi: ' + state.tip);
      if (mahalleSel && mahalleSel.value) lines.push('Bölge: ' + mahalleSel.value);
      if (note && note.value.trim()) lines.push('Not: ' + note.value.trim());
      lines.push('');
      lines.push('Web sitenizden yazıyorum, müsait olduğunuzda dönüş yapar mısınız?');
      return lines.join('\n');
    }
    function refresh() {
      var msg = buildMsg();
      if (preview) preview.textContent = msg;
      if (waBtn) waBtn.href = 'https://wa.me/905536090863?text=' + encodeURIComponent(msg);
    }
    wizard.querySelectorAll('.opts').forEach(function (group) {
      var key = group.getAttribute('data-key');
      group.querySelectorAll('.opt').forEach(function (opt) {
        opt.addEventListener('click', function () {
          group.querySelectorAll('.opt').forEach(function (o) { o.classList.remove('on'); });
          opt.classList.add('on');
          state[key] = opt.textContent.trim();
          refresh();
        });
      });
    });
    if (note) note.addEventListener('input', refresh);
    if (mahalleSel) mahalleSel.addEventListener('change', refresh);
    refresh();
  }
})();
