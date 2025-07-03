<script lang="ts">
  import Tooltip from '@/components/Tooltip/Tooltip.svelte';

  export let Value: string;
</script>

<Tooltip text={Value} position="top" mode="hover" size="xs">
  <div class="truncate max-w-[180px]">
    {Value}
  </div>
</Tooltip>
