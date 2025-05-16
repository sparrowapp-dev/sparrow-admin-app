<script lang="ts">
  import { createEventDispatcher, onMount, onDestroy, tick } from 'svelte';
  import CheckboxChecked from '@/assets/icons/CheckboxChecked.svelte';
  import CheckboxUnchecked from '@/assets/icons/CheckboxUnchecked.svelte';
  import ArrowVerticalV2 from '@/assets/icons/ArrowVerticalV2.svelte';

  // Props with better defaults and customization
  export let workspaces: { id: string; name: string }[] = [];
  export let selectedWorkspaces: { id: string; name: string }[] = [];
  export let hasError: boolean = false;
  export let errorMessage: string = '';
  export let placeholder: string = 'Select';
  export let selectAllLabel: string = 'Select All';

  const dispatch = createEventDispatcher();

  // Component state
  let isOpen = false;
  let dropdownElement; // Reference to the dropdown container

  // Reactive set of selected workspace IDs
  $: selectedIds = new Set(selectedWorkspaces.map((w) => w.id));

  // Reactive check for "Select All" state
  $: allSelected = workspaces.length > 0 && selectedWorkspaces.length === workspaces.length;

  // Toggle dropdown visibility
  function toggleDropdown(event) {
    event.stopPropagation();
    isOpen = !isOpen;
  }

  // Toggle individual workspace selection
  async function toggleWorkspace(workspace) {
    let updatedSelection;

    if (selectedIds.has(workspace.id)) {
      // Remove from selection
      updatedSelection = selectedWorkspaces.filter((w) => w.id !== workspace.id);
    } else {
      // Add to selection
      updatedSelection = [...selectedWorkspaces, workspace];
    }

    // Update selection and notify parent
    selectedWorkspaces = updatedSelection;
    dispatch('change', selectedWorkspaces);

    // Ensure UI updates
    await tick();
  }

  // Toggle "Select All" functionality
  async function toggleSelectAll() {
    let updatedSelection;

    if (allSelected) {
      // Deselect all
      updatedSelection = [];
    } else {
      // Select all
      updatedSelection = [...workspaces];
    }

    // Update selection and notify parent
    selectedWorkspaces = updatedSelection;
    dispatch('change', selectedWorkspaces);

    // Ensure UI updates
    await tick();
  }

  // Close dropdown when clicking outside
  function handleClickOutside(event) {
    if (dropdownElement && !dropdownElement.contains(event.target) && isOpen) {
      isOpen = false;
    }
  }

  // Add and remove outside click listener
  onMount(() => {
    document.addEventListener('click', handleClickOutside);
  });

  onDestroy(() => {
    document.removeEventListener('click', handleClickOutside);
  });
</script>

<div class="relative" bind:this={dropdownElement}>
  <!-- Dropdown Trigger Button with dynamic border color based on error state -->
  <button
    type="button"
    class="bg-surface-400 flex w-full cursor-pointer items-center justify-between rounded-sm border p-2.5 text-left {hasError
      ? 'border-red-300'
      : 'border-surface-400'}"
    on:click={toggleDropdown}
  >
    <!-- Display Selected Workspaces or Placeholder -->
    <div class="flex flex-wrap gap-1 overflow-hidden">
      {#if selectedWorkspaces.length === 0}
        <span class="text-fs-ds-14 text-neutral-300">{placeholder}</span>
      {:else}
        {#each selectedWorkspaces as workspace, i (workspace.id)}
          {#if i < 2 || selectedWorkspaces.length <= 3}
            <span
              class="bg-surface-500 text-fs-ds-12 flex items-center rounded px-2 py-0.5 text-neutral-50"
            >
              {workspace.name}
            </span>
          {:else if i === 2}
            <span
              class="bg-surface-500 text-fs-ds-12 flex items-center rounded px-2 py-0.5 text-neutral-50"
            >
              +{selectedWorkspaces.length - 2} more
            </span>
          {/if}
        {/each}
      {/if}
    </div>

    <!-- Dropdown Arrow -->
    <ArrowVerticalV2 open={isOpen} />
  </button>

  <!-- Dropdown Menu -->
  {#if isOpen}
    <div
      class="bg-surface-600 absolute z-10 mt-1 max-h-64 w-full overflow-y-auto rounded-sm shadow-lg"
    >
      <!-- Select All Option -->
      <div class="border-surface-300 border-b p-2">
        <button
          type="button"
          class="flex w-full cursor-pointer items-center space-x-2"
          on:click|preventDefault|stopPropagation={toggleSelectAll}
        >
          <div class="flex h-5 w-5 items-center justify-center">
            {#if allSelected}
              <CheckboxChecked />
            {:else}
              <CheckboxUnchecked />
            {/if}
          </div>
          <span class="text-fs-ds-12 font-fw-ds-300 text-neutral-50">{selectAllLabel}</span>
        </button>
      </div>

      <!-- Workspace Options -->
      {#each workspaces as workspace (workspace.id)}
        <div class="hover:bg-surface-500 p-2">
          <button
            type="button"
            class="flex w-full cursor-pointer items-center space-x-2"
            on:click|preventDefault|stopPropagation={() => toggleWorkspace(workspace)}
          >
            <div class="flex h-5 w-5 items-center justify-center">
              {#if selectedIds.has(workspace.id)}
                <CheckboxChecked />
              {:else}
                <CheckboxUnchecked />
              {/if}
            </div>
            <span class="text-fs-ds-12 font-fw-ds-300 truncate text-neutral-50"
              >{workspace.name}</span
            >
          </button>
        </div>
      {/each}
    </div>
  {/if}

  <!-- Error Message -->
  {#if hasError && errorMessage}
    <p class="text-fs-ds-12 font-fw-ds-300 font-inter mt-1 text-red-300">{errorMessage}</p>
  {/if}
</div>
