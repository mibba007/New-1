import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Suppress known TradingView widget unmount errors
window.addEventListener('error', (event) => {
  if (event.message === 'Script error.') {
    event.preventDefault();
  }
});

createRoot(document.getElementById('root')!).render(
  <App />
);
