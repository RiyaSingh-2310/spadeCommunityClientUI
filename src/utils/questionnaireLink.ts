import { getFrontendBaseUrl } from '../config/api';
import { encodeSecureToken } from './secureToken';

interface QuestionnaireUrlData {
  path: string;
  userToken: string;
}

export function getQuestionnaireUrlData(rawUrl: string): QuestionnaireUrlData | null {
  if (!rawUrl) return null;

  try {
    const parsed = new URL(rawUrl, getFrontendBaseUrl() || undefined);
    const userToken = parsed.searchParams.get('Userid') ?? parsed.searchParams.get('userId') ?? '';
    const secureToken = encodeSecureToken(userToken);

    if (secureToken) {
      return {
        path: `/questionnaire/${secureToken}`,
        userToken,
      };
    }

    if (parsed.pathname.startsWith('/questionnaire')) {
      return {
        path: `${parsed.pathname}${parsed.search}`,
        userToken: '',
      };
    }

    return null;
  } catch {
    return null;
  }
}
