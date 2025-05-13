<script lang="ts">
  import { onMount } from 'svelte';
  import { setTokens } from '@/store/auth';
  import { authService } from '@/services/auth.service';
  import { LOGIN_REDIRECT_URL } from '@/constants/environment';

  onMount(async () => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('accessToken');
    debugger;
    if (!token) {
      window.location.href = LOGIN_REDIRECT_URL;
      return;
    }

    try {
      const result = await authService.handleAuthCallback(token);

      setTokens({
        accessToken: result?.data?.accessToken.token,
        refreshToken: result?.data?.refreshToken.token,
      });

      // Redirect to the app
      window.location.href = '/hubs';
    } catch (err) {
      window.location.href = '/login';
    }
  });
</script>

<p class="font-fw-ds-600 mt-4 text-center text-lg text-blue-600">Logging in...</p>
