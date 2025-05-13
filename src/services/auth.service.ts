import { makeRequest } from './api.common';
import type { HttpClientResponseInterface } from './api.common';

export class AuthService {
  public async handleAuthCallback(token: string): Promise<HttpClientResponseInterface> {
    const res = await makeRequest('GET', `/api/admin/auth/callback?token=${token}`);
    return res?.data;
  }
}

// Singleton instance
export const authService = new AuthService();
