<script>
  // Svelte
  import { onMount, onDestroy } from 'svelte';
  import { useLocation, navigate } from 'svelte-routing';
  import { tweened } from 'svelte/motion';
  import { cubicOut } from 'svelte/easing';

  // Services
  import { createQuery } from '@/services/api.common';
  import { billingService } from '@/services/billing.service';
  import { hubsService } from '@/services/hubs.service';

  // Utils
  import {
    processSubscriptionData,
    getCurrentPlanDetails,
    initializePlanDetails,
  } from '@/utils/pricing';
  import { getDynamicCssClasses } from '@/utils/planTagStyles';
  import { captureEvent } from '@/utils/posthogConfig';

  // UI Components
  import Button from '@/ui/Button/Button.svelte';
  import Tag from '@/ui/Tag/Tag.svelte';

  // App Components
  import Alert from '@/components/Alert/Alert.svelte';
  import Modal from '@/components/Modal/Modal.svelte';
  import {
    CancelSubscriptionConfirm,
    CancelSubscriptionSuccess,
    ResubscribeModal,
  } from '@/components/CancelSubscription';
  import { notification } from '@/components/Toast';

  // Icons
  import CrownIcon from '@/assets/icons/CrownIcon.svelte';
  import RedirectIcon from '@/assets/icons/RedirectIcon.svelte';
  import CircularLoader from '@/ui/CircularLoader/CircularLoader.svelte';
  import GreenCheckIconFill from '@/assets/icons/GreenCheckIconFill.svelte';

  // ===== CONSTANTS =====
  const location = useLocation();

  // ===== STATE VARIABLES =====

  // URL and hub data
  let hubId = null;
  let hubName = '';
  let currentHubData = null;

  // Subscription data
  let customerId = null;
  let subscriptionData = null;
  let subscriptionId = null;
  let currentPlan = 'Community';
  let currentPrice = '$0.00';
  let currentBillingCycle = 'monthly';
  let nextBillingDate = '';
  let lastInvoiceAmount = '$0.00';
  let totalPaidAmount = '$0.00';
  let userCount = 1;
  let planStatus = '';
  let subscriptionStatus = '';
  let invoiceUrl = '';
  let isScheduledDowngrade = false;
  let promoDiscount = null;

  // UI state
  let isLoadingSubscription = false;

  // Cancel subscription state
  let showCancelConfirmModal = false;
  let showCancelSuccessModal = false;
  let cancelInProgress = false;

  // Resubscribe state
  let showResubscribeModal = false;
  let resubscribeInProgress = false;

  // Animation stores for cards
  const cardOpacity = tweened(0, {
    duration: 600,
    easing: cubicOut,
  });

  const cardTranslateY = tweened(20, {
    duration: 600,
    easing: cubicOut,
  });

  const cardBlur = tweened(4, {
    duration: 600,
    easing: cubicOut,
  });

  // ===== API QUERIES =====
  // Fetch customer ID
  const { data: customerData, refetch: refetchCustomer } = createQuery(async () => {
    return billingService.fetchCustomerId(hubId);
  });

  // Fetch subscription data
  const {
    data: subscriptionApiData,
    isFetching: isFetchingSubscription,
    refetch: refetchSubscription,
  } = createQuery(async () => {
    if (!customerId) return null;
    return billingService.getCustomerSubscriptions(customerId);
  });

  // Fetch hub data
  const {
    data: hubData,
    isFetching: isFetchingHub,
    refetch: refetchHub,
  } = createQuery(async () => {
    return hubsService.getHubDetails(hubId);
  });

  // ===== REACTIVE STATEMENTS =====
  // Extract hubId from URL
  $: {
    const url = $location?.pathname || '';
    const matches = url.match(/\/([a-f0-9]{24})(?:\/|$)/i); // Match MongoDB ObjectId format
    if (matches && matches[1]) {
      hubId = matches[1];
    }
  }

  // Re-fetch when hubId changes
  $: {
    if (hubId) {
      refetchCustomer();
      refetchHub();
      initializePlanDetails();
    }
  }

  // Set customerId when customerData changes
  $: if ($customerData !== undefined) {
    customerId = $customerData?.data?.customerId || null;
  }

  // Re-fetch subscription data when customerId changes
  $: {
    if (customerId || customerId === null) {
      refetchSubscription();
      refetchHub();
    }
  }

  // Process hub data when it changes
  $: if ($hubData !== undefined) {
    currentHubData = $hubData?.data || null;
    hubName = currentHubData?.name || '';
    userCount = $hubData?.data?.users?.length + $hubData?.data?.invites?.length || 1;
    planStatus = currentHubData?.billing?.status;
    // Use plan name from the database
    currentPlan = currentHubData?.plan?.name || 'Community';
    invoiceUrl =
      currentHubData?.billing?.failed_invoice_url || currentHubData?.billing?.invoice_url || ''; // failed_invoice_url is for backward compatibility
    isScheduledDowngrade = currentHubData?.billing?.scheduledDowngrade || false;
  }

  // Process subscription data when it changes
  $: if ($subscriptionApiData !== undefined) {
    isLoadingSubscription = false;
    // Get the most recent subscription (first in the array)
    subscriptionData = $subscriptionApiData?.subscriptions?.[0] || null;
    // Only use subscription data if it's in an active state
    // Otherwise, use default values from the database
    if (
      subscriptionData &&
      (subscriptionData.status === 'active' ||
        subscriptionData.status === 'past_due' ||
        subscriptionData.status === 'trialing')
    ) {
      // Process subscription data using the utility function
      const processedData = processSubscriptionData(subscriptionData, currentPlan);

      // Update all subscription-related variables
      subscriptionId = processedData.subscriptionId;
      // Don't override currentPlan from the database
      currentPrice = processedData.currentPrice;
      currentBillingCycle = processedData.currentBillingCycle;
      nextBillingDate = processedData.nextBillingDate;
      lastInvoiceAmount = processedData.lastInvoiceAmount;
      totalPaidAmount = processedData.totalPaidAmount;
      userCount = userCount;
      subscriptionStatus = processedData.subscriptionStatus;

      // Extract promo discount information
      if (subscriptionData?.discounts?.length > 0) {
        const discount = subscriptionData?.discounts[0];
        const coupon = discount?.coupon;
        if (coupon) {
          promoDiscount = {
            type: coupon.percent_off ? 'percentage' : 'amount',
            value: coupon.percent_off || coupon.amount_off,
            name: coupon.name || 'Promo',
            metadata: coupon.metadata,
          };
        }
      } else {
        promoDiscount = null;
      }
    } else {
      // If subscription is canceled or inactive, use default values
      // Keep the plan name from the database, but reset other subscription details
      subscriptionId = null;
      promoDiscount = null;

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
        const planDetails = getCurrentPlanDetails();
        if (planDetails[planKey]) {
          currentPrice = planDetails[planKey].monthly.price;
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

  // Add animation trigger
  $: if (!$isFetchingSubscription && !$isFetchingHub && $hubData?.data) {
    setTimeout(() => {
      cardOpacity.set(1);
      cardTranslateY.set(0);
      cardBlur.set(0);
    }, 100);
  }

  // ===== FUNCTIONS =====
  // Handle upgrade button click
  function handleUpgradeClick() {
    captureUserClickUpgradePlan();
    if (planStatus === 'payment_failed' || planStatus === 'action_required') {
      notification.error('Please resolve the payment issue before changing your plan.');
      return;
    }
    // Navigate directly to the change plan page with subscription ID
    const searchParams = new URLSearchParams({
      currentPlan,
      currentBillingCycle,
      subscriptionId: subscriptionId || '',
      status: subscriptionStatus,
      userCount: userCount.toString(),
      inTrial: $hubData?.data?.billing?.in_trial ? 'true' : 'false',
    });

    navigate(`/billing/billingInformation/changePlan/${hubId}?${searchParams.toString()}`);
  }

  // Cancel subscription functions
  function openCancelModal() {
    showCancelConfirmModal = true;
  }

  function closeCancelConfirmModal() {
    showCancelConfirmModal = false;
  }

  function closeCancelSuccessModal() {
    showCancelSuccessModal = false;
  }

  async function confirmCancelSubscription() {
    cancelInProgress = true;
    try {
      // Call the cancel subscription API
      await billingService.cancelSubscription({ subscriptionId });

      // Close confirmation modal and show success modal
      closeCancelConfirmModal();
      showCancelSuccessModal = true;

      // Update local state
      subscriptionStatus = 'canceled';

      // Refresh subscription data
      refetchSubscription();
      refetchHub();

      notification.success('Subscription canceled successfully.');
    } catch (error) {
      console.error('Error canceling subscription:', error);
      notification.error('Failed to cancel subscription. Please try again later.');
    } finally {
      cancelInProgress = false;
    }
  }

  // Resubscribe functions
  function openResubscribeModal() {
    showResubscribeModal = true;
  }

  function closeResubscribeModal() {
    showResubscribeModal = false;
  }

  async function confirmResubscription() {
    resubscribeInProgress = true;
    try {
      // Call the reactivate subscription API
      await billingService.reactivateSubscription({
        subscriptionId,
        metadata: {
          reactivatedAt: new Date().toISOString(),
          hubId: hubId,
        },
      });

      // Close modal
      closeResubscribeModal();
      closeCancelSuccessModal();

      // Refresh subscription data
      refetchSubscription();
      refetchHub();

      notification.success(`${currentPlan} Plan resubscribed successfully.`);
    } catch (error) {
      console.error('Error reactivating subscription:', error);
      notification.error(`Failed to resubscribe ${currentPlan} plan. Please try again.`);
    } finally {
      resubscribeInProgress = false;
    }
  }

  const captureUserClickUpgradePlan = () => {
    const eventProperties = {
      event_source: 'admin_panel',
      cta_location: 'billing_overview',
    };
    captureEvent('admin_upgrade_intent', eventProperties);
  };
</script>

{#if $isFetchingSubscription || $isFetchingHub || !$hubData?.data}
  <div class="flex h-[calc(100vh-4rem)] w-full items-center justify-center">
    <CircularLoader />
  </div>
{:else}
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
    {#if planStatus === 'payment_failed' || planStatus === 'action_required'}
      <div class="mt-2 mb-8">
        <Alert
          variant="error"
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

    <!-- Schedule Alert -->
    {#if isScheduledDowngrade}
      <div class="mt-2 mb-8">
        <Alert
          variant="warning"
          title="Scheduled Downgrade"
          subtitle={`You have a scheduled downgrade in progress. Your subscription will be downgraded automatically at the end of your current billing cycle on ${nextBillingDate}. You won’t be able to upgrade, downgrade or cancel your plan until this change takes effect.`}
          showButton={false}
          class_name="border-l-2 border-blue-400 bg-gradient-to-r from-blue-400/18 from-1% via-10% via-surface-600 to-surface-600"
        />
      </div>
    {/if}

    <!-- 2x2 Grid Layout -->
    <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
      <!-- Current Plan Card -->
      <div
        class="bg-surface-600 flex flex-col justify-between rounded-lg p-6"
        style="opacity: {$cardOpacity}; transform: translateY({$cardTranslateY}px); filter: blur({$cardBlur}px);"
      >
        <div class="flex flex-col gap-1">
          <div class="flex w-full items-center justify-between">
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
              {#if subscriptionId && subscriptionData?.cancel_at_period_end}
                <Tag
                  text={'Cancelled'}
                  bgColor={getDynamicCssClasses('Cancelled')?.bgColor}
                  textColor={getDynamicCssClasses('Cancelled')?.textColor}
                  borderColor={getDynamicCssClasses('Cancelled')?.borderColor}
                  size="xs"
                />
              {/if}
            </div>

            {#if !isScheduledDowngrade}
              {#if subscriptionId && subscriptionData?.status === 'active' && !subscriptionData?.cancel_at_period_end}
                <button
                  class="text-fs-ds-12 font-inter font-fw-ds-400 cursor-pointer text-neutral-200 underline"
                  on:click={openCancelModal}
                >
                  Cancel Subscription
                </button>
              {/if}
              {#if subscriptionId && subscriptionData?.cancel_at_period_end}
                <button
                  class="text-fs-ds-12 font-inter font-fw-ds-400 cursor-pointer text-neutral-200 underline"
                  on:click={openResubscribeModal}
                >
                  Resubscribe
                </button>
              {/if}
            {/if}
          </div>
          <div class="flex items-start justify-between">
            <div class="flex flex-col gap-1">
              <p class="text-fs-ds-20 font-inter font-fw-ds-500 text-neutral-50">
                {currentPrice}<span class="text-fs-ds-12 font-fw-ds-400 text-neutral-200"
                  >{currentBillingCycle === 'monthly' ? '/user/month' : '/user/year'}</span
                >
              </p>
            </div>
          </div>
          <div class="pt-0">
            <div class="flex flex-col gap-1">
              {#if promoDiscount}
                <div class="flex items-center gap-2">
                  <GreenCheckIconFill />
                  <p class="text-fs-ds-12 font-inter font-fw-ds-400 text-neutral-200">
                    Promo applied:
                    {#if promoDiscount.type === 'percentage'}
                      {promoDiscount.value}%/user/month discount
                    {:else}
                      ${promoDiscount.value.toFixed(2)}/month discount
                    {/if}
                  </p>
                </div>
              {/if}
              {#if subscriptionId && subscriptionData?.cancel_at_period_end}
                <p class="text-fs-ds-12 font-inter font-fw-ds-400 text-neutral-200">
                  Next billing date: –
                </p>
              {:else if nextBillingDate}
                <p class="text-fs-ds-12 font-inter font-fw-ds-400 text-neutral-200">
                  Next billing date: {nextBillingDate}
                  {currentBillingCycle === 'monthly' ? '(Billed monthly)' : '(Billed annually)'}
                </p>
              {/if}

              <p class="text-fs-ds-12 font-inter font-fw-ds-400 text-neutral-200">
                Last paid amount: {$hubData?.data?.billing?.in_trial
                  ? '$0.00'
                  : lastInvoiceAmount}{currentBillingCycle === 'monthly'
                  ? '/user/month'
                  : '/user/year'}
              </p>
            </div>
            <div class="mt-2 flex items-center gap-4">
              {#if !isScheduledDowngrade && subscriptionData?.cancel_at_period_end && subscriptionData?.status === 'canceled'}
                <button
                  class="text-fs-ds-12 font-inter font-fw-ds-400 cursor-pointer text-blue-300"
                  on:click={handleUpgradeClick}
                >
                  Change plan
                </button>
              {/if}
            </div>
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
          <Button
            variant="outline-primary"
            size="medium"
            on:click={handleUpgradeClick}
            disabled={isScheduledDowngrade ||
              (subscriptionData?.cancel_at_period_end && subscriptionData?.status !== 'canceled')}
            tooltipText={isScheduledDowngrade
              ? `Scheduled plan change. Your subscription will downgrade on ${nextBillingDate}. Plan changes are locked until then.`
              : ''}
            tooltipPosition="bottom"
            tooltipDelay={100}
          >
            Upgrade
          </Button>
        </div>
      </div>

      <!-- Need Help Card -->
      <div
        class="bg-surface-600 flex flex-col justify-between rounded-lg p-6"
        style="opacity: {$cardOpacity}; transform: translateY({$cardTranslateY}px); filter: blur({$cardBlur}px);"
      >
        <div class="flex flex-col gap-4">
          <h2 class="text-fs-ds-16 font-inter font-fw-ds-400 text-neutral-50">
            Need help with billing or your plan?
          </h2>
          <p class="text-fs-ds-12 font-inter font-fw-ds-400 text-neutral-200">
            If you have questions about your current plan, billing history, or need help making
            changes, we're here for you. Our support team can assist with everything from invoice
            clarifications to upgrading your subscription.
          </p>
          <p class="text-fs-ds-12 font-inter font-fw-ds-400 pb-4 text-neutral-200">
            Need a personalized recommendation, have a billing concern, or want to explore other
            plans? Just reach out, we'll walk you through it. We're here to make sure you get the
            most value from your subscription. Don't hesitate to contact us.
          </p>
        </div>
        <div class="border-t border-neutral-700 pt-4">
          <a href="mailto:contactus@sparrowapp.dev">
            <Button variant="outline-primary" size="medium">Contact Sales</Button>
          </a>
        </div>
      </div>

      <!-- Quick Links Card -->
      <div
        class="bg-surface-600 rounded-lg p-6"
        style="opacity: {$cardOpacity}; transform: translateY({$cardTranslateY}px); filter: blur({$cardBlur}px);"
      >
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

    <!-- Cancel Subscription Confirmation Modal -->
    {#if showCancelConfirmModal}
      <Modal on:close={closeCancelConfirmModal}>
        <CancelSubscriptionConfirm
          {hubName}
          {currentPlan}
          {currentPrice}
          {currentBillingCycle}
          {nextBillingDate}
          isLoading={cancelInProgress}
          on:close={closeCancelConfirmModal}
          on:confirmCancel={confirmCancelSubscription}
        />
      </Modal>
    {/if}

    <!-- Cancel Subscription Success Modal -->
    {#if showCancelSuccessModal}
      <Modal on:close={closeCancelSuccessModal}>
        <CancelSubscriptionSuccess
          {hubName}
          {currentPlan}
          accessUntil={nextBillingDate}
          {hubId}
          on:close={closeCancelSuccessModal}
          on:confirmResubscribe={confirmResubscription}
        />
      </Modal>
    {/if}

    <!-- Resubscribe Modal -->
    {#if showResubscribeModal}
      <Modal on:close={closeResubscribeModal}>
        <ResubscribeModal
          {hubName}
          {currentPlan}
          {currentPrice}
          {currentBillingCycle}
          isLoading={resubscribeInProgress}
          on:close={closeResubscribeModal}
          on:confirmResubscribe={confirmResubscription}
        />
      </Modal>
    {/if}
  </section>
{/if}
