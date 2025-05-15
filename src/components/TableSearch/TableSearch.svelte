<script lang="ts">
  import CloseIcon from '@/assets/icons/CloseIcon.svelte';
  import Search from '@/assets/icons/Search.svelte';
  import { createEventDispatcher } from 'svelte';
  import { tick } from 'svelte';

  // Props from parent
  export let value = '';
  export let placeholder = 'Search';
  export let debounceMs = 600;
  export let isLoading = false;
  export let width = 'max-w-[220px]'; // New width prop with default value

  // Local state
  let inputValue = value;
  let debounceTimer: ReturnType<typeof setTimeout>;
  let inputElement: HTMLInputElement;

  // Event dispatcher
  const dispatch = createEventDispatcher();

  // Handle input change with debounce
  async function handleInput(event: Event) {
    const target = event.target as HTMLInputElement;
    clearTimeout(debounceTimer);
    inputValue = target.value;

    debounceTimer = setTimeout(async () => {
      dispatch('search', inputValue);
      await tick();
      inputElement?.focus();
    }, debounceMs);
  }

  // Handle search clear
  async function clearSearch() {
    inputValue = '';
    dispatch('search', '');
    await tick();
    inputElement?.focus();
  }

  // Handle form submission (prevent default)
  function handleSubmit(event: Event) {
    event.preventDefault();
    dispatch('search', inputValue);
  }

  // Cleanup on destroy
  import { onDestroy } from 'svelte';
  onDestroy(() => {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }
  });
</script>

<form class="w-full {width}" on:submit={handleSubmit}>
  <div class="relative flex items-center justify-between">
    <div class="absolute left-3 text-neutral-300">
      <Search />
    </div>

    <input
      bind:this={inputElement}
      bind:value={inputValue}
      on:input={handleInput}
      {placeholder}
      class="bg-surface-600 text-fs-ds-14 disabled:bg-surface-700 w-full rounded-md border border-transparent py-1.5
             pr-8 pl-10 text-neutral-50
             placeholder-neutral-400 focus:border-blue-300 focus:ring-1 focus:ring-blue-300
             focus:outline-none disabled:cursor-not-allowed disabled:opacity-70"
    />

    {#if inputValue}
      <button
        type="button"
        class="absolute right-3 cursor-pointer p-1 text-neutral-400
               hover:text-neutral-300 focus:ring-2 focus:outline-none
               disabled:cursor-not-allowed disabled:opacity-50"
        on:click={clearSearch}
        disabled={isLoading}
        aria-label="Clear search"
      >
        <CloseIcon />
      </button>
    {/if}
  </div>
</form>
