<script>
  import { createQuery } from '@/services/api.common';
  import AddPaymentMethod from './PaymentModules/AddPaymentMethod.svelte';
  import UpdateBillingDetails from './PaymentModules/UpdateBillingDetails.svelte';
  import PaymentMethodsList from './PaymentModules/PaymentMethodsList.svelte';
  import Button from '@/ui/Button/Button.svelte';
  import PlusIconV2 from '@/assets/icons/PlusIconV2.svelte';
  import Modal from '@/components/Modal/Modal.svelte';
  import EditIcon from '@/assets/icons/EditIcon.svelte';
  import CircularLoader from '@/ui/CircularLoader/CircularLoader.svelte';
  import { billingService } from '@/services/billing.service';
  import { useLocation } from 'svelte-routing';

  const location = useLocation();

  // Customer state
  let customerId = null;
  let hasPaymentMethod = false;
  let hasBillingAddress = false;
  let paymentMethods = [];
  let billingAddress = null;
  let error = null;

  // Extract hubId from URL
  let hubId = null;

  $: {
    const url = $location?.pathname || '';
    const matches = url.match(/\/([a-f0-9]{24})(?:\/|$)/i); // Match MongoDB ObjectId format
    if (matches && matches[1]) {
      hubId = matches[1];
    }
  }

  // Selected card state - to display in the top section
  let selectedCardIndex = 0;

  // Modal state
  let showAddCardModal = false;
  let showBillingAddressModal = false;
  let selectedPaymentMethodId = null;

  // Use createQuery to fetch customer ID
  const {
    data: customerData,
    isFetching: isLoadingCustomer,
    refetch: refetchCustomer,
  } = createQuery(async () => {
    return billingService.fetchCustomerId(hubId);
  });

  // Re-fetch when hubId changes
  $: if (hubId) {
    refetchCustomer();
  }

  // Set customerId when customerData changes
  $: if ($customerData !== undefined) {
    customerId = $customerData?.data?.customerId || null;
  }

  function openAddCardModal() {
    showAddCardModal = true;
    showBillingAddressModal = false;
  }

  function openBillingAddressModal(paymentMethodId = 'new') {
    selectedPaymentMethodId = paymentMethodId;
    showBillingAddressModal = true;
    showAddCardModal = false;
  }

  function closeModals() {
    showAddCardModal = false;
    showBillingAddressModal = false;
  }

  // Handle card selection from table
  function handleCardSelected(event) {
    if (event.detail && event.detail.index !== undefined) {
      selectedCardIndex = event.detail.index;
    }
  }

  // Using createQuery to fetch payment methods
  const {
    data: paymentMethodsData,
    isFetching: isLoadingPaymentMethods,
    refetch: refetchPaymentMethods,
  } = createQuery(async () => {
    if (!customerId) return { paymentMethods: [] };
    return billingService.getPaymentMethods(customerId);
  });

  // Process payment methods data
  $: if ($paymentMethodsData) {
    paymentMethods = $paymentMethodsData.paymentMethods || [];
    hasPaymentMethod = paymentMethods.length > 0;

    // Check if any payment method has billing details
    hasBillingAddress = paymentMethods.some(
      (pm) => pm.billing_details && pm.billing_details.address && pm.billing_details.address.line1,
    );

    // Ensure the selected card index is valid after data changes
    if (paymentMethods.length > 0 && selectedCardIndex >= paymentMethods.length) {
      selectedCardIndex = 0;
    }

    if (hasPaymentMethod && !hasBillingAddress) {
      billingAddress = {
        paymentMethodId: paymentMethods[0].id,
      };
    }
  }

  // Refetch payment methods when customerId changes
  $: if (customerId) {
    refetchPaymentMethods();
  }

  // Selected payment method
  $: selectedPaymentMethod = paymentMethods.length > 0 ? paymentMethods[selectedCardIndex] : null;
  $: hasSelectedPaymentMethodBillingDetails =
    !!selectedPaymentMethod?.billing_details?.address?.line1;

  // When a payment method is added successfully
  function handlePaymentMethodAdded(event) {
    // Get the customer ID from the event if it's a new customer
    if (event.detail && event.detail.customerId) {
      customerId = event.detail.customerId;
      // After setting a new customer ID, we should refetch it to ensure it's saved
      refetchCustomer();
    }

    closeModals();
    refetchPaymentMethods();
  }

  // When billing details are updated successfully
  function handleBillingDetailsUpdated() {
    closeModals();
    refetchPaymentMethods();
  }

  // Handle when all payment methods are deleted
  function handleAllCardsDeleted() {
    // Reset state
    selectedCardIndex = 0;
    hasPaymentMethod = false;
    hasBillingAddress = false;
    paymentMethods = [];
    selectedPaymentMethod = null;

    // Refetch data
    refetchPaymentMethods();
  }
</script>

{#if !$customerData?.httpStatusCode}
  <div class="flex h-[calc(100vh-4rem)] w-full items-center justify-center">
    <CircularLoader />
  </div>
{:else}
  <section class="payment-information text-white">
    <div class="mb-6 flex items-end justify-between">
      <div>
        <h1 class="text-fs-ds-20 font-inter font-fw-ds-500 text-neutral-50">Payment Information</h1>
        <p class="text-fs-ds-14 font-fw-ds-300 font-inter text-neutral-100">
          View and keep your billing details up to date to avoid service interruptions.
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
          >Terms of Services</a
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

    {#if error}
      <div class="bg-opacity-20 mb-6 rounded-lg bg-red-900 p-4 text-red-400">
        <p>Error loading payment information: {error}</p>
        <Button
          variant="text-danger"
          size="small"
          class="mt-2"
          on:click={() => {
            refetchCustomer();
            refetchPaymentMethods();
          }}
        >
          Retry
        </Button>
      </div>
    {:else}
      <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
        <!-- Payment Method Section -->
        <div class="payment-method bg-surface-600 rounded-md p-6">
          <h2 class="text-fs-ds-20 font-inter font-fw-ds-500 mb-4 text-neutral-50">
            Payment Method
          </h2>

          {#if !hasPaymentMethod}
            <div
              class="bg-surface-400 hover:bg-surface-500 flex cursor-pointer flex-col items-center justify-center gap-4 rounded-md border border-dashed border-neutral-300 p-8"
              on:click={openAddCardModal}
            >
              <PlusIconV2 />
              <span class="text-fs-ds-14 font-inter font-fw-ds-300 text-neutral-400"
                >Add a new card</span
              >
            </div>
          {:else if selectedPaymentMethod}
            <!-- Display selected payment method -->
            <div class="card-info">
              {#if selectedPaymentMethod.card}
                <div class="flex flex-col gap-3">
                  <div class="text-fs-ds-28 font-fw-ds-600 uppercase">
                    {selectedPaymentMethod.card.brand}
                  </div>
                  <div class="flex flex-col gap-4">
                    <div class="text-fs-ds-28 font-inter font-fw-ds-500 text-neutral-100">
                      •••• •••• ••••
                      <span class="text-fs-ds-28 font-inter font-fw-ds-500 text-neutral-50">
                        {selectedPaymentMethod.card.last4}
                      </span>
                    </div>
                    <div class="text-fs-ds-14 font-inter font-fw-ds-400 text-neutral-200">
                      Expiry Date:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{selectedPaymentMethod.card
                        .exp_month}/{selectedPaymentMethod.card.exp_year}
                    </div>
                    <div class="text-fs-ds-16 font-inter font-fw-ds-400 text-neutral-200 uppercase">
                      {selectedPaymentMethod.billing_details?.name}
                    </div>
                  </div>
                </div>
              {/if}
            </div>
          {/if}
        </div>

        <!-- Billing Address Section -->
        <div class="bg-surface-600 flex flex-col justify-between rounded-md p-6">
          <div class="flex items-start justify-between">
            <h2 class="text-fs-ds-20 font-inter font-fw-ds-500 mb-4 text-neutral-50">
              Billing Address
            </h2>
            {#if hasSelectedPaymentMethodBillingDetails}
              <button
                class="cursor-pointer"
                on:click={() => openBillingAddressModal(selectedPaymentMethod.id)}
              >
                <EditIcon />
              </button>
            {/if}
          </div>

          {#if !hasSelectedPaymentMethodBillingDetails}
            <div>
              <p class="text-fs-ds-14 font-inter font-fw-ds-400 mb-4 text-neutral-400">
                No billing address added yet for this payment method. Please add a billing address
                to complete your payment information.
              </p>
            </div>
            <div>
              <Button
                on:click={() =>
                  selectedPaymentMethod && openBillingAddressModal(selectedPaymentMethod.id)}
                variant="filled-primary"
                size="medium"
                disabled={!selectedPaymentMethod}
              >
                Add Billing Address</Button
              >
            </div>

            {#if !selectedPaymentMethod}
              <p class="mt-2 text-xs text-gray-400">
                You need to add payment method first, before entering billing details.
              </p>
            {/if}
          {:else if selectedPaymentMethod?.billing_details?.address}
            <!-- Display selected billing address -->
            <div class="address-info space-y-2">
              <div class="flex space-x-2">
                <div class="text-fs-ds-14 font-fw-ds-400 font-inter w-32 text-neutral-200">
                  Name:
                </div>
                <div class=" text-fs-ds-14 font-fw-ds-400 font-inter text-neutral-200">
                  {selectedPaymentMethod.billing_details.name || 'N/A'}
                </div>
              </div>

              <div class="flex space-x-2">
                <div class="font-fw-ds-400 text-fs-ds-14 font-inter w-32 text-neutral-200">
                  Billing Email:
                </div>
                <div class="font-fw-ds-400 text-fs-ds-14 font-inter text-neutral-200">
                  {selectedPaymentMethod.billing_details.email || 'N/A'}
                </div>
              </div>

              <div class="flex space-x-2">
                <div class="font-fw-ds-400 text-fs-ds-14 font-inter w-32 text-neutral-200">
                  Street Address:
                </div>
                <div class="font-fw-ds-400 text-fs-ds-14 font-inter text-neutral-200">
                  {selectedPaymentMethod.billing_details.address.line1 || 'N/A'}
                  {#if selectedPaymentMethod.billing_details.address.line2}
                    , {selectedPaymentMethod.billing_details.address.line2}
                  {/if}
                </div>
              </div>

              <div class="flex space-x-2">
                <div class="font-fw-ds-400 text-fs-ds-14 font-inter w-32 text-neutral-200">
                  City:
                </div>
                <div class="font-fw-ds-400 text-fs-ds-14 font-inter text-neutral-200">
                  {selectedPaymentMethod.billing_details.address.city || 'N/A'}
                </div>
              </div>

              <div class="flex space-x-2">
                <div class="font-fw-ds-400 text-fs-ds-14 font-inter w-32 text-neutral-200">
                  State:
                </div>
                <div class="font-fw-ds-400 text-fs-ds-14 font-inter text-neutral-200">
                  {selectedPaymentMethod.billing_details.address.state || 'N/A'}
                </div>
              </div>

              <div class="flex space-x-2">
                <div class="font-fw-ds-400 text-fs-ds-14 font-inter w-32 text-neutral-200">
                  ZIP:
                </div>
                <div class="font-fw-ds-400 text-fs-ds-14 font-inter text-neutral-200">
                  {selectedPaymentMethod.billing_details.address.postal_code || 'N/A'}
                </div>
              </div>

              <div class="flex space-x-2">
                <div class="font-fw-ds-400 text-fs-ds-14 font-inter w-32 text-neutral-200">
                  Country:
                </div>
                <div class="font-fw-ds-400 text-fs-ds-14 font-inter text-neutral-200">
                  {selectedPaymentMethod.billing_details.address.country || 'N/A'}
                </div>
              </div>
            </div>
          {/if}
        </div>
      </div>

      <!-- Payment Methods List Table -->
      {#if hasPaymentMethod && paymentMethods.length > 0}
        <div class="mt-6">
          <PaymentMethodsList
            {paymentMethods}
            on:addCard={openAddCardModal}
            on:cardSelected={handleCardSelected}
            on:requestRefresh={handleAllCardsDeleted}
          />
        </div>
      {/if}
    {/if}

    <!-- Modals -->
    {#if showAddCardModal}
      <Modal on:close={closeModals}>
        <AddPaymentMethod
          {customerId}
          {hubId}
          on:close={closeModals}
          on:paymentMethodAdded={handlePaymentMethodAdded}
        />
      </Modal>
    {/if}

    {#if showBillingAddressModal}
      <Modal on:close={closeModals}>
        <UpdateBillingDetails
          paymentMethodId={selectedPaymentMethodId}
          on:close={closeModals}
          on:billingDetailsUpdated={handleBillingDetailsUpdated}
        />
      </Modal>
    {/if}
  </section>
{/if}
