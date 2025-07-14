<script lang="ts">
  import { onMount } from 'svelte';
  import { LOGIN_REDIRECT_URL } from '@/constants/environment';
  import { navigate } from 'svelte-routing';
  import { initPostHog } from '@/utils/posthogConfig';

  onMount(() => {
    const accessToken = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');

    if (accessToken && refreshToken) {
      // User is already authenticated, redirect to main app
      initPostHog();
      navigate('/hubs');
    } else {
      // Not logged in, proceed to login flow
      navigate(LOGIN_REDIRECT_URL);
    }
  });
</script>

<div class="bg-surface-800 flex h-screen w-screen flex-col items-center justify-center">
  <div class="flex flex-col items-center">
    <!-- Spinner Animation -->
    <div
      class="h-12 w-12 animate-spin rounded-full border-4 border-solid border-current border-t-transparent text-blue-300"
    ></div>

    <!-- Text below spinner -->
    <p class="font-fw-ds-400 mt-4 text-neutral-400">
      {'Redirecting...'}
    </p>
  </div>
</div>

<style>
  /* Fallback animation if Tailwind's animate-spin is not available */
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  .animate-spin {
    animation: spin 1s linear infinite;
  }
</style>
