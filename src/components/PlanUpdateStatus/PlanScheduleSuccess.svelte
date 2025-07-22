<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import Button from '@/ui/Button/Button.svelte';
  import CloseIcon from '@/assets/icons/CloseIcon.svelte';
  import { navigate } from 'svelte-routing';
  import { captureEvent } from '@/utils/posthogConfig';

  const dispatch = createEventDispatcher<{
    close: void;
  }>();

  // Props
  export let hubName: string = '';
  export let currentPlan: string = '';
  export let nextBillingDate: string = '';
  export let fromPlan: string = '';
  export let toPlan: string = '';
  export let hubId: string = '';

  function handleClose() {
    captureUserPlanDowngradeClick(fromPlan,toPlan);
    dispatch('close');
  }

  function handleGoToHub() {
    captureUserPlanDowngradeClick(fromPlan,toPlan);
    navigate(`/hubs/workspace/${hubId}`);
  }

  $: formattedBillingDate = nextBillingDate
    ? new Date(nextBillingDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '';

    const captureUserPlanDowngradeClick = (currentPlan:string, downgradePlan:string) =>{
      const eventProperties = {
        current_plan:currentPlan,
        downgrade_plan:downgradePlan,
      }
      captureEvent("admin_plan_downgrade_success",eventProperties);
    }
</script>

<div class="bg-surface-600 max-w-xl rounded-lg p-7 text-white">
  <!-- Header with success -->
  <div class="mb-3 flex items-start justify-between">
    <div class="flex items-center gap-2">
      <h2 class="text-fs-ds-20 font-inter font-fw-ds-500 text-neutral-50">
        We’re sorry to see you downgrade plan
      </h2>
    </div>

    <button class="cursor-pointer" on:click={handleClose}>
      <CloseIcon />
    </button>
  </div>
  <p class="text-fs-ds-12 font-fw-ds-300 font-inter mt-2 mb-3 text-neutral-400">
    Your plan will be downgraded to the {toPlan} Plan after your current billing cycle ends. You’ll continue
    to enjoy {currentPlan} Plan features until then. After the downgrade, you’ll still have access to
    essential features, and you can upgrade again anytime if your needs grow.
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
      <p class="text-fs-ds-12 font-inter font-fw-ds-400 text-neutral-400">Effective From</p>
      <p class="text-fs-ds-16 font-inter font-fw-ds-500 text-neutral-50">{formattedBillingDate}</p>
    </div>
  </div>

  <!-- Action button -->
  <div class="flex items-center justify-end">
    <Button variant="filled-primary" size="medium" on:click={handleGoToHub}>Go to Hub</Button>
  </div>
</div>
