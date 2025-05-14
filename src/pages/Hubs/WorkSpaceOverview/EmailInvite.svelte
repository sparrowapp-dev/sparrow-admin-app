<script lang="ts">
  import CloseIcon from '@/assets/icons/CloseIcon.svelte';
  import { createEventDispatcher, onMount } from 'svelte';

  export let label = 'Invite Emails';
  export let id = 'inviteEmails';
  export let placeholder = 'Enter email and press Enter';
  export let maxHeight = '150px';
  export let required: boolean = true;
  export let desc: string;

  const dispatch = createEventDispatcher();
  let inputValue = '';
  export let emails: string[] = [];
  let inputEl: HTMLInputElement;
  export let errorMessage = '';

  const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const addEmail = () => {
    const email = inputValue.trim();

    if (!email) return;

    if (!isValidEmail(email)) {
      errorMessage = 'Invalid email format.';
    } else if (emails.includes(email)) {
      errorMessage = 'Email already added.';
    } else {
      emails = [...emails, email];
      dispatch('change', { emails });
      errorMessage = '';
    }

    inputValue = '';
  };

  const removeEmail = (emailToRemove: string) => {
    emails = emails.filter((email) => email !== emailToRemove);
    dispatch('change', { emails });
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addEmail();
    }
  };

  const handleInput = () => {
    errorMessage = ''; // clear error while typing
  };

  onMount(() => {
    dispatch('change', { emails });
  });
</script>

<div class="flex w-full flex-col gap-1">
  {#if label}
    <label
      for={id}
      class="text-fs-ds-14 font-fw-ds-400 font-inter mb-0.5 flex items-center text-neutral-200"
    >
      {label}
      {#if required}
        <span class="ml-1 text-red-400">*</span>
      {/if}
    </label>
  {/if}{#if desc}
    <span class="text-fs-ds-12 leading-lh-ds-150 font-light text-neutral-200">{desc}</span>
  {/if}

  <div
    class={`bg-surface-400 flex flex-wrap gap-2 overflow-y-auto rounded-md  p-2 ${
      errorMessage ? 'border-red-500' : ''
    }`}
    style="max-height: {maxHeight};"
  >
    {#each emails as email}
      <div class="bg-surface-200 flex items-center rounded-sm px-1 py-1 text-sm text-neutral-50">
        {email}
        <button
          class="ml-2 p-0.5 focus:outline-none"
          on:click={() => removeEmail(email)}
          aria-label="Remove email"
        >
          <CloseIcon />
        </button>
      </div>
    {/each}

    <input
      {id}
      class="min-w-[150px] flex-1 bg-transparent px-1 text-sm outline-none"
      type="text"
      {placeholder}
      bind:value={inputValue}
      on:keydown={handleKeyDown}
      on:input={handleInput}
      bind:this={inputEl}
    />
  </div>

  {#if errorMessage}
    <p class="mt-1 text-sm text-red-500">{errorMessage}</p>
  {/if}
</div>
