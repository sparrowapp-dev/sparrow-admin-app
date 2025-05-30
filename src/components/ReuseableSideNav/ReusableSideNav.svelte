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

  export let link: string;
  export let options: Array<{ label: string; id: string }>;
  export let placeholder: string;
  export let pathMatcher: (path: string, dropdownOptions: any[]) => { selectOption: Team | null };
  export let selectOption: Team | null = null;
  export let isDropdownRequired = true;
  let dropdownOpen = false;
  let dropdownOptions: Array<any> = [];
  const location = useLocation();
  let currentPath = '';

  $: if ($location) {
    currentPath = $location.pathname || '';
  }

  $: activeId = options.find((opt) => currentPath.includes(`/${opt.id}`))?.id || null;

  const { data, isFetching, isError, refetch } = createQuery<ApiResponse>(() =>
    hubsService.getAllHubs(),
  );
  $: {
    if ($data?.data?.length) {
      dropdownOptions = $data.data.map((team) => ({
        id: team.teamId,
        label: team.teamName || '',
        value: team,
        plan: null,
      }));
    } else {
      dropdownOptions = [];
    }
  }
  export function handleSelection(val: Team) {
    selectOption = val;
    if (val?.teamId) {
      navigate(`${link}/${options[0].id}/${val.teamId}`);
    }
  }
  $: {
    if (!selectOption && dropdownOptions.length && $location) {
      const { selectOption: newSelection } = pathMatcher($location.pathname, dropdownOptions);
      if (newSelection) {
        selectOption = newSelection;
      }
    }
  }
</script>

<section class="bg-surface-700 h-full w-full rounded-r-xl p-3">
  <div class="flex flex-col gap-3">
    {#if isDropdownRequired}
      <div class="border-surface-100 border-b pb-3">
        <Dropdown
          bind:open={dropdownOpen}
          icon={GiftIcon}
          label={{
            label: selectOption?.teamName ? selectOption?.teamName : placeholder,
            id: selectOption?.teamId || '',
          }}
          options={dropdownOptions}
          onSelect={handleSelection}
          selected={{
            label: selectOption?.teamName,
            id: selectOption?.teamId || '',
          }}
        />
      </div>{/if}
    {#if selectOption}
      <nav class="flex flex-col gap-0.5 p-2">
        {#if !dropdownOpen}
          {#each options as option}
            <Link
              to={`${link}/${option.id}/${selectOption.teamId}`}
              class="{activeId === option.id
                ? 'bg-surface-500'
                : ''} font-inter font-fw-ds-400 text-fs-ds-12 leading-lh-ds-130 hover:bg-surface-500 cursor-pointer rounded-sm p-3 text-neutral-50 focus-within:outline-2 focus-within:outline-blue-300"
            >
              {option.label}
            </Link>
          {/each}
        {/if}
      </nav>
    {:else}
      <div class="flex w-full items-center justify-center">
        <CircularLoader />
      </div>
    {/if}
  </div>
</section>
