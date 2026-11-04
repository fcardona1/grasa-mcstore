/* Panel de Moisés · productos, marcas, secciones y ajustes (prototipo) */
(function () {
  'use strict';
  /* saludo según quién entró: usa GRCFG.names (correo -> nombre); si no está, el nombre del dueño de la tienda */
  function whoName(st) {
    var mail = (GR.user && GR.user() || '').toLowerCase(), names = (window.GRCFG && window.GRCFG.names) || {};
    return names[mail] || (st && st.owner) || 'Moisés';
  }

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var esc = GR.esc;

  var d = GR.get();
  var tab = 'home';
  var F = null;        // producto que se está editando en el formulario
  var editingId = null;
  var arm = null;      // botón de borrar "armado" (segundo toque confirma)

  var toastT;
  function toast(msg) {
    var t = $('#toast'); t.textContent = msg; t.classList.add('show');
    clearTimeout(toastT); toastT = setTimeout(function () { t.classList.remove('show'); }, 2400);
  }
  function commit(msg) {
    if (GR.save(d)) { if (msg) toast(msg); return true; }
    toast('No se pudo guardar. Prueba con una foto más liviana.');
    return false;
  }
  function plural(n, a, b) { return n + ' ' + (n === 1 ? a : b); }
  function num(v) { return parseInt(String(v || '').replace(/\D/g, ''), 10) || 0; }
  function move(arr, i, dir) { var j = i + dir; if (j < 0 || j >= arr.length) return; var t = arr[i]; arr[i] = arr[j]; arr[j] = t; }
  function fmtTime(t) {
    var x = new Date(t);
    return x.toLocaleDateString('es-CO', { day: 'numeric', month: 'short' }) + ' · ' + x.toLocaleTimeString('es-CO', { hour: 'numeric', minute: '2-digit' });
  }

  /* ---------- navegación ---------- */
  function setTab(t) {
    tab = t; arm = null; window.scrollTo(0, 0); document.body.dataset.tab = t;
    $$('#tabs button').forEach(function (b) { b.setAttribute('aria-selected', String(b.dataset.tab === t)); });
    render();
  }
  function render() {
    var v = $('#view');
    ({ home: viewHome, products: viewProducts, brands: viewBrands, sections: viewSections, settings: viewSettings }[tab])(v);
  }

  /* ---------- resumen ---------- */
  function viewHome(v) {
    var s = d.settings;
    var vis = d.products.filter(function (p) { return !p.hidden; }).length;
    var sold = d.products.filter(function (p) { return p.soldOut; }).length;
    var nets = ['instagram', 'tiktok', 'facebook'].filter(function (k) { return (s[k] || '').trim(); }).length;
    var hasWa = GR.digits(s.whatsapp).length >= 10;
    var mine = d.products.filter(function (p) { return !p.sample; }).length;
    var log = (d.log || []);
    if (GR.live) log = [];
    var ev = M.ev;
    var readyN = [hasWa, mine > 0, !!(s.community || '').trim(), nets === 3].filter(Boolean).length;
    v.innerHTML =
      '<div class="sec-head"><div><h2>Hola, ' + esc(whoName(s)) + '</h2><p>Aquí manejas tu tienda sin llamar a nadie: subes pares, cambias precios y creas marcas y secciones. Todo lo que cambies se ve al instante en la tienda.</p></div><a class="btn" href="store.html">Ver la tienda</a></div>' +
      '<div class="quick"><button type="button" class="qk hot" data-new><b>+</b><span>Subir un par</span></button><button type="button" class="qk" data-go="brands"><b>#</b><span>Marcas</span></button><button type="button" class="qk" data-go="settings"><b>⚙</b><span>Ajustes</span></button></div>' +
      '<div class="stats">' +
      '<div class="stat"><b>' + vis + '</b><span>Pares visibles</span></div>' +
      '<div class="stat hot"><b>' + sold + '</b><span>Agotados</span></div>' +
      (GR.live ? '<div class="stat"><b>' + (ev ? M.visits : '…') + '</b><span>Visitas · 7 días</span></div>' +
        '<div class="stat"><b>' + (ev ? M.asks.length : '…') + '</b><span>Consultas WhatsApp · 7 días</span></div></div>' :
        '<div class="stat"><b>' + d.brands.length + '</b><span>Marcas</span></div>' +
        '<div class="stat"><b>' + d.sections.length + '</b><span>Secciones</span></div></div>') +
      '<div class="two-col">' +
      '<section class="box"><h3>Para dejarla lista <em class="pct">' + readyN + '/4</em></h3><div class="prog"><i style="width:' + (readyN * 25) + '%"></i></div><ul class="todo">' +
      todo(hasWa, 'WhatsApp de ' + esc(s.owner || 'Moisés') + ': ' + esc(GR.prettyPhone(s.whatsapp)), 'settings') +
      todo(mine > 0, mine > 0 ? plural(mine, 'par subido', 'pares subidos') : 'Sube tu primer par', 'products') +
      todo(!!(s.community || '').trim(), 'Link de la comunidad', 'settings') +
      todo(nets === 3, 'Redes sociales: ' + nets + ' de 3', 'settings') +
      '</ul></section>' +
      '<section class="box"><h3>' + (GR.live ? 'Últimas consultas' : 'Consultas de esta prueba') + '</h3>' +
      (GR.live && M.asks.length ? '<div class="log">' + M.asks.slice(0, 4).map(function (l) { return '<div><time>' + esc(fmtTime(l.t)) + '</time><div class="msg">' + esc(l.texto || '') + '</div></div>'; }).join('') + '</div>' : '') +
      (GR.live && M.asks.length ? '' : log.length
        ? '<div class="log">' + log.slice(0, 4).map(function (l) { return '<div><time>' + esc(fmtTime(l.t)) + '</time><div class="msg">' + esc(l.text) + '</div></div>'; }).join('') + '</div>'
        : '<p class="empty-note">Aún no hay consultas. Abre la tienda, elige un par y una talla y toca el botón de WhatsApp: aquí queda el mensaje tal como te llega, con la talla incluida.</p>') +
      '</section></div>' +
      (GR.live && ev && M.top.length ? '<section class="box"><h3>Los más mirados (7 días)</h3><ul class="todo">' + M.top.map(function (t) { return '<li class="done"><i class="dot"></i><span>' + esc(t.name) + '</span><b>' + t.n + '</b></li>'; }).join('') + '</ul></section>' : '');
  }
  var M = { ev: null, visits: 0, asks: [], top: [] };
  function loadMetrics() {
    if (!GR.live) return;
    GR.events(7).then(function (rows) {
      var cnt = {};
      M.ev = rows; M.visits = rows.filter(function (r) { return r.tipo === 'visita'; }).length;
      M.asks = rows.filter(function (r) { return r.tipo === 'ask'; });
      rows.forEach(function (r) { if (r.ref && (r.tipo === 'par' || r.tipo === 'ask')) cnt[r.ref] = (cnt[r.ref] || 0) + 1; });
      M.top = Object.keys(cnt).map(function (ref) {
        var p = d.products.filter(function (x) { return x.ref === ref; })[0];
        return p ? { name: p.name + ' · ' + ref, n: cnt[ref] } : null;
      }).filter(Boolean).sort(function (a, b) { return b.n - a.n; }).slice(0, 5);
      if (tab === 'home' && !F) render();
    }).catch(function () { /* sin métricas */ });
  }
  function todo(ok, text, go) {
    return '<li class="' + (ok ? 'done' : 'wait') + '"><i class="dot"></i><span>' + text + '</span>' + (ok ? '' : '<a href="#" data-go="' + go + '">Completar</a>') + '</li>';
  }

  /* ---------- productos ---------- */
  function viewProducts(v) {
    var hasSample = d.products.some(function (p) { return p.sample; });
    v.innerHTML =
      '<div class="sec-head"><div><h2>Productos</h2><p>' + plural(d.products.length, 'par', 'pares') + ' en la tienda. Marca un par como agotado o ocúltalo sin borrarlo.</p></div>' +
      '<button class="btn" type="button" data-new>Nuevo producto</button></div>' +
      (d.products.length ? '<div class="plist">' + d.products.slice().sort(function (a, b) { return b.n - a.n; }).map(prow).join('') + '</div>'
        : '<p class="empty-note">Todavía no hay productos. Toca “Nuevo producto” para subir el primero.</p>') +
      (hasSample ? '<div class="reset"><button class="btn ghost small" type="button" data-clear-samples>Borrar los pares de ejemplo</button><span class="fine">Deja solo los pares que tú subas.</span></div>' : '');
  }
  function prow(p) {
    var off = GR.pct(p);
    var secs = p.sections.map(function (sid) { var s = d.sections.filter(function (x) { return x.id === sid; })[0]; return s ? s.name : ''; }).filter(Boolean).join(', ');
    return '<article class="prow' + (p.hidden ? ' off' : '') + '"><div class="th">' + GR.art(p) + '</div>' +
      '<div class="info"><b>' + esc(p.name) + '</b><small>' + esc(GR.brandName(d, p.brand) || 'Sin marca') + ' · ' + esc(p.ref) + (secs ? ' · ' + esc(secs) : '') + '</small>' +
      '<span class="price">' + GR.money(p.price) + (off ? '<s>' + GR.money(p.oldPrice) + '</s>' : '') + '</span>' +
      '<small>Tallas: ' + (p.sizes.length ? esc(p.sizes.join(' · ')) : 'ninguna') + '</small></div>' +
      '<div class="ctrl">' +
      '<button type="button" class="pill warn" aria-pressed="' + p.soldOut + '" data-sold="' + esc(p.id) + '">Agotado</button>' +
      '<button type="button" class="pill" aria-pressed="' + p.hidden + '" data-hide="' + esc(p.id) + '">Oculto</button>' +
      '<button type="button" class="pill" data-edit="' + esc(p.id) + '">Editar</button>' +
      '<button type="button" class="pill danger" data-delp="' + esc(p.id) + '">Borrar</button></div></article>';
  }

  /* ---------- formulario de producto ---------- */
  function openForm(id) {
    editingId = id;
    var p = id ? d.products.filter(function (x) { return x.id === id; })[0] : null;
    F = p ? JSON.parse(JSON.stringify(p)) : {
      name: '', brand: d.brands.length ? d.brands[0].id : '', price: 0, oldPrice: 0, sections: [], sizes: [], desc: '',
      pal: 0, style: 'low', img: null, soldOut: false, hidden: false
    };
    $('#fTitle').textContent = p ? 'Editar producto' : 'Nuevo producto';
    $('#pfName').value = F.name; $('#pfPrice').value = F.price || ''; $('#pfOld').value = F.oldPrice || ''; $('#pfDesc').value = F.desc || '';
    $('#pfBrand').innerHTML = '<option value="">Sin marca</option>' + d.brands.map(function (b) { return '<option value="' + esc(b.id) + '"' + (b.id === F.brand ? ' selected' : '') + '>' + esc(b.name) + '</option>'; }).join('');
    $('#pfSecs').innerHTML = d.sections.length ? d.sections.map(function (s) {
      return '<label><input type="checkbox" value="' + esc(s.id) + '"' + (F.sections.indexOf(s.id) > -1 ? ' checked' : '') + '>' + esc(s.name) + '</label>';
    }).join('') : '<span class="muted small">Crea primero una sección en la pestaña Secciones.</span>';
    $('#pfSold').checked = F.soldOut; $('#pfHidden').checked = F.hidden;
    $('#pfFile').value = '';
    $('#pfErr').hidden = true;
    drawSizes(); drawPal(); drawPreview();
    var l = $('#form'); l.classList.add('open'); l.setAttribute('aria-hidden', 'false'); document.body.classList.add('lock');
    $('#pfName').focus({ preventScroll: true });
  }
  function closeForm() {
    var l = $('#form'); l.classList.remove('open'); l.setAttribute('aria-hidden', 'true'); document.body.classList.remove('lock'); F = null;
  }
  function drawSizes() {
    $('#pfSizes').innerHTML = GR.SIZES.map(function (n) { return '<button type="button" data-sz="' + n + '" aria-pressed="' + (F.sizes.indexOf(n) > -1) + '">' + n + '</button>'; }).join('');
  }
  function drawPal() {
    $('#pfPal').innerHTML = GR.PALETTES.map(function (p, i) {
      return '<button type="button" data-pal="' + i + '" aria-pressed="' + (F.pal === i) + '" aria-label="' + esc(p.n) + '" title="' + esc(p.n) + '">' + p.c.map(function (c) { return '<i style="background:' + c + '"></i>'; }).join('') + '</button>';
    }).join('');
    $$('#drawBox .seg button').forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.style === F.style)); });
  }
  function drawPreview() { $('#phPrev').innerHTML = GR.art(F); }

  function readImg(file, cb) {
    var fr = new FileReader();
    fr.onload = function () {
      var im = new Image();
      im.onload = function () {
        var max = 720, k = Math.min(1, max / Math.max(im.width, im.height));
        var c = document.createElement('canvas'); c.width = Math.round(im.width * k); c.height = Math.round(im.height * k);
        var x = c.getContext('2d'); x.fillStyle = '#1e1e24'; x.fillRect(0, 0, c.width, c.height); x.drawImage(im, 0, 0, c.width, c.height);
        cb(c.toDataURL('image/jpeg', 0.78));
      };
      im.onerror = function () { cb(null); };
      im.src = fr.result;
    };
    fr.onerror = function () { cb(null); };
    fr.readAsDataURL(file);
  }

  function saveForm(e) {
    e.preventDefault();
    var name = $('#pfName').value.trim(), price = num($('#pfPrice').value), old = num($('#pfOld').value);
    var err = '';
    if (!name) err = 'Escribe el nombre del par.';
    else if (!price) err = 'Escribe el precio, solo números. Ejemplo: 450000.';
    else if (old && old <= price) err = 'El precio anterior debe ser mayor que el precio actual, o déjalo vacío.';
    else if (!F.sizes.length) err = 'Marca al menos una talla.';
    var box = $('#pfErr');
    if (err) { box.textContent = err; box.hidden = false; return; }
    F.name = name; F.price = price; F.oldPrice = old || 0; F.desc = $('#pfDesc').value.trim();
    F.brand = $('#pfBrand').value;
    F.sections = $$('#pfSecs input:checked').map(function (i) { return i.value; });
    F.soldOut = $('#pfSold').checked; F.hidden = $('#pfHidden').checked;
    F.sizes.sort(function (a, b) { return a - b; });
    var btn = $('#pf button[type=submit]'), oldImg = null;
    function go() {
      var prev = d.products.slice();
      if (editingId) {
        d.products.forEach(function (p) { if (p.id === editingId && p.img && p.img !== F.img) oldImg = p.img; });
        d.products = d.products.map(function (p) { return p.id === editingId ? Object.assign({}, p, F, { sample: p.sample && !F.img && p.name === F.name }) : p; });
      } else {
        var n = d.seq++;
        F.id = GR.uid('p'); F.n = n; F.ref = 'GM-' + String(n).padStart(3, '0'); F.sample = false;
        d.products.push(F);
      }
      if (commit(editingId ? 'Cambios guardados' : 'Producto creado')) { if (oldImg) GR.removeImg(oldImg); closeForm(); render(); }
      else { d.products = prev; }
    }
    if (GR.live && F.img && F.img.indexOf('data:') === 0) {
      btn.disabled = true; var lbl = btn.textContent; btn.textContent = 'Subiendo foto…';
      GR.uploadImg(F.img).then(function (u) { F.img = u; btn.disabled = false; btn.textContent = lbl; go(); })
        .catch(function () { btn.disabled = false; btn.textContent = lbl; box.textContent = 'No se pudo subir la foto. Revisa tu internet e intenta otra vez.'; box.hidden = false; });
    } else go();
  }

  /* ---------- marcas y secciones ---------- */
  function viewBrands(v) {
    v.innerHTML = '<div class="sec-head"><div><h2>Marcas</h2><p>Crea las marcas que vendes. Aparecen como filtro en la tienda y en cada producto.</p></div></div>' +
      '<form class="addrow" data-add="brands"><label class="sr" for="newBrand">Nueva marca</label><input class="in" id="newBrand" maxlength="30" placeholder="Nueva marca, ej. Converse" autocomplete="off"><button class="btn" type="submit">Crear marca</button></form>' +
      '<div class="rows">' + (d.brands.length ? d.brands.map(function (b, i) {
        var n = d.products.filter(function (p) { return p.brand === b.id; }).length;
        return '<div class="row"><label class="sr" for="b' + i + '">Nombre de la marca</label><input class="in" id="b' + i + '" value="' + esc(b.name) + '" maxlength="30" data-ren="brands" data-id="' + esc(b.id) + '"><small>' + plural(n, 'par', 'pares') + '</small>' +
          '<span class="acts"><button class="sq" type="button" data-up="brands" data-i="' + i + '" aria-label="Subir"' + (i === 0 ? ' disabled' : '') + '>↑</button><button class="sq" type="button" data-down="brands" data-i="' + i + '" aria-label="Bajar"' + (i === d.brands.length - 1 ? ' disabled' : '') + '>↓</button>' +
          '<button class="pill danger" type="button" data-delb="brands" data-id="' + esc(b.id) + '">Borrar</button></span></div>';
      }).join('') : '<p class="empty-note">Aún no hay marcas. Crea la primera arriba.</p>') + '</div>';
  }
  function viewSections(v) {
    v.innerHTML = '<div class="sec-head"><div><h2>Secciones</h2><p>Hombre, Mujer, Promociones o la que quieras (Niños, Nuevos, Outlet). Un par puede estar en varias secciones.</p></div></div>' +
      '<form class="addrow" data-add="sections"><label class="sr" for="newSec">Nueva sección</label><input class="in" id="newSec" maxlength="30" placeholder="Nueva sección, ej. Niños" autocomplete="off"><button class="btn" type="submit">Crear sección</button></form>' +
      '<div class="rows">' + (d.sections.length ? d.sections.map(function (s, i) {
        var n = d.products.filter(function (p) { return p.sections.indexOf(s.id) > -1; }).length;
        return '<div class="row"><label class="sr" for="s' + i + '">Nombre de la sección</label><input class="in" id="s' + i + '" value="' + esc(s.name) + '" maxlength="30" data-ren="sections" data-id="' + esc(s.id) + '"><small>' + plural(n, 'par', 'pares') + '</small>' +
          '<span class="acts"><button class="pill" type="button" aria-pressed="' + !!s.promo + '" data-promo="' + esc(s.id) + '" title="Se muestra con color de promoción">Promoción</button>' +
          '<button class="sq" type="button" data-up="sections" data-i="' + i + '" aria-label="Subir"' + (i === 0 ? ' disabled' : '') + '>↑</button><button class="sq" type="button" data-down="sections" data-i="' + i + '" aria-label="Bajar"' + (i === d.sections.length - 1 ? ' disabled' : '') + '>↓</button>' +
          '<button class="pill danger" type="button" data-delb="sections" data-id="' + esc(s.id) + '">Borrar</button></span></div>';
      }).join('') : '<p class="empty-note">Aún no hay secciones. Crea la primera arriba.</p>') + '</div>';
  }

  /* ---------- ajustes ---------- */
  function viewSettings(v) {
    var s = d.settings;
    function pend(k) { return (s[k] || '').trim() ? '' : '<span class="pending">Pendiente</span>'; }
    v.innerHTML = '<div class="sec-head"><div><h2>Ajustes</h2><p>Los datos de contacto que se ven en la tienda. Lo que dejes vacío aparece como “Próximamente”.</p></div></div>' +
      '<form class="form-grid" id="setf" novalidate>' +
      '<div class="two"><div class="field"><label for="sOwner">Tu nombre</label><input class="in" id="sOwner" value="' + esc(s.owner) + '" maxlength="30"></div>' +
      '<div class="field"><label for="sWa">WhatsApp donde llegan los mensajes</label><input class="in" id="sWa" inputmode="tel" value="' + esc(GR.prettyPhone(s.whatsapp)) + '" placeholder="+57 300 000 0000"></div></div>' +
      '<div class="field"><label for="sSlogan">Frase de la tienda</label><input class="in" id="sSlogan" value="' + esc(s.slogan) + '" maxlength="60"></div>' +
      '<div class="field"><label for="sCom">Link de la comunidad (grupo o canal de WhatsApp)' + pend('community') + '</label><input class="in" id="sCom" inputmode="url" value="' + esc(s.community) + '" placeholder="https://chat.whatsapp.com/..."></div>' +
      '<div class="field"><label for="sIg">Instagram' + pend('instagram') + '</label><input class="in" id="sIg" inputmode="url" value="' + esc(s.instagram) + '" placeholder="https://instagram.com/tu_usuario"></div>' +
      '<div class="two"><div class="field"><label for="sTk">TikTok' + pend('tiktok') + '</label><input class="in" id="sTk" inputmode="url" value="' + esc(s.tiktok) + '" placeholder="https://tiktok.com/@tu_usuario"></div>' +
      '<div class="field"><label for="sFb">Facebook' + pend('facebook') + '</label><input class="in" id="sFb" inputmode="url" value="' + esc(s.facebook) + '" placeholder="https://facebook.com/tu_pagina"></div></div>' +
      '<p class="err" id="sErr" role="alert" hidden></p>' +
      '<div><button class="btn" type="submit">Guardar ajustes</button></div></form>' +
      (GR.live ? '<div class="reset"><span class="fine">Sesión: ' + esc(GR.user() || '') + '</span><button class="btn ghost small" type="button" data-logout>Cerrar sesión</button></div>' : '<div class="reset"><button class="btn ghost small" type="button" data-reset>Volver al ejemplo inicial</button><span class="fine">Borra tus cambios de esta prueba y deja los datos de ejemplo.</span></div>');
  }
  function saveSettings(e) {
    e.preventDefault();
    var wa = GR.digits($('#sWa').value);
    if (wa.length === 10) wa = '57' + wa;
    var err = $('#sErr');
    if (wa.length < 11) { err.textContent = 'Escribe el número con el indicativo del país, por ejemplo +57 314 550 5717.'; err.hidden = false; return; }
    err.hidden = true;
    d.settings = {
      owner: $('#sOwner').value.trim() || 'Moisés', whatsapp: wa, slogan: $('#sSlogan').value.trim(),
      community: $('#sCom').value.trim(), instagram: $('#sIg').value.trim(), tiktok: $('#sTk').value.trim(), facebook: $('#sFb').value.trim()
    };
    if (commit('Ajustes guardados')) render();
  }

  /* ---------- eventos ---------- */
  document.addEventListener('click', function (e) {
    var t = e.target, el, id;
    if ((el = t.closest('#tabs button'))) { setTab(el.dataset.tab); return; }
    if ((el = t.closest('[data-go]'))) { e.preventDefault(); setTab(el.dataset.go); return; }
    if (t.closest('[data-logout]')) { GR.logout(); location.reload(); return; }
    if (t.closest('[data-new]')) { openForm(null); return; }
    if ((el = t.closest('[data-edit]'))) { openForm(el.dataset.edit); return; }
    if (t.closest('#form [data-close]')) { closeForm(); return; }
    if ((el = t.closest('[data-sold]'))) { d.products.forEach(function (p) { if (p.id === el.dataset.sold) p.soldOut = !p.soldOut; }); if (commit('Actualizado')) render(); return; }
    if ((el = t.closest('[data-hide]'))) { d.products.forEach(function (p) { if (p.id === el.dataset.hide) p.hidden = !p.hidden; }); if (commit('Actualizado')) render(); return; }
    if ((el = t.closest('[data-delp]'))) {
      if (arm !== el.dataset.delp) { arm = el.dataset.delp; $$('.pill.danger.arm').forEach(function (b) { b.classList.remove('arm'); b.textContent = 'Borrar'; }); el.classList.add('arm'); el.textContent = '¿Seguro?'; return; }
      d.products.forEach(function (p) { if (p.id === arm) GR.removeImg(p.img); }); d.products = d.products.filter(function (p) { return p.id !== arm; }); arm = null;
      if (commit('Producto borrado')) render(); return;
    }
    if (t.closest('[data-clear-samples]')) {
      d.products = d.products.filter(function (p) { return !p.sample; });
      if (commit('Pares de ejemplo borrados')) render(); return;
    }
    if ((el = t.closest('[data-up]'))) { move(d[el.dataset.up], +el.dataset.i, -1); if (commit()) render(); return; }
    if ((el = t.closest('[data-down]'))) { move(d[el.dataset.down], +el.dataset.i, 1); if (commit()) render(); return; }
    if ((el = t.closest('[data-promo]'))) { d.sections.forEach(function (s) { if (s.id === el.dataset.promo) s.promo = !s.promo; }); if (commit('Actualizado')) render(); return; }
    if ((el = t.closest('[data-delb]'))) {
      id = el.dataset.id;
      if (arm !== id) { arm = id; $$('.pill.danger.arm').forEach(function (b) { b.classList.remove('arm'); b.textContent = 'Borrar'; }); el.classList.add('arm'); el.textContent = '¿Seguro?'; return; }
      var kind = el.dataset.delb; arm = null;
      d[kind] = d[kind].filter(function (x) { return x.id !== id; });
      d.products.forEach(function (p) {
        if (kind === 'brands' && p.brand === id) p.brand = '';
        if (kind === 'sections') p.sections = p.sections.filter(function (s) { return s !== id; });
      });
      if (commit(kind === 'brands' ? 'Marca borrada' : 'Sección borrada')) render(); return;
    }
    if (t.closest('[data-reset]')) {
      if (arm !== 'reset') { arm = 'reset'; el = t.closest('[data-reset]'); el.textContent = '¿Seguro? Toca otra vez'; return; }
      arm = null; d = GR.reset(); toast('Prueba reiniciada'); render(); return;
    }
    /* formulario */
    if ((el = t.closest('#pfSizes [data-sz]'))) {
      var n = +el.dataset.sz, i = F.sizes.indexOf(n); if (i > -1) F.sizes.splice(i, 1); else F.sizes.push(n); drawSizes(); return;
    }
    if (t.closest('#pfAll')) { F.sizes = GR.SIZES.slice(); drawSizes(); return; }
    if (t.closest('#pfNone')) { F.sizes = []; drawSizes(); return; }
    if ((el = t.closest('#pfPal [data-pal]'))) { F.pal = +el.dataset.pal; drawPal(); drawPreview(); return; }
    if ((el = t.closest('#drawBox [data-style]'))) { F.style = el.dataset.style; drawPal(); drawPreview(); return; }
    if (t.closest('#pfNoPhoto')) { F.img = null; $('#pfFile').value = ''; drawPreview(); return; }
  });

  document.addEventListener('change', function (e) {
    var t = e.target;
    if (t.matches('[data-ren]')) {
      var kind = t.dataset.ren, v = t.value.trim();
      if (!v) { toast('El nombre no puede quedar vacío'); render(); return; }
      d[kind].forEach(function (x) { if (x.id === t.dataset.id) x.name = v; });
      commit('Nombre actualizado'); return;
    }
    if (t.id === 'pfFile' && t.files && t.files[0]) {
      readImg(t.files[0], function (img) {
        if (!img) { toast('No se pudo leer esa imagen. Prueba con otra.'); return; }
        F.img = img; drawPreview();
      });
    }
  });

  document.addEventListener('submit', function (e) {
    var f = e.target;
    if (f.id === 'pf') { saveForm(e); return; }
    if (f.id === 'setf') { saveSettings(e); return; }
    if (f.matches('[data-add]')) {
      e.preventDefault();
      var kind = f.dataset.add, inp = $('input', f), name = inp.value.trim();
      if (!name) { toast('Escribe un nombre primero'); inp.focus(); return; }
      if (d[kind].some(function (x) { return x.name.toLowerCase() === name.toLowerCase(); })) { toast('Ya existe “' + name + '”'); return; }
      d[kind].push(kind === 'brands' ? { id: GR.uid('b'), name: name } : { id: GR.uid('s'), name: name, promo: /promo|oferta|outlet/i.test(name) });
      if (commit((kind === 'brands' ? 'Marca creada: ' : 'Sección creada: ') + name)) render();
    }
  });

  

  window.addEventListener('storage', function (e) {
    if (e.key !== GR.KEY || F) return;
    d = GR.get();
    if (tab === 'home') render();
  });

  window.addEventListener('scroll', function () { document.body.classList.toggle('atend', window.scrollY + innerHeight > document.documentElement.scrollHeight - 140); }, { passive: true });
  GR.status = function (st) {
    if (st === 'error') toast('Sin conexión: se guardará al volver internet.');
    if (st === 'auth') { toast('Tu sesión venció. Entra de nuevo.'); setTimeout(function () { GR.logout(); location.reload(); }, 1800); }
  };
  window.addEventListener('beforeunload', function (e) { if (GR.live && GR.pending && GR.pending()) { e.preventDefault(); e.returnValue = ''; } });

  function start() {
    document.body.classList.remove('locked'); document.body.dataset.tab = tab;
    if (GR.live) { var to = $('#topOut'); if (to) to.hidden = false; }
    render();
    if (GR.live) GR.init(function () { d = GR.get(); if (!F) render(); loadMetrics(); });
  }
  function gate() {
    var el = document.createElement('div'); el.className = 'lg'; el.id = 'lg';
    el.innerHTML = '<form class="lgcard" id="lgf" novalidate><img class="emb" src="img/emblema.png" alt="" width="96" height="96">' +
      '<p class="eyebrow">Panel de control</p><h1>GRA$A MC-STORE</h1>' +
      '<div class="field"><label for="lgE">Correo</label><input class="in" id="lgE" type="email" autocomplete="username" inputmode="email" autocapitalize="off"></div>' +
      '<div class="field"><label for="lgP">Contraseña</label><div class="pw"><input class="in" id="lgP" type="password" autocomplete="current-password"><button type="button" class="eye" id="lgEye" aria-label="Mostrar contraseña">👁</button></div></div>' +
      '<label class="rem"><input type="checkbox" id="lgR" checked> Recordarme en este equipo</label>' +
      '<p class="err" id="lgErr" role="alert" hidden></p><button class="btn" type="submit" id="lgB">Entrar</button>' +
      '<div class="lg-on"><a href="https://www.onytek.co" target="_blank" rel="noopener" aria-label="Onytek, abrir www.onytek.co"><img src="img/onytek.png" alt="Onytek" width="640" height="118"></a><p class="by">Desarrollado por <a href="https://www.onytek.co" target="_blank" rel="noopener">Onytek</a></p></div></form>';
    document.body.appendChild(el);
    $('#lgEye').addEventListener('click', function () { var i = $('#lgP'); var sh = i.type === 'password'; i.type = sh ? 'text' : 'password'; this.setAttribute('aria-label', sh ? 'Ocultar contraseña' : 'Mostrar contraseña'); this.style.opacity = sh ? 1 : .6; });
    $('#lgf').addEventListener('submit', function (e) {
      e.preventDefault();
      var em = $('#lgE').value.trim(), pw = $('#lgP').value, er = $('#lgErr'), b = $('#lgB');
      if (!em || !pw) { er.textContent = 'Escribe tu correo y tu contraseña.'; er.hidden = false; return; }
      b.disabled = true; b.textContent = 'Entrando…'; er.hidden = true;
      GR.login(em, pw, $('#lgR').checked).then(function () { el.remove(); start(); })
        .catch(function () { er.textContent = 'Correo o contraseña incorrectos.'; er.hidden = false; b.disabled = false; b.textContent = 'Entrar'; });
    });
  }
  if (GR.live) {
    document.body.classList.add('locked');
    GR.check().then(function (ok) { if (ok) start(); else gate(); });
  } else start();
})();