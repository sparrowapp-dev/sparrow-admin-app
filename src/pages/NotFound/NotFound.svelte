<script lang="ts">
  import { onMount } from 'svelte';
  import { navigate } from 'svelte-routing';
  import SparrowBirdBg from '@/assets/icons/SparrowBirdBg.svelte';

  onMount(() => {
    const accessToken = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');

    if (!accessToken && !refreshToken) {
      navigate('/login');
    }
  });
</script>

<div
  class="bg-surface-900 flex h-screen w-full flex-col items-center justify-center px-4 text-center"
>
  <SparrowBirdBg />

  <h1 class="font-fw-ds-500 font-inter text-fs-ds-16 mt-5 max-w-xl text-neutral-200">
    404 – Page Not Found
  </h1>
  <p class="font-fw-ds-400 font-inter text-fs-ds-14 max-w-xl text-neutral-400">
    The page you’re looking for doesn’t exist or has been moved. Please check the URL or go back to
    the main application.
  </p>
</div>
