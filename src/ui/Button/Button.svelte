<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import Tooltip from '@/components/Tooltip/Tooltip.svelte';

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
  // Tooltip props
  export let tooltipText: string = '';
  export let tooltipPosition: 'top' | 'right' | 'bottom' | 'left' = 'top';
  export let tooltipDelay: number = 0;
  export let className = '';

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
    'link-secondary': `
        bg-transparent text-[#b6b7b9] font-inter font-fw-ds-400 underline underline-offset-4 border-0
        hover:text-neutral-50 hover:bg-transparent
        focus-visible:text-blue-400 focus-visible:ring-2 focus-visible:ring-blue-200 focus-visible:no-underline
        active:text-blue-400 active:bg-transparent
        disabled:text-[#b6b7b9] disabled:opacity-60 disabled:cursor-not-allowed
      `,
  };

  $: baseClasses = `
      inline-flex items-center justify-center gap-2 transition-all outline-none
      ${sizeClasses[size]} ${variantClasses[variant]}
      ${disabled ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}
      ${className} 
    `;
</script>

{#if tooltipText}
  <Tooltip text={tooltipText} position={tooltipPosition} showDelay={tooltipDelay} size="xs">
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
  </Tooltip>
{:else}
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
{/if}
