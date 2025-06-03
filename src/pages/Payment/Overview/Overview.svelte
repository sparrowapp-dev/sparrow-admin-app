<script>
  import CrownIcon from '@/assets/icons/CrownIcon.svelte';
  import Button from '@/ui/Button/Button.svelte';
  import Modal from '@/components/Modal/Modal.svelte';
  import ChangePlansModal from '@/components/ChangePlansModal/ChangePlansModal.svelte';
  import { useLocation } from 'svelte-routing';

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
  let currentPlan = 'Standard';
  let hubName = 'Techdome Hub';

  // Handle upgrade button click
  function handleUpgradeClick() {
    showChangePlanModal = true;
  }

  // Handle plan selection from the modal
  function handlePlanSelected(event) {
    const { plan, billingCycle, price } = event.detail;
    console.log(`Selected plan: ${plan}, Billing: ${billingCycle}, Price: ${price}`);
    // Here you would implement your plan change logic

    // For demo purposes, let's update the current plan
    currentPlan = plan.charAt(0).toUpperCase() + plan.slice(1);

    // Close the modal
    showChangePlanModal = false;
  }

  // Handle contact sales
  function handleContactSales() {
    showChangePlanModal = false;
    // Implement contact sales logic
    console.log('Contacting sales team for Enterprise plan');
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
            <p class="text-fs-ds-16 font-inter font-fw-ds-400 text-neutral-50">{currentPlan}</p>
            <p class="text-fs-ds-20 font-inter font-fw-ds-500 text-neutral-50">
              $9.99<span class="text-fs-ds-12 font-fw-ds-400 text-neutral-200">/user/month</span>
            </p>
          </div>
          <button
            class="text-fs-ds-12 font-inter font-fw-ds-400 text-neutral-200 underline transition-colors hover:text-blue-300"
          >
            Cancel Subscription
          </button>
        </div>
        <div class="pt-0">
          <div class="flex flex-col gap-2">
            <p class="text-fs-ds-12 font-inter font-fw-ds-400 text-neutral-200">
              Next billing date: December 2, 2025
            </p>
            <p class="text-fs-ds-12 font-inter font-fw-ds-400 text-neutral-200">
              Last paid amount: $0.00/user/month
            </p>
            <p class="text-fs-ds-12 font-inter font-fw-ds-400 text-neutral-200">
              Total paid amount: $0.00
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
              href="/invoice-history"
              class="text-fs-ds-14 font-inter font-fw-ds-400 flex items-center gap-2 text-blue-300 hover:text-blue-400"
            >
              View Invoice History
            </a>
          </li>
          <li>
            <a
              href="/payment-information"
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
    <Modal width="max-w-screen-md" on:close={() => (showChangePlanModal = false)}>
      <ChangePlansModal
        {hubId}
        {hubName}
        {currentPlan}
        on:close={() => (showChangePlanModal = false)}
        on:selectPlan={handlePlanSelected}
        on:contactSales={handleContactSales}
      />
    </Modal>
  {/if}
</section>
