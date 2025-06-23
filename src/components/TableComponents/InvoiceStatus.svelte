<script lang="ts">
  import Clock from '@/assets/icons/Clock.svelte';
  import CloseIconV3 from '@/assets/icons/CloseIconV3.svelte';
  import Success from '@/assets/icons/Success.svelte';

  export let status: string;
  // Capitalize the first letter of status for display
  $: capitalizedStatus = status ? status.charAt(0).toUpperCase() + status.slice(1) : '';
</script>

<span class="flex items-center gap-1">
  {#if status === 'payment_failed'}
    <CloseIconV3 />
    <span class="text-fs-ds-12 text-red-500">Failed</span>
  {:else if status === 'active' || status === 'paid'}
    <Success />
    <span class="text-fs-ds-12 text-neutral-100">Success</span>
  {:else if status === 'open' || status === 'incomplete' || status === 'void'}
    <Clock />
    <span class="text-fs-ds-12 text-neutral-100">{capitalizedStatus}</span>
  {:else}
    <Clock />
    <span class="text-fs-ds-12 text-neutral-100">{capitalizedStatus}</span>
  {/if}
</span>
