/* davidecaniatti.com - JS leggero: menu, lightbox, slideshow, cookie/Analytics. Nessuna libreria. */
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var cfg = window.SITE || {};

  /* ---- menu da telefono ---- */
  var tg = $('.nav-toggle'), nav = $('#site-nav');
  if (tg && nav) {
    tg.addEventListener('click', function () {
      var o = nav.classList.toggle('open');
      tg.setAttribute('aria-expanded', o ? 'true' : 'false');
    });
  }

  /* ---- immagini che non si caricano (quelle gia' rotte sul vecchio sito) ---- */
  function markBroken(img) { img.classList.add('broken'); }
  $$('img').forEach(function (img) {
    if (img.complete && img.naturalWidth === 0 && img.getAttribute('src')) markBroken(img);
    img.addEventListener('error', function () { markBroken(img); });
  });

  /* ---- lightbox a schermo intero ---- */
  var box, boxImg, boxCount, list = [], idx = 0, touchX = null;
  function build() {
    box = document.createElement('div');
    box.className = 'lightbox';
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-modal', 'true');
    box.innerHTML = '<button class="lb-close" aria-label="Close">&times;</button><button class="lb-prev" aria-label="Previous">&#8249;</button><img alt=""><button class="lb-next" aria-label="Next">&#8250;</button><div class="lb-count"></div>';
    document.body.appendChild(box);
    boxImg = $('img', box); boxCount = $('.lb-count', box);
    $('.lb-close', box).addEventListener('click', close);
    $('.lb-prev', box).addEventListener('click', function () { show(idx - 1); });
    $('.lb-next', box).addEventListener('click', function () { show(idx + 1); });
    box.addEventListener('click', function (e) { if (e.target === box) close(); });
    box.addEventListener('touchstart', function (e) { touchX = e.touches[0].clientX; }, { passive: true });
    box.addEventListener('touchend', function (e) {
      if (touchX === null) return;
      var dx = e.changedTouches[0].clientX - touchX; touchX = null;
      if (Math.abs(dx) > 50) show(idx + (dx < 0 ? 1 : -1));
    });
  }
  function show(i) {
    idx = (i + list.length) % list.length;
    boxImg.src = list[idx].href;
    boxImg.alt = list[idx].getAttribute('data-alt') || '';
    boxCount.textContent = (idx + 1) + ' / ' + list.length;
  }
  function open(links, i) {
    if (!box) build();
    list = links; box.classList.add('open'); document.body.classList.add('lb-open');
    show(i); $('.lb-close', box).focus();
  }
  function close() { box.classList.remove('open'); document.body.classList.remove('lb-open'); boxImg.src = ''; }
  $$('[data-lightbox]').forEach(function (g) {
    var links = $$('a.lb', g);
    links.forEach(function (a, i) {
      a.addEventListener('click', function (e) { e.preventDefault(); open(links, i); });
    });
  });
  document.addEventListener('keydown', function (e) {
    if (!box || !box.classList.contains('open')) return;
    if (e.key === 'Escape') close();
    else if (e.key === 'ArrowLeft') show(idx - 1);
    else if (e.key === 'ArrowRight') show(idx + 1);
  });

  /* ---- slideshow della home ---- */
  var ss = $('[data-slideshow]');
  if (ss) {
    var slides = $$('.slide', ss), cur = 0, timer = null, thumbs = $$('[data-thumbs] .thumb');
    thumbs.forEach(function (t, i) { t.addEventListener('click', function () { go(i); play(); }); });
    var go = function (n) {
      slides[cur].classList.remove('is-active');
      cur = (n + slides.length) % slides.length;
      var im = $('img', slides[cur]); if (im) im.loading = 'eager';
      slides[cur].classList.add('is-active');
      thumbs.forEach(function (t, i) { t.classList.toggle('is-active', i === cur); });
    };
    var play = function () {
      if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      clearInterval(timer); timer = setInterval(function () { go(cur + 1); }, 5000);
    };
    $('.slide-prev', ss).addEventListener('click', function () { go(cur - 1); play(); });
    $('.slide-next', ss).addEventListener('click', function () { go(cur + 1); play(); });
    play();
  }

  /* ---- cookie e Google Analytics ---- */
  var KEY = 'dc-consent';
  var banner = $('#cookie-banner');
  function stored() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
  function store(v) { try { localStorage.setItem(KEY, v); } catch (e) {} }
  function loadGA() {
    /* In modalita' prova (mockup) Analytics non parte MAI, qualunque scelta. */
    if (cfg.mockup || !cfg.gaId || window.__gaLoaded) return;
    window.__gaLoaded = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', cfg.gaId);
    var s = document.createElement('script');
    s.async = true; s.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(cfg.gaId);
    document.head.appendChild(s);
  }
  if (banner) {
    var c = stored();
    if (c === 'granted') loadGA(); else if (c !== 'denied') banner.hidden = false;
    $$('[data-cookie]', banner).forEach(function (b) {
      b.addEventListener('click', function () {
        var v = b.getAttribute('data-cookie'); store(v); banner.hidden = true;
        if (v === 'granted') loadGA();
        else if (window.__gaLoaded) location.reload(); /* ritirato il consenso: ricarico senza Analytics */
      });
    });
    $$('[data-cookie-open]').forEach(function (b) { b.addEventListener('click', function () { banner.hidden = false; }); });
  }
})();
