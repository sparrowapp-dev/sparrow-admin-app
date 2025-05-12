<script lang="ts">
  import Private from '@/assets/icons/Private.svelte';
  import Public from '@/assets/icons/Public.svelte';

  export let Value: 'PRIVATE' | 'PUBLIC';
</script>

<div>
  {#if Value === 'PRIVATE'}
    <Private />
  {:else}
    <Public />
  {/if}
</div>
