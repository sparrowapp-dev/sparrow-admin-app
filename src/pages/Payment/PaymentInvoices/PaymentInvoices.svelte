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

  import Table from '@/components/Table/Table.svelte';
  import TablePagination from '@/components/TablePagination/TablePagination.svelte';
  import HubUrl from '@/components/TableComponents/HubUrl.svelte';
  import HubsDropdown from '@/components/TableComponents/HubsDropdown.svelte';
  import Modal from '@/components/Modal/Modal.svelte';
  import AddHubs from '@/components/AddHubs/AddHubs.svelte';
  import CircularLoader from '@/ui/CircularLoader/CircularLoader.svelte';
  import TableTag from '@/components/TableComponents/TableTag.svelte';

  // State
  let pagination = { pageIndex: 0, pageSize: 10 };
  let filters = { searchTerm: '' };
  let sorting: SortingState = [{ id: 'createdAt', desc: true }];
  let showModal = false;

  // Invoices data (replace hardcodedData)
  const invoices = [
    {
      id: 'in_1RY51aFLRwufXqZCdM29zhwo',
      dueDate: 1749472922,
      plan: 'Professional',
      totalUsers: 1,
      status: 'paid',
      amount: 179.03,
      paymentMethod: 'Visa **** 0006',
      invoiceNumber: 'O6YKFRYK-0003',
      invoicedTo: 'Customer (mithesh.dev.work@gmail.com)',
      billingCycle: 'N/A',
      grossAmount: 179.03,
      taxAmount: 0,
      netAmount: 179.03,
      invoicePdf:
        'https://pay.stripe.com/invoice/acct_1RRv7hFLRwufXqZC/test_YWNjdF8xUlJ2N2hGTFJ3dWZYcVpDLF9TVDEzMmZpRUhBSkRQQVdjMlRKcjdsOWVqeUcxSm1jLDE0MDE1OTEyNA0200jMwdCwu5/pdf?s=ap',
      created: 1749472922,
    },
    {
      id: 'in_1RY4LMFLRwufXqZC68F2zQCG',
      dueDate: 1749470304,
      plan: 'Professional',
      totalUsers: 1,
      status: 'paid',
      amount: 10,
      paymentMethod: 'Visa **** 0006',
      invoiceNumber: 'O6YKFRYK-0002',
      invoicedTo: 'Customer (mithesh.dev.work@gmail.com)',
      billingCycle: 'N/A',
      grossAmount: 10,
      taxAmount: 0,
      netAmount: 10,
      invoicePdf:
        'https://pay.stripe.com/invoice/acct_1RRv7hFLRwufXqZC/test_YWNjdF8xUlJ2N2hGTFJ3dWZYcVpDLF9TVDBNVVlsNjhnbXhtNkJnU1FxWERGc2d0VmNYTzR6LDE0MDE1OTEyNA0200mnpTxb5b/pdf?s=ap',
      created: 1749470304,
    },
    {
      id: 'in_1RY4KiFLRwufXqZC5uKGTDWN',
      dueDate: 1749470264,
      plan: 'Standard',
      totalUsers: 1,
      status: 'paid',
      amount: 9.99,
      paymentMethod: 'Visa **** 0006',
      invoiceNumber: 'O6YKFRYK-0001',
      invoicedTo: 'Customer (mithesh.dev.work@gmail.com)',
      billingCycle: 'N/A',
      grossAmount: 9.99,
      taxAmount: 0,
      netAmount: 9.99,
      invoicePdf:
        'https://pay.stripe.com/invoice/acct_1RRv7hFLRwufXqZC/test_YWNjdF8xUlJ2N2hGTFJ3dWZYcVpDLF9TVDBMSldqeDZxSlBSbEhoUkpPNXBuaFFMSUt6aVhhLDE0MDE1OTEyNA0200SBaZU7nR/pdf?s=ap',
      created: 1749470264,
    },
  ];

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
      accessorKey: 'dueDate',
      header: 'Due Date',
      enableSorting: true,
      enableSortingRemoval: false,
      cell: ({ getValue }: CellContext<any, any>) => {
        // Convert unix timestamp to readable date in 'MMM d, yyyy' format
        const ts = getValue();
        if (!ts) return '';
        const date = new Date(ts * 1000);
        return date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        });
      },
    },
    {
      accessorKey: 'plan',
      header: 'Plan',
      enableSorting: false,
      cell: ({ getValue, row }: CellContext<any, any>) => ({
        Component: TableTag,
        props: { value: getValue() },
      }),
    },
    {
      accessorKey: 'totalUsers',
      header: 'Total Users',
      enableSorting: false,
    },
    {
      accessorKey: 'status',
      header: 'Status',
      enableSorting: false,
      cell: ({ getValue }: CellContext<any, any>) => {
        return `<span class="capitalize">${getValue()}</span>`;
      },
    },
    {
      accessorKey: 'amount',
      header: 'Billing Amount',
      enableSorting: false,
      cell: ({ getValue }: CellContext<any, any>) => {
        return `$${Number(getValue()).toFixed(2)}`;
      },
    },
    {
      accessorKey: 'paymentMethod',
      header: 'Payment Method',
      enableSorting: false,
      cell: ({ getValue }: CellContext<any, any>) => {
        const value = getValue();
        // Extract card type and last 4 digits if present
        const match = value.match(/([A-Za-z]+)\s*\*+\s*(\d{4})/);
        if (match) {
          const type = match[1];
          const last4 = match[2];
          return `<div><span class=\"capitalize\">${type}</span><p class=\"text-xs text-neutral-400 mt-1\">Ends with ${last4}</p></div>`;
        }
        // fallback: just show the value
        return `<span class=\"capitalize\">${value}</span>`;
      },
    },
  ];

  $: totalItems = $hubsData?.data?.totalCount || 0;
</script>

<section class="bg-surface-900 flex w-full flex-col gap-4 pt-4">
  <!-- Overview Cards Section -->
  {#if !$hubsData?.httpStatusCode}
    <div class="flex h-[calc(100vh-4rem)] w-full items-center justify-center">
      <CircularLoader />
    </div>
  {:else}
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
        <Table
          {columns}
          data={invoices.slice(
            pagination.pageIndex * pagination.pageSize,
            (pagination.pageIndex + 1) * pagination.pageSize,
          )}
          isLoading={false}
          pageIndex={pagination.pageIndex}
          pageSize={pagination.pageSize}
          totalItems={invoices.length}
          on:sortingChange={handleSortingChange}
          on:rowClick={handleRowClick}
        />
        <TablePagination
          pageIndex={pagination.pageIndex}
          pageSize={pagination.pageSize}
          totalItems={invoices.length}
          isLoading={false}
          on:pageChange={handlePageChange}
          on:pageSizeChange={handlePageSizeChange}
        />
      </div>
    </div>
    {#if showModal}
      <Modal on:close={() => (showModal = false)}>
        <AddHubs onClose={() => (showModal = false)} />
      </Modal>
    {/if}
  {/if}
</section>
