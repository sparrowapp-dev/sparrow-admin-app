<script>
  import { createEventDispatcher } from 'svelte';
  import Button from '@/ui/Button/Button.svelte';
  import Input from '@/ui/Input/Input.svelte';
  import CloseIcon from '@/assets/icons/CloseIcon.svelte';
  import { notification } from '@/components/Toast';
  import { billingService } from '@/services/billing.service';

  const dispatch = createEventDispatcher();

  // Props
  export let paymentMethodId;
  export let cardLast4;

  // State
  let isLoading = false;
  let error = null;
  let confirmationInput = '';
  let hasError = false;
  let formSubmitted = false;

  // Only show validation errors after form submission attempt
  $: {
    if (formSubmitted && confirmationInput !== cardLast4) {
      hasError = true;
    } else {
      hasError = false;
    }
  }

  function closeModal() {
    dispatch('close');
  }

  async function handleDeleteCard() {
    formSubmitted = true;

    // Check validation only after submission attempt
    if (isLoading) return;
    if (confirmationInput !== cardLast4) {
      hasError = true;
      return;
    }

    try {
      isLoading = true;
      error = null;

      // Use the billing service instead of direct fetch
      await billingService.deletePaymentMethod(paymentMethodId);
      captureUserBillingCardRemoval();
      // Show success toast notification
      notification.success('Card removed successfully.');

      // Success! Notify parent component
      dispatch('paymentMethodDeleted', { paymentMethodId });

      // Close modal after short delay
      setTimeout(() => {
        dispatch('close');
      }, 100);
    } catch (err) {
      error = err.message;
      console.error('Error deleting payment method:', err);

      // Show error toast notification
      notification.error('Failed to remove card. Please try again.');
    } finally {
      isLoading = false;
    }
  }

  const captureUserBillingCardRemoval = () =>{
    const eventProperties ={
      button_name:"Delete Card"
    }
    captureEvent("admin_card_deleted",eventProperties);
  }
</script>

<div class="bg-surface-600 rounded-lg p-7">
  <div class="header flex items-start justify-between">
    <div>
      <h2 class="text-fs-ds-20 font-fw-ds-500 text-neutral-50">Delete Card</h2>
      <p class="text-fs-ds-14 font-fw-ds-300 text-neutral-100">
        You're about to remove this card from your account. If this is your only saved payment
        method, make sure to add another to avoid service interruption.
      </p>
    </div>
    <button on:click={closeModal} class="cursor-pointer">
      <CloseIcon />
    </button>
  </div>

  <div class="pt-8">
    <div class="mb-4">
      <Input
        label="Last 4 digits of your card"
        id="card-number-confirmation"
        name="confirmationInput"
        bind:value={confirmationInput}
        placeholder={`Enter last 4 digits of your card`}
        required={true}
        hasError={formSubmitted && hasError}
        type="number"
        errorMessage={formSubmitted && hasError ? `Incorrect last 4 digits of card` : ''}
        disabled={isLoading}
        subtitle="This step confirms that you're authorized to remove this card."
      />
    </div>

    {#if error}
      <div class="bg-opacity-20 mb-4 rounded-lg bg-red-900 p-3 text-red-400">
        {error}
      </div>
    {/if}

    <div class="mt-6 flex justify-end gap-3">
      <Button
        size="medium"
        type="button"
        variant="filled-secondary"
        on:click={closeModal}
        disabled={isLoading}
      >
        Cancel
      </Button>
      <Button
        size="medium"
        type="button"
        variant="filled-tertiary"
        on:click={handleDeleteCard}
        disabled={isLoading}
      >
        {#if isLoading}
          <span class="flex items-center justify-center">Deleting...</span>
        {:else}
          Delete Card
        {/if}
      </Button>
    </div>
  </div>
</div>
