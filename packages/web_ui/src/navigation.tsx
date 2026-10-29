import type { ReactNode } from 'react';
import { classNames } from './utils';

export interface NavigationItem {
  id: string;
  label: string;
  icon?: ReactNode;
  href?: string;
  disabled?: boolean;
}

interface NavigationProps {
  items: NavigationItem[];
  activeId: string;
  onChange?: (id: string) => void;
  label: string;
}

export function HorizontalNavigation({ items, activeId, onChange, label }: NavigationProps) {
  return (
    <nav className="ros-horizontal-nav" aria-label={label}>
      {items.map((item) => <NavigationLink key={item.id} item={item} active={item.id === activeId} onChange={onChange} />)}
    </nav>
  );
}

export function CompactRail({ items, activeId, onChange, label }: NavigationProps) {
  return (
    <nav className="ros-compact-rail" aria-label={label}>
      {items.map((item) => <NavigationLink key={item.id} item={item} active={item.id === activeId} onChange={onChange} compact />)}
    </nav>
  );
}

function NavigationLink({ item, active, onChange, compact = false }: { item: NavigationItem; active: boolean; onChange?: (id: string) => void; compact?: boolean }) {
  const content = <>{item.icon && <span aria-hidden="true">{item.icon}</span>}<span>{item.label}</span></>;
  const className = classNames('ros-nav-item', compact && 'ros-nav-item--compact', active && 'is-active', item.disabled && 'is-disabled');
  if (item.href) return <a href={item.href} className={className} aria-current={active ? 'page' : undefined} aria-disabled={item.disabled || undefined} onClick={(event) => { if (item.disabled) event.preventDefault(); else onChange?.(item.id); }}>{content}</a>;
  return <button type="button" className={className} aria-pressed={active} disabled={item.disabled} onClick={() => onChange?.(item.id)}>{content}</button>;
}
