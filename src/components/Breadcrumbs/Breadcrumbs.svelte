<script lang="ts">
  import { Link } from 'svelte-routing';
  import ChevronRight from '@/assets/icons/ChevronRight.svelte';

  // Props: an array of breadcrumb items
  export let items: { label: string; path: string; action?: () => void }[] = [];
</script>

<nav class="py-1.5" aria-label="Breadcrumb">
  <ol class="flex flex-wrap items-center">
    {#each items as item, i}
      <li class="flex max-w-xs items-center">
        {#if i > 0}
          <div class="mx-2 flex-shrink-0 text-neutral-400">
            <ChevronRight />
          </div>
        {/if}

        {#if i === items.length - 1}
          <!-- Last item (current page) -->
          <span
            class="text-fs-ds-12 font-fw-ds-400 max-w-[8rem] truncate text-neutral-400"
            title={item.label}
          >
            {item.label}
          </span>
        {:else if item.action}
          <!-- Item with custom action -->
          <button
            on:click={item.action}
            class="text-fs-ds-12 font-fw-ds-400 max-w-[8rem] cursor-pointer truncate text-neutral-50"
            title={item.label}
          >
            {item.label}
          </button>
        {:else}
          <!-- Standard link item -->
          <Link
            to={item.path}
            class="text-fs-ds-12 font-fw-ds-400 max-w-[8rem] truncate text-neutral-50"
            title={item.label}
          >
            {item.label}
          </Link>
        {/if}
      </li>
    {/each}
  </ol>
</nav>
