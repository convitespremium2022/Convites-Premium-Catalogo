(()=>{
'use strict';
const cfg=window.CATALOGO_CONFIG||{modelos:[],whatsapp:''},$=id=>document.getElementById(id);
const fmt=c=>new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(c/100);
let filter='Todos',selected=null;
let awaitingReturn=false,wasAway=false;
const categories=['Todos','Infantil','15 anos','Casamento'];
function safe(s){try{const u=new URL(s,location.href);return ['https:','http:'].includes(u.protocol)?u.href:''}catch{return ''}}
function renderFilters(){
 const n=$('filters');n.replaceChildren();
 categories.forEach(cat=>{const b=document.createElement('button');b.textContent=cat;b.className=filter===cat?'on':'';b.type='button';b.onclick=()=>{filter=cat;renderFilters();renderCards()};n.append(b)})
}
function renderCards(){
 const n=$('cards');n.replaceChildren();
 for(const m of (cfg.modelos||[]).filter(m=>filter==='Todos'||m.categoria===filter)){
  const b=document.createElement('button');b.type='button';b.className='card';
  const t=document.createElement('div');t.className='thumb';
  const img=document.createElement('img');img.src=safe(m.imagem);img.alt='Capa: '+m.titulo;img.loading='lazy';t.append(img);
  const tap=document.createElement('span');tap.textContent='Visualizar convite ↗';t.append(tap);
  const title=document.createElement('h3');title.textContent=m.titulo;
  const cat=document.createElement('p');cat.textContent=m.categoria;
  b.append(t,title,cat);b.onclick=()=>preview(m);
  const orderBtn=document.createElement('button');orderBtn.type='button';orderBtn.className='model-order';orderBtn.textContent='Peça o seu ↗';orderBtn.addEventListener('click',e=>{e.stopPropagation();selected=m;order()});
  const wrap=document.createElement('div');wrap.className='card-wrap';wrap.append(b,orderBtn);n.append(wrap);
 }
}
function show(id){$(id).hidden=false;document.body.style.overflow='hidden'}
function hide(id){$(id).hidden=true;if($('returnPrompt').hidden&&$('order').hidden)document.body.style.overflow=''}
function preview(m){
 const u=safe(m.link);if(!u)return;
 selected=m;awaitingReturn=true;wasAway=false;
 const tab=window.open(u,'_blank','noopener,noreferrer');
 if(!tab){const a=document.createElement('a');a.href=u;a.target='_blank';a.rel='noopener noreferrer';document.body.append(a);a.click();a.remove()}
}
function showReturn(){if(!awaitingReturn||!wasAway||!document.hasFocus())return;awaitingReturn=false;wasAway=false;$('returnModel').textContent=selected?.titulo||'escolhido';show('returnPrompt')}
window.addEventListener('blur',()=>{if(awaitingReturn)wasAway=true});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&awaitingReturn)wasAway=true;else if(!document.hidden)window.setTimeout(showReturn,150)});
window.addEventListener('focus',()=>window.setTimeout(showReturn,150));
function step(n){$('step1').hidden=n!==1;$('step2').hidden=n!==2;$('stepLabel1').classList.toggle('on',n===1);$('stepLabel2').classList.toggle('on',n===2);$('error').textContent=''}
function order(){hide('returnPrompt');awaitingReturn=false;$('form').reset();$('form').dataset.modelo=selected?.titulo||'Personalizado';step(1);update();show('order')}
function calc(){
 const f=$('form').elements;const s=f.save.checked,a=f.album.checked,r=f.retro.checked;
 const subtotal=8990+(s?1990:0)+(a?3990:0)+(r?4990:0),combo=s&&a&&r;
 const total=combo?18000:subtotal;return {s,a,r,subtotal,total,discount:subtotal-total,combo};
}
function update(){const p=calc();$('subtotal').textContent=fmt(p.subtotal);$('discountRow').hidden=!p.combo;$('discount').textContent='-'+fmt(p.discount);$('total').textContent=fmt(p.total)}
$('next').onclick=()=>{for(const input of $('step1').querySelectorAll('input,textarea')){if(!input.checkValidity()){input.reportValidity();return}}step(2)};
$('back').onclick=()=>step(1);
$('custom').onclick=()=>{selected=null;order()};
$('returnOrder').onclick=order;
$('returnDismiss').onclick=()=>hide('returnPrompt');
document.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>hide(b.dataset.close));
document.querySelectorAll('.overlay').forEach(o=>o.addEventListener('click',e=>{if(e.target===o)hide(o.id)}));
document.addEventListener('keydown',e=>{if(e.key==='Escape'){hide('returnPrompt');hide('order')}});
['save','album','retro'].forEach(n=>$('form').elements[n].addEventListener('change',update));
$('form').onsubmit=e=>{
 e.preventDefault();
 const number=String(cfg.whatsapp||'').replace(/\D/g,'');
 if(number.length<12){$('error').textContent='Configure o número comercial no config.js para receber pedidos.';return}
 const f=e.currentTarget.elements,p=calc();
 const msg=['Olá! Quero solicitar um convite interativo.','','Modelo: '+e.currentTarget.dataset.modelo,
 'Nome: '+f.nome.value,'Idade: '+(f.idade.value||'Não se aplica'),'Data: '+f.data.value,
 'Horário: '+f.hora.value,'Tema e cores: '+f.tema.value,'',
 'Convite: '+fmt(8990),'Save the Date: '+(p.s?fmt(1990):'Não'),
 'Álbum + QR Code: '+(p.a?fmt(3990):'Não'),'Retrospectiva: '+(p.r?fmt(4990):'Não')];
 if(p.combo)msg.push('Subtotal: '+fmt(p.subtotal),'Desconto combo completo (10% OFF): −'+fmt(p.discount));
 msg.push('TOTAL: '+fmt(p.total));
 const a=document.createElement('a');a.href='https://wa.me/'+number+'?text='+encodeURIComponent(msg.join('\n'));a.target='_blank';a.rel='noopener noreferrer';document.body.append(a);a.click();a.remove();
};
renderFilters();renderCards();update();
})();