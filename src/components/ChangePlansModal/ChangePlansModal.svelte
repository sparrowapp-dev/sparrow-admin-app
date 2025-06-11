<script>
  import { createEventDispatcher } from 'svelte';
  import CloseIcon from '@/assets/icons/CloseIcon.svelte';
  import Tag from '@/ui/Tag/Tag.svelte';
  import {
    DEFAULT_PLAN_DETAILS,
    AVAILABLE_PLANS,
    isPlanSelectable as checkPlanSelectable,
    capitalizeFirstLetter,
    getPlanId,
  } from '@/utils/pricing';

  // Props
  export let hubId = null;
  export let hubName = 'Techdome Hub';
  export let currentPlan = 'Community';
  export let currentBillingCycle = 'monthly';
  export let subscriptionId = null;
  export let planDetails = DEFAULT_PLAN_DETAILS;

  // State
  let billingCycle = currentBillingCycle || 'monthly'; // Initialize to current billing cycle
  let userCount = 1; // Default user count for calculation

  // Computed properties
  $: plans = AVAILABLE_PLANS;
  $: currentPlanLower = currentPlan.toLowerCase();
  $: currentPlanId = getPlanId(currentPlanLower, currentBillingCycle);

  // Event dispatcher
  const dispatch = createEventDispatcher();

  // Handle plan selection
  function selectPlan(plan) {
    if (plan === 'enterprise') {
      dispatch('contactSales');
    } else {
      const targetPlanId = getPlanId(plan, billingCycle);

      // Don't allow selecting the current plan
      if (targetPlanId !== currentPlanId) {
        dispatch('selectPlan', {
          plan,
          billingCycle,
          price:
            billingCycle === 'monthly'
              ? planDetails[plan].monthly.price
              : planDetails[plan].annual.price,
          priceId:
            billingCycle === 'monthly'
              ? planDetails[plan].monthly.priceId
              : planDetails[plan].annual.priceId,
        });
      }
    }
  }

  // Check if a plan is selectable based on current plan and billing cycle
  function isPlanSelectable(plan) {
    return checkPlanSelectable(currentPlanLower, plan, billingCycle, currentBillingCycle);
  }

  // Get button text for a plan
  function getButtonText(plan) {
    const isCurrentPlan = plan === currentPlanLower && billingCycle === currentBillingCycle;

    if (isCurrentPlan) {
      return 'Your plan';
    }

    if (plan === 'enterprise') {
      return 'Contact Sales';
    }

    // Special case for monthly -> annual upgrade of same plan
    if (
      plan === currentPlanLower &&
      billingCycle === 'annual' &&
      currentBillingCycle === 'monthly'
    ) {
      return 'Upgrade';
    }

    // For downgrades
    if (
      (currentPlanLower === 'professional' && plan === 'standard' && billingCycle === 'annual') ||
      (currentPlanLower === 'standard' && plan === 'community')
    ) {
      return 'Downgrade';
    }

    return 'Upgrade';
  }

  // Close modal
  function handleClose() {
    dispatch('close');
  }
</script>

<div class="bg-surface-600 rounded-lg p-6 text-white">
  <div class="mb-6 flex items-start justify-between">
    <div>
      <h2 class="text-fs-ds-20 font-inter font-fw-ds-500 text-neutral-50">Change Your Plan</h2>
      <p class="text-fs-ds-14 font-fw-ds-300 font-inter mt-2 text-neutral-400">
        Select a different plan that fits your needs. Your current plan is highlighted below. The
        new plan will take effect immediately or at the start of your next billing cycle depending
        on your billing terms.
      </p>
    </div>
    <button class="cursor-pointer" on:click={handleClose}>
      <CloseIcon />
    </button>
  </div>

  <!-- Hub info -->
  <div class="mb-6 grid grid-cols-2">
    <div>
      <p class="text-fs-ds-12 font-inter font-fw-ds-400 text-neutral-400">Hub Name</p>
      <p class="text-fs-ds-16 font-inter font-fw-ds-400 text-neutral-50">{hubName}</p>
    </div>
    <div>
      <p class="text-fs-ds-12 font-inter font-fw-ds-400 text-neutral-400">Current Plan</p>
      <p class="text-fs-ds-16 font-inter font-fw-ds-400 text-neutral-50">
        {currentPlan} ({currentBillingCycle})
      </p>
    </div>
  </div>

  <!-- Billing toggle -->
  <div class="mb-6">
    <div class="bg-surface-700 flex w-full rounded-md">
      <button
        class={`text-fs-ds-12 flex-1 rounded-md py-3 ${billingCycle === 'monthly' ? 'bg-surface-400 text-neutral-50' : 'text-neutral-300'}`}
        on:click={() => (billingCycle = 'monthly')}
      >
        Monthly Billing
      </button>
      <button
        class={`text-fs-ds-12 flex-1 rounded-md py-3 ${billingCycle === 'annual' ? 'bg-surface-400 text-neutral-50' : 'text-neutral-300'}`}
        on:click={() => (billingCycle = 'annual')}
      >
        Annual Billing
      </button>
    </div>
  </div>

  <!-- Plan comparison table -->
  <div class="overflow-x-auto">
    <table class="w-full min-w-full">
      <thead class="border-surface-500 border-b">
        <tr>
          <th class="text-fs-ds-12 font-inter font-fw-ds-500 pb-7 text-left text-neutral-400">
            Feature
          </th>
          {#each plans as plan}
            <th class="text-fs-ds-12 font-inter font-fw-ds-500 py-3 text-left text-neutral-400">
              {capitalizeFirstLetter(plan)} Plan

              <!-- Show Current Plan or discount badge -->
              {#if plan === currentPlanLower && billingCycle === currentBillingCycle}
                <div class="mt-1">
                  <Tag
                    text="Current Plan"
                    bgColor="bg-green-900"
                    textColor="text-green-300"
                    borderColor="border-green-700"
                    size="xs"
                  />
                </div>
              {:else if planDetails[plan][billingCycle].discount}
                <div class="mt-1">
                  <Tag
                    text={planDetails[plan][billingCycle].discount}
                    bgColor="bg-cyan-900"
                    textColor="text-cyan-300"
                    borderColor="border-cyan-700"
                    size="xs"
                  />
                </div>
              {:else}
                <div class="mt-7"></div>
              {/if}
            </th>
          {/each}
        </tr>
      </thead>
      <tbody>
        <tr class="border-surface-700 border-b">
          <td class="text-fs-ds-12 font-inter font-fw-ds-400 py-3 text-neutral-50">Pricing</td>
          {#each plans as plan}
            <td class="py-3">
              <div class="text-fs-ds-14 font-inter font-fw-ds-500 text-neutral-50">
                {planDetails[plan][billingCycle].price}
                <span class="text-fs-ds-12 font-fw-ds-400 text-neutral-300"
                  >{planDetails[plan][billingCycle].unit}</span
                >
              </div>
            </td>
          {/each}
        </tr>
        <tr class="border-surface-700 border-b">
          <td class="text-fs-ds-12 font-inter font-fw-ds-400 py-3 text-neutral-50">Private Hubs</td>
          {#each plans as plan}
            <td class="text-fs-ds-12 font-inter font-fw-ds-400 py-3 text-neutral-50">
              {planDetails[plan][billingCycle].privateHubs}
            </td>
          {/each}
        </tr>
        <tr class="border-surface-700 border-b">
          <td class="text-fs-ds-12 font-inter font-fw-ds-400 py-3 text-neutral-50">Workspaces</td>
          {#each plans as plan}
            <td class="text-fs-ds-12 font-inter font-fw-ds-400 py-3 text-neutral-50">
              {planDetails[plan][billingCycle].workspaces}
            </td>
          {/each}
        </tr>
        <tr class="border-surface-700 border-b">
          <td class="text-fs-ds-12 font-inter font-fw-ds-400 py-3 text-neutral-50">Collections</td>
          {#each plans as plan}
            <td class="text-fs-ds-12 font-inter font-fw-ds-400 py-3 text-neutral-50">
              {planDetails[plan][billingCycle].collections}
            </td>
          {/each}
        </tr>
        <tr class="border-surface-700 border-b">
          <td class="text-fs-ds-12 font-inter font-fw-ds-400 py-3 text-neutral-50">Collaborators</td
          >
          {#each plans as plan}
            <td class="text-fs-ds-12 font-inter font-fw-ds-400 py-3 text-neutral-50">
              {planDetails[plan][billingCycle].collaborators}
            </td>
          {/each}
        </tr>

        <tr>
          <td>
            <button
              class="text-fs-ds-12 font-inter font-fw-ds-400 cursor-pointer text-blue-400 underline disabled:cursor-not-allowed"
            >
              Pricing Plans
            </button>
          </td>
          {#each plans as plan}
            <td class="py-3">
              {#if plan === currentPlanLower && billingCycle === currentBillingCycle}
                <!-- Current plan with same billing cycle -->
                <span class="text-fs-ds-12 font-inter font-fw-ds-400 text-neutral-500">
                  Your plan
                </span>
              {:else if plan === 'enterprise'}
                <!-- Enterprise plan always shows Contact Sales -->
                <button
                  class="text-fs-ds-12 font-inter font-fw-ds-400 cursor-pointer text-blue-400 underline disabled:cursor-not-allowed"
                  on:click={() => selectPlan(plan)}
                  disabled={!isPlanSelectable(plan)}
                >
                  Contact Sales
                </button>
              {:else}
                <!-- All other plans -->
                <button
                  class="text-fs-ds-12 font-inter font-fw-ds-400 cursor-pointer text-blue-400 underline disabled:cursor-not-allowed"
                  on:click={() => selectPlan(plan)}
                  disabled={!isPlanSelectable(plan)}
                >
                  {getButtonText(plan)}
                </button>
              {/if}
            </td>
          {/each}
        </tr>
      </tbody>
    </table>

    <!-- Cost estimate -->
    <p class="text-fs-ds-14 font-inter font-fw-ds-300 text-neutral-400">
      With {userCount} users in your hub, your final cost will be calculated based on the selected plan.
      A full breakdown will be shown at checkout. Please contact sales for more information
    </p>
  </div>
</div>
