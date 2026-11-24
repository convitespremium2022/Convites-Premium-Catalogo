(()=>{
'use strict';
const cfg=window.CATALOGO_CONFIG||{modelos:[],whatsapp:''},$=id=>document.getElementById(id);
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
 const a=document.createElement('a');a.href=u;a.target='_blank';a.rel='noopener noreferrer';document.body.append(a);a.click();a.remove();
}
function showReturn(){if(!awaitingReturn||!wasAway||!document.hasFocus())return;awaitingReturn=false;wasAway=false;$('returnModel').textContent=selected?.titulo||'escolhido';show('returnPrompt')}
window.addEventListener('blur',()=>{if(awaitingReturn)wasAway=true});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&awaitingReturn)wasAway=true;else if(!document.hidden)window.setTimeout(showReturn,150)});
window.addEventListener('focus',()=>window.setTimeout(showReturn,150));
function order(){hide('returnPrompt');awaitingReturn=false;$('form').reset();$('form').dataset.modelo=selected?.titulo||'Personalizado';$('selectedModel').textContent='Modelo: '+$('form').dataset.modelo;$('error').textContent='';const age=$('form').elements.idade;age.required=!!selected&&selected.categoria!=='Casamento';age.closest('label').firstChild.textContent=age.required?'Idade':'Idade (se aplicável)';show('order')}
$('custom').onclick=()=>{selected=null;order()};
$('returnOrder').onclick=order;
$('returnDismiss').onclick=()=>hide('returnPrompt');
document.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>hide(b.dataset.close));
document.querySelectorAll('.overlay').forEach(o=>o.addEventListener('click',e=>{if(e.target===o)hide(o.id)}));
document.addEventListener('keydown',e=>{if(e.key==='Escape'){hide('returnPrompt');hide('order')}});
$('form').onsubmit=e=>{
 e.preventDefault();
 const number=String(cfg.whatsapp||'').replace(/\D/g,'');
 if(!/^\d{12,15}$/.test(number)){$('error').textContent='Número comercial indisponível.';return}
 const f=e.currentTarget.elements;
 const date=f.data.value.split('-').reverse().join('/');
 const msg=['Olá! Quero solicitar um convite interativo.','','Modelo: '+e.currentTarget.dataset.modelo,
 'Nome: '+f.nome.value.trim(),'Idade: '+(f.idade.value.trim()||'Não se aplica'),'Data: '+date,
 'Horário: '+f.hora.value,'Tema e cores: '+f.tema.value.trim()];
 const a=document.createElement('a');a.href='https://wa.me/'+number+'?text='+encodeURIComponent(msg.join('\n'));a.target='_blank';a.rel='noopener noreferrer';document.body.append(a);a.click();a.remove();
};
renderFilters();renderCards();
})();