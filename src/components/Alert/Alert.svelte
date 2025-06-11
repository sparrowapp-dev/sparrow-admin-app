<!-- Alert.svelte -->
<script lang="ts">
  import AlertIcon from '@/assets/icons/AlertIcon.svelte';
  import Button from '@/ui/Button/Button.svelte';
  // Event dispatcher for button click
  import { createEventDispatcher } from 'svelte';

  export let title: string = '';
  export let subtitle: string = '';
  export let buttonText: string = '';
  export let showButton: boolean = true;
  export let class_name: string = '';

  const dispatch = createEventDispatcher();

  function handleButtonClick() {
    dispatch('buttonClick');
  }
</script>

<div
  class="via-surface-600 to-surface-600 rounded-md bg-gradient-to-r from-red-400/18 from-1% via-10% p-5 {class_name} border-l-2 border-red-400"
>
  <div class="flex flex-col gap-4">
    <div class="flex justify-between">
      <!-- Payment Issue Icon -->
      <div class="flex items-start gap-4">
        <AlertIcon />

        <div>
          {#if title}
            <h2 class="text-fs-ds-12 font-inter font-fw-ds-400 text-neutral-50">{title}</h2>
          {/if}
          {#if subtitle}
            <p class="text-fs-ds-12 font-fw-ds-300 font-inter mt-1 text-neutral-100">
              {subtitle}
            </p>
          {/if}
        </div>
      </div>

      {#if showButton}
        <Button variant="outline-secondary" size="small" on:click={handleButtonClick}>
          {buttonText}
        </Button>
      {/if}
    </div>
  </div>
</div>
