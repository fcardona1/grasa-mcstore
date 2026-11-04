/* Tienda GRA$A MC-STORE · lógica de la tienda (filtros, talla, caja y WhatsApp) */
(function () {
  'use strict';

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var esc = GR.esc;

  function ls(k, v) {
    try {
      if (v === undefined) return localStorage.getItem(k);
      if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, v);
    } catch (e) { /* sin almacenamiento */ }
    return null;
  }
  function readCart() { try { return JSON.parse(ls('grasa-cart') || '[]') || []; } catch (e) { return []; } }

  var d = GR.get();
  var S = {
    sec: 'all', brand: 'all', q: '', sort: 'new', mine: false,
    size: ls('grasa-size') ? +ls('grasa-size') : null,
    cart: readCart(), open: null, pick: null, opener: null, cm: 25
  };
  if (S.size) S.cm = GR.cmFromSize(S.size);

  function find(id) { for (var i = 0; i < d.products.length; i++) if (d.products[i].id === id) return d.products[i]; return null; }
  function visible() { return d.products.filter(function (p) { return !p.hidden; }); }
  function plural(n, a, b) { return n + ' ' + (n === 1 ? a : b); }
  function url(u) { u = (u || '').trim(); if (!u) return ''; return /^https?:\/\//i.test(u) ? u : 'https://' + u.replace(/^\/+/, ''); }

  var toastT;
  function toast(msg) {
    var t = $('#toast'); t.textContent = msg; t.classList.add('show');
    clearTimeout(toastT); toastT = setTimeout(function () { t.classList.remove('show'); }, 2600);
  }

  /* ---------- textos que dependen de los ajustes ---------- */
  function renderStatic() {
    var s = d.settings, o = esc(s.owner || 'Moisés');
    $('#tagline').textContent = s.slogan || '';
    $('#footTag').textContent = s.slogan || '';
    $('#lead').innerHTML = 'Elige tu par, escoge tu talla y pregúntale a ' + o + ' si está disponible. El mensaje le llega listo, con la talla incluida.';
    $$('.ownerName').forEach(function (n) { n.textContent = s.owner || 'Moisés'; });
    var hello = GR.waUrl(d, 'Hola ' + (s.owner || 'Moisés') + ' 👋 Vi la tienda GRA$A MC-STORE y quiero preguntarte por un par.');
    $('#waFab').href = hello;
    var fp = $('#footPhone'); fp.href = hello; fp.textContent = GR.prettyPhone(s.whatsapp);
    function strip(words) { var one = words.map(function (w) { return '<span>' + esc(w) + '</span>'; }).join(''); return one + one + one + one; }
    $('#trackA').innerHTML = strip(['Pide por WhatsApp', 'Elige tu talla', 'Pares nuevos', 'Pisa con GRA$A']);
    $('#trackB').innerHTML = strip(['Tu talla', 'Tu estilo', 'Tu calle', 'GRA$A MC-STORE']);
    $('#footWa').href = hello;
    renderCommunity();
  }

  var ICONS = {
    instagram: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="17.2" cy="6.8" r="1.2" fill="currentColor"/></svg>',
    tiktok: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 3v10.4a3.4 3.4 0 1 1-3.4-3.4M14 3c.4 2.5 2.1 4.1 4.6 4.3" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    facebook: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 8h3V4h-3a4 4 0 0 0-4 4v3H7v4h3v6h4v-6h3l1-4h-4V8.5c0-.3.2-.5.5-.5Z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>'
  };
  function renderCommunity() {
    var s = d.settings, c = url(s.community);
    var btn = c
      ? '<a class="btn wa" href="' + esc(c) + '" target="_blank" rel="noopener"><svg width="22" height="22" aria-hidden="true"><use href="#i-wa"/></svg>Entrar a la comunidad</a>'
      : '<span class="btn" aria-disabled="true" role="link">Entrar a la comunidad · muy pronto</span>';
    $('#comBtn').innerHTML = btn;
    $('#footCom').innerHTML = c
      ? '<a class="btn wa small" href="' + esc(c) + '" target="_blank" rel="noopener"><svg width="20" height="20" aria-hidden="true"><use href="#i-wa"/></svg>Comunidad</a>'
      : '<span class="btn small" aria-disabled="true" role="link">Comunidad · pronto</span>';
    var nets = [['instagram', 'Instagram'], ['tiktok', 'TikTok'], ['facebook', 'Facebook']];
    var html = nets.map(function (n) {
      var u = url(s[n[0]]);
      return u
        ? '<a class="soc" href="' + esc(u) + '" target="_blank" rel="noopener">' + ICONS[n[0]] + n[1] + '</a>'
        : '<span class="soc pend" aria-disabled="true">' + ICONS[n[0]] + n[1] + '<em>Próximamente</em></span>';
    }).join('');
    $('#socials').innerHTML = html;
    $('#footSocials').innerHTML = html;
  }

  /* ---------- buscador de talla ---------- */
  function renderFinder() {
    var eu = S.size || GR.sizeFromCm(S.cm);
    var cm = S.size ? GR.cmFromSize(S.size) : S.cm;
    $('#cm').value = cm; $('#cmOut').textContent = cm.toFixed(1);
    var calc = GR.sizeFromCm(+$('#cm').value);
    $('#euOut').textContent = calc; $('#usOut').textContent = GR.US[calc];
    $('#szRow').innerHTML = GR.SIZES.map(function (n) {
      return '<button type="button" data-size="' + n + '" aria-pressed="' + (S.size === n) + '" class="' + (n === calc ? 'rec' : '') + '">' + n + '</button>';
    }).join('');
    $('#useSize').textContent = 'Mostrar solo talla ' + (S.size || calc);
    var pill = $('#sizePill');
    pill.hidden = !S.size;
    if (S.size) pill.textContent = 'Talla ' + S.size;
  }
  function setSize(n) {
    S.size = n; ls('grasa-size', n ? String(n) : null);
    if (!n) S.mine = false;
    renderFinder(); renderGrid();
  }

  /* ---------- filtros y catálogo ---------- */
  function renderChips() {
    var secs = [{ id: 'all', name: 'Todo', promo: false }].concat(d.sections);
    $('#secChips').innerHTML = secs.map(function (s) {
      return '<button type="button" class="chip' + (s.promo ? ' promo' : '') + '" data-sec="' + esc(s.id) + '" aria-pressed="' + (S.sec === s.id) + '">' + esc(s.name) + '</button>';
    }).join('');
    var brs = [{ id: 'all', name: 'Todas las marcas' }].concat(d.brands);
    $('#brandChips').innerHTML = brs.map(function (b) {
      return '<button type="button" class="chip" data-brand="' + esc(b.id) + '" aria-pressed="' + (S.brand === b.id) + '">' + esc(b.name) + '</button>';
    }).join('');
    $('#mine').setAttribute('aria-pressed', String(S.mine));
  }

  function filtered() {
    var q = S.q.trim().toLowerCase();
    var list = visible().filter(function (p) {
      if (S.sec !== 'all' && p.sections.indexOf(S.sec) < 0) return false;
      if (S.brand !== 'all' && p.brand !== S.brand) return false;
      if (q && (p.name + ' ' + GR.brandName(d, p.brand) + ' ' + p.ref).toLowerCase().indexOf(q) < 0) return false;
      if (S.mine && S.size && p.sizes.indexOf(S.size) < 0) return false;
      return true;
    });
    list.sort(function (a, b) {
      if (S.sort === 'low') return a.price - b.price;
      if (S.sort === 'high') return b.price - a.price;
      if (S.sort === 'promo') return GR.pct(b) - GR.pct(a) || b.n - a.n;
      return b.n - a.n;
    });
    return list;
  }

  function sizeLine(p) {
    if (S.size) {
      return p.sizes.indexOf(S.size) > -1
        ? '<span class="sz ok">Tu talla ' + S.size + (p.soldOut ? ' · agotada' : ' · disponible') + '</span>'
        : '<span class="sz no">Sin talla ' + S.size + '</span>';
    }
    var show = p.sizes.slice(0, 7).join(' · ');
    return '<span class="sz">Tallas ' + show + (p.sizes.length > 7 ? ' …' : '') + '</span>';
  }

  function card(p) {
    var c = (GR.PALETTES[p.pal] || GR.PALETTES[0]).c[0];
    var off = GR.pct(p);
    var badges = (off ? '<span class="badge promo">Promo −' + off + '%</span>' : '') + (p.soldOut ? '<span class="badge sold">Agotado</span>' : '');
    return '<article><button type="button" class="pcard' + (p.soldOut ? ' is-sold' : '') + '" data-open="' + esc(p.id) + '" style="--c1:' + c + '">' +
      '<span class="art">' + GR.art(p) + '<span class="badges">' + badges + '</span>' +
      '<span class="pricetag"><b>' + GR.money(p.price) + '</b>' + (off ? '<s>' + GR.money(p.oldPrice) + '</s>' : '') + '</span></span>' +
      '<span class="meta"><span class="brand">' + esc(GR.brandName(d, p.brand) || 'Sin marca') + '</span>' +
      '<span class="name">' + esc(p.name) + '</span>' +
      sizeLine(p) + '</span></button></article>';
  }

  function renderGrid() {
    var list = filtered();
    $('#grid').innerHTML = list.map(card).join('');
    $('#count').textContent = plural(list.length, 'par', 'pares');
    var e = $('#empty'); e.hidden = list.length > 0;
    if (!list.length) {
      $('#emptyMsg').textContent = visible().length
        ? 'Prueba con otra sección, otra marca o quita el filtro de talla.'
        : (GR.loaded ? 'Moisés aún no ha subido pares. Vuelve pronto.' : 'Cargando los tennis…');
    }
    renderChips();
  }

  /* ---------- ficha de producto ---------- */
  var layerModal = $('#modal'), layerDrawer = $('#drawer');
  function openLayer(el, opener) {
    S.opener = opener || document.activeElement;
    el.classList.add('open'); el.setAttribute('aria-hidden', 'false'); document.body.classList.add('lock');
    var f = $('[data-close].x, .x', el); if (f) f.focus({ preventScroll: true });
  }
  function closeLayers() {
    [layerModal, layerDrawer].forEach(function (l) { l.classList.remove('open'); l.setAttribute('aria-hidden', 'true'); });
    document.body.classList.remove('lock'); S.open = null;
    if (S.opener && S.opener.focus) { try { S.opener.focus({ preventScroll: true }); } catch (e) { /* nada */ } }
  }

  function openProduct(id, opener) {
    var p = find(id); if (!p) return;
    GR.track('par', p.ref);
    S.open = id; S.pick = (S.size && p.sizes.indexOf(S.size) > -1) ? S.size : null;
    var c = (GR.PALETTES[p.pal] || GR.PALETTES[0]).c[0];
    var art = $('#mArt'); art.style.setProperty('--c1', c); art.innerHTML = GR.art(p);
    $('#mBrand').textContent = (GR.brandName(d, p.brand) || 'Sin marca') + ' · Ref ' + p.ref;
    $('#mTitle').textContent = p.name;
    var off = GR.pct(p);
    $('#mPrice').innerHTML = GR.money(p.price) + (off ? ' <s>' + GR.money(p.oldPrice) + '</s> <span class="off">−' + off + '%</span>' : '');
    $('#mDesc').textContent = p.desc || '';
    $('#mTags').innerHTML = p.sections.map(function (sid) {
      var s = d.sections.filter(function (x) { return x.id === sid; })[0];
      return s ? '<span class="tag">' + esc(s.name) + '</span>' : '';
    }).join('') + (p.soldOut ? '<span class="tag">Agotado</span>' : '');
    $('#mSizes').innerHTML = GR.SIZES.map(function (n) {
      var has = p.sizes.indexOf(n) > -1;
      return '<button type="button" data-pick="' + n + '"' + (has ? '' : ' disabled') + ' aria-pressed="false">' + n + '<small>US ' + GR.US[n] + '</small></button>';
    }).join('');
    $('#mAdd').disabled = p.soldOut;
    $('#mAdd').textContent = p.soldOut ? 'Sin existencias' : 'Agregar a mi caja';
    updatePick();
    openLayer(layerModal, opener);
  }

  function updatePick() {
    var p = find(S.open); if (!p) return;
    $$('#mSizes button').forEach(function (b) { b.setAttribute('aria-pressed', String(+b.dataset.pick === S.pick)); });
    var wa = $('#mWa'), hint = $('#mHint'), bub = $('#mBubble');
    $('#mWaLabel').textContent = p.soldOut ? 'Preguntar cuándo llega' : 'Preguntar disponibilidad';
    if (S.pick) {
      var text = GR.waText(d, [{ p: p, size: S.pick }], p.soldOut ? 'back' : 'ask');
      wa.href = GR.waUrl(d, text); wa.dataset.text = text; wa.setAttribute('aria-disabled', 'false');
      $('#mText').textContent = text; bub.hidden = false;
      hint.classList.remove('warn');
      hint.textContent = 'Talla ' + S.pick + ' lista. Al tocar el botón se abre WhatsApp con este mensaje.';
    } else {
      wa.href = '#'; wa.removeAttribute('data-text'); wa.setAttribute('aria-disabled', 'true');
      bub.hidden = true; hint.classList.remove('warn');
      hint.textContent = 'Toca tu talla para armar el mensaje. Las tachadas no están disponibles.';
    }
  }

  /* ---------- caja ---------- */
  function saveCart() { ls('grasa-cart', JSON.stringify(S.cart)); }
  function cartItems() {
    return S.cart.map(function (c) { var p = find(c.id); return p && !p.hidden ? { p: p, size: c.size } : null; }).filter(Boolean);
  }
  function renderCart() {
    var items = cartItems();
    var n = $('#cartCount'); n.textContent = items.length;
    var body = $('#dBody'), foot = $('#dFoot');
    if (!items.length) {
      body.innerHTML = '<div class="d-empty"><p class="marker">Tu caja está vacía.</p><p class="muted">Agrega pares con su talla y pregúntale a ' + esc(d.settings.owner || 'Moisés') + ' por todos en un solo mensaje.</p></div>';
      foot.innerHTML = '<button class="btn" type="button" data-close>Ver los tennis</button>';
      return;
    }
    body.innerHTML = items.map(function (it, i) {
      return '<div class="line"><div class="th">' + GR.art(it.p) + '</div><div><b>' + esc(it.p.name) + '</b><small>Talla ' + it.size + ' · ' + GR.money(it.p.price) + '</small></div>' +
        '<button type="button" class="rm" data-rm="' + i + '" aria-label="Quitar ' + esc(it.p.name) + '">×</button></div>';
    }).join('');
    var total = items.reduce(function (a, it) { return a + it.p.price; }, 0);
    var text = GR.waText(d, items, 'ask');
    foot.innerHTML = '<div class="d-total"><span>Suma de los pares</span><b>' + GR.money(total) + '</b></div>' +
      '<a class="btn wa" href="' + esc(GR.waUrl(d, text)) + '" target="_blank" rel="noopener" data-text="' + esc(text) + '">Preguntar todo por WhatsApp</a>' +
      '<button class="linkbtn" type="button" data-clear>Vaciar la caja</button>';
  }
  function addToCart() {
    var p = find(S.open); if (!p || p.soldOut) return;
    if (!S.pick) { needSize(); return; }
    var dup = S.cart.some(function (c) { return c.id === p.id && c.size === S.pick; });
    if (dup) { toast('Ese par ya está en tu caja'); return; }
    S.cart.push({ id: p.id, size: S.pick }); saveCart(); renderCart();
    var n = $('#cartCount'); n.classList.remove('bump'); void n.offsetWidth; n.classList.add('bump');
    toast('Agregado: ' + p.name + ' · talla ' + S.pick);
  }
  function needSize() {
    var g = $('#mSizes'); g.classList.remove('shake'); void g.offsetWidth; g.classList.add('shake');
    var h = $('#mHint'); h.textContent = 'Primero elige tu talla.'; h.classList.add('warn');
    toast('Elige tu talla primero');
  }

  /* ---------- eventos ---------- */
  document.addEventListener('click', function (e) {
    var t = e.target;
    var el;
    if ((el = t.closest('[data-open]'))) { openProduct(el.dataset.open, el); return; }
    if ((el = t.closest('[data-pick]'))) {
      if (el.disabled) return;
      S.pick = +el.dataset.pick; updatePick(); return;
    }
    if (t.closest('[data-close]')) {
      var link = t.closest('a.mini');
      closeLayers();
      if (link) return;
      return;
    }
    if ((el = t.closest('#mWa'))) {
      if (el.getAttribute('aria-disabled') === 'true') { e.preventDefault(); needSize(); return; }
      GR.logAsk(el.dataset.text || ''); return;
    }
    if ((el = t.closest('#dFoot a[data-text]'))) { GR.logAsk(el.dataset.text || ''); return; }
    if (t.closest('#mAdd')) { addToCart(); return; }
    if (t.closest('#cartBtn')) { renderCart(); openLayer(layerDrawer, $('#cartBtn')); return; }
    if ((el = t.closest('[data-rm]'))) {
      var items = cartItems(); var it = items[+el.dataset.rm];
      if (it) { S.cart = S.cart.filter(function (c) { return !(c.id === it.p.id && c.size === it.size); }); saveCart(); renderCart(); }
      return;
    }
    if (t.closest('[data-clear]')) { S.cart = []; saveCart(); renderCart(); toast('Caja vacía'); return; }
    if ((el = t.closest('[data-sec]'))) { S.sec = el.dataset.sec; renderGrid(); return; }
    if ((el = t.closest('[data-brand]'))) { S.brand = el.dataset.brand; renderGrid(); return; }
    if (t.closest('#mine')) {
      if (!S.size) { toast('Primero elige tu talla'); location.hash = 'talla'; return; }
      S.mine = !S.mine; renderGrid(); return;
    }
    if ((el = t.closest('#szRow [data-size]'))) { var n = +el.dataset.size; setSize(S.size === n ? null : n); return; }
    if (t.closest('#useSize')) {
      var calc = S.size || GR.sizeFromCm(+$('#cm').value);
      S.size = calc; ls('grasa-size', String(calc)); S.mine = true;
      renderFinder(); renderGrid();
      var c = $('#catalogo'); if (c) c.scrollIntoView({ behavior: 'smooth', block: 'start' });
      toast('Mostrando solo la talla ' + calc);
      return;
    }
    if (t.closest('#sizePill')) { setSize(null); toast('Quitaste tu talla'); return; }
    if (t.closest('#clear')) { S.sec = 'all'; S.brand = 'all'; S.q = ''; S.mine = false; $('#q').value = ''; renderGrid(); return; }
  });

  

  $('#cm').addEventListener('input', function () {
    var v = +this.value; S.cm = v; S.size = null; ls('grasa-size', null);
    $('#cmOut').textContent = v.toFixed(1);
    var calc = GR.sizeFromCm(v);
    $('#euOut').textContent = calc; $('#usOut').textContent = GR.US[calc];
    $$('#szRow button').forEach(function (b) { b.classList.toggle('rec', +b.dataset.size === calc); b.setAttribute('aria-pressed', 'false'); });
    $('#useSize').textContent = 'Mostrar solo talla ' + calc;
    $('#sizePill').hidden = true; S.mine = false; renderGrid();
  });
  $('#q').addEventListener('input', function () { S.q = this.value; renderGrid(); });
  $('#sort').addEventListener('change', function () { S.sort = this.value; renderGrid(); });

  /* inclinación suave de las tarjetas en pantallas con puntero */
  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    var grid = $('#grid');
    grid.addEventListener('pointermove', function (e) {
      var c = e.target.closest('.pcard'); if (!c) return;
      var r = c.getBoundingClientRect();
      c.style.setProperty('--rx', (-((e.clientY - r.top) / r.height - .5) * 9).toFixed(2) + 'deg');
      c.style.setProperty('--ry', (((e.clientX - r.left) / r.width - .5) * 12).toFixed(2) + 'deg');
    });
    grid.addEventListener('pointerout', function (e) {
      var c = e.target.closest('.pcard'); if (!c || c.contains(e.relatedTarget)) return;
      c.style.setProperty('--rx', '0deg'); c.style.setProperty('--ry', '0deg');
    });
  }


  /* ---------- portada: sticker, zapatillas flotantes y spray ---------- */
  function initHero() {
    var hero = $('#hero'), art = $('#art');
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    $('#floats').innerHTML = [[0, 'high'], [6, 'low'], [1, 'low']].map(function (x, i) {
      return '<div class="fl f' + (i + 1) + '">' + GR.shoe(x[0], x[1], 'fshoe') + '</div>';
    }).join('');

    var stick = $('#stickerBtn');
    var cv = $('#spray'), ctx = cv.getContext && cv.getContext('2d');
    var W = 0, H = 0, busy = false, last = 0, colors = ['#D62839', '#F27BA8', '#F1F0EE', '#F7931E', '#FF3B52'];
    function size() { var r = hero.getBoundingClientRect(); W = cv.width = Math.round(r.width); H = cv.height = Math.round(r.height); }
    size();
    if (window.ResizeObserver) new ResizeObserver(size).observe(hero); else window.addEventListener('resize', size);

    function dots(x, y, n, spread) {
      if (!ctx) return;
      for (var i = 0; i < n; i++) {
        var a = Math.random() * 6.283, r = Math.random() * spread;
        ctx.globalAlpha = .35 + Math.random() * .55;
        ctx.fillStyle = colors[(Math.random() * colors.length) | 0];
        ctx.beginPath(); ctx.arc(x + Math.cos(a) * r, y + Math.sin(a) * r, .8 + Math.random() * 2.4, 0, 6.283); ctx.fill();
      }
      ctx.globalAlpha = 1; last = Date.now(); loop();
    }
    function loop() {
      if (busy || !ctx) return; busy = true;
      (function step() {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.fillStyle = 'rgba(0,0,0,.045)'; ctx.fillRect(0, 0, W, H);
        ctx.globalCompositeOperation = 'source-over';
        if (Date.now() - last < 3500) requestAnimationFrame(step); else { ctx.clearRect(0, 0, W, H); busy = false; }
      })();
    }
    if (reduce) return;

    if (fine) {
      hero.addEventListener('pointermove', function (e) {
        var r = hero.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
        hero.style.setProperty('--px', ((x / r.width) * 2 - 1).toFixed(3));
        hero.style.setProperty('--py', ((y / r.height) * 2 - 1).toFixed(3));
        dots(x, y, 7, 16);
      });
      hero.addEventListener('pointerleave', function () { hero.style.setProperty('--px', 0); hero.style.setProperty('--py', 0); });
    }
    function burst(e) {
      var r = hero.getBoundingClientRect();
      dots(e.clientX - r.left, e.clientY - r.top, 70, 46);
    }
    stick.addEventListener('click', function (e) {
      stick.classList.remove('wig'); void stick.offsetWidth; stick.classList.add('wig');
      burst(e);
    });
    hero.addEventListener('pointerdown', function (e) { if (!e.target.closest('a,button')) burst(e); });
  }

  /* si Moisés cambia algo en el panel (otra pestaña), la tienda se actualiza sola */
  window.addEventListener('storage', function (e) {
    if (e.key !== GR.KEY) return;
    d = GR.get(); renderAll();
    if (S.open && !find(S.open)) closeLayers();
  });

  function renderAll() { renderStatic(); renderFinder(); renderGrid(); renderCart(); }
  renderAll();
  GR.track('visita');
  GR.init(function () { d = GR.get(); renderAll(); if (S.open && !find(S.open)) closeLayers(); });
  initHero();
})();
