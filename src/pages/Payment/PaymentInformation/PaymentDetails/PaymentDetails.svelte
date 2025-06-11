<script lang="ts">
  // Imports
  import { onDestroy, onMount } from 'svelte';
  import { navigate, useLocation } from 'svelte-routing';
  import { notification } from '@/components/Toast';
  import { createQuery } from '@/services/api.common';
  import { billingService } from '@/services/billing.service';
  import { userEmail, userId, userName } from '@/store/auth';
  import Button from '@/ui/Button/Button.svelte';
  import Input from '@/ui/Input/Input.svelte';
  import SearchableDropdown from '@/ui/SearchableDropdown/SearchableDropdown.svelte';
  import { countryOptions } from '../PaymentModules/CountryList';
  import CheckboxChecked from '@/assets/icons/CheckboxChecked.svelte';
  import CheckboxUnchecked from '@/assets/icons/CheckboxUnchecked.svelte';
  import Breadcrumbs from '@/components/Breadcrumbs/Breadcrumbs.svelte';
  import { hubsService } from '@/services/hubs.service';

  const location = useLocation();

  // Props
  export let customerId = null;

  // URL parsing for hubId
  let hubId = null;
  $: {
    const url = $location?.pathname || '';
    const matches = url.match(/\/billing\/billingInformation\/addPaymentDetails\/([a-f0-9]{24})/i);
    if (matches?.[1]) {
      hubId = matches[1];
    }
  }

  // Stripe Elements
  let stripe;
  let elements;
  let stripeElements = [];

  // Card Fields
  let cardNumber, cardExpiry, cardCvc;
  let cardholderName = '';
  let cardNumberEmpty = true;
  let cardExpiryEmpty = true;
  let cardCvcEmpty = true;
  let cardNumberComplete = false;
  let cardExpiryComplete = false;
  let cardCvcComplete = false;
  let cardNumberError = null;
  let cardExpiryError = null;
  let cardCvcError = null;

  // Billing Details
  let billingName = '';
  let billingEmail = '';
  let line1 = '';
  let line2 = '';
  let city = '';
  let state = '';
  let postalCode = '';
  let country = null;
  let defaultPaymentMethod = false;

  // State
  let isLoading = false;
  let error = null;
  let formSubmitted = false;

  // Fetch customer data
  const { data: customerData, refetch: refetchCustomer } = createQuery(() =>
    billingService.fetchCustomerId(hubId),
  );
  const { data: hubDetails, refetch: hubsDataRefetch } = createQuery(() =>
    hubsService.getHubDetails(hubId),
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
    if (!window.Stripe) {
      const script = document.createElement('script');
      script.src = 'https://js.stripe.com/v3/';
      script.async = true;
      script.onload = initializeStripe;
      document.body.appendChild(script);
    } else {
      initializeStripe();
    }
  });

  // Destroy lifecycle
  onDestroy(() => {
    stripeElements.forEach((element) => element?.destroy());
  });

  // Initialize Stripe Elements
  async function initializeStripe() {
    try {
      const { publishableKey } = await billingService.getStripeConfig();
      stripe = window.Stripe(publishableKey);

      const baseStyle = {
        base: {
          color: '#ffffff',
          fontFamily: '"Inter", system-ui, sans-serif',
          fontSmoothing: 'antialiased',
          fontSize: '14px',
          '::placeholder': {
            color: '#82858A',
            fontWeight: '200',
            fontSize: '14px',
          },
          backgroundColor: '#222630',
          iconColor: '#ffffff',
        },
        invalid: {
          color: '#F37472',
          iconColor: '#F37472',
        },
      };

      elements = stripe.elements({
        fonts: [
          {
            cssSrc: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap',
          },
        ],
        appearance: {
          theme: 'night',
          variables: {
            colorPrimary: '#4361ee',
            colorBackground: '#222630',
            colorText: '#ffffff',
            colorDanger: '#F37472',
          },
        },
      });

      cardNumber = elements.create('cardNumber', { style: baseStyle, showIcon: true });
      cardExpiry = elements.create('cardExpiry', { style: baseStyle });
      cardCvc = elements.create('cardCvc', { style: baseStyle });

      stripeElements = [cardNumber, cardExpiry, cardCvc];

      cardNumber.mount('#card-number-element');
      cardExpiry.mount('#card-expiry-element');
      cardCvc.mount('#card-cvc-element');

      [cardNumber, cardExpiry, cardCvc].forEach((el) => {
        el.on('change', handleElementChange);
      });
    } catch (err) {
      error = err.message;
      console.error('Error initializing Stripe:', err);
    }
  }

  // Handle Stripe Element changes
  function handleElementChange(event) {
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
        await billingService.saveCustomerId(customerId, hubId);
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
    } catch (err) {
      error = err.message;
      console.error('Error adding payment method:', err);
      notification.error('Failed to add payment method');
    } finally {
      isLoading = false;
    }
  }

  // Form validation
  function validateForm() {
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
      requiredFields.includes('')
    ) {
      error = 'Please fill in all required fields';
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
    navigate(`/billing/billingOverview/${hubId}`);
  }
  $: breadcrumbItems = [
    { label: 'Home', path: '/hubs' },
    { label: `${$hubDetails?.data?.name}`, path: `/hubs/workspace/${hubId}` },
    { label: 'Upgrade Plan', path: `` },
    { label: 'Add Card', path: `/billing/billingInformation/addPaymentDetails/${hubId}` },
  ];
</script>

<div class="max-w-[724px]">
  <Breadcrumbs items={breadcrumbItems} />
  <div class="header flex items-start justify-between">
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
      <h3 class="text-lg font-medium text-white">Card Details</h3>
      <div class="grid grid-cols-2 gap-4">
        <div class="form-group">
          <label
            for="card-number-element"
            class="text-fs-ds-14 font-inter mb-2 block text-neutral-200"
          >
            Card Number <span class="text-red-400">*</span>
          </label>
          <div id="card-number-element" class="stripe-element" />
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
          <div id="card-expiry-element" class="stripe-element" />
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
          <div id="card-cvc-element" class="stripe-element" />
          {#if (formSubmitted && (cardCvcEmpty || !cardCvcComplete)) || cardCvcError}
            <p class="text-fs-ds-12 mt-1 text-red-300">
              {cardCvcError || 'Please enter CVV'}
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
      <h3 class="text-lg font-medium text-white">Billing Address Details</h3>
      <div class="grid grid-cols-2 gap-4">
        <div class="form-group">
          <Input
            label="Name"
            bind:value={billingName}
            required={true}
            placeholder="Enter Full Name"
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
            placeholder="Enter Billing Email"
            hasError={formSubmitted && !billingEmail}
            errorMessage="Please enter billing email"
          />
        </div>
        <div class="form-group">
          <Input
            label="Address Line 1"
            bind:value={line1}
            required={true}
            placeholder="Enter Street Address"
            hasError={formSubmitted && !line1}
            errorMessage="Please enter street address"
          />
        </div>

        <div class="form-group">
          <Input
            label="Address Line 2"
            bind:value={line2}
            placeholder="Apartment, Suite, etc. (optional)"
          />
        </div>

        <div class="form-group">
          <label class="text-fs-ds-14 font-inter mb-2 block text-neutral-200">
            Country <span class="text-red-400">*</span>
          </label>
          <div on:click|stopPropagation|preventDefault>
            <!-- Added wrapper with event modifiers -->
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
        </div>

        <div class="form-group">
          <Input
            label="City"
            bind:value={city}
            required={true}
            placeholder="Enter City"
            hasError={formSubmitted && !city}
            errorMessage="Please enter city"
          />
        </div>
        <div class="form-group">
          <Input
            label="State/Province"
            bind:value={state}
            required={true}
            placeholder="Enter State"
            hasError={formSubmitted && !state}
            errorMessage="Please enter state"
          />
        </div>
        <div class="form-group">
          <Input
            label="ZIP Code"
            bind:value={postalCode}
            required={true}
            placeholder="Enter ZIP Code"
            hasError={formSubmitted && !postalCode}
            errorMessage="Please enter ZIP code"
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
