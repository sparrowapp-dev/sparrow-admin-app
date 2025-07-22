<script lang="ts">
  import { onMount } from 'svelte';
  import GiftIcon from '@/assets/icons/GiftIcon.svelte';
  import Dropdown from '../ReusableDropdown/Dropdown.svelte';
  import { Link, navigate, useLocation } from 'svelte-routing';
  import { createQuery } from '@/services/api.common';
  import { hubsService } from '@/services/hubs.service';
  import CircularLoader from '@/ui/CircularLoader/CircularLoader.svelte';
  import { hubDetailsRefreshTrigger } from '@/store/hubs';
  import { onDestroy } from 'svelte';
  import { captureEvent } from '@/utils/posthogConfig';

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
  $: if ($data?.data?.length) {
    dropdownOptions = $data.data.map((team) => ({
      id: team.teamId,
      label: team.teamName || '',
      value: team,
      plan: null,
    }));
  } else {
    dropdownOptions = [];
  }

  export function handleSelection(val: Team) {
    selectOption = val;
    if (val?.teamId) {
      navigate(`${link}/${options[0].id}/${val.teamId}`);
    }
    captureUserDropdownHubClick(val.teamName,dropdownOptions);
  }
  $: if (dropdownOptions.length && $location) {
    const { selectOption: newSelection } = pathMatcher($location.pathname, dropdownOptions);
    if (newSelection) {
      selectOption = newSelection;
    }
  }

  // Subscribe to hub details refresh trigger
  let unsubscribe = hubDetailsRefreshTrigger.subscribe((value) => {
    if (value > 0) {
      refetch();
    }
  });
  let dropdownRef: HTMLDivElement | null = null;
  function handleOutsideClick(event: MouseEvent) {
    if (dropdownOpen && dropdownRef && !dropdownRef.contains(event.target as Node)) {
      dropdownOpen = false;
    }
  }

  onDestroy(() => {
    if (unsubscribe) unsubscribe();
  });
  onMount(() => {
    document.addEventListener('click', handleOutsideClick, true);
    return () => {
      document.removeEventListener('click', handleOutsideClick, true);
    };
  });

  const captureUserDropdownHubClick = (selectOption:string, hubs:any) =>{
    const allHubs = hubs.map(item => ({ label: item.label }));
    const eventProperties = {
      type_filter:selectOption,
      hub_list:allHubs
    }
    captureEvent("admin_user_management_dropdown-clicked", eventProperties);
  }

  const captureUserViewInvoicesRedirect = () =>{
    const eventProperties = {
      source_location:"Billing side panel",
    }
    captureEvent("admin_view_invoices_clicked", eventProperties);
  }
</script>

<section class="bg-surface-700 h-full w-full rounded-r-xl p-3">
  <div class="flex flex-col gap-3" bind:this={dropdownRef}>
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
              on:click={()=>{
                if(option.id === "billingInvoices"){
                  captureUserViewInvoicesRedirect()
                }
              }}
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
