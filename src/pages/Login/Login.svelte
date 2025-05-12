<script lang="ts">
  import { onMount } from 'svelte';
  import { LOGIN_REDIRECT_URL } from '@/constants/environment';
  import { navigate } from 'svelte-routing';

  onMount(() => {
    const accessToken = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');

    if (accessToken && refreshToken) {
      // User is already authenticated, redirect to main app
      navigate('/hubs');
    } else {
      // Not logged in, proceed to login flow
      navigate(LOGIN_REDIRECT_URL);
    }
  });
</script>
