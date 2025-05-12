<script lang="ts">
  import EditIcon from '@/assets/icons/EditIcon.svelte';
  import ManageMembersIcon from '@/assets/icons/ManageMembersIcon.svelte';
  import UpgradeStandardIcon from '@/assets/icons/UpgradeStandardIcon.svelte';
  import { navigate } from 'svelte-routing';
  import { onMount, onDestroy } from 'svelte';

  export let row;

  let isOpen = false;
  let openUp = false;
  let triggerEl: HTMLButtonElement;
  let dropdownEl: HTMLDivElement;

  function toggleDropdown() {
    if (!isOpen) {
      window.dispatchEvent(new CustomEvent('close-all-dropdowns'));

      // Wait for DOM to render
      requestAnimationFrame(() => {
        if (triggerEl && dropdownEl) {
          const triggerRect = triggerEl.getBoundingClientRect();
          const dropdownHeight = dropdownEl.offsetHeight * 1.8;
          const spaceBelow = window.innerHeight - triggerRect.bottom;
          const spaceAbove = triggerRect.top;

          openUp = spaceBelow < dropdownHeight && spaceAbove > dropdownHeight;
        }
      });
    }

    isOpen = !isOpen;
  }

  function closeDropdown() {
    isOpen = false;
  }

  function handleManageHub(hub) {
    navigate(`/hubs/settings/${hub._id}`);
    closeDropdown();
  }

  function handleManageMembers(hub) {
    navigate(`/hubs/members/${hub._id}`);
    closeDropdown();
  }

  function handleUpgrade(hub) {
    closeDropdown();
  }

  onMount(() => {
    window.addEventListener('close-all-dropdowns', closeDropdown);
  });

  onDestroy(() => {
    window.removeEventListener('close-all-dropdowns', closeDropdown);
  });
  const launchUrl = import.meta.env.VITE_SPARROW_LAUNCH_URL;
  function handleLaunch() {
    window.open(`${launchUrl}`, '_blank');
  }
</script>

<div class="relative flex items-center justify-end gap-4">
  <button
    class="font-inter text-fs-ds-12 font-regular leading-lh-ds-130 z-10
           cursor-pointer text-blue-300 opacity-0 transition-opacity
           duration-200 group-hover:opacity-100 hover:underline"
    data-action="launch"
    on:click|stopPropagation={handleLaunch}
    data-hub-id={row.original._id}
  >
    Launch in Sparrow
  </button>
  <div class="relative">
    <button
      bind:this={triggerEl}
      class="cursor-pointer rounded-md p-2 text-neutral-300 transition-colors duration-200 hover:text-neutral-50"
      on:click|stopPropagation={toggleDropdown}
      aria-label="More actions"
    >
      {#if typeof row.original.renderThreeDotsIcon === 'function'}
        {@html row.original.renderThreeDotsIcon()}
      {:else}
        ⋮
      {/if}
    </button>

    {#if isOpen}
      <div
        bind:this={dropdownEl}
        class={`bg-surface-600 absolute right-0 z-50 w-48 rounded-md shadow-lg ${openUp ? 'bottom-full mb-2' : 'mt-2'}`}
      >
        <div class="flex flex-col gap-1 py-1">
          <button
            class="hover:bg-surface-300 flex w-full items-center gap-2 px-2 py-1 text-neutral-50"
            on:click={() => handleManageHub(row.original)}
          >
            <EditIcon />
            <h2>Manage Hub</h2>
          </button>

          <button
            class="hover:bg-surface-300 flex w-full items-center gap-2 px-2 py-1 text-neutral-50"
            on:click={() => handleManageMembers(row.original)}
          >
            <ManageMembersIcon />
            <h2>Manage Members</h2>
          </button>

          <button
            class="hover:bg-surface-300 flex w-full items-center gap-2 px-2 py-1 text-neutral-50"
            on:click={() => handleUpgrade(row.original)}
          >
            <UpgradeStandardIcon />
            <h2>Upgrade to Standard</h2>
          </button>
        </div>
      </div>
    {/if}
  </div>
</div>

<style>
  h2 {
    font-size: 0.875rem;
    font-weight: 500;
  }

  .bg-surface-600 {
    background-color: #2f2f2f; /* Adjust as per your theme */
  }

  .hover\:bg-surface-300:hover {
    background-color: #3f3f3f; /* Adjust as per your theme */
  }

  .text-neutral-50 {
    color: #fafafa;
  }

  .text-neutral-300 {
    color: #d4d4d4;
  }
</style>
