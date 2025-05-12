import { writable, derived } from 'svelte/store';

// Check if tokens are already stored in localStorage
const storedAccessToken = localStorage.getItem('accessToken');
const storedRefreshToken = localStorage.getItem('refreshToken');

// Writable stores for individual tokens
export const accessToken = writable<string | null>(storedAccessToken || null);
export const refreshToken = writable<string | null>(storedRefreshToken || null);

// Derived store that exposes combined auth state
export const auth = derived([accessToken, refreshToken], ([$accessToken, $refreshToken]) => ({
  accessToken: $accessToken,
  refreshToken: $refreshToken,
  token: $accessToken,
  isLoggedIn: !!$accessToken,
}));

// Function to set both tokens and persist them to localStorage
export const setTokens = (tokens: { accessToken: string; refreshToken: string }) => {
  accessToken.set(tokens.accessToken);
  refreshToken.set(tokens.refreshToken);

  localStorage.setItem('accessToken', tokens.accessToken);
  localStorage.setItem('refreshToken', tokens.refreshToken);
};

// Function to clear both tokens and remove them from localStorage (useful for logout)
export const clearTokens = () => {
  accessToken.set(null);
  refreshToken.set(null);

  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
};
