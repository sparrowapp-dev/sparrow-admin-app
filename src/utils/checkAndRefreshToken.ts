import { get } from 'svelte/store';
import { tokenExpiration, refreshToken, clearTokens } from '@/store/auth';
import { authService } from '@/services/auth.service';
import { setTokens } from '@/store/auth';
import { navigate } from 'svelte-routing';

/**
 * Check if the current token is expired or will expire soon
 * @param bufferSeconds Seconds before actual expiry to consider token expired
 * @returns True if token is expired or will expire soon
 */
export function isTokenExpired(bufferSeconds = 60): boolean {
  const expiration = get(tokenExpiration);
  if (!expiration) return true;

  // Get current time in seconds
  const now = Math.floor(Date.now() / 1000);

  // Return true if token expired or will expire soon
  return expiration <= now + bufferSeconds;
}

/**
 * Proactively refresh the token if it's about to expire
 */
export async function checkAndRefreshToken(): Promise<boolean> {
  try {
    // If token is expired or about to expire
    if (isTokenExpired(300)) {
      // 5 minute buffer
      const currentRefreshToken = get(refreshToken);

      // If we have a refresh token
      if (currentRefreshToken) {
        const result = await authService.refreshToken(currentRefreshToken);

        if (result?.data?.accessToken && result?.data?.refreshToken) {
          setTokens({
            accessToken: result.data.accessToken.token,
            refreshToken: result.data.refreshToken.token,
          });
          return true;
        }
      }

      // If we get here, token refresh failed
      clearTokens();
      navigate('/login');
      return false;
    }

    return true; // Token is still valid
  } catch (error) {
    console.error('Error refreshing token:', error);
    clearTokens();
    navigate('/login');
    return false;
  }
}
