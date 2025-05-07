<script lang="ts">
  import { Router, Route, Link, useLocation } from 'svelte-routing';
  import Workspace from './Workspace/Workspace.svelte';
  import Settings from './Settings/Settings.svelte';
  import Members from './Members/Members.svelte';
  import OptionalSideNav from '@/components/OptionalSideNav/OptionalSideNav.svelte';

  const location = useLocation();
</script>

<div>
  {#if $location.pathname.startsWith('/hubs/workspace') || $location.pathname.startsWith('/hubs/settings') || $location.pathname.startsWith('/hubs/members')}
    <div class="bg-surface-900 flex" style="height: calc(100vh - 48px);">
      <!-- Sidebar -->
      <div class="w-[266px]">
        <OptionalSideNav />
      </div>

      <!-- Nested Route Content -->
      <div class="p-4">
        <Router>
          <Route path="workspace/:id" component={Workspace} />
          <Route path="settings/:id" component={Settings} />
          <Route path="members/:id" component={Members} />
        </Router>
      </div>
    </div>
  {:else}
    <!-- If no child path matched, render main page -->
    <div class="p-2 text-gray-600">Select a Hub section to continue.</div>
    <nav class="p-2">
      <Link to="/hubs/workspace/123">Workspace</Link> |
      <Link to="/hubs/settings/abc">Settings</Link> |
      <Link to="/hubs/members/test">Members</Link>
    </nav>
  {/if}
</div>
