import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './styles/components.css'
import App from './App.tsx'
import { preloadRecaptchaScript } from './utils/recaptcha'
import { runRecaptchaStartupDiagnostics } from './utils/recaptchaDiagnostics'
import { isSignupCaptchaRequired } from './config/signup'

runRecaptchaStartupDiagnostics()

// TEMPORARY: reCAPTCHA validation bypassed for development/testing.
// Re-enable before production release.
if (isSignupCaptchaRequired()) {
  preloadRecaptchaScript()
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
