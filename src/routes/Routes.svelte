<script lang="ts">
  import { Router, Route } from 'svelte-routing';
  import AuthCallback from '@/auth/AuthCallback.svelte';
  import Hubs from '@/pages/Hubs/Hubs.svelte';
  import NotFound from '@/pages/NotFound/NotFound.svelte';
  import PrivateRoute from './PrivateRoute.svelte';
  import Login from '@/pages/Login/Login.svelte';
  import Users from '@/pages/Users/Users.svelte';
  import Private from '@/assets/icons/Private.svelte';
  import Payment from '@/pages/Payment/Payment.svelte';
  import TrialFlow from '@/pages/TrialFlow/TrialFlow.svelte';
  import TrialSuccess from '@/pages/TrialSuccess/TrialSuccess.svelte';
  import UserTrialFlow from '@/pages/UserTrialFlow/UserTrialFlow.svelte';
  import Plans from '@/pages/Plans/Plans.svelte';

  // URL passed from parent component
  export let url: string = '';
</script>

<Router>
  <!--auth callback -->
  <Route path="/" component={AuthCallback} />
  <Route path="/login" component={Login} />

  <!-- Protected routes -->
  <!-- <PrivateRoute path="/workspace" component={Workspace} /> -->
  <PrivateRoute path="/hubs/*" component={Hubs} />
  <PrivateRoute path="/users/*" component={Users} />
  <PrivateRoute path="/billing/*" component={Payment} />

  <!-- Trail Flow -->
  <Route path="/trial" component={TrialFlow} />

  <!--Markteing Trial Flow -->
  <Route path="/usertrial" component={UserTrialFlow} />

  <!-- Trail Flow Success -->
  <Route path="/trialsuccess" component={TrialSuccess} />

  <!-- Plans Page -->
  <Route path="/plans" component={Plans} />

  <!-- Fallback for unmatched routes -->
  <Route path="*" component={NotFound} />
</Router>
