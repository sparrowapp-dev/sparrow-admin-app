<!-- Table.svelte -->
<script>
  import { createSvelteTable } from '@tanstack/svelte-table';
  import { getCoreRowModel } from '@tanstack/svelte-table';
  import { onMount } from 'svelte';

  // Props from parent
  export let columns = [];
  export let fetchData = async ({ pagination, filters }) => ({ data: [], totalItems: 0 });
  export let initialPageSize = 10;
  export let initialPageIndex = 0;
  export let initialSearchTerm = '';
  export let isLoading = false;

  // Internal state
  let data = [];
  let totalItems = 0;
  let pageCount = 0;

  // Reactive pagination and filters synced to props
  $: pagination = {
    pageIndex: initialPageIndex,
    pageSize: initialPageSize,
  };

  $: filters = {
    searchTerm: initialSearchTerm,
  };

  // Load data
  async function loadData() {
    try {
      isLoading = true;
      const result = await fetchData({ pagination, filters });
      data = result.data;
      totalItems = result.totalItems;
      pageCount = Math.ceil(totalItems / pagination.pageSize);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      isLoading = false;
    }
  }

  // Expose pagination and search state to parent
  export function getPaginationState() {
    return pagination;
  }

  export function getFiltersState() {
    return filters;
  }

  // Create the table instance
  $: table = createSvelteTable({
    data,
    columns,
    state: {
      pagination,
    },
    manualPagination: true,
    pageCount,
    getCoreRowModel: getCoreRowModel(),
  });

  // Watch for changes in pagination or filters to reload data
  $: pagination, filters, loadData();

  // Initial load
  onMount(() => {
    loadData();
  });
</script>

<div class="tanstack-table-container">
  {#if isLoading}
    <div class="loading-overlay">Loading...</div>
  {/if}

  <table>
    <thead>
      {#each $table.getHeaderGroups() as headerGroup}
        <tr>
          {#each headerGroup.headers as header}
            <th>
              {#if header.isPlaceholder}
                <!-- Skip placeholders -->
              {:else}
                <div>
                  {#if typeof header.column.columnDef.header === 'function'}
                    <svelte:component
                      this={header.column.columnDef.header}
                      column={header.column}
                    />
                  {:else}
                    {header.column.columnDef.header}
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
        <tr>
          {#each row.getVisibleCells() as cell}
            <td>
              {#if typeof cell.column.columnDef.cell === 'function'}
                {@html cell.column.columnDef.cell(cell)}
              {:else}
                {cell.getValue()}
              {/if}
            </td>
          {/each}
        </tr>
      {/each}

      {#if $table.getRowModel().rows.length === 0}
        <tr>
          <td colspan={columns.length} class="empty-table"> No data available </td>
        </tr>
      {/if}
    </tbody>
  </table>
</div>

<style>
  .tanstack-table-container {
    position: relative;
    width: 100%;
    overflow: auto;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    table-layout: fixed;
  }

  th,
  td {
    padding: 0.75rem;
    border-bottom: 1px solid #e2e8f0;
    text-align: left;
    color: white;
  }

  th {
    background-color: #353535;
    font-weight: 600;
  }

  tbody tr:hover {
    background-color: #3f3f3f;
  }

  .loading-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(255, 255, 255, 0.7);
    display: flex;
    justify-content: center;
    align-items: center;
    font-weight: 600;
  }

  .empty-table {
    text-align: center;
    padding: 2rem;
    color: #64748b;
  }
</style>
