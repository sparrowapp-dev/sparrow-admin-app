<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import Routes from './routes/Routes.svelte';
  import Toast from './components/Toast/Toast.svelte';
  import { auth } from './store/auth';
  import { checkAndRefreshToken } from './utils/checkAndRefreshToken';
  // This is important! It provides the current URL to the Router
  const url = window.location.pathname;

  // Check token on mount and set up interval
  let tokenCheckInterval: number;

  onMount(() => {
    
    // Check immediately
    if ($auth.isLoggedIn) {
      checkAndRefreshToken();
    }

    // Then check periodically (every minute)
    tokenCheckInterval = setInterval(() => {
      if ($auth.isLoggedIn) {
        checkAndRefreshToken();
      }
    }, 60000);
  });

  onDestroy(() => {
    if (tokenCheckInterval) {
      clearInterval(tokenCheckInterval);
    }
  });
</script>

<Routes {url} />
<Toast />
