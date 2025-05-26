<script lang="ts">
  import { onMount } from 'svelte';
  import GiftIcon from '@/assets/icons/GiftIcon.svelte';
  import Dropdown from '../ReusableDropdown/Dropdown.svelte';
  import { Link, navigate, useLocation } from 'svelte-routing';
  import { createQuery } from '@/services/api.common';
  import { hubsService } from '@/services/hubs.service';

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
  export let link = '/hubs';
  export let options = [
    { label: 'Workspaces', id: 'workspace' },
    { label: 'Members', id: 'members' },
    { label: 'Settings', id: 'settings' },
  ];
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

  $: activeId = options.find((opt) => currentPath.includes(`/${opt.id}`))?.id || null;

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
          {#each options as option}
            <Link
              to={`${link}/${option.id}/${selectOption.teamId}`}
              class="{activeId === option.id
                ? 'bg-surface-500'
                : ''} font-inter font-fw-ds-400 text-fs-ds-12 leading-lh-ds-130 hover:bg-surface-500 cursor-pointer rounded-sm p-3 text-neutral-50 "
            >
              {option.label}
            </Link>
          {/each}
        {/if}
      </nav>
    {/if}
  </div>
</section>
