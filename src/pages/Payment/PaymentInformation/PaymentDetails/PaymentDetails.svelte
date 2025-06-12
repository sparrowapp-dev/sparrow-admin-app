<script lang="ts">
  // Svelte
  import { onDestroy, onMount } from 'svelte';
  import { navigate, useLocation } from 'svelte-routing';

  // Store
  import { userEmail, userId, userName } from '@/store/auth';

  // Constants / Options
  import { countryOptions } from '../PaymentModules/CountryList';

  // Services
  import { billingService } from '@/services/billing.service';
  import { hubsService } from '@/services/hubs.service';
  import { createQuery } from '@/services/api.common';

  // Utils
  import { initializeStripe, createCardElements, StripeElement } from '@/utils/stripeUtils';

  // UI Components
  import Button from '@/ui/Button/Button.svelte';
  import Input from '@/ui/Input/Input.svelte';
  import SearchableDropdown from '@/ui/SearchableDropdown/SearchableDropdown.svelte';

  // App Components
  import Breadcrumbs from '@/components/Breadcrumbs/Breadcrumbs.svelte';
  import { notification } from '@/components/Toast';

  // Icons
  import CheckboxChecked from '@/assets/icons/CheckboxChecked.svelte';
  import CheckboxUnchecked from '@/assets/icons/CheckboxUnchecked.svelte';

  const location = useLocation();

  // Props
  export let customerId: string = '';

  // URL parsing for hubId
  let hubId: string = '';
  $: {
    const url = $location?.pathname || '';
    const matches = url.match(/\/billing\/billingInformation\/addPaymentDetails\/([a-f0-9]{24})/i);
    if (matches?.[1]) {
      hubId = matches[1];
    }
  }

  // Stripe Elements
  let stripe: any;
  let elements: any;
  let stripeElements: StripeElement[] = [];

  // Card Fields
  let cardNumber: StripeElement;
  let cardExpiry: StripeElement;
  let cardCvc: StripeElement;
  let cardholderName = '';
  let cardNumberEmpty = true;
  let cardExpiryEmpty = true;
  let cardCvcEmpty = true;
  let cardNumberComplete = false;
  let cardExpiryComplete = false;
  let cardCvcComplete = false;
  let cardNumberError: string | null = null;
  let cardExpiryError: string | null = null;
  let cardCvcError: string | null = null;

  // Billing Details
  let billingName = '';
  let billingEmail = '';
  let line1 = '';
  let line2 = '';
  let city = '';
  let state = '';
  let postalCode = '';
  let country: { label: string; value: string } | null = null;
  let defaultPaymentMethod = false;

  // State
  let isLoading = false;
  let error: string | null = null;
  let formSubmitted = false;

  // Fetch customer data
  const { data: customerData, refetch: refetchCustomer } = createQuery(() =>
    billingService.fetchCustomerId(hubId || ''),
  );
  const { data: hubDetails, refetch: hubsDataRefetch } = createQuery(() =>
    hubsService.getHubDetails(hubId || ''),
  );
  $: if (hubId) {
    refetchCustomer();
    hubsDataRefetch();
  }

  $: if ($customerData !== undefined) {
    customerId = $customerData?.data?.customerId || null;
  }

  // Mount lifecycle
  onMount(async () => {
    await initializeStripeElements();
  });

  // Destroy lifecycle
  onDestroy(() => {
    stripeElements.forEach((element) => element?.destroy());
  });

  // Initialize Stripe Elements
  async function initializeStripeElements() {
    try {
      // Initialize Stripe using the utility function
      stripe = await initializeStripe();

      // Create card elements using utility function
      const { elements: elementsInstance, cardElements } = createCardElements(stripe);
      elements = elementsInstance;

      // Extract individual card elements
      cardNumber = cardElements.cardNumber;
      cardExpiry = cardElements.cardExpiry;
      cardCvc = cardElements.cardCvc;

      // Save elements for cleanup
      stripeElements = [cardNumber, cardExpiry, cardCvc];

      // Mount elements to their containers
      cardNumber.mount('#card-number-element');
      cardExpiry.mount('#card-expiry-element');
      cardCvc.mount('#card-cvc-element');

      // Setup event listeners for each element
      [cardNumber, cardExpiry, cardCvc].forEach((el) => {
        el.on('change', handleElementChange);
      });

      // Pre-fill billing email with user's email
      if ($userEmail) {
        billingEmail = $userEmail;
      }
    } catch (err: any) {
      error = err.message;
      console.error('Error initializing Stripe:', err);
    }
  }

  // Handle Stripe Element changes
  function handleElementChange(event: any) {
    const { elementType, empty, complete, error: elementError } = event;

    switch (elementType) {
      case 'cardNumber':
        cardNumberEmpty = empty;
        cardNumberComplete = complete;
        cardNumberError = elementError?.message || null;
        break;
      case 'cardExpiry':
        cardExpiryEmpty = empty;
        cardExpiryComplete = complete;
        cardExpiryError = elementError?.message || null;
        break;
      case 'cardCvc':
        cardCvcEmpty = empty;
        cardCvcComplete = complete;
        cardCvcError = elementError?.message || null;
        break;
    }

    error = elementError?.message || null;
  }

  // Submit handler
  async function handleSubmit() {
    if (isLoading) return;
    formSubmitted = true;

    if (!validateForm()) return;

    try {
      isLoading = true;
      error = null;

      if (!customerId) {
        const customerData = {
          name: cardholderName,
          email: $userEmail,
          metadata: {
            source: 'sparrow-admin-app',
            name: $userName,
            userId: $userId,
          },
        };

        const { customer } = await billingService.createCustomer(customerData);
        customerId = customer.id;
        if (hubId) {
          await billingService.saveCustomerId(customerId, hubId);
        }
      }

      const { clientSecret } = await billingService.createSetupIntent(customerId);

      const result = await stripe.confirmCardSetup(clientSecret, {
        payment_method: {
          card: cardNumber,
          billing_details: {
            name: billingName,
            email: billingEmail,
            address: {
              line1,
              line2: line2 || undefined,
              city,
              state,
              postal_code: postalCode,
              country: country?.value,
            },
          },
        },
      });
      if (result?.setupIntent.payment_method && defaultPaymentMethod) {
        billingService.setUpDefaultPaymentMethod(customerId, result?.setupIntent?.payment_method);
      }

      if (result.error) throw new Error(result.error.message);

      notification.success('Payment method added successfully');

      setTimeout(() => goBack(), 1000);
    } catch (err: any) {
      error = err.message;
      console.error('Error adding payment method:', err);
      notification.error('Failed to add payment method');
    } finally {
      isLoading = false;
    }
  }

  // Form validation
  function validateForm(): boolean {
    const requiredFields = [
      cardholderName.trim(),
      billingName.trim(),
      billingEmail.trim(),
      line1.trim(),
      city.trim(),
      state.trim(),
      postalCode.trim(),
      country,
    ];

    if (
      cardNumberEmpty ||
      !cardNumberComplete ||
      cardExpiryEmpty ||
      !cardExpiryComplete ||
      cardCvcEmpty ||
      !cardCvcComplete ||
      requiredFields.includes('') ||
      !country
    ) {
      error = 'Please fill in all required fields correctly';
      return false;
    }

    if (cardNumberError || cardExpiryError || cardCvcError) {
      error = 'Please correct the card information errors';
      return false;
    }

    return true;
  }

  // Back button handler
  function goBack() {
    if (hubId) {
      navigate(`/billing/billingOverview/${hubId}`);
    } else {
      navigate('/hubs');
    }
  }

  $: breadcrumbItems = [
    { label: 'Home', path: '/hubs' },
    { label: `${$hubDetails?.data?.name || 'Hub'}`, path: `/hubs/workspace/${hubId}` },
    { label: 'Upgrade Plan', path: `` },
    { label: 'Add Card', path: `/billing/billingInformation/addPaymentDetails/${hubId}` },
  ];
</script>

<div class="max-w-[724px]">
  <Breadcrumbs items={breadcrumbItems} />
  <div class="header mt-6 flex items-start justify-between">
    <div>
      <h2 class="text-xl font-medium text-white">Add a New Card</h2>
      <p class="text-sm text-gray-400">
        Securely add your card and billing address to complete the payment.
      </p>
    </div>
  </div>

  <form on:submit|preventDefault={handleSubmit} class="space-y-8 pt-8">
    <!-- Card Details Section -->
    <section class="space-y-5">
      <h3 class="text-lg font-medium text-neutral-50">Card Details</h3>
      <div class="grid grid-cols-2 gap-4">
        <div class="form-group">
          <label
            for="card-number-element"
            class="text-fs-ds-14 font-inter mb-2 block text-neutral-200"
          >
            Card Number <span class="text-red-400">*</span>
          </label>
          <div
            id="card-number-element"
            class="rounded-sm border p-2.5 text-neutral-50 {(formSubmitted &&
              (cardNumberEmpty || !cardNumberComplete)) ||
            cardNumberError
              ? 'border-red-300'
              : 'border-transparent'}"
          />
          {#if (formSubmitted && (cardNumberEmpty || !cardNumberComplete)) || cardNumberError}
            <p class="text-fs-ds-12 mt-1 text-red-300">
              {cardNumberError || 'Please enter your card number'}
            </p>
          {/if}
        </div>

        <div class="form-group">
          <label
            for="card-expiry-element"
            class="text-fs-ds-14 font-inter mb-2 block text-neutral-200"
          >
            Expiration Date <span class="text-red-400">*</span>
          </label>
          <div
            id="card-expiry-element"
            class="bg-surface-400 rounded-sm border p-2.5 text-neutral-50 {(formSubmitted &&
              (cardExpiryEmpty || !cardExpiryComplete)) ||
            cardExpiryError
              ? 'border-red-300'
              : 'border-transparent'}"
          ></div>
          {#if (formSubmitted && (cardExpiryEmpty || !cardExpiryComplete)) || cardExpiryError}
            <p class="text-fs-ds-12 mt-1 text-red-300">
              {cardExpiryError || 'Please enter expiration date'}
            </p>
          {/if}
        </div>

        <div class="form-group">
          <label
            for="card-cvc-element"
            class="text-fs-ds-14 font-inter mb-2 block text-neutral-200"
          >
            CVV/Security Code<span class="text-red-400">*</span>
          </label>
          <div
            id="card-cvc-element"
            class="bg-surface-400 rounded-sm border p-2.5 text-neutral-50 {(formSubmitted &&
              (cardCvcEmpty || !cardCvcComplete)) ||
            cardCvcError
              ? 'border-red-300'
              : 'border-transparent'}"
          ></div>
          {#if (formSubmitted && (cardCvcEmpty || !cardCvcComplete)) || cardCvcError}
            <p class="text-fs-ds-12 mt-1 text-red-300">
              {cardCvcError || 'Please enter CVV/security code'}
            </p>
          {/if}
        </div>

        <div class="form-group">
          <Input
            label="Cardholder Name"
            id="cardholder-name"
            bind:value={cardholderName}
            required={true}
            placeholder="Enter Cardholder Name"
            hasError={formSubmitted && !cardholderName.trim()}
            errorMessage={formSubmitted && !cardholderName.trim()
              ? 'Please enter cardholder name'
              : ''}
          />
        </div>
      </div>
    </section>
    <div class="border border-neutral-500 px-4"></div>
    <!-- Billing Details Section -->
    <section class="space-y-5">
      <h3 class="text-lg font-medium text-neutral-50">Billing Address Details</h3>
      <div class="grid grid-cols-2 gap-4">
        <div class="form-group">
          <Input
            label="Name"
            bind:value={billingName}
            required={true}
            placeholder="Enter Name"
            hasError={formSubmitted && !billingName}
            errorMessage="Please enter billing name"
          />
        </div>
        <div class="form-group">
          <Input
            label="Billing Email"
            type="email"
            bind:value={billingEmail}
            required={true}
            placeholder="Enter Billing Address"
            hasError={formSubmitted && !billingEmail}
            errorMessage="Please enter valid billing email."
          />
        </div>
        <div class="form-group">
          <Input
            label="Address Line 1"
            bind:value={line1}
            required={true}
            placeholder="Enter Address Line 1"
            hasError={formSubmitted && !line1}
            errorMessage="Please enter Address"
          />
        </div>

        <div class="form-group">
          <Input label="Address Line 2" bind:value={line2} placeholder="Enter Address Line 2" />
        </div>

        <div class="form-group">
          <label class="text-fs-ds-14 font-inter mb-2 block text-neutral-200">
            Country <span class="text-red-400">*</span>
          </label>
          <div on:click|stopPropagation|preventDefault>
            <SearchableDropdown
              options={countryOptions}
              bind:selected={country}
              placeholder="Select Country"
              searchPlaceholder="Search Country"
              disabled={isLoading}
              variant="primary"
              width="w-full"
              hasError={formSubmitted && !country}
              maxHeight="150px"
            />
          </div>
          {#if formSubmitted && !country}
            <p class="text-fs-ds-12 mt-1 text-red-300">Please select your country</p>
          {/if}
        </div>

        <div class="form-group">
          <Input
            label="City"
            bind:value={city}
            required={true}
            placeholder="Enter City"
            hasError={formSubmitted && !city}
            errorMessage="Please enter a valid city."
          />
        </div>
        <div class="form-group">
          <Input
            label="State"
            bind:value={state}
            required={true}
            placeholder="Enter State"
            hasError={formSubmitted && !state}
            errorMessage="Please enter a valid state."
          />
        </div>
        <div class="form-group">
          <Input
            label="ZIP Code"
            bind:value={postalCode}
            required={true}
            placeholder="Enter ZIP code"
            hasError={formSubmitted && !postalCode}
            errorMessage="Please enter a valid ZIP or postal code."
          />
        </div>
      </div>
      <div class="text-fs-ds-14 leading-lh-ds-143 text-fw-ds-300 flex gap-1 text-neutral-50">
        <span on:click={() => (defaultPaymentMethod = !defaultPaymentMethod)}>
          {#if defaultPaymentMethod}
            <CheckboxChecked />
          {:else}
            <CheckboxUnchecked />
          {/if}</span
        >Set this card as default payment method
      </div>
    </section>

    <div class="flex justify-end gap-3 pt-4">
      <Button type="button" variant="filled-secondary" on:click={goBack}>Cancel</Button>
      <Button type="submit" variant="filled-primary" disabled={isLoading}>
        {#if isLoading}
          <span class="flex items-center justify-center">Adding...</span>
        {:else}
          Add
        {/if}
      </Button>
    </div>
  </form>
</div>

<style>
  :global(.stripe-element) {
    background-color: #222630 !important;
    border: 1px solid transparent;
    border-radius: 4px;
    padding: 0.5rem;
    height: 38px;
    transition: all 0.2s;
  }

  :global(.stripe-element:hover) {
    border-color: #9b9da1;
  }

  :global(.stripe-element--focus) {
    border-color: #6894f9;
    outline: none;
  }

  :global(.stripe-element--invalid) {
    border-color: #f37472;
  }
</style>
