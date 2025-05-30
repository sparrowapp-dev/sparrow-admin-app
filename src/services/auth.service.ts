import { makeRequest } from './api.common';
import type { HttpClientResponseInterface } from './api.common';

export class AuthService {
  public async handleAuthCallback(token: string): Promise<HttpClientResponseInterface> {
    const res = await makeRequest('GET', `/api/admin/auth/callback?token=${token}`);
    return res?.data;
  }

  /**
   * Refresh the access token using a refresh token
   * @param refreshToken The refresh token
   */
  public async refreshToken(refreshToken: string): Promise<HttpClientResponseInterface> {
    const res = await makeRequest('POST', '/api/admin/auth/refresh-token', {
      refreshToken,
    });
    return res?.data;
  }
}

// Singleton instance
export const authService = new AuthService();
