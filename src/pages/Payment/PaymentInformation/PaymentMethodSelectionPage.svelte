<script lang="ts">
  // Svelte
  import { onMount } from 'svelte';
  import { navigate, useLocation } from 'svelte-routing';

  // Components
  import CircularLoader from '@/ui/CircularLoader/CircularLoader.svelte';
  import Button from '@/ui/Button/Button.svelte';
  import Tag from '@/ui/Tag/Tag.svelte';
  import Radio from '@/ui/Radio/Radio.svelte';
  import Breadcrumbs from '@/components/Breadcrumbs/Breadcrumbs.svelte';

  // Services
  import { billingService } from '@/services/billing.service';
  import { hubsService } from '@/services/hubs.service';
  import { createQuery } from '@/services/api.common';

  // Utils & Helpers
  import { handleStripePaymentConfirmation, initializeStripe } from '@/utils/stripeUtils';
  import { initializeStripeSocket } from '@/utils/socket.io.utils';
  import { API_BASE_URL } from '@/constants/environment';

  // Import modal components
  import Modal from '@/components/Modal/Modal.svelte';
  import PaymentProcessingModal from '@/components/PaymentProcessingModal/PaymentProcessingModal.svelte';
  import { PlanUpdateSuccess, PlanUpdateFailed } from '@/components/PlanUpdateStatus';
  import PlusIconV2 from '@/assets/icons/PlusIconV2.svelte';

  const location = useLocation();

  // Extract parameters from URL
  let hubId: string = '';
  let planName: string = '';
  let priceId: string = '';
  let billingCycle: string = 'monthly';
  let userCount: number = 1;
  let subscriptionId: string = '';
  let subscriptionStatus: string = '';
  let customerId: string = '';
  let currentPlan: string = 'Community';
  let isDowngrade: boolean = false;

  // URL parsing
  $: {
    const url = $location?.pathname || '';
    // Extract hubId
    const hubMatches = url.match(/\/([a-f0-9]{24})/i);
    if (hubMatches && hubMatches[1]) {
      hubId = hubMatches[1];
    }

    // Extract query parameters from URL search params
    const searchParams = new URLSearchParams($location?.search || '');
    planName = searchParams.get('plan') || '';
    priceId = searchParams.get('priceId') || '';
    billingCycle = searchParams.get('billingCycle') || 'monthly';
    userCount = parseInt(searchParams.get('userCount') || '1', 10);
    subscriptionId = searchParams.get('subscriptionId') || '';
    currentPlan = searchParams.get('currentPlan') || 'Community';
    subscriptionStatus = searchParams.get('status') || '';
    isDowngrade = searchParams.get('isDowngrade') === 'true';
  }

  // Initialize Stripe
  let stripe;
  let socket;

  // State variables
  let selectedPaymentMethodId: string = '';
  let error: any = '';
  let showProratedInfo: boolean = false;
  let proratedAmount: string = '';
  let proratedDate: string = '';
  let totalAmount: string = '';
  let isProcessing: boolean = false;

  // UI state for popups
  let showProcessingModal = false;
  let showSubscriptionConfirmModal = false;
  let showSubscriptionFailedModal = false;
  let invoiceUrl = '';
  let selectedPlanDetails = {
    fromPlan: currentPlan,
    toPlan: planName,
    hubName: '',
    nextBilling: '',
  };

  onMount(async () => {
    // Initialize Stripe
    stripe = await initializeStripe();

    // Set up socket connection for payment events
    socket = initializeStripeSocket(API_BASE_URL, {
      onPaymentSuccess: (data) => {
        console.log('Payment success:', data);
        const { team } = data;
        setTimeout(() => {
          isProcessing = false;
          showProcessingModal = false;

          // Set data for success modal
          selectedPlanDetails = {
            fromPlan: currentPlan,
            toPlan: planName,
            hubName: team?.name || '',
            nextBilling: team?.billing?.current_period_end,
          };
        }, 5000);

        // Show success modal
        setTimeout(() => {
          showSubscriptionConfirmModal = true;
        }, 5000);
      },
      onPaymentFailed: (data) => {
        console.log('Payment failed:', data);
        const { team } = data;
        setTimeout(() => {
          isProcessing = false;
          showProcessingModal = false;

          // Set data for failure modal
          selectedPlanDetails = {
            fromPlan: currentPlan,
            toPlan: planName,
            hubName: team?.name || '',
            nextBilling: team?.billing?.current_period_end,
          };

          invoiceUrl = team?.billing?.failed_invoice_url || '';
        }, 5000);

        // Show failed modal

        setTimeout(() => {
          showSubscriptionFailedModal = true;
        }, 5000);
      },
      onSubscriptionUpdated: () => {},
      onSubscriptionCreated: () => {},
    });
  });

  // Fetch customer data
  const { data: customerData, refetch: refetchCustomer } = createQuery(() =>
    billingService.fetchCustomerId(hubId),
  );

  // Set customerId when customerData changes
  $: if ($customerData !== undefined) {
    customerId = $customerData?.data?.customerId || null;
  }

  // Re-fetch when hubId changes
  $: if (hubId) {
    refetchCustomer();
  }

  // Fetch hub details for breadcrumbs
  const { data: hubDetails } = createQuery(() => hubsService.getHubDetails(hubId));

  // Re-fetch when customerId changes
  $: if (customerId) {
    refetchPaymentMethods();
  }

  // Fetch payment methods
  const {
    data: paymentMethodsData,
    isFetching: isLoadingPaymentMethods,
    refetch: refetchPaymentMethods,
  } = createQuery(async () => {
    if (!customerId) return { paymentMethods: [] };
    return billingService.getPaymentMethods(customerId);
  });

  // Fetch proration details if updating subscription
  const { data: prorationData, isFetching: isLoadingProration } = createQuery(async () => {
    if (!customerId || !priceId) return null;

    try {
      const response = await billingService.simulatePayment(customerId, priceId);

      if (response?.lines?.data) {
        const invoiceLine = response.lines.data[0];

        // Extract prorated amount and next billing date
        const proratedAmountValue = invoiceLine.amount / 100; // Convert cents to dollars
        const nextBillingDate = new Date(response.period_end * 1000); // Convert to milliseconds

        const formattedDate = nextBillingDate.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });

        showProratedInfo = true;

        return {
          proratedAmount: `$${proratedAmountValue.toFixed(2)}`,
          proratedDate: formattedDate,
        };
      }
      return null;
    } catch (err) {
      console.error('Error fetching proration details:', err);
      return null;
    }
  });

  // Reactive derived values
  $: paymentMethods = $paymentMethodsData?.paymentMethods || [];
  $: defaultCard = paymentMethods.find((pm) => pm.isDefault);
  $: if (defaultCard && !selectedPaymentMethodId) {
    selectedPaymentMethodId = defaultCard.id;
  }

  // Set total amount based on plan details and/or proration
  $: {
    // Set a default based on plan & cycle
    let baseAmount = billingCycle === 'monthly' ? '$9.99' : '$99.99';

    // Try to determine amount from proration data
    if ($prorationData && $prorationData.proratedAmount) {
      proratedAmount = $prorationData.proratedAmount;
      proratedDate = $prorationData.proratedDate;
      totalAmount = proratedAmount;
    } else {
      // Use standard pricing if no proration
      if (planName === 'Standard') {
        baseAmount = billingCycle === 'monthly' ? '$9.99' : '$99.99';
      } else if (planName === 'Professional') {
        baseAmount = billingCycle === 'monthly' ? '$19.99' : '$199.99';
      }
      totalAmount = baseAmount;
    }
  }

  // Update proration details when available
  $: if ($prorationData) {
    proratedAmount = $prorationData.proratedAmount;
    proratedDate = $prorationData.proratedDate;
  }

  function handleRadioChange(event) {
    selectedPaymentMethodId = event.detail.value;
  }

  function goBack() {
    // Use browser's native history to go back to preserve exact previous state
    window.history.back();
  }

  function goToAddCard() {
    // Save the current URL in sessionStorage so we can navigate back here after adding a card
    const currentUrl = window.location.pathname + window.location.search;
    sessionStorage.setItem('paymentMethodPageUrl', currentUrl);

    // Navigate to add payment details page
    navigate(`/billing/billingInformation/addPaymentDetails/${hubId}`);
  }

  async function handlePaymentConfirm() {
    if (!selectedPaymentMethodId || !priceId || !customerId || isProcessing) {
      return;
    }

    try {
      isProcessing = true;
      error = null;
      showProcessingModal = true;

      // Prepare common metadata
      const metadata = {
        hubId,
        userCount: userCount.toString(),
        planName,
      };

      let result;

      // Determine if we need to create or update a subscription
      if (subscriptionId && subscriptionStatus !== 'canceled') {
        console.log('Updating existing subscription:', subscriptionId);
        // Update existing subscription
        result = await billingService.updateSubscription({
          subscriptionId,
          priceId,
          paymentMethodId: selectedPaymentMethodId,
          metadata,
          isDowngrade,
        });
      } else if (customerId) {
        console.log('Creating new subscription for customer:', customerId);
        // Create new subscription
        result = await billingService.createSubscription({
          customerId,
          priceId,
          paymentMethodId: selectedPaymentMethodId,
          metadata,
        });
      } else {
        throw new Error('No customer ID available to create subscription');
      }

      // Check if additional authentication is required (like 3D Secure)
      if (result.requiresAction && result.clientSecret) {
        await handleStripePaymentConfirmation(stripe, result.clientSecret);
      }

      // At this point, we just wait for socket events
      // The modals will be shown/hidden by the socket event handlers
    } catch (err) {
      console.error('Error processing subscription:', err);
      isProcessing = false;
      showProcessingModal = false;

      // Show the failed modal with the error
      selectedPlanDetails = {
        fromPlan: currentPlan,
        toPlan: planName,
        hubName: $hubDetails?.data?.name || '',
        nextBilling: '',
      };
      showSubscriptionFailedModal = true;
    }
  }

  // Prepare breadcrumb navigation with function-based navigation
  $: breadcrumbItems = [
    {
      label: 'Billing',
      path: `/billing/billingOverview/${hubId}`,
    },
    {
      label: 'Change Plan',
      path: '',
      action: () => window.history.back(),
    },
    {
      label: 'Payment Method',
      path: '',
    },
  ];
</script>

<div class="max-w-[724px]">
  <Breadcrumbs items={breadcrumbItems} />
  <div class="mt-6">
    <div>
      <h1 class="text-fs-ds-20 font-inter font-fw-ds-500 text-neutral-50">Payment Method</h1>
      <p class="text-fs-ds-14 font-fw-ds-300 font-inter mb-3 text-neutral-100">
        Choose a saved card or add a new one to continue with your {isDowngrade
          ? 'downgrade'
          : 'upgrade'}.
      </p>

      <!-- Downgrade Notice -->
      {#if isDowngrade}
        <div class="mb-4 rounded-lg border border-blue-700 bg-blue-900/20 p-3">
          <p class="text-fs-ds-12 font-inter font-fw-ds-400 text-blue-300">
            <strong>Downgrade Scheduled:</strong> Your plan will be downgraded at the end of the current
            billing cycle. You’ll retain full access to your current features until then. Once downgraded,
            further plan changes and cancellation will be disabled until the next cycle.
          </p>
        </div>
      {/if}
    </div>

    <!-- Summary -->
    <div class=" p-4">
      <div class="grid grid-cols-3 gap-4 py-1">
        <div class="col-span-1">
          <p class="text-fs-ds-12 font-inter font-fw-ds-300 text-neutral-400">Plan Selected</p>
          <p class="text-fs-ds-16 font-inter font-fw-ds-400 mt-1 text-neutral-50">{planName}</p>
        </div>
        <div class="col-span-1">
          <p class="text-fs-ds-12 font-inter font-fw-ds-300 text-neutral-400">Total users</p>
          <p class="text-fs-ds-16 font-inter font-fw-ds-400 mt-1 text-neutral-50">{userCount}</p>
        </div>
        <div class="col-span-1">
          <p class="text-fs-ds-12 font-inter font-fw-ds-300 text-neutral-400">Total Amount</p>
          <p class="text-fs-ds-16 font-inter font-fw-ds-400 mt-1 text-neutral-50">
            {totalAmount}<span class="text-fs-ds-12 text-neutral-400">
              /{billingCycle === 'monthly' ? 'user/month' : 'user/year'}</span
            >
          </p>
        </div>
      </div>
    </div>

    <!-- Payment method selection -->
    <div class=" mb-6 rounded-lg px-4 pt-0">
      {#if $isLoadingPaymentMethods || $isLoadingProration}
        <div class="flex justify-center py-8">
          <CircularLoader />
        </div>
      {:else if paymentMethods.length === 0}
        <div
          class="bg-surface-400 hover:bg-surface-500 flex cursor-pointer flex-col items-center justify-center gap-4 rounded-md border border-dashed border-neutral-300 p-8 mr-24"
          on:click={goToAddCard}
        >
          <PlusIconV2 />
          <div class="flex flex-col items-center gap-1">
            <span class="text-fs-ds-14 font-inter font-fw-ds-300 text-neutral-400"
              >No payment methods added yet.
            </span>
            <span class="text-fs-ds-14 font-inter font-fw-ds-300 text-neutral-400">
              Add a card to continue.
            </span>
          </div>
        </div>
      {:else}
        <div class="mb-6 flex flex-col">
          {#each paymentMethods as method, i}
            <div
              class="flex cursor-pointer items-center border-b border-neutral-600 py-4 {i === 0
                ? ''
                : 'mt-2'}"
            >
              <Radio
                name="payment-method"
                value={method.id}
                checked={selectedPaymentMethodId === method.id}
                on:change={handleRadioChange}
              >
                <div class="flex flex-1 items-start justify-between">
                  <div>
                    <div class="flex items-center gap-2">
                      <div class="text-fs-ds-14 font-inter font-fw-ds-500 text-neutral-50">
                        {method.card.brand.toUpperCase()}
                      </div>
                      {#if method === defaultCard}
                        <div>
                          <Tag
                            text="Default Card"
                            bgColor="bg-green-900"
                            textColor="text-green-300"
                            borderColor="border-green-700"
                            size="xs"
                          />
                        </div>
                      {/if}
                    </div>
                    <div class="text-fs-ds-12 font-inter font-fw-ds-400 mt-1 text-neutral-300">
                      **** **** **** {method.card.last4}
                    </div>
                  </div>
                </div>
              </Radio>
            </div>
          {/each}
        </div>
      {/if}
    </div>

    {#if paymentMethods.length !== 0}
      <div class="mt-6 flex items-center justify-between px-4">
        <button
          class="text-fs-ds-14 font-inter font-fw-ds-400 cursor-pointer text-neutral-200 underline"
          on:click={goToAddCard}
        >
          Add Card
        </button>
        <!-- Action buttons -->
        <div class=" flex justify-end gap-3">
          <Button variant="filled-secondary" on:click={goBack}>Cancel</Button>
          <Button
            variant="filled-primary"
            disabled={!selectedPaymentMethodId ||
              paymentMethods.length === 0 ||
              $isLoadingPaymentMethods ||
              $isLoadingProration ||
              isProcessing}
            on:click={handlePaymentConfirm}
          >
            {#if isProcessing}
              Processing...
            {:else}
              Confirm & Pay
            {/if}
          </Button>
        </div>
      </div>
    {/if}
  </div>

  <!-- Processing Payment Modal -->
  {#if showProcessingModal}
    <Modal width="max-w-xl" on:close={() => (showProcessingModal = false)}>
      <PaymentProcessingModal on:close={() => (showProcessingModal = false)} />
    </Modal>
  {/if}

  <!-- Subscription Failed Modal -->
  {#if showSubscriptionFailedModal}
    <Modal
      width="max-w-xl"
      on:close={() => {
        showSubscriptionFailedModal = false;
        navigate(`/billing/billingOverview/${hubId}`);
      }}
    >
      <PlanUpdateFailed
        hubName={selectedPlanDetails.hubName}
        {currentPlan}
        nextBillingDate={selectedPlanDetails.nextBilling}
        fromPlan={selectedPlanDetails.fromPlan}
        toPlan={selectedPlanDetails.toPlan}
        on:close={() => {
          showSubscriptionFailedModal = false;
          navigate(`/billing/billingOverview/${hubId}`);
        }}
        on:fixPayment={() => {
          window.open(invoiceUrl, '_blank');
        }}
      />
    </Modal>
  {/if}

  <!-- Subscription Confirmation Modal -->
  {#if showSubscriptionConfirmModal}
    <Modal
      width="max-w-xl"
      on:close={() => {
        showSubscriptionConfirmModal = false;
        navigate(`/billing/billingOverview/${hubId}`);
      }}
    >
      <PlanUpdateSuccess
        hubName={selectedPlanDetails.hubName}
        currentPlan={selectedPlanDetails?.toPlan}
        nextBillingDate={selectedPlanDetails.nextBilling}
        fromPlan={selectedPlanDetails.fromPlan}
        toPlan={selectedPlanDetails?.toPlan}
        on:close={() => {
          showSubscriptionConfirmModal = false;
          navigate(`/billing/billingOverview/${hubId}`);
        }}
        on:goToDashboard={() => {
          showSubscriptionConfirmModal = false;
          navigate(`/billing/billingOverview/${hubId}`);
        }}
      />
    </Modal>
  {/if}
</div>
