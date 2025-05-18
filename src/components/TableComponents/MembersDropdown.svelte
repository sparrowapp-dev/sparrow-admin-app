<script lang="ts">
  import EditIcon from '@/assets/icons/EditIcon.svelte';
  import ManageMembersIcon from '@/assets/icons/ManageMembersIcon.svelte';
  import { navigate } from 'svelte-routing';
  import { onMount, onDestroy, tick, createEventDispatcher } from 'svelte';
  import Tooltip from '../Tooltip/Tooltip.svelte';
  import RemoveUsers from '@/assets/icons/RemoveUsers.svelte';

  export let row;
  export let modalVariants;
  export let handleshowModal;
  export let onClick;
  let isOpen = false;
  let openUp = false;
  let triggerEl: HTMLButtonElement;
  let dropdownEl: HTMLDivElement;
  let position = { top: 0, left: 0, width: 0 };
  const dispatch = createEventDispatcher();

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

  function handleChangeRole(event) {
    event.stopPropagation();
    onClick({ data: row?.original, click: 'changeRole' });

    closeDropdown();
  }
  function handleRemoveUser(event) {
    event.stopPropagation();
    onClick({ data: row.original, click: 'removeUser' });

    closeDropdown();
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
</script>

<!-- Dropdown trigger -->
<div class="relative flex items-center justify-end">
  <Tooltip text={'Show Actions'} position={'top'} mode="hover" size="xs">
    {#if row.original.role !== 'Owner'}
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
      </button>{/if}
  </Tooltip>
</div>

<!-- Dropdown menu - use portal to avoid clipping issues -->
{#if isOpen}
  <div
    bind:this={dropdownEl}
    class="fixed z-[999] shadow-xl"
    style="top: {position.top}px; left: {position.left}px; width: {position.width || 160}px;"
    on:click|stopPropagation
  >
    <div class="bg-surface-600 flex flex-col gap-1 overflow-hidden rounded-sm px-1 py-1">
      <button
        class="hover:bg-surface-300 flex w-full cursor-pointer items-center gap-2 px-2 py-2 text-neutral-50 hover:rounded"
        on:click={(e) => handleChangeRole(e)}
      >
        <EditIcon />
        <h2 class="text-fs-ds-12 font-fw-ds-400">Change Role</h2>
      </button>

      <button
        class="hover:bg-surface-300 flex w-full cursor-pointer items-center gap-2 px-2 py-2 text-neutral-50 hover:rounded"
        on:click={(e) => handleRemoveUser(e)}
      >
        <RemoveUsers />
        <h2 class="text-fs-ds-12 font-regular font-fw-ds-400 text-red-300">Remove User</h2>
      </button>
    </div>
  </div>
{/if}
