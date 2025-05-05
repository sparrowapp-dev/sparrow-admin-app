import { makeRequest } from './api.common';
import type { HttpClientResponseInterface } from './api.common';

export class AuthService {
  public async handleAuthCallback(token: string): Promise<HttpClientResponseInterface> {
    const res = await makeRequest('GET', `/auth/callback?token=${token}`);
    return res.data;
  }

  public async disableWorkspaceNewInviteTag(
    userId: string,
    workspaceId: string,
  ): Promise<HttpClientResponseInterface> {
    const res = await makeRequest(
      'GET',
      `/api/workspace/${workspaceId}/user/${userId}/disableWorkspaceNewInvite`,
    );
    return res.data;
  }

  public async validateUserEmail(email: string): Promise<HttpClientResponseInterface> {
    const res = await makeRequest('GET', `/api/user/email/${email}`);
    return res.data;
  }
}

// Singleton instance
export const authService = new AuthService();
