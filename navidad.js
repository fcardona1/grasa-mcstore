/* Detalles de Navidad: luces sobre el logo, cuenta regresiva y saludo. No cambia el diseño: solo suma encima.
   Se enciende solo del 1 de noviembre al 6 de enero. Moisés lo puede apagar en Ajustes. */
(function () {
  'use strict';
  var COLORS = ['#D62839', '#F7931E', '#F27BA8', '#F1F0EE'];
  var NS = 'http://www.w3.org/2000/svg';
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function season(now) {
    var y = now.getFullYear(), m = now.getMonth(), d = now.getDate();
    var inSeason = m >= 10 || (m === 0 && d <= 6);               // nov, dic y hasta el 6 de enero
    var xm = new Date(y, 11, 25);
    if (m === 0) return { on: inSeason, mode: d === 1 ? 'ny' : 'ny' };
    if (!inSeason) return { on: false };
    if (m === 11 && d === 25) return { on: true, mode: 'today' };
    if (m === 11 && d > 25) return { on: true, mode: d === 31 ? 'ny' : 'after' };
    var days = Math.ceil((xm - new Date(y, m, d)) / 86400000);
    return { on: true, mode: days === 1 ? 'tomorrow' : 'count', days: days };
  }

  /* guirnalda: un cable negro con foquitos de los colores de la tienda */
  function garland(opts) {
    var w = opts.w, h = opts.h, n = opts.n, sag = opts.sag, r = opts.r;
    var svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', '0 0 ' + w + ' ' + h); svg.setAttribute('class', 'xl-svg'); svg.setAttribute('aria-hidden', 'true');
    var segs = opts.segs || 2, per = Math.ceil(n / segs), p0 = [r + 2, 6], x = 0, html = '', pts = [];
    var wire = 'M' + p0[0] + ',' + p0[1];
    for (var s = 0; s < segs; s++) {
      var xa = p0[0] + (w - 2 * (r + 2)) * s / segs, xb = p0[0] + (w - 2 * (r + 2)) * (s + 1) / segs, ya = 6, yb = 6, cx = (xa + xb) / 2, cy = 6 + sag * 2;
      wire += ' Q' + cx.toFixed(1) + ',' + cy.toFixed(1) + ' ' + xb.toFixed(1) + ',' + yb;
      for (var i = 0; i < per; i++) {
        var t = (i + .5) / per, u = 1 - t;
        pts.push([u * u * xa + 2 * u * t * cx + t * t * xb, u * u * ya + 2 * u * t * cy + t * t * yb]);
      }
    }
    html += '<path d="' + wire + '" fill="none" stroke="#000" stroke-width="' + (opts.wire || 2.4) + '" stroke-linecap="round"/>';
    pts.forEach(function (p, i) {
      var c = COLORS[i % COLORS.length], del = ((i * 0.37) % 1.6).toFixed(2);
      html += '<g class="xl-b' + (reduce ? '' : ' tw') + '" style="--c:' + c + ';animation-delay:-' + del + 's">' +
        '<rect x="' + (p[0] - r * .35).toFixed(1) + '" y="' + (p[1] - 1).toFixed(1) + '" width="' + (r * .7).toFixed(1) + '" height="' + (r * .7).toFixed(1) + '" fill="#000"/>' +
        '<ellipse class="xl-bulb" cx="' + p[0].toFixed(1) + '" cy="' + (p[1] + r * 1.05).toFixed(1) + '" rx="' + (r * .72).toFixed(1) + '" ry="' + r.toFixed(1) + '" fill="' + c + '" stroke="#000" stroke-width="' + (opts.stroke || 1.6) + '"/>' +
        '<ellipse cx="' + (p[0] - r * .25).toFixed(1) + '" cy="' + (p[1] + r * .75).toFixed(1) + '" rx="' + (r * .17).toFixed(1) + '" ry="' + (r * .3).toFixed(1) + '" fill="#fff" opacity=".7"/></g>';
    });
    svg.innerHTML = html; return svg;
  }

  var mounted = false;
  function mount() {
    if (mounted) return; mounted = true;
    var art = document.getElementById('stickerBtn') || document.getElementById('art');
    if (art) { var a = document.createElement('div'); a.className = 'xl xl-hero'; a.appendChild(garland({ w: 430, h: 92, n: 12, sag: 20, r: 8.5, segs: 3 })); art.appendChild(a); }
    var logo = document.querySelector('.brand-link');
    if (logo) { var b = document.createElement('span'); b.className = 'xl xl-logo'; b.appendChild(garland({ w: 100, h: 18, n: 6, sag: 3, r: 3.6, segs: 3, wire: 1.4, stroke: 1 })); logo.appendChild(b); }
    var emb = document.querySelector('.gate-emb');
    if (emb && emb.parentNode) { var g = document.createElement('span'); g.className = 'xl xl-gate'; g.appendChild(garland({ w: 140, h: 30, n: 7, sag: 5, r: 5.2, segs: 2, wire: 1.8, stroke: 1.2 })); emb.parentNode.insertBefore(g, emb); }
    var tag = document.getElementById('tagline');
    if (tag && !document.getElementById('xmasCount')) {
      var c = document.createElement('p'); c.className = 'xmas-count'; c.id = 'xmasCount'; c.setAttribute('role', 'status');
      tag.insertAdjacentElement('afterend', c);
    }
  }
  function text(sn) {
    if (sn.mode === 'count') return '<i class="xc-dot" aria-hidden="true"></i>Faltan <b>' + sn.days + '</b> ' + (sn.days === 1 ? 'día' : 'días') + ' para Navidad';
    if (sn.mode === 'tomorrow') return '<i class="xc-dot" aria-hidden="true"></i>¡Mañana es <b>Navidad</b>!';
    if (sn.mode === 'today') return '<i class="xc-dot" aria-hidden="true"></i>¡Feliz <b>Navidad</b> de parte de GRA$A!';
    if (sn.mode === 'after') return '<i class="xc-dot" aria-hidden="true"></i>Que la <b>Navidad</b> te dure todo el año';
    return '<i class="xc-dot" aria-hidden="true"></i>¡Feliz <b>Año Nuevo</b>!';
  }
  function apply(s) {
    var sn = season(new Date()), on = sn.on && !(s && s.xmas === false);
    document.documentElement.classList.toggle('xmas-on', !!on);
    if (!on) return;
    mount();
    var c = document.getElementById('xmasCount'); if (c) c.innerHTML = text(sn);
  }
  window.GR = window.GR || {}; GR.xmas = { apply: apply, season: season };
})();
