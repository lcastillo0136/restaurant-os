import { Bell, ChefHat, CircleCheck, Clock3, Printer, Radio, Sparkles } from 'lucide-react';

const columns = [
  { title: 'Pendiente', count: '01', action: 'Ver inicio', tone: 'pending' },
  { title: 'En preparación', count: '02', action: 'Mostrar avance', tone: 'preparing' },
  { title: 'Listo', count: '03', action: 'Marcar muestra', tone: 'ready' },
] as const;

export function KitchenSample() {
  return (
    <main className="kitchen-shell" data-theme="kitchen-dark">
      <header className="kitchen-bar">
        <div className="kitchen-brand"><ChefHat aria-hidden="true" size={24} /> Restaurant OS <span>· Cocina</span></div>
        <div className="kitchen-actions">
          <span className="station-chip"><Radio aria-hidden="true" size={15} /> Todas las estaciones</span>
          <span className="sync-chip"><CircleCheck aria-hidden="true" size={15} /> Muestra sincronizada</span>
          <button type="button" aria-label="Notificaciones de muestra"><Bell aria-hidden="true" size={20} /></button>
        </div>
      </header>

      <section className="kitchen-intro" aria-labelledby="kitchen-title">
        <div>
          <p className="kitchen-eyebrow">KDS · presentación estática</p>
          <h1 id="kitchen-title">Claridad a distancia, acciones inmediatas.</h1>
        </div>
        <p>Tablero visual de contraste alto. Las tarjetas no representan órdenes reales.</p>
      </section>

      <section className="kitchen-board" aria-label="Columnas visuales de estados">
        {columns.map((column, index) => (
          <section className="kitchen-column" key={column.title}>
            <header className="column-heading">
              <div><span className={`tone-dot ${column.tone}`} aria-hidden="true" />{column.title}</div>
              <span>{column.count}</span>
            </header>
            <article className="ticket-card">
              <div className="ticket-topline"><span>Muestra {String.fromCharCode(65 + index)}</span><span><Clock3 aria-hidden="true" size={15} /> Tiempo visual</span></div>
              <h2>Tarjeta de estación</h2>
              <p>Tipografía amplia, cantidades legibles y notas con jerarquía clara.</p>
              <div className="ticket-items"><span>01 · Elemento de muestra</span><span>02 · Complemento visual</span></div>
              <div className="ticket-footer"><span><Sparkles aria-hidden="true" size={15} /> Estado y texto</span><button type="button">{column.action}</button></div>
            </article>
            {index === 1 && <article className="ticket-card ticket-card-compact"><span>Segunda tarjeta de muestra</span><Printer aria-hidden="true" size={18} /></article>}
          </section>
        ))}
      </section>
    </main>
  );
}
