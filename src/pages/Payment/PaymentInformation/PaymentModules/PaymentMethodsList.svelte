<script>
  // Svelte
  import { createEventDispatcher } from 'svelte';

  // UI Components
  import Button from '@/ui/Button/Button.svelte';

  // App Components
  import Modal from '@/components/Modal/Modal.svelte';
  import Table from '@/components/Table/Table.svelte';
  import DeleteCard from '@/components/DeleteCard/DeleteCard.svelte';
  import DeleteCardDropdown from '@/components/TableComponents/DeleteCardDropdown.svelte';
  import EditCardDropdown from '@/components/TableComponents/EditCardDropdown.svelte';
  import DefaultCard from '@/components/TableComponents/DefaultCard.svelte';

  // Icons
  import PlusIcon from '@/assets/icons/PlusIcon.svelte';

  const dispatch = createEventDispatcher();

  // Props
  export let paymentMethods = [];

  // Local state variables
  let showDeleteModal = false;
  let selectedPaymentMethod = null;

  // Table state
  let filters = { searchTerm: '' };
  let pagination = { pageIndex: 0, pageSize: 10 };
  let sorting = [];

  function formatAddress(address) {
    if (!address) return 'Not provided';

    const parts = [];
    if (address.line1) parts.push(address.line1);
    if (address.city) parts.push(address.city);
    if (address.state) parts.push(address.state);
    if (address.country) parts.push(address.country);

    return parts.join(', ');
  }

  function openDeleteModal(paymentMethod) {
    selectedPaymentMethod = paymentMethod;
    showDeleteModal = true;
  }

  function closeModal() {
    showDeleteModal = false;
    selectedPaymentMethod = null;
  }

  function handlePaymentMethodDeleted() {
    // Emit event to parent to refetch data
    dispatch('requestRefresh');

    // Check if we've deleted the last card
    if (paymentMethods.length <= 1) {
      dispatch('allCardsDeleted');
    }

    closeModal();
  }

  function selectCard(index) {
    dispatch('cardSelected', { index });
  }

  // Handle edit billing details
  function editBillingDetails(paymentMethod) {
    dispatch('editBilling', { paymentMethodId: paymentMethod.id });
  }

  // Define table columns
  const columns = [
    {
      accessorKey: 'card.brand',
      id: 'card_brand',
      header: 'Card details',
      cell: ({ row }) => ({
        Component: DefaultCard,
        props: {
          row: row?.original,
        },
      }),
      enableSorting: true,
    },
    {
      accessorKey: 'billing_details.address',
      header: 'Billing Address',
      enableSorting: false,
      cell: ({ row }) => {
        const address = row.original.billing_details?.address;
        return `<span class="text-neutral-50 font-fs-ds-12">${formatAddress(address)}</span>`;
      },
    },
    {
      accessorKey: 'card.exp_month',
      id: 'card_exp_month',
      header: 'Expiration Date',
      enableSorting: false,
      cell: ({ row }) => {
        const card = row.original.card;
        return `<span class="text-neutral-50 font-fs-ds-12">${card.exp_month}/${card.exp_year}</span>`;
      },
    },
    {
      accessorKey: 'billing_details.name',
      header: 'Cardholder Name',
      enableSorting: false,
      cell: ({ row }) => {
        const name = row.original.billing_details?.name;
        return `<span class="text-neutral-50 font-fs-ds-12">${name || 'Not provided'}</span>`;
      },
    },
    {
      id: 'actions',
      header: '',
      enableSorting: false,
      cell: ({ row }) => ({
        Component: EditCardDropdown,
        props: {
          row,
          on_editBilling: editBillingDetails,
        },
      }),
    },
    {
      id: 'actions',
      header: '',
      enableSorting: false,
      cell: ({ row }) => ({
        Component: DeleteCardDropdown,
        props: {
          row,
          on_deleteCard: openDeleteModal,
        },
      }),
    },
  ];

  function handleSortingChange(event) {
    sorting = event.detail;
  }

  function sortData(data, sorting) {
    if (!sorting.length) return data;

    return [...data].sort((a, b) => {
      const sort = sorting[0];

      if (sort.id === 'card_brand') {
        const aValue = a.card?.last4;
        const bValue = b.card?.last4;

        if (!aValue) return 1;
        if (!bValue) return -1;

        return sort.desc
          ? parseInt(bValue) - parseInt(aValue)
          : parseInt(aValue) - parseInt(bValue);
      }

      const aValue = a[sort.id];
      const bValue = b[sort.id];

      if (!aValue) return 1;
      if (!bValue) return -1;

      return sort.desc ? bValue.localeCompare(aValue) : aValue.localeCompare(bValue);
    });
  }

  // Filtered data based on search
  $: filteredData = paymentMethods.filter((item) => {
    const searchTerm = filters.searchTerm.toLowerCase().trim();
    if (!searchTerm) return true;

    // Search across various fields
    const { card, billing_details } = item;
    const brand = card?.brand || '';
    const cardholderName = billing_details?.name || '';
    const city = billing_details?.address?.city || '';
    const country = billing_details?.address?.country || '';

    return (
      brand.toLowerCase().includes(searchTerm) ||
      cardholderName.toLowerCase().includes(searchTerm) ||
      city.toLowerCase().includes(searchTerm) ||
      country.toLowerCase().includes(searchTerm)
    );
  });

  // Sort the filtered data
  $: sortedData = sortData(filteredData, sorting);

  // Paginated data (now using sortedData)
  $: paginatedData = sortedData.slice(
    pagination.pageIndex * pagination.pageSize,
    (pagination.pageIndex + 1) * pagination.pageSize,
  );

  function addNewCard() {
    dispatch('addCard');
  }

  // Handle row click to select a card
  function handleRowClick(rowData) {
    const index = paymentMethods.findIndex((pm) => pm.id === rowData.id);
    if (index !== -1) {
      selectCard(index);
    }
  }
</script>

{#if paymentMethods.length !== 0}
  <div class="payment-methods-list">
    <div class="header mb-4 flex items-center justify-between">
      <div>
        <h2 class="text-fs-ds-20 font-fw-ds-500 text-neutral-50">Manage your Cards</h2>
        <p class="text-fs-ds-14 font-fw-ds-300 mb-8 text-neutral-100">
          View and manage your saved payment methods in one place.
        </p>
      </div>
      <Button on:click={addNewCard} variant="filled-primary" size="small" iconLeft={true}>
        <svelte:fragment slot="iconLeft">
          <PlusIcon />
        </svelte:fragment>
        New Card
      </Button>
    </div>

    <Table
      {columns}
      data={paginatedData}
      {sorting}
      on:sortingChange={handleSortingChange}
      pageSize={20}
      on:rowClick={({ detail }) => handleRowClick(detail)}
    />

    {#if showDeleteModal}
      <Modal on:close={closeModal}>
        <DeleteCard
          paymentMethodId={selectedPaymentMethod.id}
          cardLast4={selectedPaymentMethod.card.last4}
          on:close={closeModal}
          on:paymentMethodDeleted={handlePaymentMethodDeleted}
        />
      </Modal>
    {/if}
  </div>
{/if}
