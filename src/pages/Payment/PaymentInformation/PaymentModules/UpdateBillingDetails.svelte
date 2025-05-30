<script>
  import { onMount, createEventDispatcher } from 'svelte';
  import Input from '@/ui/Input/Input.svelte';
  import Button from '@/ui/Button/Button.svelte';
  import CloseIcon from '@/assets/icons/CloseIcon.svelte';
  import CircularLoader from '@/ui/CircularLoader/CircularLoader.svelte';
  import { billingService } from '@/services/billing.service';
  import { notification } from '@/components/Toast';
  import SearchableDropdown from '@/ui/SearchableDropdown/SearchableDropdown.svelte';
  import { countryOptions } from './CountryList';

  const dispatch = createEventDispatcher();

  // Props
  export let paymentMethodId;

  // State
  let isLoading = true;
  let isSaving = false;
  let error = null;
  let success = false;
  let paymentMethod = null;
  let formSubmitted = false;
  let isEditMode = false;

  // Form data
  let name = '';
  let email = '';
  let line1 = '';
  let line2 = '';
  let city = '';
  let state = '';
  let postalCode = '';
  let country = null;

  onMount(async () => {
    await fetchPaymentMethod();
  });

  async function fetchPaymentMethod() {
    try {
      isLoading = true;
      error = null;

      // Use billing service instead of direct fetch
      const data = await billingService.getPaymentMethod(paymentMethodId);
      paymentMethod = data.paymentMethod;

      // Pre-fill form with existing data
      if (paymentMethod.billing_details) {
        name = paymentMethod.billing_details.name || '';
        email = paymentMethod.billing_details.email || '';

        if (paymentMethod.billing_details.address) {
          line1 = paymentMethod.billing_details.address.line1 || '';
          line2 = paymentMethod.billing_details.address.line2 || '';
          city = paymentMethod.billing_details.address.city || '';
          state = paymentMethod.billing_details.address.state || '';
          postalCode = paymentMethod.billing_details.address.postal_code || '';

          // Set country for dropdown if available
          const countryCode = paymentMethod.billing_details.address.country;
          if (countryCode) {
            country = countryOptions.find((c) => c.value === countryCode) || null;
          }

          // Check if we're in edit mode (if we have an address with line1)
          isEditMode = !!paymentMethod.billing_details.address.line1;
        }
      }
    } catch (err) {
      error = err.message;
      console.error('Error fetching payment method:', err);
    } finally {
      isLoading = false;
    }
  }

  function goBack() {
    dispatch('close');
  }

  async function handleSubmit() {
    if (isSaving) return;
    formSubmitted = true;

    // Validate required fields
    if (
      !name.trim() ||
      !email.trim() ||
      !line1.trim() ||
      !city.trim() ||
      !state.trim() ||
      !postalCode.trim() || // ZIP code is now required
      !country
    ) {
      error = 'Please fill in all required fields';
      return;
    }

    try {
      isSaving = true;
      error = null;

      const billingDetails = {
        name,
        email,
        address: {
          line1,
          line2: line2 || undefined,
          city,
          state,
          postal_code: postalCode,
          country: country.value,
        },
      };

      // Use billing service instead of direct fetch
      await billingService.updateBillingDetails(paymentMethodId, billingDetails);

      // Success!
      success = true;

      // Show appropriate success notification
      if (isEditMode) {
        notification.success('Billing address updated successfully.');
      } else {
        notification.success('Billing address added successfully.');
      }
      // Dispatch event to notify parent component
      dispatch('billingDetailsUpdated');

      // Close modal after short delay
      setTimeout(() => {
        dispatch('close');
      }, 2000);
    } catch (err) {
      error = err.message;
      console.error('Error updating billing details:', err);
      // Show appropriate error notification
      if (isEditMode) {
        notification.error('Failed to update billing address. Please try again.');
      } else {
        notification.error('Failed to add billing address. Please try again.');
      }
    } finally {
      isSaving = false;
    }
  }
</script>

<div class="bg-surface-600 w-[650px] rounded-lg p-7">
  <div class="header flex items-start justify-between">
    <div>
      <h2 class="text-xl font-medium text-white">
        {#if isEditMode}
          Edit Billing Address
        {:else}
          Add Billing Address
        {/if}
      </h2>
      <p class="text-sm text-gray-400">
        {#if isEditMode}
          Update your billing address to ensure invoices and details are accurate.
        {:else}
          Add your billing address to ensure invoices and details are accurate.
        {/if}
      </p>
    </div>
    <button on:click={goBack} class="cursor-pointer">
      <CloseIcon />
    </button>
  </div>

  {#if isLoading}
    <div class="flex justify-center">
      <CircularLoader />
    </div>
  {:else if paymentMethod}
    <form on:submit|preventDefault={handleSubmit}>
      <div class="space-y-5">
        <!-- Form in 2x2 grid -->
        <div class="grid grid-cols-2 gap-4">
          <!-- Name -->
          <div class="form-group">
            <Input
              label="Name"
              id="name"
              name="name"
              bind:value={name}
              required={true}
              placeholder="Enter Full Name"
              disabled={isSaving}
              hasError={formSubmitted && !name.trim()}
              errorMessage={formSubmitted && !name.trim() ? 'Please enter a valid name.' : ''}
            />
          </div>

          <!-- Email -->
          <div class="form-group">
            <Input
              label="Billing Email"
              id="email"
              name="email"
              type="email"
              bind:value={email}
              required={true}
              placeholder="Enter Billing Address"
              disabled={isSaving}
              hasError={formSubmitted && !email.trim()}
              errorMessage={formSubmitted && !email.trim()
                ? 'Please enter valid billing email.'
                : ''}
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
              placeholder="Enter address line 1"
              disabled={isSaving}
              hasError={formSubmitted && !line1.trim()}
              errorMessage={formSubmitted && !line1.trim() ? 'Please enter Address' : ''}
            />
          </div>

          <!-- Address Line 2 -->
          <div class="form-group">
            <Input
              label="Address Line 2"
              id="line2"
              name="line2"
              bind:value={line2}
              placeholder="Enter address line 2"
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
              <p class="text-fs-ds-12 mt-1 text-red-300">Please select your country.</p>
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
              errorMessage={formSubmitted && !city.trim() ? 'Please enter a valid city.' : ''}
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
              errorMessage={formSubmitted && !state.trim() ? 'Please enter a valid state.' : ''}
            />
          </div>

          <!-- ZIP Code -->
          <div class="form-group">
            <Input
              label="Zip Code"
              id="postalCode"
              name="postalCode"
              bind:value={postalCode}
              placeholder="Enter ZIP code"
              required={true}
              type="number"
              disabled={isSaving}
              hasError={formSubmitted && !postalCode.trim()}
              errorMessage={formSubmitted && !postalCode.trim()
                ? 'Please enter a valid ZIP or postal code.'
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
          disabled={isSaving}
        >
          Cancel
        </Button>
        <Button size="medium" type="submit" variant="filled-primary" disabled={isSaving}>
          {#if isSaving}
            <span class="flex items-center justify-center"> Saving... </span>
          {:else if isEditMode}
            Update
          {:else}
            Save
          {/if}
        </Button>
      </div>
    </form>
  {/if}
</div>
