<script>
  import { createEventDispatcher } from 'svelte';
  import Dropdown from './Dropdown.svelte';
  import BlueCheckIcon from '@/assets/icons/BlueCheckIcon.svelte';

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
    const newPageSize = Number(event.detail);
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
      <Dropdown
        options={pageSizeOptions}
        selected={pageSize}
        on:change={handlePageSizeChange}
        labelRenderer={(option) => `${option} per page`}
        placeholder="Items per page"
        disabled={isLoading}
      />
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
