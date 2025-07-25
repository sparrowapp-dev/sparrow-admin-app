<script>
  import TrialNav from '@/components/TrialNav/TrialNav.svelte';
  import WelcomePage from '@/assets/images/WelcomePage.png';
  import TrialSuccess from '@/components/TrialFlow/TrialSuccess.svelte';
  import { onMount } from 'svelte';
  import TrialSuccessFlowViewModel from './TrialSuccess.ViewModel';
  let _viewModel = new TrialSuccessFlowViewModel();
  let hub = '';
  let users = '';
  let trialstart = '';
  let trialend = '';
  let trialStartDate = '';
  let trialEndDate = '';
  let amount = 0;
  let flow = 'standard';
  let trialFrequency = 'monthly'; // Default to monthly, can be overridden by query params
  let billing;
  let pricingDetails;
  let source;
  let accessToken;
  let refreshToken;
  let response;
  let promoDiscountType = '';
  let promoDiscountValue = 0;

  onMount(async () => {
    const params = new URLSearchParams(window.location.search);
    hub = params.get('hub');
    users = params.get('users');
    trialstart = params.get('trialstart');
    trialend = params.get('trialend');
    flow = params.get('flow');
    source = params.get('source');
    accessToken = params.get('accessToken');
    refreshToken = params.get('refreshToken');
    response = params.get('response');
    trialFrequency = params.get('trialFrequency') || 'monthly'; // Use query param or default to monthly
    promoDiscountType = params.get('promoType') || '';
    promoDiscountValue = Number(params.get('promoValue')) || 0;

    // Convert Unix timestamp (seconds) to Date string
    if (trialstart) {
      const date = new Date(Number(trialstart) * 1000);
      trialStartDate = date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    }
    if (trialend) {
      const date = new Date(Number(trialend) * 1000);
      trialEndDate = date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    }
    // Get pricing details and calculate discounted amount
    const pricingResponse = await _viewModel.getPricingDetails();
    if (pricingResponse.isSuccessful && pricingResponse.data?.data) {
      pricingDetails = pricingResponse.data.data;
      const selectedPlan = pricingDetails.plans.find((p) => p.tier.toLowerCase() === flow);
      billing = selectedPlan?.billing.find(
        (b) => b.interval.toLowerCase() === (trialFrequency?.toLowerCase() || 'monthly'),
      );
    }

    if (billing) {
      let price = Number(billing.price);
      let finalPrice = price;
      if (promoDiscountType && promoDiscountValue > 0) {
        if (promoDiscountType === 'percentage') {
          finalPrice = price - (price * promoDiscountValue) / 100;
        } else if (promoDiscountType === 'amount') {
          finalPrice = price - promoDiscountValue;
          if (finalPrice < 0) finalPrice = 0;
        }
      }
      let floored = Math.floor(finalPrice * 100) / 100;
      amount = users ? parseInt(users) * floored : floored;
    }
  });
  $: capitalizedFlow = flow ? flow.charAt(0).toUpperCase() + flow.slice(1) : '';
</script>

<TrialNav />
<div
  class="flex min-h-screen items-start justify-center bg-cover bg-center bg-no-repeat p-4 pt-18"
  style="background-image: url('{WelcomePage}')"
>
  <div class="padding-y-14 mx-auto flex w-full max-w-2xl flex-col gap-7">
    <div class="text-center text-neutral-50">
      <h1 class="text-fs-ds-42 font-fw-ds-300 font-aileron text-neutral-50">
        <span class="gradient-text">{capitalizedFlow} Trial</span> Unlocked
      </h1>
    </div>
    <div>
      <TrialSuccess
        {hub}
        {users}
        {trialEndDate}
        {trialStartDate}
        {amount}
        {trialFrequency}
        flow={capitalizedFlow}
        {source}
        {accessToken}
        {refreshToken}
        {response}
      />
    </div>
  </div>
</div>

<style>
  .gradient-text {
    background: linear-gradient(180deg, #11adf0 0%, #6147ff 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    text-fill-color: transparent;
  }
</style>
