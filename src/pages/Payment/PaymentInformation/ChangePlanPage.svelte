<script lang="ts">
  // Svelte
  import { navigate, useLocation } from 'svelte-routing';
  import { tweened } from 'svelte/motion';
  import { cubicOut } from 'svelte/easing';
  import { onMount } from 'svelte';

  // Components
  import Breadcrumbs from '@/components/Breadcrumbs/Breadcrumbs.svelte';
  import { hubsService } from '@/services/hubs.service';
  import Tag from '@/ui/Tag/Tag.svelte';
  import Button from '@/ui/Button/Button.svelte';
  import Modal from '@/components/Modal/Modal.svelte';
  // Icons
  import CheckIcon from '@/assets/icons/Check.svelte';

  // Utils
  import {
    getCurrentPlanDetails,
    initializePlanDetails,
    AVAILABLE_PLANS,
    isPlanSelectable as checkPlanSelectable,
    capitalizeFirstLetter,
    getPlanId,
    isDowngrade,
    type BillingCycleType,
  } from '@/utils/pricing';
  import { captureEvent } from '@/utils/posthogConfig';
  import DowngradePlan from '@/components/DowngradePlan/DowngradePlanModal.svelte';
  import { createQuery } from '@/services/api.common';
  import DowngradePlanModal from '@/components/DowngradePlan/DowngradePlanModal.svelte';
  import ChooseActiveWorkspaceModal from '@/components/DowngradePlan/ChooseActiveWorkspaceModal.svelte';
  import ChooseActiveMembersModal from '@/components/DowngradePlan/ChooseActiveMembersModal.svelte';
  import ReviewScheduledDowngradeModal from '@/components/DowngradePlan/ReviewScheduledDowngradeModal.svelte';
  import { billingService } from '@/services/billing.service';
  import { notification } from '@/components/Toast';

  const location = useLocation();

  // Animation stores
  const pageOpacity = tweened(0, {
    duration: 600,
    easing: cubicOut,
  });

  const pageTranslateY = tweened(30, {
    duration: 600,
    easing: cubicOut,
  });

  const toggleScale = tweened(0.95, {
    duration: 700,
    easing: cubicOut,
  });

  const cardsOpacity = tweened(0, {
    duration: 500,
    easing: cubicOut,
  });

  // Animation for individual card hover
  let hoveredCardIndex = null;
  const cardScale = tweened(1, {
    duration: 100,
    easing: cubicOut,
  });

  // Extract URL parameters
  let hubId: string = '';
  let currentPlan: string = 'Community';
  let currentBillingCycle: BillingCycleType = 'monthly';
  let subscriptionId: string = '';
  let subscriptionStatus: string = '';
  let userCount: number = 1;
  let inTrial: boolean = false;
  let downgradeModal: boolean = false;
  let allowDowngrade: boolean = false;
  let selectedPlan: string = '';
  let hubName: string = '';
  let hubWorkspaces: [];
  let mode: string = 'change-plan';
  let createdAt: string;
  let hubUsers: [];
  let downgradeFlow = {
    downgradeModal: false,
    chooseWorkspaceModal: false,
    chooseMembersModal: false,
    reviewModal: false,
  };
  let priceId: string;
  let downgradeData = {
    selectedWorkspaces: [],
    unselectedWorkspaces: [],
    selectedMembers: [],
    feedback: '',
    members: [],
  };
  let planLimits: [];

  $: {
    const searchParams = new URLSearchParams($location?.search || '');
    mode = searchParams.get('mode') || 'change-plan';
  }

  $: pageHeading = mode === 'upgrade' ? 'Upgrade Plan' : 'Change Your Plan';
  $: pageDescription =
    mode === 'upgrade'
      ? "You're ready for the next level. Upgrade to access more and features. You can switch plans at any time."
      : 'Select a different plan that fits your needs. Your current plan is highlighted below. The new plan will take effect immediately or at the start of your next billing cycle depending on your billing terms.';

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
    userCount = parseInt(searchParams.get('userCount') || '1', 10);
    inTrial = searchParams.get('inTrial') === 'true';
  }

  // Plan details for comparison
  let planDetails = getCurrentPlanDetails();

  onMount(async () => {
    await initializePlanDetails();
    planDetails = getCurrentPlanDetails();
    if (hubId) await getHubName(hubId);
  });

  async function getHubName(hubId: string) {
    try {
      const response = await hubsService.getHubDetails(hubId);
      if (response?.data) {
        const data = response.data;
        hubName = data.name || ' ';
        hubWorkspaces = data.workspaces;
        hubUsers = (data.users || []).filter((u) => (u.role || '').toLowerCase() !== 'owner');
        createdAt = data.createdAt;
        currentPlan = data.plan.name;
      }
    } catch (error) {
      console.log(error);
    }
  }

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
    selectedPlan = plan;
    const selectedPlanLimits = planDetails?.[plan]?.[billingCycle] ?? {};
    planLimits = {
      workspacesPerHub: { value: selectedPlanLimits.workspaces },
      usersPerHub: { value: selectedPlanLimits.collaborators },
    };
    if (plan === 'enterprise') {
      captureUserPlanUpgradeClick(currentPlan, plan);
      window.open('mailto:contactus@sparrowapp.dev', '_blank');
    } else {
      const targetPlanId = getPlanId(plan, billingCycle);

      if (targetPlanId !== currentPlanId) {
        priceId =
          billingCycle === 'monthly'
            ? planDetails[plan].monthly.priceId
            : planDetails[plan].annual.priceId;

        const isDowngradeChange = isDowngrade(
          currentPlanLower,
          plan,
          currentBillingCycle,
          billingCycle,
        );

        if (isDowngradeChange) {
          const selectedPlanLimits = planDetails?.[plan]?.[billingCycle] ?? {};
          const maxWorkspaces = selectedPlanLimits.workspaces ?? 0;
          const maxUsers = selectedPlanLimits.collaborators ?? 0;

          const currentWorkspaceCount = hubWorkspaces?.length || 0;
          const currentUserCount = hubUsers?.length || 0;

          const hasWorkspaces = currentWorkspaceCount > 0;
          const hasMembers = currentUserCount > 0;
          downgradeFlow.downgradeModal = true;
          downgradeData.selectedWorkspaces = [];
          downgradeData.selectedMembers = [];
          if (!hasWorkspaces && !hasMembers) {
            downgradeFlow.downgradeModal = false;
            downgradeFlow.reviewModal = true;
            return;
          }

          return;
        } else {
          captureUserPlanUpgradeClick(currentPlan, plan);
        }

        const url = new URL(window.location.href);
        const searchParamsChangePlan = new URLSearchParams(url.search);
        const updatedUrl = url.pathname + '?' + searchParamsChangePlan.toString();
        sessionStorage.setItem('changePlanPageUrl', updatedUrl);

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

  function isPlanSelectable(plan) {
    return true;
  }

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
      return 'Select Plan';
    } else {
      return 'Your plan';
    }
  }

  $: breadcrumbLabel = mode === 'upgrade' ? 'Upgrade Plan' : 'Change Plan';
  $: breadcrumbItems = [
    { label: 'Billing', path: `/billing/billingOverview/${hubId}` },
    { label: breadcrumbLabel, path: '' },
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

  onMount(() => {
    // Trigger page entrance animation
    setTimeout(() => {
      pageOpacity.set(1);
      pageTranslateY.set(0);
    }, 100);

    setTimeout(() => {
      toggleScale.set(1);
    }, 300);

    setTimeout(() => {
      cardsOpacity.set(1);
    }, 400);
  });

  function handleCardHover(index, isHovering) {
    hoveredCardIndex = isHovering ? index : null;
    cardScale.set(isHovering ? 1.01 : 1);
  }

  // Animation stores for toggle
  const toggleIndicatorX = tweened(0, {
    duration: 300,
    easing: cubicOut,
  });

  // Update toggle position when billing cycle changes
  $: if (billingCycle === 'monthly') {
    toggleIndicatorX.set(0);
  } else {
    toggleIndicatorX.set(100); // Move it fully to the right (100% of its width)
  }

  const captureUserPlanUpgradeClick = (currentPlan: string, upgradePlan: string) => {
    const eventProperties = {
      current_plan: currentPlan,
      upgrade_plan: upgradePlan,
    };
    captureEvent('admin_plan_upgraded', eventProperties);
  };

  function getExpiryDate(createdAt: string): string {
    if (!createdAt) return '-';
    const created = new Date(createdAt);
    const expiry = new Date(created);
    expiry.setDate(expiry.getDate() + 30);

    // Format like "28 Aug 2025, 10:00 AM UTC"
    const options: Intl.DateTimeFormatOptions = {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      timeZone: 'UTC',
    };

    // Calculate days left
    const now = new Date();
    const diffInMs = expiry.getTime() - now.getTime();
    const daysLeft = Math.max(Math.ceil(diffInMs / (1000 * 60 * 60 * 24)), 0); // avoid negative

    const formattedExpiry = expiry.toLocaleString('en-GB', options) + ' UTC';
    return `${formattedExpiry} (${daysLeft} day${daysLeft !== 1 ? 's' : ''} left)`;
  }
  $: expiryDate = getExpiryDate(createdAt);

  function filterOutOwners(users) {
    return (users || []).filter((u) => (u.role || '').toLowerCase() !== 'owner');
  }

  function getDowngradeConstraints() {
    const workspaceCount = hubWorkspaces?.length || 0;
    const memberCount = hubUsers?.length || 0;
    const maxWorkspaces = planLimits?.workspacesPerHub?.value || 0;
    const maxUsers = planLimits?.usersPerHub?.value || 0;

    const withinWorkspaceLimit = workspaceCount <= maxWorkspaces;
    const withinUserLimit = memberCount <= maxUsers;
    const isCommunity = selectedPlan?.toLowerCase() === 'community';
    const isStandard = selectedPlan?.toLowerCase() === 'standard';
    const hasWorkspaces = workspaceCount > 0;
    const hasMembers = memberCount > 0;

    return {
      workspaceCount,
      memberCount,
      maxWorkspaces,
      maxUsers,
      withinWorkspaceLimit,
      withinUserLimit,
      isCommunity,
      isStandard,
      hasWorkspaces,
      hasMembers,
    };
  }
</script>

<div
  class="max-w-[1200px]"
  style="opacity: {$pageOpacity}; transform: translateY({$pageTranslateY}px);"
>
  <Breadcrumbs items={breadcrumbItems} />

  <div class="mt-6">
    <h1 class="text-fs-ds-20 font-inter font-fw-ds-500 text-white">{pageHeading}</h1>
    <p class="text-fs-ds-14 font-inter font-fw-ds-300 text-neutral-400">{pageDescription}</p>

    <div class="mt-6">
      <!-- Billing toggle with smooth sliding animation -->
      <div class="mb-6 flex">
        <div
          class="border-surface-100 relative flex w-[350px] overflow-hidden rounded-md border"
          style="transform: scale({$toggleScale});"
        >
          <!-- Sliding background indicator -->
          <div
            class="bg-surface-600 absolute top-1 left-1 h-[calc(100%-8px)] w-[calc(50%-4px)] rounded-md transition-transform duration-300 ease-out"
            style="transform: translateX({$toggleIndicatorX}%);"
          ></div>

          <!-- Toggle buttons -->
          <button
            class={`text-fs-ds-12 font-inter font-fw-ds-400 relative z-10 m-1 flex-1 cursor-pointer rounded-md py-1.5 transition-colors duration-200 ${billingCycle === 'monthly' ? 'text-white' : 'text-neutral-300'}`}
            on:click={() => (billingCycle = 'monthly')}
          >
            Monthly billing
          </button>
          <button
            class={`text-fs-ds-12 font-inter font-fw-ds-400 relative z-10 m-1 flex-1 cursor-pointer rounded-md py-1.5 transition-colors duration-200 ${billingCycle === 'annual' ? 'text-white' : 'text-neutral-300'}`}
            on:click={() => (billingCycle = 'annual')}
          >
            Annual billing
          </button>
        </div>
      </div>

      <!-- Plan Cards Grid with staggered animation -->
      <div
        class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4"
        style="opacity: {$cardsOpacity};"
      >
        {#each planValues as { plan, planName, isCurrentPlan, planPrice, planUnit, buttonText, hasDiscount, discount }, index}
          <div
            class={`overflow-hidden rounded-[10px] border-2 transition-all duration-200 
                ${isCurrentPlan ? 'border-neutral-50' : 'border-surface-500'}
                ${!isPlanSelectable(plan) && !isCurrentPlan ? 'cursor-not-allowed opacity-40' : 'hover:bg-surface-600 hover:border-surface-50'}
              `}
            style="transform: scale({hoveredCardIndex === index ? $cardScale : 1});"
            on:mouseenter={() => isPlanSelectable(plan) && handleCardHover(index, true)}
            on:mouseleave={() => handleCardHover(index, false)}
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
                      variant={buttonText === 'Upgrade' ? 'filled-primary' : 'outline-primary'}
                      class={buttonText !== 'Upgrade' ? '!text-white' : ''}
                      on:click={() => isPlanSelectable(plan) && selectPlan(plan)}
                      disabled={!isPlanSelectable(plan) ||
                        (inTrial && buttonText === 'Select Plan')}
                      tooltipText={!isPlanSelectable(plan) && mode === 'upgrade-only'
                        ? 'Downgrade not allowed in Upgrade mode'
                        : ''}
                      tooltipPosition="bottom"
                      tooltipDelay={100}
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

{#if downgradeFlow.downgradeModal}
  <Modal on:close={() => (downgradeFlow.downgradeModal = false)}>
    <DowngradePlanModal
      {hubId}
      {currentPlan}
      {selectedPlan}
      {hubName}
      {hubWorkspaces}
      {planLimits}
      {expiryDate}
      on:close={() => (downgradeFlow.downgradeModal = false)}
      on:cancel={() => (downgradeFlow.downgradeModal = false)}
      on:continue={() => {
        downgradeFlow.downgradeModal = false;
        const c = getDowngradeConstraints();

        // Handle workspaces
        if (c.withinWorkspaceLimit) {
          downgradeData.selectedWorkspaces = hubWorkspaces || [];
          downgradeData.members = filterOutOwners(hubUsers) || [];
        } else {
          downgradeFlow.chooseWorkspaceModal = true;
          return;
        }

        // Handle members
        if (c.isCommunity) {
          if (c.withinUserLimit) {
            downgradeData.selectedMembers = filterOutOwners(hubUsers) || [];
            downgradeFlow.reviewModal = true;
          } else {
            downgradeFlow.chooseMembersModal = true;
          }
        } else if (c.isStandard) {
          downgradeData.selectedMembers =
            c.workspaceCount > 0 ? [] : filterOutOwners(hubUsers) || [];
          downgradeFlow.reviewModal = true;
        }
      }}
    />
  </Modal>
{/if}

{#if downgradeFlow.chooseWorkspaceModal}
  <ChooseActiveWorkspaceModal
    {hubId}
    {currentPlan}
    {selectedPlan}
    {planLimits}
    isOpen={downgradeFlow.chooseWorkspaceModal}
    workspaces={hubWorkspaces}
    on:close={() => {
      downgradeFlow.chooseWorkspaceModal = false;
      downgradeFlow.downgradeModal = true;
    }}
    on:next={(e) => {
      downgradeData.selectedWorkspaces = e.detail.selected;
      downgradeData.unselectedWorkspaces = e.detail.unselected;
      downgradeData.members = filterOutOwners(e.detail.members) || [];
      downgradeFlow.chooseWorkspaceModal = false;

      const c = getDowngradeConstraints();

      if (c.isCommunity) {
        const workspaceMemberCount = downgradeData.members?.length || 0;
        const withinUserLimit = workspaceMemberCount <= c.maxUsers;

        if (workspaceMemberCount === 0) {
          downgradeData.selectedMembers = [];
          downgradeFlow.reviewModal = true;
        } else if (withinUserLimit) {
          downgradeData.selectedMembers = downgradeData.members;
          downgradeFlow.reviewModal = true;
        } else {
          downgradeFlow.chooseMembersModal = true;
        }
      } else if (c.isStandard) {
        downgradeFlow.reviewModal = true;
      }
    }}
  />
{/if}

{#if downgradeFlow.chooseMembersModal}
  <ChooseActiveMembersModal
    {hubId}
    {currentPlan}
    {selectedPlan}
    {planLimits}
    {expiryDate}
    isOpen={downgradeFlow.chooseMembersModal}
    hubOwner={hubUsers.find((u) => u.role === 'owner')}
    users={downgradeData.members.length > 0
      ? filterOutOwners(downgradeData.members)
      : filterOutOwners(hubUsers)}
    on:close={() => {
      downgradeFlow.chooseMembersModal = false;
      downgradeFlow.chooseWorkspaceModal = true;
    }}
    on:next={(e) => {
      downgradeData.selectedMembers = filterOutOwners(e.detail.selected);
      downgradeFlow.chooseMembersModal = false;
      downgradeFlow.reviewModal = true;
    }}
  />
{/if}

{#if downgradeFlow.reviewModal}
  <Modal on:close={() => (downgradeFlow.reviewModal = false)}>
    <ReviewScheduledDowngradeModal
      isOpen={downgradeFlow.reviewModal}
      {hubName}
      {hubWorkspaces}
      {currentPlan}
      {selectedPlan}
      {expiryDate}
      selectedWorkspaces={downgradeData.selectedWorkspaces}
      selectedMembers={downgradeData.selectedMembers.filter(
        (m) => (m.role || '').toLowerCase() !== 'owner',
      )}
      on:close={() => {
        downgradeFlow.reviewModal = false;
        const c = getDowngradeConstraints();

        if (c.isStandard) {
          if (c.workspaceCount > c.maxWorkspaces) downgradeFlow.chooseWorkspaceModal = true;
          else downgradeFlow.downgradeModal = true;
        } else if (c.isCommunity) {
          if (downgradeData.members?.length > c.maxUsers) downgradeFlow.chooseMembersModal = true;
          else if (c.workspaceCount > c.maxWorkspaces) downgradeFlow.chooseWorkspaceModal = true;
          else downgradeFlow.downgradeModal = true;
        }
      }}
      on:confirm={async (e) => {
        downgradeData.feedback = e.detail.feedback;
        const metadata = {
          hubId,
          userCount: userCount.toString(),
          selectedPlan,
          trial_period_days: 0,
          trial_end_date: null,
        };
        const downgradePayload = {
          teamId: hubId,
          workspaces: downgradeData.selectedWorkspaces.map((ws) => ({
            id: ws._id || ws.id,
            name: ws.name,
          })),
          users: filterOutOwners(downgradeData.selectedMembers).map((user) => ({
            id: user._id || user.id,
            email: user.email,
          })),
        };

        try {
          if (selectedPlan?.toLowerCase() === 'community') {
            await billingService.cancelSubscription({
              subscriptionId,
              ...downgradePayload,
            });
            downgradeFlow.reviewModal = false;
            notification.success('Your subscription has been downgraded to the Community plan.');
          } else if (selectedPlan?.toLowerCase() === 'standard') {
            debugger;
            await billingService.updateSubscription({
              priceId,
              subscriptionId,
              metadata,
              isDowngrade: true,
              ...downgradePayload,
            });
            downgradeFlow.reviewModal = false;
            notification.success('Your downgrade to Standard plan is scheduled.');
          }
        } catch (error) {
          notification.error('Failed to process downgrade. Please try again.');
        }
      }}
    />
  </Modal>
{/if}

<style>
  @keyframes cardSlideIn {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
</style>
