<script lang="ts">
  import PlusIcon from '@/assets/icons/PlusIcon.svelte';
  import AddWorkspace from '@/components/AddWorkspace/AddWorkspace.svelte';
  import Modal from '@/components/Modal/Modal.svelte';
  import Button from '@/ui/Button/Button.svelte';
  import TableSearch from '@/components/TableSearch/TableSearch.svelte';
  import Table from '@/components/Table/Table.svelte';
  import TablePagination from '@/components/TablePagination/TablePagination.svelte';
  import { createQuery } from '@/services/api.common';
  import { hubsService } from '@/services/hubs.service';
  import type { SortingState } from '@tanstack/table-core';
  import { navigate, useLocation } from 'svelte-routing';
  import { derived } from 'svelte/store';
  import { onDestroy, onMount } from 'svelte';
  import { getRelativeTime } from '@/utils/TimeFunction';
  import VisibilityCell from '../../../components/TableComponents/VisibilityCell.svelte';
  import WorkspaceDropdown from '@/components/TableComponents/WorkspaceDropdown.svelte';
  import SparrowBirdBg from '@/assets/icons/SparrowBirdBg.svelte';
  import DropdownNoSearch from '@/components/DropdownNoSearch/DropdownNoSearch.svelte';
  import DropdownWorkspaceIcon from '@/assets/icons/DropdownWorkspaceIcon.svelte';
  import Breadcrumbs from '@/components/Breadcrumbs/Breadcrumbs.svelte';
  import LaunchApp from '@/components/TableComponents/LaunchApp.svelte';
  import CircularLoader from '@/ui/CircularLoader/CircularLoader.svelte';
  import UpgradeHubPopup from '@/components/UpgradeHubPopup/UpgradeHubPopup.svelte';
  import { userId } from '@/store/auth';
  import { userService } from '@/services/users.service';
  import { captureEvent } from '@/utils/posthogConfig';
  const location = useLocation();
  let workspaceExhausted = false;
  // State management
  let showModal = false;
  let params: string | undefined;
  let unsubscribe;
  let pagination = { pageIndex: 0, pageSize: 10 };
  let filters = { searchTerm: '' };
  let sorting: SortingState = [{ id: 'createdAt', desc: true }];
  let breadcrumbItems;
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
  $: columns = [
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
      width: '130px',
      cell: ({ row }) => ({
        Component: LaunchApp,
        props: {
          workspaceId: row.original.id,
          showOnHover: true,
          ctaLocation: "workspace_table"
        },
      }),
    },
    {
      id: 'actions',
      header: '',
      enableSorting: false,
      cell: ({ row }) => ({
        Component: WorkspaceDropdown,
        props: { row: row, params: params },
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

  $: workspaceCount = $workspacesData?.data?.hubs?.length;
  //Function to fetch user Role in Hub
  const {
    data: userRole,
    isFetching: roleRefetching,
    refetch: roleRefetch,
  } = createQuery(async () => {
    const queryParams: any = {
      hubId: params,
    };
    return userService.getUserRole(queryParams);
  });

  $: workspaceExhausted =
    ($workspacesData?.data?.hubs?.length || 0) >=
    ($hubData?.data?.plan?.limits?.workspacesPerHub?.value || 0);

  const {
    data: hubData,
    refetch: hubsDataRefetch,
    isFetching: HubsDataFetching,
  } = createQuery(async () => {
    return hubsService.getHubDetails(params);
  });
  // refetch data when params change
  $: if (params) {
    refetch();
    roleRefetch();
    hubsDataRefetch();
  }
  $: users = $hubData?.data?.users;
  $: user = users?.find((u) => u.id.toString() === $userId?.toString());
  $: owner = users?.find((u) => u.role === 'owner');

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
  $: userRoleData = $userRole?.data;
  $: breadcrumbItems = [
    { label: 'Hubs', path: '/hubs' },
    { label: data.teamName, path: `/hubs/workspace/${params}` },
  ];

  $: isOwner = user?.role === 'owner';
  const handleRedirect = () => {
    captureUserClickUpgrade();
    if (isOwner) {
      navigate(`/billing/billingOverview/${params}?redirectTo=changePlan`);
    } else {
      window.open(`mailto:${owner?.email}`);
    }
  };

  const captureUserClickUpgrade =() =>{
    const eventProperties ={
      event_source : "admin",
      cta_location:"limit_exceeded_modal"
    }
    captureEvent("admin_upgrade_intent",eventProperties)
  }
</script>

<section class="w-full">
  {#if !$workspacesData?.httpStatusCode}
    <div class="flex h-[calc(100vh-4rem)] w-full items-center justify-center">
      <CircularLoader />
    </div>
  {:else}
    <Breadcrumbs items={breadcrumbItems} />
    <h1
      class="font-inter text-fs-ds-28 font-fw-ds-500 w-[30vw] truncate overflow-hidden py-4 whitespace-nowrap text-neutral-50"
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
          disabled={userRoleData === 'member'}
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
        <Table
          {columns}
          data={data.workspaces}
          isLoading={$isFetching}
          pageIndex={pagination.pageIndex}
          pageSize={pagination.pageSize}
          {totalItems}
          on:sortingChange={handleSortingChange}
          on:rowClick={(e) =>
            navigate(`/hubs/workspace-details/${e.detail._id || e.detail.id}/${params}`)}
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
        {#if !workspaceExhausted}
          <AddWorkspace
            onClose={() => (showModal = false)}
            hubId={params}
            onSuccess={handleWorkspaceCreated}
          />
        {:else}
          <UpgradeHubPopup
            onClose={() => (showModal = false)}
            limit={$hubData?.data?.plan?.limits?.workspacesPerHub?.value}
            userRole={user?.role}
            {isOwner}
            reDirect={handleRedirect}
            limitText="Workspaces"
            currentCount={workspaceCount}
          />
        {/if}
      </Modal>
    {/if}
  {/if}
</section>
