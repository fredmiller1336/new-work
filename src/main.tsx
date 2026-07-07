import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Completely disable console errors in development
if (import.meta.env.DEV) {
  console.error = () => {};
  console.warn = () => {};
}

createRoot(document.getElementById("root")!).render(<App />);
