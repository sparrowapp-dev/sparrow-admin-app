<script lang="ts">
  import { Router, Route, Link, useLocation } from 'svelte-routing';
  import Workspace from './Workspace/Workspace.svelte';
  import Settings from './Settings/Settings.svelte';
  import Members from './Members/Members.svelte';
  import { createQuery } from '@/services/api.common';
  import { hubsService } from '@/services/hubs.service';
  import HubsSideNav from '@/components/HubsSideNav/HubsSideNav.svelte';
  import HubsOverview from './Overview/HubsOverview.svelte';

  let dropdownOptions: Array<any>;

  const location = useLocation();
  // queries
  const { data, isFetching, isError } = createQuery(() => hubsService.getAllHubs());

  $: {
    if ($data && $data?.length > 0) {
      dropdownOptions = $data.map((team) => ({
        label: team?.teamName,
        value: team,
        plan: team?.plan || null,
      }));
    } else {
      dropdownOptions = [];
    }
  }
</script>

<div>
  {#if $location.pathname.startsWith('/hubs/workspace') || $location.pathname.startsWith('/hubs/settings') || $location.pathname.startsWith('/hubs/members')}
    <div class="bg-surface-900 flex" style="height: calc(100vh - 48px);">
      <!-- Sidebar -->
      <div class="max-w-[266px] min-w-[266px]">
        <HubsSideNav data={dropdownOptions ?? []} />
      </div>

      <!-- Nested Route Content -->
      <div class="overflow-auto p-4">
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
