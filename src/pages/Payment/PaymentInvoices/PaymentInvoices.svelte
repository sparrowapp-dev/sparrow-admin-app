<script lang="ts">
  // Svelte
  import { onMount } from 'svelte';
  import { derived, get } from 'svelte/store';
  import { useLocation } from 'svelte-routing';

  // Services
  import { createQuery } from '@/services/api.common';
  import { billingService } from '@/services/billing.service';

  // App Components
  import Table from '@/components/Table/Table.svelte';
  import TablePagination from '@/components/TablePagination/TablePagination.svelte';
  import Modal from '@/components/Modal/Modal.svelte';
  import InvoiceStatus from '@/components/TableComponents/InvoiceStatus.svelte';
  import InvoiceTag from '@/components/TableComponents/InvoiceTag.svelte';
  import InvoiceDropdown from '@/components/TableComponents/InvoiceDropdown.svelte';
  import InvoiceDetails from '@/components/TableComponents/InvoiceDetails.svelte';

  // UI Components
  import CircularLoader from '@/ui/CircularLoader/CircularLoader.svelte';

  // Utilities
  import { notification } from '@/components/Toast';

  // State
  let pagination = { pageIndex: 0, pageSize: 10 };
  let showModal = false;
  let selectedInvoice: any = null;

  const location = useLocation();
  const extractedParam = derived(location, ($location) => {
    const match = $location.pathname.match(/\/billing\/billingInvoices\/([^\/]+)/);
    return match?.[1];
  });

  // Combined query for customer data and invoices
  const {
    data: invoiceData,
    isFetching: isInvoicesLoading,
    refetch,
  } = createQuery(async () => {
    const hubId = get(extractedParam);
    if (!hubId) return { customerData: null, invoices: [] };

    try {
      // First fetch customer data
      const customerRes = await billingService.fetchCustomerId(hubId);
      console.log('Fetched customer data:', customerRes);

      // If we have customerId, fetch invoices
      if (customerRes?.data?.customerId) {
        try {
          const invoicesRes = await billingService.getCustomerInvoices(customerRes.data.customerId);
          console.log('Fetched invoices:', invoicesRes);
          return {
            customerData: customerRes,
            invoices: invoicesRes?.data?.invoices || [],
          };
        } catch (e) {
          console.error('Error fetching invoices:', e);
          return {
            customerData: customerRes,
            invoices: [],
          };
        }
      }

      return {
        customerData: customerRes,
        invoices: [],
      };
    } catch (e) {
      console.error('Error fetching customer data:', e);
      return { customerData: null, invoices: [] };
    }
  });

  // Event Handlers
  function handlePageChange(event: CustomEvent<number>) {
    pagination = { ...pagination, pageIndex: event.detail };
  }

  function handlePageSizeChange(event: CustomEvent<number>) {
    pagination = { pageSize: event.detail, pageIndex: 0 };
  }

  function copyToClipboard(text: string) {
    navigator.clipboard
      .writeText(text)
      .then(() => notification.success('URL successfully copied'))
      .catch(() => notification.error('Failed to copy URL'));
  }

  function openInvoiceDetails(invoice) {
    selectedInvoice = invoice;
    showModal = true;
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
      cell: ({ getValue }) => {
        const ts = getValue();
        if (!ts) return '-';
        const date = new Date(ts * 1000);
        return date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        });
      },
    },
    {
      accessorKey: 'plan',
      header: 'Plan',
      enableSorting: false,
      cell: ({ getValue }) => ({
        Component: InvoiceTag,
        props: { value: getValue() },
      }),
    },
    {
      accessorKey: 'totalUsers',
      header: 'Total Users',
      enableSorting: false,
      cell: ({ getValue }) => getValue() || '-',
    },
    {
      accessorKey: 'status',
      header: 'Status',
      enableSorting: false,
      cell: ({ getValue }) => ({
        Component: InvoiceStatus,
        props: { status: getValue() },
      }),
    },
    {
      accessorKey: 'amount',
      header: 'Billing Amount',
      enableSorting: false,
      cell: ({ getValue }) => {
        const amount = getValue();
        return amount ? `$${amount}` : '-';
      },
    },
    {
      id: 'paymentMethod',
      header: 'Payment Method',
      enableSorting: false,
      cell: ({ row }) => {
        const brand = row.original.cardBrand;
        const last4 = row.original.cardLast4;
        if (brand && last4) {
          return `<div class='flex flex-col'><span>${brand}</span><span class='text-xs text-neutral-400'>Ending with ${last4}</span></div>`;
        }
        return '-';
      },
    },
    {
      id: 'invoicePdf',
      header: '',
      enableSorting: false,
      size: 50,
      cell: ({ row }) => ({
        Component: InvoiceDropdown,
        props: {
          invoice: row.original,
          openInvoiceDetails,
        },
      }),
    },
  ];

  // Reactive Statements
  $: invoices = $invoiceData?.invoices || [];
  $: customerData = $invoiceData?.customerData || null;
  $: totalItems = invoices.length;
  $: paginatedInvoices = invoices.slice(
    pagination.pageIndex * pagination.pageSize,
    (pagination.pageIndex + 1) * pagination.pageSize,
  );
  $: isLoading = $isInvoicesLoading;

  $: console.log('customerData:', customerData);
  $: console.log('invoices:', invoices);
</script>

<section class="bg-surface-900 flex w-full flex-col gap-4 pt-4">
  <!-- Overview Cards Section -->
  {#if isLoading}
    <div class="flex h-[calc(100vh-4rem)] w-full items-center justify-center">
      <CircularLoader />
    </div>
  {:else}
    <!-- Invoices Table Section -->
    <div class="flex flex-col gap-4">
      <div class="mb-6 flex items-end justify-between">
        <div>
          <h1 class="text-fs-ds-20 font-inter font-fw-ds-500 text-neutral-50">Invoices</h1>
          <p class="text-fs-ds-14 font-fw-ds-300 font-inter text-neutral-100">
            View and download all invoices for your billing cycle.
          </p>
        </div>
        <div class="billing-links flex gap-4">
          <a
            href="#"
            class="text-fs-ds-12 font-fw-ds-400 font-inter cursor-not-allowed text-neutral-500 underline"
            >Billing Documentation</a
          >
          <a
            href="https://sparrowapp.dev/terms-of-service/"
            target="_blank"
            rel="noopener noreferrer"
            class="text-fs-ds-12 font-fw-ds-400 font-inter text-neutral-200 underline"
            >Terms of Service</a
          >
          <a
            href="https://sparrowapp.dev/privacy-policy/"
            target="_blank"
            rel="noopener noreferrer"
            class="text-fs-ds-12 font-fw-ds-400 font-inter text-neutral-200 underline"
            >Privacy Policy</a
          >
        </div>
      </div>

      <div class="bg-surface-900 flex min-h-full flex-col gap-4">
        {#if totalItems === 0 && !isLoading}
          <div class="flex flex-col items-center justify-center py-16">
            <p class="text-fs-ds-14 font-fw-ds-300 text-neutral-400">No invoices found.</p>
          </div>
        {:else}
          <Table
            {columns}
            data={paginatedInvoices}
            {isLoading}
            pageIndex={pagination.pageIndex}
            pageSize={pagination.pageSize}
            {totalItems}
          />

          <TablePagination
            pageIndex={pagination.pageIndex}
            pageSize={pagination.pageSize}
            {totalItems}
            {isLoading}
            on:pageChange={handlePageChange}
            on:pageSizeChange={handlePageSizeChange}
          />
        {/if}
      </div>
    </div>
    {#if showModal}
      <Modal on:close={() => (showModal = false)}>
        <InvoiceDetails invoice={selectedInvoice} onClose={() => (showModal = false)} />
      </Modal>
    {/if}
  {/if}
</section>
