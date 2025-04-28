<script lang="ts">
  import { onMount } from 'svelte';
  import { handleAuthCallback } from './authService.viewModel';

  // Get the query string from the URL and call viewModel
  onMount(() => {
    const urlSearch = window.location.search;
    handleAuthCallback(urlSearch);
  });
</script>

<p class="mt-4 text-center text-lg font-semibold text-blue-600 bg-red">Logging in...</p>
