<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import Button from '@/ui/Button/Button.svelte';
  import CloseIcon from '@/assets/icons/CloseIcon.svelte';
  import CloseIconV2 from '@/assets/icons/CloseIconV2.svelte';

  const dispatch = createEventDispatcher<{
    close: void;
    fixPayment: void;
  }>();

  // Props
  export let hubName: string = '';
  export let currentPlan: string = '';
  export let nextBillingDate: string = '';
  export let fromPlan: string = '';
  export let toPlan: string = '';

  function handleClose() {
    dispatch('close');
  }

  function handleFixPayment() {
    dispatch('fixPayment');
  }
</script>

<div class="bg-surface-600 max-w-xl rounded-lg p-7 text-white">
  <!-- Header with error -->
  <div class="mb-3 flex items-start justify-between">
    <div class="flex items-center gap-2">
      <CloseIconV2 />

      <h2 class="text-fs-ds-20 font-inter font-fw-ds-500 text-neutral-50">Plan Upgrade Failed</h2>
    </div>

    <button class="cursor-pointer" on:click={handleClose}>
      <CloseIcon />
    </button>
  </div>
  <p class="text-fs-ds-12 font-fw-ds-300 font-inter mt-2 mb-3 text-neutral-400">
    We couldn’t switch your plan from {fromPlan} to {toPlan} due to a payment issue. Please check your
    payment method and try again. If the problem continues, contact
    <a href="mailto:contactus@sparrowapp.dev" class="text-blue-400 hover:underline"
      >Sparrow Support</a
    >.
  </p>

  <!-- Plan details -->
  <div class="mb-6 grid grid-cols-2 gap-y-4">
    <div>
      <p class="text-fs-ds-12 font-inter font-fw-ds-400 text-neutral-400">Hub Name</p>
      <p class="text-fs-ds-16 font-inter font-fw-ds-500 text-neutral-50">{hubName}</p>
    </div>
    <div>
      <p class="text-fs-ds-12 font-inter font-fw-ds-400 text-neutral-400">Current Plan</p>
      <p class="text-fs-ds-16 font-inter font-fw-ds-500 text-neutral-50">{currentPlan}</p>
    </div>
  </div>

  <!-- Action button -->
  <div class="flex items-center justify-end">
    <Button variant="filled-primary" size="medium" on:click={handleFixPayment}
      >Fix Payment Method</Button
    >
  </div>
</div>
