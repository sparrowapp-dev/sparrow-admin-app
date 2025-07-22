<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import Button from '@/ui/Button/Button.svelte';
  import Alert from '@/components/Alert/Alert.svelte';
  import CloseIcon from '@/assets/icons/CloseIcon.svelte';
    import { captureEvent } from '@/utils/posthogConfig';

  const dispatch = createEventDispatcher();

  export let hubName: string = '';
  export let currentPlan: string = '';
  export let currentPrice: string = '';
  export let currentBillingCycle: string = '';
  export let nextBillingDate: string = '';
  export let isLoading: boolean = false;

  let feedback = '';

  function handleCancel() {
    dispatch('close');
  }

  function handleConfirmCancellation() {
    captureCancelSubcription();
    dispatch('confirmCancel', { feedback });
  }

  // Calculate days left until next billing date
  function getDaysLeft(dateString: string): number {
    if (!dateString) return 0;
    const targetDate = new Date(dateString);
    const today = new Date();
    const timeDiff = targetDate.getTime() - today.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24));
  }

  $: daysLeft = getDaysLeft(nextBillingDate);

  
  const captureCancelSubcription = () =>{
    const eventProperties = {
      event_source:"admin_panel",
      plan:`${currentPlan}_${currentBillingCycle}`
    }
    captureEvent("admin_cancel_subscription", eventProperties);
  }
</script>

<div class="bg-surface-600 w-full rounded-lg p-6">
  <!-- Header -->
  <div class="mb-6 flex items-start justify-between">
    <h2 class="text-fs-ds-20 font-fw-ds-500 text-neutral-50">Cancel Subscription</h2>
    <button on:click={handleCancel} class="cursor-pointer text-neutral-400 hover:text-neutral-200">
      <CloseIcon />
    </button>
  </div>

  <!-- Hub and Plan Information -->
  <div class="mb-2 grid grid-cols-2 gap-4">
    <div class="flex flex-col justify-between">
      <span class="text-fs-ds-14 font-fw-ds-300 text-neutral-400">Hub Name</span>
      <span class="text-fs-ds-16 font-fw-ds-400 mt-1 text-neutral-50">{hubName}</span>
    </div>

    <div class="flex flex-col justify-between">
      <span class="text-fs-ds-14 font-fw-ds-300 text-neutral-400">Current Plan</span>
      <span class="text-fs-ds-16 font-fw-ds-400 mt-1 text-neutral-50">{currentPlan}</span>
    </div>

    {#if currentPrice}
      <div class="flex flex-col justify-between">
        <span class="text-fs-ds-14 font-fw-ds-300 text-neutral-400">Pricing</span>
        <span class="text-fs-ds-20 font-fw-ds-500 mt-1 text-neutral-50">
          {currentPrice}<span class="text-fs-ds-12 font-fw-ds-400 text-neutral-400"
            >/{currentBillingCycle === 'monthly' ? 'user/month' : 'user/year'}</span
          >
        </span>
      </div>
    {/if}
  </div>

  <!-- Confirmation Message -->
  <p class="text-fs-ds-12 font-fw-ds-300 mb-6 text-neutral-400">
    Are you sure you want to cancel your subscription? Your access to paid features will continue
    until the end of your current billing cycle.
  </p>

  <!-- Alert with cancellation details -->
  {#if nextBillingDate && daysLeft > 0}
    <div class="mb-6 shadow-lg">
      <Alert
        variant="error"
        showButton={false}
        type="v2"
        subtitle={`You're cancelling the ${currentPlan} plan for '<strong class='font-fw-ds-500'>${hubName}</strong>' Hub. Paid features stay active until <strong class='font-fw-ds-500'>${nextBillingDate}</strong> (${daysLeft} days left), after which your hub will move to the community plan.`}
      />
    </div>
  {/if}

  <!-- Action Buttons -->
  <div class="flex items-center justify-between">
    <a
      href="mailto:contactus@sparrowapp.dev"
      class="text-fs-ds-14 font-fw-ds-400 text-neutral-200 underline"
    >
      Contact Support
    </a>

    <div class="flex gap-3">
      <Button variant="filled-secondary" size="medium" on:click={handleCancel} disabled={isLoading}>
        Cancel
      </Button>

      <Button
        variant="filled-tertiary"
        size="medium"
        on:click={handleConfirmCancellation}
        disabled={isLoading}
      >
        {#if isLoading}
          Processing...
        {:else}
          Confirm Cancellation
        {/if}
      </Button>
    </div>
  </div>
</div>
