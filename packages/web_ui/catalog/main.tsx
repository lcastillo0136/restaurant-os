import { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';
import '@restaurant-os/web-design-tokens/styles.css';
import '../src/styles.css';
import './styles.css';
import {
  AccountSummary, Alert, CompactRail, ConnectionStatus, DataTable, EmptyState, FormSection,
  HorizontalNavigation, KdsOrderCard, KitchenColumn, KpiCard, LoadingIndicator, Modal,
  PaymentOption, RestaurantButton, RestaurantCard, RestaurantIconButton, SelectField,
  TableCard, TextField, TipIndicator, type RestaurantTheme,
} from '../src';

const themes: RestaurantTheme[] = ['admin-light', 'customer-warm', 'kitchen-dark', 'pos-light'];
const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: '▦' }, { id: 'tables', label: 'Mesas', icon: '⌘' },
  { id: 'orders', label: 'Pedidos', icon: '▤' }, { id: 'menu', label: 'Menú', icon: '☷' },
];

function Catalog() {
  const [theme, setTheme] = useState<RestaurantTheme>('admin-light');
  const [nav, setNav] = useState('dashboard');
  const [modal, setModal] = useState(false);
  const [selectedTable, setSelectedTable] = useState('04');
  const [payment, setPayment] = useState('cash');

  return <div className="ros-scope catalog" data-theme={theme}>
    <header className="catalog-hero"><div><p>Restaurant OS · Fase 0.6</p><h1>Catálogo React</h1><span>Componentes visuales sin backend ni operaciones reales.</span></div><div className="theme-switch" aria-label="Temas">{themes.map((item) => <RestaurantButton key={item} variant={theme === item ? 'primary' : 'secondary'} aria-pressed={theme === item} onClick={() => setTheme(item)}>{item}</RestaurantButton>)}</div></header>

    <main>
      <CatalogSection title="Acciones y estados" description="Normal, hover/foco mediante interacción, presionado, deshabilitado y carga.">
        <div className="catalog-row"><RestaurantButton>Acción principal</RestaurantButton><RestaurantButton variant="secondary">Secundaria</RestaurantButton><RestaurantButton variant="danger">Acción crítica</RestaurantButton><RestaurantButton loading>Procesando</RestaurantButton><RestaurantButton disabled>Deshabilitada</RestaurantButton><RestaurantIconButton label="Notificaciones" icon="♢" selected /></div>
      </CatalogSection>

      <CatalogSection title="Formularios" description="Etiquetas, ayuda, validación y controles de 48 px.">
        <div className="catalog-grid catalog-grid--2"><FormSection title="Producto de demostración" description="No guarda información."><TextField label="Nombre" defaultValue="Tacos de setas" hint="Nombre visible en el menú" /><SelectField label="Categoría" defaultValue="main" options={[{ value: 'main', label: 'Platos' }, { value: 'drink', label: 'Bebidas' }]} /><TextField label="Precio informativo" defaultValue="$99.00" error="Ejemplo de validación visual" /></FormSection><RestaurantCard elevated><h3>Estados de formulario</h3><TextField label="Campo deshabilitado" value="Solo lectura" disabled readOnly /><TextField label="Campo requerido" placeholder="Captura obligatoria" required /></RestaurantCard></div>
      </CatalogSection>

      <CatalogSection title="Navegación y estructura" description="Navbar superior administrativa y rail compacto POS.">
        <HorizontalNavigation items={navItems} activeId={nav} onChange={setNav} label="Administración" />
        <div className="catalog-rail-demo"><CompactRail items={navItems} activeId={nav} onChange={setNav} label="Caja POS" /><RestaurantCard><h3>Destino activo</h3><p>{nav}</p></RestaurantCard></div>
      </CatalogSection>

      <CatalogSection title="Tarjetas, KPI y tablas" description="Superficies compartidas para administración, salón y reportes.">
        <div className="catalog-grid catalog-grid--4"><KpiCard label="Ventas confirmadas" value="$12,480" detail="MXN · demostración" trend="+8.4%" tone="success" /><KpiCard label="Mesas activas" value="8 / 16" detail="Salón principal" /><KpiCard label="Pedidos abiertos" value="12" trend="En curso" tone="warning" /><KpiCard label="Tiempo promedio" value="18 min" trend="−2 min" tone="success" /></div>
        <DataTable caption="Pedidos de demostración" columns={[{ key: 'order', label: 'Pedido' }, { key: 'table', label: 'Mesa' }, { key: 'state', label: 'Estado' }, { key: 'amount', label: 'Importe', numeric: true }]} rows={[{ id: '1', order: 'KOT-1284', table: '04', state: 'Pendiente', amount: '$240.00' }, { id: '2', order: 'KOT-1279', table: '07', state: 'Preparando', amount: '$183.00' }]} />
      </CatalogSection>

      <CatalogSection title="Mensajes y conectividad" description="Los estados no dependen exclusivamente del color.">
        <div className="catalog-stack"><Alert title="Operación pendiente" tone="warning">Todavía no existe confirmación del servidor.</Alert><Alert title="Confirmación de demostración" tone="success">ACK simulado recibido para validar el estado visual.</Alert><Alert title="Error de validación" tone="danger">Revisa los campos marcados antes de continuar.</Alert><div className="catalog-row"><ConnectionStatus state="online" detail="LAN" /><ConnectionStatus state="reconnecting" /><ConnectionStatus state="offline" detail="Mutaciones bloqueadas" /><LoadingIndicator inline label="Recuperando snapshot" /></div><EmptyState title="Sin pedidos" description="La estación no tiene tickets asignados." action={<RestaurantButton variant="secondary">Actualizar</RestaurantButton>} /></div>
      </CatalogSection>

      <CatalogSection title="Cocina KDS" description="Columnas oscuras, lectura a distancia y ACK explícito.">
        <div className="catalog-kds" data-theme="kitchen-dark"><KitchenColumn title="Pendiente" count={1} tone="accent"><KdsOrderCard ticket="KOT-1284" table="Mesa 04" elapsed="4 min" items={[{ id: '1', quantity: 2, name: 'Tacos de setas' }, { id: '2', quantity: 1, name: 'Agua mineral' }]} note="Alergia: nuez" status="pending" /></KitchenColumn><KitchenColumn title="Preparando" count={1} tone="warning"><KdsOrderCard ticket="KOT-1279" table="Mesa 07" elapsed="13 min" items={[{ id: '1', quantity: 2, name: 'Platos de temporada' }]} status="preparing" pendingAck /></KitchenColumn></div>
      </CatalogSection>

      <CatalogSection title="Mesas, pagos y cuenta" description="Selección visual sin cálculos financieros ni cobros reales.">
        <div className="catalog-grid catalog-grid--3">{['02', '04', '06'].map((number) => <TableCard key={number} number={number} status={number === '04' ? 'Pedido listo' : 'Disponible'} detail={number === '04' ? 'Listo para entregar' : 'Sin sesión'} tone={number === '04' ? 'success' : 'neutral'} selected={selectedTable === number} onSelect={() => setSelectedTable(number)} />)}</div>
        <div className="catalog-grid catalog-grid--3"><PaymentOption title="Efectivo" description="Disponible en el MVP" selected={payment === 'cash'} badge="Disponible" onSelect={() => setPayment('cash')} icon="▣" /><PaymentOption title="Tarjeta" description="Requiere proveedor confirmado" disabled badge="Posterior al MVP" icon="▤" /><PaymentOption title="Dividir cuenta" description="Reglas pendientes de aprobación" disabled badge="Posterior al MVP" icon="⌘" /></div>
        <div className="catalog-grid catalog-grid--2"><AccountSummary table="Mesa 04" updatedAt="10:42" lines={[{ id: '1', quantity: 2, label: 'Tacos de setas', detail: '$99.00 c/u', amount: '$198.00' }, { id: '2', quantity: 1, label: 'Agua mineral', amount: '$42.00' }]} subtotal="$240.00" tip="Sin registrar" total="$240.00 MXN" /><div className="catalog-stack"><TipIndicator state="unregistered" /><TipIndicator state="pending" value="$24.00" /><TipIndicator state="confirmed" value="$24.00" /><RestaurantButton onClick={() => setModal(true)}>Abrir modal de confirmación</RestaurantButton></div></div>
      </CatalogSection>
    </main>
    <Modal open={modal} title="Confirmar acción de demostración" onClose={() => setModal(false)} onConfirm={() => setModal(false)}><p>Este modal no ejecuta una operación real ni representa un ACK de servidor.</p></Modal>
  </div>;
}

function CatalogSection({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return <section className="catalog-section"><header><p>Componente reutilizable</p><h2>{title}</h2><span>{description}</span></header><div className="catalog-section__body">{children}</div></section>;
}

createRoot(document.getElementById('root')!).render(<StrictMode><Catalog /></StrictMode>);
