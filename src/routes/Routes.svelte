<script lang="ts">
  import { Router, Route } from 'svelte-routing';
  import AuthCallback from '@/auth/AuthCallback.svelte';
  import Hubs from '@/pages/Hubs/Hubs.svelte';
  import NotFound from '@/pages/NotFound/NotFound.svelte';
  import PrivateRoute from './PrivateRoute.svelte';

  // URL passed from parent component
  export let url: string = '';
</script>

<Router>
  <!--auth callback -->
  <Route path="/auth-callback" component={AuthCallback} />

  <!-- Protected routes -->
  <!-- <PrivateRoute path="/workspace" component={Workspace} /> -->
  <PrivateRoute path="/hubs" component={Hubs} />

  <!-- Fallback for unmatched routes -->
  <Route path="*" component={NotFound} />
</Router>
