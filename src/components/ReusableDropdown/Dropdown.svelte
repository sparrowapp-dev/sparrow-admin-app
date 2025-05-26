<script lang="ts">
  import DropdownArrow from '@/assets/icons/DropdownArrow.svelte';
  import Tooltip from '../Tooltip/Tooltip.svelte';
  import type { ComponentType } from 'svelte';

  export let icon: ComponentType;
  export let label: { label: string; id: string };
  export let options: { id: string; label: string; value: any; plan?: string }[] = [];
  export let showPlans: boolean = false;
  export let onSelect: (value: any) => void = () => {};

  let selected: { label: string; id: string } = label;
  export let open = false;
  let searchMode = false;
  let searchTerm = '';

  $: filteredOptions = searchTerm
    ? options.filter((item) => item.label.toLowerCase().includes(searchTerm.toLowerCase()))
    : options;

  function toggleDropdown() {
    open = !open;
    searchMode = false;
    if (!open) searchTerm = '';
  }

  function openSearchMode() {
    searchMode = true;
    open = true;
  }

  function selectOption(option) {
    open = false;
    searchMode = false;
    searchTerm = '';
    selected = { label: option.label, id: option.id };
    onSelect(option.value);
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
  let searchInput: HTMLInputElement;

  $: if (searchMode && open && searchInput) {
    searchInput.focus();
  }
</script>

<section class="relative w-full max-w-xs">
  <div
    class="flex w-full items-center gap-2 rounded px-3 py-2 {searchMode
      ? 'border border-blue-300'
      : 'py-3'} {searchMode || open
      ? 'bg-surface-600'
      : ''} hover:bg-surface-500 focus-within:bg-surface-500 text-neutral-50 focus-within:outline-2 focus-within:outline-blue-300"
  >
    <svelte:component this={icon} />

    {#if !searchMode}
      <button
        class="font-inter text-fs-ds-12 fw-ds-500 focus-within:bg-surface-500 max-w-[186px] flex-1 cursor-pointer truncate text-neutral-50 focus-within:outline-2 focus-within:outline-blue-300"
        on:click={openSearchMode}
      >
        {label.label}
      </button>
    {:else}
      <div class="">
        <input
          bind:this={searchInput}
          type="text"
          class="font-inter text-fs-ds-12 max-w-[186px] flex-1 text-neutral-50 outline-none"
          placeholder="Search"
          bind:value={searchTerm}
        />
      </div>
    {/if}

    <!-- Always-visible arrow -->
    <button class="cursor-pointer" on:click={toggleDropdown}>
      <DropdownArrow {open} />
    </button>
  </div>

  {#if open}
    <div class="bg-surface-600 w-full shadow-2xs">
      <div
        class="bg-surface-600 custom-scroll absolute z-10 mt-1 flex max-h-70 w-full flex-col gap-2 overflow-y-auto p-1 shadow"
      >
        {#if filteredOptions.length === 0}
          <div
            class="leading-lh-ds-143 text-fs-ds-14 flex items-center justify-center p-6 text-neutral-400"
          >
            No result found.
          </div>
        {:else}
          {#each filteredOptions as option, index}
            <button
              class="font-inter font-fw-ds-400 text-fs-ds-12 leading-lh-ds-130 flex w-full cursor-pointer items-center justify-between p-1 py-2 {selected.id ===
              option.id
                ? 'text-blue-300'
                : 'text-neutral-50'}"
              on:click={() => selectOption(option)}
            >
              <Tooltip
                text={option.label}
                position={index === 0 ? 'bottom' : 'top'}
                mode="hover"
                size="xs"
              >
                <!-- Add max-width and truncation to prevent long text from breaking layout -->
                <span class="block max-w-[100px] truncate text-left" title={option.label}>
                  {option.label}
                </span>
              </Tooltip>

              <div class="ml-2 flex-shrink-0">
                {#if selected.id === option.id}
                  <span>
                    <svg
                      width="12"
                      height="9"
                      viewBox="0 0 12 9"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M11.8639 0.656087C12.0533 0.857041 12.0439 1.17348 11.8429 1.36288L3.91309 8.83678C3.67573 9.0605 3.30311 9.05361 3.07417 8.82126L0.393838 6.10093C0.200027 5.90422 0.202372 5.58765 0.399074 5.39384C0.595777 5.20003 0.912351 5.20237 1.10616 5.39908L3.51192 7.84073L11.1571 0.635166C11.358 0.445766 11.6745 0.455133 11.8639 0.656087Z"
                        fill="#6894F9"
                      />
                    </svg>
                  </span>
                {:else if showPlans && option.plan}
                  <span
                    class="rounded-[2x] border px-1 py-0.5 whitespace-nowrap {getDynamicCssClasses(
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
  {/if}
</section>

<style>
  .custom-scroll::-webkit-scrollbar {
    width: 4px;
  }

  .custom-scroll::-webkit-scrollbar-thumb {
    background-color: rgba(255, 255, 255, 0.2); /* Light thumb */
    border-radius: 4px;
  }

  .custom-scroll::-webkit-scrollbar-track {
    background: transparent;
  }

  .custom-scroll {
    scrollbar-color: #31353f transparent;
    scrollbar-width: thin;
  }
</style>
