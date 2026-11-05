/* GRA$A MC-STORE · prototipo · datos compartidos, dibujo de zapatillas y mensajes de WhatsApp.
   Desarrollado por Onytek. Los datos viven en el navegador de quien prueba el prototipo. */
(function () {
  'use strict';

  var KEY = 'grasa-mc-proto-v2';
  var SIZES = [35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46];
  var US = { 35: '3', 36: '4', 37: '4.5', 38: '5.5', 39: '6.5', 40: '7', 41: '8', 42: '8.5', 43: '9.5', 44: '10', 45: '11', 46: '12' };

  /* [parte alta, paneles, detalle] */
  var PALETTES = [
    { n: 'Rojo y negro', c: ['#C81E30', '#17171A', '#F1F0EE'] },
    { n: 'Rosa pop', c: ['#F27BA8', '#FFFFFF', '#D62839'] },
    { n: 'Negro total', c: ['#1A1A1E', '#2E2E35', '#D62839'] },
    { n: 'Blanco', c: ['#F4F4F2', '#CFCFD6', '#D62839'] },
    { n: 'Arena', c: ['#C9B28E', '#F1F0EE', '#8C6E45'] },
    { n: 'Gris y azul', c: ['#8C8E98', '#2C3A57', '#F7931E'] },
    { n: 'Fuego', c: ['#F7931E', '#D62839', '#17171A'] },
    { n: 'Negro y rosa', c: ['#17171A', '#F27BA8', '#F1F0EE'] }
  ];

  function defaults() {
    function p(n, name, brand, secs, price, old, sizes, pal, style, desc, sold) {
      return {
        id: 'p' + n, ref: 'GM-' + String(n).padStart(3, '0'), n: n, name: name, brand: brand, sections: secs,
        price: price, oldPrice: old || 0, sizes: sizes, soldOut: !!sold, hidden: false, pal: pal, style: style,
        img: null, desc: desc, sample: true
      };
    }
    function r(a, b) { var o = []; for (var i = a; i <= b; i++) o.push(i); return o; }
    return {
      v: 1, seq: 11,
      settings: {
        owner: 'Moisés', names: {}, banner: 'Mis pies no alcanzan para tanto par.', spotify: '', whatsapp: '573145505717', slogan: 'Tu talla. Tu estilo. Tu calle.',
        instagram: '', tiktok: 'https://www.tiktok.com/@grasamcstore33', facebook: '', community: 'https://chat.whatsapp.com/L0xldOMPQKaCPyI90AeyK0'
      },
      brands: [
        { id: 'b1', name: 'Nike' }, { id: 'b2', name: 'Jordan' }, { id: 'b3', name: 'Adidas' },
        { id: 'b4', name: 'New Balance' }, { id: 'b5', name: 'Puma' }
      ],
      sections: [
        { id: 's1', name: 'Hombre', promo: false },
        { id: 's2', name: 'Mujer', promo: false },
        { id: 's3', name: 'Promociones', promo: true }
      ],
      products: [
        p(1, 'Retro Alta Rojo y Negro', 'b2', ['s1'], 649900, 0, r(40, 45), 0, 'high', 'Caña alta y suela blanca. Para el que entra y se nota.'),
        p(2, 'Retro Mid Rosa', 'b2', ['s2'], 599900, 0, r(35, 40), 1, 'high', 'Rosa pop con detalles rojos. Pide la talla antes de que vuele.'),
        p(3, 'Dunk Low Pink Pop', 'b1', ['s2', 's3'], 459900, 520000, r(36, 39), 1, 'low', 'Bajita, limpia y en promoción esta semana.'),
        p(4, 'Court Clásico Negro', 'b3', ['s1', 's2'], 389900, 0, r(37, 44), 7, 'low', 'El par que combina con todo el clóset.'),
        p(5, 'Boost Arena', 'b3', ['s1'], 529900, 0, r(41, 46), 4, 'low', 'Color arena, suela cómoda para caminar todo el día.'),
        p(6, '990 Gris Ciudad', 'b4', ['s1', 's2'], 579900, 0, r(38, 44), 5, 'low', 'Gris con azul. Se ve bien en la calle y en la oficina.'),
        p(7, 'Runner Fuego', 'b1', ['s1', 's3'], 479900, 559900, r(40, 44), 6, 'low', 'Naranja y rojo para salir a prender la ciudad.'),
        p(8, 'Suede Rosa Street', 'b5', ['s2'], 349900, 0, r(35, 40), 7, 'low', 'Ligera, cómoda y con mucha actitud.'),
        p(9, 'Air Noche', 'b1', ['s1'], 689900, 0, [41, 42, 43], 2, 'high', 'Negro total. Este par ya se agotó, pregunta cuándo llega.', true),
        p(10, 'Low Blanco Total', 'b1', ['s1', 's2', 's3'], 419900, 469900, r(36, 43), 3, 'low', 'Blanco impecable, promoción por tiempo limitado.')
      ],
      log: []
    };
  }

  var mem = null;
  function load() {
    try {
      var raw = localStorage.getItem(KEY);
      if (raw) { mem = raw; return JSON.parse(raw); }
    } catch (e) { /* sin almacenamiento */ }
    if (mem) { try { return JSON.parse(mem); } catch (e2) { /* sigue */ } }
    return defaults();
  }
  function save(d) {
    var s = JSON.stringify(d);
    mem = s;
    try { localStorage.setItem(KEY, s); return true; } catch (e) { return false; }
  }

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function money(n) { return '$' + Number(n || 0).toLocaleString('es-CO'); }
  function digits(s) { return String(s || '').replace(/\D/g, ''); }
  function prettyPhone(s) {
    var d = digits(s);
    if (d.length === 12 && d.indexOf('57') === 0) return '+57 ' + d.slice(2, 5) + ' ' + d.slice(5, 8) + ' ' + d.slice(8);
    return d ? '+' + d : '';
  }
  function pct(p) { return p.oldPrice > p.price ? Math.round((1 - p.price / p.oldPrice) * 100) : 0; }
  function brandName(d, id) {
    for (var i = 0; i < d.brands.length; i++) if (d.brands[i].id === id) return d.brands[i].name;
    return '';
  }
  function uid(prefix) { return prefix + Date.now().toString(36) + Math.random().toString(36).slice(2, 5); }

  /* ---- WhatsApp: el mensaje ya llega con la talla ---- */
  function waText(d, items, kind) {
    var o = d.settings.owner || 'Moisés';
    function line(it, i) {
      var p = it.p, b = brandName(d, p.brand);
      var head = (items.length > 1 ? (i + 1) + ') ' : '') + '👟 *' + p.name + '*' + (b ? ' (' + b + ')' : '') + ' · Ref ' + p.ref;
      return head + '\n📏 Talla: *' + it.size + '* (EU)\n💰 ' + money(p.price);
    }
    var intro;
    if (kind === 'back') intro = 'Hola ' + o + ' 👋 Quiero saber cuándo vuelve a llegar este par:';
    else if (items.length > 1) intro = 'Hola ' + o + ' 👋 Quiero saber si están disponibles estos pares:';
    else intro = 'Hola ' + o + ' 👋 Quiero saber si está disponible este par:';
    return intro + '\n\n' + items.map(line).join('\n\n') + '\n\nLo vi en GRA$A MC-STORE.';
  }
  function waUrl(d, text) {
    return 'https://wa.me/' + digits(d.settings.whatsapp) + '?text=' + encodeURIComponent(text);
  }

  /* ---- Zapatillas dibujadas (sin marcas de terceros) ---- */
  var shoeN = 0;
  function shoe(palIndex, style, cls) {
    var c = (PALETTES[palIndex] || PALETTES[0]).c;
    var A = c[0], B = c[1], C = c[2];
    var id = 'sh' + (++shoeN);
    var high = style === 'high';
    var upper = high
      ? 'M52 180 L50 40 C52 26 66 20 82 24 C104 30 126 38 148 40 L170 36 C192 34 216 44 234 62 C262 84 292 100 330 110 C374 122 408 142 412 178 Z'
      : 'M52 180 L56 96 C57 80 68 72 84 74 C110 78 132 74 150 62 L168 50 C190 44 214 46 232 58 C262 80 292 98 330 108 C374 120 408 140 412 178 Z';
    var heel = high
      ? 'M52 180 L50 72 C76 70 102 92 114 124 L126 180 Z'
      : 'M52 180 L56 100 C70 98 96 104 112 122 L124 180 Z';
    var lining = high
      ? 'M82 24 C104 30 126 38 148 40 C160 40 166 38 170 36 C168 54 150 70 128 76 C100 80 84 58 82 24 Z'
      : 'M84 74 C110 78 132 74 150 62 L168 50 C160 66 140 84 116 90 C100 93 88 88 84 74 Z';
    var tongue = high
      ? 'M168 36 C186 20 214 24 230 44 L238 66 C216 50 192 50 178 62 Z'
      : 'M168 50 C190 40 212 42 226 54 L232 70 C214 60 192 58 176 66 Z';
    var dy = high ? -4 : 0;
    var laces = '';
    for (var i = 0; i < 6; i++) {
      var x = 196 + i * 18.5, y = 62 + i * 8.6 + dy;
      laces += '<path d="M' + (x + 4) + ' ' + (y - 8) + ' L' + (x - 4) + ' ' + (y + 8) + '" stroke="#F6F6F4" stroke-width="5.5" stroke-linecap="round"/>';
    }
    return '<svg class="' + (cls || 'shoe') + '" viewBox="0 0 440 250" role="img" aria-label="Dibujo de zapatilla" xmlns="http://www.w3.org/2000/svg">' +
      '<defs><linearGradient id="' + id + 'g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".28"/><stop offset=".55" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".28"/></linearGradient></defs>' +
      '<ellipse cx="228" cy="228" rx="190" ry="10" fill="#000" opacity=".5"/>' +
      '<path d="M34 192 C34 183 44 178 58 178 L372 178 C400 178 412 188 410 200 C408 212 396 220 380 220 L60 220 C42 220 34 210 34 192 Z" fill="#F4F4F2"/>' +
      '<path d="M38 208 L409 208 C406 215 396 220 380 220 L60 220 C46 220 39 215 38 208 Z" fill="' + C + '"/>' +
      '<path d="M44 196 L404 196" stroke="#000" stroke-opacity=".12" stroke-width="2" fill="none"/>' +
      '<path d="' + upper + '" fill="' + A + '"/>' +
      '<path d="' + heel + '" fill="' + B + '"/>' +
      '<path d="M326 108 C372 116 408 140 412 178 L328 178 C336 156 338 130 326 108 Z" fill="' + B + '"/>' +
      '<path d="M138 180 C150 150 184 120 236 98 L254 114 C216 136 192 158 188 180 Z" fill="' + C + '"/>' +
      '<path d="M142 170 C154 146 188 118 238 96" stroke="#fff" stroke-opacity=".4" stroke-width="2" stroke-dasharray="5 5" fill="none"/>' +
      '<path d="' + lining + '" fill="#0E0E11"/>' +
      '<path d="' + tongue + '" fill="#F1F0EE"/>' + laces +
      '<path d="' + upper + '" fill="url(#' + id + 'g)"/>' +
      '</svg>';
  }

  /* foto acomodable: ix/iy = desplazamiento en % de la caja, iz = zoom, ifit = llenar o ver completa */
  function imgStyle(p) {
    var z = Math.max(1, Math.min(3, +p.iz || 1)), x = Math.max(-100, Math.min(100, +p.ix || 0)), y = Math.max(-100, Math.min(100, +p.iy || 0));
    return 'object-fit:' + (p.ifit === 'contain' ? 'contain' : 'cover') + ';object-position:center;transform:translate(' + x + '%,' + y + '%) scale(' + z + ')';
  }

  window.GR = {
    imgStyle: imgStyle,
    SIZES: SIZES, US: US, PALETTES: PALETTES, KEY: KEY,
    get: load,
    save: save,
    reset: function () { var d = defaults(); save(d); return d; },
    esc: esc, money: money, digits: digits, prettyPhone: prettyPhone, pct: pct, brandName: brandName, uid: uid,
    waText: waText, waUrl: waUrl, shoe: shoe,
    art: function (p, cls) {
      return p.img ? '<img class="' + (cls || 'shoe') + ' photo" src="' + p.img + '" alt="' + esc(p.name) + '" style="' + imgStyle(p) + '">' : shoe(p.pal, p.style, cls);
    },
    logAsk: function (text) {
      var d = load();
      d.log = d.log || [];
      d.log.unshift({ t: Date.now(), text: text });
      d.log = d.log.slice(0, 20);
      save(d);
    },
    /* talla sugerida a partir del largo del pie en cm */
    sizeFromCm: function (cm) {
      var eu = Math.round((cm + 1.5) * 1.5);
      return Math.max(35, Math.min(46, eu));
    },
    cmFromSize: function (eu) { return Math.round((eu / 1.5 - 1.5) * 10) / 10; }
  };
})();
