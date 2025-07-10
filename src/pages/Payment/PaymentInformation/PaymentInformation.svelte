<script>
  // Svelte
  import { useLocation } from 'svelte-routing';
  import { tweened } from 'svelte/motion';
  import { cubicOut } from 'svelte/easing';
  import { onMount } from 'svelte';

  // Services
  import { createQuery } from '@/services/api.common';
  import { billingService } from '@/services/billing.service';

  // UI Components
  import Button from '@/ui/Button/Button.svelte';
  import CircularLoader from '@/ui/CircularLoader/CircularLoader.svelte';
  import Tag from '@/ui/Tag/Tag.svelte';

  // App Components
  import Modal from '@/components/Modal/Modal.svelte';
  import UnifiedPaymentMethodForm from './PaymentModules/UnifiedPaymentMethodForm.svelte';
  import PaymentMethodsList from './PaymentModules/PaymentMethodsList.svelte';

  // Icons
  import PlusIconV2 from '@/assets/icons/PlusIconV2.svelte';
  import Alert from '@/components/Alert/Alert.svelte';

  const location = useLocation();

  // Customer state
  let customerId = null;
  let hasPaymentMethod = false;
  let hasBillingAddress = false;
  let paymentMethods = [];
  let billingAddress = null;

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
  let showPaymentFormModal = false;
  let selectedPaymentMethodId = null;
  let isSelectedPaymentMethodDefault = false;

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

  function openPaymentFormModal(paymentMethodId = null) {
    selectedPaymentMethodId = paymentMethodId;

    // Set the isDefault flag if editing an existing payment method
    if (paymentMethodId) {
      const selectedMethod = paymentMethods.find((pm) => pm.id === paymentMethodId);
      isSelectedPaymentMethodDefault = selectedMethod?.isDefault || false;
    } else {
      isSelectedPaymentMethodDefault = false;
    }

    showPaymentFormModal = true;
  }

  // property to check if this is the first card
  $: isFirstCard = !selectedPaymentMethodId && paymentMethods?.length === 0;

  function closeModal() {
    showPaymentFormModal = false;
    selectedPaymentMethodId = null;
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

  // When a payment method is added or updated
  function handlePaymentMethodUpdated(event) {
    // Get the customer ID from the event if it's a new customer
    if (event.detail && event.detail.customerId) {
      customerId = event.detail.customerId;
      // After setting a new customer ID, we should refetch it to ensure it's saved
      refetchCustomer();
    }

    // Ensure we always refetch payment methods to show up-to-date data
    // Use a small timeout to ensure the server has time to process any changes
    // especially for default payment method updates
    setTimeout(() => {
      refetchPaymentMethods();
      closeModal();
    }, 500);
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

  // Animation stores
  const pageOpacity = tweened(0, {
    duration: 600,
    easing: cubicOut,
  });

  const cardOpacity = tweened(0, {
    duration: 500,
    easing: cubicOut,
  });

  const cardScale = tweened(0.95, {
    duration: 500,
    easing: cubicOut,
  });

  // Trigger animations when data is loaded
  $: if ($customerData?.httpStatusCode && !$isLoadingPaymentMethods && !$isLoadingCustomer) {
    setTimeout(() => {
      pageOpacity.set(1);
    }, 100);

    setTimeout(() => {
      cardOpacity.set(1);
      cardScale.set(1);
    }, 300);
  }
</script>

{#if !$customerData?.httpStatusCode || $isLoadingPaymentMethods || $isLoadingCustomer}
  <div class="flex h-[calc(100vh-4rem)] w-full items-center justify-center">
    <CircularLoader />
  </div>
{:else}
  <section class="payment-information text-white" style="opacity: {$pageOpacity}; ">
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

    {#if customerId && paymentMethods.length === 0}
      <div class="mt-2 mb-8">
        <Alert
          variant="error"
          title="No Payment Method Found"
          subtitle="You don’t have a saved payment method. Please add a card to continue with any purchases or upgrades."
          showButton={true}
          buttonText="Add Card"
          on:buttonClick={() => openPaymentFormModal()}
        />
      </div>
    {/if}

    <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
      <!-- Payment Method Section -->
      <div
        class="payment-method bg-surface-600 rounded-md p-6"
        style="opacity: {$cardOpacity}; transform: scale({$cardScale});"
      >
        <div class="mb-4 flex items-center gap-2">
          <h2 class="text-fs-ds-20 font-inter font-fw-ds-500 text-neutral-50">Payment Method</h2>
          {#if selectedPaymentMethod?.isDefault}
            <Tag
              text="Default Card"
              bgColor="bg-green-900"
              textColor="text-green-300"
              borderColor="border-green-700"
              size="xs"
            />
          {/if}
        </div>

        {#if !hasPaymentMethod}
          <div
            class="bg-surface-400 hover:bg-surface-500 flex cursor-pointer flex-col items-center justify-center gap-4 rounded-md border border-dashed border-neutral-300 p-8"
            on:click={() => openPaymentFormModal()}
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
                    {[
                      selectedPaymentMethod.billing_details.address.line1,
                      selectedPaymentMethod.billing_details.address.city,
                      selectedPaymentMethod.billing_details.address.state,
                      selectedPaymentMethod.billing_details.address.country,
                    ]
                      .filter(Boolean)
                      .join(', ')}
                  </div>
                  {#if selectedPaymentMethod.billing_details?.name}
                    <div class="text-fs-ds-16 font-inter font-fw-ds-400 text-neutral-200 uppercase">
                      {selectedPaymentMethod.billing_details.name}
                    </div>
                  {/if}
                </div>
              </div>
            {/if}
          </div>
        {/if}
      </div>
    </div>

    <!-- Payment Methods List Table -->
    {#if hasPaymentMethod && paymentMethods.length > 0}
      <div class="mt-6">
        <PaymentMethodsList
          {paymentMethods}
          on:addCard={() => openPaymentFormModal()}
          on:cardSelected={handleCardSelected}
          on:requestRefresh={handleAllCardsDeleted}
          on:editBilling={(e) => openPaymentFormModal(e.detail.paymentMethodId)}
        />
      </div>
    {/if}

    <!-- Unified Payment Form Modal -->
    {#if showPaymentFormModal}
      <Modal on:close={closeModal}>
        <UnifiedPaymentMethodForm
          {customerId}
          {hubId}
          {isFirstCard}
          paymentMethodId={selectedPaymentMethodId}
          isDefault={isSelectedPaymentMethodDefault}
          on:close={closeModal}
          on:paymentMethodAdded={handlePaymentMethodUpdated}
          on:billingDetailsUpdated={handlePaymentMethodUpdated}
        />
      </Modal>
    {/if}
  </section>
{/if}
