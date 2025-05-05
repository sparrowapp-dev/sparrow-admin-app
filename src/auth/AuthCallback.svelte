<script lang="ts">
  import { onMount } from 'svelte';
  import { setTokens } from '@/store/auth';
  import { authService } from '@/services/auth.service';

  onMount(async () => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');

    if (!token) {
      window.location.href = '/login';
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

<p class="mt-4 text-center text-lg font-semibold text-blue-600">Logging in...</p>
