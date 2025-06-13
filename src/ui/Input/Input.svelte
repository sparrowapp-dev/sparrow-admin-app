<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  export let label: string = '';
  export let value: string = '';
  export let placeholder: string = '';
  export let name: string = '';
  export let id: string = '';
  export let required: boolean = false;
  export let hasError: boolean = false;
  export let errorMessage: string = '';
  export let type: 'text' | 'email' | 'password' | 'number' | 'tel' = 'text';
  export let disabled: boolean = false;
  export let hasIcon: boolean = false;
  export let subtitle: string = '';

  // Event dispatcher to forward events to parent
  const dispatch = createEventDispatcher();

  // reactive hasError
  $: computedHasError = hasError === true;

  // Handle input event and dispatch it to parent
  function handleInput(event: Event) {
    dispatch('input', event);
  }

  // Handle blur event and dispatch it to parent
  function handleBlur(event: Event) {
    dispatch('blur', event);
  }

  // For number inputs, validate on input to ensure only numbers are entered
  function handleNumberInput(event: Event) {
    const input = event.target as HTMLInputElement;
    // Remove non-numeric characters
    const numericValue = input.value.replace(/[^0-9]/g, '');
    if (input.value !== numericValue) {
      input.value = numericValue;
      value = numericValue;
    }
    dispatch('input', event);
  }

  // Common class styles for all input types
  $: inputClasses = `
        w-full
        py-2
        ${$$slots.icon ? 'pl-10 pr-2' : 'px-2'}
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
        ${
          computedHasError
            ? 'border-red-300 focus:border-red-300'
            : 'border-transparent hover:border-neutral-300 focus:border-blue-300'
        }
        ${disabled ? 'opacity-60 cursor-not-allowed' : ''}
      `;
</script>

<div class="flex w-full flex-col">
  {#if label}
    <label
      for={id}
      class="text-fs-ds-14 font-fw-ds-400 font-inter {subtitle
        ? 'mb-0.5'
        : 'mb-2'} flex items-center text-neutral-200"
    >
      {label}
      {#if required}
        <span class="ml-1 text-red-400">*</span>
      {/if}
    </label>
  {/if}
  {#if subtitle}
    <div class="text-fs-ds-12 font-fw-ds-300 font-inter mb-2 flex items-center text-neutral-400">
      {subtitle}
    </div>
  {/if}

  <div class="relative">
    {#if $$slots.icon}
      <slot name="icon"></slot>
    {/if}

    {#if type === 'text'}
      <input
        {id}
        {name}
        type="text"
        {placeholder}
        {disabled}
        aria-required={required}
        aria-invalid={computedHasError}
        class={inputClasses}
        bind:value
        on:input={handleInput}
        on:blur={handleBlur}
      />
    {:else if type === 'email'}
      <input
        {id}
        {name}
        type="email"
        {placeholder}
        {disabled}
        aria-required={required}
        aria-invalid={computedHasError}
        class={inputClasses}
        bind:value
        on:input={handleInput}
        on:blur={handleBlur}
      />
    {:else if type === 'password'}
      <input
        {id}
        {name}
        type="password"
        {placeholder}
        {disabled}
        aria-required={required}
        aria-invalid={computedHasError}
        class={inputClasses}
        bind:value
        on:input={handleInput}
        on:blur={handleBlur}
      />
    {:else if type === 'number'}
      <!-- Use text type but with pattern and numeric validation -->
      <input
        {id}
        {name}
        type="text"
        pattern="[0-9]*"
        inputmode="numeric"
        {placeholder}
        {disabled}
        aria-required={required}
        aria-invalid={computedHasError}
        class={inputClasses}
        bind:value
        on:input={handleNumberInput}
        on:blur={handleBlur}
      />
    {:else if type === 'tel'}
      <input
        {id}
        {name}
        type="tel"
        {placeholder}
        {disabled}
        aria-required={required}
        aria-invalid={computedHasError}
        class={inputClasses}
        bind:value
        on:input={handleInput}
        on:blur={handleBlur}
      />
    {:else}
      <input
        {id}
        {name}
        type="text"
        {placeholder}
        {disabled}
        aria-required={required}
        aria-invalid={computedHasError}
        class={inputClasses}
        bind:value
        on:input={handleInput}
        on:blur={handleBlur}
      />
    {/if}
  </div>

  {#if computedHasError && errorMessage}
    <p class="text-fs-ds-12 font-fw-ds-300 font-inter mt-1 text-red-300">{errorMessage}</p>
  {/if}
</div>

<style>
  /* Remove spinner buttons for number inputs across browsers */
  input[type='number']::-webkit-inner-spin-button,
  input[type='number']::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  /* For Firefox */
  input[type='number'] {
    -moz-appearance: textfield;
  }
</style>
