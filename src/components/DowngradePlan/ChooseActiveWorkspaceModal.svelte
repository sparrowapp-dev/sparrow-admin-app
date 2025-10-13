<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte';
  import { hubsService } from '@/services/hubs.service';
  import DowngradeModalButtons from '@/ui/DowngradeModalButtons/DowngradeModalButtons.svelte';

  export let isOpen: boolean = false;
  export let currentPlan: string;
  export let selectedPlan: string;
  export let workspaces = [];
  export let hubId: string;

  const dispatch = createEventDispatcher();
  let selected = new Set();
  let workspaceDetails = new Map();
  let loading = false;

  // ✅ Dynamically derive maxSelectable
  $: maxSelectable = (() => {
    const from = currentPlan?.toLowerCase?.() || '';
    const to = selectedPlan?.toLowerCase?.() || '';

    // Professional → Standard: 5
    if (from === 'professional' && to === 'standard') return 5;

    // Professional → Community: 3
    if (from === 'professional' && to === 'community') return 3;

    // Standard → Community: 3
    if (from === 'standard' && to === 'community') return 3;

    // Enterprise → Standard or lower: 5
    if (from === 'enterprise') return 5;

    // Fallback
    return 3;
  })();

  const toggleWorkspace = (id: string) => {
    if (selected.has(id)) {
      selected.delete(id);
    } else if (selected.size < maxSelectable) {
      selected.add(id);
    }
    selected = new Set(selected); // reactivity
  };

  const handleNext = () => {
    const selectedWorkspaces = workspaces
      .filter((ws) => selected.has(ws.id))
      .map((ws) => ({
        id: ws.id,
        name: ws.name,
      }));
    const unselectedWorkspaces = workspaces
      .filter((ws) => !selected.has(ws.id))
      .map((ws) => ({
        id: ws.id,
        name: ws.name,
      }));
    dispatch('next', { selected: selectedWorkspaces, unselected: unselectedWorkspaces });
  };


  const handleClose = () => {
    dispatch('close');
  };

  const handleBackdropClick = (e: MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  function getTimeDifference(updatedAt: string): string {
    const updatedDate = new Date(updatedAt);
    const now = new Date();
    const diffInDays = Math.floor(
      (now.getTime() - updatedDate.getTime()) / (1000 * 60 * 60 * 24),
    );
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return '1 day ago';
    return `${diffInDays} days ago`;
  }

  onMount(async () => {
    if (workspaces?.length) {
      loading = true;
      const promises = workspaces.map(async (ws) => {
        try {
          const res = await hubsService.getWorkspaceSummary({
            workspaceId: ws.id,
            hubId,
          });
          const data = res?.data;
          workspaceDetails.set(ws.id, {
            collections: data?.totalCollections ?? '-',
            contributors: data?.totalContributors ?? '-',
            updated: data?.updatedAt ? getTimeDifference(data.updatedAt) : '-',
          });
          workspaceDetails = new Map(workspaceDetails);
        } catch (err) {
          console.error(`Failed to fetch summary for ${ws.name}`, err);
        }
      });
      await Promise.all(promises);
      loading = false;
    }
  });
</script>

{#if isOpen}
  <div
    class="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-xs"
    on:click={handleBackdropClick}
    role="presentation"
  >
    <div
      class="bg-[#181C26] relative mx-auto flex h-[642px] w-[533px] flex-col gap-4 rounded-lg p-6 text-white shadow-2xl"
      role="dialog"
      aria-modal="true"
    >
      <!-- Header -->
      <div class="flex items-start justify-between">
        <div class="flex items-center gap-2">
          <div class="flex items-center gap-1">
            <div
              class="flex h-5 w-5 items-center justify-center rounded-full bg-[#2B74FF] text-fs-ds-12 font-medium"
            >
              1
            </div>
            <span class="text-fs-ds-14 font-medium text-gray-300">Step 1</span>
          </div>
          <div class="mx-2 h-px w-12 bg-gray-600"></div>
          <span class="text-fs-ds-14 text-gray-400">Step 2</span>
        </div>
        <button
          on:click={handleClose}
          class="text-fs-ds-20 text-gray-400 transition hover:text-white"
          type="button"
        >
          ✕
        </button>
      </div>

      <div class="flex flex-col gap-y-2">
        <h2 class="text-fs-ds-20 leading-tight font-semibold">Choose Your Active Workspaces</h2>
        <p class="mt-2 text-fs-ds-12 leading-snug text-gray-400">
          Your new plan includes {maxSelectable} active private workspaces. Please select the ones
          you want to keep active below.
        </p>
        <p class="mt-1 text-fs-ds-12 leading-snug text-gray-400">
          Unselected workspaces will be safely archived and can be restored anytime by upgrading.
        </p>
      </div>

      <!-- Table (fixed height & scrollable) -->
      <div
        class="flex h-[320px] max-w-[492px] flex-grow flex-col overflow-hidden rounded-md border border-[#2A2F3A] "
      >
        <div class="flex-grow overflow-y-auto">
          <table class="w-full border-collapse text-fs-ds-12 text-white">
            <thead class="sticky top-0 text-left text-gray-400">
              <tr>
                <th class="w-[20px]  py-2 font-medium"></th>
                <th class="px-4 py-2 font-medium">Workspaces</th>
                <th class="px-4 py-2 font-medium">Collections</th>
                <th class="px-4 py-2 font-medium">Contributors</th>
                <th class="px-4 py-2 font-medium">Last updated</th>
              </tr>
            </thead>
          
            <tbody>
              {#each workspaces as ws}
              <tr
              class="cursor-pointer transition-colors hover:bg-[#2A2F3A] font-fw-ds-600 font-inter"
              on:click={() => toggleWorkspace(ws.id)}
            >
              <!-- Checkbox column -->
              <td class="px-2 py-2 text-center" on:click|stopPropagation>
                <label class="relative flex h-4 w-4 items-center justify-center">
                  <input
                    type="checkbox"
                    checked={selected.has(ws.id)}
                    on:change={() => toggleWorkspace(ws.id)}
                    disabled={!selected.has(ws.id) && selected.size >= maxSelectable}
                    class="peer absolute h-4 w-4 cursor-pointer appearance-none rounded-sm border border-[#2A2F3A] bg-[#1E222C] checked:border-[#2B74FF] checked:bg-[#2B74FF] focus:outline-none"
                  />
                  <!-- Checkmark icon -->
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="pointer-events-none absolute h-3 w-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M16.707 5.293a1 1 0 00-1.414 0L8 12.586 4.707 9.293a1 1 0 00-1.414 1.414l4 4a1 1 0 001.414 0l8-8a1 1 0 000-1.414z"
                      clip-rule="evenodd"
                    />
                  </svg>
                </label>
              </td>
            
              <!-- Workspace info -->
              <td class="px-4 py-3">{ws.name}</td>
              <td class="px-4 py-3">{workspaceDetails.get(ws.id)?.collections ?? '-'}</td>
              <td class="px-4 py-3">{workspaceDetails.get(ws.id)?.contributors ?? '-'}</td>
              <td class="px-4 py-3">{workspaceDetails.get(ws.id)?.updated ?? '-'}</td>
            </tr>
              {/each}
            </tbody>
          </table>
          
        </div>
      </div>
      <p class="text-right text-fs-ds-12 text-gray-500">
        You have selected {selected.size} of {maxSelectable}
      </p>
      <div class="">
        <DowngradeModalButtons
          showSupport={true}
          supportText="Contact Support"
          cancelText="Cancel"
          confirmText="Confirm Selection"
          primaryVariant="filled-primary"
          isPrimaryDisabled={selected.size !== maxSelectable}
          on:cancel={handleClose}
          on:confirm={handleNext}
        />
      </div>
    </div>
  </div>
{/if}