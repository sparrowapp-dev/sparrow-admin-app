<script lang="ts">
  import Button from '@/ui/Button/Button.svelte';
  import Input from '@/ui/Input/Input.svelte';
  import CheckMarkCircle from '@/assets/icons/CheckMarkCircle.svelte';
  import { onMount } from 'svelte';
  export let promoCode;
  export let isApplying = false;
  export let errorMessage = '';
  export let successMessage = '';
  export let isApplied = false;
  export let onApply: () => void;
  export let trialStartDate = '';
  export let trialEndDate = '';
  export let amountAfterTrial = '';
  export let promoAppliedValue = '';
</script>

<div class="ml-4 flex flex-col gap-4 px-6 py-3" style="background-color: #181C26;">
  <div class="flex flex-col text-white">
    <h3 class="text-fs-ds-20 font-fw-ds-500" style="margin-bottom: 4px;">Billing Summary</h3>

    <div class="text-fs-ds-14 mb-2 flex gap-1">
      <span class="text-neutral-200">Trial Start Date:</span>
      <span>{trialStartDate}</span>
    </div>
    <div class="text-fs-ds-14 mb-2 flex gap-1">
      <span class="text-neutral-200">Trial End Date:</span>
      <span>{trialEndDate}</span>
    </div>
    <div class="text-fs-ds-14 mb-2 flex gap-1">
      <span class="text-neutral-200">Amount After Trial:</span>
      <span>{amountAfterTrial}</span>
    </div>
    {#if promoAppliedValue}
      <div class="text-fs-ds-14 mb-2 flex gap-1">
        <span class="text-neutral-200">Promo applied:</span>
        <span>{promoAppliedValue} discount</span>
      </div>
    {/if}
    <div style="border-top: 1px solid #3D3F43; margin-top: 16px; width: 100%;"></div>
  </div>

  <div class="flex flex-col gap-4">
    <div class="flex flex-col gap-2">
      <div class="text-fs-ds-14 font-fw-ds-500 text-neutral-50">Get a promo code?</div>
      <div class="text-fs-ds-12 text-neutral-400">
        Apply it now to get a discount after your trial ends.
      </div>
    </div>
    <div class="flex flex-col gap-2">
      <span class="text-fs-ds-12 font-fw-ds-400 text-neutral-200">Promo Code</span>
      <div class="flex gap-2">
        <div class="flex flex-col">
          <Input placeholder="Enter promo code" bind:value={promoCode} />
          {#if errorMessage}
            <div class="mt-1 text-xs text-red-400">{errorMessage}</div>
          {/if}
          {#if isApplied && successMessage}
            <div class="mt-2 flex gap-2">
              <div class="mt-1"><CheckMarkCircle /></div>
              <div class="text-fs-ds-12 text-neutral-400">{successMessage}</div>
            </div>
          {/if}
        </div>
        <Button
          variant="outline-primary"
          size="medium"
          className="px-4"
          on:click={onApply}
          disabled={isApplying}
        >
          Apply
        </Button>
      </div>
    </div>
  </div>
</div>
