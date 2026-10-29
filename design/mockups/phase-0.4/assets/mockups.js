/* Restaurant OS · Mockups de alta fidelidad · Fase 0.4, primera entrega.
 * Visor estático sin API, persistencia, navegación productiva ni operaciones de negocio.
 */
(function () {
  'use strict';

  const config = window.MOCKUP_CONFIG;
  if (!config) return;

  const query = new URLSearchParams(window.location.search);
  let orientation = query.get('orientation') === 'landscape' ? 'landscape' : 'portrait';
  const captureMode = query.get('capture') === '1';

  const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[character]));

  const icons = {
    home: '<path d="M3 11.5 12 4l9 7.5"/><path d="M5.5 10v10h13V10M9 20v-6h6v6"/>',
    grid: '<rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/>',
    tables: '<circle cx="7" cy="7" r="3"/><circle cx="17" cy="7" r="3"/><circle cx="7" cy="17" r="3"/><circle cx="17" cy="17" r="3"/><path d="M9.5 9.5l5 5m0-5-5 5"/>',
    orders: '<path d="M6 3h12v18H6z"/><path d="M9 8h6M9 12h6M9 16h4"/>',
    menu: '<path d="M4 5h16M4 12h16M4 19h16"/><circle cx="7" cy="5" r="1"/><circle cx="17" cy="12" r="1"/><circle cx="10" cy="19" r="1"/>',
    people: '<circle cx="9" cy="8" r="3"/><path d="M3.5 20c.8-4 2.6-6 5.5-6s4.7 2 5.5 6"/><circle cx="17" cy="9" r="2.5"/><path d="M15.5 15c3.4-.5 5 1.2 5.5 5"/>',
    reports: '<path d="M4 20V9m6 11V4m6 16v-7m4 7H2"/>',
    settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-4V21a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H2.8v-4H3a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1a1.7 1.7 0 0 0 1.9.3A1.7 1.7 0 0 0 10 3v-.2h4V3a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v4H21a1.7 1.7 0 0 0-1.6 1Z"/>',
    bell: '<path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
    calendar: '<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M8 3v4m8-4v4M3 10h18"/>',
    map: '<path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3Z"/><path d="M9 3v15m6-12v15"/>',
    arrow: '<path d="M5 12h14m-6-6 6 6-6 6"/>',
    language: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c1-5 3.7-7 8-7s7 2 8 7"/>',
    qr: '<path d="M3 3h7v7H3zm11 0h7v7h-7zM3 14h7v7H3zM14 14h3v3h-3zm4 0h3m0 3v4h-4m-3-1h2"/>',
    cart: '<path d="M3 4h2l2.2 10.5a2 2 0 0 0 2 1.5h7.8a2 2 0 0 0 2-1.6L20.5 8H6"/><circle cx="10" cy="20" r="1.5"/><circle cx="17" cy="20" r="1.5"/>',
    chevron: '<path d="m9 18 6-6-6-6"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    wifi: '<path d="M4 9a12 12 0 0 1 16 0M7 13a8 8 0 0 1 10 0m-7 4a3 3 0 0 1 4 0M12 20h.01"/>',
    volume: '<path d="M11 5 6 9H3v6h3l5 4Zm4 4a4 4 0 0 1 0 6m2-9a8 8 0 0 1 0 12"/>',
    history: '<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5m4-1v5l3 2"/>',
    flame: '<path d="M13 2s1 4-2 7c-2-2-1-4-1-4s-5 4-5 9a7 7 0 0 0 14 0c0-4-2-7-6-12Z"/><path d="M9 18c0-2 1-3 3-5 0 2 3 3 3 5a3 3 0 0 1-6 0Z"/>',
    cash: '<rect x="3" y="6" width="18" height="12" rx="2"/><circle cx="12" cy="12" r="3"/><path d="M7 9H5v2m12 4h2v-2"/>',
    card: '<rect x="2" y="5" width="20" height="14" rx="3"/><path d="M2 10h20M6 15h4"/>',
    split: '<circle cx="8" cy="8" r="4"/><circle cx="16" cy="16" r="4"/><path d="m10.5 10.5 3 3"/>',
    receipt: '<path d="M6 3h12v19l-3-2-3 2-3-2-3 2Z"/><path d="M9 8h6M9 12h6M9 16h4"/>',
    logout: '<path d="M10 4H5v16h5m5-4 4-4-4-4m4 4H9"/>',
    filter: '<path d="M4 5h16M7 12h10m-7 7h4"/>',
    utensils: '<path d="M7 3v7m-3-7v5a3 3 0 0 0 6 0V3M7 11v10m10-18c-3 2-3 7 0 9v9m0-18v9"/>',
    check: '<path d="m5 12 4 4L19 6"/>',
    alert: '<path d="M12 3 2.5 20h19Z"/><path d="M12 9v5m0 3h.01"/>'
  };

  function icon(name, className = '') {
    return `<svg class="icon ${className}" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${icons[name] || icons.grid}</svg>`;
  }

  function brand(compact = false) {
    return `<span class="product-brand"><span class="brand-glyph">R</span>${compact ? '' : '<span>Restaurant OS<small>Operación local</small></span>'}</span>`;
  }

  function dishArt(kind, label) {
    const palettes = {
      bowl: ['#F3C47B', '#A6532A', '#5A733D', '#FFF3DA'],
      tacos: ['#E8B56B', '#A6532A', '#4E6A3D', '#F8D89A'],
      salad: ['#B7C86A', '#527148', '#E8C95B', '#F6E6C9'],
      drink: ['#D8A15F', '#6F3E2A', '#F1D9BE', '#A6532A'],
      cake: ['#6B3D2E', '#A6532A', '#E7B878', '#FFF2DC']
    };
    const p = palettes[kind] || palettes.bowl;
    return `<figure class="dish-art dish-${kind}" aria-label="Ilustración local de demostración: ${escapeHtml(label)}">
      <svg viewBox="0 0 320 220" role="img" aria-hidden="true">
        <defs><radialGradient id="g-${kind}" cx="45%" cy="38%"><stop offset="0" stop-color="${p[3]}"/><stop offset=".52" stop-color="${p[0]}"/><stop offset="1" stop-color="${p[1]}"/></radialGradient><filter id="s-${kind}"><feDropShadow dx="0" dy="9" stdDeviation="8" flood-opacity=".18"/></filter></defs>
        <rect width="320" height="220" rx="26" fill="${p[3]}" opacity=".42"/>
        <ellipse cx="160" cy="176" rx="100" ry="18" fill="#342C28" opacity=".13"/>
        <circle cx="160" cy="108" r="82" fill="#fff" filter="url(#s-${kind})"/>
        <circle cx="160" cy="108" r="70" fill="url(#g-${kind})"/>
        <path d="M97 102c24-38 104-47 127 5-20-12-38-8-56 8-22 20-49 13-71-13Z" fill="${p[2]}" opacity=".9"/>
        <circle cx="130" cy="88" r="12" fill="${p[1]}"/><circle cx="190" cy="120" r="10" fill="${p[3]}"/><circle cx="161" cy="73" r="8" fill="${p[2]}"/><path d="M111 134c25 19 73 23 99-2" stroke="${p[3]}" stroke-width="9" stroke-linecap="round" opacity=".8"/>
      </svg><figcaption>Ilustración demo</figcaption></figure>`;
  }

  function metadata(screen) {
    const fields = [
      ['ID', screen.id], ['Pantalla', screen.title], ['Rol', screen.role], ['Plataforma', screen.platform],
      ['Resolución', screen.resolution], ['Tokens', screen.tokens], ['Wireframe', screen.wireframe],
      ['Referencia', screen.reference], ['Estado', screen.status]
    ];
    return `<section class="spec-panel" aria-label="Especificación del mockup"><div class="spec-panel__headline"><div><p class="eyebrow">${escapeHtml(screen.id)} · ${escapeHtml(config.environment)}</p><h1>${escapeHtml(screen.title)}</h1></div><span class="approval-pill">${escapeHtml(screen.status)}</span></div><dl>${fields.map(([name, value]) => `<div><dt>${name}</dt><dd>${escapeHtml(value)}</dd></div>`).join('')}</dl><p class="static-note">Datos ficticios identificados · Mockup estático · Ninguna acción ejecuta lógica de negocio.</p></section>`;
  }

  function reviewShell() {
    document.body.className = `mockup-review ${config.theme}${captureMode ? ' capture-mode' : ''}`;
    document.body.innerHTML = `<header class="review-bar"><a class="review-back" href="../index.html">${icon('arrow')} Índice Fase 0.4</a>${brand()}<nav aria-label="Mockups de ${escapeHtml(config.environment)}">${config.screens.map((screen) => `<a href="#${screen.id}" data-screen-link="${screen.id}"><code>${screen.id}</code> ${escapeHtml(screen.title)}</a>`).join('')}</nav><span class="review-badge">Alta fidelidad · sin lógica</span></header><main id="review-root"></main>`;
  }

  function currentScreen() {
    const requested = query.get('screen') || window.location.hash.slice(1);
    return config.screens.find((screen) => screen.id === requested) || config.screens[0];
  }

  function navButton(name, label, active = false) {
    return `<span class="admin-nav-item${active ? ' active' : ''}">${icon(name)}<span>${label}</span></span>`;
  }

  function lineChart() {
    return `<svg class="line-chart" viewBox="0 0 760 230" role="img" aria-label="Gráfica de demostración de actividad por hora"><g class="chart-grid"><path d="M20 30H740M20 85H740M20 140H740M20 195H740"/></g><path class="chart-area" d="M20 172C85 165 95 116 160 132s83-36 148-17 75-51 143-36 80 70 142 37 79-64 147-58v137H20Z"/><path class="chart-line" d="M20 172C85 165 95 116 160 132s83-36 148-17 75-51 143-36 80 70 142 37 79-64 147-58"/><g class="chart-dots"><circle cx="20" cy="172" r="5"/><circle cx="160" cy="132" r="5"/><circle cx="308" cy="115" r="5"/><circle cx="451" cy="79" r="6"/><circle cx="593" cy="116" r="5"/><circle cx="740" cy="58" r="5"/></g></svg>`;
  }

  function adminDashboard() {
    const kpis = [
      ['Ventas confirmadas', '$12,480', 'MXN · muestra', '+8.4%', 'success'],
      ['Mesas activas', '8 / 16', 'Salón principal', '50%', 'neutral'],
      ['Pedidos abiertos', '12', '4 en preparación', 'En curso', 'warning'],
      ['Tiempo promedio', '18 min', 'Últimas 2 horas', '−2 min', 'success']
    ];
    return `<section class="product-canvas admin-app" data-mockup-id="ADM-02">
      <header class="admin-topbar">${brand()}<nav>${navButton('grid','Dashboard',true)}${navButton('tables','Mesas')}${navButton('orders','Pedidos')}${navButton('menu','Menú')}${navButton('people','Personal')}${navButton('reports','Reportes')}</nav><div class="admin-account"><span class="live-dot">LAN</span><span class="icon-button">${icon('bell')}</span><span class="account-avatar">AM</span><span><strong>Andrea M.</strong><small>Gerente · demo</small></span></div></header>
      <div class="admin-content">
        <div class="admin-heading"><div><p class="eyebrow">Sucursal Centro · miércoles 29 de octubre</p><h2>Resumen operativo</h2><p>Una lectura clara del servicio, basada en datos ficticios para validar jerarquía visual.</p></div><div class="heading-actions"><button class="ui-button secondary">${icon('map')} Sucursal Centro</button><button class="ui-button secondary">${icon('calendar')} Hoy</button></div></div>
        <div class="admin-kpis">${kpis.map(([label, value, sub, change, tone]) => `<article class="admin-kpi"><div class="kpi-top"><span>${label}</span><i class="trend ${tone}">${change}</i></div><strong>${value}</strong><small>${sub}</small></article>`).join('')}</div>
        <div class="admin-grid">
          <article class="dashboard-card activity-card"><div class="card-heading"><div><p class="eyebrow">Actividad del día</p><h3>Pedidos por hora</h3></div><span class="legend"><i></i> Confirmados por servidor</span></div>${lineChart()}<div class="chart-labels"><span>08:00</span><span>10:00</span><span>12:00</span><span>14:00</span><span>16:00</span><span>18:00</span></div></article>
          <article class="dashboard-card status-card"><div class="card-heading"><div><p class="eyebrow">Flujo actual</p><h3>Estado de pedidos</h3></div><span class="icon-button">${icon('arrow')}</span></div><div class="status-total"><strong>34</strong><span>pedidos del turno</span></div><div class="status-bar"><i class="received"></i><i class="preparing"></i><i class="ready"></i></div><div class="status-legend"><span><i class="received"></i><b>18</b> Recibidos</span><span><i class="preparing"></i><b>12</b> Preparando</span><span><i class="ready"></i><b>4</b> Listos</span></div></article>
          <article class="dashboard-card occupancy-card"><div class="card-heading"><div><p class="eyebrow">Salón</p><h3>Ocupación por área</h3></div><span class="caption">Datos demo</span></div><div class="occupancy-row"><span>Salón principal</span><div><i style="width:72%"></i></div><b>72%</b></div><div class="occupancy-row"><span>Terraza</span><div><i style="width:46%"></i></div><b>46%</b></div><div class="occupancy-row"><span>Barra</span><div><i style="width:28%"></i></div><b>28%</b></div></article>
          <article class="dashboard-card alerts-card"><div class="card-heading"><div><p class="eyebrow">Atención requerida</p><h3>Alertas de operación</h3></div><span class="alert-count">3</span></div><div class="alert-row"><span class="alert-icon warning">${icon('bell')}</span><div><strong>Mesa 04 solicita atención</strong><small>Solicitud pendiente de ACK · 1 min</small></div><span class="status-chip warning">Pendiente</span></div><div class="alert-row"><span class="alert-icon accent">${icon('flame')}</span><div><strong>2 tickets en preparación</strong><small>Cocina principal · 7 min</small></div><span class="status-chip neutral">Ver KDS</span></div></article>
        </div>
      </div>
    </section>`;
  }

  function tabletTop(sessionText) {
    return `<header class="tablet-top"><div>${brand()}<span class="table-badge">Mesa 04</span></div><span class="session-label">${sessionText}</span></header>`;
  }

  function tabletWelcome() {
    return `<section class="product-canvas tablet-preview" data-mockup-id="TAB-01"><div class="tablet-device ${orientation}"><div class="tablet-screen">${tabletTop('Sin sesión pública iniciada')}<main class="tablet-welcome"><div class="welcome-copy"><span class="soft-label">Bienvenido a tu mesa</span><h2>Qué gusto<br>tenerte aquí.</h2><p>Explora el menú a tu ritmo. Primero elige cómo quieres comenzar.</p><div class="language-row"><span class="language-icon">${icon('language')}</span><div><strong>Español (México)</strong><small>Idioma de la experiencia</small></div><button class="text-button">Cambiar</button></div><button class="warm-primary">${icon('user')} Continuar como invitado ${icon('arrow')}</button><p class="ack-copy">La sesión se activará únicamente después de recibir confirmación del servidor.</p></div><div class="welcome-visual">${dishArt('bowl','Plato de temporada')}<div class="visual-note"><span>Selección de temporada</span><strong>Ilustración local de demostración</strong></div></div></main><footer class="tablet-welcome-footer"><div><span class="nfc-icon">${icon('qr')}</span><span><strong>NFC / QR</strong><small>Identificación futura · no disponible</small></span></div><span class="disabled-pill">Próximamente</span></footer></div></div></section>`;
  }

  function category(iconName, label, active = false) {
    return `<span class="food-category${active ? ' active' : ''}"><span>${icon(iconName)}</span>${label}</span>`;
  }

  function productCard(kind, title, description, price) {
    return `<article class="food-card">${dishArt(kind,title)}<div class="food-card-copy"><span class="demo-tag">Imagen demo</span><h3>${title}</h3><p>${description}</p><div><strong>${price}</strong><button aria-label="Agregar ${title} a un carrito local de muestra">＋</button></div></div></article>`;
  }

  function tabletMenu() {
    return `<section class="product-canvas tablet-preview" data-mockup-id="TAB-03"><div class="tablet-device ${orientation}"><div class="tablet-screen menu-screen">${tabletTop('Invitado confirmado · sesión activa')}<main class="tablet-menu"><div class="menu-intro"><div><span class="soft-label">Menú de hoy</span><h2>Elige algo delicioso</h2><p>Disponibilidad según el último dato recibido.</p></div><button class="cart-button">${icon('cart')}<span>2</span></button></div><label class="menu-search">${icon('search')}<span>Buscar platillos o bebidas</span><kbd>⌕</kbd></label><div class="food-categories">${category('grid','Populares',true)}${category('utensils','Entradas')}${category('flame','Platos')}${category('menu','Bebidas')}${category('check','Postres')}</div><div class="menu-section-title"><div><p class="eyebrow">Sugerencias del día</p><h3>Productos populares</h3></div><span>Datos ficticios</span></div><div class="food-grid">${productCard('tacos','Tacos de setas','Tortilla de maíz · salsa de la casa','$99.00 MXN')}${productCard('salad','Ensalada verde','Vegetales frescos · vinagreta cítrica','$125.00 MXN')}${productCard('drink','Agua de cacao','Cacao ligero · especias','$58.00 MXN')}${productCard('cake','Pastel de cacao','Cacao oscuro · crema suave','$85.00 MXN')}</div></main><footer class="tablet-cart-bar"><div><span>Carrito local</span><strong>2 artículos · $240.00 MXN</strong></div><button>Ver carrito ${icon('arrow')}</button></footer></div></div></section>`;
  }

  function ticket(id, table, minutes, items, status, note = '') {
    const labels = { pending: 'Pendiente', preparing: 'Preparando', ready: 'Listo' };
    const action = status === 'pending' ? 'Solicitar inicio' : status === 'preparing' ? 'Solicitar listo' : 'Ver entrega';
    return `<article class="kds-ticket ${status}"><header><div><span class="ticket-table">${table}</span><h4>${id}</h4></div><span class="timer ${minutes >= 12 ? 'urgent' : ''}">${icon('clock')} ${minutes} min</span></header><ul>${items.map((item) => `<li>${item}</li>`).join('')}</ul>${note ? `<p class="kitchen-note">${icon('alert')} ${note}</p>` : ''}<footer><span class="ticket-status ${status}"><i></i>${labels[status]}</span><button>${action}</button></footer></article>`;
  }

  function kdsBoard() {
    return `<section class="product-canvas kds-app" data-mockup-id="KDS-01"><header class="kds-toolbar">${brand()}<button class="station-select">${icon('home')} Cocina principal⌄</button><div class="view-tabs"><span class="active">Tablero</span><span>Lista</span></div><div class="kds-toolbar-right"><span>${icon('wifi')} Sincronizado 10:42</span><button>${icon('volume')} Sonido</button><button>${icon('history')} Historial</button><strong>11:24</strong></div></header><div class="kds-context"><div><p class="eyebrow">Turno mañana · datos ficticios</p><h2>Servicio en curso</h2></div><span class="ack-banner">${icon('check')} Las transiciones cambian de columna solo después del ACK</span></div><main class="kds-columns"><section class="kds-column pending"><header><div><span class="column-indicator"></span><h3>Pendiente</h3></div><b>3</b></header>${ticket('KOT-1284','Mesa 04',4,['2 × Tacos de setas','1 × Agua mineral'],'pending','Alergia: nuez')}${ticket('KOT-1287','Mesa 09',7,['1 × Ensalada verde','1 × Agua de cacao'],'pending')}</section><section class="kds-column preparing"><header><div><span class="column-indicator"></span><h3>Preparando</h3></div><b>2</b></header>${ticket('KOT-1279','Mesa 07',13,['2 × Tacos de setas','1 × Pastel de cacao'],'preparing','Sin cebolla')}${ticket('KOT-1281','Mesa 02',9,['1 × Ensalada verde','2 × Agua mineral'],'preparing')}</section><section class="kds-column ready"><header><div><span class="column-indicator"></span><h3>Listo</h3></div><b>1</b></header>${ticket('KOT-1276','Mesa 06',3,['2 × Platos de temporada','1 × Agua mineral'],'ready')}</section></main></section>`;
  }

  function posRailIcon(name, label, active = false) {
    return `<span class="pos-rail-icon${active ? ' active' : ''}" aria-label="${label}">${icon(name)}<small>${label}</small></span>`;
  }

  function paymentOption(name, title, description, mode) {
    return `<article class="payment-option ${mode}"><span class="payment-check">${mode === 'active' ? icon('check') : ''}</span><span class="payment-icon">${icon(name)}</span><h3>${title}</h3><p>${description}</p>${mode === 'disabled' ? '<span class="later-pill">Posterior al MVP</span>' : '<span class="available-pill">Disponible</span>'}</article>`;
  }

  function posPayment() {
    return `<section class="product-canvas pos-app" data-mockup-id="POS-03"><aside class="pos-rail">${brand(true)}${posRailIcon('home','Inicio')}${posRailIcon('grid','Cuentas')}${posRailIcon('receipt','Cobro',true)}${posRailIcon('history','Pendientes')}<span class="pos-rail-spacer"></span>${posRailIcon('settings','Ajustes')}${posRailIcon('logout','Salir')}</aside><main class="pos-payment"><header class="pos-titlebar"><div><span class="back-link">‹ Volver a consumo</span><p class="eyebrow">Mesa 04 · cuenta activa</p><h2>Selecciona el método de pago</h2><p>Solo efectivo forma parte del MVP. Elegir una opción no registra ningún cobro.</p></div><span class="cashier-chip"><span>SC</span><b>Sofía C.</b><small>Caja principal · demo</small></span></header><div class="payment-options">${paymentOption('cash','Efectivo','Captura el importe recibido y calcula cambio.','active')}${paymentOption('card','Tarjeta','Requiere proveedor confirmado.','disabled')}${paymentOption('split','Dividir cuenta','Reglas aún pendientes de aprobación.','disabled')}</div><aside class="payment-info">${icon('alert')}<div><strong>Sin movimiento contable todavía</strong><span>El pago solo existirá después de capturar efectivo y recibir ACK del servidor.</span></div></aside><button class="pos-continue">Continuar con efectivo ${icon('arrow')}</button></main><aside class="order-summary"><header><div><p class="eyebrow">Resumen persistente</p><h2>Consumo actual</h2></div><span class="summary-table">M04</span></header><div class="summary-session"><span>Sesión activa</span><strong>Mesa 04 · 3 artículos</strong><small>Última actualización 10:42</small></div><div class="summary-items"><div><span class="summary-qty">2×</span><span><strong>Tacos de setas</strong><small>$99.00 c/u</small></span><b>$198.00</b></div><div><span class="summary-qty">1×</span><span><strong>Agua mineral</strong><small>$42.00</small></span><b>$42.00</b></div></div><div class="summary-breakdown"><p><span>Subtotal</span><b>$240.00</b></p><p><span>Descuento</span><b>No aplicado</b></p><p><span>Propina</span><b>Sin registrar</b></p></div><footer><span>Total informativo</span><strong>$240.00 <small>MXN</small></strong><p>Datos ficticios; el importe final se confirma en servidor.</p></footer></aside></section>`;
  }

  function waiterTable(number, status, detail, tone, badge = '') {
    return `<article class="waiter-table ${tone}"><header><span class="table-number">${number}</span>${badge ? `<span class="table-alert">${badge}</span>` : ''}</header><h3>Mesa ${number}</h3><p>${status}</p><footer><span>${detail}</span>${icon('chevron')}</footer></article>`;
  }

  function waiterTables() {
    return `<section class="product-canvas waiter-preview" data-mockup-id="WAI-02"><div class="phone-device"><div class="phone-screen"><div class="phone-status"><span>10:42</span><span>${icon('wifi')} 86%</span></div><header class="waiter-header">${brand()}<button class="waiter-bell">${icon('bell')}<i>2</i></button></header><main class="waiter-main"><div class="waiter-greeting"><div><p class="eyebrow">Turno mañana · Salón principal</p><h2>Hola, Jorge</h2><p>Estas son las mesas bajo tu atención.</p></div><span class="waiter-avatar">JC</span></div><div class="waiter-summary"><div><strong>6</strong><span>Asignadas</span></div><div><strong>2</strong><span>Con actividad</span></div><div><strong>1</strong><span>Solicitud</span></div></div><div class="waiter-toolbar"><div class="waiter-tabs"><span class="active">Todas</span><span>Atención</span><span>Listos</span></div><button>${icon('filter')}</button></div><div class="waiter-section-heading"><h3>Mesas asignadas</h3><span>Datos demo</span></div><div class="waiter-tables">${waiterTable('01','Disponible','Sin sesión','available')}${waiterTable('02','Solicita atención','Hace 1 min','attention','1')}${waiterTable('03','Pedido en cocina','2 tickets','active')}${waiterTable('04','Pedido listo','Listo para entregar','ready','!')}${waiterTable('05','Disponible','Sin sesión','available')}${waiterTable('06','Consumo activo','$240.00 informativo','active')}</div></main><nav class="waiter-bottom"><span class="active">${icon('tables')}<small>Mesas</small></span><span>${icon('orders')}<small>Pedidos</small></span><span>${icon('bell')}<small>Solicitudes</small></span><span>${icon('user')}<small>Perfil</small></span></nav></div></div></section>`;
  }

  function renderProduct(screen) {
    if (screen.id === 'ADM-02') return adminDashboard();
    if (screen.id === 'TAB-01') return tabletWelcome();
    if (screen.id === 'TAB-03') return tabletMenu();
    if (screen.id === 'KDS-01') return kdsBoard();
    if (screen.id === 'POS-03') return posPayment();
    if (screen.id === 'WAI-02') return waiterTables();
    return '<p>Mockup no encontrado.</p>';
  }

  function orientationControl() {
    if (config.kind !== 'tablet' || captureMode) return '';
    return `<div class="orientation-control" aria-label="Orientación de la especificación"><span>Vista de tableta</span><button class="${orientation === 'portrait' ? 'active' : ''}" data-orientation="portrait">Vertical · principal</button><button class="${orientation === 'landscape' ? 'active' : ''}" data-orientation="landscape">Horizontal · adaptable</button></div>`;
  }

  function render() {
    const screen = currentScreen();
    document.title = `${screen.id} · ${screen.title} · Mockup Fase 0.4`;
    document.querySelectorAll('[data-screen-link]').forEach((link) => link.classList.toggle('active', link.dataset.screenLink === screen.id));
    document.getElementById('review-root').innerHTML = `${metadata(screen)}${orientationControl()}<section class="mockup-stage">${renderProduct(screen)}</section>`;
    document.querySelectorAll('[data-orientation]').forEach((button) => button.addEventListener('click', () => {
      orientation = button.dataset.orientation;
      render();
    }));
  }

  reviewShell();
  window.addEventListener('hashchange', render);
  render();
})();
