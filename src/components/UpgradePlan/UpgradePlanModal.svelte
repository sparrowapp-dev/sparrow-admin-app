<script lang="ts">
  import CheckMarkCircle from '@/assets/icons/CheckMarkCircle.svelte';
  import { createEventDispatcher } from 'svelte';
  import DowngradeModalButtons from '@/ui/DowngradeModalButtons/DowngradeModalButtons.svelte';

  export let currentPlan: string;
  export let selectedPlan: string;
  export let hubName: string;
  export let hubWorkspaces: any = [];
  export let hubId: string;
  export let billingCycle: string;
  export let planLimits: any = {};

  const dispatch = createEventDispatcher();

  function getUpgradeBenefits(currentPlan: string, selectedPlan: string) {
    const curr = currentPlan?.trim()?.toLowerCase();
    const next = selectedPlan?.trim()?.toLowerCase();
    const { usersPerHub, workspacesPerHub } = planLimits || {};
    const usersLimit = usersPerHub?.value ?? 'Unlimited';
    const workspaceLimit = workspacesPerHub?.value ?? 'Unlimited';

    if (curr === 'community' && next === 'standard') {
      return [
        `Collaborators: Increase to ${usersLimit} active collaborators`,
        `Workspaces: Expand to ${workspaceLimit} workspaces`,
        'Test Flows: Get up to 10 test flows per workspace',
        'AI Models: Access to all premium AI models',
        'Support: Priority email and chat support',
      ];
    }

    if (curr === 'community' && next === 'professional') {
      return [
        `Collaborators: Unlimited active collaborators`,
        `Workspaces: Up to ${workspaceLimit} workspaces`,
        'Private Hubs: Create private hubs for your team',
        'Test Flows: Unlimited test flows',
        'AI-Powered Mock Server: Advanced API mocking capabilities',
        'Env Vault: Secure environment variable management',
        'Active Sync: Real-time collaboration features',
      ];
    }

    if (curr === 'standard' && next === 'professional') {
      return [
        `Workspaces: Increase from 5 to ${workspaceLimit} workspaces`,
        'Private Hubs: Create private hubs for your team',
        'Test Flows: Unlimited test flows (vs 10 per workspace)',
        'AI-Powered Mock Server: Advanced API mocking capabilities',
        'Env Vault: Secure environment variable management',
        'Active Sync: Real-time collaboration features',
      ];
    }

    if (['community', 'standard', 'professional'].includes(curr) && next === 'enterprise') {
      return [
        'Unlimited Private Hubs: No restrictions on hub creation',
        'Unlimited Test Flows: Scale without limits',
        'Hub-Level Access Management: Advanced security controls',
        'Service Level Agreement (SLA): Guaranteed uptime and support',
        'Dedicated Account Manager: Personalized assistance',
        'Custom Integrations: Tailored to your workflow',
      ];
    }

    return ['Access to enhanced features and capabilities.'];
  }

  function getPlanPrice() {
    const planPricing = {
      standard: {
        monthly: '$9.99/user/month',
        annual: '$99/user/year (Save 17.4%)',
      },
      professional: {
        monthly: '$19.99/user/month',
        annual: '$199/user/year (Save 17%)',
      },
      enterprise: {
        monthly: 'Custom pricing',
        annual: 'Custom pricing',
      },
    };

    const plan = selectedPlan?.toLowerCase();
    const cycle = billingCycle?.toLowerCase();
    
    return planPricing[plan]?.[cycle] || 'Contact Sales';
  }

  function handleCancel() {
    dispatch('cancel');
  }

  function handleClose() {
    dispatch('close');
  }

  function handleContinueUpgrade() {
    dispatch('continue');
  }
</script>

<div class="bg-[#181C26] flex w-full flex-col gap-4 rounded-lg p-8 text-white md:p-6">
  <div class="flex items-start justify-between">
    <h2 class="font-inter text-fs-ds-20 font-medium text-neutral-50">
      Upgrade to {selectedPlan} Plan
    </h2>
    <button
      class="cursor-pointer text-fs-ds-20 mt-1 leading-none text-neutral-400 hover:text-neutral-200"
      on:click={handleClose}
    >
      ✕
    </button>
  </div>

  <!-- Hub details -->
  <div class="font-inter mt-2 grid grid-cols-2 text-fs-ds-12 font-medium text-neutral-300">
    <div class="flex flex-col">
      <p class="text-neutral-300">Hub Name</p>
      <p class="mt-0.5 text-fs-ds-16 font-medium text-neutral-50">{hubName}</p>
    </div>

    <div class="flex flex-col text-left">
      <p class="text-neutral-300">Current Plan</p>
      <p class="mt-0.5 text-fs-ds-16 font-medium text-neutral-50 capitalize">{currentPlan}</p>
    </div>
  </div>

  <!-- Description -->
  <p class="font-inter mt-2 text-fs-ds-12 leading-relaxed font-light text-neutral-200">
    You're ready for the next level! Upgrading from {currentPlan} to {selectedPlan} will unlock powerful features and enhanced capabilities for your team.
  </p>

  <!-- Pricing info -->
  <div class="bg-[#1D212B] rounded-md p-3 mt-2">
    <p class="font-inter text-fs-ds-12 font-medium text-neutral-200">
      New Plan Price: <span class="text-blue-400">{getPlanPrice()}</span>
    </p>
  </div>

  <!-- Benefits list -->
  <p class="font-inter mt-2 text-fs-ds-12 leading-relaxed font-light text-neutral-200">
    Here's what you'll get with {selectedPlan}:
  </p>

  <ul class="font-inter mt-1 ml-5 list-decimal space-y-1 text-fs-ds-12 font-light text-neutral-300">
    {#each getUpgradeBenefits(currentPlan, selectedPlan) as benefit}
      <li>{benefit}</li>
    {/each}
  </ul>

  <p class="font-inter mt-2 text-fs-ds-12 leading-relaxed font-light text-neutral-300">
    Want to see a detailed comparison?
    <a href="https://sparrowapp.dev/pricing/" target="_blank" class="ml-1 text-blue-300 underline">
      Compare all plans
    </a>
    to find the perfect fit.
  </p>

  <!-- Success box -->
  <div class="relative mt-2 flex items-start gap-3 overflow-hidden rounded-md bg-[#1D212B] p-3 shadow-2xl">
    <div
      class="absolute top-0 left-0 h-full w-[4px] rounded-l-md bg-gradient-to-b from-[#33CC7A] to-[#2A9B5F]"
    ></div>
    <div class="relative flex h-8 w-8 flex-shrink-0 items-center justify-center">
      <div class="scale-150">
        <CheckMarkCircle />
      </div>
    </div>
    <p class="font-inter text-fs-ds-12 leading-relaxed font-light text-neutral-100">
      You're upgrading <span class="font-medium">'{hubName}'</span> to the {selectedPlan} plan. 
      {#if selectedPlan?.toLowerCase() !== 'enterprise'}
        Your new features will be available immediately after payment confirmation.
      {:else}
        Our sales team will contact you within 24 hours to discuss your custom plan.
      {/if}
    </p>
  </div>

  <div class="mt-3">
    <DowngradeModalButtons
      showSupport={true}
      supportText="Contact Support"
      cancelText="Cancel"
      confirmText={selectedPlan?.toLowerCase() === 'enterprise' ? 'Contact Sales' : 'Continue to Upgrade'}
      primaryVariant="filled-primary"
      on:confirm={selectedPlan?.toLowerCase() === 'enterprise' 
        ? () => window.open('mailto:contactus@sparrowapp.dev', '_blank')
        : handleContinueUpgrade}
    />
  </div>
</div>
