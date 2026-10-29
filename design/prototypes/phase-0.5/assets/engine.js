import { createDemoData } from './demo-data.js';

const ALLOWED_STATES = new Set(['normal','empty','loading','error','offline','pending','confirmed','forbidden','validation','conflict','cancelled']);

export class PrototypeEngine {
  constructor(environment, initialScreen) {
    this.environment = environment;
    this.initialScreen = initialScreen;
    this.listeners = new Set();
    this.reset();
  }

  snapshot() { return { environment:this.environment, screen:this.screen, state:this.state, data:this.data, pending:this.pending, notice:this.notice, orientation:this.orientation }; }
  subscribe(listener) { this.listeners.add(listener); return () => this.listeners.delete(listener); }
  emit() { const snapshot=this.snapshot(); this.listeners.forEach(listener=>listener(snapshot)); }
  go(screen) { this.screen=screen; this.state='normal'; this.pending=null; this.notice='Navegación simulada'; this.emit(); }
  setState(state) { if(!ALLOWED_STATES.has(state)) throw new Error(`Estado UX no permitido: ${state}`); this.state=state; this.pending=null; this.notice=`Estado de demostración: ${state}`; this.emit(); }
  setOrientation(value) { this.orientation=value==='landscape'?'landscape':'portrait'; this.notice=`Orientación simulada: ${this.orientation}`; this.emit(); }

  begin(label, target, mutation='none') {
    if(this.state==='offline') { this.notice='Acción bloqueada: sin conexión simulada'; this.emit(); return false; }
    this.state='pending';
    this.pending={ label, target, mutation, requestId:`DEMO-${String(this.sequence++).padStart(4,'0')}` };
    this.notice='Solicitud ficticia pendiente; aún no está confirmada';
    this.emit();
    return true;
  }

  confirm() {
    if(!this.pending) return false;
    const operation=this.pending;
    this.applyMutation(operation.mutation);
    this.screen=operation.target || this.screen;
    this.pending=null;
    this.state='confirmed';
    this.notice='ACK SIMULADO CONFIRMADO — no representa una operación real';
    this.emit();
    return true;
  }

  reject(reason='error') {
    if(!this.pending) return false;
    this.pending=null;
    this.state=ALLOWED_STATES.has(reason)?reason:'error';
    this.notice='La simulación terminó sin confirmación';
    this.emit();
    return true;
  }

  applyMutation(name) {
    const d=this.data;
    const mutations={
      loginAdmin:()=>{ d.employee.authenticated=true; d.employee.role='Administrador demo'; },
      openTable:()=>{ const table=d.tables.find(x=>x.id==='M01'); if(table)table.status='active'; },
      saveMenu:()=>{ d.products[0].available=true; },
      guest:()=>{ d.guest.sessionConfirmed=true; },
      addCart:()=>{ d.cart.items=[{productId:'P01',quantity:2},{productId:'P03',quantity:1}]; d.cart.total=240; },
      order:()=>{ d.cart.confirmed=true; d.order={...d.order,id:'ORDER-DEMO-1284',status:'received',version:d.order.version+1}; },
      attention:()=>{ d.guest.attentionRequested=true; },
      endGuest:()=>{ d.guest.sessionConfirmed=false; d.guest.attentionRequested=false; d.cart={items:[],total:0,confirmed:false}; },
      kdsStart:()=>{ d.kitchen.status='preparing'; },
      kdsReady:()=>{ d.kitchen.status='ready'; },
      kdsDeliver:()=>{ d.kitchen.history.push({ticketId:d.kitchen.ticketId,status:'delivered'}); d.kitchen.status='delivered'; },
      reconnect:()=>{ d.kitchen.connected=true; },
      cashOpen:()=>{ d.cash.open=true; },
      tip:()=>{ d.cash.tip=24; },
      payment:()=>{ d.cash.paymentConfirmed=true; d.account.paid=true; d.account.receiptId='TICKET-DEMO-8492'; },
      cashClose:()=>{ d.cash.open=false; },
      waiterLogin:()=>{ d.employee.authenticated=true; d.employee.role='Mesero demo'; },
      waiterOrder:()=>{ d.waiter.draftSent=true; d.order.status='received'; },
      waiterDeliver:()=>{ d.waiter.delivered=true; d.order.status='delivered'; }
    };
    (mutations[name]||(()=>{}))();
  }

  reset() {
    this.data=createDemoData();
    this.screen=this.initialScreen;
    this.state='normal';
    this.pending=null;
    this.notice='Estado ficticio inicial';
    this.orientation='portrait';
    this.sequence=1;
    if(this.listeners) this.emit();
  }
}

export const UX_STATES = Object.freeze([
  ['normal','Normal'],['empty','Vacío'],['loading','Cargando'],['error','Error'],['offline','Sin conexión'],
  ['pending','Pendiente ACK'],['confirmed','ACK simulado'],['forbidden','Permiso insuficiente'],
  ['validation','Validación'],['conflict','Conflicto'],['cancelled','Cancelación']
]);
