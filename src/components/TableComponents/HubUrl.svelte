<script lang="ts">
  import Check from '@/assets/icons/Check.svelte';
  import Tooltip from '../Tooltip/Tooltip.svelte';
  import Copy from '@/assets/icons/Copy.svelte';
  import { SPARROW_LAUNCH_URL } from '@/constants/environment';
  export let Value;
  export let row;
  let copyState: { [key: string]: boolean } = {};
  async function handleCopy(url: string, rowId: string) {
    try {
      await navigator.clipboard.writeText(url);
      copyState[rowId] = true;
      setTimeout(() => {
        copyState[rowId] = false;
      }, 2000);
    } catch (error) {
      console.error('Copy failed:', error);
    }
  }
  let hubUrl = `${SPARROW_LAUNCH_URL}/home?adminRedirectHubId=${row?.original._id}`;
</script>

<div class="group/url relative flex items-center gap-2">
  <span class="truncate text-neutral-50">
    {hubUrl || Value || `https://sparrow.app/hub/${row.original._id}`}
  </span>
  <button
    class="relative cursor-pointer p-1 text-neutral-400 opacity-0
         transition-all duration-150 group-hover/url:opacity-100 hover:text-neutral-50"
    on:click|stopPropagation={() =>
      handleCopy(
        hubUrl || Value || `https://sparrow.app/hub/${row.original._id}`,
        row.original._id,
      )}
    title="Click to copy URL"
  >
    <Tooltip
      text={`${copyState[row.original._id] ? 'Copied' : 'Click to copy'}`}
      position="top"
      mode="hover"
      size="xs"
    >
      <div class="hover:bg-surface-300 p-0.5 transition-all duration-150">
        {#if copyState[row.original._id]}
          <div class="hover:bg-surface-300">
            <Check />
          </div>
        {:else}
          <Copy />
        {/if}
      </div>
    </Tooltip>
    <!-- <span
        class="tooltip bg-surface-100 text-fs-ds-12 pointer-events-none absolute -top-8 left-1/2
           -translate-x-1/2 rounded-md px-2 py-1
           whitespace-nowrap text-neutral-50 opacity-0
           transition-opacity duration-150 group-hover/url:opacity-100"
      >
        Click to copy
      </span> -->
  </button>
</div>
