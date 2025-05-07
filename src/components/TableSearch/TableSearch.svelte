<script>
  import CloseIcon from '@/assets/icons/CloseIcon.svelte';
  import Search from '@/assets/icons/Search.svelte';
  import { createEventDispatcher } from 'svelte';
  import { tick } from 'svelte';

  // Props from parent
  export let value = '';
  export let placeholder = 'Search';
  export let debounceMs = 600;
  export let isLoading = false;

  // Local state
  let inputValue = value;
  let debounceTimer;
  let inputElement;

  // Event dispatcher
  const dispatch = createEventDispatcher();

  // Handle input change with debounce
  function handleInput(event) {
    clearTimeout(debounceTimer);
    inputValue = event.target.value;

    debounceTimer = setTimeout(() => {
      dispatch('search', inputValue);
    }, debounceMs);
  }

  // Handle search clear
  function clearSearch() {
    inputValue = '';
    dispatch('search', '');

    // Focus the input after clearing
    tick().then(() => {
      if (inputElement) {
        inputElement.focus();
      }
    });
  }

  // Handle form submission (prevent default)
  function handleSubmit(event) {
    event.preventDefault();
    dispatch('search', inputValue);
  }
</script>

<form class="w-full max-w-xl" on:submit={handleSubmit}>
  <div class="relative flex items-center">
    <div class="absolute left-3 text-neutral-300">
      <!-- Search Icon -->
      <Search />
    </div>

    <input
      type="text"
      bind:this={inputElement}
      bind:value={inputValue}
      on:input={handleInput}
      {placeholder}
      disabled={isLoading}
      class="bg-surface-600 w-full rounded-md border border-transparent py-2 pr-4 pl-10 text-sm text-white focus:border-blue-300 focus:outline-none disabled:cursor-not-allowed disabled:bg-gray-50 disabled:opacity-70"
    />

    {#if inputValue}
      <button
        type="button"
        class="absolute right-3 cursor-pointer p-1 disabled:cursor-not-allowed disabled:opacity-50"
        on:click={clearSearch}
        disabled={isLoading}
        aria-label="Clear search"
      >
        <!-- Clear Icon -->
        <CloseIcon />
      </button>
    {/if}
  </div>
</form>
