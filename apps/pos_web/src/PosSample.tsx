import { Banknote, ChevronLeft, CreditCard, LayoutGrid, ReceiptText, Settings2, Split, WalletCards } from 'lucide-react';

const navigation = [LayoutGrid, ReceiptText, WalletCards, Settings2] as const;

export function PosSample() {
  return (
    <main className="pos-shell" data-theme="pos-light">
      <aside className="pos-rail" aria-label="Navegación lateral compacta de muestra">
        <div className="pos-mark" aria-hidden="true">R</div>
        <div className="rail-icons">
          {navigation.map((Icon, index) => <button className={index === 2 ? 'rail-button rail-active' : 'rail-button'} key={Icon.displayName} type="button"><Icon aria-hidden="true" size={21} /></button>)}
        </div>
        <button className="rail-button" type="button"><Settings2 aria-hidden="true" size={21} /></button>
      </aside>
      <section className="pos-main">
        <header className="pos-header"><span><ChevronLeft aria-hidden="true" size={20} /> Muestra de interfaz</span><span className="pos-phase">Fase 0.1 · POS</span></header>
        <div className="pos-content">
          <section aria-labelledby="pos-title">
            <p className="pos-eyebrow">Caja · presentación estática</p>
            <h1 id="pos-title">Selección clara, resumen persistente.</h1>
            <p className="pos-description">Los siguientes controles representan estilo, estados y jerarquía visual; no procesan pagos.</p>
            <div className="method-grid" aria-label="Tarjetas visuales de método">
              <article className="method-card method-selected"><Banknote aria-hidden="true" size={30} /><h2>Efectivo</h2><p>Estado seleccionado de muestra</p><span aria-hidden="true" /></article>
              <article className="method-card"><CreditCard aria-hidden="true" size={30} /><h2>Otro método</h2><p>Presentación sin integración</p><span aria-hidden="true" /></article>
              <article className="method-card"><Split aria-hidden="true" size={30} /><h2>Distribución</h2><p>Componente visual futuro</p><span aria-hidden="true" /></article>
            </div>
            <button className="pos-primary" type="button">Continuar muestra</button>
          </section>
          <aside className="summary-card" aria-label="Resumen visual estático">
            <div className="summary-title"><ReceiptText aria-hidden="true" size={21} /><h2>Resumen visual</h2></div>
            <div className="summary-lines"><span>Superficie elevada</span><strong>Elemento A</strong><span>Jerarquía secundaria</span><strong>Elemento B</strong></div>
            <div className="summary-divider" />
            <div className="summary-total"><span>Total de muestra</span><strong>—</strong></div>
            <p>Sin cuenta, cliente ni importe real.</p>
          </aside>
        </div>
      </section>
    </main>
  );
}
