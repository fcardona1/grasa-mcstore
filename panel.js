/* Panel de Moisés · productos, marcas, secciones y ajustes (prototipo) */
(function () {
  'use strict';
  /* saludo según quién entró: usa GRCFG.names (correo -> nombre); si no está, el nombre del dueño de la tienda */
  function whoName(st) {
    var mail = (GR.user && GR.user() || '').toLowerCase(), names = (window.GRCFG && window.GRCFG.names) || {}, mine = (st && st.names) || {};
    return mine[mail || '_'] || names[mail] || (st && st.owner) || 'Moisés';
  }

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var esc = GR.esc;

  var d = GR.get();
  var tab = 'home';
  var F = null;        // producto que se está editando en el formulario
  var editingId = null;
  var arm = null;      // botón de borrar "armado" (segundo toque confirma)
  var role = 'admin', P = 7, CRED = {};   // quién entró, periodo del dashboard y accesos recién creados

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
    if (t === 'tags') t = tab === 'sections' ? 'sections' : 'brands';
    if (role === 'none') return;
    if (role === 'seller' && t !== 'vcat' && t !== 'vlink') t = 'vcat';
    if (role === 'admin' && (t === 'vcat' || t === 'vlink')) t = 'home';
    tab = t; arm = null; window.scrollTo(0, 0); document.body.dataset.tab = t;
    $$('#tabs button').forEach(function (b) { var bt = b.dataset.tab; b.setAttribute('aria-selected', String(bt === t || (bt === 'tags' && (t === 'brands' || t === 'sections')))); });
    render();
  }
  function render() {
    var v = $('#view');
    ({ home: viewHome, products: viewProducts, brands: viewBrands, sections: viewSections, sellers: viewSellers, stats: viewStats, vcat: viewVCat, vlink: viewVLink, settings: viewSettings }[tab])(v);
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
      (GR.live && M.asks.length ? '<div class="log">' + M.asks.slice(0, 4).map(function (l) { return '<div><time>' + esc(fmtTime(l.t)) + '</time><div class="msg">' + esc(clean(l.texto)) + '</div></div>'; }).join('') + '</div>' : '') +
      (GR.live && M.asks.length ? '' : log.length
        ? '<div class="log">' + log.slice(0, 4).map(function (l) { return '<div><time>' + esc(fmtTime(l.t)) + '</time><div class="msg">' + esc(l.text) + '</div></div>'; }).join('') + '</div>'
        : '<p class="empty-note">Aún no hay consultas. Abre la tienda, elige un par y una talla y toca el botón de WhatsApp: aquí queda el mensaje tal como te llega, con la talla incluida.</p>') +
      '</section></div>' +
      (GR.live && ev && M.top.length ? '<section class="box"><h3>Los más mirados (7 días)</h3><ul class="todo">' + M.top.map(function (t) { return '<li class="done"><i class="dot"></i><span>' + esc(t.name) + '</span><b>' + t.n + '</b></li>'; }).join('') + '</ul></section>' : '');
  }
  var M = { ev: null, visits: 0, asks: [], top: [] };
  function loadMetrics() {
    if (!GR.live) return;
    GR.events(30).then(function (all) {
      var cut = Date.now() - 7 * 864e5, cnt = {}, rows = all.filter(function (r) { return new Date(r.t).getTime() >= cut; });
      M.all = all; M.err = false; M.ev = rows; M.visits = rows.filter(function (r) { return r.tipo === 'visita'; }).length;
      M.asks = rows.filter(function (r) { return r.tipo === 'ask'; });
      rows.forEach(function (r) { if (r.ref && (r.tipo === 'par' || r.tipo === 'ask')) cnt[r.ref] = (cnt[r.ref] || 0) + 1; });
      M.top = Object.keys(cnt).map(function (ref) {
        var p = d.products.filter(function (x) { return x.ref === ref; })[0];
        return p ? { name: p.name + ' · ' + ref, n: cnt[ref] } : null;
      }).filter(Boolean).sort(function (a, b) { return b.n - a.n; }).slice(0, 5);
      if ((tab === 'home' || tab === 'stats') && !F) render();
    }).catch(function () { M.err = true; if (tab === 'stats') render(); });
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
      (p.sale ? '<small>Venta vendedores: ' + GR.money(p.sale) + '</small>' : '') +
      (GR.colorOf(p) && GR.soleOf(p) ? '' : '<small class="todo-tag">Falta color o suela · toca Editar</small>') +
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
      pal: 0, style: 'low', img: null, ix: 0, iy: 0, iz: 1, ifit: 'cover', soldOut: false, hidden: false, sale: 0, color: '', sole: '', gen: ''
    };
    $('#fTitle').textContent = p ? 'Editar producto' : 'Nuevo producto';
    $('#pfName').value = F.name; $('#pfPrice').value = F.price || ''; $('#pfOld').value = F.oldPrice || ''; $('#pfSale').value = F.sale || ''; $('#pfDesc').value = F.desc || '';
    $('#pfBrand').innerHTML = '<option value="">Sin marca</option>' + d.brands.map(function (b) { return '<option value="' + esc(b.id) + '"' + (b.id === F.brand ? ' selected' : '') + '>' + esc(b.name) + '</option>'; }).join('');
    $('#pfSecs').innerHTML = d.sections.length ? d.sections.map(function (s) {
      return '<label><input type="checkbox" value="' + esc(s.id) + '"' + (F.sections.indexOf(s.id) > -1 ? ' checked' : '') + '>' + esc(s.name) + '</label>';
    }).join('') : '<span class="muted small">Crea primero una sección en la pestaña Secciones.</span>';
    $('#pfSold').checked = F.soldOut; $('#pfHidden').checked = F.hidden;
    $('#pfFile').value = '';
    $('#pfErr').hidden = true;
    drawSizes(); drawPal(); drawStyle(); drawPreview();
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
  function drawPreview() {
    var ph = $('#phPrev'); ph.innerHTML = GR.art(F);
    var has = !!F.img; ph.classList.toggle('adj', has); $('#phTools').hidden = !has;
    $('#pfZoom').value = Math.round((+F.iz || 1) * 100);
    var fit = $('#pfFit'); fit.setAttribute('aria-pressed', String(F.ifit === 'contain')); fit.textContent = F.ifit === 'contain' ? 'Llenar el cuadro' : 'Ver completa';
  }
  function applyImg() { var im = $('#phPrev img'); if (im) im.style.cssText = GR.imgStyle(F); }
  function clampPos(v) { return Math.max(-70, Math.min(70, v)); }
  var drag = null;
  document.addEventListener('pointerdown', function (e) {
    var ph = e.target.closest && e.target.closest('#phPrev'); if (!ph || !F || !F.img) return;
    var r = ph.getBoundingClientRect(); drag = { x: e.clientX, y: e.clientY, ix: +F.ix || 0, iy: +F.iy || 0, w: r.width || 1, h: r.height || 1 };
    try { ph.setPointerCapture(e.pointerId); } catch (x) { /* nada */ } e.preventDefault();
  });
  document.addEventListener('pointermove', function (e) {
    if (!drag || !F) return;
    F.ix = Math.round(clampPos(drag.ix + (e.clientX - drag.x) / drag.w * 100) * 10) / 10;
    F.iy = Math.round(clampPos(drag.iy + (e.clientY - drag.y) / drag.h * 100) * 10) / 10; applyImg();
  });
  ['pointerup', 'pointercancel'].forEach(function (n) { document.addEventListener(n, function () { drag = null; }); });
  document.addEventListener('keydown', function (e) {
    if (!F || !F.img || document.activeElement !== $('#phPrev')) return;
    var k = { ArrowLeft: [-2, 0], ArrowRight: [2, 0], ArrowUp: [0, -2], ArrowDown: [0, 2] }[e.key]; if (!k) return;
    e.preventDefault(); F.ix = clampPos((+F.ix || 0) + k[0]); F.iy = clampPos((+F.iy || 0) + k[1]); applyImg();
  });
  document.addEventListener('input', function (e) { if (e.target.id === 'pfZoom' && F) { F.iz = (+e.target.value || 100) / 100; applyImg(); } });
  document.addEventListener('input', function (e) {
    if (e.target.id !== 'vfText') return;
    var me = meSeller(), a = $('#vfGo'), txt = e.target.value.trim(); if (!me || !a) return;
    var msg = 'Hola ' + (d.settings.owner || 'Moisés') + ' 👋 Te reenvío la consulta de un cliente mío (' + me.name + '):\n\n' + txt;
    a.href = txt ? 'https://wa.me/' + GR.digits(d.settings.whatsapp) + '?text=' + encodeURIComponent(msg) : '#'; a.setAttribute('aria-disabled', String(!txt));
  });

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
    F.name = name; F.price = price; F.oldPrice = old || 0; F.sale = num($('#pfSale').value); F.desc = $('#pfDesc').value.trim();
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
    v.innerHTML = tagSwitch('brands') + '<div class="sec-head"><div><h2>Marcas</h2><p>Crea las marcas que vendes. Aparecen como filtro en la tienda y en cada producto.</p></div></div>' +
      '<form class="addrow" data-add="brands"><label class="sr" for="newBrand">Nueva marca</label><input class="in" id="newBrand" maxlength="30" placeholder="Nueva marca, ej. Converse" autocomplete="off"><button class="btn" type="submit">Crear marca</button></form>' +
      '<div class="rows">' + (d.brands.length ? d.brands.map(function (b, i) {
        var n = d.products.filter(function (p) { return p.brand === b.id; }).length;
        return '<div class="row"><label class="sr" for="b' + i + '">Nombre de la marca</label><input class="in" id="b' + i + '" value="' + esc(b.name) + '" maxlength="30" data-ren="brands" data-id="' + esc(b.id) + '"><small>' + plural(n, 'par', 'pares') + '</small>' +
          '<span class="acts"><button class="sq" type="button" data-up="brands" data-i="' + i + '" aria-label="Subir"' + (i === 0 ? ' disabled' : '') + '>↑</button><button class="sq" type="button" data-down="brands" data-i="' + i + '" aria-label="Bajar"' + (i === d.brands.length - 1 ? ' disabled' : '') + '>↓</button>' +
          '<button class="pill danger" type="button" data-delb="brands" data-id="' + esc(b.id) + '">Borrar</button></span></div>';
      }).join('') : '<p class="empty-note">Aún no hay marcas. Crea la primera arriba.</p>') + '</div>';
  }
  function viewSections(v) {
    v.innerHTML = tagSwitch('sections') + '<div class="sec-head"><div><h2>Secciones</h2><p>Hombre, Mujer, Promociones o la que quieras (Niños, Nuevos, Outlet). Un par puede estar en varias secciones.</p></div></div>' +
      '<form class="addrow" data-add="sections"><label class="sr" for="newSec">Nueva sección</label><input class="in" id="newSec" maxlength="30" placeholder="Nueva sección, ej. Niños" autocomplete="off"><button class="btn" type="submit">Crear sección</button></form>' +
      '<div class="rows">' + (d.sections.length ? d.sections.map(function (s, i) {
        var n = d.products.filter(function (p) { return p.sections.indexOf(s.id) > -1; }).length;
        return '<div class="row"><label class="sr" for="s' + i + '">Nombre de la sección</label><input class="in" id="s' + i + '" value="' + esc(s.name) + '" maxlength="30" data-ren="sections" data-id="' + esc(s.id) + '"><small>' + plural(n, 'par', 'pares') + '</small>' +
          '<span class="acts"><button class="pill" type="button" aria-pressed="' + !!s.promo + '" data-promo="' + esc(s.id) + '" title="Se muestra con color de promoción">Promoción</button>' +
          '<button class="sq" type="button" data-up="sections" data-i="' + i + '" aria-label="Subir"' + (i === 0 ? ' disabled' : '') + '>↑</button><button class="sq" type="button" data-down="sections" data-i="' + i + '" aria-label="Bajar"' + (i === d.sections.length - 1 ? ' disabled' : '') + '>↓</button>' +
          '<button class="pill danger" type="button" data-delb="sections" data-id="' + esc(s.id) + '">Borrar</button></span></div>';
      }).join('') : '<p class="empty-note">Aún no hay secciones. Crea la primera arriba.</p>') + '</div>';
  }

  /* ---------- etiquetas: marcas y secciones juntas ---------- */
  function tagSwitch(cur) {
    return '<div class="seg tagseg" role="group" aria-label="Marcas o secciones"><button type="button" data-go="brands" aria-pressed="' + (cur === 'brands') + '">Marcas</button><button type="button" data-go="sections" aria-pressed="' + (cur === 'sections') + '">Secciones</button></div>';
  }
  function clean(t) { return String(t || '').replace(/\n#v:[a-z0-9-]+\s*$/, ''); }

  /* ---------- formulario: para quién, color y suela ---------- */
  function drawStyle() {
    $('#pfGen').innerHTML = [['h', 'Hombre'], ['m', 'Mujer'], ['u', 'Unisex']].map(function (g) { return '<button type="button" data-gen="' + g[0] + '" aria-pressed="' + (F.gen === g[0]) + '">' + g[1] + '</button>'; }).join('');
    $('#pfColor').innerHTML = GR.COLORS.map(function (c) { return '<button type="button" class="swc" data-col="' + c.id + '" aria-pressed="' + (F.color === c.id) + '" aria-label="' + esc(c.n) + '" title="' + esc(c.n) + '" style="--sw:' + c.hex + '"></button>'; }).join('');
    $('#pfSole').innerHTML = GR.SOLES.map(function (c) { return '<button type="button" class="swc sole" data-sol="' + c.id + '" aria-pressed="' + (F.sole === c.id) + '" aria-label="Suela ' + esc(c.n.toLowerCase()) + '" title="Suela ' + esc(c.n.toLowerCase()) + '" style="--sw:' + c.hex + '"></button>'; }).join('');
  }

  /* ---------- vendedores (solo Moisés) ---------- */
  function storeBase() { return location.origin + '/'; }
  function sellerUrl(s) { return storeBase() + '?v=' + s.code; }
  function firstName(n) { return String(n || '').trim().split(/\s+/)[0] || ''; }
  function makeCode(name) {
    var base = firstName(name).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 12) || 'vend', code;
    do { code = base + '-' + Math.random().toString(36).slice(2, 5); } while ((d.sellers || []).some(function (s) { return s.code === code; }));
    return code;
  }
  function copyTxt(txt, okMsg) {
    function legacy() {
      var a = document.createElement('textarea'); a.value = txt; a.setAttribute('readonly', ''); a.style.cssText = 'position:fixed;left:-999px;top:0'; document.body.appendChild(a); a.select();
      var ok = false; try { ok = document.execCommand('copy'); } catch (e) { /* nada */ } a.remove(); toast(ok ? okMsg : 'No se pudo copiar. Selecciónalo y cópialo a mano.');
    }
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(txt).then(function () { toast(okMsg); }, legacy); else legacy();
  }
  function credMsg(s) {
    var c = CRED[s.id];
    return 'Hola ' + firstName(s.name) + ' 👋 Ya eres vendedor de GRA$A MC-STORE.\n\n' +
      '🔗 Tu panel: ' + storeBase() + 'panel\n' + (c ? '📧 Correo: ' + c.mail + '\n🔑 Contraseña: ' + c.pass + '\n' : '') +
      '\n🛍️ Tu enlace para tus clientes: ' + sellerUrl(s) + '\n\nEntra a tu panel, copia tu enlace y compártelo. Cuando un cliente te escriba, desde tu panel se lo reenvías a ' + (d.settings.owner || 'Moisés') + ' en un toque.';
  }
  function viewSellers(v) {
    var L = d.sellers || [];
    v.innerHTML = '<div class="sec-head"><div><h2>Vendedores</h2><p>Crea el acceso de cada vendedor. Cada uno recibe su propio enlace de la tienda y un panel donde ve los pares con el precio de venta.</p></div></div>' +
      '<form class="box sellf" id="sellf" novalidate><h3>Nuevo vendedor</h3>' +
      '<div class="two"><div class="field"><label for="svName">Nombre completo</label><input class="in" id="svName" maxlength="60" autocomplete="off" placeholder="Ej. Camilo Pérez"></div>' +
      '<div class="field"><label for="svPhone">WhatsApp del vendedor</label><input class="in" id="svPhone" inputmode="tel" autocomplete="off" placeholder="+57 300 000 0000"></div></div>' +
      '<div class="two"><div class="field"><label for="svMail">Correo</label><input class="in" id="svMail" type="email" inputmode="email" autocapitalize="off" autocomplete="off" placeholder="vendedor@correo.com"></div>' +
      '<div class="field"><label for="svPass">Contraseña</label><div class="pw"><input class="in" id="svPass" type="password" autocomplete="new-password" placeholder="Mínimo 8 caracteres"><button type="button" class="eye" data-eye="svPass" aria-label="Mostrar contraseña">👁</button></div></div></div>' +
      '<p class="err" id="svErr" role="alert" hidden></p>' +
      '<div><button class="btn" type="submit" id="svBtn">Crear vendedor</button></div>' +
      '<p class="fine">Con estos datos el vendedor entra a este panel. Después de crearlo te aparece el botón para enviarle sus accesos por WhatsApp.</p></form>' +
      '<div class="rows sell-rows">' + (L.length ? L.map(function (s) {
        var link = sellerUrl(s);
        return '<div class="row sell' + (s.on === false ? ' off' : '') + '"><div class="sell-info"><b>' + esc(s.name) + '</b><small>' + esc(GR.prettyPhone(s.phone)) + ' · ' + esc(s.em || '') + '</small><code>' + esc(link.replace(/^https?:\/\//, '')) + '</code></div>' +
          '<span class="acts"><button class="pill" type="button" data-sell-copy="' + esc(s.id) + '">Copiar enlace</button>' +
          '<a class="pill wa" target="_blank" rel="noopener" href="' + esc('https://wa.me/' + GR.digits(s.phone) + '?text=' + encodeURIComponent(credMsg(s))) + '">' + (CRED[s.id] ? 'Enviar accesos' : 'Enviar enlace') + '</a>' +
          '<button class="pill" type="button" aria-pressed="' + (s.on !== false) + '" data-sell-on="' + esc(s.id) + '">' + (s.on === false ? 'Inactivo' : 'Activo') + '</button>' +
          '<button class="pill danger" type="button" data-sell-del="' + esc(s.id) + '">Borrar</button></span></div>';
      }).join('') : '<p class="empty-note">Aún no tienes vendedores. Crea el primero arriba.</p>') + '</div>';
  }
  function createSeller(e) {
    e.preventDefault();
    var name = $('#svName').value.trim().replace(/\s+/g, ' '), ph = GR.digits($('#svPhone').value), mail = $('#svMail').value.trim().toLowerCase(), pass = $('#svPass').value;
    var err = $('#svErr'), btn = $('#svBtn'); if (ph.length === 10) ph = '57' + ph;
    var m = '';
    if (name.length < 3) m = 'Escribe el nombre completo del vendedor.';
    else if (ph.length < 11) m = 'Escribe el WhatsApp con el indicativo, por ejemplo +57 300 000 0000.';
    else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(mail)) m = 'Revisa el correo, parece incompleto.';
    else if (pass.length < 8) m = 'La contraseña debe tener mínimo 8 caracteres.';
    else if ((window.GRCFG && GRCFG.admins || []).indexOf(mail) > -1) m = 'Ese correo es de un administrador.';
    else if ((d.sellers || []).some(function (s) { return s.eh === GR.sha(mail); })) m = 'Ese correo ya es de un vendedor.';
    if (m) { err.textContent = m; err.hidden = false; return; }
    if (!GR.signup) { err.textContent = 'Los vendedores solo se pueden crear con la tienda conectada a Supabase.'; err.hidden = false; return; }
    err.hidden = true; btn.disabled = true; btn.textContent = 'Creando…';
    GR.signup(mail, pass, name).then(function (r) {
      var s = { id: GR.uid('v'), code: makeCode(name), name: name, phone: ph, eh: GR.sha(mail), em: GR.maskMail(mail), on: true };
      d.sellers = (d.sellers || []).concat([s]); CRED[s.id] = { mail: mail, pass: pass };
      if (commit('Vendedor creado: ' + firstName(name))) {
        render();
        if (!r.confirmed) toast('Si le pide confirmar el correo, apaga «Confirm email» en Supabase (Authentication).');
      } else d.sellers = d.sellers.filter(function (x) { return x.id !== s.id; });
    }).catch(function (x) { err.textContent = x.message || 'No se pudo crear el vendedor.'; err.hidden = false; btn.disabled = false; btn.textContent = 'Crear vendedor'; });
  }

  /* ---------- panel del vendedor ---------- */
  function sellerHead(me, title, sub) {
    return '<div class="sec-head"><div><h2>' + title + '</h2><p>' + sub + '</p></div></div>';
  }
  function viewVCat(v) {
    var me = meSeller(); if (!me) { denied(); return; }
    var wa = GR.digits(d.settings.whatsapp), owner = d.settings.owner || 'Moisés';
    var list = d.products.filter(function (p) { return !p.hidden; }).sort(function (a, b) { return b.n - a.n; });
    v.innerHTML = sellerHead(me, 'Hola, ' + esc(firstName(me.name)), 'Estos son los pares con tu precio de venta. Toca una talla y le preguntas a ' + esc(owner) + ' si está, ya con el mensaje armado.') +
      (list.length ? '<div class="plist">' + list.map(function (p) {
        var price = +p.sale || p.price;
        var sizes = p.sizes.map(function (n) {
          var txt = 'Hola ' + owner + ' 👋 Soy ' + me.name + '. Un cliente pregunta por este par:\n\n👟 *' + p.name + '*' + (GR.brandName(d, p.brand) ? ' (' + GR.brandName(d, p.brand) + ')' : '') + ' · Ref ' + p.ref + '\n📏 Talla: *' + n + '* (EU)\n💰 ' + GR.money(price) + '\n\n¿Está disponible?';
          return '<a class="szq" target="_blank" rel="noopener" href="https://wa.me/' + wa + '?text=' + encodeURIComponent(txt) + '">' + n + '</a>';
        }).join('');
        return '<article class="prow vrow' + (p.soldOut ? ' off' : '') + '"><div class="th">' + GR.art(p) + '</div><div class="info"><b>' + esc(p.name) + '</b><small>' + esc(GR.brandName(d, p.brand) || 'Sin marca') + ' · ' + esc(p.ref) + (p.soldOut ? ' · AGOTADO' : '') + '</small>' +
          '<span class="price">' + GR.money(price) + '</span>' + (+p.sale ? '<small>Tu precio de venta · en tienda: ' + GR.money(p.price) + '</small>' : '<small>Precio de la tienda</small>') + '</div>' +
          '<div class="szq-wrap"><span class="lbl">Preguntar talla a ' + esc(owner) + '</span><div class="szq-row">' + sizes + '</div></div></article>';
      }).join('') + '</div>' : '<p class="empty-note">Todavía no hay pares en la tienda.</p>');
  }
  function viewVLink(v) {
    var me = meSeller(); if (!me) { denied(); return; }
    var link = sellerUrl(me), owner = d.settings.owner || 'Moisés';
    v.innerHTML = sellerHead(me, 'Mi enlace', 'Compártelo con tus clientes. Ven la tienda con tus precios y te escriben directo a ti.') +
      '<section class="box"><h3>Tu enlace de la tienda</h3><code class="linkbox">' + esc(link) + '</code>' +
      '<div class="acts-row"><button class="btn" type="button" data-vcopy>Copiar enlace</button><button class="btn ghost" type="button" data-vshare>Compartir</button><a class="btn ghost" href="' + esc(link) + '" target="_blank" rel="noopener">Ver mi tienda</a></div></section>' +
      '<section class="box"><h3>Reenviar a ' + esc(owner) + '</h3><p class="muted">Pega aquí el mensaje que te mandó el cliente y se lo envías a ' + esc(owner) + ' en un toque.</p>' +
      '<label class="sr" for="vfText">Mensaje del cliente</label><textarea class="in" id="vfText" rows="5" placeholder="Pega el mensaje del cliente"></textarea>' +
      '<div><a class="btn wa" id="vfGo" href="#" target="_blank" rel="noopener" aria-disabled="true"><svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.16-.17.2-.35.22-.64.07-.3-.15-1.26-.46-2.4-1.48-.89-.8-1.48-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.14-.13.3-.35.45-.52.15-.18.2-.3.3-.5.1-.21.05-.38-.03-.53-.07-.15-.67-1.62-.92-2.2-.24-.59-.49-.51-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.87 1.22 3.07c.15.2 2.1 3.2 5.08 4.48.7.3 1.26.49 1.7.63.71.23 1.36.2 1.87.12.57-.08 1.76-.72 2-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35M12.05 21.8a9.9 9.9 0 0 1-5.03-1.38l-.36-.21-3.74.98 1-3.65-.24-.37A9.86 9.86 0 0 1 2.2 11.9C2.2 6.45 6.64 2 12.1 2c2.64 0 5.12 1.03 6.99 2.9a9.83 9.83 0 0 1 2.9 7c0 5.45-4.44 9.9-9.94 9.9Z"/></svg>Enviar a ' + esc(owner) + '</a></div></section>';
  }

  /* ---------- dashboard de visitas ---------- */
  function dayStart(offsetDays) { var x = new Date(); x.setHours(0, 0, 0, 0); return x.getTime() - offsetDays * 864e5; }
  function dayKey(t) { var x = new Date(t); return x.getFullYear() + '-' + (x.getMonth() + 1) + '-' + x.getDate(); }
  function originLabel(o) {
    if (!o) return 'Directo';
    if (/^src:/.test(o)) { var s = o.slice(4); return s === 'share' ? 'Enlace compartido' : s; }
    var h = ''; try { h = new URL(o).hostname.replace(/^www\./, ''); } catch (e) { h = o; }
    if (/instagram/.test(h)) return 'Instagram'; if (/tiktok/.test(h)) return 'TikTok'; if (/facebook|(^|\.)fb\./.test(h)) return 'Facebook';
    if (/whatsapp|wa\.me/.test(h)) return 'WhatsApp'; if (/google/.test(h)) return 'Google'; if (/onytek|vercel/.test(h) || h === location.hostname) return 'Interno';
    return h;
  }
  function tally(arr, keyf) { var c = {}; arr.forEach(function (r) { var k = keyf(r); if (k != null) c[k] = (c[k] || 0) + 1; }); return Object.keys(c).map(function (k) { return { name: k, n: c[k] }; }).sort(function (a, b) { return b.n - a.n; }); }
  function blist(items) {
    if (!items.length) return '<p class="empty-note">Sin datos todavía.</p>';
    var max = Math.max.apply(null, items.map(function (i) { return i.n; }).concat([1]));
    return '<ul class="bl">' + items.map(function (i) { return '<li><span class="bl-n">' + esc(i.name) + '</span><span class="bl-t"><i style="width:' + Math.max(4, Math.round(i.n / max * 100)) + '%"></i></span><b>' + i.n + '</b></li>'; }).join('') + '</ul>';
  }
  function chart(items, label) {
    var W = 640, H = 150, top = 18, n = items.length, bw = W / n, max = Math.max.apply(null, items.map(function (i) { return i.v; }).concat([1])), every = n > 16 ? Math.ceil(n / 8) : 1, g = '';
    items.forEach(function (it, i) {
      var x = i * bw + bw * .14, w = bw * .72, h = Math.round(it.v / max * H);
      g += '<rect class="cb" x="' + x.toFixed(1) + '" y="' + (top + H - h) + '" width="' + w.toFixed(1) + '" height="' + (it.v ? Math.max(h, 2) : 0) + '" rx="3"><title>' + esc(it.t) + ': ' + it.v + ' visitas' + (it.a ? ' · ' + it.a + ' consultas' : '') + '</title></rect>';
      if (it.a) { var ah = Math.max(3, Math.round(it.a / max * H)); g += '<rect class="ca" x="' + (x + w * .24).toFixed(1) + '" y="' + (top + H - ah) + '" width="' + (w * .52).toFixed(1) + '" height="' + ah + '" rx="2"/>'; }
      if (n <= 14 && it.v) g += '<text class="cv" x="' + (i * bw + bw / 2).toFixed(1) + '" y="' + (top + H - h - 5) + '" text-anchor="middle">' + it.v + '</text>';
      if (i % every === 0) g += '<text class="cl" x="' + (i * bw + bw / 2).toFixed(1) + '" y="' + (top + H + 18) + '" text-anchor="middle">' + esc(it.l) + '</text>';
    });
    return '<svg class="chart" viewBox="0 0 ' + W + ' ' + (top + H + 26) + '" role="img" aria-label="' + esc(label) + '"><line class="cbase" x1="0" y1="' + (top + H) + '" x2="' + W + '" y2="' + (top + H) + '"/>' + g + '</svg>';
  }
  function viewStats(v) {
    var head = '<div class="sec-head"><div><h2>Visitas</h2><p>Cuánta gente entra a la tienda, de dónde llega y qué pares mira.</p></div>' +
      '<div class="seg" role="group" aria-label="Periodo">' + [[1, 'Hoy'], [7, '7 días'], [30, '30 días']].map(function (x) { return '<button type="button" data-sp="' + x[0] + '" aria-pressed="' + (P === x[0]) + '">' + x[1] + '</button>'; }).join('') + '</div></div>';
    if (!GR.live) { v.innerHTML = head + '<p class="empty-note">El dashboard se activa cuando la tienda está conectada a Supabase (la tienda real).</p>'; return; }
    if (M.err) { v.innerHTML = head + '<p class="err">No se pudieron cargar las visitas. Revisa tu internet e intenta de nuevo.</p><button class="btn ghost small" type="button" data-refresh>Reintentar</button>'; return; }
    if (!M.all) { v.innerHTML = head + '<p class="empty-note">Cargando visitas…</p>'; return; }
    var from = dayStart(P - 1), rows = M.all.filter(function (r) { return new Date(r.t).getTime() >= from; });
    var vis = rows.filter(function (r) { return r.tipo === 'visita'; }), asks = rows.filter(function (r) { return r.tipo === 'ask'; }), views = rows.filter(function (r) { return r.tipo === 'par'; });
    var ids = {}, fresh = 0; vis.forEach(function (r) { var m = /u:([a-z0-9]+)(\|n)?/.exec(r.texto || ''); if (m) { ids[m[1]] = 1; if (m[2]) fresh++; } });
    var uniq = Object.keys(ids).length || vis.length, conv = vis.length ? Math.round(asks.length / vis.length * 100) : 0;
    /* serie de tiempo */
    var items = [], i;
    if (P === 1) { for (i = 0; i < 24; i++) items.push({ l: i % 3 === 0 ? i + 'h' : '', t: i + ':00', v: 0, a: 0 }); vis.forEach(function (r) { items[new Date(r.t).getHours()].v++; }); asks.forEach(function (r) { items[new Date(r.t).getHours()].a++; }); }
    else {
      var idx = {};
      for (i = P - 1; i >= 0; i--) { var t0 = dayStart(i), k = dayKey(t0), lbl = new Date(t0).toLocaleDateString('es-CO', { day: 'numeric', month: 'short' }); idx[k] = items.length; items.push({ l: lbl, t: lbl, v: 0, a: 0 }); }
      vis.forEach(function (r) { var j = idx[dayKey(new Date(r.t).getTime())]; if (j != null) items[j].v++; }); asks.forEach(function (r) { var j = idx[dayKey(new Date(r.t).getTime())]; if (j != null) items[j].a++; });
    }
    var hours = []; for (i = 0; i < 24; i++) hours.push({ l: i % 3 === 0 ? i + 'h' : '', t: i + ':00', v: 0, a: 0 }); vis.forEach(function (r) { hours[new Date(r.t).getHours()].v++; });
    var dev = tally(vis, function (r) { return r.dispositivo === 'movil' ? 'Celular' : 'Computador'; });
    var orig = tally(vis, function (r) { return originLabel(r.origen); }).slice(0, 6);
    var top = tally(views, function (r) { return r.ref; }).map(function (x) { var p = d.products.filter(function (q) { return q.ref === x.name; })[0]; return p ? { name: p.name, n: x.n } : null; }).filter(Boolean).slice(0, 6);
    var sv = (d.sellers || []).map(function (s) {
      var vn = vis.filter(function (r) { return r.ref === 'v:' + s.code; }).length, an = asks.filter(function (r) { return (r.texto || '').indexOf('#v:' + s.code) > -1; }).length;
      return { name: s.name, v: vn, a: an };
    }).filter(function (s) { return s.v || s.a; }).sort(function (a, b) { return b.v - a.v; });
    var last = asks.slice(0, 4);
    v.innerHTML = head +
      '<div class="stats dash-k"><div class="stat"><b>' + vis.length + '</b><span>Visitas</span></div><div class="stat"><b>' + uniq + '</b><span>Personas distintas</span></div>' +
      '<div class="stat hot"><b>' + asks.length + '</b><span>Consultas por WhatsApp</span></div><div class="stat"><b>' + conv + '%</b><span>Consultas por cada visita</span></div></div>' +
      '<section class="box"><h3>' + (P === 1 ? 'Visitas por hora' : 'Visitas por día') + '</h3>' + chart(items, P === 1 ? 'Visitas por hora de hoy' : 'Visitas por día') +
      '<p class="legend"><i class="lg-v"></i>Visitas <i class="lg-a"></i>Consultas por WhatsApp' + (fresh ? ' · ' + fresh + ' personas nuevas' : '') + '</p></section>' +
      '<div class="two-col"><section class="box"><h3>De dónde llegan</h3>' + blist(orig) + '</section>' +
      '<section class="box"><h3>Con qué entran</h3>' + blist(dev) + '</section></div>' +
      '<div class="two-col"><section class="box"><h3>Pares más mirados</h3>' + blist(top) + '</section>' +
      '<section class="box"><h3>A qué hora entran</h3>' + chart(hours, 'Visitas por hora del día') + '</section></div>' +
      (sv.length ? '<section class="box"><h3>Por vendedor</h3><ul class="bl sv">' + sv.map(function (s) { return '<li><span class="bl-n">' + esc(s.name) + '</span><b>' + s.v + ' visitas · ' + s.a + ' consultas</b></li>'; }).join('') + '</ul></section>' : '') +
      (last.length ? '<section class="box"><h3>Últimas consultas</h3><div class="log">' + last.map(function (l) { return '<div><time>' + esc(fmtTime(l.t)) + '</time><div class="msg">' + esc(clean(l.texto)) + '</div></div>'; }).join('') + '</div></section>' : '') +
      '<div class="reset"><button class="btn ghost small" type="button" data-refresh>Actualizar</button><span class="fine">Las visitas se cuentan una vez por persona y por sesión.</span></div>';
  }

  /* ---------- quién entró ---------- */
  function meSeller() {
    var h = GR.sha(((GR.user && GR.user()) || '').toLowerCase());
    return (d.sellers || []).filter(function (s) { return s.eh === h && s.on !== false; })[0] || null;
  }
  function resolveRole() {
    if (!GR.live) { role = 'admin'; return; }
    var mail = ((GR.user && GR.user()) || '').toLowerCase(), adm = (window.GRCFG && window.GRCFG.admins) || null;
    role = (!adm || adm.indexOf(mail) > -1) ? 'admin' : (meSeller() ? 'seller' : 'none');
  }
  function applyRole() {
    document.body.dataset.role = role;
    $$('#tabs button').forEach(function (b) { b.hidden = b.dataset.role !== role; });
  }
  function denied() {
    $$('#tabs button').forEach(function (b) { b.hidden = true; });
    $('#view').innerHTML = '<section class="box"><h3>Sin acceso</h3><p class="muted">Esta cuenta no tiene acceso al panel. Pídele a ' + esc(d.settings.owner || 'Moisés') + ' que te cree como vendedor.</p><div><button class="btn ghost small" type="button" data-logout>Cerrar sesión</button></div></section>';
  }

  /* ---------- ajustes ---------- */
  function viewSettings(v) {
    var s = d.settings;
    function pend(k) { return (s[k] || '').trim() ? '' : '<span class="pending">Pendiente</span>'; }
    v.innerHTML = '<div class="sec-head"><div><h2>Ajustes</h2><p>Los datos de contacto que se ven en la tienda. Lo que dejes vacío aparece como “Próximamente”.</p></div></div>' +
      '<form class="form-grid" id="setf" novalidate>' +
      '<div class="field"><label for="sMe">Nombre de tu perfil</label><input class="in" id="sMe" value="' + esc(whoName(s)) + '" maxlength="40" placeholder="Ej. Fabian Cardona"><small class="muted">Es el nombre del saludo del panel cuando entras con tu correo' + (GR.live && GR.user() ? ' (' + esc(GR.user()) + ')' : '') + '. Cada persona que entra pone el suyo.</small></div>' +
      '<div class="two"><div class="field"><label for="sOwner">Nombre del dueño en la tienda</label><input class="in" id="sOwner" value="' + esc(s.owner) + '" maxlength="30"><small class="muted">Sale en “Hablar con…” y en los mensajes de WhatsApp.</small></div>' +
      '<div class="field"><label for="sWa">WhatsApp donde llegan los mensajes</label><input class="in" id="sWa" inputmode="tel" value="' + esc(GR.prettyPhone(s.whatsapp)) + '" placeholder="+57 300 000 0000"></div></div>' +
      '<div class="field"><label for="sBanner">Frase del letrero grande</label><input class="in" id="sBanner" value="' + esc(s.banner || '') + '" maxlength="70" placeholder="Ej. Mis pies no alcanzan para tanto par."><small class="muted">Sale en grande entre los tennis y la comunidad. Déjala vacía si no quieres letrero.</small></div>' +
      '<div class="field"><label for="sSpot">Canción de Spotify' + pend('spotify') + '</label><input class="in" id="sSpot" inputmode="url" value="' + esc(s.spotify || '') + '" placeholder="https://open.spotify.com/track/..."><small class="muted">En Spotify: toca los tres puntos de la canción, Compartir, Copiar enlace. Pégalo aquí.</small></div>' +
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
    var spot = $('#sSpot').value.trim();
    if (spot && !/open\.spotify\.com\/(intl-[a-z-]+\/)?(track|album|playlist|episode)\//.test(spot)) { err.textContent = 'El enlace de Spotify debe empezar por open.spotify.com. Cópialo desde Spotify con Compartir > Copiar enlace.'; err.hidden = false; return; }
    err.hidden = true;
    var key = ((GR.user && GR.user()) || '').toLowerCase() || '_', names = Object.assign({}, d.settings.names || {}), me = $('#sMe').value.trim();
    if (me) names[key] = me; else delete names[key];
    d.settings = {
      names: names, banner: $('#sBanner').value.trim(), spotify: spot, owner: $('#sOwner').value.trim() || 'Moisés', whatsapp: wa, slogan: $('#sSlogan').value.trim(),
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
    if ((el = t.closest('[data-eye]'))) { var pi = $('#' + el.dataset.eye); pi.type = pi.type === 'password' ? 'text' : 'password'; return; }
    if ((el = t.closest('[data-sp]'))) { P = +el.dataset.sp; render(); return; }
    if (t.closest('[data-refresh]')) { M.all = null; M.err = false; render(); loadMetrics(); return; }
    if ((el = t.closest('[data-sell-copy]'))) { var sl = (d.sellers || []).filter(function (x) { return x.id === el.dataset.sellCopy; })[0]; if (sl) copyTxt(sellerUrl(sl), 'Enlace copiado'); return; }
    if ((el = t.closest('[data-sell-on]'))) { (d.sellers || []).forEach(function (x) { if (x.id === el.dataset.sellOn) x.on = x.on === false; }); if (commit('Actualizado')) render(); return; }
    if ((el = t.closest('[data-sell-del]'))) {
      var sid = el.dataset.sellDel;
      if (arm !== 'sv' + sid) { arm = 'sv' + sid; $$('.pill.danger.arm').forEach(function (b) { b.classList.remove('arm'); b.textContent = 'Borrar'; }); el.classList.add('arm'); el.textContent = '¿Seguro?'; return; }
      arm = null; d.sellers = (d.sellers || []).filter(function (x) { return x.id !== sid; }); if (commit('Vendedor borrado')) render(); return;
    }
    if (t.closest('[data-vcopy]')) { var me1 = meSeller(); if (me1) copyTxt(sellerUrl(me1), 'Enlace copiado'); return; }
    if (t.closest('[data-vshare]')) { var me2 = meSeller(); if (!me2) return; if (navigator.share) navigator.share({ title: 'GRA$A MC-STORE', text: 'Mira mi tienda de tennis', url: sellerUrl(me2) }).catch(function () { /* cancelado */ }); else copyTxt(sellerUrl(me2), 'Enlace copiado'); return; }
    if ((el = t.closest('#vfGo'))) { if (el.getAttribute('aria-disabled') === 'true') e.preventDefault(); return; }
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
    if ((el = t.closest('#pfColor [data-col]'))) { F.color = F.color === el.dataset.col ? '' : el.dataset.col; drawStyle(); drawPreview(); return; }
    if ((el = t.closest('#pfSole [data-sol]'))) { F.sole = F.sole === el.dataset.sol ? '' : el.dataset.sol; drawStyle(); drawPreview(); return; }
    if ((el = t.closest('#pfGen [data-gen]'))) { F.gen = F.gen === el.dataset.gen ? '' : el.dataset.gen; drawStyle(); return; }
    if (t.closest('#pfNoPhoto')) { F.img = null; F.ix = 0; F.iy = 0; F.iz = 1; F.ifit = 'cover'; $('#pfFile').value = ''; drawPreview(); return; }
    if (t.closest('#pfCenter')) { F.ix = 0; F.iy = 0; F.iz = 1; drawPreview(); return; }
    if (t.closest('#pfFit')) { F.ifit = F.ifit === 'contain' ? 'cover' : 'contain'; drawPreview(); return; }
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
        F.img = img; F.ix = 0; F.iy = 0; F.iz = 1; F.ifit = 'cover'; drawPreview();
      });
    }
  });

  document.addEventListener('submit', function (e) {
    var f = e.target;
    if (f.id === 'pf') { saveForm(e); return; }
    if (f.id === 'setf') { saveSettings(e); return; }
    if (f.id === 'sellf') { createSeller(e); return; }
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
    document.body.classList.remove('locked');
    if (GR.live) {
      var to = $('#topOut'); if (to) to.hidden = false;
      $('#view').innerHTML = '<p class="empty-note">Cargando tu panel…</p>';
      GR.init(function () {
        d = GR.get(); resolveRole(); applyRole();
        if (role === 'none') { denied(); return; }
        setTab(role === 'seller' ? 'vcat' : 'home');
        if (role === 'admin') loadMetrics();
      });
    } else { applyRole(); document.body.dataset.tab = tab; render(); }
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