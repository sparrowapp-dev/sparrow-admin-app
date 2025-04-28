<script lang="ts">
  import Routes from './routes/Routes.svelte';

  // This is important! It provides the current URL to the Router
  const url = window.location.pathname;
</script>

<Routes {url} />
