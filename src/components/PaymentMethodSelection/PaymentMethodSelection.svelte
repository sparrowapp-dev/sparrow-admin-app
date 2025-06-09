<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { navigate } from 'svelte-routing';
  import CircularLoader from '@/ui/CircularLoader/CircularLoader.svelte';
  import Button from '@/ui/Button/Button.svelte';
  import CloseIcon from '@/assets/icons/CloseIcon.svelte';
  import { billingService } from '@/services/billing.service';
  import { createQuery } from '@/services/api.common';
  import Tag from '@/ui/Tag/Tag.svelte';
  import Radio from '@/ui/Radio/Radio.svelte';

  const dispatch = createEventDispatcher<{
    close: void;
    paymentMethodSelected: {
      paymentMethodId: string;
      planName: string;
      priceId: string;
      billingCycle: string;
    };
    addNewCard: void;
  }>();

  // Props
  export let customerId: string = '';
  export let planName: string = 'Standard';
  export let priceId: string = '';
  export let billingCycle: string = 'monthly';
  export let totalAmount: string = '$9.99';
  export let userCount: number = 1;
  export let hubId: string = '';
  export let subscriptionId: string = '';

  // Local state
  let selectedPaymentMethodId: string = '';
  let error: any = '';
  let showProratedInfo: boolean = false;
  let proratedAmount: string = totalAmount;
  let proratedDate: string = '';

  // Fetch payment methods
  const { data: paymentMethodsData, isFetching: isLoadingPaymentMethods } = createQuery(
    async () => {
      if (!customerId) return { paymentMethods: [] };
      return billingService.getPaymentMethods(customerId);
    },
  );

  // Fetch proration details if we are updating a subscription
  const { data: prorationData, isFetching: isLoadingProration } = createQuery(async () => {
    if (!customerId || !priceId) return null;

    try {
      const response = await billingService.simulatePayment(customerId, priceId);

      if (response?.lines?.data) {
        const invoiceLine = response.lines.data[0];

        // Extract prorated amount and next billing date
        const proratedAmountValue = invoiceLine.amount / 100; // Convert cents to dollars
        const nextBillingDate = new Date(response.period_end * 1000); // Convert to milliseconds

        const formattedDate = nextBillingDate.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });

        showProratedInfo = true;

        return {
          proratedAmount: `$${proratedAmountValue.toFixed(2)}`,
          proratedDate: formattedDate,
        };
      }

      return null;
    } catch (err) {
      console.error('Error fetching proration details:', err);
      return null;
    }
  });

  // Reactive derived values
  $: paymentMethods = $paymentMethodsData?.paymentMethods || [];
  $: defaultCard =
    paymentMethods.find((pm) => pm.metadata?.default === 'true') || paymentMethods[0];
  $: if (defaultCard && !selectedPaymentMethodId) {
    selectedPaymentMethodId = defaultCard.id;
  }

  // Update proration details when available
  $: if ($prorationData) {
    proratedAmount = $prorationData.proratedAmount;
    proratedDate = $prorationData.proratedDate;
  }

  function handleAddNewCard() {
    dispatch('addNewCard');
  }

  function handleClose() {
    dispatch('close');
  }

  function handleRadioChange(event) {
    selectedPaymentMethodId = event.detail.value;
  }

  // Modified to simply dispatch the selected payment method without making API calls
  function handlePaymentConfirm() {
    if (!selectedPaymentMethodId || !priceId || !customerId) {
      return;
    }

    try {
      error = null;

      // Dispatch the selected payment method to the parent component
      dispatch('paymentMethodSelected', {
        paymentMethodId: selectedPaymentMethodId,
        planName,
        priceId,
        billingCycle,
      });
    } catch (err: any) {
      console.error('Error selecting payment method:', err);
      error = err.message || 'Failed to select payment method. Please try again.';
    }
  }
</script>

<div class="bg-surface-600 max-w-xl rounded-lg p-7 text-white">
  <div class="mb-6 flex items-start justify-between">
    <div>
      <h2 class="text-fs-ds-20 font-inter font-fw-ds-500 text-neutral-50">
        Select a payment method
      </h2>
      <p class="text-fs-ds-14 font-fw-ds-300 font-inter text-neutral-100">
        Choose a saved card or add a new one to continue with your upgrade.
      </p>
    </div>
    <button class="cursor-pointer" on:click={handleClose}>
      <CloseIcon />
    </button>
  </div>

  <!-- Summary - Simplified to match Figma -->
  <div class="mb-6 grid grid-cols-3 gap-4 py-1">
    <div class="col-span-1">
      <p class="text-fs-ds-12 font-inter font-fw-ds-300 text-neutral-400">Plan Selected</p>
      <p class="text-fs-ds-16 font-inter font-fw-ds-400 mt-1 text-neutral-50">{planName}</p>
    </div>
    <div class="col-span-1">
      <p class="text-fs-ds-12 font-inter font-fw-ds-300 text-neutral-400">Total users</p>
      <p class="text-fs-ds-16 font-inter font-fw-ds-400 mt-1 text-neutral-50">{userCount}</p>
    </div>
    <div class="col-span-1">
      <p class="text-fs-ds-12 font-inter font-fw-ds-300 text-neutral-400">Total Amount</p>
      <p class="text-fs-ds-16 font-inter font-fw-ds-400 mt-1 text-neutral-50">
        {totalAmount}<span class="text-fs-ds-12 text-neutral-400">
          /{billingCycle === 'monthly' ? 'user/month' : 'user/year'}</span
        >
      </p>
    </div>
  </div>

  <!-- Payment method selection -->
  <div class="mb-6">
    {#if $isLoadingPaymentMethods || $isLoadingProration}
      <div class="flex justify-center py-8">
        <CircularLoader />
      </div>
    {:else if paymentMethods.length === 0}
      <div class="bg-surface-600 mb-4 rounded p-4 text-center">
        <p class="text-fs-ds-14 font-inter font-fw-ds-400 text-neutral-200">
          You don't have any saved payment methods.
        </p>
        <Button variant="filled-primary" size="small" on:click={handleAddNewCard}>
          <span class="mr-1 text-xl">+</span> Add a new card
        </Button>
      </div>
    {:else}
      <div class="mb-6 flex flex-col">
        {#each paymentMethods as method, i}
          <div
            class="flex cursor-pointer items-center border-b border-neutral-600 py-4 {i === 0
              ? ''
              : 'mt-2'}"
          >
            <Radio
              name="payment-method"
              value={method.id}
              checked={selectedPaymentMethodId === method.id}
              on:change={handleRadioChange}
            >
              <div class="flex flex-1 items-start justify-between">
                <div>
                  <div class="flex items-center gap-2">
                    <div class="text-fs-ds-14 font-inter font-fw-ds-500 text-neutral-50">
                      {method.card.brand.toUpperCase()}
                    </div>
                    {#if method === defaultCard}
                      <div>
                        <Tag
                          text="Default Card"
                          bgColor="bg-green-900"
                          textColor="text-green-300"
                          borderColor="border-green-700"
                          size="xs"
                        />
                      </div>
                    {/if}
                  </div>
                  <div class="text-fs-ds-12 font-inter font-fw-ds-400 text-neutral-300">
                    **** **** **** {method.card.last4}
                  </div>
                </div>
              </div>
            </Radio>
          </div>
        {/each}
      </div>
    {/if}
  </div>

  <!-- Proration information (only for subscription updates) -->
  {#if subscriptionId && showProratedInfo}
    <div class="bg-opacity-20 mb-6 rounded-md bg-blue-900 p-4">
      <h3 class="text-fs-ds-14 font-inter font-fw-ds-500 mb-2 text-blue-300">
        Prorated Billing Information
      </h3>
      <p class="text-fs-ds-12 font-inter font-fw-ds-400 text-blue-300">
        Since you're changing your plan in the middle of your billing cycle, we'll only charge you
        for the remaining time in your current cycle.
      </p>
      <div class="mt-3 grid grid-cols-2 gap-y-2">
        <div>
          <p class="text-fs-ds-12 font-inter font-fw-ds-400 text-blue-300">Amount due today:</p>
          <p class="text-fs-ds-14 font-inter font-fw-ds-500 text-blue-300">{proratedAmount}</p>
        </div>
        <div>
          <p class="text-fs-ds-12 font-inter font-fw-ds-400 text-blue-300">
            Next full billing date:
          </p>
          <p class="text-fs-ds-14 font-inter font-fw-ds-500 text-blue-300">{proratedDate}</p>
        </div>
      </div>
    </div>
  {/if}

  {#if error}
    <div class="bg-opacity-20 mb-4 rounded bg-red-900 p-4 text-red-400">
      <p>{error}</p>
    </div>
  {/if}

  <!-- Action buttons -->
  <div class="mt-6 flex justify-end gap-3">
    <Button variant="filled-secondary" on:click={handleClose}>Cancel</Button>
    <Button
      variant="filled-primary"
      disabled={!selectedPaymentMethodId ||
        paymentMethods.length === 0 ||
        $isLoadingPaymentMethods ||
        $isLoadingProration}
      on:click={handlePaymentConfirm}
    >
      {subscriptionId ? 'Confirm Plan Change' : 'Confirm & Pay'}
    </Button>
  </div>
</div>
