/* GRA$A MC-STORE · letra clara: políticas y términos de la tienda (se abren en una hoja, sin salir de la página).
   Desarrollado por Onytek. Los textos son una base: revisar con el abogado antes de la entrega final. */
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var esc = (window.GR && GR.esc) || function (s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var UPDATED = '4 de noviembre de 2026';

  function ctx() {
    var s = (window.GR && GR.get && GR.get().settings) || {};
    return { owner: esc(s.owner || 'Moisés'), phone: esc((GR.prettyPhone && GR.prettyPhone(s.whatsapp)) || 'el WhatsApp de la tienda'), site: esc(location.host || 'grasa.onytek.co') };
  }
  function p(t) { return '<p>' + t + '</p>'; }
  function ul(a) { return '<ul>' + a.map(function (x) { return '<li>' + x + '</li>'; }).join('') + '</ul>'; }
  function h(t) { return '<h4>' + t + '</h4>'; }

  var DOCS = [
    { id: 'datos', tab: 'Datos personales', title: 'Política de tratamiento y protección de datos personales', body: function (c) {
      return p('En <b>GRA$A MC-STORE</b> cuidamos tus datos. Esta política explica qué información recibimos, para qué la usamos y cómo ejercer tus derechos, conforme a la <b>Ley 1581 de 2012</b>, el Decreto 1377 de 2013 y demás normas colombianas sobre protección de datos personales.') +
        h('Quién es el responsable') + p('GRA$A MC-STORE, atendida por ' + c.owner + '. Canal de contacto para temas de datos: WhatsApp ' + c.phone + '.') +
        h('Qué datos recibimos') + ul(['Los que tú nos escribes por WhatsApp al preguntar por un par: nombre, ciudad, talla y datos de entrega.', 'Datos de uso de esta página, como los pares que abres, para saber qué te interesa.', 'En tu equipo guardamos tu talla y tu caja para que no tengas que repetirlas. Eso queda en tu navegador, no en nuestros servidores.']) +
        h('Para qué los usamos') + ul(['Responder tus preguntas, confirmar disponibilidad y coordinar tu compra y entrega.', 'Mejorar el catálogo y la tienda.', 'Avisarte de novedades solo si tú lo pides o te unes a la comunidad.']) +
        h('Tus derechos') + p('Puedes conocer, actualizar, rectificar y pedir que eliminemos tus datos, revocar tu autorización y presentar quejas ante la Superintendencia de Industria y Comercio. Escríbenos por WhatsApp y respondemos en un plazo máximo de 10 días hábiles para consultas y 15 días hábiles para reclamos.') +
        h('Lo que no hacemos') + ul(['No vendemos tu información.', 'No pedimos claves ni datos de tarjetas en esta página.', 'Solo compartimos tus datos de entrega con la transportadora cuando es necesario para llevarte tu pedido.']) +
        p('<small>Última actualización: ' + UPDATED + '.</small>');
    } },
    { id: 'terminos', tab: 'Términos', title: 'Términos de servicio', body: function (c) {
      return p('Al usar <b>' + c.site + '</b> aceptas estos términos. Si no estás de acuerdo, por favor no uses la tienda.') +
        h('Cómo funciona la tienda') + p('Esta página es un catálogo. No se paga aquí: eliges tu par y tu talla y la tienda te atiende por WhatsApp, donde se confirman disponibilidad, precio, forma de pago y entrega.') +
        h('Precios y disponibilidad') + ul(['Los precios están en pesos colombianos (COP) y pueden cambiar sin previo aviso.', 'La disponibilidad por talla se confirma en el chat. Un par marcado como disponible puede agotarse antes de confirmar tu pedido.', 'Las fotos son de referencia; el color puede variar un poco según tu pantalla.']) +
        h('Uso adecuado') + p('Te pedimos no copiar el contenido de la página con fines comerciales, no intentar acceder a zonas privadas y no usar la tienda para actividades ilegales. Las marcas, logotipos y fotos pertenecen a sus dueños.') +
        h('Responsabilidad') + p('Hacemos lo posible por mantener la información correcta. Si encuentras un error de precio o de talla, avísanos antes de pagar y lo corregimos.') +
        h('Cambios y ley aplicable') + p('Podemos actualizar estos términos y la versión vigente es la publicada aquí. Se rigen por las leyes de la República de Colombia, incluida la Ley 1480 de 2011 (Estatuto del Consumidor).') +
        p('<small>Última actualización: ' + UPDATED + '.</small>');
    } },
    { id: 'cambios', tab: 'Cambios y reembolsos', title: 'Política de cambios, garantía y reembolso', body: function (c) {
      return p('Queremos que salgas feliz con tus tennis. Estas son las reglas, claras y sin letra chiquita.') +
        h('Derecho de retracto') + p('Como la compra se hace a distancia (por WhatsApp), tienes derecho a retractarte dentro de los <b>5 días hábiles siguientes a la entrega</b> (Ley 1480 de 2011, art. 47). El par debe estar sin uso, sin daños y con su caja y empaque. El costo de enviarlo de vuelta lo asume quien compra, y devolvemos el dinero dentro de los 30 días calendario siguientes al retracto.') +
        h('Cambio de talla') + p('Puedes pedir cambio de talla, sujeto a que tengamos el par en la talla que necesitas. Escríbenos por WhatsApp (' + c.phone + ') dentro del mismo plazo y con el par sin uso.') +
        h('Garantía') + p('Si el par llega con un defecto de fábrica, aplica la garantía legal. Mándanos fotos por WhatsApp y te indicamos cómo cambiarlo o devolverte el dinero.') +
        h('Lo que no cubre') + ul(['Pares usados, lavados o con desgaste normal.', 'Daños por mal uso.', 'Pares sin su caja y empaque original.']) +
        h('Cómo se devuelve el dinero') + p('Por el mismo medio con el que pagaste o el que acordemos por el chat.') +
        p('<small>Última actualización: ' + UPDATED + '.</small>');
    } },
    { id: 'envios', tab: 'Envíos', title: 'Política de envíos', body: function (c) {
      return h('Cómo se envía') + p('Una vez confirmados tu par, tu talla y el pago por WhatsApp, coordinamos la entrega con la transportadora o el mensajero que más te convenga según tu ciudad.') +
        h('Costos y tiempos') + ul(['El valor del envío y el tiempo estimado se te dicen por WhatsApp <b>antes</b> de pagar.', 'Los tiempos dependen de la ciudad y de la transportadora; pueden variar en fechas de alta demanda.', 'Puede haber entrega en mano o punto de encuentro donde sea posible; se acuerda por el chat.']) +
        h('Qué necesitamos de ti') + ul(['Nombre completo, ciudad, dirección y un teléfono de contacto.', 'Estar pendiente de la entrega o dejar a alguien que reciba.']) +
        h('Al recibir tu pedido') + p('Revisa que el par y la talla sean los correctos. Si algo no está bien, avísanos el mismo día por WhatsApp (' + c.phone + ') y lo resolvemos.') +
        p('<small>Última actualización: ' + UPDATED + '.</small>');
    } },
    { id: 'reservas', tab: 'Apartados', title: 'Política de reservas y apartados', body: function (c) {
      return p('Puedes pedirle a ' + c.owner + ' que te aparte un par mientras decides.') +
        h('Cómo se aparta') + ul(['Elige tu par y tu talla y escríbenos por WhatsApp con tu caja.', 'El apartado, su valor (si lo hay) y el plazo se acuerdan por el chat y quedan por escrito allí.', 'Mientras el par está apartado, no se vende a otra persona.']) +
        h('Si no se completa la compra') + p('Si pasa el plazo acordado sin pago, el par vuelve a estar disponible. Lo que se haya entregado como anticipo se maneja según lo que se haya acordado en el chat antes de recibirlo.') +
        h('Pares agotados') + p('Si un par está agotado, puedes preguntar cuándo vuelve a llegar. Es una consulta, no un apartado.') +
        p('<small>Última actualización: ' + UPDATED + '.</small>');
    } },
    { id: 'nosotros', tab: 'Quiénes somos', title: '¿Quiénes somos?', body: function (c) {
      return p('<b>GRA$A MC-STORE</b> es una tienda de tennis con sello callejero. Aquí el par se elige con la talla en la mano y la plática se hace directo con ' + c.owner + '.') +
        ul(['Pares originales y de las mejores marcas del momento.', 'Pregunta por tu talla y recibe respuesta por WhatsApp.', 'Comunidad para enterarte primero de lo que llega.']) +
        h('Escríbenos') + p('WhatsApp: <b>' + c.phone + '</b>') +
        p('Página creada y mantenida por <a href="https://www.onytek.co" target="_blank" rel="noopener">Onytek</a>, Tecnología con propósito, ejecución con precisión.');
    } }
  ];

  var layer = $('#legal'), body = $('#lgBody'), tabs = $('#lgTabs'), title = $('#lgTitle'), opener = null, cur = null;
  if (!layer) return;

  function show(id) {
    var doc = DOCS.filter(function (x) { return x.id === id; })[0] || DOCS[0]; cur = doc.id;
    title.textContent = doc.title;
    body.innerHTML = doc.body(ctx()); body.scrollTop = 0;
    tabs.innerHTML = DOCS.map(function (x) { return '<button type="button" data-ltab="' + x.id + '" aria-pressed="' + (x.id === cur) + '">' + esc(x.tab) + '</button>'; }).join('');
    var on = $('[aria-pressed="true"]', tabs); if (on && on.scrollIntoView) { try { tabs.scrollLeft = on.offsetLeft - 16; } catch (e) { /* nada */ } }
  }
  function open(id, from) {
    opener = from || document.activeElement; show(id);
    layer.classList.add('open'); layer.setAttribute('aria-hidden', 'false'); document.body.classList.add('lock');
    var x = $('[data-lclose]', layer); if (x) x.focus({ preventScroll: true });
  }
  function close() {
    layer.classList.remove('open'); layer.setAttribute('aria-hidden', 'true');
    if (!document.querySelector('.layer.open')) document.body.classList.remove('lock');
    if (opener && opener.focus) { try { opener.focus({ preventScroll: true }); } catch (e) { /* nada */ } }
  }
  document.addEventListener('click', function (e) {
    var t = e.target, el;
    if ((el = t.closest && t.closest('[data-legal]'))) { e.preventDefault(); open(el.dataset.legal, el); return; }
    if ((el = t.closest && t.closest('[data-ltab]'))) { show(el.dataset.ltab); return; }
    if (t.closest && t.closest('[data-lclose]')) close();
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && layer.classList.contains('open')) close(); });
  if (location.hash.indexOf('#legal-') === 0) open(location.hash.slice(7));
})();
