<script>
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

  const location = useLocation();

  // Extract hubId from URL
  let hubId = null;

  $: {
    const url = $location?.pathname || '';
    const matches = url.match(/\/([a-f0-9]{24})(?:\/|$)/i); // Match MongoDB ObjectId format
    if (matches && matches[1]) {
      hubId = matches[1];
    }
  }

  // State
  let showChangePlanModal = false;
  let showPaymentMethodModal = false;
  let showAddCardModal = false;
  let showSubscriptionConfirmModal = false;
  let currentPlan = 'Community';
  let hubName = 'Techdome Hub';
  let customerId = null;
  let subscriptionData = null;
  let isLoadingSubscription = false;

  // Subscription details
  let subscriptionId = null;
  let currentPrice = '$0.00';
  let currentBillingCycle = 'monthly';
  let nextBillingDate = '';
  let lastInvoiceAmount = '$0.00';
  let totalPaidAmount = '$0.00';

  // Selected plan details for payment
  let selectedPlanDetails = {
    plan: '',
    billingCycle: '',
    priceId: '',
    price: '',
    totalAmount: '',
  };

  // User count
  let userCount = 1;

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

  $: {
    if (customerId || customerId === null) {
      refetchSubscription();
    }
  }

  // Process subscription data when it changes
  $: if ($subscriptionApiData !== undefined) {
    isLoadingSubscription = false;
    subscriptionData = $subscriptionApiData?.subscriptions?.[0] || null;

    if (subscriptionData) {
      // Extract subscription details
      subscriptionId = subscriptionData.id;

      // Get metadata
      const metadata = subscriptionData.metadata || {};

      // Set current plan from metadata or default to 'Community'
      currentPlan = metadata.planName || 'Community';

      // Get user count from metadata or default to 1
      userCount = parseInt(metadata.userCount || '1', 10);

      // Get current price details from subscription items
      if (subscriptionData.items?.data?.length > 0) {
        const priceDetails = subscriptionData.items.data[0].price;
        if (priceDetails) {
          // Format price amount (comes in cents)
          const unitAmount = priceDetails.unit_amount / 100;
          currentPrice = `$${unitAmount.toFixed(2)}`;

          // Determine billing cycle
          currentBillingCycle = priceDetails.recurring?.interval || 'month';
          currentBillingCycle = currentBillingCycle === 'month' ? 'monthly' : 'annual';
        }
      } else if (subscriptionData.plan) {
        // Fallback to plan object if items are not available
        const unitAmount = subscriptionData.plan.amount / 100;
        currentPrice = `$${unitAmount.toFixed(2)}`;

        // Get billing cycle from plan
        currentBillingCycle = subscriptionData.plan.interval || 'month';
        currentBillingCycle = currentBillingCycle === 'month' ? 'monthly' : 'annual';
      }

      // Format next billing date using current_period_end from subscription or items
      if (subscriptionData.items?.data?.[0]?.current_period_end) {
        const date = new Date(subscriptionData.items.data[0].current_period_end * 1000);
        nextBillingDate = date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });
      }
      // If latest_invoice is a string (reference), we can't extract data directly
      // In a production app, you would fetch the invoice details using that ID
      if (subscriptionData.latest_invoice && typeof subscriptionData.latest_invoice !== 'string') {
        if (subscriptionData.latest_invoice.amount_paid) {
          const amount = subscriptionData.latest_invoice.amount_paid / 100;
          lastInvoiceAmount = `$${amount.toFixed(2)}`;
          totalPaidAmount = lastInvoiceAmount; // For now, use last invoice amount
        }
      } else {
        // If latest_invoice is a string ID or not available, use current price as a fallback
        lastInvoiceAmount = currentPrice;
        totalPaidAmount = currentPrice;
      }

      // Check subscription status
      const isActive = subscriptionData.status === 'active';
      if (!isActive) {
        // If subscription is not active, add status indicator to currentPlan
        currentPlan = `${currentPlan} (${subscriptionData.status.charAt(0).toUpperCase() + subscriptionData.status.slice(1)})`;
      }

      // Check if subscription is scheduled to be canceled
      if (subscriptionData.cancel_at_period_end) {
        // Add indication that the subscription will be canceled
        const cancelDate = new Date(subscriptionData.current_period_end * 1000);
        const formattedCancelDate = cancelDate.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });

        // Update UI to show cancellation status
        currentPlan = `${currentPlan} (Cancels on ${formattedCancelDate})`;
      }
    } else {
      // Default values for Community plan
      currentPlan = 'Community';
      currentPrice = '$0.00';
      currentBillingCycle = 'monthly';
      nextBillingDate = '';
      lastInvoiceAmount = '$0.00';
      totalPaidAmount = '$0.00';
      subscriptionId = null;
    }
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
      plan: plan.charAt(0).toUpperCase() + plan.slice(1),
      billingCycle,
      priceId: priceId || '',
      price,
      totalAmount: price,
    };

    // Close the plan selection modal
    showChangePlanModal = false;

    // Show the payment method selection modal
    showPaymentMethodModal = true;
  }

  // Handle payment method selection
  async function handlePaymentMethodSelected(event) {
    const { paymentMethodId, planName, priceId, billingCycle } = event.detail;

    // Close the payment modal
    showPaymentMethodModal = false;

    // Show loading state
    isLoadingSubscription = true;

    try {
      // Determine if we need to create or update a subscription
      if (subscriptionId) {
        // Update existing subscription
        await billingService.updateSubscription({
          subscriptionId,
          priceId,
          metadata: {
            hubId,
            userCount: userCount.toString(),
            planName,
          },
        });
      }

      // Show the confirmation modal
      showSubscriptionConfirmModal = true;

      // Update current plan in UI
      currentPlan = planName;

      // Refetch subscription data
      refetchSubscription();
    } catch (error) {
      console.error('Error updating subscription:', error);
      // You could add error handling here
    } finally {
      isLoadingSubscription = false;
    }
  }

  // Handle add new card
  function handleAddNewCard() {
    showPaymentMethodModal = false;
    showAddCardModal = true;
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

  <!-- 2x2 Grid Layout -->
  <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
    <!-- Current Plan Card -->
    <div class="bg-surface-600 rounded-lg p-6">
      <div class="flex flex-col gap-1">
        <div class="flex items-start justify-between">
          <div class="flex flex-col gap-1">
            <h2 class="text-fs-ds-18 font-inter font-fw-ds-300 text-neutral-50">Current Plan</h2>
            <p class="text-fs-ds-16 font-inter font-fw-ds-400 mt-3 text-neutral-50">
              {currentPlan}
            </p>
            <p class="text-fs-ds-20 font-inter font-fw-ds-500 text-neutral-50">
              {currentPrice}<span class="text-fs-ds-12 font-fw-ds-400 text-neutral-200"
                >{currentBillingCycle === 'monthly' ? '/user/month' : '/user/year'}</span
              >
            </p>
          </div>
          {#if subscriptionId}
            <button
              class="text-fs-ds-12 font-inter font-fw-ds-400 text-neutral-200 underline transition-colors hover:text-blue-300"
              on:click={handleCancelSubscription}
            >
              Cancel Subscription
            </button>
          {/if}
        </div>
        <div class="pt-0">
          <div class="flex flex-col gap-2">
            {#if nextBillingDate}
              <p class="text-fs-ds-12 font-inter font-fw-ds-400 text-neutral-200">
                Next billing date: {nextBillingDate}
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
            class="text-fs-ds-12 font-inter font-fw-ds-400 text-blue-300 underline"
            on:click={handleUpgradeClick}
          >
            Change plan
          </button>
        </div>
      </div>
      <div class="mt-8 flex items-center justify-between">
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
        <Button variant="filled-primary" size="medium" on:click={handleUpgradeClick}>
          Upgrade
        </Button>
      </div>
    </div>

    <!-- Need Help Card -->
    <div class="bg-surface-600 rounded-lg p-6">
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
        <div>
          <Button variant="filled-secondary" size="medium">Contact Sales</Button>
        </div>
      </div>
    </div>

    <!-- Quick Links Card -->
    <div class="bg-surface-600 rounded-lg p-6">
      <div class="flex flex-col gap-4">
        <h2 class="text-fs-ds-16 font-inter font-fw-ds-400 text-neutral-50">Quick Links</h2>
        <p class="text-fs-ds-12 font-inter font-fw-ds-400 text-neutral-200">
          Quick access to commonly used features.
        </p>
        <ul class="flex flex-col gap-3">
          <li>
            <a
              href="/manage-users"
              class="text-fs-ds-14 font-inter font-fw-ds-400 flex items-center gap-2 text-blue-300 hover:text-blue-400"
            >
              Manage Users
            </a>
          </li>
          <li>
            <a
              href={`/hub/${hubId}`}
              class="text-fs-ds-14 font-inter font-fw-ds-400 flex items-center gap-2 text-blue-300 hover:text-blue-400"
            >
              Open Hub
            </a>
          </li>
          <li>
            <a
              href="/workspaces"
              class="text-fs-ds-14 font-inter font-fw-ds-400 flex items-center gap-2 text-blue-300 hover:text-blue-400"
            >
              View Workspaces
            </a>
          </li>
          <li>
            <a
              href={`/billing/billingInvoices/${hubId}`}
              class="text-fs-ds-14 font-inter font-fw-ds-400 flex items-center gap-2 text-blue-300 hover:text-blue-400"
            >
              View Invoice History
            </a>
          </li>
          <li>
            <a
              href={`/billing/billingInformation/${hubId}`}
              class="text-fs-ds-14 font-inter font-fw-ds-400 flex items-center gap-2 text-blue-300 hover:text-blue-400"
            >
              View Payment Information
            </a>
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

  <!-- Subscription Confirmation Modal -->
  {#if showSubscriptionConfirmModal}
    <Modal width="max-w-xl" on:close={closeModals}>
      <!-- <SubscriptionConfirmation
        planName={selectedPlanDetails.plan}
        billingCycle={selectedPlanDetails.billingCycle}
        amount={selectedPlanDetails.totalAmount}
        {userCount}
        {nextBillingDate}
        on:close={closeModals}
        on:viewSubscription={handleViewSubscription}
      /> -->
      <PlanUpdateSuccess
        hubName="Techdome Hub"
        currentPlan={selectedPlanDetails.plan}
        {nextBillingDate}
        fromPlan={selectedPlanDetails.plan}
        toPlan="Professional"
        on:close={closeModals}
        on:goToDashboard={handleViewSubscription}
      />
    </Modal>
  {/if}
</section>
