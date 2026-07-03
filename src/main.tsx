import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './styles/components.css'
import App from './App.tsx'
import { preloadRecaptchaScript } from './utils/recaptcha'
import { runRecaptchaStartupDiagnostics } from './utils/recaptchaDiagnostics'

runRecaptchaStartupDiagnostics()
preloadRecaptchaScript()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
