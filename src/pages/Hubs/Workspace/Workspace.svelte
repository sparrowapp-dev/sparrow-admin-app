<script lang="ts">
  import PlusIcon from '@/assets/icons/PlusIcon.svelte';
  import AddWorkspace from '@/components/AddWorkspace/AddWorkspace.svelte';
  import Modal from '@/components/Modal/Modal.svelte';
  import Button from '@/ui/Button/Button.svelte';
  import TableSearch from '@/components/TableSearch/TableSearch.svelte';
  import TableV2 from '@/components/Table/TableV2.svelte';
  import TablePagination from '@/components/TablePagination/TablePagination.svelte';
  import { createQuery } from '@/services/api.common';
  import { hubsService } from '@/services/hubs.service';
  import type { SortingState } from '@tanstack/table-core';
  import { useLocation } from 'svelte-routing';
  import { derived } from 'svelte/store';
  import { onDestroy, onMount } from 'svelte';

  let params: string | undefined;
  const location = useLocation();
  let unsubscribe;

  // State management
  let showModal = false;
  let pagination = { pageIndex: 0, pageSize: 10 };
  let filters = { searchTerm: '' };
  let sorting: SortingState = [];

  const columns = [
    {
      accessorKey: 'name',
      header: 'Workspace Name',
      enableSorting: true,
    },
    {
      accessorKey: 'collections',
      header: 'Collections',
      enableSorting: false,
    },
    {
      accessorKey: 'contributors',
      header: 'Contributors',
      enableSorting: false,
    },
    {
      accessorKey: 'visibility',
      header: 'Type',
      enableSorting: true,
      cell: ({ getValue }) => `
        <div class="px-1 py-0.5 w-fit border border-neutral-500 bg-neutral-700 rounded-[2px] text-fs-ds-12 leading-lh-ds-130 font-inter font-regular">
          ${getValue()}
        </div>
      `,
    },
    {
      accessorKey: 'createdAt',
      header: 'Created',
      enableSorting: true,
      cell: ({ getValue }) => new Date(getValue()).toLocaleDateString(),
    },
    {
      accessorKey: 'updatedAt',
      header: 'Last Updated',
      enableSorting: true,
      cell: ({ getValue }) => new Date(getValue()).toLocaleDateString(),
    },
  ];

  // Create query
  const {
    data: workspacesData,
    isFetching,
    refetch,
  } = createQuery(async () => {
    const queryParams: any = {
      hubId: params,
      page: pagination.pageIndex + 1,
      limit: pagination.pageSize,
      search: filters.searchTerm,
      sortBy: sorting[0]?.id || 'createdAt',
      sortOrder: sorting[0]?.desc ? 'desc' : 'asc',
      workspaceType: '',
    };

    return hubsService.getHubWorkspaces(queryParams);
  });

  $: if (params) {
    refetch();
  }

  const extractedParam = derived(location, ($location) => {
    const match = $location.pathname.match(/\/hubs\/(?:workspace|settings|members)\/([^\/]+)/);
    return match?.[1];
  });

  onMount(() => {
    unsubscribe = extractedParam.subscribe((id) => {
      if (id && id !== params) {
        params = id;
      }
    });
  });

  onDestroy(() => {
    unsubscribe?.();
  });

  // Event handlers
  function handleSortingChange(event: CustomEvent<SortingState>) {
    sorting = event.detail;
    refetch();
  }

  function handleSearchChange(event: CustomEvent<string>) {
    filters = { ...filters, searchTerm: event.detail };
    pagination = { ...pagination, pageIndex: 0 };
    refetch();
  }

  function handlePageChange(event: CustomEvent<number>) {
    pagination = { ...pagination, pageIndex: event.detail };
    refetch();
  }

  function handlePageSizeChange(event: CustomEvent<number>) {
    pagination = {
      pageSize: event.detail,
      pageIndex: 0,
    };
    refetch();
  }

  // Reactive statements
  $: totalItems = $workspacesData?.totalCount || 0;
  $: data = {
    teamName: $workspacesData?.hubName || 'Loading...',
    workspaces: $workspacesData?.hubs || [],
  };
</script>

<section class="w-full">
  <h1 class="font-inter text-fs-ds-28 font-fw-ds-500 py-4 text-neutral-50">
    {data.teamName}
  </h1>
  <h4 class="font-inter text-fs-ds-16 font-fw-ds-400 py-2 text-neutral-50">Workspaces</h4>
  <p class="font-inter text-fs-ds-14 font-fw-ds-300 text-neutral-100">
    All your Hub’s workspaces in one place, manage access, rename, or dive into details with ease.
  </p>

  <div class="table-container bg-surface-900">
    <div class="table-header">
      <TableSearch
        value={filters.searchTerm}
        on:search={handleSearchChange}
        isLoading={$isFetching}
      />
      <Button
        variant="filled-primary"
        size="small"
        iconLeft={true}
        on:click={() => (showModal = true)}
      >
        <svelte:fragment slot="iconLeft">
          <PlusIcon />
        </svelte:fragment>
        New Workspace
      </Button>
    </div>

    <TableV2
      {columns}
      data={data.workspaces}
      isLoading={$isFetching}
      pageIndex={pagination.pageIndex}
      pageSize={pagination.pageSize}
      {totalItems}
      on:sortingChange={handleSortingChange}
      on:rowClick={(e) => console.log('Row clicked:', e.detail)}
    />

    <TablePagination
      pageIndex={pagination.pageIndex}
      pageSize={pagination.pageSize}
      {totalItems}
      isLoading={$isFetching}
      on:pageChange={handlePageChange}
      on:pageSizeChange={handlePageSizeChange}
    />
  </div>

  {#if showModal}
    <Modal on:close={() => (showModal = false)}>
      <AddWorkspace onClose={() => (showModal = false)} />
    </Modal>
  {/if}
</section>

<style>
  .table-container {
    width: 100%;
    padding: 1.5rem;
    border-radius: 8px;
  }

  .table-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
    flex-wrap: wrap;
    gap: 1rem;
  }
</style>
