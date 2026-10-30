import type { ReactNode } from 'react';

export type RestaurantTheme = 'admin-light' | 'customer-warm' | 'kitchen-dark' | 'pos-light';
export type SemanticTone = 'neutral' | 'accent' | 'success' | 'warning' | 'danger';
export type VisualState = 'normal' | 'loading' | 'error' | 'offline' | 'pending' | 'confirmed' | 'disabled';

export interface IconSlotProps {
  icon?: ReactNode;
  iconLabel?: string;
}
