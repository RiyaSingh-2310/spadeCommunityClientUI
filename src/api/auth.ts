import { apiRequest } from './http';

export interface SignupPayload {
  name: string;
  email: string;
  password: string;
  confirm_password: string;
}

export interface SignupResponse {
  success: boolean;
  message: string;
  data?: {
    questionnaire_url?: string;
  };
}

export async function signup(payload: SignupPayload): Promise<SignupResponse> {
  return apiRequest<SignupResponse>('/api/panelist/signup', {
    method: 'POST',
    body: payload,
  });
}

export interface VerifyAccountPayload {
  token: string;
}

export interface VerifyAccountResponse {
  success: boolean;
  message: string;
  data?: unknown;
}

export async function verifyAccount({
  token,
}: VerifyAccountPayload): Promise<VerifyAccountResponse> {
  return apiRequest<VerifyAccountResponse>(`/api/panelist/activate/${encodeURIComponent(token)}`);
}
