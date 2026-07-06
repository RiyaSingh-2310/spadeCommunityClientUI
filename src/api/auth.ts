import { apiRequest } from './http';
import { ApiError } from './ApiError';

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
  const response = await apiRequest<SignupResponse>('/api/panelist/signup', {
    method: 'POST',
    body: {
      name: payload.name,
      email: payload.email,
      password: payload.password,
      confirm_password: payload.confirm_password,
    },
  });

  if (response.success === false) {
    throw new ApiError(response.message || 'Signup failed. Please try again.', 400);
  }

  return response;
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
  if (!token.trim()) {
    throw new ApiError('Missing activation token. Please use the link from your email.', 400);
  }

  const response = await apiRequest<VerifyAccountResponse>(
    `/api/panelist/activate/${encodeURIComponent(token)}`
  );

  if (response.success === false) {
    throw new ApiError(response.message || 'Unable to activate your account.', 400);
  }

  return response;
}
