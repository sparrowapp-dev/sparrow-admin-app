<script>
  import { createEventDispatcher } from 'svelte';
  import CloseIcon from '@/assets/icons/CloseIcon.svelte';
  import Tag from '@/ui/Tag/Tag.svelte';

  // Props
  export let hubId = null;
  export let hubName = 'Techdome Hub';
  export let currentPlan = 'Community';
  export let currentBillingCycle = 'monthly';
  export let subscriptionId = null;
  export let planDetails = {
    community: {
      monthly: {
        price: '$0.00',
        unit: '/user/month',
        privateHubs: 1,
        workspaces: 3,
        collections: 'Unlimited',
        collaborators: 5,

        buttonText: 'Pricing Plans',
      },
      annual: {
        price: '$0.00',
        unit: '/user/year',
        privateHubs: 1,
        workspaces: 3,
        collections: 'Unlimited',
        collaborators: 5,

        buttonText: 'Pricing Plans',
      },
    },
    standard: {
      monthly: {
        price: '$9.99',
        unit: '/user/month',
        privateHubs: 1,
        workspaces: 'Unlimited',
        collections: 'Unlimited',
        collaborators: 'Unlimited',

        buttonText: 'Upgrade',
        priceId: 'price_1RWA2cFLRwufXqZC8xD8DFFd',
      },
      annual: {
        price: '$99',
        unit: '/user/year',
        privateHubs: 3,
        workspaces: 'Unlimited',
        collections: 'Unlimited',
        collaborators: 'Unlimited',

        buttonText: 'Upgrade',
        discount: 'Save 17.4%',
        priceId: 'price_1RWA3dFLRwufXqZCZtH5Cag1',
      },
    },
    professional: {
      monthly: {
        price: '$19.99',
        unit: '/user/month',
        privateHubs: 1,
        workspaces: 'Unlimited',
        collections: 'Unlimited',
        collaborators: 'Unlimited',

        buttonText: 'Upgrade',
        priceId: 'price_1RWA36FLRwufXqZCI3ZHq47j',
      },
      annual: {
        price: '$199',
        unit: '/user/year',
        privateHubs: 10,
        workspaces: 'Unlimited',
        collections: 'Unlimited',
        collaborators: 'Unlimited',

        buttonText: 'Upgrade',
        discount: 'Save 17%',
        priceId: 'price_1RWA4LFLRwufXqZCpE56Ovl5',
      },
    },
    enterprise: {
      monthly: {
        price: '$49.99',
        unit: '/user/month',
        privateHubs: 'Unlimited',
        workspaces: 'Unlimited',
        collections: 'Unlimited',
        collaborators: 'Unlimited',

        buttonText: 'Contact Sales',
      },
      annual: {
        price: '$499',
        unit: '/user/year',
        privateHubs: 'Unlimited',
        workspaces: 'Unlimited',
        collections: 'Unlimited',
        collaborators: 'Unlimited',

        buttonText: 'Contact Sales',
        discount: 'Save 16.8%',
      },
    },
  };

  // State
  let billingCycle = currentBillingCycle || 'monthly'; // Initialize to current billing cycle
  let userCount = 1; // Default user count for calculation

  // Computed properties
  $: plans = ['community', 'standard', 'professional', 'enterprise'];
  $: currentPlanLower = currentPlan.toLowerCase();

  $: monthlyCosts = {
    community: 'Free',
    standard: `$${(parseFloat(planDetails.standard.monthly.price.replace('$', '')) * userCount).toFixed(2)}/month`,
    professional: `$${(parseFloat(planDetails.professional.monthly.price.replace('$', '')) * userCount).toFixed(2)}/month`,
    enterprise: `$${(parseFloat(planDetails.enterprise.monthly.price.replace('$', '')) * userCount).toFixed(2)}/month`,
  };

  $: annualCosts = {
    community: 'Free',
    standard: `$${(parseFloat(planDetails.standard.annual.price.replace('$', '')) * userCount).toFixed(2)}/year`,
    professional: `$${(parseFloat(planDetails.professional.annual.price.replace('$', '')) * userCount).toFixed(2)}/year`,
    enterprise: `$${(parseFloat(planDetails.enterprise.annual.price.replace('$', '')) * userCount).toFixed(2)}/year`,
  };

  // Event dispatcher
  const dispatch = createEventDispatcher();

  // Handle plan selection
  function selectPlan(plan) {
    if (plan === 'enterprise') {
      dispatch('contactSales');
    } else if (plan !== currentPlanLower) {
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

  // Check if a plan is selectable
  function isPlanSelectable(plan) {
    // Enterprise plan is always available for contact
    if (plan === 'enterprise') return true;

    // Cannot select the current plan
    if (plan === currentPlanLower) return false;

    // Cannot downgrade from Professional to Standard or Community
    if (currentPlanLower === 'professional' && (plan === 'standard' || plan === 'community')) {
      return false;
    }

    // Cannot downgrade from Standard to Community
    if (currentPlanLower === 'standard' && plan === 'community') {
      return false;
    }

    return true;
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
      <p class="text-fs-ds-16 font-inter font-fw-ds-400 text-neutral-50">{currentPlan}</p>
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
  <div class=" overflow-x-auto">
    <table class="w-full min-w-full">
      <thead class="border-surface-500 border-b">
        <tr>
          <th class="text-fs-ds-12 font-inter font-fw-ds-500 pb-7 text-left text-neutral-400">
            Feature
          </th>
          {#each plans as plan}
            <th class="text-fs-ds-12 font-inter font-fw-ds-500 py-3 text-left text-neutral-400">
              {plan.charAt(0).toUpperCase() + plan.slice(1)} Plan

              <!-- Show Current Plan or discount badge -->
              {#if plan === currentPlanLower}
                <div class="mt-1">
                  <Tag
                    text="Current Plan"
                    bgColor="bg-green-900"
                    textColor="text-green-300"
                    borderColor="border-green-700"
                    size="xs"
                  />
                </div>

                <!-- Use Tag component for discount badges -->
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
            <td class="py-3"
              >{#if plan === currentPlanLower}
                <span class="text-fs-ds-12 font-inter font-fw-ds-400 text-neutral-500">
                  Your plan
                </span>
              {:else if plan === 'enterprise'}
                <button
                  class="text-fs-ds-12 font-inter font-fw-ds-400 cursor-pointer text-blue-400 underline disabled:cursor-not-allowed"
                  on:click={() => selectPlan(plan)}
                  disabled={!isPlanSelectable(plan)}
                >
                  Contact Sales
                </button>
              {:else}
                <button
                  class="text-fs-ds-12 font-inter font-fw-ds-400 cursor-pointer text-blue-400 underline disabled:cursor-not-allowed"
                  on:click={() => selectPlan(plan)}
                  disabled={!isPlanSelectable(plan)}
                >
                  Upgrade
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
