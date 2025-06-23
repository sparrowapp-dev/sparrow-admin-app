<script lang="ts">
  // Svelte
  import { navigate, useLocation } from 'svelte-routing';

  // Components
  import Breadcrumbs from '@/components/Breadcrumbs/Breadcrumbs.svelte';
  import Tag from '@/ui/Tag/Tag.svelte';
  import Button from '@/ui/Button/Button.svelte';

  // Services
  import { hubsService } from '@/services/hubs.service';
  import { createQuery } from '@/services/api.common';

  // Icons
  import CheckIcon from '@/assets/icons/Check.svelte';

  // Utils
  import {
    DEFAULT_PLAN_DETAILS,
    AVAILABLE_PLANS,
    isPlanSelectable as checkPlanSelectable,
    capitalizeFirstLetter,
    getPlanId,
    isDowngrade,
    type BillingCycleType,
  } from '@/utils/pricing';

  const location = useLocation();

  // Extract URL parameters
  let hubId: string = '';
  let currentPlan: string = 'Community';
  let currentBillingCycle: BillingCycleType = 'monthly';
  let subscriptionId: string = '';
  let subscriptionStatus: string = '';
  let userCount: number = 1;

  // URL parsing
  $: {
    const url = $location?.pathname || '';
    // Extract hubId
    const hubMatches = url.match(/\/([a-f0-9]{24})/i);
    if (hubMatches && hubMatches[1]) {
      hubId = hubMatches[1];
    }

    // Extract query parameters from URL search params
    const searchParams = new URLSearchParams($location?.search || '');
    currentPlan = searchParams.get('currentPlan') || 'Community';
    const billingCycleParam = searchParams.get('currentBillingCycle') || 'monthly';
    currentBillingCycle = (
      billingCycleParam === 'annual' ? 'annual' : 'monthly'
    ) as BillingCycleType;
    subscriptionId = searchParams.get('subscriptionId') || '';
    subscriptionStatus = searchParams.get('status') || '';
  }

  // Fetch hub details
  const { data: hubDetails } = createQuery(() => hubsService.getHubDetails(hubId));

  $: if ($hubDetails?.data) {
    userCount = $hubDetails.data.users?.length || 1;
  }

  // Plan details for comparison
  let planDetails = DEFAULT_PLAN_DETAILS;

  // State
  let billingCycle: BillingCycleType = currentBillingCycle;

  // Computed properties
  $: plans = AVAILABLE_PLANS;
  $: currentPlanLower = currentPlan.toLowerCase();
  $: currentPlanId = getPlanId(currentPlanLower, currentBillingCycle);

  // Helper function to get plan value
  function getPlanValue(planName: string, cycle: string): number {
    if (planName === 'community') return 0;
    if (planName === 'standard' && cycle === 'monthly') return 1;
    if (planName === 'professional' && cycle === 'monthly') return 2;
    if (planName === 'standard' && cycle === 'annual') return 3;
    if (planName === 'professional' && cycle === 'annual') return 4;
    if (planName === 'enterprise') return 5;
    return 0;
  }

  // Handle plan selection
  function selectPlan(plan) {
    if (plan === 'enterprise') {
      // Open contact form in a new tab
      window.open('mailto:contactus@sparrowapp.dev', '_blank');
    } else {
      const targetPlanId = getPlanId(plan, billingCycle);

      // Don't allow selecting the current plan
      if (targetPlanId !== currentPlanId) {
        // Get the price ID based on billing cycle
        const priceId =
          billingCycle === 'monthly'
            ? planDetails[plan].monthly.priceId
            : planDetails[plan].annual.priceId;

        // Determine if this is a downgrade
        const isDowngradeChange = isDowngrade(
          currentPlanLower,
          plan,
          currentBillingCycle,
          billingCycle,
        );

        // Navigate to payment method selection page
        const searchParams = new URLSearchParams({
          plan: capitalizeFirstLetter(plan),
          billingCycle: billingCycle,
          priceId: priceId || '',
          userCount: userCount.toString(),
          subscriptionId: subscriptionId || '',
          currentPlan: currentPlan,
          status: subscriptionStatus || '',
          isDowngrade: isDowngradeChange.toString(),
        });

        navigate(
          `/billing/billingInformation/selectPaymentMethod/${hubId}?${searchParams.toString()}`,
        );
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

    const currentPlanValue = getPlanValue(currentPlanLower, currentBillingCycle);
    const targetPlanValue = getPlanValue(plan, billingCycle);

    // Log the comparison details
    if (targetPlanValue > currentPlanValue) {
      return 'Upgrade';
    } else if (targetPlanValue < currentPlanValue) {
      return 'Downgrade';
    } else {
      return 'Your plan';
    }
  }

  // Prepare breadcrumb navigation
  $: breadcrumbItems = [
    { label: 'Billing', path: `/billing/billingOverview/${hubId}` },
    { label: 'Change Plan', path: '' },
  ];

  // Make plan values reactive
  $: planValues = plans.map((plan) => ({
    plan,
    planName: capitalizeFirstLetter(plan),
    isCurrentPlan: plan === currentPlanLower && billingCycle === currentBillingCycle,
    planPrice: planDetails[plan][billingCycle].price,
    planUnit: planDetails[plan][billingCycle].unit,
    buttonText: getButtonText(plan),
    hasDiscount: planDetails[plan][billingCycle].discount,
    discount: planDetails[plan][billingCycle].discount,
  }));
</script>

<div class="max-w-[1200px]">
  <Breadcrumbs items={breadcrumbItems} />

  <div class="mt-6">
    <h1 class="text-fs-ds-20 font-inter font-fw-ds-500 text-white">Upgrade Plan</h1>
    <p class="text-fs-ds-14 font-inter font-fw-ds-300 text-neutral-400">
      You're ready for the next level. Upgrade to access more and features. You can switch plans at
      any time.
    </p>

    <div class="mt-6">
      <!-- Billing toggle -->
      <div class="mb-6 flex">
        <div class="border-surface-100 flex w-[350px] rounded-md border">
          <button
            class={`text-fs-ds-12 font-inter font-fw-ds-400 m-1 flex-1 cursor-pointer rounded-md py-1.5 ${billingCycle === 'monthly' ? 'bg-surface-600 text-white' : 'bg-transparent text-neutral-300'}`}
            on:click={() => (billingCycle = 'monthly')}
          >
            Monthly billing
          </button>
          <button
            class={`text-fs-ds-12 font-inter font-fw-ds-400 m-1 flex-1 cursor-pointer rounded-md py-1.5 ${billingCycle === 'annual' ? 'bg-surface-600 text-white' : 'bg-transparent text-neutral-300'}`}
            on:click={() => (billingCycle = 'annual')}
          >
            Annual billing
          </button>
        </div>
      </div>

      <!-- Plan Cards Grid -->
      <div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {#each planValues as { plan, planName, isCurrentPlan, planPrice, planUnit, buttonText, hasDiscount, discount }}
          <div
            class={`hover:bg-surface-600 hover:border-surface-50 overflow-hidden rounded-[10px] hover:border-1 ${isCurrentPlan ? 'border-1 border-neutral-50' : 'border-surface-500 border-2'}`}
          >
            <!-- Plan Header -->
            <div class="p-6">
              <div class="flex flex-col">
                <div class="mb-4 flex items-center space-x-2">
                  <h3 class="text-fs-ds-20 font-inter font-fw-ds-500 text-white">{planName}</h3>
                  {#if isCurrentPlan}
                    <Tag
                      text="Current"
                      bgColor="bg-green-900"
                      textColor="text-green-300"
                      borderColor="border-green-700"
                      size="xs"
                    />
                  {/if}
                  {#if hasDiscount && !isCurrentPlan}
                    <Tag
                      text={discount}
                      bgColor="bg-cyan-900"
                      textColor="text-cyan-300"
                      borderColor="border-cyan-700"
                      size="xs"
                    />
                  {/if}
                </div>

                <!-- Plan Price -->
                <div class="mb-4">
                  <span class="text-fs-ds-16 font-inter font-fw-ds-400 text-white">{planPrice}</span
                  >
                  <span class="text-fs-ds-12 font-inter font-fw-ds-400 text-neutral-200"
                    >{planUnit}</span
                  >
                </div>

                <!-- Action Button -->
                <div>
                  {#if isCurrentPlan}
                    <Button variant="filled-primary-white">Your Plan</Button>
                  {:else if plan === 'enterprise'}
                    <Button
                      variant="filled-primary"
                      on:click={() => selectPlan(plan)}
                      disabled={!isPlanSelectable(plan)}
                    >
                      Contact Sales
                    </Button>
                  {:else}
                    <Button
                      variant="filled-primary"
                      on:click={() => selectPlan(plan)}
                      disabled={plan === 'community' || buttonText === 'Downgrade'}
                    >
                      {buttonText}
                    </Button>
                  {/if}
                </div>
              </div>
            </div>

            <!-- Plan Features -->
            <div class=" px-6">
              <ul class="space-y-3">
                <li
                  class="text-fs-ds-14 font-inter font-fw-ds-300 flex items-center text-neutral-200"
                >
                  <div class="mr-2">
                    <CheckIcon width="20" height="20" color="#33CC7A" />
                  </div>
                  {#if typeof planDetails[plan][billingCycle].collaborators === 'string'}
                    {planDetails[plan][billingCycle].collaborators} collaborators
                  {:else}
                    Up to {planDetails[plan][billingCycle].collaborators} collaborators
                  {/if}
                </li>
                <li
                  class="text-fs-ds-14 font-inter font-fw-ds-300 flex items-center text-neutral-200"
                >
                  <div class="mr-2">
                    <CheckIcon width="20" height="20" color="#33CC7A" />
                  </div>
                  {#if typeof planDetails[plan][billingCycle].workspaces === 'string'}
                    {planDetails[plan][billingCycle].workspaces} workspaces
                  {:else}
                    Up to {planDetails[plan][billingCycle].workspaces} workspaces
                  {/if}
                </li>

                <li
                  class="text-fs-ds-14 font-inter font-fw-ds-300 flex items-center text-neutral-200"
                >
                  <div class="mr-2">
                    <CheckIcon width="20" height="20" color="#33CC7A" />
                  </div>
                  {#if typeof planDetails[plan][billingCycle].privateHubs === 'string'}
                    {planDetails[plan][billingCycle].privateHubs} Private hub
                  {:else}
                    Up to {planDetails[plan][billingCycle].privateHubs} Private hub
                  {/if}
                </li>
                <li
                  class="text-fs-ds-14 font-inter font-fw-ds-300 flex items-center text-neutral-200"
                >
                  <div class="mr-2">
                    <CheckIcon width="20" height="20" color="#33CC7A" />
                  </div>
                  {planDetails[plan][billingCycle].collections} Collections
                </li>
              </ul>

              <div class="mt-6 mb-10 text-center">
                <a
                  href="https://sparrowapp.dev/pricing/"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="text-fs-ds-12 font-inter font-fw-ds-400 cursor-pointer text-neutral-200 underline"
                >
                  Compare Plans
                </a>
              </div>
            </div>
          </div>
        {/each}
      </div>

      <!-- User count notice -->
      <div class="mt-8">
        <p class="text-fs-ds-14 font-inter font-fw-ds-300 text-neutral-400">
          Note: With {userCount} users in your hub, your final cost will be calculated based on the selected
          plan. A full breakdown will be shown at checkout. Please
          <a href="mailto:contactus@sparrowapp.dev" class="text-blue-400 underline">contact sales</a
          >
          for more information.
        </p>
      </div>
    </div>
  </div>
</div>
