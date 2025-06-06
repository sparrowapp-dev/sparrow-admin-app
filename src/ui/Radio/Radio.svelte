<script lang="ts">
  import { createEventDispatcher, SvelteComponent } from 'svelte';
  import RadioChecked from '@/assets/icons/RadioChecked.svelte';
  import RadioUnchecked from '@/assets/icons/RadioUnchecked.svelte';

  // Props
  export let value: string = '';
  export let name: string = '';
  export let checked: boolean = false;
  export let disabled: boolean = false;
  export let labelComponent: typeof SvelteComponent | null = null;

  // Event dispatcher
  const dispatch = createEventDispatcher<{
    change: { value: string; checked: boolean };
  }>();

  function handleChange() {
    if (!disabled) {
      checked = true;
      dispatch('change', { value, checked });
    }
  }
</script>

<div
  class="flex cursor-pointer items-center"
  class:opacity-50={disabled}
  class:cursor-not-allowed={disabled}
  on:click={handleChange}
  on:keydown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleChange();
    }
  }}
  tabindex={disabled ? -1 : 0}
  role="radio"
  aria-checked={checked}
  aria-disabled={disabled}
>
  <div class="relative flex items-center justify-center">
    {#if checked}
      <RadioChecked />
    {:else}
      <RadioUnchecked />
    {/if}
    <input
      type="radio"
      {name}
      {value}
      {checked}
      {disabled}
      class="absolute opacity-0"
      on:change={handleChange}
      tabindex="-1"
    />
  </div>

  {#if $$slots.default}
    <div class="ml-3">
      <slot />
    </div>
  {/if}

  {#if labelComponent}
    <div class="ml-3">
      <svelte:component this={labelComponent} />
    </div>
  {/if}
</div>
