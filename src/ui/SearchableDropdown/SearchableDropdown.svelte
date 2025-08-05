<script lang="ts">
  import ArrowVerticalV2 from '@/assets/icons/ArrowVerticalV2.svelte';
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
  export let searchPlaceholder = 'Search...';
  export let disabled = false;
  export let leftIcon: any = null;
  export let width = 'min-w-[133px]';
  export let variant: 'primary' | 'secondary' = 'primary';
  export let pinLastOptionBottom = false;
  export let hasError = false;
  export let maxHeight = '240px';

  const dispatch = createEventDispatcher<{
    select: DropdownOption;
    change: DropdownOption;
  }>();

  let open = false;
  let dropdownRef: HTMLDivElement;
  let inputRef: HTMLInputElement;
  let dropdownDirection = 'down';
  let searchTerm = '';
  let filteredOptions: DropdownOption[] = [];
  let dropdownPosition = { left: 0, top: 0, bottom: 0, width: 0 };
  let portalTarget: HTMLElement;

  // Update filtered options when search term or options change
  $: {
    if (searchTerm.trim() === '') {
      filteredOptions = options;
    } else {
      const term = searchTerm.toLowerCase();
      filteredOptions = options.filter(
        (option) =>
          option.label.toLowerCase().includes(term) ||
          option.value.toString().toLowerCase().includes(term),
      );
    }
  }

  function openDropdown() {
    if (!disabled && !open) {
      open = true;
      searchTerm = ''; // Clear search term to show all options

      // Focus input when opened
      setTimeout(() => {
        if (inputRef) {
          inputRef.focus();
        }
        updateDropdownPosition();
      }, 0);
    }
  }

  function closeDropdown() {
    open = false;
    searchTerm = '';
  }

  function updateDropdownPosition() {
    if (!dropdownRef) return;

    const rect = dropdownRef.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    // Use maxHeight value to calculate if dropdown fits
    const dropdownHeight = parseInt(maxHeight.replace('px', '')) || 240;

    dropdownDirection = viewportHeight - rect.bottom >= dropdownHeight ? 'down' : 'up';

    dropdownPosition = {
      left: rect.left,
      top: rect.bottom + 1,
      bottom: viewportHeight - rect.top + 1,
      width: dropdownRef.offsetWidth,
    };
  }

  function selectOption(option: DropdownOption) {
    selected = option;
    closeDropdown();
    dispatch('select', option);
    dispatch('change', option);
  }

  function handleClickOutside(event: MouseEvent) {
    if (dropdownRef && !dropdownRef.contains(event.target as Node)) {
      closeDropdown();
    }
  }

  function handleKeydown(event: KeyboardEvent) {
    if (!open) return;

    if (event.key === 'Escape') {
      closeDropdown();
    } else if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault(); // Prevent scrolling the page

      if (filteredOptions.length === 0) return;

      const currentIndex = selected
        ? filteredOptions.findIndex((o) => o.value === selected?.value)
        : -1;

      let newIndex;
      if (event.key === 'ArrowDown') {
        newIndex = currentIndex < filteredOptions.length - 1 ? currentIndex + 1 : 0;
      } else {
        newIndex = currentIndex > 0 ? currentIndex - 1 : filteredOptions.length - 1;
      }

      selectOption(filteredOptions[newIndex]);
      searchTerm = filteredOptions[newIndex].label;
    } else if (event.key === 'Enter' && filteredOptions.length > 0) {
      // Select first option or current option on Enter
      const optionToSelect =
        selected && filteredOptions.some((o) => o.value === selected?.value)
          ? selected
          : filteredOptions[0];

      selectOption(optionToSelect);
    }
  }

  function handleScroll() {
    if (open) {
      updateDropdownPosition();
    }
  }

  onMount(() => {
    // Create portal target for dropdown
    portalTarget = document.createElement('div');
    portalTarget.style.position = 'absolute';
    portalTarget.style.top = '0';
    portalTarget.style.left = '0';
    portalTarget.style.zIndex = '9999';
    portalTarget.style.pointerEvents = 'none';
    document.body.appendChild(portalTarget);

    document.addEventListener('click', handleClickOutside);
    document.addEventListener('keydown', handleKeydown);
    window.addEventListener('resize', updateDropdownPosition);

    // Add scroll event listeners to window and all scrollable parents
    window.addEventListener('scroll', handleScroll, true);
  });

  onDestroy(() => {
    // Clean up portal target
    if (portalTarget && portalTarget.parentNode) {
      portalTarget.parentNode.removeChild(portalTarget);
    }

    document.removeEventListener('click', handleClickOutside);
    document.removeEventListener('keydown', handleKeydown);
    window.removeEventListener('resize', updateDropdownPosition);
    window.removeEventListener('scroll', handleScroll, true);
  });

  // Input classes with error state handling
  $: inputClasses = `
          w-full rounded-sm px-3 py-2 ${width}
          text-fs-ds-14 font-fw-ds-300
          focus:ring-1 focus:outline-none
          disabled:cursor-not-allowed disabled:opacity-50 
          ${hasError ? 'border border-red-300' : 'border-transparent hover:border-neutral-300'}
          ${
            variant === 'primary'
              ? 'bg-surface-400 hover:bg-surface-400 text-neutral-50 placeholder:text-neutral-400 focus:border-blue-300 focus:ring-blue-300'
              : 'bg-white hover:bg-gray-50 text-gray-900 placeholder:text-gray-400 focus:border-blue-300 focus:ring-blue-300'
          }
        `;

  // Button classes with error state handling
  $: buttonClasses = `
          flex ${width} cursor-pointer items-center justify-between 
          rounded-sm px-3 py-2 
          focus:ring-1 focus:outline-none
          disabled:cursor-not-allowed disabled:opacity-50 
          ${hasError ? 'border border-red-300' : 'border border-transparent hover:border-neutral-300'}
          ${
            variant === 'primary'
              ? 'bg-surface-400 text-neutral-100 focus:border-blue-300 focus:ring-blue-300'
              : 'bg-white text-gray-900 focus:border-blue-300 focus:ring-blue-300'
          }
        `;

  // Calculate if scrolling is needed (more than 5 items after search)
  $: needsScroll = filteredOptions.length > 5;
</script>

<div class="text-fs-ds-12 leading-lh-ds-150 relative" bind:this={dropdownRef}>
  {#if open}
    <div class="relative ml-1 flex items-center">
      <input
        bind:this={inputRef}
        bind:value={searchTerm}
        type="text"
        placeholder={searchPlaceholder}
        class={inputClasses}
        {disabled}
      />
      <div class="absolute top-1/2 right-3 -translate-y-1/2 transform">
        <ArrowVerticalV2 open={true} />
      </div>
    </div>
  {:else}
    <button class={buttonClasses} on:click={openDropdown} {disabled}>
      <div class="flex items-center gap-2">
        {#if leftIcon}
          <svelte:component this={leftIcon} />
        {/if}
        <span
          class="text-fs-ds-14 font-fw-ds-300 {selected ? 'text-neutral-50' : 'text-neutral-400'}"
        >
          {#if selected}
            {selected.label}
          {:else}
            {placeholder}
          {/if}
        </span>
      </div>
      <ArrowVerticalV2 open={false} />
    </button>
  {/if}

  {#if open && portalTarget}
    <!-- Render dropdown in portal to escape parent container clipping -->
    {#await import('svelte')}
      <!-- Loading -->
    {:then}
      <div
        style="position: fixed; 
               left: {dropdownPosition.left}px; 
               {dropdownDirection === 'down'
          ? `top: ${dropdownPosition.top}px;`
          : `bottom: ${dropdownPosition.bottom}px;`}
               width: {dropdownPosition.width}px;
               z-index: 9999;
               pointer-events: auto;"
      >
        <div
          class="overflow-hidden rounded-md shadow-lg {variant === 'primary'
            ? 'bg-surface-600'
            : 'bg-white'}"
        >
          <ul
            class="px-1 py-1 {needsScroll ? 'overflow-y-auto' : ''} {variant === 'primary'
              ? 'dark'
              : ''}"
            style="max-height: {maxHeight};"
          >
            {#if filteredOptions.length === 0}
              <li class="px-2 py-2 text-neutral-400">No results found</li>
            {:else}
              {#each filteredOptions as option}
                <li class="flex items-center justify-between">
                  <button
                    class="font-fw-ds-300 flex w-full cursor-pointer items-center gap-2 rounded-sm px-2 py-2 text-left
                            {variant === 'primary'
                      ? `hover:bg-surface-400 ${selected?.value === option.value ? 'text-blue-300' : 'text-neutral-50'}`
                      : `hover:bg-gray-50 ${selected?.value === option.value ? 'text-blue-600' : 'text-gray-900'}`}"
                    on:click={() => selectOption(option)}
                  >
                    {#if option.leftIcon}
                      <svelte:component this={option.leftIcon} />
                    {/if}
                    {option.label}
                    {#if selected?.value === option.value}
                      <div class="ml-auto">
                        <BlueCheckIcon />
                      </div>
                    {/if}
                  </button>
                </li>
              {/each}
            {/if}
          </ul>
        </div>
      </div>
    {/await}
  {/if}
</div>
