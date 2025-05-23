<script lang="ts">
  import { onMount } from 'svelte';
  import GiftIcon from '@/assets/icons/GiftIcon.svelte';
  import Dropdown from '../ReusableDropdown/Dropdown.svelte';
  import { Link, navigate, useLocation } from 'svelte-routing';
  import { createQuery } from '@/services/api.common';
  import { hubsService } from '@/services/hubs.service';
  import CircularLoader from '@/ui/CircularLoader/CircularLoader.svelte';

  interface Team {
    teamId: string;
    teamName: string;
    plan: string;
    role: string;
    workspaces: any[];
    users: any[];
  }

  interface ApiResponse {
    data: Team[];
  }

  let dropdownOpen = false;
  let selectOption: Team | null = null;
  let dropdownOptions: Array<any> = [];

  // Get current location for active link highlighting with proper typing
  const location: any = useLocation();

  // Get current path safely
  let currentPath = '';
  $: if ($location) {
    currentPath = $location.pathname || '';
  }

  // Determine which nav section is active
  $: isWorkspaceActive = currentPath.includes('/workspace/');
  $: isMembersActive = currentPath.includes('/members/');
  $: isSettingsActive = currentPath.includes('/settings/');

  // Move API call here
  const { data, isFetching, isError, refetch } = createQuery<ApiResponse>(() =>
    hubsService.getAllHubs(),
  );

  // Transform data into dropdown options
  $: {
    if ($data && $data?.data?.length > 0) {
      dropdownOptions = $data.data.map((team) => {
        return {
          id: team?.teamId,
          label: team?.teamName || '',
          value: team,
          plan: null,
        };
      });
    } else {
      dropdownOptions = [];
    }
  }

  // Navigate when a selection is made
  function handleSelection(val: any) {
    selectOption = val;

    if (val?.teamId) {
      navigate(`/hubs/workspace/${val.teamId}`);
    }
  }

  // reactively update selected value if id is present in query
  $: {
    if (!selectOption && dropdownOptions.length > 0 && $location) {
      let currentId;

      const workspaceDetailsMatch = $location.pathname.match(
        /\/hubs\/workspace-details\/([^\/]+)\/([^\/]+)/,
      );

      if (workspaceDetailsMatch) {
        currentId = workspaceDetailsMatch[2];
      } else {
        const match = $location.pathname.match(/\/hubs\/(?:workspace|settings|members)\/([^\/]+)/);
        currentId = match?.[1];
      }

      if (currentId) {
        const foundTeam = dropdownOptions.find((team) => team?.value?.teamId === currentId);
        if (foundTeam) {
          selectOption = foundTeam?.value;
        }
      }
    }
  }
</script>

<section class="bg-surface-700 h-full w-full rounded-r-xl p-3">
  <div class="flex flex-col gap-3">
    <div class="border-surface-100 border-b pb-3">
      <Dropdown
        bind:open={dropdownOpen}
        icon={GiftIcon}
        label={{
          label: selectOption?.teamName ? selectOption?.teamName : 'Select your Hub',
          id: selectOption?.teamId || '',
        }}
        options={dropdownOptions}
        onSelect={handleSelection}
      />
    </div>
    {#if selectOption}
      <nav class="flex flex-col gap-0.5 p-2">
        {#if !dropdownOpen}
          <Link
            to={`/hubs/workspace/${selectOption.teamId}`}
            class="font-inter font-fw-ds-400 text-fs-ds-12 leading-lh-ds-130 hover:bg-surface-500 cursor-pointer rounded-sm p-3 text-neutral-50 {isWorkspaceActive
              ? 'bg-surface-500'
              : ''}"
          >
            Workspaces
          </Link>
          <Link
            to={`/hubs/members/${selectOption.teamId}`}
            class="font-inter font-fw-ds-400 text-fs-ds-12 leading-lh-ds-130 hover:bg-surface-500 cursor-pointer rounded-sm p-3 text-neutral-50 {isMembersActive
              ? 'bg-surface-500'
              : ''}"
          >
            Members
          </Link>
          <Link
            to={`/hubs/settings/${selectOption.teamId}`}
            class="font-inter font-fw-ds-400 text-fs-ds-12 leading-lh-ds-130 hover:bg-surface-500 cursor-pointer rounded-sm p-3 text-neutral-50 {isSettingsActive
              ? 'bg-surface-500'
              : ''}"
          >
            Settings
          </Link>
        {/if}
      </nav>
    {:else}
      <div class="flex w-full items-center justify-center">
        <CircularLoader />
      </div>
    {/if}
  </div>
</section>
