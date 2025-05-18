<script lang="ts">
  import { createEventDispatcher, onMount, onDestroy, tick } from 'svelte';
  import BlueCheckIcon from '@/assets/icons/BlueCheckIcon.svelte';
  import ArrowVerticalV2 from '@/assets/icons/ArrowVerticalV2.svelte';

  export let selected = { id: '', name: '' };
  export let placeholder = 'Select the role';
  export let hasError = false;
  export let errorMessage = '';
  export let options = [];
  export let dropdownId = `dropdown-${Math.random().toString(36).substring(2, 9)}`; // Generate unique ID if not provided
  export let disabled: boolean = false;

  let openUp = false;
  let triggerEl: HTMLButtonElement;
  let dropdownEl: HTMLDivElement;
  let position = { top: 0, left: 0, width: 0 };
  const dispatch = createEventDispatcher();
  let isOpen = false;
  let dropdownElement: HTMLElement;

  // Calculate the dropdown position based on available space
  function calculatePosition() {
    if (!triggerEl || !dropdownEl) return;

    const triggerRect = triggerEl.getBoundingClientRect();
    const dropdownHeight = dropdownEl.offsetHeight;
    const dropdownWidth = dropdownEl.offsetWidth;
    const spaceBelow = window.innerHeight - triggerRect.bottom;
    const spaceRight = window.innerWidth - triggerRect.left;

    // Determine if dropdown should open upward
    openUp = spaceBelow < dropdownHeight + 5;

    // Calculate position
    position = {
      top: openUp ? triggerRect.top - dropdownHeight - 5 : triggerRect.bottom + 5,
      left: triggerRect.left,
      width: Math.min(dropdownWidth, spaceRight - 10), // Make sure it doesn't go off-screen
    };
  }

  // Handle window resize events to recalculate position
  function handleResize() {
    if (isOpen && dropdownEl) {
      calculatePosition();
    }
  }

  // Event handler for when another dropdown opens
  function handleCloseAllDropdowns(event: CustomEvent) {
    // If this event came from this instance, don't close itself
    if (event.detail && event.detail.sourceId === dropdownId) {
      return;
    }

    // Close this dropdown instance
    isOpen = false;
  }

  async function toggleDropdown(event) {
    if (disabled) return;

    event.stopPropagation();

    if (!isOpen) {
      // Before opening, dispatch an event to close all other dropdowns
      window.dispatchEvent(
        new CustomEvent('close-all-dropdowns', {
          detail: { sourceId: dropdownId },
        }),
      );

      isOpen = true;
      await tick();
      calculatePosition();
    } else {
      isOpen = false;
    }
  }

  function selectRole(role, event) {
    if (disabled) return;

    event.stopPropagation();
    dispatch('change', role);
    isOpen = false;
  }

  function handleClickOutside(event: MouseEvent) {
    if (
      isOpen &&
      dropdownElement &&
      !dropdownElement.contains(event.target as Node) &&
      dropdownEl &&
      !dropdownEl.contains(event.target as Node)
    ) {
      isOpen = false;
    }
  }

  onMount(() => {
    document.addEventListener('click', handleClickOutside);
    window.addEventListener('close-all-dropdowns', handleCloseAllDropdowns);
    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleResize, true);
  });

  onDestroy(() => {
    document.removeEventListener('click', handleClickOutside);
    window.removeEventListener('close-all-dropdowns', handleCloseAllDropdowns);
    window.removeEventListener('resize', handleResize);
    window.removeEventListener('scroll', handleResize, true);
  });
</script>

<div
  class="relative {disabled ? 'cursor-not-allowed opacity-50' : ''}"
  bind:this={dropdownElement}
  data-dropdown-id={dropdownId}
>
  <button
    bind:this={triggerEl}
    {disabled}
    type="button"
    class="bg-surface-400 {disabled
      ? 'cursor-not-allowed opacity-50'
      : ''} flex w-full min-w-[104px] cursor-pointer items-center justify-between rounded-sm border p-2.5 text-left {hasError
      ? 'border-red-300'
      : 'border-surface-400'}"
    on:click={toggleDropdown}
    aria-haspopup="listbox"
    aria-expanded={isOpen}
  >
    <span
      class="text-fs-ds-12 font-fw-ds-300 {selected.id ? 'text-neutral-50' : 'text-neutral-400'}"
    >
      {selected.id ? selected.name : placeholder}
    </span>
    <ArrowVerticalV2 open={isOpen} />
  </button>

  {#if isOpen}
    <!-- Use portal or fixed positioning for the dropdown -->
    <div
      bind:this={dropdownEl}
      class="fixed z-[999] shadow-xl"
      style="top: {position.top}px; left: {position.left}px; width: {position.width || 100}px;"
    >
      <div class="bg-surface-600 flex max-h-[300px] flex-col rounded-sm shadow-lg" role="listbox">
        {#each options as role}
          <button
            {disabled}
            type="button"
            class="relative flex w-full flex-col p-3 text-left {role.id === selected.id
              ? 'bg-surface-500'
              : 'hover:bg-surface-500'}"
            on:click={(e) => selectRole(role, e)}
            role="option"
            aria-selected={role.id === selected.id}
          >
            <div class="flex items-center justify-between">
              {#if role.id !== 'Remove User'}
                <span
                  class="text-fs-ds-12 font-fw-ds-400 {role.id === selected.id
                    ? 'text-blue-300'
                    : 'text-neutral-50'}"
                >
                  {role.name}
                </span>
                {#if role.id === selected.id}
                  <BlueCheckIcon />
                {/if}
              {:else}
                <span class="text-fs-ds-12 font-fw-ds-400 text-red-300">
                  {role.name}
                </span>
              {/if}
            </div>
            {#if role.description}
              <p class="text-fs-ds-12 font-fw-ds-300 mt-1 text-neutral-300">
                {role.description}
              </p>
            {/if}
          </button>
        {/each}
      </div>
    </div>
  {/if}

  {#if hasError && errorMessage}
    <p class="text-fs-ds-12 font-fw-ds-300 font-inter mt-1 text-red-300">
      {errorMessage}
    </p>
  {/if}
</div>
