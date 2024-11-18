import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { env } from './config/env';

const root = document.getElementById('root');
if (!root) {
  console.error('Root element not found');
} else {
  if (env.groqApiKeys.length === 0) {
    root.innerHTML = `
      <div style="padding: 20px; color: red;">
        Error: No valid GROQ API keys found. Please check your environment configuration.
      </div>
    `;
  } else {
    ReactDOM.createRoot(root).render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  }
}
