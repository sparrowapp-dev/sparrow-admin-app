<script>
  import { userEmail, userId, userName } from '@/store/auth';
  import { onMount, onDestroy, createEventDispatcher } from 'svelte';
  import Input from '@/ui/Input/Input.svelte';
  import Button from '@/ui/Button/Button.svelte';
  import { notification } from '@/components/Toast';
  import CloseIcon from '@/assets/icons/CloseIcon.svelte';
  import { billingService } from '@/services/billing.service';
  import { useLocation } from 'svelte-routing';

  const dispatch = createEventDispatcher();
  const location = useLocation();

  // Props
  export let customerId = null; // Can be null initially if no customer exists yet

  // State
  let isLoading = false;
  let error = null;
  let success = false;
  let stripe;
  let elements;
  let stripeElements = [];
  let cardNumber;
  let cardExpiry;
  let cardCvc;
  let cardholderName = '';
  let formSubmitted = false;
  let hubId = null;

  // Field validation states
  let cardNumberEmpty = true;
  let cardExpiryEmpty = true;
  let cardCvcEmpty = true;
  let cardNumberComplete = false;
  let cardExpiryComplete = false;
  let cardCvcComplete = false;
  let cardNumberError = null;
  let cardExpiryError = null;
  let cardCvcError = null;

  // Parse the hub ID from the URL path
  $: {
    const pathParts = $location?.pathname?.split('/') || [];
    // The hub ID should be the last segment in the URL
    const lastPart = pathParts[pathParts.length - 1];
    // Check if the last part looks like a valid ID (simple validation)
    if (lastPart && lastPart.length > 20) {
      hubId = lastPart;
    }
  }

  // Lifecycle
  onMount(async () => {
    // Load Stripe.js
    if (!window.Stripe) {
      const script = document.createElement('script');
      script.src = 'https://js.stripe.com/v3/';
      script.async = true;
      document.body.appendChild(script);

      script.onload = initializeStripe;
    } else {
      initializeStripe();
    }
  });

  onDestroy(() => {
    // Clean up all stripe elements
    if (stripeElements.length) {
      stripeElements.forEach((element) => {
        if (element) element.destroy();
      });
    }
  });

  // Initialize Stripe with the publishable key from our API
  async function initializeStripe() {
    try {
      // Fetch the publishable key from our backend using the service
      const { publishableKey } = await billingService.getStripeConfig();

      // Initialize Stripe
      stripe = window.Stripe(publishableKey);

      // Common styling for all elements
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

      // Create Elements instance
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

      // Create individual elements
      cardNumber = elements.create('cardNumber', {
        style: baseStyle,
        placeholder: 'Enter Card Number',
        showIcon: true,
      });

      cardExpiry = elements.create('cardExpiry', {
        style: baseStyle,
        placeholder: 'MM / YY',
      });

      cardCvc = elements.create('cardCvc', {
        style: baseStyle,
        placeholder: 'Enter CVV',
      });

      // Store all elements for cleanup
      stripeElements = [cardNumber, cardExpiry, cardCvc];

      // Mount elements to their containers
      cardNumber.mount('#card-number-element');
      cardExpiry.mount('#card-expiry-element');
      cardCvc.mount('#card-cvc-element');

      // Listen for errors and changes on each element
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
      error = err.message;
      console.error('Error initializing Stripe:', err);
    }
  }

  async function handleSubmit() {
    if (isLoading) return;
    formSubmitted = true;

    // Validate all required fields
    if (
      cardNumberEmpty ||
      !cardNumberComplete ||
      cardExpiryEmpty ||
      !cardExpiryComplete ||
      cardCvcEmpty ||
      !cardCvcComplete ||
      !cardholderName.trim()
    ) {
      error = 'Please fill in all required fields correctly';
      return;
    }

    // Check for specific field errors
    if (cardNumberError || cardExpiryError || cardCvcError) {
      error = 'Please correct the errors in the form';
      return;
    }

    try {
      isLoading = true;
      error = null;

      // Step 1: Create a customer if we don't have one
      if (!customerId) {
        // Use billing service to create customer
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

        // Save the customer ID in our database with hub ID
        await billingService.saveCustomerId(customerId, hubId);
      }

      // Step 2: Create a setup intent for the customer using the service
      const { clientSecret } = await billingService.createSetupIntent(customerId);

      // Step 3: Confirm the card setup
      const result = await stripe.confirmCardSetup(clientSecret, {
        payment_method: {
          card: cardNumber,
          billing_details: {
            name: cardholderName,
          },
        },
      });

      if (result.error) {
        throw new Error(result.error.message);
      }

      // Success! The card has been saved
      success = true;

      notification.success('New card added successfully.');

      // Dispatch event to notify parent component
      dispatch('paymentMethodAdded', {
        customerId,
        paymentMethodId: result.setupIntent.payment_method,
      });

      // Redirect to the payment methods list after a short delay
      setTimeout(() => {
        dispatch('close');
      }, 1000);
    } catch (err) {
      error = err.message;
      console.error('Error adding payment method:', err);
      notification.error('Failed to add a new card. Please try again.');
    } finally {
      isLoading = false;
    }
  }

  function goBack() {
    dispatch('close');
  }
</script>

<div class="bg-surface-600 w-[650px] rounded-lg p-7">
  <div class="header flex items-start justify-between">
    <div>
      <h2 class="text-xl font-medium text-white">Add a New Card</h2>
      <p class="text-sm text-gray-400">Enter your card details for your upcoming invoices.</p>
    </div>
    <button on:click={goBack} class="cursor-pointer">
      <CloseIcon />
    </button>
  </div>

  <form on:submit|preventDefault={handleSubmit} class="pt-8 pb-5">
    <div class="space-y-5">
      <!-- Payment form in 2x2 grid -->
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
            class="rounded-sm border p-2.5 text-neutral-50 {(formSubmitted &&
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

        <!-- Cardholder Name -->
        <div class="form-group">
          <Input
            label="Cardholder Name"
            id="cardholder-name"
            name="cardholderName"
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
    </div>

    <div class="form-actions mt-8 flex justify-end gap-3">
      <Button
        size="medium"
        type="button"
        variant="filled-secondary"
        on:click={goBack}
        disabled={isLoading}
      >
        Cancel
      </Button>
      <Button size="medium" type="submit" variant="filled-primary" disabled={isLoading}>
        {#if isLoading}
          <span class="flex items-center justify-center"> Adding... </span>
        {:else}
          Add
        {/if}
      </Button>
    </div>
  </form>
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
