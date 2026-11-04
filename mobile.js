(function(){
  var top=document.getElementById('top');
  function setH(){ if(top) document.documentElement.style.setProperty('--topH',top.offsetHeight+'px'); }
  setH(); addEventListener('load',setH); addEventListener('resize',setH);
  var cart=document.getElementById('bCart');
  if(cart) cart.addEventListener('click',function(){ var b=document.getElementById('cartBtn'); if(b) b.click(); });
  var cc=document.getElementById('cartCount'), bc=document.getElementById('bCount');
  function sync(){ if(!cc||!bc) return; var n=+cc.textContent||0; bc.textContent=n; bc.hidden=!n; }
  if(cc&&window.MutationObserver){ new MutationObserver(sync).observe(cc,{childList:true,characterData:true,subtree:true}); } sync();
  var links=[].slice.call(document.querySelectorAll('#bnav [data-sec-id]'));
  function mark(id){ links.forEach(function(a){ a.classList.toggle('on',a.getAttribute('data-sec-id')===id); }); }
  if('IntersectionObserver' in window){
    var io=new IntersectionObserver(function(es){ es.forEach(function(e){ if(e.isIntersecting) mark(e.target.id); }); },{rootMargin:'-45% 0px -50% 0px'});
    ['hero','catalogo','talla','comunidad'].forEach(function(i){ var el=document.getElementById(i); if(el) io.observe(el); });
  }
  /* los enlaces internos descuentan la barra fija */
  document.documentElement.style.scrollPaddingTop='72px';
})();
