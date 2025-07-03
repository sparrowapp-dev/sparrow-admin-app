import { get } from 'svelte/store';
import { auth, clearTokens } from '@/store/auth';
import { navigate } from 'svelte-routing';

/**
 * Simple auth check - just verifies if user has a token
 * Token refresh is now handled automatically by the HTTP client
 */
export function isAuthenticated(): boolean {
  const authState = get(auth);
  return !!authState?.token;
}

/**
 * Logout user and redirect to login
 */
export function logout(): void {
  clearTokens();
  navigate('/login');
}
