<script lang="ts">
  import { onMount } from 'svelte';
  import GiftIcon from '@/assets/icons/GiftIcon.svelte';
  import Dropdown from '../ReusableDropdown/Dropdown.svelte';
  import { Link, navigate } from 'svelte-routing';
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

  let dropdownOpen = false;
  let selectOption: Team | null = null;
  let dropdownOptions: Array<any>;

  // Move API call here
  const { data, isFetching, isError, refetch } = createQuery<ApiResponse>(() =>
    hubsService.getAllHubs(),
  );

  // Transform data into dropdown options
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

  //navigate when a selection is made
  function handleSelection(val: any) {
    selectOption = val;

    if (selectOption) {
      navigate(`/hubs/workspace/${val.teamId}`);
    }
  }

  // reactively update selected value if id is present in query
  $: if (!selectOption && dropdownOptions.length > 0) {
    const match = location.pathname.match(/\/hubs\/(?:workspace|settings|members)\/([^\/]+)/);
    const currentId = match?.[1];

    const foundTeam = dropdownOptions.find((team) => team?.value?.teamId === currentId);

    if (foundTeam) {
      selectOption = foundTeam?.value;
    }
  }
</script>

<section class="bg-surface-700 h-full w-full rounded-r-xl p-3">
  <div class="flex flex-col gap-3">
    <div class="border-surface-100 border-b pb-3">
      <Dropdown
        bind:open={dropdownOpen}
        icon={GiftIcon}
        label={selectOption?.teamName ? selectOption?.teamName : 'Select your Hub'}
        options={dropdownOptions}
        onSelect={handleSelection}
      />
    </div>
    {#if selectOption}
      <nav class="flex flex-col gap-0.5 p-2">
        {#if !dropdownOpen}
          <Link
            to={`/hubs/workspace/${selectOption.teamId}`}
            class="font-inter font-fw-ds-400 text-fs-ds-12 leading-lh-ds-130 hover:bg-surface-500 cursor-pointer rounded-sm p-3 text-neutral-50"
          >
            Workspace
          </Link>
          <Link
            to={`/hubs/members/${selectOption.teamId}`}
            class="font-inter font-fw-ds-400 text-fs-ds-12 leading-lh-ds-130 hover:bg-surface-500 cursor-pointer rounded-sm p-3 text-neutral-50"
          >
            Members
          </Link>
          <Link
            to={`/hubs/settings/${selectOption.teamId}`}
            class="font-inter font-fw-ds-400 text-fs-ds-12 leading-lh-ds-130 hover:bg-surface-500 cursor-pointer rounded-sm p-3 text-neutral-50"
          >
            Settings
          </Link>
        {/if}
      </nav>
    {/if}
  </div>
</section>
