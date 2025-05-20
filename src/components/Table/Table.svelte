<script lang="ts">
  import { createSvelteTable, type ColumnDef } from '@tanstack/svelte-table';
  import { getCoreRowModel, getSortedRowModel } from '@tanstack/svelte-table';
  import { createEventDispatcher } from 'svelte';
  import type { SortingState } from '@tanstack/table-core';
  import TableHeader from './TableHeader.svelte';
  import TableCell from './TableCell.svelte';

  const dispatch = createEventDispatcher();

  export let data: any[] = [];
  export let columns: ColumnDef<any, any>[] = [];
  export let isLoading = false;
  export let sorting: SortingState = [];
  export let pageSize = 10;
  export let pageIndex = 0;
  export let totalItems = 0;
  export let headerClassName = '';
  export let rowClassName = '';
  export let cellClassName = '';
  export let containerClassName = '';
  export let emptyStateComponent = null;

  // Table instance
  $: table = createSvelteTable({
    data,
    columns,
    state: {
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
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  function handleRowClick(row: any) {
    dispatch('rowClick', row.original);
  }
</script>

<div class="table-outer-wrapper">
  {#if isLoading}
    <div class="loading-overlay">
      <div class="loading-spinner" />
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
              class="group/row hover:bg-surface-800 border-surface-600 border-b transition-colors duration-150 {rowClassName}"
              on:click={() => handleRowClick(row)}
            >
              {#each row.getVisibleCells() as cell}
                <TableCell
                  {cell}
                  className={cellClassName}
                  showOnHover={cell.column.id === 'launch'}
                />
              {/each}
            </tr>
          {/each}
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

  .empty-state {
    padding: 2rem;
    text-align: center;
    color: rgb(156 163 175);
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
</style>
