<script lang="ts">
  import { onMount } from 'svelte';
  import GiftIcon from '@/assets/icons/GiftIcon.svelte';
  import Dropdown from '../ReusableDropdown/Dropdown.svelte';
  import { Link, navigate } from 'svelte-routing';

  interface Team {
    teamId: string;
    teamName: string;
    plan: string;
  }

  export let data: Array<any>;
  let dropdownOpen = false;
  let selectOption: Team | null = null;

  //navigate when a selection is made
  function handleSelection(val: any) {
    selectOption = val;

    if (selectOption) {
      navigate(`/hubs/workspace/${val.teamId}`);
    }
  }

  // reactively update selected value if id is present in query
  $: if (!selectOption && data.length > 0) {
    const match = location.pathname.match(/\/hubs\/(?:workspace|settings|members)\/([^\/]+)/);
    const currentId = match?.[1];

    const foundTeam = data.find((team) => team?.value?.teamId === currentId);

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
        options={data}
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
