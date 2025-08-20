/**
 * Token validation utility for cross-app authentication
 */

// Function to decode JWT token
function decodeJwt(token: string): any | null {
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
    return decoded;
  } catch (error) {
    console.error('Error decoding JWT:', error);
    return null;
  }
}

/**
 * Validates if the query token belongs to the same user as the current session
 * @param queryToken - Token from URL query parameters
 * @param currentUserId - Current user ID from auth store
 * @returns Object with validation result and user info
 */
export function validateQueryToken(
  queryToken: string | null,
  currentUserId: string | null,
): {
  isSameUser: boolean;
  queryUserId: string | null;
} {
  const decoded = queryToken ? decodeJwt(queryToken) : null;
  const queryUserId = decoded?._id || null;
  const isSameUser = !!currentUserId && currentUserId === queryUserId;

  return { isSameUser, queryUserId };
}
