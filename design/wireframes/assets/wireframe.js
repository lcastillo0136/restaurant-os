/* Restaurant OS — visor de wireframes de Fase 0.3.
 * Artefacto estático para revisión UX: no llama API, no persiste ni ejecuta flujos.
 */
(function () {
  'use strict';

  const config = window.WIREFRAME_CONFIG;
  if (!config) return;

  const states = [
    ['normal', 'Normal'], ['empty', 'Vacío'], ['loading', 'Cargando'],
    ['error', 'Error'], ['offline', 'Sin conexión'], ['pending', 'Pendiente ACK'],
    ['confirmed', 'Muestra: ACK recibido'], ['forbidden', 'Sin permiso'],
    ['validation', 'Validación'], ['conflict', 'Conflicto'], ['cancelled', 'Cancelada']
  ];
  let state = 'normal';
  let orientation = 'portrait';

  const $ = (selector) => document.querySelector(selector);
  const esc = (value) => String(value || '').replace(/[&<>"']/g, (char) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[char]));
  const one = (value) => Array.isArray(value) ? value.join(' · ') : value;
  const money = (value) => `$${value} MXN`;

  function linkList() {
    return config.screens.map((screen) => `
      <a class="screen-link" href="#${esc(screen.id)}" data-id="${esc(screen.id)}">
        <code>${esc(screen.id)}</code><span>${esc(screen.title)}</span>
      </a>`).join('');
  }

  function pageShell() {
    document.body.innerHTML = `
      <div class="wf-page ${esc(config.theme)}">
        <div class="wf-banner">
          <span><strong>Restaurant OS · Fase 0.3</strong> · Wireframe estático para revisión. No ejecuta operaciones ni sustituye validación servidor.</span>
          <span class="badge">${esc(config.platform)}</span>
        </div>
        <header class="wf-topbar">
          <div class="brand"><span class="brand-mark">R</span><span>Restaurant OS<small>${esc(config.environment)}</small></span></div>
          <nav aria-label="Navegación de entornos"><a class="nav-link" href="../index.html">Índice</a><a class="nav-link active" href="#${esc(config.screens[0].id)}">${esc(config.shortName)}</a></nav>
          <span class="top-note">${esc(config.reference)}</span>
        </header>
        <div class="wf-workbench">
          <aside class="screen-rail"><h2>Pantallas</h2><p>${config.screens.length} wireframes · rutas previstas</p><div class="screen-list">${linkList()}</div></aside>
          <main class="wf-main"><div id="wireframe-root"></div></main>
        </div>
      </div>`;
  }

  function chips(screen) {
    return `
      <div class="meta-chips">
        <span class="badge">Rol: ${esc(one(screen.role))}</span>
        <span class="badge">Ruta: <code>${esc(screen.route)}</code></span>
        <span class="badge">Flujos: ${esc(one(screen.flows))}</span>
        <span class="badge">Permiso: ${esc(screen.permission)}</span>
      </div>`;
  }

  function stateSwitcher() {
    return `<div class="state-switcher" aria-label="Muestras de estado UX"><label>Estado de muestra</label>${states.map(([id, label]) =>
      `<button class="state-button ${state === id ? 'active' : ''}" type="button" data-state="${id}">${label}</button>`).join('')}</div>`;
  }

  function orientationSwitcher() {
    if (config.kind !== 'tablet') return '';
    return `<div class="orientation-switcher" aria-label="Orientación de muestra"><label>Orientación del wireframe</label><button class="state-button ${orientation === 'portrait' ? 'active' : ''}" type="button" data-orientation="portrait">Vertical · principal</button><button class="state-button ${orientation === 'landscape' ? 'active' : ''}" type="button" data-orientation="landscape">Horizontal · adaptable</button></div>`;
  }

  function button(label, kind) { return `<button class="action ${kind || ''}" type="button">${esc(label)}</button>`; }
  function row(icon, title, sub, tail) {
    return `<div class="data-row"><span class="avatar">${esc(icon)}</span><div><strong>${esc(title)}</strong><span>${esc(sub)}</span></div>${tail ? `<div class="trailing">${tail}</div>` : ''}</div>`;
  }
  function card(title, value, tone, description) {
    return `<article class="card"><h3>${esc(title)}</h3><p>${esc(description || 'Dato de ejemplo para jerarquía visual')}</p><strong class="metric ${tone || ''}">${esc(value)}</strong></article>`;
  }

  function adminHeader(screen) {
    const sections = ['Dashboard', 'Mesas', 'Pedidos', 'Menú', 'Personal', 'Cajas', 'Reportes', 'Ajustes'];
    const current = screen.nav || screen.title;
    return `<div class="app-head"><strong>Restaurant OS</strong><div class="breadcrumbs">${sections.map((section) => `<span class="badge" style="margin-right:5px;${section === current ? 'background:#171d29;color:#fff;' : ''}">${section}</span>`).join('')}</div><span class="status-dot">● LAN disponible</span></div>`;
  }

  function adminLogin() {
    return `<div class="app-content" style="max-width:560px;margin:55px auto"><div class="card" style="padding:30px"><span class="screen-kicker">Acceso de empleado</span><h2 style="margin:6px 0">Inicia sesión para tu sucursal</h2><p>La autorización y selección de destino ocurren solo tras respuesta del servidor.</p><div class="form-grid" style="margin-top:22px"><div class="field">Usuario o correo</div><div class="field">Contraseña</div></div><div class="action-row" style="margin-top:20px">${button('Solicitar autenticación', 'primary')}${button('Cancelar')}</div><p style="margin-top:16px;font-size:12px">Ruta segura: credenciales inválidas, sesión vencida o falta de LAN nunca revelan datos de la cuenta.</p></div></div>`;
  }

  function adminDashboard() {
    return `<div class="app-content"><div class="app-title-row"><div><h2>Resumen operativo</h2><p>Una sucursal · datos de muestra, no métricas reales.</p></div>${button('Filtrar fecha')}</div><div class="grid grid-4">${card('Ventas del día', money('12,480'), 'good', 'Confirmado por servidor')} ${card('Mesas activas', '8 / 16', '', 'Estado de salón')} ${card('Pedidos abiertos', '12', 'warning', 'Pendientes de estación')} ${card('Conectividad', 'LAN', 'good', 'Última sincronización 10:42')}</div><div class="grid grid-2" style="margin-top:16px"><article class="card"><h3>Actividad por hora</h3><div class="fake-chart"></div></article><article class="card"><h3>Alertas de operación</h3>${row('M4','Mesa 04 solicita atención','Esperando ACK', '<span class="tag warning">Pendiente</span>')}${row('K','Cocina','2 tickets en preparación','<span class="tag neutral">Ver KDS</span>')}${row('$','Caja principal','Turno abierto','<span class="tag success">Activa</span>')}</article></div></div>`;
  }

  function adminTables(screen) {
    const detail = screen.id === 'ADM-04';
    return `<div class="app-content"><div class="app-title-row"><div><h2>${detail ? 'Mesa 04 · Sesión activa' : 'Mesas y áreas'}</h2><p>${detail ? 'Detalle autorizado de sesión; las mutaciones esperan ACK.' : 'Plano de salón para consultar, abrir o supervisar mesas.'}</p></div>${detail ? button('Solicitar cambio de mesa') : button('Configurar áreas')}</div>${detail ? `<div class="grid grid-2"><article class="card"><p class="section-label">Sesión</p><h3>Comensal invitado · Mesa 04</h3>${row('01','Pedido 000128','En preparación · cocina principal','<span class="tag warning">Pendiente</span>')}${row('02','Pedido 000129','Listo para entrega','<span class="tag success">Listo</span>')}<div class="action-row" style="margin-top:14px">${button('Ver pedidos')}${button('Solicitar limpieza')}</div></article><article class="card"><p class="section-label">Consumo actual</p>${row('×2','Tacos de setas',money('198.00'),'')}${row('×1','Agua mineral',money('42.00'),'')}<div class="summary-total"><span>Total informativo</span><span>${money('240.00')}</span></div><p style="margin-top:12px">El importe final se confirma en caja.</p></article></div>` : `<div class="toolbar"><div class="field">Área: Salón principal</div><div class="field grow">Buscar mesa</div>${button('Nueva mesa', 'primary')}</div><div class="table-map">${['01','02','03','04','05','06','07','08','09','10'].map((id, index) => `<article class="table-seat ${index === 3 || index === 6 ? 'occupied' : index === 8 ? 'cleaning' : ''}"><strong>Mesa ${id}</strong><small>${index === 3 ? 'Sesión activa' : index === 6 ? 'Esperando cocina' : index === 8 ? 'Por limpiar' : 'Disponible'}</small></article>`).join('')}</div>`}</div>`;
  }

  function adminOrders() {
    return `<div class="app-content"><div class="app-title-row"><div><h2>Gestión de pedidos</h2><p>Consulta y excepción autorizada; cancelar o modificar requiere permiso y confirmación.</p></div>${button('Filtros')}</div><article class="card"><div class="toolbar"><div class="field grow">Buscar orden, mesa o turno</div><div class="field">Estado: todos</div></div>${row('#128','Mesa 04 · 2 ítems','En preparación · 10:42','<span class="tag warning">En curso</span>')}${row('#129','Mesa 07 · 4 ítems','Listo · 10:39','<span class="tag success">Listo</span>')}${row('#127','Mesa 02 · 1 ítem','Entregado · 10:30','<span class="tag neutral">Entregado</span>')}<div class="action-row" style="margin-top:14px">${button('Ver detalle')}${button('Solicitar cancelación', 'danger')}</div></article></div>`;
  }

  function adminMenu() {
    return `<div class="app-content"><div class="app-title-row"><div><h2>Menú y productos</h2><p>Catálogo por sucursal. Los cambios no afectan precios snapshot de pedidos previos.</p></div>${button('Nuevo producto', 'primary')}</div><div class="grid grid-2"><article class="card"><p class="section-label">Categorías</p>${row('E','Entradas','8 productos','<span class="tag success">Visible</span>')}${row('P','Platos fuertes','14 productos','<span class="tag success">Visible</span>')}${row('B','Bebidas','12 productos','<span class="tag neutral">Horario</span>')}</article><article class="card"><p class="section-label">Editor de producto · muestra</p><div class="form-grid"><div class="field">Nombre: Tacos de setas</div><div class="field">Precio: $99.00</div><div class="field">Categoría: Platos fuertes</div><div class="field">Disponibilidad: Activa</div></div><div class="action-row" style="margin-top:15px">${button('Guardar y esperar ACK', 'primary')}${button('Cancelar')}</div></article></div></div>`;
  }

  function adminPeople() {
    return `<div class="app-content"><div class="app-title-row"><div><h2>Empleados, roles y horarios</h2><p>Gestión sujeta al ámbito delegado del administrador o gerente.</p></div>${button('Agregar empleado', 'primary')}</div><div class="grid grid-2"><article class="card"><p class="section-label">Equipo</p>${row('AM','Andrea Morales','Gerente · turno activo','<span class="tag success">Activa</span>')}${row('JC','Jorge Cruz','Mesero · turno activo','<span class="tag success">Activo</span>')}${row('SL','Sofía Luna','Cajera · próximo turno','<span class="tag neutral">12:00</span>')}</article><article class="card"><p class="section-label">Horario de hoy</p><div class="fake-chart" style="height:190px"></div><p style="margin-top:12px">Los permisos efectivos se vuelven a validar al ejecutar cada acción.</p></article></div></div>`;
  }

  function adminDevices() {
    return `<div class="app-content"><div class="app-title-row"><div><h2>Gestión de dispositivos</h2><p>Las tabletas son identidades de dispositivo, no usuarios administrativos.</p></div>${button('Vincular dispositivo', 'primary')}</div><article class="card">${row('T01','Tableta mesa 01','Vinculada a mesa 01 · última señal 10:42','<span class="tag success">En línea</span>')}${row('T04','Tableta mesa 04','Sesión pública activa · batería 76%','<span class="tag success">En línea</span>')}${row('T09','Tableta mesa 09','Sin vínculo de mesa · requiere asignación','<span class="tag warning">Pendiente</span>')}<div class="action-row" style="margin-top:14px">${button('Ver vínculo')}${button('Liberar con permiso')}</div></article></div>`;
  }

  function adminReports() {
    return `<div class="app-content"><div class="app-title-row"><div><h2>Reportes básicos</h2><p>Lectura con rango, sucursal y hora de actualización visibles.</p></div>${button('Hoy')}</div><div class="grid grid-3">${card('Ventas confirmadas', money('12,480'), 'good', 'Rango: hoy')} ${card('Pedidos entregados', '86', '', 'Sin exportación en MVP')} ${card('Ocupación media', '63%', 'warning', 'Salón principal')}</div><div class="grid grid-2" style="margin-top:16px"><article class="card"><h3>Tendencia del día</h3><div class="fake-chart"></div></article><article class="card"><h3>Productos solicitados</h3>${row('1','Tacos de setas','22 unidades','')}${row('2','Ensalada verde','18 unidades','')}${row('3','Agua mineral','17 unidades','')}</article></div></div>`;
  }

  function adminSettings() {
    return `<div class="app-content"><div class="app-title-row"><div><h2>Configuración general</h2><p>Parámetros autorizados de organización, sucursal y estaciones.</p></div>${button('Guardar cambios', 'primary')}</div><div class="grid grid-2"><article class="card"><p class="section-label">Sucursal</p><div class="form-grid"><div class="field">Nombre: Sucursal Centro</div><div class="field">Zona horaria: America/Mexico_City</div><div class="field">Moneda: MXN</div><div class="field">Estado: Activa</div></div></article><article class="card"><p class="section-label">Extensiones futuras</p>${row('NFC','Identificación NFC/QR','No disponible hasta fase posterior','<span class="tag neutral">Posterior</span>')}${row('CFDI','Facturación fiscal','Requiere PAC y política aprobada','<span class="tag neutral">Posterior</span>')}${row('P','Pagos electrónicos','No habilitado en este wireframe','<span class="tag neutral">Posterior</span>')}</article></div></div>`;
  }

  function renderAdmin(screen) {
    if (screen.id === 'ADM-01') return `<section class="app-frame">${adminHeader(screen)}${adminLogin()}</section>`;
    let body = adminDashboard();
    if (['ADM-03','ADM-04'].includes(screen.id)) body = `<section class="app-frame">${adminHeader(screen)}${adminTables(screen)}</section>`;
    else if (screen.id === 'ADM-05') body = `<section class="app-frame">${adminHeader(screen)}${adminOrders()}</section>`;
    else if (screen.id === 'ADM-06') body = `<section class="app-frame">${adminHeader(screen)}${adminMenu()}</section>`;
    else if (screen.id === 'ADM-07') body = `<section class="app-frame">${adminHeader(screen)}${adminPeople()}</section>`;
    else if (screen.id === 'ADM-08') body = `<section class="app-frame">${adminHeader(screen)}${adminDevices()}</section>`;
    else if (screen.id === 'ADM-09') body = `<section class="app-frame">${adminHeader(screen)}${adminReports()}</section>`;
    else if (screen.id === 'ADM-10') body = `<section class="app-frame">${adminHeader(screen)}${adminSettings()}</section>`;
    else body = `<section class="app-frame">${adminHeader(screen)}${body}</section>`;
    return body;
  }

  function tabletHeader(screen, waiter) {
    let sessionLabel = 'Invitado confirmado · sesión activa';
    if (screen.id === 'TAB-01') sessionLabel = 'Sin sesión pública iniciada';
    if (screen.id === 'TAB-02') sessionLabel = state === 'confirmed' ? 'Invitado confirmado · sesión activa' : 'Acceso invitado · pendiente de ACK';
    return `<div class="tablet-head"><div class="brand"><span class="brand-mark">R</span><span>Restaurant OS<small>${waiter ? 'Operación de servicio' : 'Mesa 04 · marca configurable'}</small></span></div><span class="table-info">${waiter ? 'Mesero · turno activo' : sessionLabel}</span></div>`;
  }
  function productGrid() {
    return `<div class="product-grid">${['Tacos de setas','Ensalada verde','Agua mineral','Pastel de cacao'].map((name, index) => `<article class="product-card"><div class="product-image"></div><strong>${name}</strong><small>${money(['99.00','125.00','42.00','85.00'][index])}</small></article>`).join('')}</div>`;
  }
  function orderLines() { return `${row('×2','Tacos de setas',money('198.00'),'')} ${row('×1','Agua mineral',money('42.00'),'')} <div class="summary-total"><span>Total informativo</span><span>${money('240.00')}</span></div>`; }

  function tabletWelcome() {
    return `<div class="tablet-content"><div class="tablet-hero"><div class="hero-copy"><span class="badge">Mesa 04</span><h2>Qué gusto tenerte aquí.</h2><p>Elige el idioma y solicita acceso como invitado para comenzar.</p></div><div class="hero-plate"></div></div><article class="tablet-card" style="margin-top:18px"><p class="section-label">Idioma de la experiencia</p><div class="data-row"><span class="avatar">文</span><div><strong>Español (México)</strong><span>Se puede cambiar antes de continuar</span></div><button class="warm-action secondary">Cambiar idioma</button></div></article><div class="split" style="margin-top:18px"><article class="tablet-card"><h3>Continuar como invitado</h3><p>La sesión pública se activa únicamente después del ACK del servidor.</p>${button('Solicitar acceso invitado','primary')}</article><article class="tablet-card"><h3>Identificación NFC / QR</h3><p>Espacio reservado para una fase posterior. No está disponible.</p>${button('Próximamente')}</article></div></div>`;
  }
  function tabletGuest() { return `<div class="tablet-content" style="max-width:650px;margin:auto"><article class="tablet-card"><span class="screen-kicker">Acceso público</span><h2>Continuar como invitado</h2><p>La solicitud se asociará a esta mesa después de la confirmación del servidor. No se solicita información personal.</p><div class="field" style="margin-top:15px">Idioma: Español (México)</div><div class="tablet-footer">${button('Volver')}<button class="warm-action">Solicitar acceso al servidor</button></div></article></div>`; }
  function tabletMenu(search) { return `<div class="tablet-content"><div class="tablet-hero"><div class="hero-copy"><span class="badge">Menú de hoy</span><h2>${search ? 'Busca algo para disfrutar' : 'Elige algo delicioso'}</h2><p>${search ? 'Resultados visuales · ninguna disponibilidad queda reservada.' : 'Categorías y productos disponibles según el último dato recibido.'}</p></div><div class="hero-plate"></div></div>${search ? `<div class="field" style="margin:17px 0">⌕ Buscar: tacos</div>` : `<div class="category-tabs"><span class="category-tab active">Populares</span><span class="category-tab">Entradas</span><span class="category-tab">Platos</span><span class="category-tab">Bebidas</span><span class="category-tab">Postres</span></div><p class="section-label">Productos populares</p>`}${productGrid()}<div class="tablet-footer"><span>Carrito: 2 artículos</span><button class="warm-action">Ver carrito</button></div></div>`; }
  function tabletDish(extras) { return `<div class="tablet-content"><div class="split"><article class="tablet-card"><div class="product-image" style="height:250px"></div></article><article class="tablet-card"><span class="badge">Plato fuerte</span><h2>Tacos de setas</h2><p>Setas al ajo, tortilla de maíz y salsa de la casa.</p><h3>${money('99.00')}</h3>${extras ? `<p class="section-label">Complementos</p>${['Salsa extra','Sin cebolla','Guarnición verde'].map((option,index) => `<div class="data-row"><span class="avatar">${index + 1}</span><div><strong>${option}</strong><span>${index === 2 ? '+ $25.00' : 'Sin costo'}</span></div><span class="tag neutral">Seleccionar</span></div>`).join('')}` : `<p class="section-label">Alérgenos y opciones</p><p>Consulta las opciones disponibles antes de agregar.</p>`}<div class="tablet-footer">${button('Volver')}<button class="warm-action">${extras ? 'Añadir al carrito' : 'Personalizar'}</button></div></article></div></div>`; }
  function tabletCart(confirm) { return `<div class="tablet-content" style="max-width:720px;margin:auto"><article class="tablet-card"><span class="screen-kicker">${confirm ? 'Confirmar pedido' : 'Tu carrito'}</span><h2>${confirm ? 'Revisa antes de enviar' : '2 artículos seleccionados'}</h2>${orderLines()}${confirm ? '<p style="margin-top:15px">Al confirmar, la solicitud se mostrará como pendiente hasta recibir la respuesta del servidor.</p>' : '<p style="margin-top:15px">Aún no se ha creado ningún pedido.</p>'}<div class="tablet-footer">${button('Seguir explorando')}<button class="warm-action">${confirm ? 'Solicitar confirmación' : 'Revisar pedido'}</button></div></article></div>`; }
  function tabletTracking(mode) { const request = mode === 'request'; const reset = mode === 'reset'; return `<div class="tablet-content" style="max-width:720px;margin:auto"><article class="tablet-card"><span class="screen-kicker">${reset ? 'Fin de visita' : request ? 'Atención en mesa' : mode === 'consumption' ? 'Consumo actual' : 'Estado del pedido'}</span><h2>${reset ? 'Gracias por visitarnos' : request ? '¿Necesitas ayuda?' : mode === 'consumption' ? 'Resumen de consumo' : 'Pedido recibido'}</h2>${reset ? '<p>La sesión pública se mostrará cerrada únicamente después de que el servidor confirme el cierre y libere el dispositivo.</p>' : request ? '<p>Envía una sola solicitud. Se mostrará confirmada solo cuando el personal la reciba desde el servidor.</p>' : `${orderLines()}<p style="margin-top:15px">${mode === 'consumption' ? 'Última actualización pendiente de servidor.' : 'Estado: esperando confirmación de la cocina.'}</p>`}<div class="tablet-footer">${button('Volver al menú')}<button class="warm-action">${reset ? 'Reiniciar solo tras ACK' : request ? 'Solicitar atención' : 'Ver detalle'}</button></div></article></div>`; }

  function renderTablet(screen) {
    let body = tabletWelcome();
    if (screen.id === 'TAB-02') body = tabletGuest();
    if (screen.id === 'TAB-03') body = tabletMenu(false);
    if (screen.id === 'TAB-04') body = tabletMenu(true);
    if (screen.id === 'TAB-05') body = tabletDish(false);
    if (screen.id === 'TAB-06') body = tabletDish(true);
    if (screen.id === 'TAB-07') body = tabletCart(false);
    if (screen.id === 'TAB-08') body = tabletCart(true);
    if (screen.id === 'TAB-09') body = tabletTracking('tracking');
    if (screen.id === 'TAB-10') body = tabletTracking('consumption');
    if (screen.id === 'TAB-11') body = tabletTracking('request');
    if (screen.id === 'TAB-12') body = tabletTracking('reset');
    return `<section class="device-stage"><div class="tablet-shell ${orientation}">${tabletHeader(screen, false)}${body}</div></section>`;
  }

  function kdsTicket(title, stage, table) {
    const className = stage === 'Listo' ? 'ready' : stage === 'Preparando' ? 'preparing' : '';
    return `<article class="ticket ${className}"><span class="tag ${stage === 'Listo' ? 'success' : stage === 'Preparando' ? 'warning' : 'neutral'}">${esc(stage)}</span><h3>${esc(title)}</h3><p>Mesa ${esc(table)} · hace 7 min</p><ul><li>2 × Tacos de setas</li><li>1 × Agua mineral</li></ul><div class="ticket-foot"><button class="kds-action ${stage === 'Preparando' ? 'ready' : ''}">${stage === 'Pendiente' ? '▶ Iniciar' : stage === 'Preparando' ? '✓ Listo' : '✓ Servir'}</button><button class="kds-action ghost">Detalle</button></div></article>`;
  }
  function renderKds(screen) {
    const isHistory = screen.id === 'KDS-06'; const isOffline = screen.id === 'KDS-07'; const isDetail = screen.id === 'KDS-03'; const isFilter = screen.id === 'KDS-02'; const isStart = screen.id === 'KDS-04'; const isReady = screen.id === 'KDS-05';
    const connection = isOffline ? '<span class="kds-connection offline">● Sin conexión · último snapshot 10:42</span>' : '<span>↻ Sincronizado 10:42</span>';
    const header = `<div class="kds-head"><div class="kds-logo">Restaurant <span>OS</span> · KDS</div><button class="kds-select">${isFilter ? 'Estación: Cocina caliente' : 'Todas las estaciones'} ▾</button><button class="kds-button active">Tablero</button><button class="kds-button">Lista</button><div class="kds-right">${connection}<span>◷ 11:24</span></div></div>`;
    let content;
    if (isDetail || isStart || isReady) {
      const action = isStart ? 'Iniciar preparación' : isReady ? 'Marcar listo' : 'Volver al tablero';
      content = `<div class="grid grid-2"><article class="ticket ${isReady ? 'preparing' : ''}" style="margin:0;min-height:390px"><span class="tag warning">${isReady ? 'En preparación' : 'Pendiente'}</span><h3>KOT-154647-2</h3><p>Mesa 04 · Estación cocina caliente</p><hr style="border:0;border-top:1px solid #dce1e5"><ul><li>2 × Tacos de setas</li><li>1 × Agua mineral</li><li><strong>Nota: sin cebolla</strong></li></ul><div class="ticket-foot" style="margin-top:30px"><button class="kds-action ${isReady ? 'ready' : ''}">${action}</button><button class="kds-action ghost">Cancelar</button></div></article><article class="card"><h3>Contexto de operación</h3>${row('M4','Mesa 04','Pedido confirmado por servidor','<span class="tag success">ACK</span>')}${row('!','Alérgeno / nota','Revisar antes de iniciar','<span class="tag warning">Atención</span>')}${row('S','Estación','Cocina caliente asignada','<span class="tag neutral">Autorizada</span>')}<p style="margin-top:16px">El cambio de columna solo sucede al recibir ACK/version de la API.</p></article></div>`;
    } else if (isHistory) {
      content = `<article class="card"><div class="toolbar"><div class="field grow">Buscar ticket atendido</div><div class="field">Hoy</div></div>${row('✓','KOT-154631-1 · Mesa 02','Servido 10:18 · Cocina caliente','<span class="tag success">Atendido</span>')}${row('✓','KOT-154628-2 · Mesa 07','Servido 10:06 · Bebidas','<span class="tag success">Atendido</span>')}${row('!','KOT-154625-1 · Mesa 03','Cancelado con motivo auditado','<span class="tag neutral">Historial</span>')}</article>`;
    } else if (isOffline) {
      content = `<article class="card" style="background:#202d36;color:#fff;border-color:#3a4c59"><h3>Recuperación de estación</h3><p style="color:#c6d1d8">El tablero muestra la última sincronización, no acepta transiciones y solicitará un snapshot al reconectar.</p><div class="skeleton" style="margin-top:20px"><span></span><span></span><span></span></div><div class="action-row" style="margin-top:24px">${button('Reintentar conexión')}</div></article>`;
    } else {
      content = `<div class="kds-board"><section class="kds-column"><div class="kds-column-head">PENDIENTE <span class="kds-count">2</span></div>${kdsTicket('KOT-154647-2','Pendiente','04')}${kdsTicket('KOT-154648-1','Pendiente','09')}</section><section class="kds-column"><div class="kds-column-head">PREPARANDO <span class="kds-count">1</span></div>${kdsTicket('KOT-154640-3','Preparando','07')}</section><section class="kds-column"><div class="kds-column-head">LISTO <span class="kds-count">1</span></div>${kdsTicket('KOT-154638-1','Listo','02')}</section></div>`;
    }
    return `<section class="kds-frame">${header}${content}</section>`;
  }

  function posSummary(screen) {
    if (screen.id === 'POS-01') return `<aside class="pos-summary"><h3>Resumen de cuenta</h3><div class="state-panel" style="box-shadow:none;padding:18px"><div class="state-icon">▦</div><h3>Sin cuenta seleccionada</h3><p>Elige una mesa o cuenta para consultar su consumo.</p></div></aside>`;
    if (screen.id === 'POS-08') return `<aside class="pos-summary"><h3>Resumen de apertura</h3>${row('C','Caja principal','Sucursal Centro','')}<div class="summary-line"><span>Estado actual</span><span>Sin abrir</span></div><div class="summary-line"><span>Turno</span><span>Sin asignar</span></div><div class="summary-line"><span>Fondo capturado</span><span>$0.00</span></div><p style="font-size:12px;color:var(--muted)">No se muestra una cuenta durante la apertura.</p></aside>`;
    if (screen.id === 'POS-09') return `<aside class="pos-summary"><h3>Resumen del turno</h3>${row('C','Caja principal','Turno 09:00–18:00','')}<div class="summary-line"><span>Movimientos confirmados</span><span>38</span></div><div class="summary-line"><span>Efectivo esperado</span><span>${money('4,820.00')}</span></div><div class="summary-line"><span>Estado</span><span>Pendiente de cierre</span></div><p style="font-size:12px;color:var(--muted)">La caja permanece abierta hasta recibir ACK.</p></aside>`;
    if (screen.id === 'POS-10') return `<aside class="pos-summary"><h3>Operación seleccionada</h3>${row('!','Cobro M04-00048','Estado desconocido','')}<div class="summary-line"><span>Cuenta</span><span>Mesa 04</span></div><div class="summary-line"><span>Importe</span><span>${money('240.00')}</span></div><div class="summary-line"><span>Acción segura</span><span>Reconciliar</span></div></aside>`;
    return `<aside class="pos-summary"><h3>Resumen de consumo</h3>${row('M4','Mesa 04','Sesión activa','')}${row('×2','Tacos de setas',money('198.00'),'')}${row('×1','Agua mineral',money('42.00'),'')}<div class="summary-line"><span>Descuento</span><span>No aplicado</span></div><div class="summary-line"><span>Propina</span><span>Sin registrar</span></div><div class="summary-total"><span>Total</span><span>${money('240.00')}</span></div><p style="font-size:12px;color:var(--muted)">Montos informativos hasta confirmar en servidor.</p></aside>`;
  }
  function posRail() { return `<aside class="pos-rail"><span class="brand-mark">R</span><button class="rail-icon">⌂</button><button class="rail-icon active">▦</button><button class="rail-icon">⌁</button><button class="rail-icon">◌</button><div class="rail-spacer"></div><button class="rail-icon">⚙</button><button class="rail-icon">⏻</button></aside>`; }
  function posMain(screen) {
    const detail = screen.id === 'POS-02'; const payment = screen.id === 'POS-03'; const cash = screen.id === 'POS-04'; const tip = screen.id === 'POS-05'; const confirm = screen.id === 'POS-06'; const ticket = screen.id === 'POS-07'; const open = screen.id === 'POS-08'; const close = screen.id === 'POS-09'; const errors = screen.id === 'POS-10';
    if (open) return `<main class="pos-main"><h2>Apertura de caja</h2><p>El turno queda abierto solo después de ACK del servidor.</p><article class="card"><div class="field">Fondo inicial: $0.00</div><div class="field" style="margin-top:12px">Observación opcional</div><div class="action-row" style="margin-top:16px">${button('Solicitar apertura','primary')}${button('Cancelar')}</div></article></main>`;
    if (close) return `<main class="pos-main"><h2>Cierre y arqueo</h2><p>Las diferencias se muestran antes de solicitar el cierre.</p><div class="grid grid-2">${card('Efectivo esperado',money('4,820.00'),'','Movimientos confirmados')} ${card('Arqueo capturado',money('4,750.00'),'warning','Diferencia: -$70.00')}</div><article class="card" style="margin-top:16px"><p>La política de segunda autorización sigue pendiente; este wireframe no decide su aplicación.</p><div class="action-row" style="margin-top:12px">${button('Solicitar cierre','primary')}${button('Guardar borrador')}</div></article></main>`;
    if (errors) return `<main class="pos-main"><h2>Operaciones pendientes</h2><p>Un timeout nunca es confirmación o rechazo de un cobro.</p><article class="card">${row('!','Cobro M04-00048','Respuesta del servidor desconocida','<span class="tag warning">Reconciliar</span>')}${row('P','Ticket 00048','Impresora sin respuesta; pago no se revierte','<span class="tag danger">Error impresión</span>')}<div class="action-row" style="margin-top:16px">${button('Consultar estado')}${button('Ver contingencia')}</div></article></main>`;
    if (ticket) return `<main class="pos-main"><h2>Ticket</h2><p>Disponible únicamente tras confirmar el pago; un error de impresión no revierte el cobro.</p><article class="card" style="max-width:420px;text-align:center"><span class="tag success">Pago confirmado con ACK</span><h3 style="margin-top:14px">Ticket de consumo 00048</h3><p>Mesa 04 · efectivo · propina separada</p><div class="fake-chart" style="height:120px"></div><div class="action-row" style="margin-top:16px">${button('Solicitar impresión','primary')}${button('Volver a cuentas')}</div></article></main>`;
    if (confirm) return `<main class="pos-main"><h2>Confirmación de pago</h2><p>Vista de espera: no se emite recibo ni se libera la cuenta antes del ACK.</p><article class="card"><span class="tag warning">Pendiente de confirmación</span><h3 style="margin-top:14px">Cobro en efectivo · Mesa 04</h3><p>Se envió una sola intención con clave idempotente. Consulta estado antes de reintentar.</p><div class="skeleton" style="margin-top:18px"><span></span><span></span><span></span></div></article></main>`;
    if (tip) return `<main class="pos-main"><h2>Registro de propina</h2><p>La propina se registra separada de la venta y solo tras autorización.</p><article class="card"><div class="field">Propina voluntaria: $0.00</div><p style="margin-top:12px">No se aplica ni distribuye una regla sin política configurada.</p><div class="action-row" style="margin-top:16px">${button('Continuar a confirmación','primary')}${button('Omitir')}</div></article></main>`;
    if (cash) return `<main class="pos-main"><h2>Cobro en efectivo</h2><p>Captura el importe recibido; el cambio es informativo hasta el ACK.</p><article class="card"><div class="form-grid"><div class="field">Total: ${money('240.00')}</div><div class="field">Recibido: $300.00</div></div><div class="summary-total"><span>Cambio estimado</span><span>${money('60.00')}</span></div><div class="action-row" style="margin-top:16px">${button('Solicitar cobro','primary')}${button('Cancelar')}</div></article></main>`;
    if (payment) return `<main class="pos-main"><h2>Método de pago</h2><p>Solo efectivo forma parte del MVP. Las opciones posteriores se muestran inactivas.</p><div class="payment-grid"><article class="payment-tile active"><span class="icon">▣</span><strong>Efectivo</strong></article><article class="payment-tile"><span class="icon" style="color:#a3a9b3">▤</span><strong>Tarjeta</strong><small style="display:block;color:#5f6673">Posterior</small></article><article class="payment-tile"><span class="icon" style="color:#a3a9b3">◒</span><strong>Dividir cuenta</strong><small style="display:block;color:#5f6673">Posterior</small></article></div><button class="pos-primary">Continuar con efectivo</button></main>`;
    if (detail) return `<main class="pos-main"><h2>Detalle de consumo</h2><p>Mesa 04 · datos recibidos del servidor.</p><article class="card">${orderLines()}<div class="action-row" style="margin-top:16px">${button('Método de pago','primary')}${button('Volver')}</div></article></main>`;
    return `<main class="pos-main"><h2>Mesas y cuentas</h2><p>Selecciona una cuenta autorizada para consultar consumo o iniciar cobro.</p><div class="account-list">${['Mesa 04 · $240.00','Mesa 07 · $418.00','Mostrador · $125.00','Mesa 02 · $0.00'].map((value,index) => `<article class="account-item ${index === 0 ? 'active' : ''}"><span class="account-number">${index + 1}</span><div><strong>${value}</strong><small>${index === 3 ? 'Sin consumo activo' : 'Sesión abierta'}</small></div><span class="tag ${index === 3 ? 'neutral' : 'success'}">${index === 3 ? 'Vacía' : 'Activa'}</span></article>`).join('')}</div></main>`;
  }
  function renderPos(screen) { return `<section class="pos-frame">${posRail()}${posMain(screen)}${posSummary(screen)}</section>`; }

  function waiterContent(screen) {
    if (screen.id === 'WAI-01') return `<div class="tablet-content"><article class="tablet-card"><span class="screen-kicker">Acceso de empleado</span><h2>Inicia tu turno</h2><p>La sesión se valida en servidor antes de mostrar mesas asignadas.</p><div class="field">Usuario o PIN</div><div class="field" style="margin-top:12px">Sucursal: Centro</div><div class="tablet-footer">${button('Salir')}<button class="warm-action">Solicitar acceso</button></div></article></div>`;
    if (screen.id === 'WAI-02') return `<div class="tablet-content"><h2>Mesas asignadas</h2><p>Salón principal · 6 mesas bajo tu atención.</p><div class="table-map" style="margin-top:18px">${['01','02','03','04','05','06'].map((id,index) => `<article class="table-seat ${index === 1 || index === 3 ? 'occupied' : ''}"><strong>Mesa ${id}</strong><small>${index === 1 ? 'Solicita atención' : index === 3 ? 'Pedido listo' : 'Disponible'}</small></article>`).join('')}</div></div>`;
    if (screen.id === 'WAI-03') return `<div class="tablet-content"><h2>Mesa 04</h2><article class="tablet-card">${orderLines()}<div class="action-row" style="margin-top:14px">${button('Tomar pedido','primary')}${button('Registrar entrega')}</div></article></div>`;
    if (screen.id === 'WAI-04') return `<div class="tablet-content"><h2>Registrar pedido</h2><div class="field">Buscar producto</div><div style="margin-top:15px">${productGrid()}</div><div class="tablet-footer"><span>Carrito de mesa: 2</span><button class="warm-action">Revisar y enviar</button></div></div>`;
    if (screen.id === 'WAI-05') return `<div class="tablet-content"><h2>Seguimiento</h2><article class="tablet-card">${row('K','Pedido 000128','En preparación · cocina caliente','<span class="tag warning">7 min</span>')}${row('✓','Pedido 000129','Listo para entregar','<span class="tag success">Listo</span>')}<div class="action-row" style="margin-top:12px">${button('Consultar actualización')}</div></article></div>`;
    if (screen.id === 'WAI-06') return `<div class="tablet-content"><h2>Solicitudes de clientes</h2><article class="tablet-card">${row('M4','Mesa 04','Solicitud pendiente de ACK','<span class="tag warning">Pendiente</span>')}${row('M2','Mesa 02','Agua adicional solicitada','<span class="tag neutral">Nueva</span>')}<div class="action-row" style="margin-top:12px">${button('Atender solicitud','primary')}</div></article></div>`;
    return `<div class="tablet-content"><h2>Entrega de alimentos</h2><article class="tablet-card"><h3>Mesa 04 · Pedido 000129</h3><p>Confirma entrega solo cuando el servidor acepte la transición.</p>${row('×2','Tacos de setas','Listo en cocina','<span class="tag success">Listo</span>')}<div class="tablet-footer">${button('Volver')}<button class="warm-action">Solicitar registro de entrega</button></div></article></div>`;
  }
  function renderWaiter(screen) { return `<section class="device-stage"><div class="mobile-shell">${tabletHeader(screen, true)}${waiterContent(screen)}</div></section>`; }

  function stateLayer(screen) {
    const action = (label) => `<button type="button" class="action">${label}</button>`;
    const generic = {
      empty: ['○', 'Aún no hay información', 'No hay registros para los filtros actuales. Cambia el filtro o vuelve al destino anterior.', 'Cambiar filtro'],
      loading: ['⋯', 'Cargando información autorizada', 'Muestra de skeleton: la pantalla conserva contexto mientras espera el snapshot del servidor.', 'Cancelar carga'],
      error: ['!', 'No se pudo completar la consulta', 'No se modificó el estado. Reintenta o vuelve a la pantalla anterior.', 'Reintentar'],
      forbidden: ['⊘', 'Permiso insuficiente', 'Tu sesión no permite esta acción o recurso. El servidor también rechaza accesos directos.', 'Volver a destino permitido'],
      validation: ['!', 'Revisa los datos requeridos', 'La operación no se envía hasta corregir los campos señalados.', 'Corregir'],
      conflict: ['↻', 'El recurso cambió mientras lo revisabas', 'Muestra la versión actual del servidor antes de repetir o cancelar la acción.', 'Recargar versión'],
      cancelled: ['×', 'Acción cancelada', 'No se realizó ningún cambio. Los campos no enviados se conservan cuando es seguro hacerlo.', 'Continuar editando']
    };
    if (state === 'normal') return '';
    if (state === 'offline') return `<div class="state-layer"><article class="state-panel"><div class="state-icon">⌁</div><h3>Sin conexión al servidor</h3><p>Los datos subyacentes son el último snapshot visible. No se confirma ni cambia ninguna operación.</p><div class="action-row">${action('Reintentar conexión')}${action('Volver')}</div></article></div>`;
    if (state === 'pending') return `<div class="state-layer"><article class="state-panel"><div class="state-icon">⌛</div><h3>Operación pendiente de ACK</h3><p>La solicitud no se presenta como completada. Consulta el resultado antes de reintentar.</p><div class="action-row">${action('Consultar estado')}${action('Cancelar espera')}</div></article></div>`;
    if (state === 'confirmed') return `<div class="state-layer"><article class="state-panel"><div class="state-icon">✓</div><h3>Muestra de estado: ACK recibido</h3><p>Este resultado visual solo es válido después de una respuesta versionada del servidor; el visor no ejecutó una operación real.</p><div class="action-row">${action('Ver snapshot actualizado')}</div></article></div>`;
    const data = generic[state];
    return `<div class="state-layer"><article class="state-panel"><div class="state-icon">${data[0]}</div><h3>${data[1]}</h3><p>${data[2]}</p><div class="action-row">${action(data[3])}${action('Cancelar')}</div></article></div>`;
  }

  function renderCanvas(screen) {
    const renderers = { admin: renderAdmin, tablet: renderTablet, kds: renderKds, pos: renderPos, waiter: renderWaiter };
    const visual = renderers[config.kind](screen);
    return `<div class="screen-meta"><span class="screen-kicker">${esc(screen.id)} · ${esc(config.environment)}</span><h1>${esc(screen.title)}</h1><p>${esc(screen.description)}</p>${chips(screen)}</div>${stateSwitcher()}${orientationSwitcher()}<div class="stage">${visual}${stateLayer(screen)}</div>`;
  }

  function render() {
    const requested = decodeURIComponent(location.hash.replace('#', ''));
    const screen = config.screens.find((candidate) => candidate.id === requested) || config.screens[0];
    $('#wireframe-root').innerHTML = renderCanvas(screen);
    document.querySelectorAll('.screen-link[data-id]').forEach((link) => link.classList.toggle('active', link.dataset.id === screen.id));
    document.querySelectorAll('[data-state]').forEach((control) => control.addEventListener('click', () => { state = control.dataset.state; render(); }));
    document.querySelectorAll('[data-orientation]').forEach((control) => control.addEventListener('click', () => { orientation = control.dataset.orientation; render(); }));
    document.title = `${screen.id} · ${screen.title} · Restaurant OS`;
  }

  pageShell();
  window.addEventListener('hashchange', render);
  render();
}());
