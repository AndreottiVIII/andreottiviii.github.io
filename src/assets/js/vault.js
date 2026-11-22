/* Il vault: apre nel browser il contenuto cifrato in /vault-box/ con la combinazione.
   Cifratura: AES-GCM 256 bit, chiave da PBKDF2-SHA256 (sale e iterazioni scritti in box.json).
   Lo stesso schema e' usato da tools/vault_build.py, che prepara i file. Niente lascia il browser: la combinazione non viene inviata a nessuno. */
(function () {
  'use strict';
  var form = document.getElementById('vt-form');
  if (!form || !window.crypto || !crypto.subtle) return;
  var BOX = new URL('vault-box/', location.href).href; /* relativo: funziona anche nel laboratorio (/lab/) */
  var input = document.getElementById('vt-pw');
  var msg = form.querySelector('.vt-msg');
  var inside = document.getElementById('vt-inside');
  var enc = new TextEncoder(), dec = new TextDecoder();

  function say(t) { msg.textContent = t; }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function b64(s) { var b = atob(s), u = new Uint8Array(b.length); for (var i = 0; i < b.length; i++) u[i] = b.charCodeAt(i); return u; }

  function deriveKey(pw, salt, iter) {
    return crypto.subtle.importKey('raw', enc.encode(pw), 'PBKDF2', false, ['deriveKey']).then(function (base) {
      return crypto.subtle.deriveKey({ name: 'PBKDF2', salt: salt, iterations: iter, hash: 'SHA-256' }, base, { name: 'AES-GCM', length: 256 }, false, ['decrypt']);
    });
  }
  function open(key, iv, data) { return crypto.subtle.decrypt({ name: 'AES-GCM', iv: iv }, key, data).then(function (b) { return new Uint8Array(b); }); }
  // ogni file cifrato: 12 byte di iv, poi il contenuto
  function photo(key, id) {
    return fetch(BOX + 'f/' + id + '.bin').then(function (r) { if (!r.ok) throw new Error('file'); return r.arrayBuffer(); }).then(function (buf) {
      var b = new Uint8Array(buf);
      return open(key, b.slice(0, 12), b.slice(12));
    }).then(function (p) { return URL.createObjectURL(new Blob([p], { type: 'image/jpeg' })); });
  }

  function render(key, data) {
    var items = data.items || [];
    var h = '<p class="count mono">' + items.length + (items.length === 1 ? ' thing' : ' things') + ' in the vault · <button type="button" class="vt-close">lock it again</button></p><ul class="grid vt-grid">';
    items.forEach(function (it, i) {
      var ext = it.type === 'link';
      h += '<li class="cell"><a class="thumb" href="' + (ext ? esc(it.url) : '#vt-set-' + i) + '"' + (ext ? ' target="_blank" rel="noopener"' : '') + ' data-i="' + i + '" tabindex="-1" aria-hidden="true">' +
        (it.cover ? '<img alt="" data-id="' + esc(it.cover) + '" style="object-position:0 0">' : '<span class="blank">' + (ext ? 'PROJECT' : 'PHOTOS') + '</span>') + '</a>' +
        '<div class="meta"><h2><a href="' + (ext ? esc(it.url) : '#vt-set-' + i) + '"' + (ext ? ' target="_blank" rel="noopener"' : '') + ' data-i="' + i + '">' + esc(it.title) + (ext ? ' <span aria-hidden="true">↗</span>' : '') + '</a></h2>' +
        (it.note ? '<p class="desc">' + esc(it.note) + '</p>' : '') + (it.type === 'photos' ? '<p class="when mono">' + (it.photos || []).length + ' prints</p>' : '') + '</div></li>';
    });
    h += '</ul><div class="vt-sets"></div>';
    inside.innerHTML = h;
    inside.hidden = false;
    form.hidden = true;
    inside.querySelectorAll('img[data-id]').forEach(function (img) {
      photo(key, img.getAttribute('data-id')).then(function (u) { img.src = u; }).catch(function () { img.classList.add('broken'); });
    });
    inside.querySelector('.vt-close').addEventListener('click', function () { location.reload(); });
    inside.addEventListener('click', function (e) {
      var a = e.target.closest('a[data-i]');
      if (!a) return;
      var it = items[+a.getAttribute('data-i')];
      if (!it || it.type !== 'photos') return;
      e.preventDefault();
      showSet(key, it, +a.getAttribute('data-i'));
    });
  }

  function showSet(key, it, i) {
    var sets = inside.querySelector('.vt-sets');
    var id = 'vt-set-' + i;
    var sec = document.getElementById(id);
    if (!sec) {
      sec = document.createElement('section');
      sec.id = id;
      sec.className = 'vt-set';
      var ph = it.photos || [];
      sec.innerHTML = '<h2>' + esc(it.title) + '</h2><p class="count mono">' + ph.length + ' prints · tap one to see it whole</p><div class="prints">' +
        ph.map(function (p, k) { return '<a class="lb" href="#" data-alt="' + esc(p.alt) + '"><img alt="' + esc(p.alt) + '" data-id="' + esc(p.id) + '"><span class="pn" aria-hidden="true"><i>' + String(k + 1).padStart(2, '0') + '</i><span>print ' + String(k + 1).padStart(2, '0') + ' of ' + ph.length + '</span></span></a>'; }).join('') + '</div>';
      sets.appendChild(sec);
      var waits = [];
      sec.querySelectorAll('a.lb').forEach(function (a) {
        var img = a.querySelector('img');
        waits.push(photo(key, img.getAttribute('data-id')).then(function (u) { img.src = u; a.href = u; }).catch(function () { img.classList.add('broken'); }));
      });
      Promise.all(waits).then(function () { if (window.dcLightbox) window.dcLightbox(sec.querySelector('.prints')); });
    }
    sec.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var pw = input.value;
    if (!pw) return;
    say('Turning the dial…');
    var meta;
    fetch(BOX + 'box.json', { cache: 'no-store' })
      .then(function (r) { if (!r.ok) throw new Error('empty'); return r.json(); })
      .then(function (m) { meta = m; return deriveKey(pw, b64(m.salt), m.iter); })
      .then(function (key) {
        /* v1: una sola porta, la chiave apre anche le foto */
        if (!meta.doors) return open(key, b64(meta.iv), b64(meta.ct)).then(function (p) { input.value = ''; say(''); render(key, JSON.parse(dec.decode(p))); });
        /* v2: piu' porte, ognuna con la sua combinazione. Si prova la chiave su tutte: si apre solo quella giusta */
        var tries = meta.doors.map(function (d) { return open(key, b64(d.iv), b64(d.ct)).then(function (p) { return JSON.parse(dec.decode(p)); }, function () { return null; }); });
        return Promise.all(tries).then(function (found) {
          var door = found.filter(Boolean)[0];
          if (!door) throw new Error('wrong');
          input.value = '';
          if (door.type === 'go') {
            say('Opening…');
            /* la password del sito di arrivo viaggia dopo il #: non arriva mai a nessun server */
            location.replace(door.url + (door.pass ? '#p=' + encodeURIComponent(door.pass) : ''));
            return;
          }
          return crypto.subtle.importKey('raw', b64(door.ck), 'AES-GCM', false, ['decrypt']).then(function (ck) { say(''); render(ck, door); });
        });
      })
      .catch(function (err) { say(err && err.message === 'empty' ? 'The vault is empty for now.' : 'Wrong combination.'); input.select(); });
  });
})();
