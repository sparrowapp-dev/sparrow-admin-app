<script lang="ts">
  export let items: Array<{ label: string; color: string }> = [];
  export let horizontal: boolean = false;
  export let textColor: string = 'text-neutral-50';
  export let trendLineLegend: boolean = false;
</script>

{#if trendLineLegend}
  <div class="flex flex-wrap items-center justify-center gap-6">
    {#each items as item}
      <div class="flex items-center gap-3">
        <div class="flex h-2 w-2 items-center justify-center">
          <div class="relative h-2 w-2 rounded-full border-1" style="border-color: {item.color}">
            <!-- Line behind -->
            <div
              class="absolute top-[2px] right-[-5px] z-0 h-0.5 w-4"
              style="background-color: {item.color}"
            ></div>

            <!-- Circle above -->
            <div class="relative z-10 h-full w-full rounded-full bg-white"></div>
          </div>
        </div>

        <span class="font-inter font-fw-ds-300 text-fs-ds-12 text-neutral-50">
          {item.label}
        </span>
      </div>
    {/each}
  </div>
{:else}
  <div class="mt-4 flex flex-wrap justify-center gap-3 {horizontal ? 'flex-row' : 'flex-col'}">
    {#each items as item}
      <div class="flex items-center gap-2">
        <span
          class="inline-block h-3 w-3 rounded-full border-1"
          style="border-color: {item.color}; background-color: transparent;"
        ></span>
        <span class="font-inter font-fw-ds-300 text-fs-ds-14 {textColor}">{item.label}</span>
      </div>
    {/each}
  </div>
{/if}
