/* GRA$A MC-STORE · conexión real: catálogo compartido, login de Moisés, fotos y métricas.
   Desarrollado por Onytek. Sin librerías: habla directo con la API de Supabase. */
(function () {
  'use strict';
  var C = window.GRCFG || {}, GR = window.GR;
  var LIVE = !!(C.url && C.key);
  var BUCKET = C.bucket || 'productos';
  GR.live = LIVE; GR.loaded = !LIVE; GR.status = function () {};
  if (!LIVE) { GR.init = function (cb) { cb && cb(); }; GR.track = function () {}; return; }

  var CACHE = 'grasa-cache-v1', AUTH = 'grasa-auth-v1';
  function jget(s, k) { try { return JSON.parse(s.getItem(k) || 'null'); } catch (e) { return null; } }
  function jset(s, k, v) { try { s.setItem(k, JSON.stringify(v)); } catch (e) { /* sin espacio */ } }

  function blank() {
    return { v: 1, seq: 1, sellers: [], settings: { owner: 'Moisés', names: {}, banner: 'Mis pies no alcanzan para tanto par.', spotify: 'https://open.spotify.com/intl-es/track/3t6SsMiA1b1Ju0HzKHIDSl', whatsapp: '', slogan: '', instagram: '', tiktok: '', facebook: '', community: '' }, brands: [], sections: [], products: [], log: [] };
  }
  var D = jget(localStorage, CACHE) || blank();
  function sane(x) {
    if (!x || typeof x !== 'object') return blank();
    var b = blank();
    x.settings = Object.assign(b.settings, x.settings || {});
    ['brands', 'sections', 'products', 'sellers'].forEach(function (k) { if (!Array.isArray(x[k])) x[k] = []; });
    x.seq = x.seq || (x.products.length + 1); return x;
  }
  D = sane(D);
  GR.get = function () { return D; };
  GR.reset = function () { return D; };

  /* ---------- sesión ---------- */
  var sess = jget(localStorage, AUTH) || jget(sessionStorage, AUTH);
  var remember = !!jget(localStorage, AUTH);
  function keep(s) {
    sess = s;
    var st = remember ? localStorage : sessionStorage;
    try { localStorage.removeItem(AUTH); sessionStorage.removeItem(AUTH); } catch (e) { /* nada */ }
    if (s) jset(st, AUTH, s);
  }
  function hdr(tok, extra) {
    var h = { apikey: C.key, Authorization: 'Bearer ' + (tok || C.key) };
    for (var k in extra) h[k] = extra[k]; return h;
  }
  function parseTok(r) {
    return { access_token: r.access_token, refresh_token: r.refresh_token, exp: Date.now() + (r.expires_in || 3600) * 1000 - 60000, email: r.user && r.user.email };
  }
  function authPost(grant, body) {
    return fetch(C.url + '/auth/v1/token?grant_type=' + grant, { method: 'POST', headers: hdr(null, { 'Content-Type': 'application/json' }), body: JSON.stringify(body) })
      .then(function (r) { return r.json().then(function (j) { if (!r.ok) throw new Error(j.error_description || j.msg || 'Error'); return j; }); });
  }
  GR.login = function (email, pass, rem) {
    remember = !!rem;
    return authPost('password', { email: email, password: pass }).then(function (j) { keep(parseTok(j)); return sess; });
  };
  GR.logout = function () {
    var t = sess && sess.access_token; keep(null);
    if (t) try { fetch(C.url + '/auth/v1/logout', { method: 'POST', headers: hdr(t) }); } catch (e) { /* nada */ }
  };
  GR.user = function () { return sess && sess.email || null; };
  function token() {
    if (!sess) return Promise.reject(new Error('Sin sesión'));
    if (Date.now() < sess.exp) return Promise.resolve(sess.access_token);
    return authPost('refresh_token', { refresh_token: sess.refresh_token }).then(function (j) { var u = sess.email; var n = parseTok(j); n.email = n.email || u; keep(n); return n.access_token; })
      .catch(function (e) { keep(null); throw e; });
  }
  /* crea la cuenta de un vendedor (no cambia la sesión de quien lo crea) */
  GR.signup = function (email, pass, name) {
    return fetch(C.url + '/auth/v1/signup', { method: 'POST', headers: hdr(null, { 'Content-Type': 'application/json' }), body: JSON.stringify({ email: email, password: pass, data: { full_name: name } }) })
      .then(function (r) {
        return r.json().catch(function () { return {}; }).then(function (j) {
          if (!r.ok) {
            var m = String(j.msg || j.error_description || j.message || '');
            if (/already|registered/i.test(m)) throw new Error('Ese correo ya tiene cuenta.');
            if (/disabled|not allowed/i.test(m)) throw new Error('Supabase tiene apagado el registro de usuarios. Actívalo en Authentication > Sign In / Providers.');
            if (/password/i.test(m)) throw new Error('La contraseña es muy débil. Usa mínimo 8 caracteres.');
            if (/rate|limit/i.test(m)) throw new Error('Demasiados intentos seguidos. Espera unos minutos.');
            throw new Error('No se pudo crear la cuenta. ' + m);
          }
          var u = j.user || j;
          if (u && Array.isArray(u.identities) && !u.identities.length) throw new Error('Ese correo ya tiene cuenta.');
          return { confirmed: !!(u && (u.email_confirmed_at || u.confirmed_at)) || !!j.access_token };
        });
      });
  };
  GR.hasSession = function () { return !!sess; };
  /* verifica que la sesión guardada siga viva */
  GR.check = function () { return sess ? token().then(function () { return true; }, function () { return false; }) : Promise.resolve(false); };

  /* ---------- catálogo ---------- */
  GR.init = function (cb) {
    fetch(C.url + '/rest/v1/tienda?id=eq.1&select=data', { headers: hdr(null), cache: 'no-store' })
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(function (rows) {
        if (rows && rows[0] && rows[0].data) { D = sane(rows[0].data); jset(localStorage, CACHE, D); }
        GR.loaded = true; cb && cb(true);
      })
      .catch(function () { GR.loaded = true; cb && cb(false); });
  };

  var busy = false, dirty = false, retry = null;
  function push() {
    if (busy) { dirty = true; return; }
    busy = true; dirty = false; clearTimeout(retry);
    var body = JSON.stringify({ id: 1, data: D });
    token().then(function (t) {
      return fetch(C.url + '/rest/v1/tienda?on_conflict=id', { method: 'POST', headers: hdr(t, { 'Content-Type': 'application/json', Prefer: 'resolution=merge-duplicates,return=minimal' }), body: body });
    }).then(function (r) {
      if (!r.ok) throw new Error(r.status);
      busy = false; GR.status(dirty ? 'saving' : 'ok'); if (dirty) push();
    }).catch(function (e) {
      busy = false; GR.status('error', e);
      if (e && /sesión|Invalid|invalid|JWT/i.test(String(e.message))) { GR.status('auth'); return; }
      retry = setTimeout(push, 6000);
    });
  }
  GR.save = function (d) { D = d; jset(localStorage, CACHE, D); GR.status('saving'); push(); return true; };
  GR.pending = function () { return busy || dirty; };

  /* ---------- fotos ---------- */
  var PUB = C.url + '/storage/v1/object/public/' + BUCKET + '/';
  function toBlob(dataUrl) {
    var m = /^data:([^;]+);base64,(.*)$/.exec(dataUrl), bin = atob(m[2]), u = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i); return new Blob([u], { type: m[1] });
  }
  GR.uploadImg = function (dataUrl) {
    var name = 'p/' + GR.uid('f') + '.jpg';
    return token().then(function (t) {
      return fetch(C.url + '/storage/v1/object/' + BUCKET + '/' + name, { method: 'POST', headers: hdr(t, { 'Content-Type': 'image/jpeg', 'cache-control': 'max-age=31536000' }), body: toBlob(dataUrl) });
    }).then(function (r) { if (!r.ok) throw new Error('foto ' + r.status); return PUB + name; });
  };
  GR.removeImg = function (url) {
    if (!url || url.indexOf(PUB) !== 0) return;
    token().then(function (t) { return fetch(C.url + '/storage/v1/object/' + BUCKET + '/' + url.slice(PUB.length), { method: 'DELETE', headers: hdr(t) }); }).catch(function () { /* se limpia luego */ });
  };

  /* ---------- métricas ---------- */
  var seen = {};
  GR.track = function (tipo, ref, texto) {
    try {
      var k = tipo + '|' + ref; if (tipo === 'visita') { if (sessionStorage.getItem('grasa-v')) return; sessionStorage.setItem('grasa-v', '1'); }
      if (tipo === 'par' && seen[k]) return; seen[k] = 1;
      var dev = /Mobi|Android|iPhone/i.test(navigator.userAgent) ? 'movil' : 'pc';
      var src = ''; try { src = new URLSearchParams(location.search).get('src') || ''; } catch (e0) { /* nada */ }
      fetch(C.url + '/rest/v1/eventos', { method: 'POST', keepalive: true, headers: hdr(null, { 'Content-Type': 'application/json', Prefer: 'return=minimal' }),
        body: JSON.stringify({ tipo: tipo, ref: ref ? String(ref).slice(0, 40) : null, texto: texto ? String(texto).slice(0, 600) : null, dispositivo: dev, origen: src ? 'src:' + src.slice(0, 30) : ((document.referrer || '').slice(0, 120) || null) }) }).catch(function () { /* nada */ });
    } catch (e) { /* nada */ }
  };
  GR.logAsk = function (text) {
    var m = /Ref (GM-\d+)/.exec(text || ''); GR.track('ask', m && m[1], text);
  };
  /* trae los eventos de los últimos N días, de a 1000 (el límite de Supabase) hasta 8000 */
  GR.events = function (days) {
    var since = new Date(Date.now() - days * 864e5).toISOString(), all = [];
    return token().then(function (t) {
      function page(n) {
        return fetch(C.url + '/rest/v1/eventos?select=t,tipo,ref,texto,dispositivo,origen&t=gte.' + encodeURIComponent(since) + '&order=t.desc&limit=1000&offset=' + (n * 1000), { headers: hdr(t) })
          .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
          .then(function (rows) { all = all.concat(rows); return rows.length === 1000 && n < 7 ? page(n + 1) : all; });
      }
      return page(0);
    });
  };
})();
