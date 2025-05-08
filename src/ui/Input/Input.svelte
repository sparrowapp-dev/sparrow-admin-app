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

  // Event dispatcher to forward events to parent
  const dispatch = createEventDispatcher();

  // reactive hasError
  $: computedHasError = hasError === true;

  // Handle input event and dispatch it to parent
  function handleInput(event: Event) {
    dispatch('input', event);
  }

  // Common class styles for all input types
  $: inputClasses = `
        w-full
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
      class="text-fs-ds-14 font-fw-ds-400 font-inter mb-2 flex items-center text-neutral-200"
    >
      {label}
      {#if required}
        <span class="ml-1 text-red-400">*</span>
      {/if}
    </label>
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
    />
  {:else if type === 'email'}
    <input
      {id}
      {name}
      type="email"
      {placeholder}
      {disabled}
      {required}
      aria-required={required}
      aria-invalid={computedHasError}
      class={inputClasses}
      bind:value
      on:input={handleInput}
    />
  {:else if type === 'password'}
    <input
      {id}
      {name}
      type="password"
      {placeholder}
      {disabled}
      {required}
      aria-required={required}
      aria-invalid={computedHasError}
      class={inputClasses}
      bind:value
      on:input={handleInput}
    />
  {:else if type === 'number'}
    <input
      {id}
      {name}
      type="number"
      {placeholder}
      {disabled}
      {required}
      aria-required={required}
      aria-invalid={computedHasError}
      class={inputClasses}
      bind:value
      on:input={handleInput}
    />
  {:else if type === 'tel'}
    <input
      {id}
      {name}
      type="tel"
      {placeholder}
      {disabled}
      {required}
      aria-required={required}
      aria-invalid={computedHasError}
      class={inputClasses}
      bind:value
      on:input={handleInput}
    />
  {:else}
    <!-- Default to text type if an unsupported type is provided -->
    <input
      {id}
      {name}
      type="text"
      {placeholder}
      {disabled}
      {required}
      aria-required={required}
      aria-invalid={computedHasError}
      class={inputClasses}
      bind:value
    />
  {/if}

  {#if computedHasError && errorMessage}
    <p class="text-fs-ds-12 font-fw-ds-300 font-inter mt-1 text-red-300">{errorMessage}</p>
  {/if}
</div>
