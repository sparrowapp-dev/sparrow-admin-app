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
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
};

// function to decode JWT token
function decodeJwt(token: string | null) {
  if (!token) return null;

  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join(''),
    );
    const decoded = JSON.parse(jsonPayload);

    // Destructure the values we want
    const { _id, email, name, role, iat, exp } = decoded;
    return { _id, email, name, role, iat, exp };
  } catch (error) {
    console.error('Error decoding JWT:', error);
    return null;
  }
}

// Derived stores for specific token data
export const decodedToken = derived(accessToken, ($accessToken) => decodeJwt($accessToken));
export const userId = derived(decodedToken, ($token) => $token?._id);
export const userEmail = derived(decodedToken, ($token) => $token?.email);
export const userName = derived(decodedToken, ($token) => $token?.name);
export const userRole = derived(decodedToken, ($token) => $token?.role);
export const tokenExpiration = derived(decodedToken, ($token) => $token?.exp);
