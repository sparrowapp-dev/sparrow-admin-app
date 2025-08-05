<script lang="ts">
  import DropdownArrow from '@/assets/icons/DropdownArrow.svelte';
  import type { ComponentType } from 'svelte';
  import { createEventDispatcher, onMount } from 'svelte';

  export let icon: ComponentType;
  export let label: { label: string; id: string };
  export let options: { id: string; label: string; value: any; plan?: string }[] = [];
  export let showPlans: boolean = false;
  export let onSelect: (value: any) => void = () => {};

  export let selected: { label: string; id: string } = label;
  export let open = false;
  let searchMode = false;
  let searchTerm = '';

  $: filteredOptions = searchTerm
    ? options.filter((item) => item.label.toLowerCase().includes(searchTerm.toLowerCase()))
    : options;

  const dispatch = createEventDispatcher();
  let dropdownElement: HTMLElement;
  let searchInput: HTMLInputElement;
  let hoveredOption: string | null = null;
  let tooltipPosition = { x: 0, y: 0 };

  function toggleDropdown(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (target.closest('.search-button')) {
      return;
    }

    open = !open;
    searchMode = false;
    if (!open) {
      searchTerm = '';
    }
  }

  function openSearchMode() {
    searchMode = true;
    open = true;
  }

  function selectOption(option: any) {
    open = false;
    searchMode = false;
    searchTerm = '';
    selected = { label: option.label, id: option.id };
    onSelect(option.value);
    dispatch('select', option);
  }

  function getDynamicCssClasses(plan: string) {
    switch (plan) {
      case 'Professional':
        return 'border-cyan-700 text-cyan-300 bg-cyan-900';
      case 'Community':
        return 'border-neutral-500 bg-neutral-700 text-neutral-200';
      case 'Standard':
        return 'border-purple-700 text-purple-200 bg-purple-900';
      case 'Enterprise':
        return 'border-yellow-700 text-yellow-300 bg-yellow-900';
      default:
        return '';
    }
  }

  $: if (searchMode && open && searchInput) {
    setTimeout(() => searchInput.focus(), 0);
  }

  let isTyping = false;
  function handleInput() {
    isTyping = true;
    setTimeout(() => {
      isTyping = false;
    }, 1000);
  }

  function handleMouseEnter(event: MouseEvent, option: any) {
    if (option.label.length > 17) {
      hoveredOption = option.id;
      const rect = (event.target as HTMLElement).getBoundingClientRect();

      tooltipPosition = {
        x: rect.left + rect.width / 4,
        y: rect.bottom - 60, // Position below with 0px gap
      };
    }
  }

  function handleMouseLeave() {
    hoveredOption = null;
  }

  function handleKeydown(event: KeyboardEvent) {
    if (!open) return;

    switch (event.key) {
      case 'Escape':
        event.preventDefault();
        open = false;
        searchMode = false;
        searchTerm = '';
        break;
      case 'ArrowDown':
        event.preventDefault();
        break;
      case 'ArrowUp':
        event.preventDefault();
        break;
      case 'Enter':
        if (filteredOptions.length === 1) {
          event.preventDefault();
          selectOption(filteredOptions[0]);
        }
        break;
    }
  }

  function handleClickOutside(event: MouseEvent) {
    if (dropdownElement && !dropdownElement.contains(event.target as Node)) {
      open = false;
      searchMode = false;
      searchTerm = '';
    }
  }

  onMount(() => {
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  });
</script>

<section class="relative w-full max-w-xs" bind:this={dropdownElement}>
  <button
    on:click={toggleDropdown}
    on:keydown={handleKeydown}
    class="flex w-full items-center gap-2 rounded px-3 transition-colors duration-200 {searchMode
      ? 'py-2'
      : 'py-3'} {searchMode || open
      ? 'bg-surface-600'
      : 'bg-transparent'} hover:bg-surface-500 focus:bg-surface-500 cursor-pointer text-neutral-50 focus:ring-2 focus:ring-blue-300 focus:outline-none"
    aria-expanded={open}
    aria-haspopup="listbox"
  >
    <svelte:component this={icon} class="flex-shrink-0" />

    {#if !searchMode}
      <button
        class="search-button font-inter text-fs-ds-12 fw-ds-500 max-w-[186px] flex-1 cursor-pointer truncate text-start text-neutral-50 focus:outline-none"
        on:click|stopPropagation={openSearchMode}
        tabindex="-1"
      >
        {selected.label}
      </button>
    {:else}
      <div class="flex-1">
        <input
          bind:this={searchInput}
          type="text"
          class="font-inter text-fs-ds-12 fw-ds-500 w-full max-w-[186px] bg-transparent text-neutral-50 placeholder-neutral-400 outline-none"
          placeholder="Search..."
          bind:value={searchTerm}
          on:input={handleInput}
          on:click|stopPropagation
          on:keydown|stopPropagation={handleKeydown}
        />
      </div>
    {/if}

    <button
      class="flex-shrink-0 cursor-pointer focus:outline-none"
      on:click|stopPropagation={toggleDropdown}
      tabindex="-1"
    >
      <DropdownArrow {open} />
    </button>
  </button>

  {#if open}
    <div class="absolute z-50 mt-1 w-full">
      <div
        class="bg-surface-600 border-surface-500 flex max-h-70 w-full flex-col rounded-sm border shadow-lg"
        role="listbox"
      >
        <div class="max-h-64 overflow-y-auto p-1">
          {#if filteredOptions.length === 0}
            <div
              class="leading-lh-ds-143 text-fs-ds-14 flex items-center justify-center p-6 text-neutral-400"
            >
              No results found.
            </div>
          {:else}
            {#each filteredOptions as option, index}
              <button
                class="font-inter font-fw-ds-400 text-fs-ds-12 leading-lh-ds-130
                hover:bg-surface-400 focus:bg-surface-400 flex w-full cursor-pointer items-center
                justify-between rounded-sm px-2 py-2.5 transition-colors
                duration-200 ease-in-out focus:ring-2 focus:ring-blue-300 focus:outline-none
                {selected.id.toString() === option.id.toString()
                  ? 'bg-surface-500 text-blue-300'
                  : 'text-neutral-50'}"
                on:click={() => selectOption(option)}
                on:mouseenter={(e) => handleMouseEnter(e, option)}
                on:mouseleave={handleMouseLeave}
                role="option"
                aria-selected={selected.id.toString() === option.id.toString()}
              >
                <span class="block min-w-0 flex-1 truncate text-left">
                  {option.label}
                </span>

                <div class="ml-2 flex-shrink-0">
                  {#if selected.id.toString() === option.id.toString()}
                    <span class="flex items-center">
                      <svg
                        width="12"
                        height="9"
                        viewBox="0 0 12 9"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        aria-hidden="true"
                      >
                        <path
                          d="M11.8639 0.656087C12.0533 0.857041 12.0439 1.17348 11.8429 1.36288L3.91309 8.83678C3.67573 9.0605 3.30311 9.05361 3.07417 8.82126L0.393838 6.10093C0.200027 5.90422 0.202372 5.58765 0.399074 5.39384C0.595777 5.20003 0.912351 5.20237 1.10616 5.39908L3.51192 7.84073L11.1571 0.635166C11.358 0.445766 11.6745 0.455133 11.8639 0.656087Z"
                          fill="currentColor"
                        />
                      </svg>
                    </span>
                  {:else if showPlans && option.plan}
                    <span
                      class="rounded border px-1.5 py-0.5 text-xs whitespace-nowrap {getDynamicCssClasses(
                        option.plan,
                      )}"
                    >
                      {option.plan}
                    </span>
                  {/if}
                </div>
              </button>
            {/each}
          {/if}
        </div>
      </div>
    </div>
  {/if}

  <!-- Custom Tooltip -->
  {#if hoveredOption && open}
    {@const option = filteredOptions.find((opt) => opt.id === hoveredOption)}
    {#if option && option.label.length > 17}
      <div
        class="pointer-events-none fixed z-[9999]"
        style="left: {tooltipPosition.x}px; top: {tooltipPosition.y}px; transform: translateX(-50%);"
      >
        <div
          class="relative max-w-[200px] rounded-md border border-surface-100 bg-surface-100 px-3 py-2 text-xs text-white shadow-lg"
        >
          <div class="leading-relaxed break-words whitespace-pre-wrap">
            {option.label}
          </div>

          <div class="absolute bottom-full left-1/2 -translate-x-1/2 transform">
            <div
              class="h-0 w-0 border-r-[6px] border-b-[6px] border-l-[6px] border-r-transparent border-b-surface-100 border-l-transparent"
            ></div>

            <div
              class="absolute bottom-0 left-1/2 h-0 w-0 -translate-x-1/2 translate-y-[1px] transform border-r-[7px] border-b-[7px] border-l-[7px] border-r-transparent border-b-surface-100 border-l-transparent"
            ></div>
          </div>
        </div>
      </div>
    {/if}
  {/if}
</section>
