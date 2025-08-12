<script lang="ts">
  import { tweened } from 'svelte/motion';
  import { cubicOut } from 'svelte/easing';
  import { onMount } from 'svelte';

  export let cell: any;
  export let className = '';
  export let showOnHover = false;
  export let maxWidth = '200px';
  export let isLastColumn = false;
  export let columnWidth = 'auto';
  export let rowIndex = 0;

  // Only animate opacity for non-hover elements
  const opacity = tweened(showOnHover ? 0 : 0, {
    duration: 500,
    easing: cubicOut,
  });

  // Get cell value as string for title attribute
  $: cellValue = typeof cell.getValue() === 'string' ? cell.getValue() : '';
  // Use columnWidth prop if provided, otherwise fall back to existing logic
  $: finalColumnWidth = columnWidth !== 'auto' ? columnWidth : isLastColumn ? '100px' : maxWidth;

  onMount(() => {
    // Staggered animation based on row index
    const delay = rowIndex * 50; // 80ms delay between each row

    setTimeout(() => {
      // Only animate opacity for elements that aren't hover-only
      if (!showOnHover) {
        opacity.set(1);
      }
    }, delay);
  });

  // Calculate final opacity considering both animation and hover state
  $: finalOpacity = showOnHover ? undefined : $opacity;
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
  style="width: {finalColumnWidth}; {finalOpacity !== undefined ? `opacity: ${finalOpacity};` : ''}"
  on:click
>
  <div class="overflow-hidden text-ellipsis whitespace-nowrap">
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
