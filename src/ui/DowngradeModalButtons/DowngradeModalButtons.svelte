<script lang="ts">
  import Button from '@/ui/Button/Button.svelte';
  import { createEventDispatcher } from 'svelte';

  export let cancelText: string = 'Cancel';
  export let confirmText: string = 'Confirm';
  export let showSupport: boolean = false;
  export let disableSupport: boolean = false;
  export let supportText: string = 'Contact Support';
  export let isPrimaryDisabled: boolean = false;

  export let primaryVariant: 'filled-primary' | 'outlined-primary' = 'filled-primary';

  // For edge cases like "Contact Sales"
  export let overridePrimaryText: string | null = null;

  const dispatch = createEventDispatcher();

  const handleCancel = () => dispatch('cancel');
  const handleConfirm = () => dispatch('confirm');
  function handleSupport() {
    if (disableSupport) return;
    window.open("mailto:contactus@sparrowapp.dev", "_blank");
  }
</script>

<!-- Footer layout -->
<div class="mt-3 flex w-full items-center justify-between">
  {#if showSupport}
    <Button
      variant="link-secondary"
      size="medium"
      on:click={handleSupport}
      disabled={disableSupport}
    >
      {supportText}
    </Button>
  {/if}

  <div class="ml-auto flex gap-3">
    <Button
      variant="filled-secondary"
      size="medium"
      on:click={handleCancel}
      class="bg-[#272935] !text-white hover:!bg-[#20242E]"
    >
      {cancelText}
    </Button>

    <Button
      variant={primaryVariant}
      size="medium"
      disabled={isPrimaryDisabled}
      on:click={() => {
        if (confirmText === 'Contact Sales') {
          window.open("mailto:contactus@sparrowapp.dev", "_blank");
        } else {
          handleConfirm();
        }
      }}
    >
      {overridePrimaryText ? overridePrimaryText : confirmText}
    </Button>
  </div>
</div>

<style>
  /* keeps consistent modal footer spacing */
  :global(.modal-footer) {
    margin-top: 1rem;
  }
</style>
