<script lang="ts">
  // Svelte
  import { onMount, onDestroy, createEventDispatcher } from 'svelte';
  import { useLocation } from 'svelte-routing';

  // Store
  import { userEmail, userId, userName } from '@/store/auth';

  // Services
  import { billingService } from '@/services/billing.service';

  // Utils
  import { initializeStripe, createCardElements, StripeElement } from '@/utils/stripeUtils';

  // Constants / Options
  import { countryOptions } from './CountryList';

  // UI Components
  import Input from '@/ui/Input/Input.svelte';
  import Button from '@/ui/Button/Button.svelte';
  import CircularLoader from '@/ui/CircularLoader/CircularLoader.svelte';
  import SearchableDropdown from '@/ui/SearchableDropdown/SearchableDropdown.svelte';

  // Icons
  import CloseIcon from '@/assets/icons/CloseIcon.svelte';
  import CheckboxChecked from '@/assets/icons/CheckboxChecked.svelte';
  import CheckboxUnchecked from '@/assets/icons/CheckboxUnchecked.svelte';

  // App Utilities
  import { notification } from '@/components/Toast';
    import { captureEvent } from '@/utils/posthogConfig';

  const dispatch = createEventDispatcher();
  const location = useLocation();

  // Props
  export let customerId = '';
  export let paymentMethodId = '';
  export let hubId = '';
  export let isDefault = false;
  export let isFirstCard = false;

  // State variables
  let isLoading = false;
  let isSaving = false;
  let error: string | null = null;
  let formSubmitted = false;
  let isEditMode = false;

  // Payment method related state
  let existingPaymentMethod: any = null;
  let stripe: any;
  let elements: any;
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
  let cardNumberError: string | null = null;
  let cardExpiryError: string | null = null;
  let cardCvcError: string | null = null;

  // Billing address fields (billingName serves as both cardholder name and billing name)
  let billingName = '';
  let billingEmail = '';
  let line1 = '';
  let line2 = '';
  let city = '';
  let state = '';
  let postalCode = '';
  let country: { label: string; value: string } | null = null;
  let defaultPaymentMethod = false;

  // Initialize defaultPaymentMethod - force true if it's the first card
  $: {
    if (isFirstCard) {
      defaultPaymentMethod = true;
    } else {
      defaultPaymentMethod = isDefault;
    }
  }

  // Parse the hub ID from the URL path if not provided as prop
  $: {
    if (!hubId) {
      const pathParts = $location?.pathname?.split('/') || [];
      const lastPart = pathParts[pathParts.length - 1];
      if (lastPart && lastPart.length > 20) {
        hubId = lastPart;
      }
    }
  }

  // Set edit mode based on paymentMethodId
  $: {
    isEditMode = !!paymentMethodId;
    if (isEditMode) {
      isLoading = true;
    }
  }

  // Lifecycle
  onMount(async () => {
    if (isEditMode) {
      // If we're in edit mode, fetch the existing payment method
      await fetchPaymentMethod();
    } else {
      // Otherwise, initialize Stripe for a new payment method
      await initializeStripeElements();
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

  // Fetch existing payment method details when in edit mode
  async function fetchPaymentMethod() {
    try {
      isLoading = true;
      error = null;

      // Use billing service to fetch payment method
      const data = await billingService.getPaymentMethod(paymentMethodId);
      existingPaymentMethod = data.paymentMethod;

      // Pre-fill card details (read-only in edit mode)
      if (existingPaymentMethod.card) {
        billingName = existingPaymentMethod.billing_details?.name || '';
      }

      // Pre-fill billing details
      if (existingPaymentMethod.billing_details) {
        billingName = existingPaymentMethod.billing_details.name || '';
        billingEmail = existingPaymentMethod.billing_details.email || '';

        if (existingPaymentMethod.billing_details.address) {
          line1 = existingPaymentMethod.billing_details.address.line1 || '';
          line2 = existingPaymentMethod.billing_details.address.line2 || '';
          city = existingPaymentMethod.billing_details.address.city || '';
          state = existingPaymentMethod.billing_details.address.state || '';
          postalCode = existingPaymentMethod.billing_details.address.postal_code || '';

          // Set country for dropdown if available
          const countryCode = existingPaymentMethod.billing_details.address.country;
          if (countryCode) {
            country = countryOptions.find((c) => c.value === countryCode) || null;
          }
        }
      }
    } catch (err: any) {
      error = err.message;
      console.error('Error fetching payment method:', err);
    } finally {
      isLoading = false;
    }
  }

  // Initialize Stripe with the publishable key from our API
  async function initializeStripeElements() {
    try {
      // Initialize Stripe using our utility function
      stripe = await initializeStripe();

      // Create and set up card elements using our utility
      let { elements: stripeElements, cardElements } = createCardElements(stripe);
      elements = stripeElements;

      // Destructure the card elements
      cardNumber = cardElements.cardNumber;
      cardExpiry = cardElements.cardExpiry;
      cardCvc = cardElements.cardCvc;

      // Store all elements for cleanup
      stripeElements = [cardNumber, cardExpiry, cardCvc];

      // Mount elements to their containers
      cardNumber.mount('#card-number-element');
      cardExpiry.mount('#card-expiry-element');
      cardCvc.mount('#card-cvc-element');

      // Listen for errors and changes on each element
      function handleElementChange(event: any) {
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

      // Setup initial billingEmail from user email
      if (!billingEmail && $userEmail) {
        billingEmail = $userEmail;
      }

      isLoading = false;
    } catch (err: any) {
      error = err.message;
      console.error('Error initializing Stripe:', err);
      isLoading = false;
    }
  }

  // Email validation function
  function isValidEmail(email: string): boolean {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  }

  // Form submission handler
  async function handleSubmit() {
    if (isSaving) return;
    formSubmitted = true;

    if (isEditMode) {
      // Update billing details only mode
      await handleBillingDetailsUpdate();
    } else {
      // Create new payment method with billing details
      await handleNewPaymentMethod();
    }
  }

  // Handle creating a new payment method with billing details
  async function handleNewPaymentMethod() {
    // Force default to true if it's the first card
    captureUserNewBillingCard();
    if (isFirstCard) {
      defaultPaymentMethod = true;
    }
    // Validate card fields
    if (
      cardNumberEmpty ||
      !cardNumberComplete ||
      cardExpiryEmpty ||
      !cardExpiryComplete ||
      cardCvcEmpty ||
      !cardCvcComplete ||
      !billingName.trim()
    ) {
      error = 'Please fill in all card information correctly';
      return;
    }

    // Validate specific card field errors
    if (cardNumberError || cardExpiryError || cardCvcError) {
      error = 'Please correct the errors in the card information';
      return;
    }

    // Validate billing details fields
    if (
      !billingName.trim() ||
      !billingEmail.trim() ||
      !line1.trim() ||
      !city.trim() ||
      !state.trim() ||
      !postalCode.trim() ||
      !country
    ) {
      error = 'Please fill in all required billing details';
      return;
    }

    // Validate email format
    if (!isValidEmail(billingEmail)) {
      error = 'Please enter a valid email address';
      return;
    }

    try {
      isSaving = true;
      error = null;

      // Step 1: Create a customer if we don't have one
      if (!customerId) {
        // Use billing service to create customer - use billingName for customer
        const customerData = {
          name: billingName,
          email: billingEmail,
          metadata: {
            source: 'sparrow-admin-app',
            name: $userName,
            userId: $userId,
          },
        };

        // stripe api requires a hub ID to create a customer
        const { customer } = await billingService.createCustomer(customerData);
        customerId = customer.id;

        // Save the customer ID in our database with hub ID
        if (hubId) {
          await billingService.saveCustomerId(customerId, hubId);
        }
      }

      // Step 2: Create a setup intent for the customer using the service
      const { clientSecret } = await billingService.createSetupIntent(customerId);

      // Step 3: Confirm the card setup with billing details
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
              country: country.value,
            },
          },
        },
      });

      if (result.error) {
        throw new Error(result.error.message);
      }

      // Step 4: Set as default payment method if selected
      if (defaultPaymentMethod && result.setupIntent.payment_method) {
        await billingService.setUpDefaultPaymentMethod(
          customerId,
          result.setupIntent.payment_method,
        );
      }

      // Success!
      notification.success('New card added successfully.');

      // Dispatch event to notify parent component
      dispatch('paymentMethodAdded', {
        customerId,
        paymentMethodId: result.setupIntent.payment_method,
      });

      // Close modal after short delay

      dispatch('close');
    } catch (err: any) {
      error = err.message;
      console.error('Error adding payment method:', err);
      if (typeof err === 'string') {
        notification.error(err);
      } else if (err?.message && typeof err.message === 'string') {
        notification.error(err.message);
      } else {
        notification.error('Failed to add a new card. Please try again.');
      }
    } finally {
      isSaving = false;
    }
  }

  // Handle updating just the billing details for existing payment method
  async function handleBillingDetailsUpdate() {
    // Validate billing details fields
    if (
      !billingName.trim() ||
      !billingEmail.trim() ||
      !line1.trim() ||
      !city.trim() ||
      !state.trim() ||
      !postalCode.trim() ||
      !country
    ) {
      error = 'Please fill in all required fields';
      return;
    }

    try {
      isSaving = true;
      error = null;

      const billingDetails = {
        name: billingName,
        email: billingEmail,
        address: {
          line1,
          line2: line2 || undefined,
          city,
          state,
          postal_code: postalCode,
          country: country.value,
        },
      };

      // Use billing service to update billing details
      await billingService.updateBillingDetails(paymentMethodId, billingDetails);

      // Set as default payment method if selected or remove default if unselected
      // Track whether the default status changed for notification
      let defaultStatusChanged = false;

      if (defaultPaymentMethod !== isDefault) {
        defaultStatusChanged = true;
        await billingService.setUpDefaultPaymentMethod(customerId, paymentMethodId);
      }
      captureUpdateBillingCardDetails();
      notification.success('Card details updated successfully.');

      // Dispatch event to notify parent component with updated information
      dispatch('billingDetailsUpdated', {
        paymentMethodId,
        defaultStatusChanged,
        isNowDefault: defaultPaymentMethod,
      });

      // Close modal
      dispatch('close');
    } catch (err: any) {
      error = err.message;
      console.error('Error updating billing details:', err);
      notification.error('Failed to update card details. Please try again.');
    } finally {
      isSaving = false;
    }
  }

  function goBack() {
    dispatch('close');
  }

  const captureUpdateBillingCardDetails = () =>{
    const eventProperties = {
      button_name:"save"
    }
    captureEvent("billing_address_updated",eventProperties)
  }

  const captureUserNewBillingCard = () =>{
    const eventProperties = {
      button_name:"Add"
    }
    captureEvent("card_details_added",eventProperties);
  }
</script>

<div class="bg-surface-600 w-[650px] rounded-lg p-7">
  <div class="header flex items-start justify-between">
    <div>
      <h2 class="text-fs-ds-20 font-fw-ds-500 text-white">
        {#if isEditMode}
          Edit Details
        {:else}
          Add a New Card
        {/if}
      </h2>
      <p class="text-fs-ds-14 font-fw-ds-300 text-neutral-100">
        {#if isEditMode}
          You can’t change the card here, but feel free to update the billing address.
        {:else}
          Securely add your card and billing address to complete the payment.
        {/if}
      </p>
    </div>
    <button on:click={goBack} class="cursor-pointer">
      <CloseIcon />
    </button>
  </div>

  {#if isLoading}
    <div class="flex justify-center py-16">
      <CircularLoader />
    </div>
  {:else}
    <form on:submit|preventDefault={handleSubmit} class="pt-8 pb-5">
      <div class="max-h-[60vh] overflow-y-auto">
        {#if !isEditMode}
          <!-- Card Details Section (only shown in create mode) -->
          <section class="mb-6 space-y-5">
            <h3 class="text-fs-ds-16 font-fw-ds-400 text-neutral-50">Card Details</h3>
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
                  inputType="name"
                  bind:value={billingName}
                  required={true}
                  placeholder="Enter Cardholder Name"
                  disabled={isSaving}
                  hasError={formSubmitted && !billingName.trim()}
                  errorMessage={formSubmitted && !billingName.trim()
                    ? 'Please enter cardholder name'
                    : ''}
                />
              </div>
            </div>
          </section>
        {/if}

        {#if isEditMode && existingPaymentMethod}
          <!-- Card Summary (read-only, only in edit mode) -->
          <section class="mb-6">
            <h3 class="text-fs-ds-16 font-fw-ds-400 mb-4 text-neutral-50">Card Details</h3>

            <div class="flex flex-col gap-5">
              <div class="grid grid-cols-2 gap-5">
                <!-- Card Number -->
                <div class="flex flex-col">
                  <label class="text-fs-ds-14 font-fw-ds-400 mb-2 text-neutral-200"
                    >Card Number <span class="text-red-400">*</span></label
                  >
                  <div class="flex items-center gap-2">
                    <span class="text-fs-ds-14 font-fw-ds-400 ml-2 text-neutral-500"
                      >•••• •••• ••••</span
                    >
                    <span class="text-fs-ds-14 font-fw-ds-400 text-neutral-500">
                      {existingPaymentMethod?.card?.last4 || '****'}
                    </span>
                  </div>
                </div>

                <!-- Expiration Date -->
                <div class="flex flex-col">
                  <label class="text-fs-ds-14 font-fw-ds-400 mb-2 text-neutral-200"
                    >Expiration Date <span class="text-red-400">*</span></label
                  >
                  <span class="text-fs-ds-14 font-fw-ds-400 ml-2 text-neutral-500">
                    {existingPaymentMethod?.card?.exp_month || 'MM'}/{existingPaymentMethod?.card
                      ?.exp_year || 'YY'}
                  </span>
                </div>
              </div>

              <div class="grid grid-cols-2 gap-5">
                <!-- CVV -->
                <div class="flex flex-col">
                  <label class="text-fs-ds-14 font-fw-ds-400 mb-2 text-neutral-200"
                    >CVV <span class="text-red-400">*</span></label
                  >
                  <span class="text-fs-ds-14 font-fw-ds-400 ml-2 text-neutral-500">***</span>
                </div>

                <!-- Cardholder Name -->
                <div class="flex flex-col">
                  <label class="text-fs-ds-14 font-fw-ds-400 mb-2 text-neutral-200"
                    >Cardholder Name <span class="text-red-400">*</span></label
                  >
                  <span class="text-fs-ds-14 font-fw-ds-400 ml-2 text-neutral-500">
                    {existingPaymentMethod?.billing_details?.name || ''}
                  </span>
                </div>
              </div>
            </div>
          </section>
        {/if}
        <!-- Separator between card and billing sections -->
        <div class="my-6 border-t border-neutral-500"></div>
        <!-- Billing Address Section - Always shown -->
        <section class="space-y-5">
          <h3 class="text-fs-ds-16 font-fw-ds-400 text-neutral-50">Billing Address Details</h3>
          <div class="grid grid-cols-2 gap-4">
            <!-- Name -->
            <div class="form-group">
              <Input
                label="Name"
                id="billing-name"
                name="billingName"
                inputType="name"
                bind:value={billingName}
                required={true}
                placeholder="Enter Name"
                disabled={isSaving}
                hasError={formSubmitted && !billingName.trim()}
                errorMessage={formSubmitted && !billingName.trim()
                  ? 'Please enter a valid name'
                  : ''}
              />
            </div>

            <!-- Email -->
            <div class="form-group">
              <Input
                label="Billing Email"
                id="billing-email"
                name="billingEmail"
                inputType="email"
                bind:value={billingEmail}
                required={true}
                placeholder="Enter Billing Email"
                disabled={isSaving}
                hasError={formSubmitted && !billingEmail.trim()}
                errorMessage={formSubmitted && !billingEmail.trim()
                  ? 'Please enter valid billing email'
                  : ''}
                emailErrorMessage="Please enter valid billing email"
              />
            </div>

            <!-- Address Line 1 -->
            <div class="form-group">
              <Input
                label="Address Line 1"
                id="line1"
                name="line1"
                bind:value={line1}
                required={true}
                placeholder="Enter Address Line 1"
                disabled={isSaving}
                hasError={formSubmitted && !line1.trim()}
                errorMessage={formSubmitted && !line1.trim() ? 'Please enter your address' : ''}
              />
            </div>

            <!-- Address Line 2 -->
            <div class="form-group">
              <Input
                label="Address Line 2"
                id="line2"
                name="line2"
                bind:value={line2}
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
                  bind:selected={country}
                  placeholder="Select Country"
                  searchPlaceholder="Search Country"
                  disabled={isSaving}
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

            <!-- City -->
            <div class="form-group">
              <Input
                label="City"
                id="city"
                name="city"
                bind:value={city}
                required={true}
                placeholder="Enter City"
                disabled={isSaving}
                hasError={formSubmitted && !city.trim()}
                errorMessage={formSubmitted && !city.trim() ? 'Please enter a valid city' : ''}
              />
            </div>

            <!-- State -->
            <div class="form-group">
              <Input
                label="State"
                id="state"
                name="state"
                bind:value={state}
                required={true}
                placeholder="Enter State"
                disabled={isSaving}
                hasError={formSubmitted && !state.trim()}
                errorMessage={formSubmitted && !state.trim() ? 'Please enter a valid state' : ''}
              />
            </div>

            <!-- ZIP Code -->
            <div class="form-group">
              <Input
                label="ZIP Code"
                id="postalCode"
                name="postalCode"
                inputType="postal"
                bind:value={postalCode}
                required={true}
                placeholder="Enter ZIP Code"
                disabled={isSaving}
                hasError={formSubmitted && !postalCode.trim()}
                errorMessage={formSubmitted && !postalCode.trim()
                  ? 'Please enter a valid ZIP or postal code'
                  : ''}
              />
            </div>
          </div>

          <!-- Default payment method checkbox -->
          <div
            class="text-fs-ds-14 leading-lh-ds-143 text-fw-ds-300 mt-2 flex cursor-pointer items-center gap-1 text-neutral-50"
          >
            <span on:click={() => !isFirstCard && (defaultPaymentMethod = !defaultPaymentMethod)}>
              {#if defaultPaymentMethod}
                <CheckboxChecked />
              {:else}
                <CheckboxUnchecked />
              {/if}
            </span>
            <span
              on:click={() => !isFirstCard && (defaultPaymentMethod = !defaultPaymentMethod)}
              class="text-fs-ds-14 font-fw-ds-300 cursor-pointer text-neutral-100"
            >
              Set this card as default payment method
            </span>
          </div>
        </section>
      </div>
      <div class="form-actions mt-8 flex justify-end gap-3">
        <Button
          size="medium"
          type="button"
          variant="filled-secondary"
          on:click={goBack}
          disabled={isSaving}
        >
          Cancel
        </Button>
        <Button size="medium" type="submit" variant="filled-primary" disabled={isSaving}>
          {#if isSaving}
            <span class="flex items-center justify-center">
              {isEditMode ? 'Updating...' : 'Adding...'}
            </span>
          {:else if isEditMode}
            Save
          {:else}
            Add
          {/if}
        </Button>
      </div>
    </form>
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
