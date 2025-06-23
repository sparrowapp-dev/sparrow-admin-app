<script lang="ts">
  import { Route, navigate } from 'svelte-routing';
  import { auth } from '@/store/auth';
  import BaseLayout from '@/layouts/BaseLayout.svelte';
  import { onMount } from 'svelte';
  import { checkAndRefreshToken } from '@/utils/checkAndRefreshToken';

  export let path: string;
  export let component: any;

  // Check if user is logged in
  let isLoggedIn: boolean = !!$auth?.token;

  // Add handler for authentication changes
  onMount(() => {
    // Check token validity immediately when route is accessed
    if (isLoggedIn) {
      checkAndRefreshToken().catch(() => {
        // If token refresh fails, redirect to login
        navigate('/login');
      });
    } else if (!isLoggedIn) {
      // If not logged in, redirect immediately
      navigate('/login');
    }
  });
</script>

{#if isLoggedIn}
  <!-- Render route if logged in -->
  <Route {path} let:params>
    <BaseLayout>
      <svelte:component this={component} {...params} />
    </BaseLayout>
  </Route>
{/if}
