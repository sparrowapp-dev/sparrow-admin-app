<script>
  import Check from '@/assets/icons/Check.svelte';
  import Tag from '@/ui/Tag/Tag.svelte';
  import Button from '@/ui/Button/Button.svelte';

  // Props for the card
  export let title = '';
  export let price = '';
  export let period = '';
  export let features = [];
  export let buttonText = '';
  export let savings = null;
  export let compareText = '';
  export let onCompareClick = () => {};
  export let onButtonClick = () => {};
</script>

<div class="border-surface-50 relative mb-4 rounded-[10px] border bg-[#0B0C0F] px-5 pt-5 pb-10">
  <div class="mb-4">
    <h5 class="text-fs-ds-20 font-fw-ds-600 text-white">{title}</h5>
    <div class="mb-1 flex items-center">
      <div class="text-fs-ds-16 font-fw-ds-500 text-white">
        {price}
        <span class="text-[15px] font-normal text-neutral-300">{period}</span>
      </div>
      {#if savings}
        <div class="ml-2 flex-shrink-0">
          <Tag
            text={savings}
            bgColor="bg-cyan-900"
            textColor="text-cyan-300"
            borderColor="border-cyan-700"
            size="xs"
          />
        </div>
      {/if}
    </div>
  </div>
  <div class="mb-4">
    <Button variant="filled-primary" size="small" on:click={onButtonClick}>
      {buttonText}
    </Button>
  </div>

  <div class="flex flex-col space-y-2">
    {#each features as feature}
      <div class="flex items-center gap-2">
        <div class="mb-1 flex-shrink-0">
          <Check width="17" height="13" color="#33CC7A" />
        </div>
        <span class="text-fs-ds-14 text-neutral-200">{feature}</span>
      </div>
    {/each}
  </div>

  <div class="mt-4 flex justify-center">
    <Button variant="link-secondary" on:click={onCompareClick}>
      {compareText}
    </Button>
  </div>
</div>

<style>
  .custom-btn {
    min-width: 72px;
    min-height: 28px;
    padding: 4px 8px;
  }
</style>
