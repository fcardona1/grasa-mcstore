/* GRA$A MC-STORE · música de bienvenida (Spotify). El navegador no deja sonar nada sin un toque,
   así que la pantalla de entrada es ese toque. Desarrollado por Onytek. */
(function () {
  'use strict';
  var $ = function (s) { return document.querySelector(s); };
  var cur = null, key = '', API = null, ctrl = null, playing = false, want = false, apiAsked = false, gateSeen = false;
  try { gateSeen = sessionStorage.getItem('grasa-gate') === '1'; } catch (e) { /* nada */ }

  function iframe(c) {
    return '<iframe title="Escucha la canción en Spotify" src="https://open.spotify.com/embed/' + c.type + '/' + c.id + '?utm_source=generator&theme=0" width="100%" height="' + (c.type === 'track' ? 152 : 352) +
      '" frameborder="0" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>';
  }
  function loadApi() {
    if (apiAsked) return; apiAsked = true;
    window.onSpotifyIframeApiReady = function (a) { API = a; mount(); };
    var s = document.createElement('script'); s.src = 'https://open.spotify.com/embed/iframe-api/v1'; s.async = true;
    s.onerror = function () { API = null; }; document.head.appendChild(s);
  }
  function mount() {
    var host = $('#beatPlayer'); if (!cur || !host || !API) return;
    host.innerHTML = '<div></div>';
    API.createController(host.firstChild, { uri: 'spotify:' + cur.type + ':' + cur.id, width: '100%', height: cur.type === 'track' ? 152 : 352 }, function (c) {
      ctrl = c;
      c.addListener('playback_update', function (e) { playing = !(e && e.data && e.data.isPaused); paint(); });
      c.addListener('ready', function () { if (want) { try { c.play(); } catch (x) { /* nada */ } } });
    });
  }
  function paint() {
    var b = $('#musicBtn'); if (!b) return;
    b.setAttribute('aria-pressed', String(playing)); b.classList.toggle('on', playing);
    b.setAttribute('aria-label', playing ? 'Pausar la música' : 'Poner la música');
  }
  function showGate(on) {
    var g = $('#gate'); if (!g) return;
    g.hidden = !on; if (on) document.body.classList.add('lock');
    if (on) { var b = $('#gateOn'); if (b) b.focus({ preventScroll: true }); }
  }
  function closeGate() {
    gateSeen = true; try { sessionStorage.setItem('grasa-gate', '1'); } catch (e) { /* nada */ }
    var g = $('#gate'); if (g) g.hidden = true; if (!document.querySelector('.layer.open')) document.body.classList.remove('lock');
    var b = $('#musicBtn'); if (b && cur) b.hidden = false;
  }

  window.GR = window.GR || {};
  GR.music = {
    set: function (c) {
      var k = c ? c.type + ':' + c.id : '';
      if (k === key) return;
      key = k; cur = c; ctrl = null; playing = false;
      var host = $('#beatPlayer'); if (host) host.innerHTML = c ? iframe(c) : '';
      var b = $('#musicBtn');
      if (!c) { if (b) b.hidden = true; var g = $('#gate'); if (g && !g.hidden) closeGate(); return; }
      loadApi(); if (API) mount();
      if (!gateSeen) showGate(true); else if (b) b.hidden = false;
      paint();
    },
    toggle: function () { if (ctrl) { try { ctrl.togglePlay(); } catch (e) { /* nada */ } } else { var h = $('#beat'); if (h) h.scrollIntoView({ behavior: 'smooth', block: 'center' }); } }
  };

  document.addEventListener('click', function (e) {
    var t = e.target;
    if (t.closest('#gateOn')) {
      want = true; if (ctrl) { try { ctrl.play(); } catch (x) { /* nada */ } }
      closeGate();
      setTimeout(function () { if (!playing && GR.toast) GR.toast('Si no suena, toca play en «La banda sonora».'); }, 3500);
      return;
    }
    if (t.closest('#gateOff')) { closeGate(); return; }
    if (t.closest('#musicBtn')) { GR.music.toggle(); return; }
  });
  document.addEventListener('keydown', function (e) { var g = $('#gate'); if (e.key === 'Escape' && g && !g.hidden) closeGate(); });
})();
