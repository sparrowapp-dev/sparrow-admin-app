<script lang="ts">
  import { Router, Route, Link, useLocation } from 'svelte-routing';
  import Workspace from './Workspace/Workspace.svelte';
  import Settings from './Settings/Settings.svelte';
  import Members from './Members/Members.svelte';
  import HubsSideNav from '@/components/HubsSideNav/HubsSideNav.svelte';
  import HubsOverview from './Overview/HubsOverview.svelte';
  import Breadcrumbs from '@/components/Breadcrumbs/Breadcrumbs.svelte';

  const location = useLocation();
</script>

<div>
  {#if $location.pathname.startsWith('/hubs/workspace') || $location.pathname.startsWith('/hubs/settings') || $location.pathname.startsWith('/hubs/members')}
    <div class="bg-surface-900 flex" style="height: calc(100vh - 48px);">
      <!-- Sidebar - no longer passing data prop -->
      <div class="max-w-[266px] min-w-[266px]">
        <HubsSideNav />
      </div>

      <!-- Nested Route Content -->
      <div class="w-[100%] overflow-auto p-4">
        <Breadcrumbs />
        <Router>
          <Route path="workspace/:id" component={Workspace} />
          <Route path="settings/:id" component={Settings} />
          <Route path="members/:id" component={Members} />
        </Router>
      </div>
    </div>
  {:else}
    <div class="">
      <HubsOverview />
    </div>
  {/if}
</div>
