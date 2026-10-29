/* Datos ficticios centralizados. No contienen información personal real. */
export const INITIAL_DEMO_DATA = Object.freeze({
  meta: { organizationId: 'org_demo_001', branchId: 'branch_demo_centro', currency: 'MXN', simulated: true },
  employee: { id: 'EMP-DEMO-014', name: 'Jorge Demo', role: 'Mesero', authenticated: false },
  guest: { sessionConfirmed: false, language: 'es-MX', tableId: 'M04', attentionRequested: false },
  tables: [
    { id: 'M01', label: 'Mesa 01', status: 'available' },
    { id: 'M04', label: 'Mesa 04', status: 'active' },
    { id: 'M07', label: 'Mesa 07', status: 'ready' },
    { id: 'M09', label: 'Mesa 09', status: 'attention' }
  ],
  products: [
    { id: 'P01', name: 'Tacos de setas', price: 99, available: true },
    { id: 'P02', name: 'Ensalada verde', price: 125, available: true },
    { id: 'P03', name: 'Agua mineral', price: 42, available: true },
    { id: 'P04', name: 'Pastel de cacao', price: 85, available: true }
  ],
  cart: { items: [], total: 0, confirmed: false },
  order: { id: null, status: 'draft', station: 'Cocina principal', version: 1 },
  kitchen: { ticketId: 'KOT-DEMO-1284', status: 'pending', connected: true, history: [] },
  cash: { registerId: 'CAJA-DEMO-01', open: false, openingFloat: 1500, counted: 13930, expected: 13980, paymentConfirmed: false, tip: 0 },
  account: { tableId: 'M04', subtotal: 240, paid: false, receiptId: null },
  waiter: { assignedTables: ['M01','M04','M07','M09'], draftSent: false, delivered: false }
});

export function createDemoData() {
  return JSON.parse(JSON.stringify(INITIAL_DEMO_DATA));
}
