<script lang="ts">
  import type { Cell } from '@tanstack/svelte-table';

  export let cell: Cell<any, any>;
  export let className = '';
</script>

<td class={`group border-surface-600 border-b p-2 text-left text-neutral-50 ${className}`} on:click>
  {#if typeof cell.column.columnDef.cell === 'function'}
    {#if typeof cell.column.columnDef.cell(cell) === 'object'}
      {#if cell.column.columnDef.cell(cell).Component}
        <svelte:component
          this={cell.column.columnDef.cell(cell).Component}
          {...cell.column.columnDef.cell(cell).props}
        />
      {:else}
        {@html cell.column.columnDef.cell(cell)}
      {/if}
    {:else}
      {@html cell.column.columnDef.cell(cell)}
    {/if}
  {:else}
    {cell.getValue()}
  {/if}
</td>
