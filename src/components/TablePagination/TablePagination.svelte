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

<div class="relative mt-4 flex flex-wrap items-center justify-between gap-4">
  <div class="flex items-center justify-between gap-4">
    <div class="text-fs-ds-12 leading-lh-ds-130 font-regular text-inter text-[#8A9299]">
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
        class="bg-surface-600 text-fs-ds-12 font-inter leading-lh-ds-150 cursor-pointer rounded-sm border border-gray-700 px-3 py-2 font-medium text-neutral-100 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
        aria-label="Items per page"
      >
        {#each pageSizeOptions as option}
          <option value={option}>
            {option} per page<svg
              width="10"
              height="6"
              viewBox="0 0 10 6"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M1.95681 0C1.14912 0 0.674663 0.90803 1.13591 1.57107L3.76854 5.35548C4.36532 6.21335 5.63448 6.21335 6.23126 5.35548L8.8639 1.57106C9.32514 0.908027 8.85068 0 8.04299 0H1.95681Z"
                fill="white"
              />
            </svg>
          </option>
        {/each}
      </select>
    </div>
  </div>

  <div class="flex items-center gap-1">
    <button
      class="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-sm text-sm text-white transition-all hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
      on:click={() => goToPage(0)}
      disabled={!canPreviousPage || isLoading}
      aria-label="First page"
    >
      «
    </button>

    <button
      class="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-sm text-sm text-white transition-all hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
      on:click={() => goToPage(pageIndex - 1)}
      disabled={!canPreviousPage || isLoading}
      aria-label="Previous page"
    >
      ‹
    </button>

    <!-- {#each pageRange as page}
      {#if page === '...'}
        <span class="text-surface-1000 inline-flex h-8 w-8 items-center justify-center text-sm"
          >...</span
        >
      {:else}
        <button
          class="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-sm border text-sm transition-all disabled:cursor-not-allowed disabled:opacity-50
          {page === pageIndex
            ? 'border-blue-600 bg-blue-600 text-white'
            : 'border-gray-700  text-white hover:bg-gray-700'}"
          on:click={() => goToPage(page)}
          disabled={isLoading}
        >
          {page + 1}
        </button>
      {/if}
    {/each} -->

    <button
      class="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-sm text-sm text-white transition-all hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
      on:click={() => goToPage(pageIndex + 1)}
      disabled={!canNextPage || isLoading}
      aria-label="Next page"
    >
      ›
    </button>

    <button
      class="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-sm text-sm text-white transition-all hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
      on:click={() => goToPage(pageCount - 1)}
      disabled={!canNextPage || isLoading}
      aria-label="Last page"
    >
      »
    </button>
  </div>
</div>
