<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import Button from '@/ui/Button/Button.svelte';
  import Textarea from '@/ui/Textarea/Textarea.svelte';
  import CloseIcon from '@/assets/icons/CloseIcon.svelte';

  const dispatch = createEventDispatcher();

  export let hubName: string = '';
  export let currentPlan: string = '';
  export let accessUntil: string = '';

  let feedback = '';

  function handleClose() {
    dispatch('close');
  }

  function handleResubscribe() {
    dispatch('confirmResubscribe');
  }
</script>

<div class="bg-surface-600 w-full rounded-lg p-6">
  <!-- Header -->
  <div class="mb-6 flex items-start justify-between">
    <h2 class="text-fs-ds-20 font-fw-ds-500 text-neutral-50">We're sorry to see you go</h2>
    <button on:click={handleClose} class="cursor-pointer text-neutral-400 hover:text-neutral-200">
      <CloseIcon />
    </button>
  </div>

  <!-- Description -->
  <p class="text-fs-ds-12 font-fw-ds-300 mb-6 text-neutral-400">
    Your access to paid features will continue until {accessUntil || 'June 30, 2025'}. After that,
    your account will switch to the Community plan. You can re-subscribe anytime and pick up right
    from where you left.
  </p>

  <!-- Hub and Plan Information -->
  <div class="mb-2 grid grid-cols-2 gap-4">
    <div class="flex flex-col justify-between">
      <span class="text-fs-ds-14 font-fw-ds-300 text-neutral-400">Hub Name</span>
      <span class="text-fs-ds-16 font-fw-ds-400 mt-1 text-neutral-50">{hubName}</span>
    </div>

    <div class="flex flex-col justify-between">
      <span class="text-fs-ds-14 font-fw-ds-300 text-neutral-400">Plan Cancelled</span>
      <span class="text-fs-ds-16 font-fw-ds-400 mt-1 text-neutral-50">{currentPlan}</span>
    </div>
  </div>

  <!-- Access remains until -->
  {#if accessUntil}
    <div class="mb-6">
      <span class="text-fs-ds-14 font-fw-ds-300 text-neutral-400">Access remains until</span>
      <div class="text-fs-ds-16 font-fw-ds-500 mt-1 text-neutral-50">{accessUntil}</div>
    </div>
  {/if}

  <!-- Feedback Section -->
  <div class="mb-6">
    <p class="text-fs-ds-12 font-fw-ds-300 mb-4 text-neutral-400">
      We'd love to hear your feedback on why you canceled.
    </p>

    <div class="relative">
      <Textarea
        label="Share Feedback"
        bind:value={feedback}
        placeholder="Enter your feedback here"
        charLimit={300}
      />
    </div>
  </div>

  <!-- Action Buttons -->
  <div class="flex items-center justify-between">
    <a
      href="mailto:contactus@sparrowapp.dev"
      class="text-fs-ds-14 font-fw-ds-400 text-neutral-200 underline"
    >
      Contact Support
    </a>

    <div class="flex gap-3">
      <Button variant="filled-secondary" size="medium" on:click={handleClose}>Cancel</Button>

      <Button variant="filled-primary" size="medium" on:click={handleResubscribe}>
        Resubscribe
      </Button>
    </div>
  </div>
</div>
