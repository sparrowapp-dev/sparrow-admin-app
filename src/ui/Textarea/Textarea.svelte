<script lang="ts">
  import { createEventDispatcher, tick } from 'svelte';

  export let label = '';
  export let value = '';
  export let placeholder = '';
  export let name = '';
  export let id = '';
  export let required = false;
  export let hasError = false;
  export let errorMessage = '';
  export let disabled = false;
  export let charLimit = 200;
  export let minHeight = 120;

  const dispatch = createEventDispatcher();

  let showGlow = false;

  $: computedHasError = hasError === true;
  $: currentLength = value?.length ?? 0;
  $: isAtLimit = currentLength >= charLimit;

  function handleInput(event: Event) {
    const inputEl = event.target as HTMLTextAreaElement;
    const input = inputEl.value;

    if (input.length <= charLimit) {
      value = input;
      dispatch('input', event);
    } else {
      // Reset the DOM value back to your state to prevent "extra typing"
      inputEl.value = value;
      showGlow = true;
      tick();
      showGlow = false;
    }
  }
  function handleChange(event: Event) {
    if (!isAtLimit) {
      dispatch('change', event);
    }
  }

  function handleBlur(event: Event) {
    dispatch('blur', event);
  }

  function handleFocus(event: Event) {
    dispatch('focus', event);
  }

  function handleKeydown(event: KeyboardEvent) {
    dispatch('keydown', event);
  }

  $: inputClasses = `
      w-full
      resize-none
      py-2
      px-2
      bg-surface-400
      rounded-sm
      text-fs-ds-14
      font-fw-ds-300
      text-neutral-50
      border
      transition-all
      duration-200
      outline-none
      placeholder:text-neutral-400
      ${computedHasError ? 'border-red-300 focus:border-red-300' : 'border-transparent hover:border-neutral-300 focus:border-blue-300'}
      ${disabled ? 'opacity-60 cursor-not-allowed' : ''}
    `;
</script>

<div class="flex w-full flex-col">
  {#if label}
    <label for={id} class="text-fs-ds-14 font-fw-ds-400 font-inter mb-2 text-neutral-200">
      {label}
      {#if required}
        <span class="ml-1 text-red-400">*</span>
      {/if}
    </label>
  {/if}

  <textarea
    {id}
    {name}
    {placeholder}
    {disabled}
    {value}
    style={`min-height: ${minHeight}px`}
    aria-required={required}
    aria-invalid={computedHasError}
    class={inputClasses}
    on:input={handleInput}
    on:change={handleChange}
    on:blur={handleBlur}
    on:focus={handleFocus}
    on:keydown={handleKeydown}
  />

  <div class="text-fs-ds-12 font-fw-ds-300 font-inter mt-1 flex flex-col">
    {#if computedHasError && errorMessage}
      <p class="text-red-300">{errorMessage}</p>
    {/if}
    <div class="flex w-full items-center justify-between">
      <p class="text-neutral-400">Max {charLimit} characters</p>
      <p
        class={`ml-auto ${isAtLimit ? 'text-red-400' : 'text-neutral-400'} ${showGlow ? 'animate-pulse' : ''}`}
      >
        {currentLength} / {charLimit}
      </p>
    </div>
  </div>
</div>

<style>
  .animate-pulse {
    animation: pulseHighlight 0.4s ease-in-out;
  }

  @keyframes pulseHighlight {
    0% {
      color: #f87171;
      transform: scale(1.05);
    }
    100% {
      color: inherit;
      transform: scale(1);
    }
  }
</style>
