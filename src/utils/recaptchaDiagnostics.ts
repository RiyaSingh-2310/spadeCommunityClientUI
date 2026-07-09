import { getApiBaseUrl, isApiUsingProductionFallback } from '../config/api';
import {
  EXPECTED_RECAPTCHA_SITE_KEY_PREFIX,
  getRecaptchaSiteKey,
  RECAPTCHA_IMPLEMENTATION_LABEL,
} from '../config/recaptcha';

const PREFIX = '[reCAPTCHA]';
const RECAPTCHA_SCRIPT_URL =
  'https://www.google.com/recaptcha/api.js?onload=onRecaptchaLoad&render=explicit';

export function maskSiteKey(siteKey: string): string {
  if (!siteKey) return '(empty)';
  if (siteKey.length <= 12) return siteKey;
  return `${siteKey.slice(0, 8)}...${siteKey.slice(-4)}`;
}

export interface RecaptchaDiagnosticReport {
  mode: string;
  isProduction: boolean;
  hostname: string;
  origin: string;
  siteKeyLoaded: boolean;
  siteKeyLength: number;
  siteKeyMasked: string;
  siteKeyPrefix: string;
  expectedKeyPrefix: string;
  keyMatchesExpected: boolean;
  implementation: string;
  scriptUrl: string;
  viteEnvPresent: boolean;
  buildInjectionNote: string;
  vercelNote: string;
  domainRegistrationHint: string | null;
  apiBaseUrl: string;
  apiUsesProductionFallback: boolean;
  diagnosticsEnabled: boolean;
}

export function getDomainRegistrationHint(hostname: string): string | null {
  if (!hostname) return null;

  if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname.endsWith('.localhost')) {
    return `Add "${hostname}" under Domains in Google reCAPTCHA Admin for your v2 Checkbox key.`;
  }

  if (hostname.endsWith('.vercel.app')) {
    return `Vercel hostname "${hostname}" must be added exactly under Domains in Google reCAPTCHA Admin (preview URLs are not wildcarded).`;
  }

  return `Production hostname "${hostname}" must be listed exactly under Domains in Google reCAPTCHA Admin.`;
}

export function getRecaptchaDiagnosticReport(): RecaptchaDiagnosticReport {
  const raw = import.meta.env.VITE_RECAPTCHA_SITE_KEY;
  const siteKey = getRecaptchaSiteKey();
  const hostname = typeof window !== 'undefined' ? window.location.hostname : 'n/a';
  const origin = typeof window !== 'undefined' ? window.location.origin : 'n/a';

  return {
    mode: import.meta.env.MODE,
    isProduction: import.meta.env.PROD,
    hostname,
    origin,
    siteKeyLoaded: siteKey.length > 0,
    siteKeyLength: siteKey.length,
    siteKeyMasked: maskSiteKey(siteKey),
    siteKeyPrefix: siteKey.slice(0, 10),
    expectedKeyPrefix: EXPECTED_RECAPTCHA_SITE_KEY_PREFIX,
    keyMatchesExpected: siteKey.startsWith(EXPECTED_RECAPTCHA_SITE_KEY_PREFIX),
    implementation: RECAPTCHA_IMPLEMENTATION_LABEL,
    scriptUrl: RECAPTCHA_SCRIPT_URL,
    viteEnvPresent: raw !== undefined && String(raw).trim() !== '',
    buildInjectionNote:
      'Vite embeds VITE_* variables at build time. Changing Vercel env vars requires a new deployment.',
    vercelNote:
      'Set VITE_RECAPTCHA_SITE_KEY in Vercel → Project Settings → Environment Variables for Production and Preview, then redeploy.',
    domainRegistrationHint: hostname !== 'n/a' ? getDomainRegistrationHint(hostname) : null,
    apiBaseUrl: typeof window !== 'undefined' ? getApiBaseUrl() : 'n/a',
    apiUsesProductionFallback: isApiUsingProductionFallback(),
    diagnosticsEnabled: isRecaptchaDiagnosticsEnabled(),
  };
}

export function isRecaptchaDiagnosticsEnabled(): boolean {
  const flag = import.meta.env.VITE_RECAPTCHA_DEBUG;
  if (flag === 'false') return false;
  return true;
}

export function logRecaptchaDiag(
  event: 'Site key loaded' | 'Script loaded' | 'Widget rendered' | 'Token received' | 'Token expired' | 'Diagnostic report',
  detail?: Record<string, unknown>
): void {
  if (!isRecaptchaDiagnosticsEnabled()) return;

  if (detail) {
    console.info(`${PREFIX} ${event}`, detail);
  } else {
    console.info(`${PREFIX} ${event}`);
  }
}

export function runRecaptchaStartupDiagnostics(): void {
  if (!isRecaptchaDiagnosticsEnabled()) return;

  const report = getRecaptchaDiagnosticReport();

  logRecaptchaDiag('Site key loaded', {
    loaded: report.siteKeyLoaded,
    masked: report.siteKeyMasked,
    prefix: report.siteKeyPrefix,
    expectedPrefix: report.expectedKeyPrefix,
    keyMatchesExpected: report.keyMatchesExpected,
    length: report.siteKeyLength,
    viteEnvPresentAtBuild: report.viteEnvPresent,
  });

  if (!report.siteKeyLoaded) {
    console.warn(
      `${PREFIX} Site key missing in this build. ${report.vercelNote}`
    );
  } else if (!report.keyMatchesExpected) {
    console.warn(
      `${PREFIX} Site key prefix does not match the expected v2 Checkbox key (${report.expectedKeyPrefix}). An old or wrong key may be baked into this deployment.`
    );
  }

  if (report.domainRegistrationHint) {
    console.info(`${PREFIX} Domain whitelist reminder`, {
      hostname: report.hostname,
      hint: report.domainRegistrationHint,
    });
  }

  console.info(`${PREFIX} API configuration`, {
    apiBaseUrl: report.apiBaseUrl,
    apiUsesProductionFallback: report.apiUsesProductionFallback,
    note:
      'If signup fails after reCAPTCHA with a connection error, verify VITE_API_BASE_URL in Vercel — not the reCAPTCHA site key.',
  });

  logRecaptchaDiag('Diagnostic report', report as unknown as Record<string, unknown>);

  if (typeof window !== 'undefined') {
    (window as Window & { __RECAPTCHA_DIAGNOSTICS__?: RecaptchaDiagnosticReport }).__RECAPTCHA_DIAGNOSTICS__ =
      report;
  }
}

declare global {
  interface Window {
    __RECAPTCHA_DIAGNOSTICS__?: RecaptchaDiagnosticReport;
  }
}
