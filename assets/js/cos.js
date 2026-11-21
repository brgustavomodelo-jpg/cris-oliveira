/* Cris Oliveira Store (COS) — comportamento compartilhado (home + galeria).
   Sem dependências. Tudo que anima usa apenas transform/opacity e respeita
   "reduzir movimento" do sistema. */
(function(){
'use strict';
var root=document.documentElement;
var $=function(s,c){return (c||document).querySelector(s)};
var $$=function(s,c){return Array.prototype.slice.call((c||document).querySelectorAll(s))};
var reduce=false;try{reduce=matchMedia('(prefers-reduced-motion: reduce)').matches}catch(e){}
var hasIO='IntersectionObserver' in window;

root.classList.add('ready');
/* navegadores sem View Transitions entre páginas ganham um fade simples */
if(!('onpagereveal' in window)&&!reduce)root.classList.add('pg-fade');

/* ---------- Cabeçalho e menu mobile ---------- */
var hdr=$('#top'),burger=$('#burger'),nav=$('#nav'),lockY=0;
var mq=matchMedia('(max-width:899px)');
function isOpen(){return document.body.classList.contains('menu-open')}
function menu(open,restoreFocus){
  if(open===isOpen())return;
  var b=document.body;
  if(open){
    lockY=scrollY;
    b.style.setProperty('--lock-top',-lockY+'px');
    root.classList.add('nav-lock');
    b.classList.add('menu-open');
  }else{
    b.classList.remove('menu-open');
    b.style.removeProperty('--lock-top');
    window.scrollTo({top:lockY,left:0,behavior:'instant'});   /* volta exatamente onde estava */
    root.classList.remove('nav-lock');
  }
  burger.setAttribute('aria-expanded',open?'true':'false');
  burger.setAttribute('aria-label',open?'Fechar menu':'Abrir menu');
  if(open){var f=$('a',nav);if(f)setTimeout(function(){f.focus({preventScroll:true})},60)}
  else if(restoreFocus!==false)burger.focus({preventScroll:true});
}
burger.addEventListener('click',function(){menu(!isOpen())});
$$('#nav a').forEach(function(a){a.addEventListener('click',function(){menu(false)})});
document.addEventListener('keydown',function(e){
  if(!isOpen())return;
  if(e.key==='Escape'){menu(false);return}
  if(e.key==='Tab'){            /* foco preso dentro do menu: botão + links */
    var f=[burger].concat($$('#nav a')),i=f.indexOf(document.activeElement);
    e.preventDefault();f[(i+(e.shiftKey?-1:1)+f.length)%f.length].focus();
  }
});
/* ao ampliar a tela (ex.: girar o tablet) ou voltar pelo histórico, o menu não fica preso aberto */
(mq.addEventListener?mq.addEventListener('change',function(){if(!mq.matches)menu(false,false)}):mq.addListener(function(){if(!mq.matches)menu(false,false)}));
addEventListener('pageshow',function(e){if(e.persisted)menu(false,false)});
var yr=$('#yr');if(yr)yr.textContent=new Date().getFullYear();

/* ---------- Títulos com máscara + revelação ---------- */
if(!reduce){$$('h2').forEach(function(h){var s=document.createElement('span');s.className='mi';while(h.firstChild)s.appendChild(h.firstChild);h.appendChild(s);h.classList.add('mk')})}
var revealSel='.rv,h2.mk';
if(hasIO&&!reduce){
  var io=new IntersectionObserver(function(es){
    var n=0;
    es.forEach(function(e){if(!e.isIntersecting)return;
      var el=e.target;
      if(el.classList.contains('rv')&&!el.style.getPropertyValue('--d'))el.style.setProperty('--d',Math.min(n++*90,360)+'ms');
      el.classList.add('in');io.unobserve(el)});
  },{rootMargin:'0px 0px -6% 0px',threshold:.08});
  $$(revealSel).forEach(function(el){io.observe(el)});
}else{$$(revealSel).forEach(function(el){el.classList.add('in')})}

/* ---------- Parallax discreto (apenas elementos visíveis) ---------- */
var pxEls=reduce?[]:$$('[data-px]').map(function(el){return {el:el,s:parseFloat(el.getAttribute('data-px'))||0,vis:false}});
var vh=innerHeight,ticking=false,small=false;
try{small=matchMedia('(max-width:760px)').matches}catch(e){}
if(pxEls.length&&hasIO){
  var pio=new IntersectionObserver(function(es){
    es.forEach(function(e){pxEls.forEach(function(p){if(p.el===e.target)p.vis=e.isIntersecting})});
    req();
  },{rootMargin:'20% 0px 20% 0px'});
  pxEls.forEach(function(p){pio.observe(p.el)});
}
function frame(){
  ticking=false;
  var y=scrollY;
  if(hdr&&!hdr.hasAttribute('data-solid'))hdr.classList.toggle('solid',y>30);
  var k=small?.5:1;
  for(var i=0;i<pxEls.length;i++){var p=pxEls[i];if(!p.vis)continue;
    var r=p.el.getBoundingClientRect(),off=r.top+r.height/2-vh/2;
    p.el.style.transform='translate3d(0,'+(-off*p.s*k).toFixed(1)+'px,0)';
  }
}
function req(){if(!ticking){ticking=true;requestAnimationFrame(frame)}}
addEventListener('scroll',req,{passive:true});
addEventListener('resize',function(){vh=innerHeight;try{small=matchMedia('(max-width:760px)').matches}catch(e){}req()});
frame();

/* ---------- WhatsApp flutuante ----------
   Na home ele só aparece depois que o botão grande da primeira tela sai de vista. */
var fab=$('.fab'),heroWa=$('#inicio .ac-wa');
if(fab&&heroWa&&hasIO){
  fab.classList.add('wait');
  new IntersectionObserver(function(es){fab.classList.toggle('wait',es[0].isIntersecting)}).observe(heroWa);
}

/* ---------- Galeria ---------- */
var mas=$('#masonry');
if(mas){
  var CAT={looks:'Look',detalhes:'Detalhe',acessorios:'Acessório',loja:'A loja'};
  /* proporção vem dos atributos width/height da própria foto (nada a calcular à mão) */
  function ratio(el){var im=$('img',el),w=im&&+im.getAttribute('width'),h=im&&+im.getAttribute('height');return (w&&h)?h/w:(parseFloat(el.getAttribute('data-r'))||1.25)}
  var data=$$('.it',mas).map(function(el){return {el:el,cat:el.getAttribute('data-cat'),r:ratio(el)}});
  var view=[],cur='all',nCols=0;
  var chips=$$('.filters button'),countEl=$('#gCount');

  /* observador de entrada das fotos (escalonado) */
  var gio=hasIO&&!reduce?new IntersectionObserver(function(es){
    var vis=es.filter(function(e){return e.isIntersecting}).sort(function(a,b){
      var A=a.boundingClientRect,B=b.boundingClientRect;return (A.top-B.top)||(A.left-B.left)});
    vis.forEach(function(e,i){e.target.style.setProperty('--d',Math.min(i*80,480)+'ms');e.target.classList.add('in');gio.unobserve(e.target)});
  },{rootMargin:'0px 0px -4% 0px',threshold:.06}):null;

  function colCount(){var w=mas.clientWidth||innerWidth;return w<600?2:(w<1000?3:4)}
  /* distribui cada foto na coluna mais curta: leitura natural da esquerda p/ direita */
  function layout(){
    var n=colCount();nCols=n;
    mas.setAttribute('data-cols',n);
    mas.textContent='';
    var cols=[],hs=[];
    for(var i=0;i<n;i++){var c=document.createElement('div');c.className='col';mas.appendChild(c);cols.push(c)}
    var gap=parseFloat(getComputedStyle(mas).columnGap)||14;
    var cw=(mas.clientWidth-gap*(n-1))/n;
    var stag=Math.round(Math.min(64,cw*.2));
    cols.forEach(function(c,i){hs.push(i%2?stag:0);if(i%2)c.style.paddingTop=stag+'px'});
    view.forEach(function(d){
      var k=0;for(var j=1;j<n;j++)if(hs[j]<hs[k]-1)k=j;
      cols[k].appendChild(d.el);hs[k]+=cw*d.r+gap;
      if(!d.el.classList.contains('in')){if(gio)gio.observe(d.el);else d.el.classList.add('in')}
    });
  }
  function setFilter(f,fromHash){
    if(!CAT[f])f='all';
    var first=!view.length;
    cur=f;
    chips.forEach(function(b){b.setAttribute('aria-pressed',b.getAttribute('data-f')===f?'true':'false')});
    view=data.filter(function(d){return f==='all'||d.cat===f});
    var nPhotos=view.filter(function(d){return d.cat!=='tudo'}).length;
    if(countEl)countEl.textContent=nPhotos+(nPhotos===1?' fotografia':' fotografias');
    if(!fromHash){try{history.replaceState(null,'',f==='all'?location.pathname+location.search:'#'+f)}catch(e){}}
    if(first||reduce){layout();return}
    mas.classList.add('swap');
    setTimeout(function(){
      data.forEach(function(d){d.el.classList.remove('in')});
      layout();window.scrollTo({top:Math.min(scrollY,mas.offsetTop-hdr.offsetHeight-20),behavior:'auto'});
      requestAnimationFrame(function(){mas.classList.remove('swap')});
    },260);
  }
  chips.forEach(function(b){b.addEventListener('click',function(){setFilter(b.getAttribute('data-f'))})});
  addEventListener('hashchange',function(){setFilter(location.hash.slice(1),true)});
  var rt;addEventListener('resize',function(){clearTimeout(rt);rt=setTimeout(function(){if(colCount()!==nCols)layout()},160)});
  /* contadores dos filtros calculados a partir das fotos que existem na página */
  chips.forEach(function(b){var f=b.getAttribute('data-f'),sp=$('sup',b);
    if(sp)sp.textContent=data.filter(function(d){return d.cat!=='tudo'&&(f==='all'||d.cat===f)}).length});
  setFilter(location.hash.slice(1),true);

  /* ---------- Lightbox ---------- */
  var lb=$('#lb'),lbImg=$('#lbImg'),lbCap=$('#lbCap'),lbCt=$('#lbCt'),idx=0,last=null,seq=0;
  function photos(){return view.filter(function(d){return d.cat!=='tudo'})}
  function show(i,instant){
    var v=photos();if(!v.length)return;
    idx=(i+v.length)%v.length;
    var d=v[idx],btn=$('.ph',d.el),im=$('img',d.el),src=btn.getAttribute('data-full'),tok=++seq;
    lbCt.textContent=(idx+1)+' / '+v.length;
    lbCap.textContent='';
    var tag=document.createElement('i');tag.textContent=CAT[d.cat]||'';
    lbCap.appendChild(tag);lbCap.appendChild(document.createTextNode(im.alt));
    if(!instant)lbImg.classList.add('swap');
    setTimeout(function(){
      var l=new Image();
      l.onload=function(){if(tok!==seq)return;lbImg.src=src;lbImg.alt=im.alt;lbImg.classList.remove('swap')};
      l.src=src;
    },instant?0:200);
    [idx+1,idx-1].forEach(function(j){var n=v[(j+v.length)%v.length];(new Image()).src=$('.ph',n.el).getAttribute('data-full')});
  }
  function open(i){
    last=document.activeElement;
    lb.classList.add('open');lb.setAttribute('aria-hidden','false');
    root.style.overflow='hidden';
    show(i,true);$('.x',lb).focus();
  }
  function close(){
    lb.classList.remove('open');lb.setAttribute('aria-hidden','true');
    root.style.overflow='';seq++;
    if(last)last.focus();
  }
  mas.addEventListener('click',function(e){
    var b=e.target.closest('.ph');if(!b)return;
    var el=b.closest('.it'),v=photos(),i=0;
    v.forEach(function(d,k){if(d.el===el)i=k});
    open(i);
  });
  $('.x',lb).addEventListener('click',close);
  $('.p',lb).addEventListener('click',function(){show(idx-1)});
  $('.n',lb).addEventListener('click',function(){show(idx+1)});
  lb.addEventListener('click',function(e){if(e.target===lb)close()});
  document.addEventListener('keydown',function(e){
    if(!lb.classList.contains('open'))return;
    if(e.key==='Escape')close();
    else if(e.key==='ArrowLeft')show(idx-1);
    else if(e.key==='ArrowRight')show(idx+1);
    else if(e.key==='Tab'){var f=$$('button',lb),i=f.indexOf(document.activeElement);e.preventDefault();f[(i+(e.shiftKey?-1:1)+f.length)%f.length].focus()}
  });
  var tx=null,ty=null;
  lb.addEventListener('touchstart',function(e){tx=e.touches[0].clientX;ty=e.touches[0].clientY},{passive:true});
  lb.addEventListener('touchend',function(e){
    if(tx===null)return;
    var dx=e.changedTouches[0].clientX-tx,dy=e.changedTouches[0].clientY-ty;tx=null;
    if(Math.abs(dx)>50&&Math.abs(dx)>Math.abs(dy))show(idx+(dx<0?1:-1));
    else if(dy>90&&Math.abs(dy)>Math.abs(dx))close();
  },{passive:true});
}
})();
