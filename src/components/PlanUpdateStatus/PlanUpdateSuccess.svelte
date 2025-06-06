<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import Button from '@/ui/Button/Button.svelte';
  import SelectIcon from '@/assets/icons/SelectIcon.svelte';
  import CloseIcon from '@/assets/icons/CloseIcon.svelte';
  import { navigate } from 'svelte-routing';

  const dispatch = createEventDispatcher<{
    close: void;
    goToDashboard: void;
  }>();

  // Props
  export let hubName: string = 'Techdome Hub';
  export let currentPlan: string = 'Standard';
  export let nextBillingDate: string = 'July 2, 2025';
  export let fromPlan: string = 'Standard';
  export let toPlan: string = 'Professional';

  function handleClose() {
    dispatch('close');
  }

  function handleGoToDashboard() {
    navigate('/hubs');
  }
</script>

<div class="bg-surface-600 max-w-xl rounded-lg p-7 text-white">
  <!-- Header with success -->
  <div class="mb-3 flex items-start justify-between">
    <div class="flex items-center gap-2">
      <div class="h-5 w-5">
        <SelectIcon />
      </div>
      <h2 class="text-fs-ds-20 font-inter font-fw-ds-500 text-neutral-50">Plan Updated</h2>
    </div>

    <button class="cursor-pointer" on:click={handleClose}>
      <CloseIcon />
    </button>
  </div>
  <p class="text-fs-ds-12 font-fw-ds-300 font-inter mt-2 mb-3 text-neutral-400">
    You've successfully switched from the {fromPlan} to the {toPlan} plan.
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
    <div class="col-span-2">
      <p class="text-fs-ds-12 font-inter font-fw-ds-400 text-neutral-400">Next billing date</p>
      <p class="text-fs-ds-16 font-inter font-fw-ds-500 text-neutral-50">{nextBillingDate}</p>
    </div>
  </div>

  <!-- Action button -->
  <div class="flex items-center justify-end">
    <Button variant="filled-primary" size="medium" on:click={handleGoToDashboard}
      >Go to Dashboard</Button
    >
  </div>
</div>
