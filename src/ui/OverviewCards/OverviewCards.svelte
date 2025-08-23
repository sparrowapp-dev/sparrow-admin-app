<script lang="ts">
  import { tweened } from 'svelte/motion';
  import { cubicOut } from 'svelte/easing';
  import { onMount } from 'svelte';
  import { APP_EDITION } from '@/constants/environment';

  interface Point {
    value: string;
    count: number;
  }

  export let icon: any;
  export let title: string;
  export let value: number;
  export let points: Point[] = [];
  export let history: string;
  export let loading = false;

  // Simple modern animation
  const opacity = tweened(0, {
    duration: 600,
    easing: cubicOut,
  });

  const translateY = tweened(10, {
    duration: 600,
    easing: cubicOut,
  });

  const contentBlur = tweened(10, {
    duration: 300,
    easing: cubicOut,
  });

  onMount(() => {
    setTimeout(() => {
      opacity.set(1);
      translateY.set(0);
      contentBlur.set(0);
    }, 100);
  });
</script>

<section
  class="bg-surface-600 w-[32%] rounded-lg p-6"
  style="opacity: {$opacity}; transform: translateY({$translateY}px); filter: blur({$contentBlur}px);"
>
  <div class="flex justify-between">
    <div class="flex flex-col gap-1">
      <div class="flex flex-col gap-2">
        <div class="font-inter font-regular leading-lh-ds-143 text-fs-ds-14 text-neutral-50">
          {title}
        </div>
        {#if loading}
          <!-- Show skeleton loader -->
          <div class="bg-surface-300 h-5 w-20 animate-pulse rounded rounded-b-sm"></div>
        {:else}
          <div class="font-inter leading-lh-ds-120 text-fs-ds-24 font-medium text-neutral-50">
            {value}
          </div>
        {/if}
      </div>
      <div class="flex flex-row gap-1">
        {#if points.length > 0}
          {#each points as point, i}
            {#if !(APP_EDITION === 'SELFHOSTED' && (point?.value === 'Community' || point?.value === 'Standard' || point?.value === 'Professional'))}
              <div
                class="font-roboto text-fs-ds-12 inline-flex items-center leading-4 font-light text-neutral-300"
              >
                <span>{point.value}: {point.count}</span>
                {#if i !== points.length - 1}
                  <div class="ml-1 h-[60%] border-r border-r-neutral-300" />
                {/if}
              </div>
            {/if}
          {/each}
        {/if}

        {#if history}
          <div class="font-inter text-fs-ds-12 font-fw-ds-300 text-green-300">
            {history}
          </div>
        {/if}
      </div>
    </div>
    <div class="bg-surface-50 flex h-10 w-10 items-center justify-center rounded-[9999px] p-2">
      <svelte:component this={icon} />
    </div>
  </div>
</section>
