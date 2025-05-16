<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte';
  import CloseIcon from '@/assets/icons/CloseIcon.svelte';

  export let emails: string[] = [];
  export let hasError: boolean = false;
  export let errorMessage: string = '';
  export let placeholder: string = 'Enter email ID';

  const dispatch = createEventDispatcher();
  let inputValue = '';
  let inputElement: HTMLInputElement;

  // Track invalid emails
  let invalidEmails: string[] = [];

  // Email validation regex
  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;

  onMount(() => {
    if (inputElement) {
      inputElement.focus();
    }

    // Check existing emails for validity
    checkEmailsValidity(emails);
  });

  function validateEmail(email: string): boolean {
    return emailRegex.test(email.trim());
  }

  // Check all emails for validity
  function checkEmailsValidity(emailList: string[]) {
    invalidEmails = emailList.filter((email) => !validateEmail(email));

    if (invalidEmails.length > 0) {
      hasError = true;
      errorMessage = 'Please check and enter correct email address.';
    } else {
      // Only clear errors if they were set by this component
      if (errorMessage === 'Please check and enter correct email address.') {
        hasError = false;
        errorMessage = '';
      }
    }

    // This is critical for the parent component to know if emails are valid
    dispatch('validity', {
      isValid: invalidEmails.length === 0,
      invalidEmails,
    });

    return invalidEmails.length === 0;
  }

  function handleKeyDown(event: KeyboardEvent) {
    // Add email on Enter, comma, or space
    if (event.key === 'Enter' || event.key === ',' || event.key === ' ') {
      event.preventDefault();
      addEmail();
    }

    // Delete last email on Backspace if input is empty
    if (event.key === 'Backspace' && inputValue === '' && emails.length > 0) {
      removeEmail(emails.length - 1);
    }
  }

  function handleBlur() {
    if (inputValue.trim()) {
      addEmail();
    }
  }

  function addEmail() {
    const emailsToAdd = inputValue
      .split(/[,\s]+/) // Split by commas or whitespace
      .map((e) => e.trim())
      .filter((e) => e && !emails.includes(e));

    if (emailsToAdd.length) {
      // Accept all emails, even if invalid
      const newEmails = [...emails, ...emailsToAdd];

      // Clear input
      inputValue = '';

      // Update the emails list
      dispatch('change', newEmails);

      // Check for invalid emails and return validity status
      const isValid = checkEmailsValidity(newEmails);

      // Make sure parent knows if there are invalid emails
      return isValid;
    }

    return true;
  }

  function removeEmail(index: number) {
    const newEmails = emails.filter((_, i) => i !== index);
    dispatch('change', newEmails);

    // Recheck validity when an email is removed
    return checkEmailsValidity(newEmails);
  }

  function handlePaste(event: ClipboardEvent) {
    event.preventDefault();
    const pastedText = event.clipboardData?.getData('text') || '';
    if (!pastedText) return;

    const pastedEmails = pastedText
      .split(/[,\s]+/)
      .map((e) => e.trim())
      .filter((e) => e && !emails.includes(e));

    if (pastedEmails.length) {
      // Accept all pasted emails, even if invalid
      const newEmails = [...emails, ...pastedEmails];

      // Update emails list
      dispatch('change', newEmails);

      // Check for validity
      return checkEmailsValidity(newEmails);
    }

    return true;
  }

  // Check if an email is invalid
  function isInvalidEmail(email: string): boolean {
    return !validateEmail(email);
  }

  // Expose method to check if there are currently any invalid emails
  export function hasInvalidEmails(): boolean {
    return invalidEmails.length > 0;
  }
</script>

<div class="relative">
  <div
    class="bg-surface-400 flex flex-wrap items-center gap-2 rounded-sm border p-2 hover:border-neutral-400 {hasError
      ? 'border-red-300'
      : 'border-surface-400'} min-h-[42px]"
    on:click={() => inputElement.focus()}
  >
    {#each emails as email, i}
      <div
        class="flex items-center gap-1 rounded px-2 py-1 {isInvalidEmail(email)
          ? 'border border-red-300 bg-red-900/20'
          : 'bg-surface-200'}"
      >
        <span class="text-fs-ds-12 {isInvalidEmail(email) ? 'text-red-300' : 'text-neutral-50'}"
          >{email}</span
        >
        <button
          type="button"
          class="cursor-pointer"
          on:click|stopPropagation={() => removeEmail(i)}
        >
          <CloseIcon />
        </button>
      </div>
    {/each}

    <input
      bind:this={inputElement}
      bind:value={inputValue}
      type="text"
      {placeholder}
      class="text-fs-ds-14 placeholder:font-fw-ds-300 min-w-[120px] flex-grow bg-transparent text-neutral-50 focus:outline-none"
      on:keydown={handleKeyDown}
      on:blur={handleBlur}
      on:paste={handlePaste}
    />
  </div>

  {#if hasError && errorMessage}
    <p class="text-fs-ds-12 font-fw-ds-300 font-inter mt-1 text-red-300">{errorMessage}</p>
  {/if}
</div>
