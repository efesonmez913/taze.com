/* AKOL EMLAK GAYRİMENKUL · site betiği v2 (bağımlılıksız) */
(function () {
  'use strict';

  var doc = document;
  var root = doc.documentElement;
  var body = doc.body;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  function $(sel, ctx) { return (ctx || doc).querySelector(sel); }
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || doc).querySelectorAll(sel)); }

  /* ------------------------------------------------ başlık: kaydırma durumu */
  var header = $('[data-header]');
  function onScroll() {
    if (!header) return;
    body.classList.toggle('is-scrolled', window.scrollY > 12);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ------------------------------------------------------------ mobil menü */
  var burger = $('.burger');
  var menu = $('[data-menu]');
  function setMenu(open) {
    if (!menu || !burger) return;
    body.classList.toggle('menu-open', open);
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    burger.setAttribute('aria-label', open ? 'Menüyü kapat' : 'Menüyü aç');
    if (open) {
      menu.removeAttribute('inert');
      body.style.overflow = 'hidden';
      var first = $('a', menu);
      if (first) setTimeout(function () { first.focus({ preventScroll: true }); }, 350);
    } else {
      menu.setAttribute('inert', '');
      body.style.overflow = '';
    }
  }
  if (burger && menu) {
    burger.addEventListener('click', function () { setMenu(!body.classList.contains('menu-open')); });
    $$('a', menu).forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
    doc.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && body.classList.contains('menu-open')) { setMenu(false); burger.focus(); }
    });
    window.addEventListener('resize', function () {
      if (window.innerWidth > 1100 && body.classList.contains('menu-open')) setMenu(false);
    });
  }
  /* geri tuşuyla önbellekten dönülürse menü kapalı başlasın */
  window.addEventListener('pageshow', function () { setMenu(false); onScroll(); });

  /* ------------------------------------------------------ yıl (alt bilgi) */
  $$('[data-year]').forEach(function (el) { el.textContent = String(new Date().getFullYear()); });

  /* ---------------------------------------------- fotoğraf yoksa kepenk görünümü */
  function markEmpty(img) {
    var fig = img.closest('.photo');
    if (fig) fig.classList.add('is-empty');
  }
  $$('.photo img').forEach(function (img) {
    if (img.complete && img.naturalWidth === 0 && img.getAttribute('src')) { markEmpty(img); return; }
    img.addEventListener('error', function () { markEmpty(img); }, { once: true });
  });
  $$('img[data-hide-on-error]').forEach(function (img) {
    function hide() { img.style.display = 'none'; }
    if (img.complete && img.naturalWidth === 0) hide();
    else img.addEventListener('error', hide, { once: true });
  });

  /* -------------------- açık/kapalı rozeti: her gün 09:00–20:30 (Türkiye saati) */
  function istanbulMinutes() {
    try {
      var parts = new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Europe/Istanbul', hour: '2-digit', minute: '2-digit', hourCycle: 'h23'
      }).formatToParts(new Date());
      var h = 0, m = 0;
      parts.forEach(function (p) {
        if (p.type === 'hour') h = parseInt(p.value, 10) % 24;
        if (p.type === 'minute') m = parseInt(p.value, 10);
      });
      return h * 60 + m;
    } catch (e) {
      var d = new Date();
      return d.getHours() * 60 + d.getMinutes();
    }
  }
  function paintBadges() {
    var mins = istanbulMinutes();
    var OPEN = 9 * 60, CLOSE = 20 * 60 + 30;
    var isOpen = mins >= OPEN && mins < CLOSE;
    var text = isOpen ? 'Şu an açığız · 20:30’a kadar'
      : (mins < OPEN ? 'Şu an kapalıyız · 09:00’da açılıyoruz' : 'Şu an kapalıyız · yarın 09:00’da açığız');
    $$('[data-open-badge]').forEach(function (el) {
      el.classList.add('open-badge');
      el.classList.toggle('is-closed', !isOpen);
      el.textContent = text;
    });
  }
  paintBadges();
  setInterval(paintBadges, 60 * 1000);

  /* --------------------------- kaydırma animasyonu (desteklemeyen tarayıcılar) */
  if (root.classList.contains('no-sda') && 'IntersectionObserver' in window && !reduceMotion.matches) {
    var pending = $$('[data-rise], .photo[data-shutter], .steps');
    var vh = window.innerHeight || 800;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.remove('is-pending'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.08 });
    pending.forEach(function (el) {
      /* yüklenişte görünen hiçbir şey gizlenmez; yalnızca ekranın altındakiler bekler */
      if (el.getBoundingClientRect().top > vh * 0.9) { el.classList.add('is-pending'); io.observe(el); }
    });
    window.addEventListener('beforeprint', function () {
      pending.forEach(function (el) { el.classList.remove('is-pending'); });
    });
  }

  /* ================================================================= LED pano
     Metni gizli bir tuvale yazar, 1 LED = 1 hücre olacak şekilde örnekler,
     sonra noktaları sütun sütun kaydırır (gerçek LED panolar gibi adım adım). */
  function LedSign(canvas) {
    var text = (canvas.getAttribute('data-led') || '').trim();
    if (!text || !canvas.getContext) return;
    var ctx = canvas.getContext('2d');
    var ROWS = 13, GAP = 26, STEP_MS = 34;
    var bitmap = null, bmCols = 0, period = 1;
    var dpr = 1, pitch = 4, cols = 0, W = 0, H = 0;
    var offGrid = null, litDot = null;
    var offset = 0, lastStep = 0, bootAt = 0, raf = 0, visible = false, built = false;

    function build() {
      var S = 8;
      var g = doc.createElement('canvas').getContext('2d', { willReadFrequently: true });
      var family = '"Archivo", "Arial Black", Arial, sans-serif';
      g.font = '800 100px ' + family;
      var capH = g.measureText('H').actualBoundingBoxAscent || 72;
      var fontPx = Math.round((7 * S) / (capH / 100));
      var font = '800 ' + fontPx + 'px ' + family;
      g.font = font;
      var chars = Array.from(text);
      var adv = chars.map(function (ch) {
        if (ch === ' ') return 3;
        return Math.max(1, Math.round(g.measureText(ch).width / S));
      });
      var total = adv.reduce(function (a, b) { return a + b + 1; }, 0);
      var c = g.canvas;
      c.width = total * S;
      c.height = ROWS * S;
      g.font = font;
      g.fillStyle = '#fff';
      g.textBaseline = 'alphabetic';
      var x = 0, baseY = 10 * S;
      chars.forEach(function (ch, i) {
        if (ch !== ' ') g.fillText(ch, x * S, baseY);
        x += adv[i] + 1;
      });
      var data = g.getImageData(0, 0, c.width, c.height).data;
      var rowLen = c.width * 4;
      bitmap = new Uint8Array(total * ROWS);
      for (var r = 0; r < ROWS; r++) {
        for (var col = 0; col < total; col++) {
          var sum = 0;
          for (var yy = 0; yy < S; yy++) {
            var base = (r * S + yy) * rowLen + col * S * 4 + 3;
            for (var xx = 0; xx < S; xx++) sum += data[base + xx * 4];
          }
          bitmap[r * total + col] = sum / (S * S * 255) > 0.36 ? 1 : 0;
        }
      }
      bmCols = total;
      period = total + GAP;
      built = true;
    }

    function resize() {
      var rect = canvas.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = rect.width; H = rect.height;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      pitch = H / (ROWS + 1);
      cols = Math.ceil(W / pitch) + 1;

      offGrid = doc.createElement('canvas');
      offGrid.width = canvas.width; offGrid.height = canvas.height;
      var og = offGrid.getContext('2d');
      og.fillStyle = '#2a1312';
      var rOff = Math.max(0.6, pitch * 0.3 * dpr);
      for (var cc = 0; cc < cols; cc++) {
        for (var rr = 0; rr < ROWS; rr++) {
          og.beginPath();
          og.arc((cc + 0.5) * pitch * dpr, (rr + 1) * pitch * dpr, rOff, 0, Math.PI * 2);
          og.fill();
        }
      }
      var size = Math.ceil(pitch * dpr * 2.4);
      litDot = doc.createElement('canvas');
      litDot.width = litDot.height = size;
      var lg = litDot.getContext('2d');
      var h = size / 2;
      var grad = lg.createRadialGradient(h, h, 0, h, h, h);
      grad.addColorStop(0, 'rgba(255,214,190,1)');
      grad.addColorStop(0.16, 'rgba(255,92,64,1)');
      grad.addColorStop(0.3, 'rgba(244,44,32,0.95)');
      grad.addColorStop(0.48, 'rgba(232,30,24,0.28)');
      grad.addColorStop(1, 'rgba(232,30,24,0)');
      lg.fillStyle = grad;
      lg.fillRect(0, 0, size, size);
      draw(performance.now());
    }

    function draw(now) {
      if (!offGrid || !built) return;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(offGrid, 0, 0);
      var s = litDot.width, half = s / 2;
      var boot = bootAt ? (now - bootAt) / 900 : 1;
      if (boot < 1) {
        /* açılış: rastgele yanıp sönen noktalar, sonra yazı */
        var p = 0.22 * (1 - boot);
        for (var c0 = 0; c0 < cols; c0++) {
          for (var r0 = 0; r0 < ROWS; r0++) {
            if (Math.random() < p) ctx.drawImage(litDot, (c0 + 0.5) * pitch * dpr - half, (r0 + 1) * pitch * dpr - half);
          }
        }
        if (boot < 0.45) return;
      }
      for (var c = 0; c < cols; c++) {
        var src = ((offset + c) % period + period) % period;
        if (src >= bmCols) continue;
        var cx = (c + 0.5) * pitch * dpr - half;
        for (var r = 0; r < ROWS; r++) {
          if (bitmap[r * bmCols + src]) ctx.drawImage(litDot, cx, (r + 1) * pitch * dpr - half);
        }
      }
    }

    function loop(now) {
      if (!visible) { raf = 0; return; }
      if (!lastStep) lastStep = now;
      var steps = Math.floor((now - lastStep) / STEP_MS);
      if (steps > 0) {
        offset = (offset + steps) % period;
        lastStep += steps * STEP_MS;
      }
      /* yalnızca yazı kaydığında ya da açılış sırasında yeniden çiz (pil dostu) */
      if (steps > 0 || (bootAt && now - bootAt < 950)) draw(now);
      raf = requestAnimationFrame(loop);
    }

    function start() {
      if (reduceMotion.matches) { offset = 0; draw(performance.now()); return; }
      if (!raf && visible) { lastStep = 0; raf = requestAnimationFrame(loop); }
    }

    function init() {
      build();
      if (!reduceMotion.matches) bootAt = performance.now();
      resize();
      /* hareket açıksa yazı sağ kenardan girsin; azaltılmış harekette baştan sabit dursun */
      offset = reduceMotion.matches ? 0 : ((period - cols + 2) % period + period) % period;
      draw(performance.now());
      if ('IntersectionObserver' in window) {
        new IntersectionObserver(function (en) {
          visible = en[0].isIntersecting;
          if (visible) start();
        }).observe(canvas);
      } else { visible = true; start(); }
      if ('ResizeObserver' in window) {
        var t = 0;
        new ResizeObserver(function () { clearTimeout(t); t = setTimeout(resize, 80); }).observe(canvas);
      } else {
        window.addEventListener('resize', resize);
      }
      reduceMotion.addEventListener && reduceMotion.addEventListener('change', function () {
        bootAt = 0;
        if (reduceMotion.matches) { cancelAnimationFrame(raf); raf = 0; offset = 0; draw(performance.now()); }
        else start();
      });
    }

    var fontReady = doc.fonts && doc.fonts.load ? doc.fonts.load('800 80px "Archivo"') : Promise.resolve();
    var timeout = new Promise(function (res) { setTimeout(res, 1800); });
    Promise.race([fontReady, timeout]).then(init, init);
  }
  $$('canvas[data-led]').forEach(function (c) { LedSign(c); });

  /* ======================================================= ofis fotoğraf galerisi */
  var gal = $('[data-gallery]');
  if (gal) {
    var section = gal.closest('[data-gallery-section]');
    var track = $('.gallery__track', gal);
    var items = $$('.gallery__item', gal);
    var left = items.length;
    var cur = $('[data-gal-cur]', gal), tot = $('[data-gal-total]', gal);
    var prev = $('[data-gal-prev]', gal), next = $('[data-gal-next]', gal);

    function finalize() {
      var alive = $$('.gallery__item', gal);
      if (!alive.length) { if (section) section.hidden = true; return; }
      if (section) section.hidden = false;
      gal.setAttribute('data-count', String(alive.length));
      if (tot) tot.textContent = String(alive.length);
      updateNav();
    }
    function settle() { left -= 1; if (left === 0) finalize(); }

    var probe = function () {
      items.forEach(function (it) {
        var img = $('img', it);
        var src = img && img.getAttribute('data-src');
        if (!src) { it.remove(); settle(); return; }
        var test = new Image();
        test.onload = function () { img.src = src; settle(); };
        test.onerror = function () { it.remove(); settle(); };
        test.src = src;
      });
    };
    if (doc.readyState === 'complete') probe(); else window.addEventListener('load', probe, { once: true });

    function step() {
      var first = $('.gallery__item', gal);
      return first ? first.getBoundingClientRect().width + parseFloat(getComputedStyle(track).columnGap || 16) : 300;
    }
    function updateNav() {
      var alive = $$('.gallery__item', gal);
      if (!alive.length) return;
      var idx = Math.round(track.scrollLeft / step());
      if (cur) cur.textContent = String(Math.min(alive.length, idx + 1));
      if (prev) prev.disabled = track.scrollLeft < 8;
      if (next) next.disabled = track.scrollLeft + track.clientWidth >= track.scrollWidth - 8;
    }
    if (prev) prev.addEventListener('click', function () { track.scrollBy({ left: -step(), behavior: reduceMotion.matches ? 'auto' : 'smooth' }); });
    if (next) next.addEventListener('click', function () { track.scrollBy({ left: step(), behavior: reduceMotion.matches ? 'auto' : 'smooth' }); });
    track.addEventListener('scroll', function () { window.requestAnimationFrame(updateNav); }, { passive: true });

    /* fareyle sürükleyerek kaydırma */
    var dragX = 0, dragLeft = 0, dragging = false, moved = false;
    track.addEventListener('pointerdown', function (e) {
      if (e.pointerType !== 'mouse') return;
      dragging = true; moved = false; dragX = e.clientX; dragLeft = track.scrollLeft;
    });
    window.addEventListener('pointermove', function (e) {
      if (!dragging) return;
      var dx = e.clientX - dragX;
      if (Math.abs(dx) > 4) { moved = true; track.classList.add('is-drag'); }
      track.scrollLeft = dragLeft - dx;
    });
    window.addEventListener('pointerup', function () {
      if (!dragging) return;
      dragging = false;
      track.classList.remove('is-drag');
    });
    track.addEventListener('click', function (e) {
      if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; }
    }, true);

    /* büyük görüntüleyici */
    var lb = $('[data-lightbox]');
    if (lb && typeof lb.showModal === 'function') {
      var lbImg = $('[data-lb-img]', lb), lbCount = $('[data-lb-count]', lb);
      var lbIndex = 0;
      function lbItems() { return $$('.gallery__item img', gal).filter(function (i) { return i.getAttribute('src') === i.getAttribute('data-src'); }); }
      function lbShow(i) {
        var list = lbItems();
        if (!list.length) return;
        lbIndex = (i + list.length) % list.length;
        lbImg.src = list[lbIndex].getAttribute('src');
        lbImg.alt = list[lbIndex].alt;
        if (lbCount) lbCount.textContent = (lbIndex + 1) + ' / ' + list.length;
        lb.toggleAttribute('data-single', list.length < 2);
      }
      $$('.gallery__open', gal).forEach(function (btn) {
        btn.addEventListener('click', function () {
          var img = $('img', btn);
          var idx = lbItems().indexOf(img);
          if (idx < 0) return;
          lbShow(idx);
          lb.showModal();
        });
      });
      $('[data-lb-close]', lb).addEventListener('click', function () { lb.close(); });
      $('[data-lb-prev]', lb).addEventListener('click', function () { lbShow(lbIndex - 1); });
      $('[data-lb-next]', lb).addEventListener('click', function () { lbShow(lbIndex + 1); });
      lb.addEventListener('click', function (e) { if (e.target === lb) lb.close(); });
      lb.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowLeft') lbShow(lbIndex - 1);
        if (e.key === 'ArrowRight') lbShow(lbIndex + 1);
      });
    }
  }

  /* ============================================== bölge rehberi: harita seçici */
  var mapFrame = $('[data-map]');
  var mapCaption = $('[data-map-caption]');
  var mapTabs = $$('[data-map-q]');
  function mapSrc(q, z) {
    return 'https://maps.google.com/maps?q=' + encodeURIComponent(q) + '&z=' + (z || 15) + '&hl=tr&output=embed';
  }
  function showOnMap(q, z, label, scroll) {
    if (!mapFrame) return;
    mapFrame.src = mapSrc(q, z);
    mapTabs.forEach(function (t) { t.setAttribute('aria-pressed', t.getAttribute('data-map-q') === q ? 'true' : 'false'); });
    if (mapCaption && label) mapCaption.textContent = label;
    if (scroll) {
      var r = mapFrame.getBoundingClientRect();
      if (r.top < 70 || r.bottom > window.innerHeight) {
        mapFrame.closest('.map').scrollIntoView({ behavior: reduceMotion.matches ? 'auto' : 'smooth', block: 'center' });
      }
    }
  }
  mapTabs.forEach(function (t) {
    t.addEventListener('click', function () {
      showOnMap(t.getAttribute('data-map-q'), t.getAttribute('data-map-z'), t.getAttribute('data-map-label') || t.textContent.trim(), false);
    });
  });
  $$('[data-map-jump]').forEach(function (b) {
    b.addEventListener('click', function () {
      var q = b.getAttribute('data-map-jump');
      var tab = mapTabs.filter(function (t) { return t.getAttribute('data-map-q') === q; })[0];
      showOnMap(q, tab ? tab.getAttribute('data-map-z') : 15, tab ? (tab.getAttribute('data-map-label') || tab.textContent.trim()) : q, true);
    });
  });

  /* ============================================== WhatsApp talep formu */
  var wiz = $('[data-wizard]');
  if (wiz) {
    var WA = '905536090863';
    var preview = $('[data-wizard-preview]', wiz);
    var fMahalle = wiz.elements.mahalle, fButce = wiz.elements.butce, fNot = wiz.elements.not;

    function checked(name) {
      var el = $('input[name="' + name + '"]:checked', wiz);
      return el ? el.value : '';
    }
    function message() {
      var lines = ['Merhaba Akol Emlak,', ''];
      lines.push('İşlem: ' + checked('islem'));
      lines.push('Mülk tipi: ' + checked('tip'));
      if (fMahalle && fMahalle.value) lines.push('Bölge: ' + fMahalle.value);
      if (fButce && fButce.value.trim()) lines.push('Bütçe: ' + fButce.value.trim());
      if (fNot && fNot.value.trim()) lines.push('Not: ' + fNot.value.trim());
      lines.push('');
      lines.push('Web sitenizden yazıyorum. Müsait olduğunuzda dönüş yapar mısınız?');
      return lines.join('\n');
    }
    var waUrl = 'https://wa.me/' + WA;
    function refresh() {
      var msg = message();
      if (preview) preview.textContent = msg;
      waUrl = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(msg);
    }

    /* adres çubuğundan ön seçim: iletisim.html?islem=satilik&tip=daire&mahalle=menderes#talep */
    var q = {};
    location.search.replace(/^\?/, '').split('&').forEach(function (pair) {
      if (!pair) return;
      var kv = pair.split('=');
      try { q[decodeURIComponent(kv[0])] = decodeURIComponent((kv[1] || '').replace(/\+/g, ' ')); } catch (e) { /* yoksay */ }
    });
    ['islem', 'tip'].forEach(function (name) {
      if (!q[name]) return;
      var el = $('input[name="' + name + '"][data-key="' + q[name] + '"]', wiz);
      if (el) el.checked = true;
    });
    if (q.mahalle && fMahalle) {
      var opt = $('option[data-key="' + q.mahalle + '"]', fMahalle);
      if (opt) fMahalle.value = opt.value;
    }

    wiz.addEventListener('input', refresh);
    wiz.addEventListener('change', refresh);
    /* JS yoksa form wa.me sohbetini açar; JS varsa hazır mesajla açar */
    wiz.addEventListener('submit', function (e) {
      e.preventDefault();
      refresh();
      var win = window.open(waUrl, '_blank');
      if (win) { try { win.opener = null; } catch (err) { /* yoksay */ } }
      else { window.location.href = waUrl; }
    });
    refresh();
  }
})();
