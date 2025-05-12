<script lang="ts">
  import { createSvelteTable, type ColumnDef } from '@tanstack/svelte-table';
  import { getCoreRowModel, getSortedRowModel } from '@tanstack/svelte-table';
  import { onMount, createEventDispatcher } from 'svelte';
  import type { SortingState } from '@tanstack/table-core';
  import TableHeader from './TableHeader.svelte';
  import TableCell from './TableCell.svelte';
  import type { TableProps, TableFetchOptions, TableFetchResponse } from './Tabletypes';

  const dispatch = createEventDispatcher();

  // Props
  export let columns: ColumnDef<any, any>[] = [];
  export let fetchData: (options: TableFetchOptions) => Promise<TableFetchResponse>;
  export let initialPageSize = 10;
  export let initialPageIndex = 0;
  export let initialSearchTerm = '';
  export let isLoading = false;
  export let customLoading = false;
  export let loadingComponent = null;
  export let emptyStateComponent = null;
  export let rowClassName = '';
  export let cellClassName = '';
  export let headerClassName = '';
  export let containerClassName = '';
  export let showSearch = true;
  export let showPagination = true;

  // Internal state
  let data: any[] = [];
  let totalItems = 0;
  let pageCount = 0;
  let sorting: SortingState = [];
  let activeDropdownId: string | null = null;

  // Reactive state
  $: pagination = {
    pageIndex: initialPageIndex,
    pageSize: initialPageSize,
  };

  $: filters = {
    searchTerm: initialSearchTerm,
  };

  // Table instance
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

  // Load data function
  async function loadData() {
    try {
      isLoading = true;
      const result = await fetchData({ pagination, filters, sorting });
      data = result.data;
      totalItems = result.totalItems;
      pageCount = result.pageCount || Math.ceil(totalItems / pagination.pageSize);

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

  // Watch for changes to reload data
  $: pagination, filters, sorting, loadData();

  // Handle outside clicks for dropdowns
  function handleClickOutside(event: MouseEvent) {
    if (activeDropdownId && !(event.target as HTMLElement).closest('[data-action="toggle-menu"]')) {
      activeDropdownId = null;
    }
  }

  onMount(() => {
    loadData();
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  });
</script>

<div class="table-outer-wrapper">
  {#if isLoading && !customLoading}
    <div class="loading-overlay">
      {#if loadingComponent}
        <svelte:component this={loadingComponent} />
      {:else}
        <div class="loading-spinner" />
      {/if}
    </div>
  {/if}

  <div class={`table-wrapper ${containerClassName}`}>
    <div class="table-scroll-container">
      <table class="table">
        <thead>
          {#each $table.getHeaderGroups() as headerGroup}
            <tr>
              {#each headerGroup.headers as header}
                <TableHeader {header} dataLength={data.length} className={headerClassName} />
              {/each}
            </tr>
          {/each}
        </thead>

        <tbody>
          {#each $table.getRowModel().rows as row}
            <tr
              class={`table-row ${rowClassName}`}
              on:click={(e) => {
                dispatch('rowClick', row.original);
                dispatch('click', e);
              }}
            >
              {#each row.getVisibleCells() as cell}
                <TableCell {cell} className={cellClassName} on:click />
              {/each}
            </tr>
          {/each}

          {#if $table.getRowModel().rows.length === 0}
            <tr>
              <td colspan={columns.length} class="empty-state">
                {#if emptyStateComponent}
                  <svelte:component this={emptyStateComponent} />
                {:else}
                  No data available
                {/if}
              </td>
            </tr>
          {/if}
        </tbody>
      </table>
    </div>
  </div>
</div>

<style>
  .table-outer-wrapper {
    position: relative;
    width: 100%;
    overflow: hidden;
  }

  .table-wrapper {
    position: relative;
    width: 100%;
    max-width: 100%;
    overflow: hidden;
  }

  .table-scroll-container {
    position: relative;
    width: 100%;
    max-width: 100%;
    overflow-x: auto;
    overflow-y: hidden;
    scrollbar-width: thin;
    scrollbar-color: #4a4a4a #1a1a1a;
  }

  .loading-overlay {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.5);
    z-index: 10;
  }

  .loading-spinner {
    height: 1.5rem;
    width: 1.5rem;
    border-radius: 9999px;
    border: 2px solid rgb(209 213 219);
    border-top-color: rgb(59 130 246);
    animation: spin 1s linear infinite;
  }

  .table {
    width: 100%;
    table-layout: fixed;
    border-collapse: collapse;
  }

  .table-row {
    transition: background-color 150ms;
  }

  .table-row:hover {
    background-color: #181c26;
  }

  .empty-state {
    padding: 2rem;
    text-align: center;
    color: rgb(156 163 175);
  }

  .table-scroll-container::-webkit-scrollbar {
    height: 8px;
  }

  .table-scroll-container::-webkit-scrollbar-track {
    background: #1a1a1a;
    border-radius: 4px;
  }

  .table-scroll-container::-webkit-scrollbar-thumb {
    background: #4a4a4a;
    border-radius: 4px;
  }

  .table-scroll-container::-webkit-scrollbar-thumb:hover {
    background: #666;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
</style>
