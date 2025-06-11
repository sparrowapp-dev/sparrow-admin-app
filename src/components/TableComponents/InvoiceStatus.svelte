<script lang="ts">
  import Clock from '@/assets/icons/Clock.svelte';
  import Success from '@/assets/icons/Success.svelte';

  export let status: string;
</script>

<span class="flex items-center gap-1">
  {#if status === 'upcoming'}
    <Clock />
    <span class="text-fs-ds-12 text-neutral-50">Upcoming</span>
  {:else if status === 'open'}
    <Success />
    <span class="text-fs-ds-12 text-neutral-50">Success</span>
  {:else}
    <span class="text-fs-ds-12 text-neutral-400 capitalize">-</span>
  {/if}
</span>
