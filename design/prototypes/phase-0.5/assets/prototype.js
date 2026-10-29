import { PrototypeEngine, UX_STATES } from './engine.js';
import { SCREEN_GROUPS, findScreen } from './screen-catalog.js';

const kind=window.PROTOTYPE_ENV;
const group=SCREEN_GROUPS[kind];
if(!group) throw new Error(`Entorno de prototipo desconocido: ${kind}`);
const query=new URLSearchParams(location.search);
const captureMode=query.get('capture')==='1';
const requested=query.get('screen')||location.hash.slice(1);
const first=(requested&&group.screens.some(x=>x.id===requested))?requested:group.initial;
const engine=new PrototypeEngine(kind,group.initial);
engine.screen=first;
seedDirectContext(first);
if(UX_STATES.some(([key])=>key===query.get('state'))){engine.state=query.get('state');engine.notice=`Estado de demostración: ${engine.state}`;}
let ticketOpen=query.get('ticket')==='1';

const escapeHtml=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const money=value=>new Intl.NumberFormat('es-MX',{style:'currency',currency:'MXN'}).format(value);

function seedDirectContext(id){
  if(id.startsWith('ADM')&&id!=='ADM-01')engine.applyMutation('loginAdmin');
  if(id.startsWith('TAB')){
    const number=Number(id.slice(4));
    if(number>=3)engine.applyMutation('guest');
    if(number>=7)engine.applyMutation('addCart');
    if(number>=9)engine.applyMutation('order');
    if(id==='TAB-11')engine.applyMutation('attention');
  }
  if(id.startsWith('KDS')&&['KDS-05','KDS-06'].includes(id))engine.applyMutation('kdsReady');
  if(id.startsWith('POS')&&id!=='POS-08')engine.applyMutation('cashOpen');
  if(id==='POS-07')engine.applyMutation('payment');
  if(id.startsWith('WAI')&&id!=='WAI-01')engine.applyMutation('waiterLogin');
}

function navigate(id){
  if(!group.screens.some(x=>x.id===id)) return;
  history.replaceState(null,'',`${location.pathname}${location.search}#${id}`);
  engine.go(id);
}

function facts(snapshot){
  const d=snapshot.data;
  return [
    ['Sesión pública',d.guest.sessionConfirmed?'Confirmada demo':'No iniciada'],
    ['Carrito',`${d.cart.items.length} líneas · ${money(d.cart.total)}`],
    ['Pedido',d.order.id?`${d.order.id} · ${d.order.status}`:'Sin confirmar'],
    ['KDS',`${d.kitchen.status} · ${d.kitchen.connected?'conectado':'sin conexión'}`],
    ['Caja',d.cash.open?'Turno demo abierto':'Sin turno abierto'],
    ['Pago',d.cash.paymentConfirmed?'ACK simulado':'No confirmado']
  ];
}

function overlay(snapshot){
  if(snapshot.state==='normal') return '';
  const content={
    empty:['0','Estado vacío','No hay datos ficticios para esta vista. La navegación permanece disponible.'],
    loading:['…','Cargando demostración','Se representa la recuperación de un snapshot; no existe una solicitud de red.'],
    error:['!','Error simulado','La acción no se completó y ningún dato se presenta como confirmado.'],
    offline:['×','Sin conexión simulada','Las mutaciones están bloqueadas. Solo se muestra el último snapshot ficticio.'],
    pending:['…','Pendiente de ACK simulado',snapshot.pending?`Solicitud ${snapshot.pending.requestId}: ${snapshot.pending.label}. Todavía no está confirmada.`:'Estado documental pendiente; no existe una operación activa.'],
    confirmed:['✓','ACK SIMULADO CONFIRMADO','Resultado exclusivamente demostrativo. No se registró ningún pedido, cobro, cierre ni transición real.'],
    forbidden:['↯','Permiso insuficiente','El rol ficticio no autoriza esta operación. No se aplicaron cambios.'],
    validation:['!','Error de validación','Los campos de demostración requieren corrección antes de continuar.'],
    conflict:['↻','Conflicto simulado','Existe una versión ficticia más reciente. Debe recuperarse antes de reintentar.'],
    cancelled:['×','Acción cancelada','La intención fue descartada y el estado ficticio se conserva sin cambios.']
  }[snapshot.state];
  const pendingActions=snapshot.state==='pending'&&snapshot.pending?`<div class="overlay-actions"><button data-confirm-ack>Emitir ACK simulado</button><button class="secondary" data-reject="error">Simular error</button><button class="secondary" data-reject="conflict">Simular conflicto</button></div>`:`<div class="overlay-actions"><button data-close-state>Volver al prototipo</button></div>`;
  return `<div class="state-overlay ${snapshot.state}" role="dialog" aria-modal="true" aria-label="${escapeHtml(content[1])}"><section class="state-card"><span class="state-icon">${content[0]}</span><h2>${content[1]}</h2><p>${escapeHtml(content[2])}</p>${snapshot.state==='pending'?'<strong>NO CONFIRMADO</strong>':''}${pendingActions}<small>Estado ficticio · sin backend</small></section></div>`;
}

function ticketModal(){
  if(!ticketOpen) return '';
  return `<div class="ticket-modal" role="dialog" aria-modal="true"><article class="demo-ticket"><div class="proto-brand" style="justify-content:center"><i>R</i><span>Restaurant OS</span></div><p>Ticket ficticio TICKET-DEMO-8492</p><h2>Mesa 04</h2><dl><div><dt>Consumo demo</dt><dd>$240.00</dd></div><div><dt>Propina voluntaria demo</dt><dd>$24.00</dd></div><div><dt>Total ilustrativo</dt><dd>$264.00 MXN</dd></div></dl><p class="fiscal-warning">DOCUMENTO DE DEMOSTRACIÓN — SIN VALIDEZ FISCAL</p><p>No representa un pago, recibo ni CFDI real.</p><button data-close-ticket>Cerrar vista previa</button></article></div>`;
}

function actionButton(action,index){
  const disabled=action.type==='disabled';
  return `<button class="${index===0&&!disabled?'primary':''} ${disabled?'disabled':''}" data-action-index="${index}" ${disabled?'aria-disabled="true"':''}>${escapeHtml(action.label)}</button>`;
}

function render(snapshot){
  const screen=findScreen(snapshot.screen);
  const image=screen.id==='TAB-03'&&snapshot.orientation==='landscape'?'TAB-03-horizontal.png':screen.image;
  document.title=`${screen.id} · ${screen.title} · Prototipo Fase 0.5`;
  document.body.className=`${group.theme}${captureMode?' capture-mode':''}`;
  document.body.innerHTML=`<header class="proto-header"><div class="proto-brand"><i>R</i><span>Restaurant OS<small>${escapeHtml(group.name)} · prototipo</small></span></div><span class="demo-ribbon">DEMOSTRACIÓN · SIN OPERACIONES REALES</span><div class="proto-tools"><a href="../index.html">Índice</a><button data-reset>Restablecer demo</button></div></header><div class="proto-layout"><aside class="proto-nav"><h2>${escapeHtml(group.name)}</h2><p>${escapeHtml(group.platform)} · ${group.screens.length} destinos</p><nav class="proto-nav-list" aria-label="Pantallas">${group.screens.map(item=>`<a href="#${item.id}" class="${item.id===screen.id?'active':''}" data-nav="${item.id}"><code>${item.id}</code><span>${escapeHtml(item.title)}</span></a>`).join('')}</nav></aside><main class="proto-main"><header class="proto-title"><div><p>${screen.id} · flujo simulado</p><h1>${escapeHtml(screen.title)}</h1><span>${escapeHtml(snapshot.notice)}</span></div><code class="route-chip">${escapeHtml(screen.route)}</code></header><section class="screen-stage ${snapshot.orientation}"><img src="../assets/screens/${image}" alt="Mockup aprobado ${screen.id}: ${escapeHtml(screen.title)}"><span class="simulation-mark">Referencia visual aprobada · capa interactiva externa</span>${overlay(snapshot)}${ticketModal()}</section></main><aside class="proto-panel"><section><p class="d2-eyebrow">Acciones de recorrido</p><h2>${screen.id}</h2><p>Estas acciones solo actualizan datos ficticios en memoria.</p><div class="action-list">${screen.actions.map(actionButton).join('')}</div></section><section><h3>Estado ficticio central</h3><div class="demo-facts">${facts(snapshot).map(([key,value])=>`<div><span>${escapeHtml(key)}</span><b>${escapeHtml(value)}</b></div>`).join('')}</div></section><section><h3>Estados UX</h3><p>Forzar una respuesta visual sin ejecutar la acción.</p><div class="state-grid">${UX_STATES.map(([key,label])=>`<button class="${snapshot.state===key?'active':''}" data-state="${key}">${escapeHtml(label)}</button>`).join('')}</div></section></aside></div>`;
  bind(screen,snapshot);
}

function bind(screen,snapshot){
  document.querySelectorAll('[data-nav]').forEach(link=>link.addEventListener('click',event=>{event.preventDefault();navigate(link.dataset.nav);}));
  document.querySelectorAll('[data-action-index]').forEach(button=>button.addEventListener('click',()=>{
    const action=screen.actions[Number(button.dataset.actionIndex)];
    if(action.type==='nav') navigate(action.target);
    else if(action.type==='ack') engine.begin(action.label,action.target,action.mutation);
    else if(action.type==='state') engine.setState(action.target);
    else if(action.type==='toggle') engine.setOrientation(snapshot.orientation==='portrait'?'landscape':'portrait');
    else if(action.type==='set-language'){engine.data.guest.language=action.target;engine.notice=`Idioma ficticio: ${action.target}`;engine.emit();}
    else if(action.type==='ticket'){ticketOpen=true;engine.emit();}
    else {engine.notice='Función futura no operativa en Fase 0.5';engine.emit();}
  }));
  document.querySelectorAll('[data-state]').forEach(button=>button.addEventListener('click',()=>engine.setState(button.dataset.state)));
  document.querySelector('[data-reset]')?.addEventListener('click',()=>{ticketOpen=false;engine.reset();history.replaceState(null,'',`${location.pathname}${location.search}#${engine.initialScreen}`);});
  document.querySelector('[data-confirm-ack]')?.addEventListener('click',()=>{engine.confirm();history.replaceState(null,'',`${location.pathname}${location.search}#${engine.screen}`);});
  document.querySelectorAll('[data-reject]').forEach(button=>button.addEventListener('click',()=>engine.reject(button.dataset.reject)));
  document.querySelector('[data-close-state]')?.addEventListener('click',()=>engine.setState('normal'));
  document.querySelector('[data-close-ticket]')?.addEventListener('click',()=>{ticketOpen=false;engine.emit();});
}

engine.subscribe(render);
addEventListener('hashchange',()=>{const id=location.hash.slice(1);if(group.screens.some(x=>x.id===id)&&id!==engine.screen)engine.go(id);});
render(engine.snapshot());
