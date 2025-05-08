<script lang="ts">
  import { createSvelteTable } from '@tanstack/svelte-table';
  import { getCoreRowModel, getSortedRowModel } from '@tanstack/svelte-table';
  import TableHeader from './TableHeader.svelte';
  import TableCell from './TableCell.svelte';

  export let columns = [];
  export let fetchData;
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

  // ...rest of your existing state management code...

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
</script>

<div class={`relative w-full ${containerClassName}`}>
  {#if isLoading && !customLoading}
    <div class="bg-surface-800 bg-opacity-50 absolute inset-0 flex items-center justify-center">
      {#if loadingComponent}
        <svelte:component this={loadingComponent} />
      {:else}
        <div
          class="h-6 w-6 animate-spin rounded-full border-2 border-neutral-300 border-t-blue-500"
        />
      {/if}
    </div>
  {/if}

  <table class="w-full table-fixed border-collapse">
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
          class={`group hover:bg-surface-700 transition-colors duration-150 ${rowClassName}`}
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
          <td colspan={columns.length} class="p-8 text-center text-neutral-400">
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
