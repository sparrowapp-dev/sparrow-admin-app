<script lang="ts">
  import PlusIcon from '@/assets/icons/PlusIcon.svelte';
  import TableV2 from '@/components/Table/TableV2.svelte';
  import VisibilityCell from '@/components/TableComponents/VisibilityCell.svelte';
  import WorkspaceDropdown from '@/components/TableComponents/WorkspaceDropdown.svelte';
  import TablePagination from '@/components/TablePagination/TablePagination.svelte';
  import TableSearch from '@/components/TableSearch/TableSearch.svelte';
  import { createQuery } from '@/services/api.common';
  import { hubsService } from '@/services/hubs.service';
  import Button from '@/ui/Button/Button.svelte';
  import { getRelativeTime } from '@/utils/TimeFunction';
  import { CellContext, SortingState } from '@tanstack/svelte-table';
  import { onDestroy, onMount } from 'svelte';
  import { useLocation } from 'svelte-routing';
  import { derived } from 'svelte/store';
  import { members, ResourceData } from './dummyData';
  import HubsDropdown from '@/components/TableComponents/HubsDropdown.svelte';
  import RolesDropdown from './RolesDropdown.svelte';

  const location = useLocation();
  let selectedTab: 'Resources' | 'Members' = 'Resources';
  let showModal = false;
  let params: string | undefined;
  let unsubscribe;
  let pagination = { pageIndex: 0, pageSize: 10 };
  let filters = { searchTerm: '' };
  let sorting: SortingState = [];
  let loading = true;
  // Function to fetch data based on selected tab
  const fetchTabData = async (tab: 'Resources' | 'Members', queryParams: any) => {
    // Simulate API delay (e.g. 2 seconds)
    await new Promise((resolve) => setTimeout(resolve, 2000));
    loading = false;
    // In the future, replace these conditionals with actual API calls
    if (tab === 'Resources') {
      // return hubsService.getHubResources(queryParams);
      return ResourceData;
    } else {
      // return hubsService.getHubMembers(queryParams);
      return members;
    }
  };

  const {
    data: workspacesData,
    isFetching,
    refetch,
  } = createQuery(async () => {
    loading = true;
    const queryParams: any = {
      hubId: params,
      page: pagination.pageIndex + 1,
      limit: pagination.pageSize,
      search: filters.searchTerm,
      sortBy: sorting[0]?.id || 'createdAt',
      sortOrder: sorting[0]?.desc ? 'desc' : 'asc',
      workspaceType: '',
    };

    // Call the function that fetches data based on the selected tab
    return fetchTabData(selectedTab, queryParams);
  });

  // refetch data when params change
  $: if (params) {
    refetch();
  }

  // refetch data when selectedTab changes
  $: if (selectedTab) {
    // Reset pagination when changing tabs
    pagination = { ...pagination, pageIndex: 0 };
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

  // Update columns based on selected tab
  $: columns =
    selectedTab === 'Resources'
      ? [
          {
            accessorKey: 'resources',
            header: 'Resources',
            enableSorting: true,
          },
          {
            accessorKey: 'name',
            header: 'Name',
            enableSorting: false,
          },
          {
            accessorKey: 'keystats',
            header: 'Key Stats',
            enableSorting: false,
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
            accessorKey: 'createdBy',
            header: 'Created by',
            enableSorting: false,
          },
        ]
      : [
          {
            accessorKey: 'user',
            header: 'Users',
            enableSorting: false,
          },
          {
            accessorKey: 'Email',
            header: 'Email',
            enableSorting: false,
          },
          {
            accessorKey: 'roles',
            header: 'Roles',
            enableSorting: false,
            cell: ({ row }: CellContext<any, any>) => ({
              Component: RolesDropdown,
              props: { row: row },
            }),
          },
        ];

  // Function to handle tab change
  function handleTabChange(tab: 'Resources' | 'Members') {
    selectedTab = tab;
  }

  function handleSortingChange(event: CustomEvent<SortingState>) {
    sorting = event.detail;
    refetch();
  }

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

  // Reactive statements for data processing
  $: totalItems = $workspacesData?.data?.totalCount || 0;
  $: data =
    selectedTab === 'Resources'
      ? {
          teamName: $workspacesData?.data?.hubName || 'Loading...',
          workspaces: $workspacesData?.data?.hubs || [],
        }
      : {
          teamName: 'Members',
          workspaces: $workspacesData?.data || [],
        };
</script>

<div class="flex flex-col gap-6">
  <div class="flex gap-2 px-4">
    <button
      class={`text-fs-ds-12 leading-lh-ds-130 font-fw-ds-400 font-inter cursor-pointer border-b-2 pb-1
          ${selectedTab === 'Resources' ? 'border-blue-500 text-neutral-50' : 'border-transparent text-neutral-100'}`}
      on:click={() => (selectedTab = 'Resources')}
    >
      Resources
    </button>

    <button
      class={`text-fs-ds-12 leading-lh-ds-130 font-fw-ds-400 font-inter cursor-pointer border-b-2 pb-1
          ${selectedTab === 'Members' ? 'border-blue-500 text-neutral-50' : 'border-transparent text-neutral-100'}`}
      on:click={() => (selectedTab = 'Members')}
    >
      Members
    </button>
  </div>
  <div class="bg-surface-900">
    <div class="flex items-center gap-3 py-6">
      <TableSearch
        value={filters.searchTerm}
        on:search={handleSearchChange}
        isLoading={$isFetching}
        placeholder="Search Workspace"
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
      isLoading={loading}
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
</div>
