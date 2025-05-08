<!-- <script lang="ts">
  import Hubsicon from '@/assets/icons/Hubsicon.svelte';
  import OverviewCards from './OverviewCards.svelte';
  import WorkspaceIcon2 from '@/assets/icons/WorkspaceIcon2.svelte';
  import ContributionIcon from '@/assets/icons/ContributionIcon.svelte';
  import TableSearch from '@/components/TableSearch/TableSearch.svelte';
  import Table from '@/components/Table/Table.svelte';
  import TablePagination from '@/components/TablePagination/TablePagination.svelte';
  const tableData = {
    totalpages: 1,
    currentPage: 1,
    totalCount: 3,
    limit: 10,
    hubs: [
      {
        _id: '6819c4612fcdf46d96b184d0',
        name: 'hub 2',
        workspaceStats: {
          total: 0,
          private: 0,
          public: 0,
        },
        workspaces: [],
        contributors: {
          total: 1,
          details: [
            {
              id: '6819c4122fcdf46d96b184c4',
              role: 'owner',
              email: 'arnab.samanta@techdome.net.in',
            },
          ],
        },
        createdAt: '2025-05-06T08:12:17.070Z',
        updatedAt: '2025-05-06T08:12:17.070Z',
      },
      {
        _id: '6819c45b2fcdf46d96b184cf',
        name: 'hub 1',
        workspaceStats: {
          total: 2,
          private: 1,
          public: 1,
        },
        workspaces: [
          {
            id: '6819c4e02fcdf46d96b184d3',
            name: 'My Workspace',
            type: 'PRIVATE',
            description: '',
            createdAt: '2025-05-06T08:14:24.253Z',
            updatedAt: '2025-05-06T08:14:24.253Z',
          },
          {
            id: '6819c4eb2fcdf46d96b184d6',
            name: 'My Workspace 2',
            type: 'PUBLIC',
            description: '',
            createdAt: '2025-05-06T08:14:35.029Z',
            updatedAt: '2025-05-06T08:14:35.029Z',
          },
        ],
        contributors: {
          total: 2,
          details: [
            {
              id: '6819c4122fcdf46d96b184c4',
              role: 'owner',
              email: 'arnab.samanta@techdome.net.in',
            },
            {
              id: '6819c5362fcdf46d96b184d8',
              role: 'admin',
              email: 'loveumearnab.2812000@gmail.com',
            },
          ],
        },
        createdAt: '2025-05-06T08:12:11.233Z',
        updatedAt: '2025-05-06T08:12:11.233Z',
      },
      {
        _id: '6819c4122fcdf46d96b184c5',
        name: "samanta's Hub",
        workspaceStats: {
          total: 2,
          private: 2,
          public: 0,
        },
        workspaces: [
          {
            id: '6819c4162fcdf46d96b184c7',
            name: 'My Workspace',
            type: 'PRIVATE',
            description: '',
            createdAt: '2025-05-06T08:11:02.315Z',
            updatedAt: '2025-05-06T08:11:02.315Z',
          },
          {
            id: '6819c4432fcdf46d96b184cd',
            name: 'My Workspace 2',
            type: 'PRIVATE',
            description: '',
            createdAt: '2025-05-06T08:11:47.302Z',
            updatedAt: '2025-05-06T08:11:47.302Z',
          },
        ],
        contributors: {
          total: 1,
          details: [
            {
              id: '6819c4122fcdf46d96b184c4',
              role: 'owner',
              email: 'arnab.samanta@techdome.net.in',
            },
          ],
        },
        createdAt: '2025-05-06T08:10:58.761Z',
        updatedAt: '2025-05-06T08:10:58.761Z',
      },
    ],
  };
  const data = {
    totalHubs: 3,
    workspaces: {
      total: 4,
      private: 3,
      public: 1,
    },
    totalContributors: {
      admins: 4,
      members: 0,
      total: 4,
    },
  };
  const cardsData = [
    {
      title: 'Total Hubs',
      value: data.totalHubs,
      icon: Hubsicon,
    },
    {
      title: 'Workspaces',
      value: data.workspaces.total,
      icon: WorkspaceIcon2,
      subData: [
        { value: 'Private', count: data.workspaces.private },
        { value: 'Public', count: data.workspaces.public },
      ],
    },
    {
      title: 'Contributors',
      value: data.totalContributors.total,
      icon: ContributionIcon,
      subData: [
        { value: 'Admins', count: data.totalContributors.admins },
        { value: 'Members', count: data.totalContributors.members },
      ],
    },
  ];
  const mockUsers = Array.from({ length: 100 }, (_, i) => {
    const id = i + 1;
    const statuses = ['Active', 'Inactive', 'Pending'];
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
    const randomDate = new Date(Date.now() - Math.random() * 31536000000); // Random date within last year

    return {
      id,
      name: `User ${id}`,
      email: `user${id}@example.com`,
      status: randomStatus,
      createdAt: randomDate.toISOString(),
    };
  });
  let tableComponent;
  let isLoading = false;
  let pagination = { pageIndex: 0, pageSize: 10 };
  let filters = { searchTerm: '' };
  let totalItems = 0;

  // Define your columns
  const columns = [
    {
      accessorKey: 'id',
      header: 'ID',
      size: 100,
    },
    {
      accessorKey: 'name',
      header: 'Name',
    },
    {
      accessorKey: 'email',
      header: 'Email',
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ getValue }) => {
        const status = getValue();
        return `<span class="status status-${status.toLowerCase()}">${status}</span>`;
      },
    },
    {
      accessorKey: 'createdAt',
      header: 'Created At',
      cell: ({ getValue }) => {
        const date = new Date(getValue());
        return date.toLocaleDateString();
      },
    },
  ];

  // Mock data fetching function that mimics an API
  async function fetchTableData({ pagination, filters }) {
    isLoading = true;

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 300));

    try {
      // Filter data based on search term
      let filteredData = [...mockUsers];

      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase();
        filteredData = filteredData.filter(
          (user) =>
            user.name.toLowerCase().includes(searchLower) ||
            user.email.toLowerCase().includes(searchLower) ||
            user.status.toLowerCase().includes(searchLower),
        );
      }

      // Get total count before pagination
      const total = filteredData.length;

      // Apply pagination
      const start = pagination.pageIndex * pagination.pageSize;
      const end = start + pagination.pageSize;
      const paginatedData = filteredData.slice(start, end);

      totalItems = total;

      return {
        data: paginatedData,
        totalItems: total,
      };
    } catch (error) {
      console.error('Error with mock data:', error);
      return { data: [], totalItems: 0 };
    } finally {
      isLoading = false;
    }
  }

  // Handle pagination change
  function handlePaginationChange(event) {
    pagination = event.detail;
  }

  // Handle search change
  function handleSearchChange(event) {
    filters.searchTerm = event.detail;
  }

  // Handle page change from pagination component
  function handlePageChange(event) {
    pagination = {
      ...pagination,
      pageIndex: event.detail,
    };
  }

  // Handle page size change from pagination component
  function handlePageSizeChange(event) {
    pagination = {
      ...pagination,
      pageSize: event.detail,
      pageIndex: 0, // Reset to first page when changing page size
    };
  }
</script> -->
<script lang="ts">
  function getRelativeTime(date: string | number | Date): string {
    const now = new Date();
    const then = new Date(date);
    const seconds = Math.floor((now.getTime() - then.getTime()) / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const months = Math.floor(days / 30);
    const years = Math.floor(months / 12);
    const launchUrl = import.meta.env.VITE_SPARROW_LAUNCH_URL;
    if (years > 0) {
      return `${years} ${years === 1 ? 'year' : 'years'} ago`;
    } else if (months > 0) {
      return `${months} ${months === 1 ? 'month' : 'months'} ago`;
    } else if (days > 0) {
      return `${days} ${days === 1 ? 'day' : 'days'} ago`;
    } else if (hours > 0) {
      return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
    } else if (minutes > 0) {
      return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
    } else {
      return 'just now';
    }
  }
  import { onMount } from 'svelte';
  import { hubsService } from '@/services/hubs.service';
  import Hubsicon from '@/assets/icons/Hubsicon.svelte';
  import OverviewCards from './OverviewCards.svelte';
  import WorkspaceIcon2 from '@/assets/icons/WorkspaceIcon2.svelte';
  import ContributionIcon from '@/assets/icons/ContributionIcon.svelte';
  import TableSearch from '@/components/TableSearch/TableSearch.svelte';
  import Table from '@/components/Table/Table.svelte';
  import TablePagination from '@/components/TablePagination/TablePagination.svelte';
  import ThreeDotsVerticalIcon from '@/assets/icons/ThreeDotsVerticalIcon.svelte';
  import EditIcon from '@/assets/icons/EditIcon.svelte';
  import ManageMembersIcon from '@/assets/icons/ManageMembersIcon.svelte';
  import UpgradeStandardIcon from '@/assets/icons/UpgradeStandardIcon.svelte';
  import Copy from '@/assets/icons/Copy.svelte';
  import { navigate } from 'svelte-routing';
  import HubUrl from '@/components/TableComponents/HubUrl.svelte';
  import HubsDropdown from '@/components/TableComponents/HubsDropdown.svelte';
  interface Workspace {
    id: string;
    name: string;
    type: 'PRIVATE' | 'PUBLIC';
    description: string;
    createdAt: string;
    updatedAt: string;
  }
  interface Contributor {
    id: string;
    role: string;
    email: string;
  }

  interface Hub {
    _id: string;
    name: string;
    hubUrl: string;
    workspaceStats: {
      total: number;
      private: number;
      public: number;
    };
    workspaces: Workspace[];
    contributors: {
      total: number;
      details: Contributor[];
    };
    createdAt: string;
    updatedAt: string;
  }

  interface HubsResponse {
    totalpages: number;
    currentPage: number;
    totalCount: number;
    limit: number;
    hubs: Hub[];
    sortBy: 'createdAt' | 'updatedAt' | 'name';
    sortOrder: 'asc' | 'desc';
  }
  let tableComponent;
  let isLoading = false;
  let pagination = { pageIndex: 0, pageSize: 10 };
  let filters = { searchTerm: '' };
  let totalItems = 0;
  let summaryData: any = null;
  let hubsData: any = [];
  let toggleDropdown = false;
  // Load initial summary data
  onMount(async () => {
    try {
      summaryData = await hubsService.gethubsummary();
      await fetchTableData({ pagination, filters });
    } catch (error) {
      console.error('Failed to load initial data:', error);
    }
  });
  onMount(() => {
    // ...existing onMount code...

    document.addEventListener('copyUrl', ((e: CustomEvent) => {
      copyToClipboard(e.detail);
    }) as EventListener);

    return () => {
      // ...existing cleanup code...
      document.removeEventListener('copyUrl', ((e: CustomEvent) => {
        copyToClipboard(e.detail);
      }) as EventListener);
    };
  });
  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text).then(
      () => {
        // Could add a toast notification here
        console.log('URL copied to clipboard');
      },
      (err) => {
        console.error('Failed to copy URL:', err);
      },
    );
  }

  $: cardsData = summaryData
    ? [
        {
          title: 'Total Hubs',
          value: summaryData.totalHubs,
          icon: Hubsicon,
        },
        {
          title: 'Workspaces',
          value: summaryData.workspaces.total,
          icon: WorkspaceIcon2,
          subData: [
            { value: 'Private', count: summaryData.workspaces.private },
            { value: 'Public', count: summaryData.workspaces.public },
          ],
        },
        {
          title: 'Contributors',
          value: summaryData.totalContributors.total,
          icon: ContributionIcon,
          subData: [
            { value: 'Admins', count: summaryData.totalContributors.admins },
            { value: 'Members', count: summaryData.totalContributors.members },
          ],
        },
      ]
    : [];
  const columns = [
    {
      accessorKey: 'name',
      header: 'Sparrow Hubs',
      enableSorting: true,
    },
    {
      accessorKey: 'hubUrl',
      header: 'Hub URL',
      enableSorting: false,
      cell: ({ getValue, row }) => ({
        Component: HubUrl,
        props: { Value: getValue(), row: row },
      }),
    },
    {
      id: 'Plans',
      header: 'Hub Plan',
      cell: ({}) => {
        return `
        <div class=" px-1 py-0.5 w-fit border border-neutral-500 bg-neutral-700 rounded-[2px] text-fs-ds-12 leading-lh-ds-130 font-inter font-regular">Community</div>
        
        `;
      },
    },
    {
      accessorKey: 'workspaceStats',
      header: 'Workspaces',
      enableSorting: false,
      cell: ({ getValue }) => {
        const stats = getValue();
        return `${stats.private} Private, ${stats.public} Public`;
      },
    },
    {
      accessorKey: 'contributors',
      header: 'Contributors',
      enableSorting: false,
      cell: ({ getValue }) => {
        const contributors = getValue();
        return contributors.total;
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
      id: 'actions',
      header: '',
      enableSorting: false,
      cell: ({ row }) => ({
        Component: HubsDropdown,
        props: { row: row },
      }),
    },
  ];

  async function fetchTableData({ pagination, filters, sorting }) {
    isLoading = true;
    try {
      const response: HubsResponse = await hubsService.getAllUserHubs({
        page: pagination.pageIndex + 1,
        limit: pagination.pageSize,
        search: filters.searchTerm,
        sortBy: sorting?.[0]?.id || 'createdAt',
        sortOrder: sorting?.[0]?.desc ? 'desc' : 'asc',
      });
      hubsData = response.hubs;
      totalItems = response.totalCount;

      return {
        data: response.hubs,
        totalItems: response.totalCount,
      };
    } catch (error) {
      console.error('Error fetching hubs:', error);
      return { data: [], totalItems: 0 };
    } finally {
      isLoading = false;
    }
  }

  function handlePaginationChange(event) {
    pagination = event.detail;
  }

  function handleSearchChange(event) {
    filters.searchTerm = event.detail;
    pagination.pageIndex = 0;
  }

  function handlePageChange(event) {
    pagination = {
      ...pagination,
      pageIndex: event.detail,
    };
  }

  function handlePageSizeChange(event) {
    pagination = {
      ...pagination,
      pageSize: event.detail,
      pageIndex: 0,
    };
  }
  function handleRowClick(event: CustomEvent<Hub>) {
    const hub = event.detail;
    navigate(`/hubs/workspace/${hub._id}`);
  }
</script>

<section class="bg-surface-900 flex min-h-screen w-full flex-col gap-6 p-4">
  <div class="flex flex-col gap-4 p-4">
    <div class="flex flex-col gap-2">
      <div>
        <h1 class="font-inter text-fs-ds-20 leading-lh-ds-120 font-medium text-neutral-50">
          Overview
        </h1>
      </div>
      <div>
        <h2 class="font-inter font-regular text-fs-ds-14 leading-lh-ds-143 text-neutral-100">
          Manage and monitor all your Sparrow Hubs
        </h2>
      </div>
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
  <div class="flex flex-col gap-2 px-4">
    <h2 class="font-inter text-fs-ds-20 leading-lh-ds-120 font-medium text-neutral-50">Hubs</h2>
    <h2 class="text-fs-ds-14 leading-lh-ds-143 font-light text-neutral-400">
      All your Hub’s in one place, manage access, manage members, or dive into details with ease.
    </h2>
  </div>
  <div class="table-container bg-surface-900 min-h-full">
    <div class="table-header">
      <TableSearch
        value={filters.searchTerm}
        on:search={(event) => handleSearchChange({ detail: event.detail })}
        {isLoading}
      />
    </div>

    <Table
      bind:this={tableComponent}
      {columns}
      fetchData={fetchTableData}
      initialPageSize={pagination.pageSize}
      initialPageIndex={pagination.pageIndex}
      initialSearchTerm={filters.searchTerm}
      {isLoading}
      on:paginationChange={handlePaginationChange}
      on:searchChange={handleSearchChange}
      on:rowClick={handleRowClick}
    />

    <TablePagination
      pageIndex={pagination.pageIndex}
      pageSize={pagination.pageSize}
      {totalItems}
      {isLoading}
      on:pageChange={handlePageChange}
      on:pageSizeChange={handlePageSizeChange}
    />
  </div>
</section>

<style>
  .table-container {
    width: 100%;
    margin: 0 auto;
    padding: 1.5rem;
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
