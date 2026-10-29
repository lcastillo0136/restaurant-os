import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { KitchenSample } from './KitchenSample';
import './styles.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <KitchenSample />
  </StrictMode>,
);
