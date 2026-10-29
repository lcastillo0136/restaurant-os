import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { PosSample } from './PosSample';
import './styles.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PosSample />
  </StrictMode>,
);
