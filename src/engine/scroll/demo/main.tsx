import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@/index.css';
import EngineDemo from './EngineDemo';

// Standalone entry for the lane-05 demo: dev server URL /src/engine/scroll/demo/engine-demo.html
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <EngineDemo />
  </StrictMode>,
);
