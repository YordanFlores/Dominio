import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

const registerServiceWorker = async () => {
  if (!('serviceWorker' in navigator)) {
    return
  }

  try {
    await navigator.serviceWorker.register('/sw.js')
  } catch (error) {
    console.error('No fue posible registrar el service worker', error)
  }
}

void registerServiceWorker()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
