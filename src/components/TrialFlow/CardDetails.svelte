<script lang="ts">
  import { onMount, onDestroy, createEventDispatcher } from 'svelte';
  import Input from '@/ui/Input/Input.svelte';
  import CircularLoader from '@/ui/CircularLoader/CircularLoader.svelte';
  import SearchableDropdown from '@/ui/SearchableDropdown/SearchableDropdown.svelte';
  import CheckboxChecked from '@/assets/icons/CheckboxChecked.svelte';
  import CheckboxUnchecked from '@/assets/icons/CheckboxUnchecked.svelte';

  // Import the store for user information
  import { userEmail, userId, userName } from '@/store/auth';

  // Stripe utils
  import { initializeStripe, createCardElements, StripeElement } from '@/utils/stripeUtils';
  import { countryOptions } from '@/pages/Payment/PaymentInformation/PaymentModules/CountryList';

  // Billing service for any API calls
  import { billingService } from '@/services/billing.service';
  import { notification } from '@/components/Toast';

  const dispatch = createEventDispatcher();

  export let formData;
  export let handleInputChange;
  export let customerId = '';

  let activeView = 'cardDetails'; // Options: 'cardDetails' or 'billingDetails'
  let isLoading = true;
  let isSaving = false;
  let formSubmitted = false;
  let error = null;

  // Stripe related variables
  let stripe;
  let elements;
  let stripeElements: StripeElement[] = [];

  // Card fields
  let cardNumber: StripeElement;
  let cardExpiry: StripeElement;
  let cardCvc: StripeElement;

  // Field validation states for card elements
  let cardNumberEmpty = true;
  let cardExpiryEmpty = true;
  let cardCvcEmpty = true;
  let cardNumberComplete = false;
  let cardExpiryComplete = false;
  let cardCvcComplete = false;
  let cardNumberError = null;
  let cardExpiryError = null;
  let cardCvcError = null;

  // Safety timeout to prevent infinite loading
  const safetyTimeout = setTimeout(() => {
    if (isLoading) {
      isLoading = false;
      error = error || 'Stripe elements initialization timed out. Please refresh and try again.';
    }
  }, 5000);

  let previousView = activeView;

  function switchView(view) {
    previousView = activeView;
    activeView = view;
    dispatch('viewChange', activeView);

    // If switching back to card details, we need to remount elements
    if (view === 'cardDetails' && previousView === 'billingDetails') {
      setTimeout(() => {
        remountCardElements();
      }, 50);
    }
  }

  // Export this function to allow parent to switch view
  export function setView(view) {
    previousView = activeView;
    activeView = view;

    // If switching back to card details, we need to remount elements
    if (view === 'cardDetails' && previousView === 'billingDetails') {
      setTimeout(() => {
        remountCardElements();
      }, 50);
    }
  }

  // Add this function to handle remounting elements
  function remountCardElements() {
    // Don't proceed if elements aren't initialized
    if (!cardNumber || !cardExpiry || !cardCvc) {
      console.error('Cannot remount - Stripe elements not initialized');
      return;
    }

    // Check for DOM elements
    const cardNumberEl = document.getElementById('card-number-element');
    const cardExpiryEl = document.getElementById('card-expiry-element');
    const cardCvcEl = document.getElementById('card-cvc-element');

    if (!cardNumberEl || !cardExpiryEl || !cardCvcEl) {
      console.error('Cannot remount - Card element containers not found in DOM');
      return;
    }
    // Mount elements
    setTimeout(() => {
      cardNumber.mount('#card-number-element');
      cardExpiry.mount('#card-expiry-element');
      cardCvc.mount('#card-cvc-element');
    }, 0);
  }

  // Initialize Stripe and create elements
  async function initializeStripeElements() {
    try {
      // Initialize Stripe
      stripe = await initializeStripe();

      // Create and set up card elements
      const { elements: els, cardElements } = createCardElements(stripe);
      elements = els;

      // Get card elements
      cardNumber = cardElements.cardNumber;
      cardExpiry = cardElements.cardExpiry;
      cardCvc = cardElements.cardCvc;

      // Store all elements for cleanup
      stripeElements = [cardNumber, cardExpiry, cardCvc];

      // Set up event listeners for card elements
      function handleElementChange(event) {
        if (event.elementType === 'cardNumber') {
          cardNumberEmpty = event.empty;
          cardNumberComplete = event.complete;
          cardNumberError = event.error ? event.error.message : null;
        } else if (event.elementType === 'cardExpiry') {
          cardExpiryEmpty = event.empty;
          cardExpiryComplete = event.complete;
          cardExpiryError = event.error ? event.error.message : null;
        } else if (event.elementType === 'cardCvc') {
          cardCvcEmpty = event.empty;
          cardCvcComplete = event.complete;
          cardCvcError = event.error ? event.error.message : null;
        }

        // Set general error message if any field has an error
        if (event.error) {
          error = event.error.message;
        } else {
          error = null;
        }
      }

      cardNumber.on('change', handleElementChange);
      cardExpiry.on('change', handleElementChange);
      cardCvc.on('change', handleElementChange);
    } catch (err) {
      console.error('Error initializing Stripe:', err);
      error = err.message || 'Failed to initialize payment system';
    }
  }

  // Mount elements to DOM after DOM is ready
  function mountStripeElements() {
    try {
      // Check if elements exist
      if (!cardNumber || !cardExpiry || !cardCvc) {
        console.error('Stripe elements not initialized');
        error = 'Failed to initialize payment form elements';
        isLoading = false;
        return;
      }

      // Check for DOM elements
      const cardNumberEl = document.getElementById('card-number-element');
      const cardExpiryEl = document.getElementById('card-expiry-element');
      const cardCvcEl = document.getElementById('card-cvc-element');

      if (!cardNumberEl || !cardExpiryEl || !cardCvcEl) {
        console.error('Card element containers not found in DOM');
        error = 'Failed to initialize payment form elements';
        isLoading = false;
        return;
      }

      // Mount elements
      cardNumber.mount('#card-number-element');
      cardExpiry.mount('#card-expiry-element');
      cardCvc.mount('#card-cvc-element');

      // Setup initial billingEmail from user email if available
      if (!formData.billingEmail && $userEmail) {
        handleInputChange('billingEmail', $userEmail);
      }

      // Done loading
      isLoading = false;

      // Clear safety timeout
      clearTimeout(safetyTimeout);
    } catch (err) {
      console.error('Error mounting Stripe elements:', err);
      error = 'There was an issue setting up the payment form. Please refresh and try again.';
      isLoading = false;
    }
  }

  onMount(async () => {
    // Initialize Stripe first
    await initializeStripeElements();

    // Wait a short time to ensure DOM is ready
    setTimeout(() => {
      mountStripeElements();
    }, 100);
  });

  onDestroy(() => {
    // Clean up Stripe elements
    if (stripeElements.length) {
      stripeElements.forEach((element) => {
        if (element) {
          try {
            element.unmount();
            element.destroy();
          } catch (e) {
            console.error('Error cleaning up Stripe element:', e);
          }
        }
      });
    }

    // Clear safety timeout
    clearTimeout(safetyTimeout);
  });

  // Email validation function
  function isValidEmail(email) {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  }

  // Validate form fields
  function validateForm() {
    formSubmitted = true;

    if (activeView === 'cardDetails') {
      // Validate card fields
      if (
        cardNumberEmpty ||
        !cardNumberComplete ||
        cardExpiryEmpty ||
        !cardExpiryComplete ||
        cardCvcEmpty ||
        !cardCvcComplete ||
        !formData.cardholderName?.trim()
      ) {
        error = 'Please fill in all card information correctly';
        return false;
      }

      // Check for specific card errors
      if (cardNumberError || cardExpiryError || cardCvcError) {
        error = 'Please correct the errors in the card information';
        return false;
      }

      return true;
    } else {
      // Validate billing details
      if (
        !formData.billingName?.trim() ||
        !formData.billingEmail?.trim() ||
        !formData.billingAddress?.trim() ||
        !formData.billingCity?.trim() ||
        !formData.billingState?.trim() ||
        !formData.billingZip?.trim() ||
        !formData.billingCountry
      ) {
        error = 'Please fill in all required billing details';
        return false;
      }

      // Validate email format
      if (!isValidEmail(formData.billingEmail)) {
        error = 'Please enter a valid email address';
        return false;
      }

      return true;
    }
  }

  // Process payment information (called from parent component)
  export async function processPayment() {
    if (isSaving) return { success: false, error: 'Processing in progress' };

    if (!validateForm()) {
      return { success: false, error };
    }

    try {
      isSaving = true;
      error = null;

      // Step 1: Create a customer if we don't have one
      if (!customerId) {
        const customerData = {
          name: formData.billingName || formData.cardholderName,
          email: formData.billingEmail,
          metadata: {
            source: 'sparrow-admin-app-trial',
            name: $userName || formData.billingName,
            userId: $userId,
          },
        };

        const { customer } = await billingService.createCustomer(customerData);
        customerId = customer.id;

        // Emit event to update the parent with customerId
        dispatch('customerCreated', { customerId });
      }

      // Step 2: Create a setup intent for the customer
      const { clientSecret } = await billingService.createSetupIntent(customerId);

      // Step 3: Confirm the card setup with billing details
      const result = await stripe.confirmCardSetup(clientSecret, {
        payment_method: {
          card: cardNumber,
          billing_details: {
            name: formData.billingName || formData.cardholderName,
            email: formData.billingEmail,
            address: {
              line1: formData.billingAddress,
              line2: formData.billingAddress2 || undefined,
              city: formData.billingCity,
              state: formData.billingState,
              postal_code: formData.billingZip,
              country: formData.billingCountry?.value,
            },
          },
        },
      });

      if (result.error) {
        throw new Error(result.error.message);
      }

      // Step 4: Set as default payment method if selected
      if (formData.isDefaultPayment && result.setupIntent.payment_method) {
        await billingService.setUpDefaultPaymentMethod(
          customerId,
          result.setupIntent.payment_method,
        );
      }

      // Success!
      notification.success('Payment method added successfully');

      // Return success and the payment method ID
      return {
        success: true,
        paymentMethodId: result.setupIntent.payment_method,
      };
    } catch (err) {
      error = err.message;
      console.error('Error adding payment method:', err);
      notification.error(error || 'Failed to add payment method. Please try again.');

      return {
        success: false,
        error: error,
      };
    } finally {
      isSaving = false;
    }
  }
</script>

<div class="flex flex-col gap-10">
  <div class="flex flex-col gap-5">
    <div class="text-fs-ds-24 font-fw-ds-500 text-center text-neutral-50">
      Step 2: Add Payment Details
    </div>
    <div class="mb-6 text-center">
      <p class="mx-auto max-w-2xl text-gray-300">
        To activate your trial of the Standard plan, we need your card details. You won't be charged
        until the trial ends.
      </p>
    </div>
  </div>

  <!-- Tab switcher -->
  <div class="border-surface-100 mx-auto flex w-full rounded-md border">
    <button
      class={`text-fs-ds-12 font-inter font-fw-ds-400 m-1 flex-1 cursor-pointer rounded-md py-1.5 ${activeView === 'cardDetails' ? 'bg-surface-600 text-white' : 'bg-transparent text-neutral-300'}`}
      on:click={() => switchView('cardDetails')}
      disabled={isLoading || isSaving}
    >
      Card Details
    </button>
    <button
      class={`text-fs-ds-12 font-inter font-fw-ds-400 m-1 flex-1 cursor-pointer rounded-md py-1.5 ${activeView === 'billingDetails' ? 'bg-surface-600 text-white' : 'bg-transparent text-neutral-300'}`}
      on:click={() => switchView('billingDetails')}
      disabled={isLoading || isSaving}
    >
      Billing Address Details
    </button>
  </div>

  {#if isLoading}
    <div class="flex justify-center py-8">
      <CircularLoader />
    </div>
  {:else if error && !cardNumberError && !cardExpiryError && !cardCvcError}
    <!-- General error message -->
    <div class="mb-4 rounded bg-red-500/10 p-3 text-red-300">
      {error}
    </div>
  {/if}

  <!-- Form content based on active view -->
  <div class={isLoading ? 'hidden' : ''}>
    {#if activeView === 'cardDetails'}
      <!-- Card Details Section -->
      <section class="mb-6 space-y-5">
        <div class="mb-4">
          <h3 class="text-fs-ds-16 font-fw-ds-400 mb-1 text-neutral-50">Card Details</h3>
          <p class="text-fs-ds-14 text-gray-300 text-neutral-200">
            Enter your card information to start your plan. You won't be charged until the trial
            ends.
          </p>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <!-- Card Number -->
          <div class="form-group">
            <label
              for="card-number-element"
              class="text-fs-ds-14 font-inter font-fw-ds-400 mb-2 block text-neutral-200"
            >
              Card Number <span class="text-red-400">*</span>
            </label>
            <div
              id="card-number-element"
              class="bg-surface-400 rounded-sm border p-2.5 text-neutral-50 {(formSubmitted &&
                (cardNumberEmpty || !cardNumberComplete)) ||
              cardNumberError
                ? 'border-red-300'
                : 'border-transparent'}"
            ></div>
            {#if (formSubmitted && (cardNumberEmpty || !cardNumberComplete)) || cardNumberError}
              <p class="text-fs-ds-12 mt-1 text-red-300">
                {cardNumberError || 'Please enter your card number'}
              </p>
            {/if}
          </div>

          <!-- Cardholder Name -->
          <div class="form-group">
            <Input
              label="Cardholder Name"
              id="cardholder-name"
              name="cardholderName"
              inputType="name"
              bind:value={formData.cardholderName}
              required={true}
              placeholder="Enter Cardholder Name"
              hasError={formSubmitted && !formData.cardholderName?.trim()}
              errorMessage={formSubmitted && !formData.cardholderName?.trim()
                ? 'Please enter cardholder name'
                : ''}
              disabled={isSaving}
            />
          </div>

          <!-- Expiration Date -->
          <div class="form-group">
            <label
              for="card-expiry-element"
              class="text-fs-ds-14 font-inter font-fw-ds-400 mb-2 block text-neutral-200"
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

          <!-- CVC/Security Code -->
          <div class="form-group">
            <label
              for="card-cvc-element"
              class="text-fs-ds-14 font-inter font-fw-ds-400 mb-2 block text-neutral-200"
            >
              CVV/Security Code <span class="text-red-400">*</span>
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
        </div>
      </section>
    {:else}
      <!-- Billing Address Section -->
      <section class="space-y-5">
        <div class="mb-4">
          <h3 class="text-fs-ds-16 font-fw-ds-400 mb-1 text-neutral-50">Billing Address Details</h3>
          <p class="text-fs-ds-14 text-neutral-200">
            Enter your billing address information to start your plan. We need your billing address
            for verification and invoicing purposes.
          </p>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <!-- Name -->
          <div class="form-group">
            <Input
              label="Name"
              id="billing-name"
              name="billingName"
              inputType="name"
              bind:value={formData.billingName}
              required={true}
              placeholder="Enter Name"
              hasError={formSubmitted && !formData.billingName?.trim()}
              errorMessage={formSubmitted && !formData.billingName?.trim()
                ? 'Please enter a valid name'
                : ''}
              disabled={isSaving}
            />
          </div>

          <!-- Email -->
          <div class="form-group">
            <Input
              label="Billing Email"
              id="billing-email"
              name="billingEmail"
              inputType="email"
              bind:value={formData.billingEmail}
              required={true}
              placeholder="Enter Billing Email"
              hasError={formSubmitted && !formData.billingEmail?.trim()}
              errorMessage={formSubmitted && !formData.billingEmail?.trim()
                ? 'Please enter valid billing email'
                : ''}
              disabled={isSaving}
            />
          </div>

          <!-- Address Line 1 -->
          <div class="form-group">
            <Input
              label="Address Line 1"
              id="line1"
              name="line1"
              bind:value={formData.billingAddress}
              required={true}
              placeholder="Enter Address Line 1"
              hasError={formSubmitted && !formData.billingAddress?.trim()}
              errorMessage={formSubmitted && !formData.billingAddress?.trim()
                ? 'Please enter your address'
                : ''}
              disabled={isSaving}
            />
          </div>

          <!-- Address Line 2 -->
          <div class="form-group">
            <Input
              label="Address Line 2"
              id="line2"
              name="line2"
              bind:value={formData.billingAddress2}
              placeholder="Enter Address Line 2"
              disabled={isSaving}
            />
          </div>

          <!-- Country -->
          <div class="form-group">
            <label class="text-fs-ds-14 font-inter font-fw-ds-400 mb-2 block text-neutral-200">
              Country <span class="text-red-400">*</span>
            </label>
            <div on:click|stopPropagation|preventDefault>
              <SearchableDropdown
                options={countryOptions}
                bind:selected={formData.billingCountry}
                placeholder="Select Country"
                searchPlaceholder="Search Country"
                variant="primary"
                width="w-full"
                hasError={formSubmitted && !formData.billingCountry}
                maxHeight="150px"
                disabled={isSaving}
                on:change={(e) => handleInputChange('billingCountry', e.detail)}
              />
            </div>
            {#if formSubmitted && !formData.billingCountry}
              <p class="text-fs-ds-12 mt-1 text-red-300">Please select your country</p>
            {/if}
          </div>

          <!-- City -->
          <div class="form-group">
            <Input
              label="City"
              id="city"
              name="city"
              bind:value={formData.billingCity}
              required={true}
              placeholder="Enter City"
              hasError={formSubmitted && !formData.billingCity?.trim()}
              errorMessage={formSubmitted && !formData.billingCity?.trim()
                ? 'Please enter a valid city'
                : ''}
              disabled={isSaving}
            />
          </div>

          <!-- State -->
          <div class="form-group">
            <Input
              label="State"
              id="state"
              name="state"
              bind:value={formData.billingState}
              required={true}
              placeholder="Enter State"
              hasError={formSubmitted && !formData.billingState?.trim()}
              errorMessage={formSubmitted && !formData.billingState?.trim()
                ? 'Please enter a valid state'
                : ''}
              disabled={isSaving}
            />
          </div>

          <!-- ZIP Code -->
          <div class="form-group">
            <Input
              label="ZIP Code"
              id="postalCode"
              name="postalCode"
              inputType="postal"
              bind:value={formData.billingZip}
              required={true}
              placeholder="Enter ZIP Code"
              hasError={formSubmitted && !formData.billingZip?.trim()}
              errorMessage={formSubmitted && !formData.billingZip?.trim()
                ? 'Please enter a valid ZIP or postal code'
                : ''}
              disabled={isSaving}
            />
          </div>
        </div>

        <!-- Default payment method checkbox -->
        <div
          class="text-fs-ds-14 leading-lh-ds-143 text-fw-ds-300 mt-2 flex cursor-pointer items-center gap-1 text-neutral-50"
        >
          <span
            on:click={() =>
              !isSaving && handleInputChange('isDefaultPayment', !formData.isDefaultPayment)}
          >
            {#if formData.isDefaultPayment}
              <CheckboxChecked />
            {:else}
              <CheckboxUnchecked />
            {/if}
          </span>
          <span
            on:click={() =>
              !isSaving && handleInputChange('isDefaultPayment', !formData.isDefaultPayment)}
            class="text-fs-ds-14 font-fw-ds-300 cursor-pointer text-neutral-100"
          >
            Set this card as default payment method
          </span>
        </div>
      </section>
    {/if}
  </div>

  {#if isSaving}
    <div class="flex justify-center py-4">
      <CircularLoader size="sm" />
      <span class="ml-2 text-white">Processing payment information...</span>
    </div>
  {/if}
</div>

<style>
  :global(.StripeElement) {
    background-color: #222630 !important;
    border: 1px solid transparent;
    border-radius: 4px;
    padding: 0.5rem;
    height: 38px;
    transition: all 0.2s;
  }

  :global(.StripeElement:hover) {
    border-color: #9b9da1; /* hover:border-neutral-300 */
  }

  :global(.StripeElement--focus) {
    border-color: #6894f9; /* focus:border-blue-300 */
    outline: none;
  }

  :global(.StripeElement--invalid) {
    border-color: #f37472; /* border-red-300 */
  }
</style>
