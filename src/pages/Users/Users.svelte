<script lang="ts">
  import { Router, Route, Link, useLocation } from 'svelte-routing';
  import UserOverview from './UserOverview/UserOverview.svelte';
  import UsersSideNav from '@/components/UsersSideNav/UsersSideNav.svelte';
  import UserDashboard from './UserDashboard/UserDashboard.svelte';

  const location = useLocation();
  // queries
</script>

<div>
  {#if $location.pathname.startsWith('/user')}
    <div class="bg-surface-900 flex" style="height: calc(100vh - 48px);">
      <!-- Sidebar - no longer passing data prop -->
      <div class="max-w-[266px] min-w-[266px]">
        <UsersSideNav />
      </div>

      <!-- Nested Route Content -->
      <div class="w-[100%] overflow-auto p-4">
        <Router>
          <Route path="users-dashboard" component={UserDashboard} />
          <Route path="users-overview" component={UserOverview} />
        </Router>
      </div>
    </div>
  {/if}
</div>
