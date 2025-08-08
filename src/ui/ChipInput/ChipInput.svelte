<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte';
  import CloseIcon from '@/assets/icons/CloseIcon.svelte';
  import { fade } from 'svelte/transition';

  interface UserDetail {
    email: string;
    name: string;
  }

  // Props
  export let emails: string[] = [];
  export let hasError = false;
  export let errorMessage = '';
  export let placeholder = 'Enter email ID';
  export let IsWorkspaceInvite = false;
  export let UserDetails: UserDetail[] = [];

  const dispatch = createEventDispatcher();

  // Refs
  let inputValue = '';
  let inputElement: HTMLInputElement;
  let containerElement: HTMLDivElement;
  let dropdownElement: HTMLDivElement;

  // Dropdown and selection logic
  $: filteredUsers = UserDetails.filter((user) => !emails.includes(user.email)).sort((a, b) =>
    a.email.localeCompare(b.email),
  );
  let showDropdown = false;
  let selectedIndex = -1;

  // Validation
  let invalidEmails: string[] = [];
  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;

  function validateEmail(email: string): boolean {
    return emailRegex.test(email.trim());
  }

  function checkEmailsValidity(emailList: string[]): boolean {
    invalidEmails = emailList.filter((email) => !validateEmail(email));

    hasError = invalidEmails.length > 0;
    if (hasError) {
      errorMessage = 'Please check and enter correct email address.';
    } else if (errorMessage === 'Please check and enter correct email address.') {
      errorMessage = '';
    }

    dispatch('validity', {
      isValid: invalidEmails.length === 0,
      invalidEmails,
    });

    return invalidEmails.length === 0;
  }

  function addEmail(): boolean {
    const emailsToAdd = inputValue
      .split(/[\s,]+/)
      .map((e) => e.trim())
      .filter((e) => e && !emails.includes(e));

    if (!emailsToAdd.length) return true;

    const newEmails = [...emails, ...emailsToAdd];
    inputValue = '';
    showDropdown = false;

    dispatch('change', newEmails);
    return checkEmailsValidity(newEmails);
  }

  function removeEmail(index: number): boolean {
    const newEmails = emails.filter((_, i) => i !== index);
    dispatch('change', newEmails);
    return checkEmailsValidity(newEmails);
  }

  function handleKeyDown(event: KeyboardEvent) {
    if (['Enter', ',', ' '].includes(event.key)) {
      event.preventDefault();
      addEmail();
    }

    if (event.key === 'Backspace' && !inputValue && emails.length > 0) {
      removeEmail(emails.length - 1);
    }

    scrollToInput();
  }

  function handlePaste(event: ClipboardEvent): boolean {
    event.preventDefault();
    const pastedText = event.clipboardData?.getData('text') || '';

    const pastedEmails = pastedText
      .split(/[\s,]+/)
      .map((e) => e.trim())
      .filter((e) => e && !emails.includes(e));

    if (!pastedEmails.length) return true;

    const newEmails = [...emails, ...pastedEmails];
    dispatch('change', newEmails);
    return checkEmailsValidity(newEmails);
  }

  function selectUser(user: UserDetail) {
    const newEmails = [...emails, user.email];
    inputValue = '';
    showDropdown = false;
    selectedIndex = -1;
    dispatch('change', newEmails);
    checkEmailsValidity(newEmails);
  }

  function handleFocus() {
    scrollToInput();
    showDropdown = true;
  }

  function handleBlur() {
    if (inputValue.trim() && !IsWorkspaceInvite) {
      addEmail();
    }
  }

  function scrollToInput() {
    if (!containerElement || !inputElement) return;

    const containerRect = containerElement.getBoundingClientRect();
    const inputRect = inputElement.getBoundingClientRect();

    const isInputBelow = inputRect.bottom - containerRect.top > containerRect.height;
    if (isInputBelow) {
      containerElement.scrollTo({
        top: containerElement.scrollHeight,
        behavior: 'smooth',
      });
    }
  }

  function isInvalidEmail(email: string): boolean {
    return !validateEmail(email);
  }

  export function hasInvalidEmails(): boolean {
    return invalidEmails.length > 0;
  }

  function filterUsers(input: string): UserDetail[] {
    if (!input || !IsWorkspaceInvite) return [];
    return UserDetails.filter(
      (user) =>
        !emails.includes(user.email) &&
        (user.email.toLowerCase().includes(input.toLowerCase()) ||
          user.name.toLowerCase().includes(input.toLowerCase())),
    ).sort((a, b) => a.email.localeCompare(b.email));
  }

  function handleOutsideClick(event: MouseEvent) {
    if (!showDropdown) return;

    const target = event.target as Node;
    const isClickInside = containerElement?.contains(target) || dropdownElement?.contains(target);

    if (!isClickInside) {
      showDropdown = false;
      selectedIndex = -1;

      // Add email if there's input and not in workspace invite mode
      if (inputValue.trim() && !IsWorkspaceInvite) {
        addEmail();
      }
    }
  }

  onMount(() => {
    if (inputElement && !IsWorkspaceInvite) inputElement.focus();
    checkEmailsValidity(emails);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) scrollToInput();
        });
      },
      {
        root: containerElement,
        threshold: 1.0,
      },
    );

    if (inputElement) observer.observe(inputElement);

    // Add outside click listener
    document.addEventListener('click', handleOutsideClick);

    return () => {
      observer.disconnect();
      document.removeEventListener('click', handleOutsideClick);
    };
  });

  // Reactive dropdown filter
  $: if (IsWorkspaceInvite && inputValue) {
    filteredUsers = filterUsers(inputValue);
    showDropdown = filteredUsers.length > 0 || !!inputValue;
    selectedIndex = -1;
  }
</script>

<div class="relative">
  <div
    bind:this={containerElement}
    class="bg-surface-400 flex flex-wrap items-center gap-2 rounded-sm border {emails?.length > 0
      ? 'p-[3px]'
      : 'p-2 '} hover:border-neutral-400 {hasError
      ? 'border-red-300'
      : 'border-surface-400'}  max-h-[120px] min-h-[36px] overflow-y-auto"
    on:click={() => inputElement.focus()}
  >
    {#each emails as email, i}
      <div
        class="flex items-center gap-1 rounded px-2 py-1 {isInvalidEmail(email)
          ? 'border border-red-300 bg-red-900/20'
          : 'bg-surface-200'}"
      >
        <span class="text-fs-ds-12 {isInvalidEmail(email) ? 'text-red-300' : 'text-neutral-50'}"
          >{email}</span
        >
        <button
          type="button"
          class="cursor-pointer"
          on:click|stopPropagation={() => removeEmail(i)}
        >
          <CloseIcon />
        </button>
      </div>
    {/each}

    <input
      bind:this={inputElement}
      bind:value={inputValue}
      type="text"
      {placeholder}
      class="text-fs-ds-14 placeholder:font-fw-ds-300 min-w-[120px] flex-grow bg-transparent text-neutral-50 placeholder:text-neutral-400 focus:outline-none"
      on:keydown={handleKeyDown}
      on:blur={handleBlur}
      on:paste={handlePaste}
      on:focus={handleFocus}
    />
  </div>
  {#if IsWorkspaceInvite && showDropdown}
    <div
      bind:this={dropdownElement}
      class="border-surface-200 bg-surface-400 absolute top-full right-0 left-0 z-50 mt-1 max-h-52 overflow-y-auto rounded-sm border shadow-lg"
    >
      {#if filteredUsers.length > 0}
        {#each filteredUsers as user, i}
          <button
            class="hover:bg-surface-200 flex w-full cursor-pointer items-center gap-2 px-3 py-2 {selectedIndex ===
            i
              ? 'bg-surface-300'
              : ''}"
            on:click|stopPropagation={(e) => {
              e.preventDefault();
              e.stopPropagation();
              selectUser(user);
            }}
          >
            <div class="flex flex-row gap-3">
              <div
                class="border-surface-50 flex h-9 w-9 items-center justify-center rounded-[133.33px] border"
              >
                {user.email.charAt(0).toUpperCase()}
              </div>
              <div class="flex flex-col text-left">
                <span class="text-fs-ds-14 text-neutral-50">{user.name}</span>
                <span class="text-fs-ds-12 text-neutral-400">{user.email}</span>
              </div>
            </div>
          </button>
        {/each}
      {/if}

      <!-- Show input value as last item only if there's input and no exact match -->
      {#if inputValue !== '' && !filteredUsers.some((user) => user.email.toLowerCase() === inputValue.toLowerCase())}
        <button
          class="hover:bg-surface-200 flex w-full cursor-pointer items-center gap-2 px-3 py-2"
          on:click|stopPropagation={() => addEmail()}
        >
          <div class="flex flex-row gap-3">
            <div
              class="border-surface-50 flex h-9 w-9 items-center justify-center rounded-[133.33px] border"
            >
              {inputValue?.charAt(0).toUpperCase()}
            </div>
            <div class="flex flex-col text-left">
              <span class="text-fs-ds-14 text-neutral-50">{inputValue}</span>
              <span class="text-fs-ds-12 text-neutral-400">{inputValue}</span>
            </div>
          </div>
        </button>
      {:else if inputValue == '' && emails.length < 1 && filteredUsers?.length < 1}
        <button
          class="hover:bg-surface-200 flex w-full cursor-pointer items-center gap-2 px-3 py-2"
          on:click|stopPropagation={() => addEmail()}
        >
          <div class="flex flex-row">
            <div class="flex flex-col text-left">
              <span class="text-fs-ds-14 text-neutral-50">No members found!</span>
              <span class="text-fs-ds-12 text-neutral-400"></span>
            </div>
          </div>
        </button>
      {/if}
    </div>
  {/if}

  {#if hasError && errorMessage}
    <p class="text-fs-ds-12 font-fw-ds-300 font-inter mt-1 text-red-300">{errorMessage}</p>
  {/if}
</div>
