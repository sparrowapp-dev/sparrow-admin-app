<script lang="ts">
  import type { CellContext } from '@tanstack/svelte-table';
  import { createQuery } from '@/services/api.common';
  import type { SortingState } from '@tanstack/table-core';
  import { getRelativeTime } from '@/utils/TimeFunction';
  import { onMount } from 'svelte';
  import { hubsService } from '@/services/hubs.service';
  import { navigate } from 'svelte-routing';
  import { notification } from '@/components/Toast';
  import type { Hub } from '@/interface/HubsOverview';

  // Components
  import Hubsicon from '@/assets/icons/Hubsicon.svelte';
  import WorkspaceIcon2 from '@/assets/icons/WorkspaceIcon2.svelte';
  import ContributionIcon from '@/assets/icons/ContributionIcon.svelte';
  import PlusIcon from '@/assets/icons/PlusIcon.svelte';
  import OverviewCards from '@/ui/OverviewCards/OverviewCards.svelte';
  import TableSearch from '@/components/TableSearch/TableSearch.svelte';
  import Table from '@/components/Table/Table.svelte';
  import TablePagination from '@/components/TablePagination/TablePagination.svelte';
  import Button from '@/ui/Button/Button.svelte';
  import HubUrl from '@/components/TableComponents/HubUrl.svelte';
  import HubsDropdown from '@/components/TableComponents/HubsDropdown.svelte';
  import Modal from '@/components/Modal/Modal.svelte';
  import AddHubs from '@/components/AddHubs/AddHubs.svelte';
  import LaunchApp from '@/components/TableComponents/LaunchApp.svelte';
  import CircularLoader from '@/ui/CircularLoader/CircularLoader.svelte';
  import Tooltip from '@/components/Tooltip/Tooltip.svelte';
  import NameWithTooltip from '@/components/TableComponents/NameWithTooltip.svelte';
  import Tag from '@/ui/Tag/Tag.svelte';
  import { getDynamicCssClasses } from '@/utils/planTagStyles';
  // State
  let pagination = { pageIndex: 0, pageSize: 10 };
  let filters = { searchTerm: '' };
  let sorting: SortingState = [{ id: 'createdAt', desc: true }];
  let showModal = false;

  // Queries
  const { data: summaryData, isFetching: isSummaryLoading } = createQuery(async () => {
    return hubsService.gethubsummary();
  });

  const {
    data: hubsData,
    isFetching,
    refetch,
  } = createQuery(async () => {
    return hubsService.getAllUserHubs({
      page: pagination.pageIndex + 1,
      limit: pagination.pageSize,
      search: filters.searchTerm,
      sortBy: sorting[0]?.id || 'createdAt',
      sortOrder: sorting[0]?.desc ? 'desc' : 'asc',
    });
  });

  // Event Handlers
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
    pagination = { pageSize: event.detail, pageIndex: 0 };
    refetch();
  }

  function handleSortingChange(event: CustomEvent<SortingState>) {
    sorting = event.detail;
    refetch();
  }

  function handleRowClick(event: CustomEvent<Hub>) {
    const hub = event.detail;
    navigate(`/hubs/workspace/${hub._id}`);
  }

  function copyToClipboard(text: string) {
    navigator.clipboard
      .writeText(text)
      .then(() => notification.success('URL successfully copied'))
      .catch(() => notification.error('Failed to copy URL'));
  }

  // Copy URL Event Listener
  onMount(() => {
    const copyHandler = (e: CustomEvent) => copyToClipboard(e.detail);
    document.addEventListener('copyUrl', copyHandler as EventListener);
    return () => document.removeEventListener('copyUrl', copyHandler as EventListener);
  });

  // Table Columns
  const columns = [
    {
      accessorKey: 'name',
      header: 'Sparrow Hubs',
      enableSorting: true,
      enableSortingRemoval: false,
      cell: ({ getValue }) => ({
        Component: NameWithTooltip,
        props: { Value: getValue() },
      }),
    },
    {
      accessorKey: 'hubUrl',
      header: 'Hub URL',
      enableSorting: false,
      cell: ({ getValue, row }: CellContext<any, any>) => ({
        Component: HubUrl,
        props: { Value: getValue(), row },
      }),
    },
    {
      id: 'Plans',
      header: 'Plans',
      cell: ({ row }) => {
        let tagProps = getDynamicCssClasses(row?.original?.plan?.name);
        return {
          Component: Tag,
          props: {
            text: row?.original?.plan?.name,
            bgColor: tagProps.bgColor,
            borderColor: tagProps.borderColor,
            textColor: tagProps.textColor,
            size: 'xs',
          },
        };
      },
    },
    {
      accessorKey: 'workspaceStats',
      header: 'Workspaces',
      enableSorting: false,
      cell: ({ getValue }: CellContext<any, any>) => {
        const stats = getValue();
        return `${stats.private} Private, ${stats.public} Public`;
      },
    },
    {
      accessorKey: 'contributors',
      header: 'Contributors',
      enableSorting: false,
      cell: ({ getValue }) => getValue().total,
    },
    {
      accessorKey: 'updatedAt',
      header: 'Last Updated',
      enableSorting: true,
      enableSortingRemoval: false,
      cell: ({ getValue }) => {
        const date = getValue();
        const relativeTime = getRelativeTime(date);
        return `<span class="text-neutral-50" title="${new Date(date).toLocaleString()}">${relativeTime}</span>`;
      },
    },
    {
      accessorKey: 'createdAt',
      header: 'Created',
      enableSorting: true,
      enableSortingRemoval: false,
      cell: ({ getValue }) => {
        const date = getValue();
        const relativeTime = getRelativeTime(date);
        return `<span class="text-neutral-50" title="${new Date(date).toLocaleString()}">${relativeTime}</span>`;
      },
    },

    {
      id: 'launch',
      header: '',
      enableSorting: false,
      size: 300,
      cell: ({ row }) => ({
        Component: LaunchApp,
        props: {
          hubId: row.original._id,
          showOnHover: true,
        },
      }),
    },
    {
      id: 'actions',
      header: '',
      enableSorting: false,
      size: 50,
      cell: ({ row }: CellContext<any, any>) => ({
        Component: HubsDropdown,
        props: { row },
      }),
    },
  ];

  // Reactive Statements
  $: cardsData = $summaryData?.data
    ? [
        {
          title: 'Total Hubs',
          value: $summaryData.data.totalHubs,
          icon: Hubsicon,
        },
        {
          title: 'Total Workspaces',
          value: $summaryData.data.workspaces.total,
          icon: WorkspaceIcon2,
          subData: [
            { value: 'Private', count: $summaryData.data.workspaces.private },
            { value: 'Public', count: $summaryData.data.workspaces.public },
          ],
        },
        {
          title: 'Total Contributors',
          value: $summaryData.data.totalContributors.total,
          icon: ContributionIcon,
          subData: [
            { value: 'Admins', count: $summaryData.data.totalContributors.admins },
            { value: 'Members', count: $summaryData.data.totalContributors.members },
          ],
        },
      ]
    : [];

  $: totalItems = $hubsData?.data?.totalCount || 0;
</script>

<section class="bg-surface-900 flex w-full flex-col gap-4 pt-4">
  <!-- Overview Cards Section -->
  {#if !$hubsData?.httpStatusCode}
    <div class="flex h-[calc(100vh-4rem)] w-full items-center justify-center">
      <CircularLoader />
    </div>
  {:else}
    <div class="flex flex-col gap-4">
      <div class="flex flex-col gap-2">
        <h1 class="font-inter text-fs-ds-20 leading-lh-ds-120 font-medium text-neutral-50">
          Overview
        </h1>
        <h2 class="font-inter font-regular text-fs-ds-14 leading-lh-ds-143 text-neutral-100">
          Manage and monitor all your Sparrow Hubs
        </h2>
      </div>
      <div class="flex flex-row justify-between">
        {#each cardsData as card}
          <OverviewCards
            icon={card.icon}
            title={card.title}
            value={card.value}
            points={card?.subData}
          />
        {/each}
      </div>
    </div>

    <!-- Hubs Table Section -->
    <div class="flex flex-col gap-4">
      <div class="flex flex-col gap-2">
        <h2 class="font-inter text-fs-ds-20 leading-lh-ds-120 font-medium text-neutral-50">Hubs</h2>
        <h2 class="text-fs-ds-14 leading-lh-ds-143 font-light text-neutral-100">
          All your Hub's in one place, manage access, manage members, or dive into details with
          ease.
        </h2>
      </div>

      <div class="bg-surface-900 flex min-h-full flex-col gap-4">
        <div class="flex justify-between">
          <TableSearch
            value={filters.searchTerm}
            on:search={handleSearchChange}
            isLoading={$isFetching}
            placeholder={'Search hubs'}
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
            New Hub
          </Button>
        </div>

        {#if totalItems === 0 && !$isFetching}
          <div class="flex flex-col items-center justify-center py-16">
            <p class="text-fs-ds-14 font-fw-ds-300 text-neutral-400">No results found.</p>
          </div>
        {:else}
          <Table
            {columns}
            data={$hubsData?.data?.hubs || []}
            isLoading={$isFetching}
            pageIndex={pagination.pageIndex}
            pageSize={pagination.pageSize}
            {totalItems}
            on:sortingChange={handleSortingChange}
            on:rowClick={handleRowClick}
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
    </div>
    {#if showModal}
      <Modal on:close={() => (showModal = false)}>
        <AddHubs onClose={() => (showModal = false)} />
      </Modal>
    {/if}
  {/if}
</section>
