<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import Button from '@/ui/Button/Button.svelte';
    import CloseIcon from '@/assets/icons/CloseIcon.svelte';
    import CloseIconV2 from '@/assets/icons/CloseIconV2.svelte';
  
    const dispatch = createEventDispatcher<{
      close: void;
      tryAgain: void;
      contactSupport: void;
    }>();
  
    // Props
    export let hubName: string = '';
  
    function handleClose() {
      dispatch('close');
    }
  
    function handleTryAgain() {
      dispatch('tryAgain');
    }
  
    function handleContactSupport() {
      dispatch('contactSupport');
    }
  </script>
  
  <div class="bg-surface-600 max-w-xl rounded-lg p-7 text-white">
    <!-- Header -->
    <div class="mb-3 flex items-start justify-between">
      <div class="flex items-center gap-2">
        <h2 class="text-fs-ds-20 font-inter font-fw-ds-500 text-neutral-50">
          Failed to Schedule Downgrade
        </h2>
      </div>
  
      <button class="cursor-pointer" on:click={handleClose}>
        <CloseIcon />
      </button>
    </div>
  
    <!-- Description -->
    <p class="text-fs-ds-12 font-fw-ds-300 font-inter mt-2 text-neutral-400">
      We're sorry, but we were unable to schedule the downgrade for '{hubName}' at this time.
    </p>
    <p class="text-fs-ds-12 font-fw-ds-300 font-inter mt-2 mb-6 text-neutral-400">
      Your plan has not been changed. Please try again. If the problem continues, our support team is
      ready to help.
    </p>
  
    <!-- Buttons -->
    <div class="flex items-center justify-between">
      <a
        href="mailto:contactus@sparrowapp.dev"
        class="text-fs-ds-14 font-inter font-fw-ds-400 text-gray-400 underline"
        on:click={handleContactSupport}
      >
        Contact Support
      </a>
  
      <div class="flex items-center gap-3">
        <Button variant="outlined-secondary" size="medium" on:click={handleClose}>Cancel</Button>
        <Button variant="filled-primary" size="medium" on:click={handleTryAgain}>Try Again</Button>
      </div>
    </div>
  </div>  