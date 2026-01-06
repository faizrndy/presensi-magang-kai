import React from 'react';
import ReactDOM from 'react-dom/client';
import App from "./app/App.tsx";
import { Toaster } from 'sonner';
import './styles/index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
    <Toaster richColors position="top-right" />
  </React.StrictMode>
);
