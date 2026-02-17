<script lang="ts">
  import { onMount } from 'svelte';
  import { setTokens } from '@/store/auth';
  import axios from 'axios';

  let ssoToken: string | null = null;
  let error = '';

  onMount(async () => {
    const params = new URLSearchParams(window.location.search);
    ssoToken = params.get('ssoToken');

    if (!ssoToken) {
      window.location.href = '/login';
      return;
    }

    try {
      const response = await axios.post('http://localhost:9000/api/admin/auth/validate-sso', {
        token: ssoToken,
      });

      const accessToken = response?.data?.data?.accessToken?.token;
      const refreshToken = response?.data?.data?.refreshToken?.token;

      if (!accessToken || !refreshToken) {
        throw new Error('Tokens missing in SSO response');
      }

      setTokens({
        accessToken,
        refreshToken,
      });

      window.location.href = `/?accessToken=${accessToken}&refreshToken=${refreshToken}`;
    } catch (err) {
      console.error('SSO login failed', err);
      error = 'SSO login failed. Redirecting to login...';
      setTimeout(() => {
        window.location.href = '/login';
      }, 2000);
    }
  });
</script>

<div style="padding: 24px;">
  <h2>Signing you in…</h2>

  {#if error}
    <p style="color:red;">{error}</p>
  {:else}
    <p>Please wait while we log you in.</p>
  {/if}
</div>
