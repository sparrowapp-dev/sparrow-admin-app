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
  import Public from '@/assets/icons/Public.svelte';
  import PublicRight from '@/assets/icons/PublicRight.svelte';
  import { getRelativeTime } from '@/utils/TimeFunction';
  import ShareIcon from '@/assets/icons/ShareIcon.svelte';
  import { notification } from '@/components/Toast';
  import GreenCheckicon from '@/assets/icons/GreenCheckicon.svelte';

  export let topdata;
  export let openModal;
  export let isLoading;
  $: stats = topdata
    ? [
        { label: 'Total Contributors', value: topdata.totalContributors },
        { label: 'Total Collections', value: topdata.totalCollections },
        { label: 'Total Test Flows', value: topdata.totalTestFLows },
        { label: 'Total Environments', value: topdata.totalEnvironments },
      ]
    : [];

  // Dropdown state management
  let isOpen = false;
  let openUp = false;
  let triggerEl: HTMLDivElement;
  let dropdownEl: HTMLDivElement;
  let copied = false;
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
  function handleInvite() {
    openModal('openInviteModal');
  }

  // Dropdown action handlers
  function handleEditWorkspace() {
    // Add your edit workspace functionality here
    openModal('editWorkspace');
    closeDropdown();
  }

  function launchinSparrow() {
    closeDropdown();
  }
  function handleMakeItPublic() {
    openModal('makeItPublic');
    closeDropdown();
  }

  function handleDeleteWorkspace() {
    openModal('deleteWorkSpace');
    closeDropdown();
  }
  async function copylink() {
    const shareUrl = `${window.location.origin}/workspaces/samplelink`; // or whatever your share URL is
    try {
      await navigator.clipboard.writeText(shareUrl);
      notification.success(`Link copied`);
      copied = true;
      setTimeout(() => {
        copied = false;
        closeDropdown();
      }, 2000);
    } catch (err) {
      notification.error('Failed to copy the link');
    }
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
            {topdata?.title}
          </h2>
          {#if topdata?.WorkspaceType === 'PRIVATE'}
            <span>
              <PrivateIcon />
            </span>
          {:else}
            <span class="rounded-[2px] border border-green-700 bg-green-900"><PublicRight /></span>
          {/if}
        </div>
        <div class="flex gap-2">
          <button
            on:click={handleInvite}
            class="font-inter font-fw-ds-400 text-fs-ds-12 leading-lh-ds-130 flex cursor-pointer items-center gap-0.5 rounded-sm bg-blue-400 px-2 py-1 text-neutral-50"
            ><Inviteicon /> Invite Collaborators</button
          >
          <!-- Three dots vertical menu with dropdown -->
          <div class="relative">
            <div
              bind:this={triggerEl}
              class="border-surface-50 hover:bg-surface-500 cursor-pointer rounded-sm border px-3 py-2.5"
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
                    on:click={() => {
                      if (topdata.WorkspaceType === 'PRIVATE') {
                        handleMakeItPublic();
                      } else {
                        copylink();
                      }
                    }}
                  >
                    {#if topdata.WorkspaceType === 'PRIVATE'}<MakeitPublic /> Make it Public{:else if copied}<GreenCheckicon
                      /> Link Copied
                    {:else}<ShareIcon /> Share Workspace{/if}
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
        <div class="flex gap-0.5">
          <p class="font-inter font-fw-ds-400 text-fs-ds-12 leading-lh-ds-130 text-neutral-400">
            Last Updated :
          </p>
          <p class="font-inter font-fw-ds-400 text-fs-ds-12 leading-lh-ds-130 text-neutral-50">
            {getRelativeTime(topdata?.updatedAt)}
          </p>
        </div>
        <div class="ml-1 h-full border-r border-r-neutral-500" />
        <div class="flex gap-0.5">
          <div class="font-inter font-fw-ds-400 text-fs-ds-12 leading-lh-ds-130 text-neutral-400">
            Updated By :
          </div>
          <div class="font-inter font-fw-ds-400 text-fs-ds-12 leading-lh-ds-130 text-neutral-50">
            {topdata?.updatedBy}
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
      {#each stats as stat (stat?.label)}
        <StatCard label={stat?.label} value={stat?.value} />
      {/each}
    </div>
  </div>
</section>
