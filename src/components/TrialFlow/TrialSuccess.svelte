<script>
  import fallingConfetti from '@/assets/images/falling_confetti_purple_red.gif';
  import CheckmarkStarburst from '@/assets/icons/CheckmarkStarburst.svelte';
  import Button from '@/ui/Button/Button.svelte';
  import { navigate } from 'svelte-routing';
  import { onMount } from 'svelte';
  export let hub = '';
  export let users = '';

  export let trialStartDate = '';
  export let trialEndDate = '';
  export let amount = 0;
  export let trialFrequency = 'monthly'; // Default to monthly, can be overridden by query params
  export let flow = 'standard'; // Default flow, can be overridden by query params
  export let source;
  export let accessToken;
  export let refreshToken;
  export let response;
  export let billingCycles;
  export let promoDiscountType;
  export let promoDiscountValue;

  const launchUrl = import.meta.env.VITE_SPARROW_LAUNCH_URL;
  function handleLaunch() {
    const sparrowWebRedirect = `${launchUrl}?accessToken=${accessToken}&refreshToken=${refreshToken}&response=${response}&event=register&method=email`;
    const sparrowRedirect = `sparrow://?accessToken=${accessToken}&refreshToken=${refreshToken}&response=${response}&event=register&method=email`;
    if (source === 'desktop') {
      window.location.href = sparrowRedirect;
    } else {
      window.location.href = sparrowWebRedirect;
    }
  }
  let billingCycle = 'month';
  $: {
    if (trialFrequency) {
      billingCycle = trialFrequency.toLowerCase() === 'monthly' ? 'month' : 'year';
    }
  }
  // Capitalize first letter of flow
  $: capitalizedFlow = flow ? flow.charAt(0).toUpperCase() + flow.slice(1) : '';
  function numberToWords(n) {
    const words = [
      'zero',
      'one',
      'two',
      'three',
      'four',
      'five',
      'six',
      'seven',
      'eight',
      'nine',
      'ten',
      'eleven',
      'twelve',
    ];
    return n >= 0 && n <= 12 ? words[n] : n.toString();
  }
  $: trialFrequencyLabel = trialFrequency
    ? trialFrequency.charAt(0).toUpperCase() + trialFrequency.slice(1)
    : '';
</script>

<div class="flex items-center justify-center">
  <div class="relative w-full">
    <div class="bg-surface-600 rounded-lg p-8 shadow-xl">
      <div class="flex flex-col gap-8">
        <div
          class="font-fw-ds-400 flex flex-col items-center gap-2 text-center break-words text-neutral-50"
        >
          <CheckmarkStarburst />
          <div class="text-fs-ds-16">Congratulations! Your {capitalizedFlow} Trial is Unlocked</div>
          <div class="text-fs-ds-14 mx-auto max-w-xl break-words">
            You’ve successfully activated the {capitalizedFlow} Trial for <span class="font-fw-ds-600">‘{hub}’</span> Hub. All premium
            features are now available, start exploring, collaborating, and building with your team. {#if billingCycles && promoDiscountValue > 0}
              You’ll get
              {promoDiscountType === 'percentage'
                ? ` ${promoDiscountValue}%`
                : ` $${promoDiscountValue}`}
              off for the first {numberToWords(Number(billingCycles))} month{billingCycles > 1
                ? 's'
                : ''} after your 14-day trial ends.
            {/if}
          </div>
        </div>
        <div class="mr-5 ml-15 w-full max-w-md">
          <div class="grid grid-cols-2 gap-x-20 gap-y-6">
            <div class="flex flex-col items-center justify-center gap-1">
              <span class="text-fs-ds-12 text-neutral-400">Hub Name</span>
              <span
                class="text-ds-ds-16 font-fw-ds-400 max-w-xs truncate text-center text-neutral-50"
                >{hub}</span
              >
            </div>
            <div class="flex flex-col items-center justify-center gap-1">
              <span class="text-fs-ds-12 text-neutral-400">Total Members</span>
              <span class="text-ds-ds-16 font-fw-ds-400 text-neutral-50">{users}</span>
            </div>
            <div class="flex flex-col items-center justify-center gap-1">
              <span class="text-fs-ds-12 text-neutral-400">Your Plan</span>
              <span class="text-ds-ds-16 font-fw-ds-400 text-neutral-50"
                >{capitalizedFlow} - {trialFrequencyLabel}</span
              >
            </div>
            <div class="flex flex-col items-center justify-center gap-1">
              <span class="text-fs-ds-12 text-neutral-400">Amount After Trial</span>
              <span class="text-ds-ds-16 font-fw-ds-400 text-neutral-50"
                >${amount}/{billingCycle}</span
              >
            </div>
            <div class="flex flex-col items-center justify-center gap-1">
              <span class="text-fs-ds-12 text-neutral-400">Trial Start Date</span>
              <span class="text-ds-ds-16 font-fw-ds-400 text-neutral-50">{trialStartDate}</span>
            </div>
            <div class="flex flex-col items-center justify-center gap-1">
              <span class="text-fs-ds-12 text-neutral-400">Trial End Date</span>
              <span class="text-ds-ds-16 font-fw-ds-400 text-neutral-50">{trialEndDate}</span>
            </div>
          </div>
        </div>
        <div>
          <div class="flex justify-center gap-3">
            <Button
              variant="filled-secondary"
              size="medium"
              on:click={() => {
                navigate('/hubs');
              }}>Open Admin Panel</Button
            >
            <Button
              variant="filled-primary"
              size="medium"
              on:click={() => {
                handleLaunch();
              }}>Launch Sparrow</Button
            >
          </div>
        </div>
      </div>
    </div>

    <!-- Confetti Animation - Now inside the container -->
    <!-- Top-left confetti -->
    <div class="absolute top-0 left-0 h-[150px] w-[150px] overflow-hidden">
      <img
        src={fallingConfetti}
        alt="Confetti Animation"
        class="absolute -top-10 -left-30 h-[267px] w-[150px] rotate-36"
      />
    </div>

    <!-- Bottom-right confetti -->
    <div class="absolute right-0 bottom-0 h-[150px] w-[150px] overflow-hidden">
      <img
        src={fallingConfetti}
        alt="Confetti Animation"
        class="absolute -right-30 -bottom-10 h-[267px] w-[150px] rotate-36"
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
    font-weight: 600;
  }
</style>
