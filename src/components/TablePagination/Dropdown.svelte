<script>
  import { createEventDispatcher } from 'svelte';

  export let options = [];
  export let selected = null;
  export let placeholder = 'Select';
  export let disabled = false;
  export let labelRenderer = (option) => option;
  export let icon;

  const dispatch = createEventDispatcher();

  let open = false;
  let dropdownRef;
  let triggerRef;
  let dropdownDirection = 'down';

  function toggleDropdown() {
    if (!disabled) {
      open = !open;

      if (open) {
        // Determine dropdown direction after a short delay to ensure DOM is updated
        setTimeout(determineDropdownDirection, 0);
      }
    }
  }

  function determineDropdownDirection() {
    if (!dropdownRef || !triggerRef) return;

    // Get viewport height and trigger's position
    const viewportHeight = window.innerHeight;
    const triggerRect = triggerRef.getBoundingClientRect();
    const dropdownHeight = dropdownRef.offsetHeight * 2;

    // Calculate space below and above the trigger
    const spaceBelow = viewportHeight - triggerRect.bottom;
    const spaceAbove = triggerRect.top;

    // Determine dropdown direction
    dropdownDirection = spaceBelow >= dropdownHeight || spaceBelow > spaceAbove ? 'down' : 'up';
  }

  function selectOption(option) {
    open = false;
    // Always dispatch both events for flexibility
    dispatch('select', option);
    dispatch('change', option);
  }

  // Close dropdown when clicking outside
  function handleClickOutside(event) {
    if (
      dropdownRef &&
      triggerRef &&
      !dropdownRef.contains(event.target) &&
      !triggerRef.contains(event.target)
    ) {
      open = false;
    }
  }

  // Add click outside listener
  import { onMount, onDestroy } from 'svelte';
  onMount(() => {
    document.addEventListener('click', handleClickOutside);
  });

  // Remove listener on destroy
  onDestroy(() => {
    document.removeEventListener('click', handleClickOutside);
  });
</script>

<div class="relative" bind:this={dropdownRef}>
  <button
    bind:this={triggerRef}
    class="bg-surface-600 hover:bg-surface-500 flex min-w-[133px] cursor-pointer items-center justify-between rounded-sm border border-gray-700 px-3 py-2 text-sm font-medium text-neutral-100 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
    on:click={toggleDropdown}
    {disabled}
  >
    {#if selected !== null}
      {labelRenderer(selected)}
    {:else}
      {placeholder}
    {/if}
    <svg
      class="ml-2 transition-transform {open ? 'rotate-180' : ''}"
      width="10"
      height="6"
      viewBox="0 0 10 6"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M1.95681 0C1.14912 0 0.674663 0.90803 1.13591 1.57107L3.76854 5.35548C4.36532 6.21335 5.63448 6.21335 6.23126 5.35548L8.8639 1.57106C9.32514 0.908027 8.85068 0 8.04299 0H1.95681Z"
        fill="white"
      />
    </svg>
  </button>

  {#if open}
    <ul
      class="dropdown bg-surface-600 absolute z-10 w-full rounded-md border border-gray-700 py-1 text-sm text-white shadow-lg
        {dropdownDirection === 'down' ? 'top-full mt-1' : 'bottom-full mb-1'}"
    >
      {#each options as option}
        <li>
          <button
            class="flex w-full items-center justify-between px-4 py-2 text-left hover:bg-gray-700 {selected ===
            option
              ? 'text-blue-300'
              : ''}"
            on:click={() => selectOption(option)}
          >
            {labelRenderer(option)}
            {#if selected === option && icon}
              <svelte:component this={icon} />
            {/if}
          </button>
        </li>
      {/each}
    </ul>
  {/if}
</div>

<style>
  .dropdown {
    animation: dropdown-fade 150ms ease-out;
  }

  @keyframes dropdown-fade {
    from {
      opacity: 0;
      transform: scale(0.95);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }
</style>
