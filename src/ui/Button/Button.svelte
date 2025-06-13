<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher();

  function forwardEvent(event: Event) {
    dispatch(event.type, event);
  }

  export let variant:
    | 'filled-primary'
    | 'filled-secondary'
    | 'filled-tertiary'
    | 'outline-secondary'
    | 'outline-primary'
    | 'filled-primary-white' = 'filled-primary';
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
    'filled-primary-white': `
        bg-neutral-50 text-black font-inter font-fw-ds-400
        hover:bg-blue-400 active:bg-blue-600 hover:text-neutral-50
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
    'outline-primary': `
        bg-transparent text-blue-300 font-inter font-fw-ds-400
        hover:bg-blue-400 hover:text-neutral-50 active:bg-blue-600
        focus-visible:ring-2 focus-visible:ring-blue-200
        disabled:bg-transparent disabled:text-neutral-500 border border-surface-50
        hover:border-blue-400 active:border-blue-600
      `,
    'outline-secondary': `
        bg-transparent text-neutral-100 font-inter font-fw-ds-400
        hover:bg-surface-300 hover:text-neutral-50 active:bg-surface-400
        focus-visible:ring-2 focus-visible:ring-blue-200
        disabled:bg-transparent disabled:text-neutral-500 border border-surface-50
        hover:border-transparent active:border-transparent
      `,
  };

  $: baseClasses = `
      inline-flex items-center justify-center gap-2 transition-all outline-none
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
    <div class="{disabled ? 'cursor-not-allowed opacity-50' : ''} flex items-center">
      <slot name="iconLeft" />
    </div>
  {/if}

  <slot />

  {#if iconRight}
    <slot name="iconRight" />
  {/if}
</button>
