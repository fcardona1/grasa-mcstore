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

  /* personaliza tu estilo: color del par y suela */
  var COLORS = [
    { id: 'negro', n: 'Negro', hex: '#17171A' }, { id: 'blanco', n: 'Blanco', hex: '#F4F4F2' },
    { id: 'rojo', n: 'Rojo', hex: '#D62839' }, { id: 'rosado', n: 'Rosado', hex: '#F27BA8' },
    { id: 'gris', n: 'Gris', hex: '#8C8E98' }, { id: 'azul', n: 'Azul', hex: '#2C3A57' },
    { id: 'beige', n: 'Arena', hex: '#C9B28E' }, { id: 'naranja', n: 'Naranja', hex: '#F7931E' },
    { id: 'verde', n: 'Verde', hex: '#3E9E6B' }, { id: 'multi', n: 'Multicolor', hex: '#F7931E' }
  ];
  var SOLES = [
    { id: 'blanca', n: 'Blanca', hex: '#F4F4F2' }, { id: 'negra', n: 'Negra', hex: '#1B1B1F' },
    { id: 'crema', n: 'Crema', hex: '#E6D9BC' }, { id: 'caramelo', n: 'Caramelo', hex: '#B8864B' },
    { id: 'roja', n: 'Roja', hex: '#D62839' }
  ];
  var PALCOLOR = ['rojo', 'rosado', 'negro', 'blanco', 'beige', 'gris', 'naranja', 'negro'];
  function byId(list, id) { for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i]; return null; }
  /* color y suela de un par: lo que puso Moisés; si no puso nada y es un dibujo, se deduce de la paleta */
  function colorOf(p) { return p.color || (p.img ? '' : PALCOLOR[p.pal] || ''); }
  function soleOf(p) { return p.sole || (p.img ? '' : (p.pal === 2 ? 'negra' : 'blanca')); }
  function genOf(d, p) {
    if (p.gen) return p.gen;
    var h = false, m = false;
    (p.sections || []).forEach(function (sid) {
      var s = (d.sections || []).filter(function (x) { return x.id === sid; })[0], n = s ? s.name : '';
      if (/hombre|caballero/i.test(n)) h = true; if (/mujer|dama/i.test(n)) m = true;
    });
    return h && !m ? 'h' : m && !h ? 'm' : 'u';
  }

  /* SHA-256 corto (sin librerías): el correo de cada vendedor se guarda como huella, no en claro */
  function sha(str) {
    function rr(n, x) { return (x >>> n) | (x << (32 - n)); }
    var K = [], P = [], i, j, c = 0;
    for (i = 2; c < 64; i++) { for (j = 2; j * j <= i; j++) if (i % j === 0) break; if (j * j > i) { K[c] = (Math.pow(i, 1 / 3) * 4294967296) | 0; P[c++] = i; } }
    var H = [], pr = 0; for (i = 2; pr < 8; i++) { for (j = 2; j * j <= i; j++) if (i % j === 0) break; if (j * j > i) H[pr++] = (Math.pow(i, .5) * 4294967296) | 0; }
    var b = unescape(encodeURIComponent(str)), L = b.length * 8, w = [];
    for (i = 0; i < b.length; i++) w[i >> 2] |= b.charCodeAt(i) << (24 - (i % 4) * 8);
    w[L >> 5] |= 0x80 << (24 - L % 32); w[(((L + 64) >> 9) << 4) + 15] = L; for (i = 0; i < w.length; i++) w[i] |= 0;
    for (j = 0; j < w.length; j += 16) {
      var W = w.slice(j, j + 16), a = H.slice(0), t;
      for (i = 0; i < 64; i++) {
        if (i >= 16) { var s0 = rr(7, W[i - 15]) ^ rr(18, W[i - 15]) ^ (W[i - 15] >>> 3), s1 = rr(17, W[i - 2]) ^ rr(19, W[i - 2]) ^ (W[i - 2] >>> 10); W[i] = (W[i - 16] + s0 + W[i - 7] + s1) | 0; }
        var S1 = rr(6, a[4]) ^ rr(11, a[4]) ^ rr(25, a[4]), ch = (a[4] & a[5]) ^ (~a[4] & a[6]), t1 = (a[7] + S1 + ch + K[i] + W[i]) | 0;
        var S0 = rr(2, a[0]) ^ rr(13, a[0]) ^ rr(22, a[0]), mj = (a[0] & a[1]) ^ (a[0] & a[2]) ^ (a[1] & a[2]), t2 = (S0 + mj) | 0;
        a = [(t1 + t2) | 0, a[0], a[1], a[2], (a[3] + t1) | 0, a[4], a[5], a[6]];
      }
      for (i = 0; i < 8; i++) H[i] = (H[i] + a[i]) | 0;
    }
    return H.map(function (x) { return ('00000000' + (x >>> 0).toString(16)).slice(-8); }).join('');
  }
  function maskMail(m) { m = String(m || ''); var i = m.indexOf('@'); return i < 2 ? m : m.slice(0, 2) + '•••' + m.slice(i); }

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
      v: 1, seq: 11, sellers: [],
      settings: {
        owner: 'Moisés', names: {}, banner: 'Mis pies no alcanzan para tanto par.', spotify: 'https://open.spotify.com/intl-es/track/3t6SsMiA1b1Ju0HzKHIDSl', whatsapp: '573145505717', slogan: 'Tu talla. Tu estilo. Tu calle.',
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
  /* WhatsApp Web / escritorio a veces muestra � en lugar de emojis cuando el texto llega por un enlace.
     En celular se dejan los emojis; en computador se cambian por palabras para que el mensaje siempre se lea bien. */
  var EMOJI_OK = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent || '') || (navigator.maxTouchPoints > 1 && /Mac/i.test(navigator.platform || ''));
  function wtxt(t) {
    t = String(t == null ? '' : t);
    if (EMOJI_OK) return t;
    return t.replace(/\s*\u{1F44B}\uFE0F?\s*/gu, '! ').replace(/\u{1F45F}\uFE0F?\s*/gu, 'Par: ').replace(/\u{1F4CF}\uFE0F?\s*/gu, '').replace(/\u{1F4B0}\uFE0F?\s*/gu, 'Precio: ')
      .replace(/[\u{1F000}-\u{1FAFF}\u2600-\u27BF]\uFE0F?/gu, '').replace(/[ \t]+(?=\n)/g, '').replace(/ {2,}/g, ' ').replace(/^ +/gm, '');
  }
  function wenc(t) { return encodeURIComponent(wtxt(t)); }
  function waUrl(d, text) {
    return 'https://wa.me/' + digits(d.settings.whatsapp) + '?text=' + wenc(text);
  }

  /* ---- Zapatillas dibujadas (sin marcas de terceros) ---- */
  var shoeN = 0;
  function shoe(palIndex, style, cls) { return shoeX((PALETTES[palIndex] || PALETTES[0]).c, '#F4F4F2', style, cls); }
  /* zapatilla con el color y la suela que elija el cliente */
  function hex2rgb(h) { h = h.replace('#', ''); return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]; }
  function mix(h, t, k) { var a = hex2rgb(h), b = hex2rgb(t); return '#' + a.map(function (v, i) { v = Math.round(v + (b[i] - v) * k); return (v < 16 ? '0' : '') + v.toString(16); }).join(''); }
  function lum(h) { var a = hex2rgb(h); return (.299 * a[0] + .587 * a[1] + .114 * a[2]) / 255; }
  function shoeCustom(colorId, soleId, style, cls) {
    var co = byId(COLORS, colorId) || COLORS[0], so = byId(SOLES, soleId) || SOLES[0], A = co.hex, c;
    if (co.id === 'multi') c = ['#F7931E', '#2C3A57', '#F27BA8'];
    else c = [A, lum(A) < .35 ? mix(A, '#ffffff', .24) : mix(A, '#000000', .2), co.id === 'rojo' ? '#F1F0EE' : (lum(A) > .5 ? '#D62839' : '#F1F0EE')];
    return shoeX(c, so.hex, style, cls);
  }
  function shoeX(c, soleHex, style, cls) {
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
      '<path d="M34 192 C34 183 44 178 58 178 L372 178 C400 178 412 188 410 200 C408 212 396 220 380 220 L60 220 C42 220 34 210 34 192 Z" fill="' + soleHex + '"/>' +
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
    waText: waText, waUrl: waUrl, wtxt: wtxt, wenc: wenc, shoe: shoe, shoeCustom: shoeCustom,
    COLORS: COLORS, SOLES: SOLES, colorOf: colorOf, soleOf: soleOf, genOf: genOf, byId: byId, sha: sha, maskMail: maskMail,
    art: function (p, cls) {
      return p.img ? '<img class="' + (cls || 'shoe') + ' photo" src="' + p.img + '" alt="' + esc(p.name) + '" style="' + imgStyle(p) + '">' : (p.color || p.sole) ? shoeCustom(colorOf(p) || 'gris', soleOf(p) || 'blanca', p.style, cls) : shoe(p.pal, p.style, cls);
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
