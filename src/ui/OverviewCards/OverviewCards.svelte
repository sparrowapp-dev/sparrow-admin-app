<script lang="ts">
  interface Point {
    value: string;
    count: number;
  }

  export let icon: any;
  export let title: string;
  export let value: number;
  export let points: Point[] = [];
  export let history: string;
</script>

<section class="bg-surface-600 w-[32%] rounded-[8px] p-6">
  <div class="flex justify-between">
    <div class="flex flex-col gap-1">
      <div class="flex flex-col gap-2">
        <div class="font-inter font-regular leading-lh-ds-143 text-fs-ds-14 text-neutral-50">
          {title}
        </div>
        <div class="font-inter leading-lh-ds-120 text-fs-ds-24 font-medium text-neutral-50">
          {value}
        </div>
      </div>
      <div class="flex flex-row gap-1">
        {#if points.length > 0}
          {#each points as point, i}
            <div
              class="font-roboto text-fs-ds-12 inline-flex items-center leading-4 font-light text-neutral-300"
            >
              <span>{point.value}:{point.count}</span>
              {#if i !== points.length - 1}
                <div class="ml-1 h-[60%] border-r border-r-neutral-300" />
              {/if}
            </div>
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
