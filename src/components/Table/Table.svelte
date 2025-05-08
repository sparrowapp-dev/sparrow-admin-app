<script lang="ts">
  import { createSvelteTable, type ColumnDef } from '@tanstack/svelte-table';
  import { getCoreRowModel, getSortedRowModel } from '@tanstack/svelte-table';
  import { onMount, createEventDispatcher } from 'svelte';
  import type { SortingState } from '@tanstack/table-core';
  import SortIcon from '@/assets/icons/SortIcon.svelte';

  const dispatch = createEventDispatcher();
  // Props with TypeScript types
  export let columns: ColumnDef<any, any>[] = [];
  export let fetchData: (options: {
    pagination: { pageIndex: number; pageSize: number };
    filters: { searchTerm: string };
    sorting: SortingState;
  }) => Promise<{ data: any[]; totalItems: number; pageCount: number }>;
  export let initialPageSize = 10;
  export let initialPageIndex = 0;
  export let initialSearchTerm = '';
  export let isLoading = false;

  // Internal state
  let data: any[] = [];
  let totalItems = 0;
  let pageCount = 0;
  let sorting: SortingState = [];
  let activeDropdownId: string | null = null; // Add this to track active dropdown

  // Helper function for sort icons
  function getSortIcon(sortDirection: string | false): string {
    if (!data.length) return 'opacity-0';
    if (sortDirection === 'asc') return 'opacity-100';
    if (sortDirection === 'desc') return 'opacity-100';
    return 'opacity-60 group-hover:opacity-100';
  }

  // Close dropdown when clicking outside
  function handleClickOutside(event: MouseEvent) {
    if (activeDropdownId && !(event.target as HTMLElement).closest('[data-action="toggle-menu"]')) {
      activeDropdownId = null;
    }
  }

  // Reactive pagination and filters
  $: pagination = {
    pageIndex: initialPageIndex,
    pageSize: initialPageSize,
  };

  $: filters = {
    searchTerm: initialSearchTerm,
  };

  // Load data function
  async function loadData() {
    try {
      isLoading = true;
      const result = await fetchData({ pagination, filters, sorting });
      data = result.data;
      totalItems = result.totalItems;
      pageCount = Math.ceil(totalItems / pagination.pageSize);

      dispatch('stateChange', {
        pagination,
        filters,
        sorting,
        totalItems,
        pageCount,
      });
    } catch (error) {
      console.error('Error loading data:', error);
      dispatch('error', error);
    } finally {
      isLoading = false;
    }
  }

  // Create table instance
  $: table = createSvelteTable({
    data,
    columns,
    state: {
      pagination,
      sorting,
    },
    onSortingChange: (updater) => {
      if (typeof updater === 'function') {
        sorting = updater(sorting);
      } else {
        sorting = updater;
      }
      dispatch('sortingChange', sorting);
    },
    manualPagination: true,
    manualSorting: true,
    pageCount,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  // Watch for changes to reload data
  $: pagination, filters, sorting, loadData();

  onMount(() => {
    loadData();
    // Add global click listener to close dropdowns when clicking outside
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  });
</script>

<div class="relative w-full">
  {#if isLoading}
    <div class="bg-surface-800 bg-opacity-50 absolute inset-0 flex items-center justify-center">
      <div
        class="h-6 w-6 animate-spin rounded-full border-2 border-neutral-300 border-t-blue-500"
      />
    </div>
  {/if}

  <table class="w-full table-fixed border-collapse">
    <thead>
      {#each $table.getHeaderGroups() as headerGroup}
        <tr>
          {#each headerGroup.headers as header}
            <th
              class="font-inter text-fs-ds-12 leading-lh-ds-150 border-surface-600 border-b p-3 text-left font-medium text-neutral-400"
            >
              {#if header.isPlaceholder}
                <span></span>
              {:else}
                <div
                  class="flex cursor-pointer items-center gap-2"
                  on:click={() => header.column.toggleSorting()}
                  on:keydown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      header.column.toggleSorting();
                    }
                  }}
                  role="button"
                  tabindex="0"
                >
                  <span>{header.column.columnDef.header}</span>

                  {#if header.column.getCanSort()}
                    <span
                      class={`transition-opacity duration-150 ${data.length > 0 ? getSortIcon(header.column.getIsSorted()) : 'opacity-0'}`}
                    >
                      <SortIcon />
                    </span>
                  {/if}
                </div>
              {/if}
            </th>
          {/each}
        </tr>
      {/each}
    </thead>

    <tbody>
      {#each $table.getRowModel().rows as row}
        <tr
          class="group hover:bg-surface-700 transition-colors duration-150"
          on:click={(e) => {
            dispatch('rowClick', row.original);
            dispatch('click', e);
          }}
        >
          {#each row.getVisibleCells() as cell}
            <td
              class="border-surface-600 font-inter text-fs-ds-12 leading-lh-ds-130 font-regular cursor-pointer border-b p-3 text-left text-neutral-50"
              on:click={() => {
                dispatch('RowClick', row.original);
              }}
            >
              {#if typeof cell.column.columnDef.cell === 'function'}
                {#if typeof cell.column.columnDef.cell(cell) === 'object'}
                  {#if cell.column.columnDef.cell(cell).Component}
                    <svelte:component
                      this={cell.column.columnDef.cell(cell).Component}
                      {...cell.column.columnDef.cell(cell).props}
                    />
                  {:else}
                    {@html cell.column.columnDef.cell(cell)}
                  {/if}
                {:else}
                  {@html cell.column.columnDef.cell(cell)}
                {/if}
              {:else}
                {cell.getValue()}
              {/if}
            </td>
          {/each}
        </tr>
      {/each}

      {#if $table.getRowModel().rows.length === 0}
        <tr>
          <td colspan={columns.length} class="p-8 text-center text-neutral-400">
            No data available
          </td>
        </tr>
      {/if}
    </tbody>
  </table>
</div>
