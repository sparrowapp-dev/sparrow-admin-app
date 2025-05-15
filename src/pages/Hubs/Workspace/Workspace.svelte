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
  import { getRelativeTime } from '@/utils/TimeFunction';
  import VisibilityCell from '../../../components/TableComponents/VisibilityCell.svelte';
  import WorkspaceDropdown from '@/components/TableComponents/WorkspaceDropdown.svelte';
  import SparrowBirdBg from '@/assets/icons/SparrowBirdBg.svelte';
  import DropdownNoSearch from '@/components/DropdownNoSearch/DropdownNoSearch.svelte';
  import DropdownWorkspaceIcon from '@/assets/icons/DropdownWorkspaceIcon.svelte';
  import WorkspaceLaunch from '@/components/TableComponents/WorkspaceLaunch.svelte';
  const location = useLocation();

  // State management
  let showModal = false;
  let params: string | undefined;
  let unsubscribe;
  let pagination = { pageIndex: 0, pageSize: 10 };
  let filters = { searchTerm: '' };
  let sorting: SortingState = [{ id: 'createdAt', desc: true }];
  let selected = {
    value: '',
    label: 'All Workspaces',
  };

  const options = [
    {
      value: 'PRIVATE',
      label: 'Private',
    },
    {
      value: 'PUBLIC',
      label: 'Public',
    },
    {
      value: '',
      label: 'All Workspaces',
    },
  ];

  // table columns
  const columns = [
    {
      accessorKey: 'name',
      header: 'Workspaces',
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
      header: 'Visibility',
      enableSorting: true,
      cell: ({ getValue }) => ({
        Component: VisibilityCell,
        props: { Value: getValue() },
      }),
    },
    {
      accessorKey: 'updatedAt',
      header: 'Last Updated',
      enableSorting: true,
      cell: ({ getValue }) => {
        const date = getValue();
        const relativeTime = getRelativeTime(date);
        return `<span class="text-neutral-50" title="${new Date(date).toLocaleString()}">
        ${relativeTime}
      </span>`;
      },
    },

    {
      accessorKey: 'createdAt',
      header: 'Created',
      enableSorting: true,
      cell: ({ getValue }) => {
        const date = getValue();
        const relativeTime = getRelativeTime(date);
        return `<span class="text-neutral-50" title="${new Date(date).toLocaleString()}">
        ${relativeTime}
      </span>`;
      },
    },
    {
      id: 'launch',
      header: '',
      enableSorting: false,
      cell: ({ row }) => ({
        Component: WorkspaceLaunch,
        props: {
          workspaceId: row.original.id,
          showOnHover: true,
        },
      }),
    },
    {
      id: 'actions',
      header: '',
      enableSorting: false,
      cell: ({ row }) => ({
        Component: WorkspaceDropdown,
        props: { row: row },
      }),
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
      workspaceType: selected?.value,
    };

    return hubsService.getHubWorkspaces(queryParams);
  });

  // refetch data when params change
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

  // event handler for sorting change
  function handleSortingChange(event: CustomEvent<SortingState>) {
    sorting = event.detail;
    refetch();
  }
  // event handler for search input change
  function handleSearchChange(event: CustomEvent<string>) {
    filters = { ...filters, searchTerm: event.detail };
    pagination = { ...pagination, pageIndex: 0 };
    refetch();
  }
  // event handler for page change
  function handlePageChange(event: CustomEvent<number>) {
    pagination = { ...pagination, pageIndex: event.detail };
    refetch();
  }
  // event handler for page size change
  function handlePageSizeChange(event: CustomEvent<number>) {
    pagination = {
      pageSize: event.detail,
      pageIndex: 0,
    };
    refetch();
  }
  // Refresh the table data
  function handleWorkspaceCreated() {
    refetch();
  }

  function handleSelect(event) {
    selected = event.detail;
    refetch();
  }

  // Reactive statements
  $: totalItems = $workspacesData?.data?.totalCount || 0;
  $: data = {
    teamName: $workspacesData?.data?.hubName || '',
    workspaces: $workspacesData?.data?.hubs || [],
    isNewHub: $workspacesData?.data?.isNewHub || false,
  };
</script>

<section class="w-full">
  <h1
    class="font-inter text-fs-ds-28 font-fw-ds-500 w-1/4 truncate overflow-hidden py-4 whitespace-nowrap text-neutral-50"
  >
    {data.teamName}
  </h1>

  <h4 class="font-inter text-fs-ds-16 font-fw-ds-400 py-2 text-neutral-50">Workspaces</h4>
  <p class="font-inter text-fs-ds-14 font-fw-ds-300 text-neutral-100">
    All your Hub’s workspaces in one place, manage access, rename, or dive into details with ease.
  </p>

  <div class="bg-surface-900">
    <div class="flex items-center justify-between py-6">
      <div class="flex items-center gap-4">
        <TableSearch
          value={filters.searchTerm}
          on:search={handleSearchChange}
          isLoading={$isFetching}
          placeholder="Search Workspace"
        />
        <DropdownNoSearch
          {options}
          bind:selected
          placeholder="Select option"
          leftIcon={DropdownWorkspaceIcon}
          variant="primary"
          width="w-48"
          on:select={handleSelect}
        />
      </div>

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

    {#if totalItems === 0 && !data?.isNewHub && !$isFetching}
      <div class="flex flex-col items-center justify-center py-16">
        <p class="text-fs-ds-14 font-fw-ds-300 text-neutral-400">No results found.</p>
      </div>
    {:else if data?.isNewHub}
      <div
        class="bg-surface-900 mt-[10rem] flex flex-col items-center justify-center px-4 text-center"
      >
        <SparrowBirdBg />

        <p class="font-fw-ds-300 font-inter text-fs-ds-12 max-w-xl text-neutral-400">
          Welcome to Sparrow! Let’s create your first workspace to unlock powerful tools and bring
          your team together in one organized space.
        </p>
      </div>
    {:else}
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
    {/if}
  </div>

  {#if showModal}
    <Modal on:close={() => (showModal = false)}>
      <AddWorkspace
        onClose={() => (showModal = false)}
        hubId={params}
        onSuccess={handleWorkspaceCreated}
      />
    </Modal>
  {/if}
</section>
