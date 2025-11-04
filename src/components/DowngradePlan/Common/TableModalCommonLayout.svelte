<script lang="ts">
  import DowngradeModalButtons from '@/ui/DowngradeModalButtons/DowngradeModalButtons.svelte';
  import { createEventDispatcher } from 'svelte';

  export let isOpen: boolean = false;
  export let title: string;
  export let stepIndicator: boolean = false;
  export let subheading1: string;
  export let subheading2: string;
  export let selectedCount: number;
  export let maxSelectable: number;
  export let isPrimaryDisabled: boolean = false;
  export let confirmText: string = 'Confirm Selection';
  export let cancelText: string = 'Cancel';
  export let supportText: string = 'Contact Support';
  export let showSupport: boolean = true;
  export let primaryVariant: string = 'filled-primary';

  const dispatch = createEventDispatcher();

  const handleClose = () => dispatch('close');
  const handleBackdropClick = (e: MouseEvent) => {
    if (e.target === e.currentTarget) handleClose();
  };
</script>

{#if isOpen}
  <div
    class="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-xs"
    on:click={handleBackdropClick}
    role="presentation"
  >
    <div
      class="bg-[#181C26] relative mx-auto flex h-[602px] w-[533px] flex-col gap-4 rounded-lg p-6 text-white shadow-2xl"
      role="dialog"
      aria-modal="true"
    >
      <!-- Header -->
      {#if stepIndicator}
        <!-- With Step Indicator -->
        <div class="flex items-start justify-between">
          <slot name="stepIndicator"></slot>

          <button
            on:click={handleClose}
            class="text-fs-ds-20 text-gray-400 transition hover:text-white"
            type="button"
          >
            ✕
          </button>
        </div>

        <!-- Title below Step Indicator -->
        <div class="flex flex-col gap-y-2">
          <h2 class="text-fs-ds-20 leading-tight font-semibold">{title}</h2>
          <p class="mt-2 text-fs-ds-12 leading-snug text-gray-400">{subheading1}</p>
          <p class="mt-1 text-fs-ds-12 leading-snug text-gray-400">{subheading2}</p>
        </div>
      {:else}
        <!-- Without Step Indicator -->
        <div class="flex items-start justify-between">
          <h2 class="text-fs-ds-20 leading-tight font-semibold">{title}</h2>

          <button
            on:click={handleClose}
            class="text-fs-ds-20 text-gray-400 transition hover:text-white"
            type="button"
          >
            ✕
          </button>
        </div>

        <!-- Description just below -->
        <div class="flex flex-col gap-y-2">
          <p class="text-fs-ds-12 leading-snug text-gray-400 mt-1">{subheading1}</p>
          <p class="mt-1 text-fs-ds-12 leading-snug text-gray-400">{subheading2}</p>
        </div>
      {/if}

      <!-- Unique content (table or list) -->
      <div
        class="flex h-[320px] max-w-[492px] flex-grow flex-col overflow-hidden rounded-md border border-[#2A2F3A]"
      >
        <slot></slot>
      </div>

      <!-- Selection Counter -->
      <p class="text-right text-fs-ds-12 text-gray-500">
        You have selected {selectedCount} of {maxSelectable}
      </p>

      <!-- Action Buttons -->
      <DowngradeModalButtons
        {showSupport}
        {supportText}
        {cancelText}
        {confirmText}
        {primaryVariant}
        {isPrimaryDisabled}
        on:cancel={handleClose}
        on:confirm={() => dispatch('confirm')}
        on:support={() => dispatch('support')}
      />
    </div>
  </div>
{/if} 