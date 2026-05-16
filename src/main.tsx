import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { installDebugBridge } from './store/debugBridge'

// Install console debug bridge in development (spec D2)
if (import.meta.env.DEV) {
  installDebugBridge()
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

