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
  import { captureEvent } from '@/utils/posthogConfig';

  // Import modal components
  import Modal from '@/components/Modal/Modal.svelte';
  import PaymentProcessingModal from '@/components/PaymentProcessingModal/PaymentProcessingModal.svelte';
  import {
    PlanUpdateSuccess,
    PlanUpdateFailed,
    PlanScheduleSuccess,
  } from '@/components/PlanUpdateStatus';
  import PlusIconV2 from '@/assets/icons/PlusIconV2.svelte';
  import Alert from '@/components/Alert/Alert.svelte';
  import PlusIcon from '@/assets/icons/PlusIcon.svelte';
  import MinusIcon from '@/assets/icons/MinusIcon.svelte';

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
  let minUserCount: number = 1;

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
    userCount = parseInt(
      searchParams.get('minUserCount') || searchParams.get('userCount') || '1',
      10,
    );
    minUserCount = parseInt(searchParams.get('userCount') || '1', 10);
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
  let totalAmount: string = '';
  let isProcessing: boolean = false;

  // UI state for popups
  let showProcessingModal = false;
  let showSubscriptionConfirmModal = false;
  let showSubscriptionFailedModal = false;
  let showSubscriptionScheduleConfirmModal = false;
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
    socket = initializeStripeSocket(API_BASE_URL, hubId, {
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

          invoiceUrl = team?.billing?.failed_invoice_url || team?.billing?.invoice_url || ''; // failed_invoice_url is for backward compatibility
        }, 5000);

        // Show failed modal

        setTimeout(() => {
          showSubscriptionFailedModal = true;
        }, 5000);
      },
      onSubscriptionUpdated: () => {},
      onSubscriptionCreated: () => {},
      onScheduleCreated: (data) => {
        console.log('Schedule updated:', data);
        const { team } = data;
        setTimeout(() => {
          isProcessing = false;
          showProcessingModal = false;

          // Set data for scheduled downgrade modal
          selectedPlanDetails = {
            fromPlan: currentPlan,
            toPlan: planName,
            hubName: team?.name || '',
            nextBilling: team?.billing?.current_period_end,
          };
        }, 5000);

        // Show scheduled downgrade modal
        setTimeout(() => {
          showSubscriptionScheduleConfirmModal = true;
        }, 5000);
      },
    });
  });

  // Fetch customer data
  const { data: customerData, refetch: refetchCustomer } = createQuery(() =>
    billingService.fetchCustomerId(hubId),
  );
  // fetch pricing details
  const { data: pricingData } = createQuery(() => billingService.getAllPricingDetails());

  // Set customerId when customerData changes
  $: if ($customerData !== undefined) {
    customerId = $customerData?.data?.customerId || null;
  }

  // Re-fetch when hubId changes
  $: if (hubId) {
    refetchCustomer();
  }

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

  // Reactive derived values
  $: paymentMethods = $paymentMethodsData?.paymentMethods || [];
  $: defaultCard = paymentMethods.find((pm) => pm.isDefault);
  $: if (defaultCard && !selectedPaymentMethodId) {
    selectedPaymentMethodId = defaultCard.id;
  }

  $: {
    let baseAmount = 0;

    // Ensure data exists
    if ($pricingData?.data?.plans?.length) {
      const selectedPlan = $pricingData.data.plans.find((p) => p.plan_name === planName);

      if (selectedPlan) {
        const billing = selectedPlan.billing.find((b) => b.interval === billingCycle);

        if (billing) {
          baseAmount = billing.price * userCount;
        }
      }
    }

    // Format for display (e.g. "$29.97")
    totalAmount = `$${baseAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  function handleRadioChange(event) {
    selectedPaymentMethodId = event.detail.value;
  }

  function goBack() {
    // Use browser's native history to go back to preserve exact previous state
    window.history.back();
  }

  function goToAddCard() {
    const url = new URL(window.location.href);
    const searchParams = new URLSearchParams(url.search);

    // Add or update minUserCount
    searchParams.set('minUserCount', String(userCount));
    // Construct updated URL
    const updatedUrl = url.pathname + '?' + searchParams.toString();

    sessionStorage.setItem('paymentMethodPageUrl', updatedUrl);
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
        trial_period_days: 0,
        trial_end_date: null,
      };

      let result;
      captureConfirmPaymentClick(planName, billingCycle);
      // Determine if we need to create or update a subscription
      if (subscriptionId && subscriptionStatus !== 'canceled') {
        // Update existing subscription
        result = await billingService.updateSubscription({
          subscriptionId,
          priceId,
          paymentMethodId: selectedPaymentMethodId,
          metadata,
          isDowngrade,
          seats: userCount || 1,
          paymentBehavior: 'default_incomplete', // Use default_incomplete to handle 3D Secure
        });
      } else if (customerId) {
        // Create new subscription
        result = await billingService.createSubscription({
          customerId,
          priceId,
          paymentMethodId: selectedPaymentMethodId,
          metadata,
          trialPeriodDays: 0,
          seats: userCount || 1,
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
      action: () => {
        // Get the referrer URL from sessionStorage if available
        const changePlanUrl = sessionStorage.getItem('changePlanPageUrl');

        if (changePlanUrl) {
          // If we have a stored change plan URL, navigate back to it
          navigate(changePlanUrl);
        } else {
          // Default fallback to browser history
          window.history.back();
        }
      },
    },
    {
      label: 'Payment Method',
      path: '',
    },
  ];

  const captureConfirmPaymentClick = (planType: string, planOption: string) => {
    const isMonthly = planOption === 'monthly';
    const eventProperties = {
      event_source: 'admin_panel',
      current_plan: `${planType}_${isMonthly ? 'monthly' : 'annual'}`,
    };
    captureEvent('admin_upgrade_intent', eventProperties);
  };
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

      {#if billingCycle === 'annual'}
        <!-- Number of seats selector -->
        <div class="mt-6 mr-28 mb-6 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="text-fs-ds-16 font-inter font-fw-ds-400 text-neutral-50"
              >Number of seats</span
            >
          </div>
          <div
            class="flex min-w-[120px] items-center justify-between rounded-md border border-neutral-700 px-2 py-1"
          >
            <button
              class="text-fs-ds-18 font-inter font-fw-ds-300 flex h-6 w-8 cursor-pointer items-center justify-center text-neutral-200 disabled:opacity-50"
              on:click={() => {
                if (userCount > minUserCount) userCount = userCount - 1;
              }}
              aria-label="Decrease seats"
              disabled={userCount <= minUserCount}
            >
              <MinusIcon />
            </button>
            <span class="text-fs-ds-12 font-inter font-fw-ds-300 w-8 text-center text-neutral-50"
              >{userCount}</span
            >
            <button
              class="text-fs-ds-18 font-inter font-fw-ds-300 flex h-6 w-8 cursor-pointer items-center justify-center text-neutral-200"
              on:click={() => {
                userCount = userCount + 1;
              }}
              aria-label="Increase seats"
            >
              <PlusIcon />
            </button>
          </div>
        </div>
      {/if}

      <!-- Downgrade Notice -->
      {#if isDowngrade}
        <div class="mb-6 shadow-lg">
          <Alert
            variant="info"
            showButton={false}
            subtitle={`Your plan will be downgraded at the end of your current billing cycle. You’ll continue to enjoy all ${currentPlan} features until then. Once the downgrade is scheduled, you won’t be able to upgrade, downgrade, cancel your plan or invite new members to your hub during this period until the change takes effect.`}
          />
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
              /{billingCycle === 'monthly' ? 'month' : 'year'}</span
            >
          </p>
        </div>
      </div>
    </div>

    <!-- Payment method selection -->
    <div class=" mb-6 rounded-lg px-4 pt-0">
      {#if $isLoadingPaymentMethods}
        <div class="flex justify-center py-8">
          <CircularLoader />
        </div>
      {:else if paymentMethods.length === 0}
        <div
          class="bg-surface-400 hover:bg-surface-500 mr-24 flex cursor-pointer flex-col items-center justify-center gap-4 rounded-md border border-dashed border-neutral-300 p-8"
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
      {#if isDowngrade}
        <div class="text-fs-ds-14 font-inter font-fw-ds-300 text-neutral-400">
          Note: Payment will be deducted at the start of your next billing cycle.
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
              isProcessing}
            on:click={handlePaymentConfirm}
          >
            {#if isProcessing}
              Processing...
            {:else if isDowngrade}
              Confirm
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
      <PaymentProcessingModal
        title="Processing Your Payment"
        description="Please don't close this window, We're processing your payment. Your hub will be ready as
        soon as the payment is confirmed."
        on:close={() => (showProcessingModal = false)}
      />
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

  <!-- Subscription Confirmation Modal -->
  {#if showSubscriptionScheduleConfirmModal}
    <Modal
      width="max-w-xl"
      on:close={() => {
        showSubscriptionScheduleConfirmModal = false;
        navigate(`/billing/billingOverview/${hubId}`);
      }}
    >
      <PlanScheduleSuccess
        hubName={selectedPlanDetails.hubName}
        currentPlan={selectedPlanDetails.fromPlan}
        nextBillingDate={selectedPlanDetails.nextBilling}
        fromPlan={selectedPlanDetails.fromPlan}
        toPlan={selectedPlanDetails?.toPlan}
        {hubId}
        on:close={() => {
          showSubscriptionScheduleConfirmModal = false;
          navigate(`/billing/billingOverview/${hubId}`);
        }}
      />
    </Modal>
  {/if}
</div>
