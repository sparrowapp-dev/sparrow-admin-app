<script lang="ts">
  import EditIcon from '@/assets/icons/EditIcon.svelte';
  import ManageMembersIcon from '@/assets/icons/ManageMembersIcon.svelte';
  import UpgradeStandardIcon from '@/assets/icons/UpgradeStandardIcon.svelte';
  import { navigate } from 'svelte-routing';
  import { onMount, onDestroy, tick } from 'svelte';
  import Tooltip from '../Tooltip/Tooltip.svelte';
  import { captureEvent } from '@/utils/posthogConfig';

  export let row;

  let isOpen = false;
  let openUp = false;
  let triggerEl: HTMLButtonElement;
  let dropdownEl: HTMLDivElement;
  let position = { top: 0, left: 0, width: 0 };

  async function toggleDropdown(event) {
    // Stop propagation to prevent the row click event
    event.stopPropagation();

    if (!isOpen) {
      // Close other dropdowns first
      window.dispatchEvent(new CustomEvent('close-all-dropdowns'));

      // Set to open
      isOpen = true;

      // Wait for the dropdown to be rendered
      await tick();

      // Calculate position after the dropdown is in the DOM
      calculatePosition();
    } else {
      isOpen = false;
    }
  }

  function calculatePosition() {
    if (!triggerEl || !dropdownEl) return;

    const triggerRect = triggerEl.getBoundingClientRect();
    const dropdownHeight = dropdownEl.offsetHeight;
    const dropdownWidth = dropdownEl.offsetWidth;
    const spaceBelow = window.innerHeight - triggerRect.bottom;
    const spaceRight = window.innerWidth - triggerRect.right;

    // Determine if dropdown should open upward
    openUp = spaceBelow < dropdownHeight + 5;

    // Calculate position
    position = {
      top: openUp ? triggerRect.top - dropdownHeight - 5 : triggerRect.bottom + 5,
      left:
        spaceRight < dropdownWidth
          ? triggerRect.right - dropdownWidth
          : triggerRect.right - dropdownWidth + 30,
      width: dropdownWidth,
    };
  }

  function closeDropdown() {
    isOpen = false;
  }

  function handleManageHub(event, hub) {
    event.stopPropagation();
    captureDropdownSelect("Manage Hub");
    navigate(`/hubs/settings/${hub._id || hub.id}`);
    closeDropdown();
  }

  function handleManageMembers(event, hub) {
    event.stopPropagation();
    captureDropdownSelect("Manage Members");
    navigate(`/hubs/members/${hub._id || hub.id}`);
    closeDropdown();
  }

  function handleUpgrade(event, hub) {
    event.stopPropagation();
    navigate(`/billing/billingOverview/${hub?._id}`);
    // Your upgrade logic here
    // closeDropdown();
  }

  function handleClickOutside(event) {
    if (
      isOpen &&
      triggerEl &&
      !triggerEl.contains(event.target) &&
      dropdownEl &&
      !dropdownEl.contains(event.target)
    ) {
      closeDropdown();
    }
  }

  onMount(() => {
    // Handle global events
    document.addEventListener('click', handleClickOutside);
    window.addEventListener('close-all-dropdowns', closeDropdown);
    window.addEventListener('scroll', closeDropdown, true);
  });

  onDestroy(() => {
    document.removeEventListener('click', handleClickOutside);
    window.removeEventListener('close-all-dropdowns', closeDropdown);
    window.removeEventListener('scroll', closeDropdown, true);
  });

  function getNextTier(currentPlan) {
    const planHierarchy = {
      Community: 'Standard',
      Standard: 'Professional',
      Professional: 'Enterprise',
      Enterprise: null,
    };
    return planHierarchy[currentPlan] || 'Standard';
  }

  $: nextTier = getNextTier(row.original.plan?.name || 'Community');

  
  const captureDropdownSelect = (selectName:string) =>{
    const eventProperties = {
      event_source : "admin_panel",
      select_type: selectName
    }
    captureEvent("hub_row_actions_clicked", eventProperties);
  }
</script>

<div class="relative flex items-center justify-end gap-4">
  <Tooltip text={'Show Actions'} position={'top'} mode="hover" size="xs">
    <button
      bind:this={triggerEl}
      class="hover:bg-surface-300 cursor-pointer rounded px-3.5 py-2 text-neutral-300 transition-colors duration-200 hover:text-neutral-50"
      on:click={toggleDropdown}
      aria-label="More actions"
      aria-haspopup="true"
      aria-expanded={isOpen}
      data-action="toggle-menu"
    >
      {#if typeof row.original.renderThreeDotsIcon === 'function'}
        {@html row.original.renderThreeDotsIcon()}
      {:else}
        ⋮
      {/if}
    </button>
  </Tooltip>
</div>

<!-- Dropdown menu - use fixed positioning to avoid clipping issues -->
{#if isOpen}
  <div
    bind:this={dropdownEl}
    class="fixed z-[999] shadow-xl"
    style="top: {position.top}px; left: {position.left}px; width: {position.width || 180}px;"
    on:click|stopPropagation
  >
    <div class="bg-surface-600 flex flex-col gap-1 overflow-hidden rounded-sm px-1 py-1">
      <button
        class="hover:bg-surface-300 flex w-full cursor-pointer items-center gap-2 px-2 py-2 text-neutral-50 hover:rounded"
        on:click={(e) => handleManageHub(e, row.original)}
      >
        <EditIcon />
        <h2 class="text-fs-ds-12 font-regular">Manage Hub</h2>
      </button>

      <button
        class="hover:bg-surface-300 flex w-full cursor-pointer items-center gap-2 px-2 py-2 text-neutral-50 hover:rounded"
        on:click={(e) => handleManageMembers(e, row.original)}
      >
        <ManageMembersIcon />
        <h2 class="text-fs-ds-12 font-regular">Manage Members</h2>
      </button>

      <button
        class="hover:bg-surface-300 flex w-full items-center gap-2 px-2 py-2 text-neutral-50 hover:rounded"
        on:click={(e) =>{
          handleUpgrade(e, row.original) 
          captureDropdownSelect(`Upgrade to ${nextTier}`);}
        }
        ><span> <UpgradeStandardIcon /></span>

        <h2 class="text-fs-ds-12 font-regular cursor-pointer">
          {#if nextTier}
            Upgrade to {nextTier}
          {/if}
        </h2>
      </button>
    </div>
  </div>
{/if}
