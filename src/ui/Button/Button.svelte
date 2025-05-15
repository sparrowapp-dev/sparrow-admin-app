<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher();

  function forwardEvent(event: Event) {
    dispatch(event.type, event);
  }

  export let variant: 'filled-primary' | 'filled-secondary' | 'filled-tertiary' = 'filled-primary';
  export let size: 'small' | 'medium' | 'large' = 'medium';
  export let disabled: boolean = false;
  export let iconLeft: boolean = false;
  export let iconRight: boolean = false;
  export let type: 'button' | 'submit' | 'reset' = 'button';

  const sizeClasses = {
    small: 'text-fs-ds-12 rounded-[4px] px-2 py-1.5 h-[28px]',
    medium: 'text-fs-ds-14 rounded-[6px] px-5 py-2 h-[36px]',
    large: 'text-fs-ds-16 rounded-[6px] px-7 py-3 h-[40px]',
  };

  const variantClasses = {
    'filled-primary': `
        bg-blue-400 text-neutral-50 font-inter font-fw-ds-400
        hover:bg-blue-300 active:bg-blue-600
        focus-visible:ring-2 focus-visible:ring-blue-200
        disabled:bg-blue-700 disabled:text-neutral-400
      `,
    'filled-secondary': `
        bg-surface-300 text-neutral-50 font-inter font-fw-ds-400
        hover:bg-surface-100 active:bg-surface-400
        focus-visible:ring-2 focus-visible:ring-blue-300
        disabled:bg-surface-700 disabled:text-neutral-400
      `,
    'filled-tertiary': `
        bg-red-500 text-neutral-50 font-inter font-fw-ds-400
        hover:bg-red-300 active:bg-red-400
        focus-visible:ring-2 focus-visible:ring-red-200
        disabled:bg-red-700 disabled:text-neutral-400
      `,
  };

  $: baseClasses = `
      inline-flex items-center justify-center gap-1 transition-all outline-none
      ${sizeClasses[size]} ${variantClasses[variant]}
      ${disabled ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}
    `;
</script>

<button
  class={baseClasses}
  {type}
  {disabled}
  on:click={forwardEvent}
  on:focus={forwardEvent}
  on:blur={forwardEvent}
  on:keydown={forwardEvent}
  on:keyup={forwardEvent}
  on:mouseenter={forwardEvent}
  on:mouseleave={forwardEvent}
>
  {#if iconLeft}
    <slot name="iconLeft" />
  {/if}

  <slot />

  {#if iconRight}
    <slot name="iconRight" />
  {/if}
</button>
