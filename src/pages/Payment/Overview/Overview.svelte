<script>
  // Svelte
  import { onMount, onDestroy } from 'svelte';
  import { useLocation, navigate } from 'svelte-routing';

  // Constants
  import { API_BASE_URL } from '@/constants/environment';

  // Services
  import { createQuery } from '@/services/api.common';
  import { billingService } from '@/services/billing.service';
  import { hubsService } from '@/services/hubs.service';

  // Utils
  import { processSubscriptionData, DEFAULT_PLAN_DETAILS } from '@/utils/pricing';
  import { getDynamicCssClasses } from '@/utils/planTagStyles';
  import { initializeStripe } from '@/utils/stripeUtils';
  import { initializeStripeSocket } from '@/utils/socket.io.utils';

  // UI Components
  import Button from '@/ui/Button/Button.svelte';
  import Tag from '@/ui/Tag/Tag.svelte';

  // App Components
  import Alert from '@/components/Alert/Alert.svelte';
  import { notification } from '@/components/Toast';

  // Icons
  import CrownIcon from '@/assets/icons/CrownIcon.svelte';
  import RedirectIcon from '@/assets/icons/RedirectIcon.svelte';

  const location = useLocation();

  // Add Stripe instance
  let stripe;
  let socket;

  // Initialize Stripe on mount
  onMount(async () => {
    stripe = await initializeStripe();

    // Initialize socket with event handlers
    socket = initializeStripeSocket(API_BASE_URL, {
      onPaymentSuccess: (data) => {
        console.log('Payment success:', data);
        const { team } = data;
        isProcessingPayment = false;
        showSubscriptionConfirmModal = true;

        // Update selectedPlanDetails with team data
        selectedPlanDetails = {
          ...selectedPlanDetails,
          fromPlan: team?.plan?.name || currentPlan,
          toPlan: team?.plan?.name || selectedPlanDetails.plan,
          hubName: team?.name || hubName,
        };

        refetchSubscription();
      },
      onPaymentFailed: (data) => {
        console.log('Payment failed:', data);
        const { team } = data;
        isProcessingPayment = false;
        showSubscriptionFailedModal = true;
        notification.error('Payment failed. Please try again or contact support.');

        // Update selectedPlanDetails with team data
        selectedPlanDetails = {
          ...selectedPlanDetails,
          fromPlan: team?.plan?.name || currentPlan,
          toPlan: team?.plan?.name || selectedPlanDetails.plan,
          hubName: team?.name || hubName,
        };
        refetchSubscription();
        refetchHub();
      },
      onSubscriptionUpdated: (data) => {
        console.log('Subscription updated:', data);
        refetchSubscription();
        refetchHub();
      },
      onSubscriptionCreated: (data) => {
        console.log('Subscription created:', data);
        refetchSubscription();
        refetchHub();
      },
      onSubscriptionCanceled: (data) => {
        console.log('Subscription canceled:', data);
        refetchSubscription();
        refetchHub();
      },
    });
  });

  // Cleanup socket connection on component destroy
  onDestroy(() => {
    if (socket) {
      socket.disconnect();
    }
  });

  // Extract hubId from URL
  let hubId = null;

  $: {
    const url = $location?.pathname || '';
    const matches = url.match(/\/([a-f0-9]{24})(?:\/|$)/i); // Match MongoDB ObjectId format
    if (matches && matches[1]) {
      hubId = matches[1];
    }
  }

  // URL parameter handling for plan updates
  let showProcessingFromURL = false;
  let showFailedFromURL = false;
  let fromPlan = '';
  let toPlan = '';

  $: {
    if ($location?.search) {
      const searchParams = new URLSearchParams($location.search);
      showProcessingFromURL = searchParams.get('showProcessing') === 'true';
      showFailedFromURL = searchParams.get('showFailed') === 'true';
      fromPlan = searchParams.get('fromPlan') || currentPlan;
      toPlan = searchParams.get('toPlan') || '';

      // Set modal flags based on URL parameters
      if (showProcessingFromURL) {
        isProcessingPayment = true;
      }

      if (showFailedFromURL) {
        showSubscriptionFailedModal = true;
        selectedPlanDetails = {
          ...selectedPlanDetails,
          fromPlan,
          toPlan,
        };
      }

      // Clear the URL params after reading them
      if (showProcessingFromURL || showFailedFromURL) {
        const cleanUrl = window.location.pathname;
        window.history.replaceState({}, document.title, cleanUrl);
      }
    }
  }

  // UI state
  let showSubscriptionConfirmModal = false;
  let showSubscriptionFailedModal = false;
  let isLoadingSubscription = false;
  let isProcessingPayment = false;

  // Default values - will be updated when subscription data is loaded
  let hubName = '';
  let customerId = null;
  let subscriptionData = null;
  let currentHubData = null;
  let planStatus = '';
  let subscriptionStatus = '';
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
  };

  // Fetch customer ID
  const { data: customerData, refetch: refetchCustomer } = createQuery(async () => {
    return billingService.fetchCustomerId(hubId);
  });

  // Re-fetch when hubId changes
  $: {
    if (hubId) {
      refetchCustomer();
      refetchHub();
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
    // Use plan name from the database
    currentPlan = currentHubData?.plan?.name || 'Community';
    invoiceUrl = currentHubData?.billing?.failed_invoice_url || '';
  }

  // Process subscription data when it changes
  $: if ($subscriptionApiData !== undefined) {
    isLoadingSubscription = false;
    // Get the most recent subscription (first in the array)
    subscriptionData = $subscriptionApiData?.subscriptions?.[0] || null;
    
    // Only use subscription data if it's in an active state
    // Otherwise, use default values from the database
    if (subscriptionData && subscriptionData.status === 'active') {
      // Process subscription data using the utility function
      const processedData = processSubscriptionData(subscriptionData, currentPlan);

      // Update all subscription-related variables
      subscriptionId = processedData.subscriptionId;
      // Don't override currentPlan from the database
      // currentPlan = processedData.currentPlan;
      currentPrice = processedData.currentPrice;
      currentBillingCycle = processedData.currentBillingCycle;
      nextBillingDate = processedData.nextBillingDate;
      lastInvoiceAmount = processedData.lastInvoiceAmount;
      totalPaidAmount = processedData.totalPaidAmount;
      userCount = processedData.userCount;
      subscriptionStatus = processedData.subscriptionStatus;
    } else {
      // If subscription is canceled or inactive, use default values
      // Keep the plan name from the database, but reset other subscription details
      subscriptionId = null;
      
      // For free Community plan
      if (currentPlan === 'Community') {
        currentPrice = '$0.00';
        currentBillingCycle = 'monthly';
        nextBillingDate = '';
        lastInvoiceAmount = '$0.00';
        totalPaidAmount = '$0.00';
      } else {
        // For paid plans that are canceled, show default pricing based on plan name
        const planKey = currentPlan.toLowerCase();
        if (DEFAULT_PLAN_DETAILS[planKey]) {
          currentPrice = DEFAULT_PLAN_DETAILS[planKey].monthly.price;
          currentBillingCycle = 'monthly';
          // Clear dates and amounts since the subscription is inactive
          nextBillingDate = '';
          lastInvoiceAmount = '$0.00';
          totalPaidAmount = '$0.00';
        }
      }
      
      // Set subscription status
      subscriptionStatus = subscriptionData?.status || '';
    }
  }

  // Handle upgrade button click
  function handleUpgradeClick() {
    if (planStatus === 'payment_failed') {
      notification.error('Please resolve the payment issue before changing your plan.');
      return;
    }
    // Navigate directly to the change plan page with subscription ID
    const searchParams = new URLSearchParams({
      currentPlan,
      currentBillingCycle,
      subscriptionId: subscriptionId || '',
      status: subscriptionStatus,
    });

    navigate(`/billing/billingInformation/changePlan/${hubId}?${searchParams.toString()}`);
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
  {#if planStatus === 'payment_failed'}
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
    <div class="bg-surface-600 flex flex-col justify-between rounded-lg p-6">
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
                bgColor={getDynamicCssClasses(currentPlan)?.bgColor}
                textColor={getDynamicCssClasses(currentPlan)?.textColor}
                borderColor={getDynamicCssClasses(currentPlan)?.borderColor}
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
        <a href="mailto:contactus@sparrowapp.dev">
          <Button variant="outline-primary" size="medium">Contact Sales</Button>
        </a>
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
</section>
