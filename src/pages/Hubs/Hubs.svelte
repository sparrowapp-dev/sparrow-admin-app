<script lang="ts">
  import { Router, Route, Link, useLocation } from 'svelte-routing';
  import Workspace from './Workspace/Workspace.svelte';
  import Settings from './Settings/Settings.svelte';
  import Members from './Members/Members.svelte';
  import HubsSideNav from '@/components/HubsSideNav/HubsSideNav.svelte';
  import HubsOverview from './Overview/HubsOverview.svelte';
  import Breadcrumbs from '@/components/Breadcrumbs/Breadcrumbs.svelte';
  import WorkSpaceOverview from './WorkSpaceOverview/WorkSpaceOverview.svelte';
  import { createQuery } from '@/services/api.common';
  import { hubsService } from '@/services/hubs.service';
  import ReusableSideNav from '@/components/ReuseableSideNav/ReusableSideNav.svelte';
  import { tweened } from 'svelte/motion';
  import { cubicOut } from 'svelte/easing';

  interface Team {
    teamId: string;
    teamName: string;
    role: string;
    workspaces: any[];
    users: any[];
  }

  interface ApiResponse {
    data: Team[];
  }

  interface DropdownOption {
    label: string;
    value: Team;
    plan: string | null;
  }

  let dropdownOptions: Array<DropdownOption> = [];

  const location = useLocation();
  // queries
  const { data, isFetching, isError, refetch } = createQuery<ApiResponse>(() =>
    hubsService.getAllHubs(),
  );

  $: {
    if ($data && $data?.data?.length > 0) {
      dropdownOptions = $data.data.map((team) => ({
        label: team?.teamName || '',
        value: team,
        plan: null,
      }));
    } else {
      dropdownOptions = [];
    }
  }
  $: hubId = (() => {
    const path = $location.pathname;
    if (path.startsWith('/hubs/workspace/')) return path.split('/')[3];
    if (path.startsWith('/hubs/settings/')) return path.split('/')[3];
    if (path.startsWith('/hubs/members/')) return path.split('/')[3];
    return null;
  })();

  const {
    data: hubData,
    refetch: hubsDataRefetch,
    isFetching: HubsDataFetching,
  } = createQuery(async () => {
    return hubsService.getHubDetails(hubId);
  });

  $: if (hubId) {
    hubsDataRefetch();
  }
  $: topBannerShow =
    ($location.pathname.startsWith('/hubs/workspace') ||
      $location.pathname.startsWith('/hubs/settings') ||
      $location.pathname.startsWith('/hubs/members')) &&
    $hubData?.data?.plan?.name === 'Community';

  const hubsPathMatcher = (pathname: string, dropdownOptions: any[]) => {
    let currentId;

    const workspaceDetailsMatch = pathname.match(/\/hubs\/workspace-details\/([^\/]+)\/([^\/]+)/);

    if (workspaceDetailsMatch) {
      currentId = workspaceDetailsMatch[2];
    } else {
      const match = pathname.match(/\/hubs\/(?:workspace|settings|members)\/([^\/]+)/);
      currentId = match?.[1];
    }

    if (currentId) {
      const foundTeam = dropdownOptions.find((team) => team?.value?.teamId === currentId);
      if (foundTeam) {
        return { currentId, selectOption: foundTeam?.value };
      }
    }

    return { currentId: null, selectOption: null };
  };

  // Animation stores for sidebar slide-in effect
  let sidebarOpacity;
  let sidebarTranslateX;
  let hasOpened = false;

  $: if (
    ($location.pathname.startsWith('/hubs/workspace') ||
      $location.pathname.startsWith('/hubs/settings') ||
      $location.pathname.startsWith('/hubs/members')) &&
    !hasOpened
  ) {
    sidebarOpacity = tweened(0, {
      duration: 500,
      easing: cubicOut,
    });

    sidebarTranslateX = tweened(-100, {
      duration: 500,
      easing: cubicOut,
    });

    setTimeout(() => {
      sidebarOpacity.set(1);
      sidebarTranslateX.set(0);
    }, 150);
    hasOpened = true;
  } else if (
    hasOpened &&
    !(
      $location.pathname.startsWith('/hubs/workspace') ||
      $location.pathname.startsWith('/hubs/settings') ||
      $location.pathname.startsWith('/hubs/members')
    )
  ) {
    hasOpened = false;
  }
</script>

<div>
  {#if $location.pathname.startsWith('/hubs/workspace') || $location.pathname.startsWith('/hubs/settings') || $location.pathname.startsWith('/hubs/members')}
    <div
      class="bg-surface-900 flex"
      style={topBannerShow ? 'height: calc(100vh - 68px);' : 'height: calc(100vh - 48px);'}
    >
      <!-- Sidebar with spring-in animation -->
      <div
        class="max-w-[266px] min-w-[266px]"
        style="
          transform: translateX({$sidebarTranslateX}px);
          opacity: {$sidebarOpacity};
        "
      >
        <ReusableSideNav
          link={'/hubs'}
          options={[
            { label: 'Workspaces', id: 'workspace' },
            { label: 'Members', id: 'members' },
            { label: 'Settings', id: 'settings' },
          ]}
          placeholder={'Select your Hub'}
          pathMatcher={hubsPathMatcher}
        />
      </div>

      <!-- Nested Route Content -->
      <div class="w-[100%] overflow-auto p-4">
        <Breadcrumbs />
        <Router>
          <Route path="workspace/:id" component={Workspace} />
          <Route path="settings/:id" component={Settings} />
          <Route path="members/:id" component={Members} />
          <Route path="workspace-details/:id/:id" component={WorkSpaceOverview} />
        </Router>
      </div>
    </div>
  {:else}
    <div class="bg-surface-900 flex p-4" style="height: calc(100vh - 48px);">
      <HubsOverview />
    </div>
  {/if}
</div>
