import type { ReactNode } from 'react';

export function FoundationNotice({ children }: { children: ReactNode }) {
  return <aside role="status">{children}</aside>;
}
