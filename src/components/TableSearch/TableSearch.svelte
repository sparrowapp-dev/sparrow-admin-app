<script>
  import { createEventDispatcher } from 'svelte';
  import { tick } from 'svelte';

  // Props from parent
  export let value = '';
  export let placeholder = 'Search...';
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
    <div class="absolute left-3 text-gray-500">
      <!-- Search Icon -->
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        fill="currentColor"
        viewBox="0 0 16 16"
      >
        <path
          d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"
        />
      </svg>
    </div>

    <input
      type="text"
      bind:this={inputElement}
      bind:value={inputValue}
      on:input={handleInput}
      {placeholder}
      disabled={isLoading}
      class="w-full rounded-md border border-gray-300 py-2 pr-4 pl-10 text-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-400 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:opacity-70 text-white"
    />

    {#if inputValue}
      <button
        type="button"
        class="absolute right-3 rounded-full p-1 text-gray-500 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
        on:click={clearSearch}
        disabled={isLoading}
        aria-label="Clear search"
      >
        <!-- Clear Icon -->
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          fill="currentColor"
          viewBox="0 0 16 16"
        >
          <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z" />
          <path
            d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"
          />
        </svg>
      </button>
    {/if}
  </div>
</form>
