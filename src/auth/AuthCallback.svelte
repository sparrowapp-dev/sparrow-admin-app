<script lang="ts">
  import { onMount } from 'svelte';
  import { setTokens } from '@/store/auth';
  import { authService } from '@/services/auth.service';

  let isLoading = true;
  let errorMessage = '';

  onMount(async () => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('accessToken');
    const trialId = params.get('trialId');
    const name = params.get('name');
    const flow = params.get('flow');
    const trialPeriod = params.get('trialPeriod');
    const email = params.get('email');
    const source = params.get('source');
    const response = params.get('response');

    if (!token) {
      window.location.href = '/login';
      return;
    }

    try {
      const result = await authService.handleAuthCallback(token);
      const accessToken = result?.data?.accessToken.token;
      const refreshToken = result?.data?.refreshToken.token;

      setTokens({
        accessToken: accessToken,
        refreshToken: refreshToken,
      });

      // Redirect to the app
      if (trialId) {
        window.location.href = `/trial?trialId=${trialId}&name=${name}`;
        return;
      } else if (
        flow === 'signup_standard_trial' ||
        flow === 'signup_professional_trial' ||
        flow === 'marketing_standard_trial' ||
        flow === 'marketing_professional_trial'
      ) {
        window.location.href = `/usertrial?name=${name}&flow=${flow}&trialPeriod=${trialPeriod}&email=${email}&source=${source}&accessToken=${accessToken}&refreshToken=${refreshToken}&response=${response}`;
        return;
      }
      window.location.href = '/hubs';
    } catch (err) {
      errorMessage = 'Authentication failed. Redirecting to login...';
      setTimeout(() => {
        window.location.href = '/login';
      }, 2000);
    } finally {
      isLoading = false;
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
      {errorMessage || 'Logging in...'}
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
