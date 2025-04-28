import { auth } from '@/store/auth';

// Handle authentication callback by extracting parameters from URL
export async function handleAuthCallback(urlSearch: string) {
  const params = new URLSearchParams(urlSearch);
  const token = params.get('token');
  const refresh = params.get('refresh');
  const email = params.get('email');

  await simulateLogin(token, refresh, email);
}

// Simulate login process with extracted parameters
async function simulateLogin(token: string | null, refresh: string | null, email: string | null) {
  return new Promise<void>((resolve) => {
    setTimeout(() => {
      if (token && refresh && email) {
        // Set authentication details and redirect to workspace
        auth.set({ token, refresh, email });
        window.location.href = '/workspace';
      } else {
        // Alert user and redirect to login if details are missing
        alert('Missing login details.');
        window.location.href = '/login';
      }
      resolve();
    }, 2000);
  });
}
