<script lang="ts">
  import CloseIcon from '@/assets/icons/CloseIcon.svelte';
  import Table from '../Table/Table.svelte';
  import Button from '@/ui/Button/Button.svelte';
  import InvoiceStatus from './InvoiceStatus.svelte';
    import { captureEvent } from '@/utils/posthogConfig';

  export let onClose: () => void;

  export let invoice;

  $: invoiceDetailsRows = [
    { field: 'Invoice Number', value: invoice?.invoiceNumber || '-' },
    {
      field: 'Invoiced To',
      value: invoice?.invoicedTo ? invoice.invoicedTo.match(/\(([^)]+)\)/)?.[1] || '-' : '-',
    },
    {
      field: 'Due Date',
      value: invoice?.dueDate
        ? new Date(invoice.dueDate * 1000).toLocaleDateString('en-US', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })
        : '-',
    },
    { field: 'Billing Cycle', value: invoice?.billingCycle || '-' },
    { field: 'Hub Plan', value: invoice?.plan || '-' },
    { field: 'Total Users', value: invoice?.totalUsers || '-' },
    {
      field: 'Status',
      value: invoice?.status || '-', // Pass status value for rendering with component
      isStatus: true, // Custom flag to identify status row
    },
    {
      field: 'Payment Method',
      value:
        invoice?.cardBrand && invoice?.cardLast4
          ? `${invoice.cardBrand} (Ending with ${invoice.cardLast4})`
          : '-',
    },
    { field: 'Gross Amount', value: invoice?.grossAmount ? `$${invoice.grossAmount}` : '-' },
    { field: 'Tax Amount', value: invoice?.taxAmount ? `$${invoice.taxAmount}` : '-' },
    { field: 'Net Amount', value: invoice?.netAmount ? `$${invoice.netAmount}` : '-' },
  ];

  const invoiceDetailsColumns = [
    { accessorKey: 'field', header: 'Field', enableSorting: false },
    {
      accessorKey: 'value',
      header: 'Value',
      enableSorting: false,
      cell: ({ row }) => {
        if (row.original.field === 'Status') {
          return {
            Component: InvoiceStatus,
            props: { status: row.original.value },
          };
        }
        return row.original.value;
      },
    },
  ];

  function handleDownloadInvoice() {
    if (invoice?.invoicePdf) {
      captureUserDownloadPaymentInvoice();
      window.open(invoice.invoicePdf, '_blank');
    }
  }

  const captureUserDownloadPaymentInvoice = () =>{
    const eventProperties = {
      button_name:"Download Invoice"
    }
    captureEvent("admin_invoice_downloaded",eventProperties);
  }
</script>

<div class="bg-surface-600 rounded-lg p-6">
  <div class="flex items-start justify-between">
    <h2 class="text-fs-ds-20 font-fw-ds-500 font-inter text-neutral-50">Invoice Details</h2>
    <button type="button" class="cursor-pointer" on:click={onClose}> <CloseIcon /> </button>
  </div>

  <div>
    <Table
      columns={invoiceDetailsColumns}
      data={invoiceDetailsRows}
      containerClassName="my-6"
      cellClassName="text-fs-12 bg-surface-600 border-b-surface-400 text-neutral-100"
      rowClassName="border-surface-600 border-b"
    />
  </div>
  <div class="flex justify-end">
    <Button
      variant="filled-primary"
      size="medium"
      on:click={handleDownloadInvoice}
      disabled={!invoice?.invoicePdf}
    >
      Download Invoice
    </Button>
  </div>
</div>
