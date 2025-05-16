<script lang="ts">
  import { createEventDispatcher, onMount, onDestroy } from 'svelte';
  import BlueCheckIcon from '@/assets/icons/BlueCheckIcon.svelte';
  import ArrowVerticalV2 from '@/assets/icons/ArrowVerticalV2.svelte';

  // Added props for more flexibility
  export let selected = { id: '', name: '' };
  export let placeholder = 'Select the role';
  export let hasError = false;
  export let errorMessage = '';
  export let options = [
    {
      id: 'admin',
      name: 'Admin',
      description:
        'Manage workspace resources and members. Add, edit, and remove resources, as well as invite or remove team members.',
    },
    {
      id: 'editor',
      name: 'Editor',
      description: 'Create and modify resources within a workspace.',
    },
    {
      id: 'viewer',
      name: 'Viewer',
      description: 'View resources in a workspace without making changes.',
    },
  ];

  const dispatch = createEventDispatcher();

  let isOpen = false;
  let dropdownElement; // Reference to the dropdown container

  function toggleDropdown() {
    isOpen = !isOpen;
  }

  function selectRole(role) {
    selected = role;
    dispatch('change', role);
    isOpen = false;
  }

  function handleClickOutside(event) {
    if (dropdownElement && !dropdownElement.contains(event.target) && isOpen) {
      isOpen = false;
    }
  }

  onMount(() => {
    document.addEventListener('click', handleClickOutside);
  });

  onDestroy(() => {
    document.removeEventListener('click', handleClickOutside);
  });
</script>

<div class="relative" bind:this={dropdownElement}>
  <button
    type="button"
    class="bg-surface-400 flex w-full cursor-pointer items-center justify-between rounded-sm border p-2.5 text-left {hasError
      ? 'border-red-300'
      : 'border-surface-400'}"
    on:click|stopPropagation={toggleDropdown}
  >
    <span
      class="text-fs-ds-14 font-fw-ds-300 {selected.id ? 'text-neutral-50' : 'text-neutral-400'}"
    >
      {selected.id ? selected.name : placeholder}
    </span>
    <ArrowVerticalV2 open={isOpen} />
  </button>

  {#if isOpen}
    <div class="bg-surface-600 absolute z-10 mt-1 w-full rounded-sm shadow-lg">
      {#each options as role}
        <button
          type="button"
          class="relative flex w-full flex-col p-3 text-left {role.id === selected.id
            ? 'bg-surface-500'
            : 'hover:bg-surface-500'}"
          on:click={() => selectRole(role)}
        >
          <div class="flex items-center justify-between">
            <span
              class="text-fs-ds-12 font-fw-ds-400 {role.id === selected.id
                ? 'text-blue-300'
                : 'text-neutral-50'}">{role.name}</span
            >
            {#if role.id === selected.id}
              <BlueCheckIcon />
            {/if}
          </div>
          <p class="text-fs-ds-12 font-fw-ds-300 mt-1 text-neutral-300">{role.description}</p>
        </button>
      {/each}
    </div>
  {/if}

  {#if hasError && errorMessage}
    <p class="text-fs-ds-12 font-fw-ds-300 font-inter mt-1 text-red-300">{errorMessage}</p>
  {/if}
</div>
