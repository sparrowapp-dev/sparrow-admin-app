<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import Button from '@/ui/Button/Button.svelte';
  import CloseIconV2 from '@/assets/icons/CloseIconV2.svelte';

  const dispatch = createEventDispatcher<{
    close: void;
    fixPayment: void;
  }>();

  // Props
  export let hubName: string = 'Techdome Hub';
  export let currentPlan: string = 'Standard';
  export let accessUntil: string = 'June 30, 2025';
  export let nextBillingDate: string = 'July 2, 2025';

  function handleClose() {
    dispatch('close');
  }

  function handleFixPayment() {
    dispatch('fixPayment');
  }
</script>

<div class="bg-surface-900 max-w-xl rounded-lg border border-red-500 p-6 text-white">
  <!-- Header with error -->
  <div class="mb-6 flex items-start justify-between">
    <div class="flex items-start gap-3">
      <div class="rounded-full bg-red-900 p-1">
        <CloseIconV2 />
      </div>
      <div>
        <h2 class="text-fs-ds-18 font-inter font-fw-ds-500 text-neutral-50">Plan Update Failed</h2>
        <p class="text-fs-ds-14 font-fw-ds-300 font-inter mt-2 text-neutral-400">
          We couldn't switch your plan from Standard to Professional due to a payment issue. Please
          check your payment method and try again. If the problem continues, contact
          <a href="#" class="text-blue-400 hover:underline">Sparrow Support</a>.
        </p>
      </div>
    </div>
    <button class="cursor-pointer" on:click={handleClose}>
      <CloseIconV2 />
    </button>
  </div>

  <!-- Plan details -->
  <div class="mb-6 grid grid-cols-2 gap-y-4">
    <div>
      <p class="text-fs-ds-12 font-inter font-fw-ds-400 text-neutral-400">Hub Name</p>
      <p class="text-fs-ds-14 font-inter font-fw-ds-500 text-neutral-50">{hubName}</p>
    </div>
    <div>
      <p class="text-fs-ds-12 font-inter font-fw-ds-400 text-neutral-400">Current Plan</p>
      <p class="text-fs-ds-14 font-inter font-fw-ds-500 text-neutral-50">{currentPlan}</p>
    </div>
    <div>
      <p class="text-fs-ds-12 font-inter font-fw-ds-400 text-neutral-400">Access remains until</p>
      <p class="text-fs-ds-14 font-inter font-fw-ds-500 text-neutral-50">{accessUntil}</p>
    </div>
    <div>
      <p class="text-fs-ds-12 font-inter font-fw-ds-400 text-neutral-400">Next billing date</p>
      <p class="text-fs-ds-14 font-inter font-fw-ds-500 text-neutral-50">{nextBillingDate}</p>
    </div>
  </div>

  <!-- Action button -->
  <div class="flex justify-center">
    <Button variant="filled-primary" on:click={handleFixPayment}>Fix Payment Method</Button>
  </div>
</div>
