<script>
  import { createEventDispatcher } from 'svelte';

  // Props from parent
  export let pageIndex = 0;
  export let pageSize = 10;
  export let totalItems = 0;
  export let isLoading = false;

  // Pagination options
  export let pageSizeOptions = [5, 10, 20, 50];

  // Calculate total pages
  $: pageCount = Math.ceil(totalItems / pageSize);
  $: canPreviousPage = pageIndex > 0;
  $: canNextPage = pageIndex < pageCount - 1;

  // Create ranges for pagination display
  $: pageRange = getPageRange(pageIndex, pageCount);

  // Event dispatcher
  const dispatch = createEventDispatcher();

  // Handle page size change
  function handlePageSizeChange(event) {
    const newPageSize = Number(event.target.value);
    dispatch('pageSizeChange', newPageSize);
  }

  // Handle page navigation
  function goToPage(newPageIndex) {
    if (newPageIndex >= 0 && newPageIndex < pageCount) {
      dispatch('pageChange', newPageIndex);
    }
  }

  // Helper to create page range with ellipsis
  function getPageRange(currentPage, totalPages) {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i);
    }

    const range = [0];

    if (currentPage > 2) {
      range.push('...');
    }

    const start = Math.max(1, currentPage - 1);
    const end = Math.min(totalPages - 2, currentPage + 1);

    for (let i = start; i <= end; i++) {
      range.push(i);
    }

    if (currentPage < totalPages - 3) {
      range.push('...');
    }

    if (totalPages > 1) {
      range.push(totalPages - 1);
    }

    return range;
  }
</script>

<div class="mt-4 flex flex-wrap items-center justify-between gap-4">
  <div class="flex items-center justify-between gap-4">
    <div class="text-sm text-gray-500">
      Showing {totalItems === 0 ? 0 : pageIndex * pageSize + 1} - {Math.min(
        (pageIndex + 1) * pageSize,
        totalItems,
      )} of {totalItems} items
    </div>

    <div class="flex items-center gap-2">
      <select
        value={pageSize}
        on:change={handlePageSizeChange}
        disabled={isLoading}
        class="cursor-pointer rounded-sm border border-gray-300 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
        aria-label="Items per page"
      >
        {#each pageSizeOptions as option}
          <option value={option}>
            {option} per page
          </option>
        {/each}
      </select>
    </div>
  </div>

  <div class="flex items-center gap-1">
    <button
      class="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-sm border border-gray-300 bg-white text-sm transition-all hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
      on:click={() => goToPage(0)}
      disabled={!canPreviousPage || isLoading}
      aria-label="First page"
    >
      «
    </button>

    <button
      class="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-sm border border-gray-300 bg-white text-sm transition-all hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
      on:click={() => goToPage(pageIndex - 1)}
      disabled={!canPreviousPage || isLoading}
      aria-label="Previous page"
    >
      ‹
    </button>

    {#each pageRange as page}
      {#if page === '...'}
        <span class="inline-flex h-8 w-8 items-center justify-center text-sm text-white">...</span>
      {:else}
        <button
          class="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-sm border border-gray-300 bg-white text-sm transition-all hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 {page ===
          pageIndex
            ? 'border-blue-600 bg-blue-600 text-blue-400'
            : ''}"
          on:click={() => goToPage(page)}
          disabled={isLoading}
        >
          {page + 1}
        </button>
      {/if}
    {/each}

    <button
      class="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-sm border border-gray-300 bg-white text-sm transition-all hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
      on:click={() => goToPage(pageIndex + 1)}
      disabled={!canNextPage || isLoading}
      aria-label="Next page"
    >
      ›
    </button>

    <button
      class="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-sm border border-gray-300 bg-white text-sm transition-all hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
      on:click={() => goToPage(pageCount - 1)}
      disabled={!canNextPage || isLoading}
      aria-label="Last page"
    >
      »
    </button>
  </div>
</div>
