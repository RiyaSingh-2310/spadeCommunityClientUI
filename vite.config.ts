import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

function assertProductionEnv(env: Record<string, string>) {
  const apiBase = env.VITE_API_BASE_URL?.trim() ?? ''
  const isLocalApi =
    !apiBase ||
    apiBase.includes('localhost') ||
    apiBase.includes('127.0.0.1')

  if (isLocalApi) {
    throw new Error(
      [
        'Production build blocked: VITE_API_BASE_URL must be set to your public API URL.',
        'Current value points to localhost or is empty.',
        'In Vercel → Project Settings → Environment Variables, set for Production and Preview:',
        '  VITE_API_BASE_URL=https://adminapi-spadecommunity.onrender.com',
        'Then redeploy. Without this, users see "Network error" after completing reCAPTCHA.',
      ].join('\n')
    )
  }

  const recaptchaKey = env.VITE_RECAPTCHA_SITE_KEY?.trim() ?? ''
  if (!recaptchaKey) {
    throw new Error(
      [
        'Production build blocked: VITE_RECAPTCHA_SITE_KEY is required.',
        'Add your reCAPTCHA v2 Checkbox site key in Vercel Environment Variables and redeploy.',
      ].join('\n')
    )
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  if (mode === 'production') {
    assertProductionEnv(env)
  }

  return {
    plugins: [react()],
  }
})
