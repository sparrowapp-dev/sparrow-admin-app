<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import Button from '@/ui/Button/Button.svelte';
  import CloseIcon from '@/assets/icons/CloseIcon.svelte';

  const dispatch = createEventDispatcher();

  export let hubName: string = '';
  export let currentPlan: string = '';
  export let currentPrice: string = '';
  export let currentBillingCycle: string = '';
  export let isLoading: boolean = false;

  function handleCancel() {
    dispatch('close');
  }

  function handleConfirmResubscribe() {
    dispatch('confirmResubscribe');
  }
</script>

<div class="bg-surface-600 w-full rounded-lg p-6">
  <!-- Header -->
  <div class="mb-6 flex items-start justify-between">
    <h2 class="text-fs-ds-20 font-fw-ds-500 text-neutral-50">Resubscribe to {currentPlan} Plan</h2>
    <button on:click={handleCancel} class="cursor-pointer text-neutral-400 hover:text-neutral-200">
      <CloseIcon />
    </button>
  </div>

  <!-- Hub and Plan Information -->
  <div class="mb-6 grid grid-cols-2 gap-4">
    <div class="flex flex-col justify-between">
      <span class="text-fs-ds-14 font-fw-ds-300 text-neutral-400">Hub Name</span>
      <span class="text-fs-ds-16 font-fw-ds-400 mt-1 text-neutral-50">{hubName}</span>
    </div>

    <div class="flex flex-col justify-between">
      <span class="text-fs-ds-14 font-fw-ds-300 text-neutral-400">Current Plan</span>
      <span class="text-fs-ds-16 font-fw-ds-400 mt-1 text-neutral-50">{currentPlan}</span>
    </div>
  </div>

  <!-- Pricing -->
  {#if currentPrice}
    <div class="mb-6">
      <span class="text-fs-ds-14 font-fw-ds-300 text-neutral-400">Pricing</span>
      <div class="text-fs-ds-20 font-fw-ds-500 mt-1 text-neutral-50">
        {currentPrice}<span class="text-fs-ds-12 font-fw-ds-400 text-neutral-400">
          /{currentBillingCycle === 'monthly' ? 'user/month' : 'user/year'}
        </span>
      </div>
    </div>
  {/if}

  <!-- Resubscribe Message -->
  <p class="text-fs-ds-12 font-fw-ds-300 mb-6 text-neutral-400">
    You'll regain access to the features of this plan. Billing will resume immediately.
  </p>

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
        variant="filled-primary"
        size="medium"
        on:click={handleConfirmResubscribe}
        disabled={isLoading}
      >
        {#if isLoading}
          Processing...
        {:else}
          Resubscribe
        {/if}
      </Button>
    </div>
  </div>
</div>
