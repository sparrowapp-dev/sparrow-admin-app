<script>
  import DropdownArrow from '@/assets/icons/DropdownArrow.svelte';
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
        setTimeout(determineDropdownDirection, 0);
      }
    }
  }

  function determineDropdownDirection() {
    if (!dropdownRef || !triggerRef) return;

    const viewportHeight = window.innerHeight;
    const triggerRect = triggerRef.getBoundingClientRect();
    const dropdownHeight = dropdownRef.offsetHeight * 2;

    const spaceBelow = viewportHeight - triggerRect.bottom;
    const spaceAbove = triggerRect.top;

    dropdownDirection = spaceBelow >= dropdownHeight || spaceBelow > spaceAbove ? 'down' : 'up';
  }

  function selectOption(option) {
    open = false;
    dispatch('select', option);
    dispatch('change', option);
  }

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
  import { onMount, onDestroy } from 'svelte';
  onMount(() => {
    document.addEventListener('click', handleClickOutside);
  });

  onDestroy(() => {
    document.removeEventListener('click', handleClickOutside);
  });
</script>

<div
  class="text-fs-ds-12 leading-lh-ds-150 relative font-medium text-neutral-100"
  bind:this={dropdownRef}
>
  <button
    bind:this={triggerRef}
    class="bg-surface-600 hover:bg-surface-400 text-fs-ds-12 flex min-h-[28px] min-w-[133px] cursor-pointer items-center justify-between rounded-sm px-3 py-1 font-medium text-neutral-100 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
    on:click={toggleDropdown}
    {disabled}
  >
    {#if selected !== null}
      {labelRenderer(selected)}
    {:else}
      {placeholder}
    {/if}
    <DropdownArrow {open} />
  </button>

  {#if open}
    <ul
      class="dropdown bg-surface-600 absolute z-10 w-full rounded-md px-1 py-1 shadow-lg
        {dropdownDirection === 'down' ? 'top-full mt-1' : 'bottom-full mb-1'}"
    >
      {#each options as option}
        <li class="">
          <button
            class="hover:bg-surface-400 flex w-full cursor-pointer items-center justify-between rounded-sm px-2 py-1 text-left {selected ===
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
