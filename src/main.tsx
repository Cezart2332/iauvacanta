import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import logo from './assets/logo.png';

const ensureFavicon = (href: string): void => {
  let link = document.querySelector<HTMLLinkElement>("link[rel='icon']");

  if (!link) {
    link = document.createElement('link');
    link.rel = 'icon';
    document.head.appendChild(link);
  }

  link.type = 'image/png';
  link.href = href;
};

ensureFavicon(logo);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
