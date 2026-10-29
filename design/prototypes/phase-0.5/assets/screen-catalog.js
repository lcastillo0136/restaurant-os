const a=(label,type,target=null,mutation='none')=>({label,type,target,mutation});

export const SCREEN_GROUPS = {
  admin: {
    name:'Administración', theme:'admin-light', initial:'ADM-01', platform:'React web',
    screens:[
      ['ADM-01','Inicio de sesión','/login',[a('Entrar con usuario demo','ack','ADM-02','loginAdmin'),a('Mostrar error de validación','state','validation')]],
      ['ADM-02','Dashboard general','/dashboard',[a('Gestionar mesas','nav','ADM-03'),a('Consultar pedidos','nav','ADM-05'),a('Abrir reportes','nav','ADM-09')]],
      ['ADM-03','Gestión de mesas y áreas','/mesas',[a('Seleccionar Mesa 04','nav','ADM-04'),a('Abrir sesión demo en Mesa 01','ack','ADM-04','openTable')]],
      ['ADM-04','Detalle de mesa y sesión','/mesas/:tableId',[a('Consultar pedido #1284','nav','ADM-05'),a('Simular conflicto de versión','state','conflict'),a('Volver al salón','nav','ADM-03')]],
      ['ADM-05','Gestión de pedidos','/pedidos',[a('Abrir catálogo','nav','ADM-06'),a('Permiso insuficiente: cancelar','state','forbidden'),a('Volver al dashboard','nav','ADM-02')]],
      ['ADM-06','Menú y productos','/menu',[a('Guardar producto demo','ack','ADM-06','saveMenu'),a('Validar formulario','state','validation'),a('Consultar personal','nav','ADM-07')]],
      ['ADM-07','Empleados, roles y horarios','/personal',[a('Ver dispositivos','nav','ADM-08'),a('Simular permiso insuficiente','state','forbidden')]],
      ['ADM-08','Gestión de dispositivos','/ajustes/dispositivos',[a('Liberar vínculo demo','ack','ADM-08','none'),a('NFC/QR futuro · no operativo','disabled')]],
      ['ADM-09','Reportes básicos','/reportes',[a('Cambiar a estado vacío','state','empty'),a('Abrir configuración','nav','ADM-10'),a('Volver al dashboard','nav','ADM-02')]],
      ['ADM-10','Configuración general','/ajustes',[a('Guardar configuración demo','ack','ADM-10','none'),a('Volver al dashboard','nav','ADM-02')]]
    ]
  },
  tablet: {
    name:'Tableta de cliente', theme:'customer-warm', initial:'TAB-01', platform:'Flutter Android',
    screens:[
      ['TAB-01','Bienvenida de mesa','/bienvenida',[a('Español','set-language','es-MX'),a('English','set-language','en-US'),a('Continuar','nav','TAB-02'),a('Cambiar orientación','toggle')]],
      ['TAB-02','Acceso como invitado','/acceso/invitado',[a('Solicitar acceso invitado','ack','TAB-03','guest'),a('NFC/QR futuro · no operativo','disabled'),a('Volver','nav','TAB-01')]],
      ['TAB-03','Menú y categorías','/menu',[a('Buscar productos','nav','TAB-04'),a('Abrir Tacos de setas','nav','TAB-05'),a('Ver carrito','nav','TAB-07'),a('Cambiar orientación','toggle')]],
      ['TAB-04','Búsqueda de productos','/menu/buscar',[a('Seleccionar resultado','nav','TAB-05'),a('Mostrar búsqueda vacía','state','empty'),a('Volver al menú','nav','TAB-03')]],
      ['TAB-05','Detalle de platillo','/menu/:productId',[a('Elegir complementos','nav','TAB-06'),a('Producto no disponible','state','error'),a('Volver al menú','nav','TAB-03')]],
      ['TAB-06','Selección de complementos','/menu/:productId/complementos',[a('Agregar selección al carrito','ack','TAB-07','addCart'),a('Validación de modificadores','state','validation'),a('Cancelar','state','cancelled')]],
      ['TAB-07','Carrito','/carrito',[a('Revisar pedido','nav','TAB-08'),a('Seguir ordenando','nav','TAB-03'),a('Carrito vacío','state','empty')]],
      ['TAB-08','Confirmación de pedido','/pedido/confirmar',[a('Enviar pedido de demostración','ack','TAB-09','order'),a('Simular conflicto de disponibilidad','state','conflict'),a('Volver al carrito','nav','TAB-07')]],
      ['TAB-09','Seguimiento del pedido','/pedido/estado',[a('Solicitar atención','nav','TAB-11'),a('Consultar consumo','nav','TAB-10'),a('Simular sin conexión','state','offline')]],
      ['TAB-10','Consumo actual','/consumo',[a('Solicitar mesero','nav','TAB-11'),a('Finalizar demostración','nav','TAB-12'),a('Volver al estado','nav','TAB-09')]],
      ['TAB-11','Solicitud de mesero','/atencion',[a('Enviar solicitud demo','ack','TAB-09','attention'),a('Cancelar solicitud','state','cancelled'),a('Volver','nav','TAB-09')]],
      ['TAB-12','Cierre y reinicio de sesión pública','/fin-de-visita',[a('Confirmar reinicio demo','ack','TAB-01','endGuest'),a('Volver al consumo','nav','TAB-10')]]
    ]
  },
  kds: {
    name:'Cocina KDS', theme:'kitchen-dark', initial:'KDS-01', platform:'React web',
    screens:[
      ['KDS-01','Tablero principal','/kds/tablero',[a('Filtrar estación','nav','KDS-02'),a('Abrir ticket demo','nav','KDS-03'),a('Simular desconexión','nav','KDS-07')]],
      ['KDS-02','Filtro por estación','/kds/tablero?station=:stationId',[a('Cocina principal','nav','KDS-01'),a('Abrir primer ticket','nav','KDS-03'),a('Estación sin tickets','state','empty')]],
      ['KDS-03','Detalle de pedido','/kds/pedidos/:ticketId',[a('Solicitar inicio','nav','KDS-04'),a('Volver al tablero','nav','KDS-01')]],
      ['KDS-04','Inicio de preparación','/kds/pedidos/:ticketId/iniciar',[a('Confirmar inicio demo','ack','KDS-01','kdsStart'),a('Conflicto de versión','state','conflict'),a('Cancelar','state','cancelled')]],
      ['KDS-05','Pedido listo','/kds/pedidos/:ticketId/listo',[a('Confirmar listo demo','ack','KDS-01','kdsReady'),a('Registrar entrega demo','ack','KDS-06','kdsDeliver'),a('Cancelar','state','cancelled')]],
      ['KDS-06','Historial de pedidos atendidos','/kds/historial',[a('Volver al tablero','nav','KDS-01'),a('Historial vacío','state','empty')]],
      ['KDS-07','Desconexión y recuperación','/kds/recuperacion',[a('Reconectar y recuperar snapshot','ack','KDS-01','reconnect'),a('Ver snapshot sin mutaciones','state','offline')]]
    ]
  },
  pos: {
    name:'Caja POS', theme:'pos-light', initial:'POS-08', platform:'React web',
    screens:[
      ['POS-01','Selección de mesa o cuenta','/pos/cuentas',[a('Seleccionar Mesa 04','nav','POS-02'),a('Cuenta vacía','state','empty'),a('Abrir pendientes','nav','POS-10')]],
      ['POS-02','Detalle de consumo','/pos/cuentas/:sessionId',[a('Elegir método de pago','nav','POS-03'),a('Saldo cambió','state','conflict'),a('Volver a cuentas','nav','POS-01')]],
      ['POS-03','Selección de método de pago','/pos/cuentas/:sessionId/pago',[a('Continuar con efectivo','nav','POS-04'),a('Tarjeta · no disponible','disabled'),a('División · no disponible','disabled')]],
      ['POS-04','Cobro en efectivo','/pos/cuentas/:sessionId/efectivo',[a('Continuar a propina','nav','POS-05'),a('Importe inválido','state','validation'),a('Cancelar','state','cancelled')]],
      ['POS-05','Registro de propina','/pos/cuentas/:sessionId/propina',[a('Registrar propina voluntaria','ack','POS-06','tip'),a('Continuar sin propina','nav','POS-06'),a('Volver','nav','POS-04')]],
      ['POS-06','Confirmación de pago','/pos/cuentas/:sessionId/confirmacion',[a('Emitir ACK de pago simulado','ack','POS-07','payment'),a('Respuesta desconocida','nav','POS-10'),a('Sin conexión','state','offline')]],
      ['POS-07','Ticket','/pos/tickets/:receiptId',[a('Vista previa de ticket demo','ticket'),a('Simular error de impresión','state','error'),a('Volver a cuentas','nav','POS-01')]],
      ['POS-08','Apertura de caja','/pos/apertura',[a('Solicitar apertura demo','ack','POS-01','cashOpen'),a('Validar fondo inicial','state','validation')]],
      ['POS-09','Cierre y arqueo de caja','/pos/cierre',[a('Solicitar cierre demo','ack','POS-08','cashClose'),a('Diferencia requiere revisión','state','forbidden'),a('Guardar borrador','state','cancelled')]],
      ['POS-10','Errores y operaciones pendientes','/pos/pendientes',[a('Conciliar pago demo','ack','POS-07','payment'),a('Volver a cuentas','nav','POS-01'),a('Abrir cierre','nav','POS-09')]]
    ]
  },
  waiter: {
    name:'Meseros', theme:'customer-warm', initial:'WAI-01', platform:'Flutter Android',
    screens:[
      ['WAI-01','Acceso del empleado','/mesero/login',[a('Iniciar sesión demo','ack','WAI-02','waiterLogin'),a('PIN inválido','state','validation')]],
      ['WAI-02','Mesas asignadas','/mesero/salon',[a('Abrir Mesa 04','nav','WAI-03'),a('Ver pedidos','nav','WAI-05'),a('Ver solicitudes','nav','WAI-06')]],
      ['WAI-03','Detalle de mesa','/mesero/mesas/:tableId',[a('Registrar pedido','nav','WAI-04'),a('Consultar seguimiento','nav','WAI-05'),a('Registrar entrega','nav','WAI-07')]],
      ['WAI-04','Registro de pedidos','/mesero/mesas/:tableId/pedido',[a('Enviar pedido demo','ack','WAI-05','waiterOrder'),a('Validación de modificadores','state','validation'),a('Volver a mesa','nav','WAI-03')]],
      ['WAI-05','Seguimiento de pedidos','/mesero/pedidos',[a('Abrir entrega lista','nav','WAI-07'),a('Volver al salón','nav','WAI-02'),a('Sin conexión','state','offline')]],
      ['WAI-06','Solicitudes de clientes','/mesero/solicitudes',[a('Atender solicitud demo','ack','WAI-03','none'),a('Volver al salón','nav','WAI-02')]],
      ['WAI-07','Entrega de alimentos','/mesero/pedidos/:orderId/entrega',[a('Confirmar entrega demo','ack','WAI-05','waiterDeliver'),a('Reportar incidencia','state','error'),a('Cancelar','state','cancelled')]]
    ]
  }
};

for(const [kind,group] of Object.entries(SCREEN_GROUPS)) {
  group.screens=group.screens.map(([id,title,route,actions])=>({id,title,route,actions,image:`${id}.png`,kind}));
}

export const ALL_SCREENS = Object.freeze(Object.values(SCREEN_GROUPS).flatMap(group=>group.screens));
export function findScreen(id) { return ALL_SCREENS.find(screen=>screen.id===id); }
