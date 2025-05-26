<script lang="ts">
  import Inviteicon from '@/assets/icons/Inviteicon.svelte';
  import PrivateIcon from '@/assets/icons/PrivateIcon.svelte';
  import ThreeDotsVerticalIcon from '@/assets/icons/ThreeDotsVerticalIcon.svelte';

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
  import { SPARROW_LAUNCH_URL } from '@/constants/environment';
  import StatCard from '@/components/StatCard/StatCard.svelte';
  export let topData;
  export let openModal;
  export let isLoading;
  export let workspaceId;
  export let hubId;
  $: stats = topData
    ? [
        { label: 'Total Contributors', value: topData.totalContributors },
        { label: 'Total Collections', value: topData.totalCollections },
        { label: 'Total Test Flows', value: topData.totalTestFLows },
        { label: 'Total Environments', value: topData.totalEnvironments },
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
    openModal('editWorkspace');
    closeDropdown();
  }

  function launchInSparrow(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();

    if (workspaceId) {
      // Build URL with required query parameters
      const baseUrl = `${SPARROW_LAUNCH_URL}/app/collections`;
      const params = new URLSearchParams();

      // Add workspaceId parameter
      params.set('adminRedirectWorkspaceId', workspaceId);

      const url = `${baseUrl}?${params.toString()}`;

      // Open in a new tab
      window.open(url, '_blank');
    }
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
  async function copyLink() {
    const shareUrl = `${SPARROW_LAUNCH_URL}?workspaceId=${workspaceId}`;
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
  <div class="flex w-full flex-col gap-6">
    <div class="flex w-full flex-col gap-3">
      <div class="header flex w-full flex-row items-center justify-between">
        <div class="flex max-h-[20px] items-center gap-3">
          <h2
            class="font-inter text-fs-ds-28 leading-lh-ds-120 max-w-[300px] overflow-hidden font-medium text-ellipsis whitespace-nowrap text-neutral-50"
          >
            {topData?.title || ''}
          </h2>
          {#if topData?.WorkspaceType === 'PRIVATE'}
            <span>
              <PrivateIcon />
            </span>
          {:else}
            <span class="rounded-[2px]"><PublicRight /></span>
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
                    on:click={(e) => launchInSparrow(e)}
                  >
                    <LaunchInSparrow /> Launch in Sparrow
                  </button>

                  <button
                    class="hover:bg-surface-300 flex w-full items-center gap-2 px-4 py-2 text-left text-neutral-50"
                    on:click={() => {
                      if (topData.WorkspaceType === 'PRIVATE') {
                        handleMakeItPublic();
                      } else {
                        copyLink();
                      }
                    }}
                  >
                    {#if topData.WorkspaceType === 'PRIVATE'}<MakeitPublic /> Make it Public{:else if copied}<GreenCheckicon
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
            {getRelativeTime(topData?.updatedAt) || ''}
          </p>
        </div>
        <div class="ml-1 h-full border-r border-r-neutral-500" />
        <div class="flex gap-0.5">
          <div class="font-inter font-fw-ds-400 text-fs-ds-12 leading-lh-ds-130 text-neutral-400">
            Updated By :
          </div>
          <div
            class="font-inter font-fw-ds-400 text-fs-ds-12 leading-lh-ds-130 max-w-[125px] overflow-hidden text-ellipsis whitespace-nowrap text-neutral-50"
          >
            {topData?.updatedBy || ''}
          </div>
        </div>
      </div>
    </div>
    <div class="font-inter text-fs-ds-12 leading-lh-ds-150 flex text-neutral-400">
      You are viewing details for the workspace '

      {topData?.title?.length > 10 ? `${topData?.title?.slice(0, 10)}...` : topData?.title}

      '. This workspace contains API collections, test flows, and environments that are organized
      for collaborative development and testing.
    </div>
    <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {#each stats as stat (stat?.label)}
        <StatCard label={stat?.label} value={stat?.value} />
      {/each}
    </div>
  </div>
</section>
