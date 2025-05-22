<script lang="ts">
  import ArrowVertical from '@/assets/icons/ArrowVertical.svelte';
  import BlueCheckIcon from '@/assets/icons/BlueCheckIcon.svelte';
  import { createEventDispatcher, onMount, onDestroy } from 'svelte';

  interface DropdownOption {
    value: any;
    label: string;
    leftIcon?: any;
  }

  export let options: DropdownOption[] = [];
  export let selected: DropdownOption | null = null;
  export let placeholder = 'Select';
  export let disabled = false;
  export let leftIcon: any = null; // Main dropdown left icon
  export let width = 'min-w-[133px]';
  export let variant: 'primary' | 'secondary' = 'primary';
  export let pinLastOptionBottom = false;

  const dispatch = createEventDispatcher<{
    select: DropdownOption;
    change: DropdownOption;
  }>();

  let open = false;
  let dropdownRef: HTMLDivElement;
  let triggerRef: HTMLButtonElement;
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

    dropdownDirection = viewportHeight - triggerRect.bottom >= dropdownHeight ? 'down' : 'up';
  }

  function selectOption(option: DropdownOption) {
    selected = option;
    open = false;
    dispatch('select', option);
    dispatch('change', option);
  }

  function handleClickOutside(event: MouseEvent) {
    if (
      dropdownRef &&
      triggerRef &&
      !dropdownRef.contains(event.target as Node) &&
      !triggerRef.contains(event.target as Node)
    ) {
      open = false;
    }
  }

  onMount(() => {
    document.addEventListener('click', handleClickOutside);
  });

  onDestroy(() => {
    document.removeEventListener('click', handleClickOutside);
  });

  $: buttonClasses = `
      flex ${width} cursor-pointer items-center justify-between 
      rounded-sm  px-3 py-2 font-medium
      focus:ring-2 focus:outline-none
      disabled:cursor-not-allowed disabled:opacity-50
      ${
        variant === 'primary'
          ? 'bg-surface-600 hover:bg-surface-400 text-neutral-100 focus:border-blue-300 focus:ring-blue-300'
          : 'bg-white hover:bg-gray-50 text-gray-900 focus:border-blue-300 focus:ring-blue-300'
      }
    `;
  $: pinnedOption = options.find((opt) => opt.value === 'all');
  $: otherOptions = pinLastOptionBottom ? options.filter((opt) => opt.value !== 'all') : options;

  // Calculate if scrolling is needed (more than 6 items total)
  $: needsScroll = pinLastOptionBottom
    ? otherOptions.length > 5 // 5 regular + 1 pinned = 6 total
    : otherOptions.length > 6;
</script>

<div class="text-fs-ds-12 leading-lh-ds-150 relative font-medium" bind:this={dropdownRef}>
  <button bind:this={triggerRef} class={buttonClasses} on:click={toggleDropdown} {disabled}>
    <div class="flex items-center gap-2">
      {#if leftIcon}
        <svelte:component this={leftIcon} />
      {/if}
      <span class="">
        {#if selected}
          {selected.label.length > 15 ? `${selected.label.slice(0, 15)}...` : selected.label}
        {:else}
          {placeholder}
        {/if}
      </span>
    </div>
    <ArrowVertical {open} />
  </button>

  {#if open}
    <div
      class="dropdown absolute z-10 w-full rounded-md shadow-lg
      {variant === 'primary' ? 'bg-surface-600' : 'bg-white'}
      {dropdownDirection === 'down' ? 'top-full mt-1' : 'bottom-full mb-1'}"
    >
      <ul
        class="px-1 py-1 {needsScroll
          ? 'dropdown-scroll max-h-[240px] overflow-y-auto'
          : ''} {variant === 'primary' ? 'dark' : ''}"
      >
        {#each otherOptions as option}
          <li class="flex items-center justify-between">
            <button
              class="flex w-full cursor-pointer items-center gap-2 rounded-sm px-2 py-2 text-left
              {variant === 'primary'
                ? `hover:bg-surface-400 ${selected?.value === option.value ? 'text-blue-300' : 'text-neutral-100'}`
                : `hover:bg-gray-50 ${selected?.value === option.value ? 'text-blue-600' : 'text-gray-900'}`}"
              on:click={() => selectOption(option)}
            >
              {#if option.leftIcon}
                <svelte:component this={option.leftIcon} />
              {/if}
              {option.label.length > 15 ? `${option.label.slice(0, 15)}...` : option.label}
              {#if selected?.value === option.value}
                <div class="ml-auto">
                  <BlueCheckIcon />
                </div>
              {/if}
            </button>
          </li>
        {/each}
      </ul>

      {#if pinLastOptionBottom && pinnedOption}
        <div class="border-surface-400 border-t px-1 pb-1">
          <button
            class="flex w-full cursor-pointer items-center gap-2 rounded-sm px-2 py-2 text-left
            {variant === 'primary'
              ? `hover:bg-surface-400 ${selected?.value === pinnedOption.value ? 'text-blue-300' : 'text-neutral-100'}`
              : `hover:bg-gray-50 ${selected?.value === pinnedOption.value ? 'text-blue-600' : 'text-gray-900'}`}"
            on:click={() => selectOption(pinnedOption)}
          >
            {#if pinnedOption.leftIcon}
              <svelte:component this={pinnedOption.leftIcon} />
            {/if}
            {pinnedOption.label.length > 15
              ? `${pinnedOption.label.slice(0, 15)}...`
              : pinnedOption.label}
            {#if selected?.value === pinnedOption.value}
              <div class="ml-auto">
                <BlueCheckIcon />
              </div>
            {/if}
          </button>
        </div>
      {/if}
    </div>
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

  /* Custom scrollbar styling */
  .dropdown-scroll::-webkit-scrollbar {
    width: 6px;
  }

  .dropdown-scroll::-webkit-scrollbar-track {
    background: transparent;
    border-radius: 3px;
  }

  .dropdown-scroll::-webkit-scrollbar-thumb {
    background-color: rgba(156, 163, 175, 0.5);
    border-radius: 3px;
    transition: background-color 0.2s ease;
  }

  .dropdown-scroll::-webkit-scrollbar-thumb:hover {
    background-color: rgba(156, 163, 175, 0.8);
  }

  /* For dark variant */
  .dropdown-scroll.dark::-webkit-scrollbar-thumb {
    background-color: rgba(255, 255, 255, 0.2);
  }

  .dropdown-scroll.dark::-webkit-scrollbar-thumb:hover {
    background-color: rgba(255, 255, 255, 0.4);
  }

  /* Firefox scrollbar styling */
  .dropdown-scroll {
    scrollbar-width: thin;
    scrollbar-color: rgba(156, 163, 175, 0.5) transparent;
  }

  .dropdown-scroll.dark {
    scrollbar-color: rgba(255, 255, 255, 0.2) transparent;
  }
</style>
