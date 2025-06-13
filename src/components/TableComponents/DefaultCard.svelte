<script lang="ts">
  import Tag from '@/ui/Tag/Tag.svelte';

  export let row;
</script>

<div class="flex items-center gap-2">
  <span class="font-fs-ds-12 text-neutral-50"
    >{row?.card?.brand?.toUpperCase()} ending with {row?.card?.last4}</span
  >
  {#if row?.isDefault}
    <Tag
      text="Default Card"
      bgColor="bg-green-900"
      textColor="text-green-300"
      borderColor="border-green-700"
      size="xs"
    />
  {/if}
</div>
