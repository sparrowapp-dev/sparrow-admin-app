<script lang="ts">
  import { createEventDispatcher, onMount, onDestroy } from 'svelte';
  import BlueCheckIcon from '@/assets/icons/BlueCheckIcon.svelte';
  import ArrowVerticalV2 from '@/assets/icons/ArrowVerticalV2.svelte';

  // Added props for more flexibility
  export let selected = { id: '', name: '' };
  export let placeholder = 'Select the role';
  export let hasError = false;
  export let errorMessage = '';
  export let showDescription = true;
  export let showAdminAndMember = false;
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
    {
      id: 'member',
      name: 'Member',
      description: '',
    },
  ];

  // Filter options based on the prop
  $: displayOptions = showAdminAndMember
    ? options.filter((opt) => opt.id === 'admin' || opt.id === 'member')
    : options.filter((opt) => opt.id === 'admin' || opt.id === 'editor' || opt.id === 'viewer');

  const dispatch = createEventDispatcher();

  let isOpen = false;
  let isPositioned = false; // New flag to prevent flashing
  let dropdownElement; // Reference to the dropdown container
  let dropdownListElement; // Reference to the actual dropdown list
  let buttonRect; // To store button dimensions for positioning
  let position = 'bottom'; // Default position
  let dropdownHeight = 0; // Height of dropdown content

  function toggleDropdown() {
    if (!isOpen) {
      // First set isOpen but keep dropdown hidden
      isOpen = true;
      isPositioned = false;

      // Calculate position before showing
      setTimeout(() => {
        if (dropdownElement) {
          buttonRect = dropdownElement.getBoundingClientRect();

          // Get estimated dropdown height
          if (dropdownListElement) {
            dropdownHeight = dropdownListElement.offsetHeight;

            // Check if dropdown would go off the bottom of the screen
            const viewportHeight = window.innerHeight;
            const spaceBelow = viewportHeight - buttonRect.bottom;

            // If not enough space below, position above
            if (spaceBelow < dropdownHeight + 10) {
              position = 'top';
            } else {
              position = 'bottom';
            }
          }

          // Now show the positioned dropdown
          isPositioned = true;
        }
      }, 0);
    } else {
      // Just close if already open
      isOpen = false;
      isPositioned = false;
    }
  }

  function selectRole(role) {
    selected = role;
    dispatch('change', role);
    isOpen = false;
    isPositioned = false;
  }

  function handleClickOutside(event) {
    if (
      dropdownElement &&
      !dropdownElement.contains(event.target) &&
      dropdownListElement &&
      !dropdownListElement.contains(event.target) &&
      isOpen
    ) {
      isOpen = false;
      isPositioned = false;
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
    class="bg-surface-400 flex w-full cursor-pointer items-center justify-between rounded-sm border p-2 text-left {hasError
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
    <div
      bind:this={dropdownListElement}
      class="bg-surface-600 fixed z-50 rounded-sm shadow-lg"
      style="width: {buttonRect ? buttonRect.width + 'px' : '100%'}; 
             left: {buttonRect ? buttonRect.left + 'px' : '-9999px'}; 
             {position === 'bottom'
        ? `top: ${buttonRect ? buttonRect.bottom + 5 + 'px' : '-9999px'}`
        : `bottom: ${buttonRect ? window.innerHeight - buttonRect.top + 5 + 'px' : '-9999px'}`};
             visibility: {isPositioned ? 'visible' : 'hidden'};"
    >
      {#each displayOptions as role}
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
          {#if showDescription && role.description}
            <p class="text-fs-ds-12 font-fw-ds-300 mt-1 text-neutral-300">{role.description}</p>
          {/if}
        </button>
      {/each}
    </div>
  {/if}

  {#if hasError && errorMessage}
    <p class="text-fs-ds-12 font-fw-ds-300 font-inter mt-1 text-red-300">{errorMessage}</p>
  {/if}
</div>
