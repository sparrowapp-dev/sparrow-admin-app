<script lang="ts">
  import ErrorCircleIcon from '@/assets/icons/ErrorCircleIcon.svelte';
  import { createEventDispatcher } from 'svelte';
  import DowngradeModalButtons from '@/ui/DowngradeModalButtons/DowngradeModalButtons.svelte';

  export let currentPlan: string;
  export let selectedPlan: string;
  export let hubName: string;
  export let hubWorkspaces: [];
  export let hubId: string;
  export let expiryDate: string;
  export let planLimits:[];

  const dispatch = createEventDispatcher();

  function getDowngradeLimitations(currentPlan: string, selectedPlan: string) {
  const curr = currentPlan?.trim()?.toLowerCase();
  const next = selectedPlan?.trim()?.toLowerCase();
  const { usersPerHub, workspacesPerHub } = planLimits || {};
  const usersLimit = usersPerHub?.value ?? 'N/A';
  const workspaceLimit = workspacesPerHub?.value ?? 'N/A';

  if (curr === 'standard') {
    return [
      `Collaborators: Limited to ${usersLimit} active collaborators`,
      `Workspaces: Limited to ${workspaceLimit} workspaces`,
      `Test Flows: Limited to 3 per workspace`,
      'AI Models: All model access will be limited to Deepseek',
      'Support: Support will change to our basic community support',
    ];
  }

  if (curr === 'professional' && next === 'standard') {
    return [
      'No Private hubs',
      'Up to 10 test flows',
      'No AI-powered mock server',
      'No Env Vault for secure environment variable management',
      'No Active sync',
    ];
  }

  if (curr === 'professional' && next === 'community') {
    return [
      'No Private hubs',
      'No AI-powered mock server',
      'No Env Vault for secure environment variable management',
      'No Active sync',
      'Reduced collaborators and workspace limit',
      'Limited collections',
    ];
  }

  if (curr === 'enterprise' && ['standard', 'professional', 'community'].includes(next)) {
    return [
      'No Unlimited Private hubs',
      'No Unlimited test flows',
      'No Hub-level access management',
      'No Service Level Agreement (SLA) support',
    ];
  }

  return ['Feature details not available for this downgrade.'];
}

  function handleCancel() {
    dispatch('cancel');
  }

  function handleClose() {
    dispatch('close');
  }

  function handleContinueDowngrade() {
    dispatch('continue');
  }
</script>

<div class="bg-[#181C26] flex w-full flex-col gap-4 rounded-lg p-8 text-white md:p-6">
  <div class="flex items-start justify-between">
    <h2 class="font-inter text-fs-ds-20 font-medium text-neutral-50">
      Downgrade to {selectedPlan === 'community' ? 'Community Edition' : `${selectedPlan} Plan`}
    </h2>
    <button
      class="cursor-pointer text-fs-ds-20 leading-none text-neutral-400 hover:text-neutral-200"
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
    Are you sure you want to downgrade your plan from
    <span class="font-medium text-neutral-50">{currentPlan}</span> to
    <span class="font-medium text-neutral-50">{selectedPlan}</span>? Some features and access will
    change after the downgrade.
  </p>

  <!-- Limitations list -->
  <p class="font-inter mt-2 text-fs-ds-12 leading-relaxed font-light text-neutral-200">
    Here's the major limitations compared to {currentPlan}:
  </p>

  <ul class="font-inter mt-1 ml-5 list-decimal space-y-1 text-fs-ds-12 font-light text-neutral-300">
    {#each getDowngradeLimitations(currentPlan, selectedPlan) as limitation}
      <li>{limitation}</li>
    {/each}
  </ul>

  <p class="font-inter mt-3 text-fs-ds-12 leading-relaxed font-light text-neutral-300">
    Not sure what's included in each plan? Take a quick look to
    <a href="https://sparrowapp.dev/pricing/" target="_blank" class="ml-1 text-blue-400 underline">
      compare plans
    </a>
    before downgrading.
  </p>

  <!-- Warning box -->
  {#if currentPlan !== 'Enterprise'}
    <div class="relative mt-3 flex items-start gap-3 overflow-hidden rounded-md bg-[#1D212B] p-3 ">
      <div
        class="absolute top-0 left-0 h-full w-[4px] rounded-l-md bg-gradient-to-b from-[#EB5651] to-[#8B3A36]"
      ></div>
      <div class="relative flex h-8 w-8 flex-shrink-0 items-center justify-center">
        <ErrorCircleIcon width="24" height="24" />
      </div>
      <p class="font-inter text-fs-ds-12 leading-relaxed font-light text-neutral-100">
        You're downgrading <span class="font-medium">'{hubName}'</span>. Paid features stay active
        until
        <span class="font-medium">{expiryDate}</span>, after which your hub will move
        to the {selectedPlan} plan.
      </p>
    </div>
  {/if}
  <DowngradeModalButtons
    showSupport={true}
    disableSupport={currentPlan === 'Enterprise'}
    supportText="Contact Support"
    cancelText="Cancel"
    confirmText={currentPlan !== 'Enterprise' ? 'Continue to Downgrade' : 'Contact Sales'}
    primaryVariant="filled-primary"
    on:cancel={handleCancel}
    on:confirm={handleContinueDowngrade}
    on:support={() => console.log('Support clicked')}
    class="mt-3"
  />
</div>
