<script lang="ts">
  export let cell: any;
  export let className = '';
  export let showOnHover = false;
  export let maxWidth = '200px';
  export let isLastColumn = false;
  export let columnWidth = 'auto';

  // Get cell value as string for title attribute
  $: cellValue = typeof cell.getValue() === 'string' ? cell.getValue() : '';
  // Use columnWidth prop if provided, otherwise fall back to existing logic
  $: finalColumnWidth = columnWidth !== 'auto' ? columnWidth : (isLastColumn ? '100px' : maxWidth);
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
  style={`width: ${finalColumnWidth};`}
  on:click
>
  <div class="overflow-hidden text-ellipsis whitespace-nowrap" title={cellValue}>
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
  </div>
</td>
