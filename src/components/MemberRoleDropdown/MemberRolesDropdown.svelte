<script lang="ts">
  import { createEventDispatcher, onMount, onDestroy } from 'svelte';
  import BlueCheckIcon from '@/assets/icons/BlueCheckIcon.svelte';
  import ArrowVerticalV2 from '@/assets/icons/ArrowVerticalV2.svelte';
  import { writable } from 'svelte/store';

  // Create a store to track which dropdown is currently open
  const activeDropdownId = writable<string | null>(null);

  export let selected = { id: '', name: '' };
  export let placeholder = 'Select the role';
  export let hasError = false;
  export let errorMessage = '';
  export let options = [];
  export let dropdownId = ''; // Unique identifier for this dropdown

  const dispatch = createEventDispatcher();
  let isOpen = false;
  let dropdownElement: HTMLElement;

  // Subscribe to the store to know when to close this dropdown
  const unsubscribe = activeDropdownId.subscribe((id) => {
    if (id !== dropdownId && isOpen) {
      isOpen = false;
    }
  });

  function toggleDropdown() {
    if (!isOpen) {
      // When opening this dropdown, set it as the active one
      activeDropdownId.set(dropdownId);
    } else {
      // When closing, clear the active dropdown if it's this one
      activeDropdownId.set(null);
    }
    isOpen = !isOpen;
  }

  function selectRole(role) {
    selected = role;
    dispatch('change', role);
    isOpen = false;
    activeDropdownId.set(null);
  }

  function handleClickOutside(event: MouseEvent) {
    if (dropdownElement && !dropdownElement.contains(event.target as Node) && isOpen) {
      isOpen = false;
      activeDropdownId.set(null);
    }
  }

  onMount(() => {
    document.addEventListener('click', handleClickOutside);
  });

  onDestroy(() => {
    document.removeEventListener('click', handleClickOutside);
    unsubscribe();
  });
</script>

<div class="relative" bind:this={dropdownElement}>
  <button
    type="button"
    class="bg-surface-400 flex w-full min-w-[104px] cursor-pointer items-center justify-between rounded-sm border p-2.5 text-left {hasError
      ? 'border-red-300'
      : 'border-surface-400'}"
    on:click|stopPropagation={toggleDropdown}
  >
    <span
      class="text-fs-ds-12 font-fw-ds-300 {selected.id ? 'text-neutral-50' : 'text-neutral-400'}"
    >
      {selected.id ? selected.name : placeholder}
    </span>
    <ArrowVerticalV2 open={isOpen} />
  </button>

  {#if isOpen}
    <div class="bg-surface-600 absolute z-10 mt-1 w-full min-w-[104px] rounded-sm shadow-lg">
      {#each options as role}
        <button
          type="button"
          class="relative flex w-full flex-col p-3 text-left {role.id === selected.id
            ? 'bg-surface-500'
            : 'hover:bg-surface-500'}"
          on:click={() => selectRole(role)}
        >
          <div class="flex items-center justify-between">
            {#if role.id !== 'Remove User'}<span
                class="text-fs-ds-12 font-fw-ds-400 {role.id === selected.id
                  ? 'text-blue-300'
                  : 'text-neutral-50'} ">{role.name}</span
              >
              {#if role.id === selected.id}
                <BlueCheckIcon />
              {/if}
            {:else}<span class="text-fs-ds-12 font-fw-ds-400 text-red-300">{role.name}</span>
            {/if}
          </div>
          {#if role.description}
            <p class="text-fs-ds-12 font-fw-ds-300 mt-1 text-neutral-300">
              {role.description}
            </p>{/if}
        </button>
      {/each}
    </div>
  {/if}

  {#if hasError && errorMessage}
    <p class="text-fs-ds-12 font-fw-ds-300 font-inter mt-1 text-red-300">{errorMessage}</p>
  {/if}
</div>
