import assert from 'node:assert/strict';
import { PrototypeEngine, UX_STATES } from '../design/prototypes/phase-0.5/assets/engine.js';
import { ALL_SCREENS, SCREEN_GROUPS } from '../design/prototypes/phase-0.5/assets/screen-catalog.js';

assert.equal(ALL_SCREENS.length,46);
assert.equal(new Set(ALL_SCREENS.map(x=>x.id)).size,46);
assert.equal(UX_STATES.length,11);

const ack=(engine,label,target,mutation)=>{assert.equal(engine.begin(label,target,mutation),true);assert.equal(engine.state,'pending');assert.equal(engine.confirm(),true);assert.equal(engine.state,'confirmed');assert.equal(engine.screen,target);};

const admin=new PrototypeEngine('admin','ADM-01');
ack(admin,'login','ADM-02','loginAdmin'); assert.equal(admin.data.employee.authenticated,true);
admin.go('ADM-03'); ack(admin,'mesa','ADM-04','openTable'); assert.equal(admin.data.tables.find(x=>x.id==='M01').status,'active');

const tablet=new PrototypeEngine('tablet','TAB-01');
ack(tablet,'invitado','TAB-03','guest'); assert.equal(tablet.data.guest.sessionConfirmed,true);
tablet.go('TAB-06'); ack(tablet,'carrito','TAB-07','addCart'); assert.equal(tablet.data.cart.total,240);
tablet.go('TAB-08'); ack(tablet,'pedido','TAB-09','order'); assert.equal(tablet.data.order.id,'ORDER-DEMO-1284');
tablet.go('TAB-11'); ack(tablet,'atención','TAB-09','attention'); assert.equal(tablet.data.guest.attentionRequested,true);
tablet.go('TAB-12'); ack(tablet,'cierre','TAB-01','endGuest'); assert.equal(tablet.data.guest.sessionConfirmed,false);
tablet.setOrientation('landscape'); assert.equal(tablet.orientation,'landscape'); tablet.reset(); assert.equal(tablet.orientation,'portrait');

const kds=new PrototypeEngine('kds','KDS-01');
ack(kds,'inicio','KDS-01','kdsStart'); assert.equal(kds.data.kitchen.status,'preparing');
ack(kds,'listo','KDS-01','kdsReady'); assert.equal(kds.data.kitchen.status,'ready');
ack(kds,'entrega','KDS-06','kdsDeliver'); assert.equal(kds.data.kitchen.status,'delivered');
kds.setState('offline'); assert.equal(kds.begin('bloqueada','KDS-01','reconnect'),false); assert.equal(kds.data.kitchen.status,'delivered');

const pos=new PrototypeEngine('pos','POS-08');
ack(pos,'apertura','POS-01','cashOpen'); assert.equal(pos.data.cash.open,true);
pos.go('POS-05'); ack(pos,'propina','POS-06','tip'); assert.equal(pos.data.cash.tip,24);
ack(pos,'pago','POS-07','payment'); assert.equal(pos.data.account.paid,true); assert.match(pos.data.account.receiptId,/DEMO/);
pos.go('POS-09'); ack(pos,'cierre','POS-08','cashClose'); assert.equal(pos.data.cash.open,false);

const waiter=new PrototypeEngine('waiter','WAI-01');
ack(waiter,'login','WAI-02','waiterLogin'); assert.equal(waiter.data.employee.role,'Mesero demo');
waiter.go('WAI-04'); ack(waiter,'pedido','WAI-05','waiterOrder'); assert.equal(waiter.data.waiter.draftSent,true);
waiter.go('WAI-07'); ack(waiter,'entrega','WAI-05','waiterDeliver'); assert.equal(waiter.data.waiter.delivered,true);

for(const [kind,group] of Object.entries(SCREEN_GROUPS)){assert.ok(group.initial);assert.ok(group.screens.length>0,kind);for(const screen of group.screens)assert.ok(screen.actions.length>0,screen.id);}
console.log('Navegación Fase 0.5 validada: 46 destinos, 11 estados y 5 recorridos con ACK simulado.');
