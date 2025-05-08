<script lang="ts">
  import { createSvelteTable, type ColumnDef } from '@tanstack/svelte-table';
  import { getCoreRowModel, getSortedRowModel } from '@tanstack/svelte-table';
  import { onMount, createEventDispatcher } from 'svelte';
  import type { SortingState } from '@tanstack/table-core';
  import EditIcon from '@/assets/icons/EditIcon.svelte';
  import UpgradeStandardIcon from '@/assets/icons/UpgradeStandardIcon.svelte';
  import ManageMembersIcon from '@/assets/icons/ManageMembersIcon.svelte';
  import SortIcon from '@/assets/icons/SortIcon.svelte';
  import Copy from '@/assets/icons/Copy.svelte';
  import Check from '@/assets/icons/Check.svelte';
  import Tooltip from '../Tooltip/Tooltip.svelte';
  // ...existing imports...

  // Add copyState to track copy status for each row
  let copyState: { [key: string]: boolean } = {};

  // Add copy function
  async function handleCopy(url: string, rowId: string) {
    try {
      await navigator.clipboard.writeText(url);
      copyState[rowId] = true;
      setTimeout(() => {
        copyState[rowId] = false;
      }, 2000);
    } catch (error) {
      console.error('Copy failed:', error);
    }
  }
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

  // Toggle dropdown function
  function toggleDropdown(hubId: string) {
    if (activeDropdownId === hubId) {
      activeDropdownId = null; // Close if already open
    } else {
      activeDropdownId = hubId; // Open this dropdown
    }
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
              class="border-surface-600 font-inter text-fs-ds-12 leading-lh-ds-130 font-regular border-b p-3 text-left text-neutral-50"
              >{#if cell.column.id === 'hubUrl'}
                <div class="group/url relative flex items-center gap-2">
                  <span class="truncate text-neutral-300">
                    {cell.getValue() || `https://sparrow.app/hub/${row.original._id}`}
                  </span>
                  <button
                    class="relative p-1 text-neutral-400 opacity-0 transition-all
                       duration-150 group-hover/url:opacity-100 hover:text-neutral-50"
                    on:click|stopPropagation={() =>
                      handleCopy(
                        cell.getValue() || `https://sparrow.app/hub/${row.original._id}`,
                        row.original._id,
                      )}
                    title="Click to copy URL"
                  >
                    <Tooltip
                      text={`${copyState[row.original._id] ? 'Copied' : 'Click to copy'}`}
                      position="top"
                      mode="hover"
                      size="sm"
                    >
                      <div class="hover:bg-surface-300 p-0.5 transition-all duration-150">
                        {#if copyState[row.original._id]}
                          <div class="hover:bg-surface-300">
                            <Check />
                          </div>
                        {:else}
                          <Copy />
                        {/if}
                      </div>
                    </Tooltip>
                    <!-- <span
                      class="tooltip bg-surface-100 text-fs-ds-12 pointer-events-none absolute -top-8 left-1/2
                         -translate-x-1/2 rounded-md px-2 py-1
                         whitespace-nowrap text-neutral-50 opacity-0
                         transition-opacity duration-150 group-hover/url:opacity-100"
                    >
                      Click to copy
                    </span> -->
                  </button>
                </div>
              {:else if cell.column.id === 'actions'}
                <div class="relative flex items-center justify-end gap-4">
                  <button
                    class="font-inter text-fs-ds-12 font-regular leading-lh-ds-130 cursor-pointer
                           text-blue-300 opacity-0 transition-opacity duration-200
                           group-hover:opacity-100 hover:underline focus:opacity-100 focus:outline-none"
                    data-action="launch"
                    data-hub-id={row.original._id}
                  >
                    Launch in Sparrow
                  </button>

                  <div class="relative">
                    <button
                      class="cursor-pointer rounded-md p-2 text-neutral-300 transition-colors
                             duration-200 hover:text-neutral-50"
                      on:click|stopPropagation={() => toggleDropdown(row.original._id)}
                      data-action="toggle-menu"
                      data-hub-id={row.original._id}
                      aria-label="More actions"
                    >
                      {#if typeof row.original.renderThreeDotsIcon === 'function'}
                        {@html row.original.renderThreeDotsIcon()}
                      {:else}
                        ⋮
                      {/if}
                    </button>

                    {#if activeDropdownId === row.original._id}
                      <div
                        class="bg-surface-600 absolute right-0 z-50 mt-2 w-48 rounded-md shadow-lg"
                      >
                        <div class="flex flex-col gap-1 py-1">
                          <button
                            class="text-fs-ds-14 leading-lh-ds-130 font-inter hover:bg-surface-300 flex w-full cursor-pointer flex-row items-center gap-2
                                   px-2 py-1 text-neutral-50 transition-colors duration-150"
                            data-action="ManageHub"
                            data-hub-id={row.original._id}
                            on:click|stopPropagation={() => {
                              dispatch('ManageHub', row.original);
                              activeDropdownId = null;
                            }}
                          >
                            <EditIcon />Manage Hub
                          </button>
                          <button
                            class="text-fs-ds-14 leading-lh-ds-130 font-inter hover:bg-surface-300 flex w-full cursor-pointer flex-row items-center gap-2 px-2
                                   py-1 text-neutral-50 transition-colors duration-150"
                            data-action="manage-members"
                            data-hub-id={row.original._id}
                            on:click|stopPropagation={() => {
                              dispatch('manageMembers', row.original);
                              activeDropdownId = null;
                            }}
                          >
                            <ManageMembersIcon />Manage Members
                          </button>
                          <button
                            class="text-fs-ds-14 leading-lh-ds-130 font-inter hover:bg-surface-300 flex w-full cursor-pointer flex-row items-center gap-2 px-2
                                   py-1 text-neutral-50 transition-colors duration-150"
                            data-action="upgrade"
                            data-hub-id={row.original._id}
                            on:click|stopPropagation={() => {
                              dispatch('upgradeHub', row.original);
                              activeDropdownId = null;
                            }}
                          >
                            <UpgradeStandardIcon />Upgrade to Standard
                          </button>
                        </div>
                      </div>
                    {/if}
                  </div>
                </div>
              {:else if typeof cell.column.columnDef.cell === 'function'}
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
          <td colspan={columns.length} class="p-8 text-center text-neutral-400">
            No data available
          </td>
        </tr>
      {/if}
    </tbody>
  </table>
</div>
