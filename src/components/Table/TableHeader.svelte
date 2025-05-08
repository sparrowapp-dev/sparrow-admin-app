<script lang="ts">
  import type { Header } from '@tanstack/svelte-table';
  import SortIcon from '@/assets/icons/SortIcon.svelte';

  export let header: Header<any, any>;
  export let dataLength: number;
  export let className = '';

  function getSortIcon(sortDirection: string | false): string {
    if (!dataLength) return 'opacity-0';
    if (sortDirection === 'asc') return 'opacity-100';
    if (sortDirection === 'desc') return 'opacity-100';
    return 'opacity-60 group-hover:opacity-100';
  }
</script>

<th
  class={`group border-surface-600 border-b p-3 text-left font-medium text-neutral-400 ${className}`}
>
  {#if header.isPlaceholder}
    <span />
  {:else}
    <div
      class="flex cursor-pointer items-center gap-2"
      on:click={() => header.column.toggleSorting()}
      on:keydown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          header.column.toggleSorting();
        }
      }}
      role="button"
      tabindex="0"
    >
      <span>{header.column.columnDef.header}</span>
      {#if header.column.getCanSort()}
        <span class={`transition-opacity duration-150 ${getSortIcon(header.column.getIsSorted())}`}>
          <SortIcon />
        </span>
      {/if}
    </div>
  {/if}
</th>
