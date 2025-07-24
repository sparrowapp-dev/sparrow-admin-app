<script>
  import PricingCard from '@/components/PricingCard/PricingCard.svelte';
  import SparrowBackgroundV2 from '@/assets/images/SparrowBackgroundV2.svg';
  import { useLocation, navigate } from 'svelte-routing';
  import { onMount } from 'svelte';
  import PlansViewModel from './Plans.ViewModel';
  import { notification } from '@/components/Toast';
  const location = useLocation();
  $: params = new URLSearchParams($location.search);
  $: accessToken = params.get('accessToken');
  $: refreshToken = params.get('refreshToken');
  $: email = params.get('email');
  $: source = params.get('source');
  let isTrialExhausted;
  let _viewModel = new PlansViewModel();

  let billingPeriod = 'monthly';

  const monthlyPlans = [
    {
      title: 'Standard',
      price: '$9.99',
      period: 'per user/month',
      features: [
        'Unlimited collaborators',
        'Up to 5 workspaces',
        'Up to 1 Private hub',
        'Unlimited Collections',
      ],
      buttonText: 'Start 14-day Trial',
    },
    {
      title: 'Professional',
      price: '$19.99',
      period: 'per user/month',
      features: [
        'Unlimited collaborators',
        'Up to 10 workspaces',
        'Up to 1 Private hub',
        'Unlimited Collections',
      ],
      buttonText: 'Start 14-day Trial',
    },
  ];

  const annualPlans = [
    {
      title: 'Standard',
      price: '$99',
      period: 'per user/year',
      savings: 'Save 17.4%',
      features: [
        'Unlimited collaborators',
        'Up to 5 workspaces',
        'Up to 1 Private hub',
        'Unlimited Collections',
      ],
      buttonText: 'Start 14-day Trial',
    },
    {
      title: 'Professional',
      price: '$199',
      period: 'per user/year',
      savings: 'Save 17%',
      features: [
        'Unlimited collaborators',
        'Up to 10 workspaces',
        'Up to 1 Private hub',
        'Unlimited Collections',
      ],
      buttonText: 'Start 14-day Trial',
    },
  ];

  const marketingUrl = import.meta.env.VITE_SPARROW_MARKETING_URL;

  $: pricingPlans = billingPeriod === 'monthly' ? monthlyPlans : annualPlans;

  function handlePlanSelect(plan) {
    if (!accessToken) {
      console.error('Access token is missing');
      return;
    }
    let data = JSON.parse(window.atob(accessToken.split('.')[1]));
    let firstName = data.name;
    firstName = firstName.split(' ')[0];
    firstName = firstName.length > 11 ? firstName.substring(0, 5) + '...' : firstName;

    const flow = plan.title === 'Standard' ? 'login_standard_trial' : 'login_professional_trial';
    const trialperiod = billingPeriod === 'monthly' ? 'monthly' : 'annual';
    const url = `/usertrial?accessToken=${accessToken}&refreshToken=${refreshToken}&name=${firstName}&flow=${flow}&trialPeriod=${trialperiod}&email=${email}&source=${source}`;
    navigate(url);
    return;
  }

  function handleCompareClick() {
    window.open(marketingUrl + '/pricing/#pricing-comparison', '_blank');
  }
  onMount(async () => {
    const response = await _viewModel.getUserTrialExhaustedStatus();
    isTrialExhausted = response?.data;
    if (response?.isSuccessful) {
      if (isTrialExhausted) {
        notification.error('You have already used your free trial.');
      }
    }
  });
</script>

<div
  class="flex min-h-screen w-full items-center justify-center bg-[#000000]"
  style={`background-image: url(${SparrowBackgroundV2}); background-size: cover; background-position: center;`}
>
  <div
    class="max-h-[90vh] w-full max-w-2xl gap-3 overflow-y-auto rounded bg-[#181C26] p-4 shadow-lg"
  >
    <div class="mb-3 text-white">
      <h5 class="text-fs-ds-20 font-fw-ds-600">
        Welcome to Sparrow! Let’s find the right plan for you
      </h5>
      <p class="text-fs-ds-14 mb-0 text-[#D8D8D9]">
        Before you dive in, take a moment to explore the plans we offer, from free to fully loaded.
        You can switch plans at any time.
      </p>
    </div>

    <!-- Billing toggle -->
    <div class="mb-4 flex h-9 w-[310px] items-center gap-2 rounded border border-[#222630] p-2">
      <button
        class="text-fs-ds-12 font-fw-ds-500 m-0 flex-1 rounded border-0 py-1 font-normal"
        style="background-color: {billingPeriod === 'monthly'
          ? '#222630'
          : 'transparent'}; color: {billingPeriod === 'monthly' ? '#fff' : '#D8D8D9'};"
        on:click={() => (billingPeriod = 'monthly')}
      >
        Monthly billing
      </button>
      <button
        class="m-0 flex-1 rounded border-0 py-1 text-xs font-normal"
        style="background-color: {billingPeriod === 'annual'
          ? '#222630'
          : 'transparent'}; color: {billingPeriod === 'annual' ? '#fff' : '#D8D8D9'};"
        on:click={() => (billingPeriod = 'annual')}
      >
        Annual billing
      </button>
    </div>

    <!-- Stacked pricing cards -->
    <div class="flex gap-3">
      {#each pricingPlans as plan}
        <div class="min-w-[200px] flex-1">
          <PricingCard
            title={plan.title}
            price={plan.price}
            period={plan.period}
            features={plan.features}
            buttonText={plan.buttonText}
            savings={plan.savings}
            onButtonClick={() => handlePlanSelect(plan)}
            onCompareClick={handleCompareClick}
            compareText={'Compare Plans'}
            buttonDisabled={isTrialExhausted}
          />
        </div>
      {/each}
    </div>
  </div>
</div>

<style></style>
