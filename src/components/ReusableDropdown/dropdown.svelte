<script lang="ts">
  import Tooltip from '../Tooltip/Tooltip.svelte';

  export let icon: typeof import('svelte').SvelteComponent;
  export let label: string;
  export let options;
  export let onSelect: (value: string) => void = () => {};
  let selected = label;
  let open = false;
  let searchMode = false;
  let searchTerm = '';
  $: filteredOptions = searchTerm
    ? options.filter((item) => item.value.toLowerCase().includes(searchTerm.toLowerCase()))
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
  function selectOption(labelText: string) {
    open = false;
    searchMode = false;
    searchTerm = '';
    label = labelText;
    selected = labelText;
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
</script>

<section class="relative w-full max-w-xs">
  <div
    class="flex w-full items-center gap-2 rounded px-3 py-2 {searchMode
      ? 'border border-blue-300'
      : ''} {searchMode || open
      ? 'bg-surface-600'
      : ''} hover:bg-surface-500 focus-within:bg-surface-500 text-neutral-50 focus-within:outline focus-within:outline-2 focus-within:outline-blue-300"
  >
    <svelte:component this={icon} />

    {#if !searchMode}
      <div
        class="font-inter text-fs-ds-12 leading-lh-ds-150 flex-1 cursor-pointer truncate font-medium text-neutral-50"
        on:click={openSearchMode}
      >
        {label}
      </div>
    {:else}
      <div class="">
        <input
          type="text"
          class="font-inter max-w-[186px] flex-1 text-neutral-50 outline-none"
          placeholder="Search..."
          bind:value={searchTerm}
        />
      </div>
    {/if}

    <!-- Always-visible arrow -->
    <div class="cursor-pointer" on:click={toggleDropdown}>
      <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M1.9569 0C1.14921 0 0.674755 0.90803 1.136 1.57107L3.76863 5.35548C4.36541 6.21335 5.63457 6.21335 6.23135 5.35548L8.86399 1.57106C9.32523 0.908027 8.85077 0 8.04308 0H1.9569Z"
          fill="white"
        />
      </svg>
    </div>
  </div>

  {#if open}
    <div class="bg-surface-600 w-full">
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
          {#each filteredOptions as key, index}
            <button
              class="font-inter font-regular text-fs-ds-12 leading-lh-ds-130 flex w-full cursor-pointer items-center justify-between p-1 py-2 text-neutral-50"
              on:click={() => selectOption(key?.value)}
            >
              <Tooltip
                text={key?.value}
                position={index === 0 ? 'bottom' : 'top'}
                mode="hover"
                size="xs"
              >
                <span>{key.value}</span>
              </Tooltip>
              {#if selected === key?.value}<span
                  ><svg
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
              {:else}
                <span class="rounded-[2x] border px-1 py-0.5 {getDynamicCssClasses(key?.plan)}">
                  {key?.plan}
                </span>
              {/if}
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
