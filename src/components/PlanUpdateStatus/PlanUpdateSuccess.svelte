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
  export let hubName: string = '';
  export let currentPlan: string = '';
  export let nextBillingDate: string = '';
  export let fromPlan: string = '';
  export let toPlan: string = '';
  export let PlanUpdateTitle: string = '';
  export let description: string = '';
  export let isUpgrade: boolean = false;
  export let buttonText: string = '';

  function handleClose() {
    dispatch('close');
  }

  function handleGoToDashboard() {
    navigate('/hubs');
  }

  $: formattedBillingDate = nextBillingDate
    ? new Date(nextBillingDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '';
</script>

<div class="bg-surface-600 max-w-xl rounded-lg p-7 text-white">
  <!-- Header with success -->
  <div class="mb-3 flex items-start justify-between">
    <div class="flex items-center gap-2">
      {#if isUpgrade}
        <div class="h-5 w-5">
          <SelectIcon />
        </div>
      {/if}
      <h2 class="text-fs-ds-20 font-inter font-fw-ds-500 text-neutral-50">{PlanUpdateTitle}</h2>
    </div>

    <button class="cursor-pointer" on:click={handleClose}>
      <CloseIcon />
    </button>
  </div>
  {#if isUpgrade}
    <p class="text-fs-ds-12 font-fw-ds-300 font-inter mt-2 mb-3 text-neutral-400">
      You've successfully switched from the {fromPlan} to the {toPlan} plan.
    </p>
  {/if}

  <!-- Plan details -->
  <div class="mb-6 grid grid-cols-2 gap-y-4">
    <div>
      <p class="text-fs-ds-12 font-inter font-fw-ds-400 text-neutral-400">Hub Name</p>
      <p class="text-fs-ds-16 font-inter font-fw-ds-500 max-w-[10rem] truncate text-neutral-50">
        {hubName}
      </p>
    </div>
    <div>
      <p class="text-fs-ds-12 font-inter font-fw-ds-400 text-neutral-400">Current Plan</p>
      <p class="text-fs-ds-16 font-inter font-fw-ds-500 text-neutral-50">{currentPlan}</p>
    </div>
    <div class="col-span-2">
      <p class="text-fs-ds-12 font-inter font-fw-ds-400 text-neutral-400">Next billing date</p>
      <p class="text-fs-ds-16 font-inter font-fw-ds-500 text-neutral-50">{formattedBillingDate}</p>
    </div>
  </div>

  {#if description}
    <p class="text-fs-ds-12 font-inter font-fw-ds-400 text-neutral-300 mb-4">
      {description}
    </p>
  {/if}

  <!-- Action button -->
  <div class="flex items-center justify-end">
    <Button variant="filled-primary" size="medium" on:click={handleGoToDashboard}>
      {buttonText}
    </Button>
  </div>
</div>