<script lang="ts">
  import type { CellContext } from '@tanstack/svelte-table';

  export let cell: CellContext<any, any>;
  export let className = '';
  export let showOnHover = false;
</script>

<td
  class={`
      group/cell
      font-inter 
      border-surface-600 
      text-fs-ds-12 
      leading-lh-ds-150 
      font-fw-ds-400 
      cursor-pointer 
      border-b 
      p-2 
      text-left 
      text-neutral-50
      ${showOnHover ? 'opacity-0 transition-opacity duration-150 group-hover/row:opacity-100' : ''}
      ${className}
    `}
  on:click
>
  {#if typeof cell.column.columnDef.cell === 'function'}
    {#if typeof cell.column.columnDef.cell(cell) === 'object'}
      {#if cell.column.columnDef.cell(cell)?.Component}
        <svelte:component
          this={cell.column.columnDef.cell(cell)?.Component}
          {...cell.column.columnDef.cell(cell)?.props}
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
