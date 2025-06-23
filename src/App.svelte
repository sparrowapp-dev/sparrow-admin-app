<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import Routes from './routes/Routes.svelte';
  import Toast from './components/Toast/Toast.svelte';
  import { auth, clearTokens } from './store/auth';
  import { checkAndRefreshToken } from './utils/checkAndRefreshToken';
  import { navigate } from 'svelte-routing';
  
  // This is important! It provides the current URL to the Router
  const url = window.location.pathname;

  // Check token on mount and set up interval
  let tokenCheckInterval: number;
  let visibilityChangeHandler: (event: Event) => void;

  // Global handler for unauthorized errors (401)
  function setupUnauthorizedErrorHandler() {
    const originalFetch = window.fetch;
    window.fetch = async function(...args) {
      try {
        const response = await originalFetch.apply(this, args);
        
        // If we get a 401, try to refresh the token once
        if (response.status === 401) {
          const refreshSuccess = await checkAndRefreshToken();
          
          // If refresh succeeded, retry the original request
          if (refreshSuccess) {
            return await originalFetch.apply(this, args);
          } else {
            // If refresh failed, clear tokens and redirect
            clearTokens();
            navigate('/login');
          }
        }
        
        return response;
      } catch (error) {
        console.error('Fetch error:', error);
        throw error;
      }
    };
  }

  onMount(() => {
    // Set up unauthorized error handler
    setupUnauthorizedErrorHandler();
    
    // Check immediately
    if ($auth.isLoggedIn) {
      checkAndRefreshToken();
    }

    // Check token when tab becomes visible again
    visibilityChangeHandler = () => {
      if (document.visibilityState === 'visible' && $auth.isLoggedIn) {
        checkAndRefreshToken();
      }
    };
    document.addEventListener('visibilitychange', visibilityChangeHandler);

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
    document.removeEventListener('visibilitychange', visibilityChangeHandler);
  });
</script>

<Routes {url} />
<Toast />
