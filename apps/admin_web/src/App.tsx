import {
  Bell,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  LayoutDashboard,
  Palette,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

const navigation = ['Resumen', 'Mesas', 'Menú', 'Personal', 'Ajustes'];

const foundations = [
  ['Tipografía', 'Inter · escala legible', Sparkles],
  ['Espaciado', 'Base 4 · ritmo amplio', LayoutDashboard],
  ['Estados', 'Texto + icono + color', CheckCircle2],
  ['Accesibilidad', 'Foco y contraste visibles', ShieldCheck],
] as const;

export function App() {
  return (
    <main className="admin-shell" data-theme="admin-light">
      <header className="admin-nav">
        <div className="brand" aria-label="Restaurant OS">
          <span className="brand-mark" aria-hidden="true" />
          Restaurant OS
        </div>
        <nav className="top-navigation" aria-label="Navegación de muestra">
          {navigation.map((item, index) => (
            <button
              aria-current={index === 0 ? 'page' : undefined}
              className={index === 0 ? 'nav-item nav-item-active' : 'nav-item'}
              key={item}
              type="button"
            >
              {item}
            </button>
          ))}
        </nav>
        <span className="phase-chip">Fase 0.1 · familia aprobada</span>
      </header>

      <section className="hero" aria-labelledby="foundation-title">
        <p className="eyebrow">Administración web · vista estática</p>
        <h1 id="foundation-title">Un sistema claro para decisiones cotidianas.</h1>
        <p>
          Muestra el lenguaje de tarjetas, jerarquía, filtros y estados de la administración.
          No contiene métricas, pedidos ni datos operativos.
        </p>
        <div className="showcase-filters" aria-label="Filtros de muestra">
          <span><CalendarDays aria-hidden="true" size={17} /> Periodo visual <ChevronDown aria-hidden="true" size={16} /></span>
          <span><Palette aria-hidden="true" size={17} /> Tema claro <ChevronDown aria-hidden="true" size={16} /></span>
        </div>
      </section>

      <section className="foundation-grid" aria-label="Fundamentos de diseño">
        {foundations.map(([title, description, Icon]) => (
          <article className="foundation-card" key={title}>
            <Icon aria-hidden="true" size={24} strokeWidth={1.75} />
            <h2>{title}</h2>
            <p>{description}</p>
          </article>
        ))}
      </section>

      <section className="showcase-panel" aria-label="Muestra de superficies y estados">
        <div>
          <p className="eyebrow">Superficies</p>
          <h2>Tarjetas que ordenan la información.</h2>
          <p>Radio generoso, borde suave y elevación ligera para separar contenido sin ruido visual.</p>
        </div>
        <div className="state-stack">
          <span className="state-badge state-ready"><CheckCircle2 aria-hidden="true" size={16} /> Estado disponible</span>
          <span className="state-badge state-attention"><Bell aria-hidden="true" size={16} /> Revisión visual pendiente</span>
          <button className="sample-action" type="button">Acción principal</button>
        </div>
      </section>
    </main>
  );
}
