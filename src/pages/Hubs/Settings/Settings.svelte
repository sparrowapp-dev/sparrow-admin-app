<!-- UsageExample.svelte -->
<script>
  import Table from '@/components/Table/Table.svelte';
  import TablePagination from '@/components/TablePagination/TablePagination.svelte';
  import TableSearch from '@/components/TableSearch/TableSearch.svelte';

  // Mock data (replace this with your own data or API call)
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
</script>

<div class="table-container">
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

  h2 {
    font-size: 1.5rem;
    font-weight: 600;
    margin: 0;
  }

  :global(.status) {
    display: inline-flex;
    align-items: center;
    padding: 0.25rem 0.75rem;
    border-radius: 9999px;
    font-size: 0.75rem;
    font-weight: 500;
  }

  :global(.status-active) {
    background-color: #dcfce7;
    color: #166534;
  }

  :global(.status-inactive) {
    background-color: #fee2e2;
    color: #991b1b;
  }

  :global(.status-pending) {
    background-color: #fef3c7;
    color: #92400e;
  }
</style>
