<script>
  import { onMount, onDestroy } from 'svelte';
  import { io } from 'socket.io-client';
  import CrownIcon from '@/assets/icons/CrownIcon.svelte';
  import Button from '@/ui/Button/Button.svelte';
  import Modal from '@/components/Modal/Modal.svelte';
  import ChangePlansModal from '@/components/ChangePlansModal/ChangePlansModal.svelte';
  import PaymentMethodSelection from '@/components/PaymentMethodSelection/PaymentMethodSelection.svelte';
  import AddPaymentMethod from '@/pages/Payment/PaymentInformation/PaymentModules/AddPaymentMethod.svelte';
  import { useLocation } from 'svelte-routing';
  import { createQuery } from '@/services/api.common';
  import { billingService } from '@/services/billing.service';
  import { navigate } from 'svelte-routing';
  import { PlanUpdateSuccess } from '@/components/PlanUpdateStatus';
  import { processSubscriptionData, capitalizeFirstLetter } from '@/utils/pricing';
  import { notification } from '@/components/Toast';
  import PaymentProcessingModal from '@/components/PaymentProcessingModal/PaymentProcessingModal.svelte';
  import { API_BASE_URL } from '@/constants/environment';
  import { hubsService } from '@/services/hubs.service';
  import Tag from '@/ui/Tag/Tag.svelte';
  import RedirectIcon from '@/assets/icons/RedirectIcon.svelte';
  import Alert from '@/components/Alert/Alert.svelte';

  const planColors = {
    Community: {
      bg: 'bg-neutral-700',
      text: 'text-neutral-300',
      border: 'border-neutral-500',
    },
    Standard: {
      bg: 'bg-purple-900',
      text: 'text-purple-200',
      border: 'border-purple-700',
    },
    Professional: {
      bg: 'bg-cyan-900',
      text: 'text-cyan-300',
      border: 'border-cyan-700',
    },
  };

  const location = useLocation();

  // Add Stripe instance
  let stripe;

  // Initialize Stripe on mount
  onMount(async () => {
    await initializeStripe();
    initializeSocket();
  });

  // Cleanup socket connection on component destroy
  onDestroy(() => {
    if (socket) {
      socket.disconnect();
    }
  });

  // Initialize Stripe with the publishable key from our API
  async function initializeStripe() {
    try {
      // Load Stripe.js if not already loaded
      if (!window.Stripe) {
        const script = document.createElement('script');
        script.src = 'https://js.stripe.com/v3/';
        script.async = true;
        document.body.appendChild(script);

        // Wait for script to load
        await new Promise((resolve) => {
          script.onload = resolve;
        });
      }

      // Fetch the publishable key from our backend using the service
      const { publishableKey } = await billingService.getStripeConfig();

      // Initialize Stripe
      stripe = window.Stripe(publishableKey);
    } catch (err) {
      console.error('Error initializing Stripe:', err);
    }
  }

  let socket;

  function initializeSocket() {
    // Connect to the stripe-events namespace
    socket = io(`${API_BASE_URL}`, {
      path: '/socket.io',
      namespace: 'stripe-events',
      transports: ['polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 20000,
    });

    // Connection events
    socket.on('connect', () => {
      console.log('Connected to stripe-events socket:', socket.id);
    });

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    socket.on('disconnect', (reason) => {
      console.log('Disconnected from stripe-events socket:', reason);
    });

    // Payment events
    socket.on('payment_success', (data) => {
      console.log('Payment success:', data);
      const { team } = data;
      isProcessingPayment = false;

      // Update selectedPlanDetails with team data
      selectedPlanDetails = {
        ...selectedPlanDetails,
        fromPlan: team?.plan?.name || currentPlan,
        toPlan: team?.plan?.name || selectedPlanDetails.plan,
        hubName: team?.name || hubName,
      };

      showSubscriptionConfirmModal = true;
      refetchSubscription();
    });

    socket.on('payment_failed', (data) => {
      console.log('Payment failed:', data);
      const { team } = data;
      isProcessingPayment = false;
      notification.error('Payment failed. Please try again or contact support.');
      refetchSubscription();
    });

    // Subscription events
    socket.on('subscription_updated', (data) => {
      console.log('Subscription updated:', data);
      const { team } = data;
      refetchSubscription();
    });

    socket.on('subscription_created', (data) => {
      console.log('Subscription created:', data);
      const { team } = data;

      refetchSubscription();
    });

    socket.on('subscription_canceled', (data) => {
      console.log('Subscription canceled:', data);
      const { team } = data;

      refetchSubscription();
    });
  }

  // Extract hubId from URL
  let hubId = null;

  $: {
    const url = $location?.pathname || '';
    const matches = url.match(/\/([a-f0-9]{24})(?:\/|$)/i); // Match MongoDB ObjectId format
    if (matches && matches[1]) {
      hubId = matches[1];
    }
  }

  // UI state
  let showChangePlanModal = false;
  let showPaymentMethodModal = false;
  let showAddCardModal = false;
  let showSubscriptionConfirmModal = false;
  let isLoadingSubscription = false;
  let isProcessingPayment = false;

  // Default values - will be updated when subscription data is loaded
  let hubName = '';
  let customerId = null;
  let subscriptionData = null;
  let currentHubData = null;
  let planStatus = '';
  let invoiceUrl = '';

  // Subscription details
  let {
    subscriptionId = null,
    currentPlan = 'Community',
    currentPrice = '$0.00',
    currentBillingCycle = 'monthly',
    nextBillingDate = '',
    lastInvoiceAmount = '$0.00',
    totalPaidAmount = '$0.00',
    userCount = 1,
  } = {};

  // Selected plan details for payment
  let selectedPlanDetails = {
    plan: '',
    billingCycle: '',
    priceId: '',
    price: '',
    totalAmount: '',
  };

  // Fetch customer ID
  const { data: customerData, refetch: refetchCustomer } = createQuery(async () => {
    return billingService.fetchCustomerId(hubId);
  });

  // Re-fetch when hubId changes
  $: {
    if (hubId) {
      refetchCustomer();
    }
  }

  // Set customerId when customerData changes
  $: if ($customerData !== undefined) {
    customerId = $customerData?.data?.customerId || null;
  }

  // Fetch subscription data
  const {
    data: subscriptionApiData,
    isFetching: isFetchingSubscription,
    refetch: refetchSubscription,
  } = createQuery(async () => {
    if (!customerId) return null;
    return billingService.getCustomerSubscriptions(customerId);
  });

  const {
    data: hubData,
    isFetching: isFetchingHub,
    refetch: refetchHub,
  } = createQuery(async () => {
    return hubsService.getHubDetails(hubId);
  });

  // Re-fetch subscription data when customerId changes
  $: {
    if (customerId || customerId === null) {
      refetchSubscription();
      refetchHub();
    }
  }

  $: if ($hubData !== undefined) {
    currentHubData = $hubData?.data || null;
    hubName = currentHubData?.name || '';
    userCount = currentHubData?.users?.length || 1;
    planStatus = currentHubData?.billing?.status;
    invoiceUrl = currentHubData?.billing?.failed_invoice_url || '';
  }

  // Process subscription data when it changes
  $: if ($subscriptionApiData !== undefined) {
    isLoadingSubscription = false;
    subscriptionData = $subscriptionApiData?.subscriptions?.[0] || null;

    // Process subscription data using the utility function
    const processedData = processSubscriptionData(subscriptionData);

    // Update all subscription-related variables
    subscriptionId = processedData.subscriptionId;
    currentPlan = processedData.currentPlan;
    currentPrice = processedData.currentPrice;
    currentBillingCycle = processedData.currentBillingCycle;
    nextBillingDate = processedData.nextBillingDate;
    lastInvoiceAmount = processedData.lastInvoiceAmount;
    totalPaidAmount = processedData.totalPaidAmount;
    userCount = processedData.userCount;
  }

  // Handle upgrade button click
  function handleUpgradeClick() {
    showChangePlanModal = true;
  }

  // Handle plan selection from the modal
  function handlePlanSelected(event) {
    const { plan, billingCycle, price, priceId } = event.detail;

    // Store selected plan details
    selectedPlanDetails = {
      plan: capitalizeFirstLetter(plan),
      billingCycle,
      priceId: priceId || '',
      price,
      totalAmount: price,
    };

    // Close the plan selection modal and show the payment method selection modal
    showChangePlanModal = false;
    showPaymentMethodModal = true;
  }

  // Handle payment method selection
  async function handlePaymentMethodSelected(event) {
    const { paymentMethodId, planName, priceId, billingCycle } = event.detail;

    // Close the payment modal and show processing state
    showPaymentMethodModal = false;
    isProcessingPayment = true;

    try {
      // Prepare common metadata for both create and update operations
      const metadata = {
        hubId,
        userCount: userCount.toString(),
        planName,
      };

      let result;

      // Determine if we need to create or update a subscription
      if (subscriptionId) {
        // Update existing subscription
        result = await billingService.updateSubscription({
          subscriptionId,
          priceId,
          paymentMethodId,
          metadata,
        });
      } else if (customerId) {
        // Create new subscription
        result = await billingService.createSubscription({
          customerId,
          priceId,
          paymentMethodId,
          metadata,
        });
      } else {
        throw new Error('No customer ID available to create subscription');
      }

      // Handle any required authentication (like 3D Secure)
      if (result.requiresAction && result.clientSecret) {
        const { paymentIntent, error } = await stripe.confirmCardPayment(result.clientSecret);

        if (error) {
          isProcessingPayment = false;
          throw new Error(error.message || 'Payment authentication failed. Please try again.');
        }
      }

      // Set the subscription ID from the result if it's a new subscription
      if (!subscriptionId && result.subscriptionId) {
        subscriptionId = result.subscriptionId;
      }

      // Don't show confirmation modal here - wait for socket event
      // Update will come through socket events
    } catch (err) {
      console.error('Error processing subscription:', err);
      isProcessingPayment = false;
      if (window.notification && notification.error) {
        notification.error(`Subscription failed: ${err.message}`);
      }
    }
  }

  // Handle add new card
  function handleAddNewCard() {
    showPaymentMethodModal = false;
    navigate(`/billing/billingInformation/addPaymentDetails/${hubId}`);
  }

  // Handle payment method added
  function handlePaymentMethodAdded(event) {
    // Get the customer ID from the event if it's a new customer
    if (event.detail && event.detail.customerId) {
      customerId = event.detail.customerId;
      // After setting a new customer ID, we should refetch it to ensure it's saved
      refetchCustomer();
    }

    showAddCardModal = false;
    showPaymentMethodModal = true;
  }

  // Handle contact sales
  function handleContactSales() {
    showChangePlanModal = false;
    // Implement contact sales logic
    console.log('Contacting sales team for Enterprise plan');
  }

  // Handle view subscription
  function handleViewSubscription() {
    showSubscriptionConfirmModal = false;
    navigate('/billing/billingInvoices/' + hubId);
  }

  // Handle cancel subscription
  async function handleCancelSubscription() {
    if (!subscriptionId) return;

    try {
      await billingService.cancelSubscription({
        subscriptionId,
        cancelImmediately: false, // Cancel at period end
      });

      // Refetch subscription data
      refetchSubscription();
    } catch (error) {
      console.error('Error canceling subscription:', error);
      // You could add error handling here
    }
  }

  // Close all modals
  function closeModals() {
    showChangePlanModal = false;
    showPaymentMethodModal = false;
    showAddCardModal = false;
    showSubscriptionConfirmModal = false;
    isProcessingPayment = false;
  }
</script>

<section class="payment-information text-white">
  <div class="mb-6 flex items-end justify-between">
    <div>
      <h1 class="text-fs-ds-20 font-inter font-fw-ds-500 text-neutral-50">Your Plan</h1>
      <p class="text-fs-ds-14 font-fw-ds-300 font-inter text-neutral-100">
        View and manage your current subscription.
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
        class="text-fs-ds-12 font-fw-ds-400 font-inter text-neutral-200 underline">Privacy Policy</a
      >
    </div>
  </div>
  {#if planStatus !== 'active'}
    <div class="mt-2 mb-8">
      <Alert
        title="Payment Issue Detected"
        subtitle="Your last payment failed, and your plan is at risk of being paused. Please update your payment information to ensure uninterrupted access."
        showButton={true}
        buttonText="Fix Payment Issue"
        on:buttonClick={() => {
          window.open(invoiceUrl, '_blank');
        }}
      />
    </div>
  {/if}

  <!-- 2x2 Grid Layout -->
  <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
    <!-- Current Plan Card -->
    <div class="bg-surface-600 rounded-lg p-6">
      <div class="flex flex-col gap-1">
        <div class="flex items-start justify-between">
          <div class="flex flex-col gap-1">
            <div class="flex items-center gap-2">
              <h2
                class="text-fs-ds-16 font-inter font-fw-ds-400 max-w-[10rem] truncate text-neutral-50"
              >
                {hubName}
              </h2>

              <Tag
                text={currentPlan}
                bgColor={planColors[currentPlan]?.bg}
                textColor={planColors[currentPlan]?.text}
                borderColor={planColors[currentPlan]?.border}
                size="xs"
              />
            </div>
            <p class="text-fs-ds-20 font-inter font-fw-ds-500 text-neutral-50">
              {currentPrice}<span class="text-fs-ds-12 font-fw-ds-400 text-neutral-200"
                >{currentBillingCycle === 'monthly' ? '/user/month' : '/user/year'}</span
              >
            </p>
          </div>
        </div>
        <div class="pt-0">
          <div class="flex flex-col gap-1">
            {#if nextBillingDate}
              <p class="text-fs-ds-12 font-inter font-fw-ds-400 text-neutral-200">
                Next billing date: {nextBillingDate}
                {currentBillingCycle === 'monthly' ? '(Billed monthly)' : '(Billed annually)'}
              </p>
            {/if}
            <p class="text-fs-ds-12 font-inter font-fw-ds-400 text-neutral-200">
              Last paid amount: {lastInvoiceAmount}{currentBillingCycle === 'monthly'
                ? '/user/month'
                : '/user/year'}
            </p>
            <p class="text-fs-ds-12 font-inter font-fw-ds-400 text-neutral-200">
              Total paid amount: {totalPaidAmount}
            </p>
          </div>
          <button
            class="text-fs-ds-12 font-inter font-fw-ds-400 cursor-pointer text-blue-300"
            on:click={handleUpgradeClick}
          >
            Change plan
          </button>
        </div>
      </div>
      <div class="mt-4 flex items-center justify-between border-t border-neutral-700 pt-4">
        <div class="flex items-center gap-3">
          <!-- Crown icon -->
          <CrownIcon />

          <div>
            <h2 class="text-fs-ds-12 font-inter font-fw-ds-400 text-neutral-50">Upgrade Plan</h2>
            <p class="text-fs-ds-12 font-inter font-fw-ds-400 text-neutral-200">
              Upgrade Plan to get more features
            </p>
          </div>
        </div>
        <Button variant="outline-primary" size="medium" on:click={handleUpgradeClick}>
          Upgrade
        </Button>
      </div>
    </div>

    <!-- Need Help Card -->
    <div class="bg-surface-600 flex flex-col justify-between rounded-lg p-6">
      <div class="flex flex-col gap-4">
        <h2 class="text-fs-ds-16 font-inter font-fw-ds-400 text-neutral-50">
          Need help with billing or your plan?
        </h2>
        <p class="text-fs-ds-12 font-inter font-fw-ds-400 text-neutral-200">
          If you have questions about your current plan, billing history, or need help making
          changes, we're here for you. Our support team can assist with everything from invoice
          clarifications to upgrading your subscription.
        </p>
        <p class="text-fs-ds-12 font-inter font-fw-ds-400 text-neutral-200">
          Need a personalized recommendation, have a billing concern, or want to explore other
          plans? Just reach out, we'll walk you through it. We're here to make sure you get the most
          value from your subscription. Don't hesitate to contact us.
        </p>
      </div>
      <div class="border-t border-neutral-700 pt-4">
        <Button variant="outline-primary" size="medium">Contact Sales</Button>
      </div>
    </div>

    <!-- Quick Links Card -->
    <div class="bg-surface-600 rounded-lg p-6">
      <div class="flex flex-col gap-4">
        <h2 class="text-fs-ds-16 font-inter font-fw-ds-400 text-neutral-50">Quick Links</h2>
        <p class="text-fs-ds-12 font-inter font-fw-ds-400 text-neutral-200">
          Quick access to commonly used features.
        </p>
        <ul class="flex flex-col gap-5">
          <li class="flex cursor-pointer items-center gap-2">
            <a
              on:click={() => navigate(`/hubs/members/${hubId}`)}
              class="text-fs-ds-12 font-inter font-fw-ds-400 flex items-center gap-2 text-blue-300 underline"
            >
              Manage Users
            </a>
            <RedirectIcon />
          </li>
          <li class="flex cursor-pointer items-center gap-2">
            <a
              on:click={() => navigate(`/hubs/workspace/${hubId}`)}
              class="text-fs-ds-12 font-inter font-fw-ds-400 flex items-center gap-2 text-blue-300 underline"
            >
              Open Hub
            </a>
            <RedirectIcon />
          </li>

          <li class="flex cursor-pointer items-center gap-2">
            <a
              on:click={() => navigate(`/billing/billingInvoices/${hubId}`)}
              class="text-fs-ds-12 font-inter font-fw-ds-400 flex items-center gap-2 text-blue-300 underline"
            >
              View Invoice History
            </a>
            <RedirectIcon />
          </li>
          <li class="flex cursor-pointer items-center gap-2">
            <a
              on:click={() => navigate(`/billing/billingInformation/${hubId}`)}
              class="text-fs-ds-12 font-inter font-fw-ds-400 flex items-center gap-2 text-blue-300 underline"
            >
              View Payment Information
            </a>
            <RedirectIcon />
          </li>
          <li class="flex cursor-pointer items-center gap-2">
            <a
              on:click={() => navigate(`/hubs/settings/${hubId}`)}
              class="text-fs-ds-12 font-inter font-fw-ds-400 flex items-center gap-2 text-blue-300 underline"
            >
              Settings
            </a>
            <RedirectIcon />
          </li>
        </ul>
      </div>
    </div>
  </div>

  <!-- Change Plan Modal -->
  {#if showChangePlanModal}
    <Modal width="max-w-4xl" on:close={closeModals}>
      <ChangePlansModal
        {hubId}
        {hubName}
        {currentPlan}
        {currentBillingCycle}
        {subscriptionId}
        on:close={closeModals}
        on:selectPlan={handlePlanSelected}
        on:contactSales={handleContactSales}
      />
    </Modal>
  {/if}

  <!-- Payment Method Selection Modal -->
  {#if showPaymentMethodModal}
    <Modal width="max-w-xl" on:close={closeModals}>
      <PaymentMethodSelection
        {customerId}
        planName={selectedPlanDetails.plan}
        priceId={selectedPlanDetails.priceId}
        billingCycle={selectedPlanDetails.billingCycle}
        totalAmount={selectedPlanDetails.totalAmount}
        {userCount}
        {hubId}
        {subscriptionId}
        on:close={closeModals}
        on:paymentMethodSelected={handlePaymentMethodSelected}
        on:addNewCard={handleAddNewCard}
      />
    </Modal>
  {/if}

  <!-- Add Payment Method Modal -->
  {#if showAddCardModal}
    <Modal width="max-w-xl" on:close={closeModals}>
      <AddPaymentMethod
        {customerId}
        {hubId}
        on:close={closeModals}
        on:paymentMethodAdded={handlePaymentMethodAdded}
      />
    </Modal>
  {/if}

  <!-- Processing Payment Modal -->
  {#if isProcessingPayment}
    <Modal width="max-w-xl" on:close={closeModals}>
      <PaymentProcessingModal on:close={closeModals} />
    </Modal>
  {/if}

  <!-- Subscription Confirmation Modal -->
  {#if showSubscriptionConfirmModal}
    <Modal width="max-w-xl" on:close={closeModals}>
      <PlanUpdateSuccess
        hubName={selectedPlanDetails.hubName}
        currentPlan={selectedPlanDetails.toPlan}
        {nextBillingDate}
        fromPlan={selectedPlanDetails.fromPlan}
        toPlan={selectedPlanDetails.toPlan}
        on:close={closeModals}
        on:goToDashboard={handleViewSubscription}
      />
    </Modal>
  {/if}
</section>
