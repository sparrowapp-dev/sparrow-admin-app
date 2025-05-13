<script lang="ts">
  import Inviteicon from '@/assets/icons/Inviteicon.svelte';
  import PrivateIcon from '@/assets/icons/PrivateIcon.svelte';
  import ThreeDotsVerticalIcon from '@/assets/icons/ThreeDotsVerticalIcon.svelte';
  import StatCard from './StatCard.svelte';
  import { onMount, onDestroy } from 'svelte';
  import EditIcon from '@/assets/icons/EditIcon.svelte';
  import LaunchInSparrow from '@/assets/icons/LaunchInSparrow.svelte';
  import DeleteIcon from '@/assets/icons/DeleteIcon.svelte';
  import MakeitPublic from '@/assets/icons/MakeitPublic.svelte';

  export let topdata;
  const stats = [
    { label: 'Total Contributors', value: topdata.totalContributors },
    { label: 'Total Collections', value: topdata.totalCollections },
    { label: 'Total Test Flows', value: topdata.totalTestFLows },
    { label: 'Total Environments', value: topdata.totalEnvironments },
  ];

  // Dropdown state management
  let isOpen = false;
  let openUp = false;
  let triggerEl: HTMLDivElement;
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

  // Dropdown action handlers
  function handleEditWorkspace() {
    // Add your edit workspace functionality here
    console.log('Edit workspace clicked');
    closeDropdown();
  }

  function launchinSparrow() {
    // Add your duplicate workspace functionality here

    closeDropdown();
  }
  function handleMakeItPublic() {
    closeDropdown();
  }

  function handleDeleteWorkspace() {
    // Add your delete workspace functionality here
    console.log('Delete workspace clicked');
    closeDropdown();
  }

  onMount(() => {
    window.addEventListener('close-all-dropdowns', closeDropdown);
  });

  onDestroy(() => {
    window.removeEventListener('close-all-dropdowns', closeDropdown);
  });
</script>

<section class="flex w-full flex-col gap-6">
  <div>Hubs Details</div>

  <div class="flex w-full flex-col gap-6">
    <div class="flex w-full flex-col gap-3 px-4">
      <div class="header flex w-full flex-row items-center justify-between">
        <div class="flex max-h-[20px] items-center gap-3">
          <h2 class="font-inter text-fs-ds-28 leading-lh-ds-120 font-medium text-neutral-50">
            {topdata.title}'s Workspace
          </h2>
          <span
            class="text-fs-ds-12 leading-lh-ds-130 font-regular flex flex-row items-center gap-0.5 rounded-[2px] border border-cyan-700 bg-cyan-900 px-0.5 pt-0.5 pl-1 text-cyan-300"
            >Private <PrivateIcon />
          </span>
        </div>
        <div class="flex gap-2">
          <button
            class="font-inter font-fw-ds-400 text-fs-ds-12 leading-lh-ds-130 flex cursor-pointer items-center gap-0.5 rounded-sm bg-blue-400 px-2 py-1 text-neutral-50"
            ><Inviteicon /> Invite Collaborators</button
          >
          <!-- Three dots vertical menu with dropdown -->
          <div class="relative">
            <div
              bind:this={triggerEl}
              class="border-surface-50 hover:bg-surface-500 cursor-pointer rounded-sm border p-2"
              on:click|stopPropagation={toggleDropdown}
            >
              <ThreeDotsVerticalIcon />
            </div>

            {#if isOpen}
              <div
                bind:this={dropdownEl}
                class={`bg-surface-600 absolute right-0 z-50 w-48 rounded-md shadow-lg ${
                  openUp ? 'bottom-full mb-2' : 'top-10'
                } text-fs-ds-12 font-regular leading-lh-ds-130 text-neutral-50`}
                on:click|stopPropagation
              >
                <div class="flex flex-col py-1">
                  <button
                    class="hover:bg-surface-300 flex w-full items-center gap-2 px-4 py-2 text-left text-neutral-50"
                    on:click={handleEditWorkspace}
                  >
                    <EditIcon />Edit Workspace
                  </button>
                  <button
                    class="hover:bg-surface-300 flex w-full items-center gap-2 px-4 py-2 text-left text-neutral-50"
                    on:click={launchinSparrow}
                  >
                    <LaunchInSparrow /> Launch in Sparrow
                  </button>

                  <button
                    class="hover:bg-surface-300 flex w-full items-center gap-2 px-4 py-2 text-left text-neutral-50"
                    on:click={handleMakeItPublic}
                  >
                    <MakeitPublic /> Make it Public
                  </button>

                  <button
                    class="hover:bg-surface-300 flex w-full items-center gap-2 px-4 py-2 text-left text-red-300"
                    on:click={handleDeleteWorkspace}
                  >
                    <DeleteIcon />Delete Workspace
                  </button>
                </div>
              </div>
            {/if}
          </div>
        </div>
      </div>
      <div class="flex flex-row gap-5">
        <div class="flex">
          <p class="font-inter font-fw-ds-400 text-fs-ds-12 leading-lh-ds-130 text-neutral-400">
            Last Updated :
          </p>
          <p class="font-inter font-fw-ds-400 text-fs-ds-12 leading-lh-ds-130 text-neutral-50">
            {topdata.updatedAt}
          </p>
        </div>
        <div class="ml-1 h-full border-r border-r-neutral-500" />
        <div class="flex">
          <div class="font-inter font-fw-ds-400 text-fs-ds-12 leading-lh-ds-130 text-neutral-400">
            Updated By :
          </div>
          <div class="font-inter font-fw-ds-400 text-fs-ds-12 leading-lh-ds-130 text-neutral-50">
            {topdata.updatedBy}
          </div>
        </div>
      </div>
    </div>
    <div class="font-inter text-fs-ds-12 leading-lh-ds-150 px-4 text-neutral-400">
      You are viewing details for the workspace '{topdata?.title}'s Workspace'. This workspace
      contains API collections, test flows, and environments that are organized for collaborative
      development and testing.
    </div>
    <div class="grid grid-cols-1 gap-6 px-4 sm:grid-cols-2 lg:grid-cols-4">
      {#each stats as stat (stat.label)}
        <StatCard label={stat.label} value={stat.value} />
      {/each}
    </div>
  </div>
</section>
