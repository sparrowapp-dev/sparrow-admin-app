<script lang="ts">
  import BlueCheckIcon from '@/assets/icons/BlueCheckIcon.svelte';
  import DropdownslimArrow from '@/assets/icons/DropdownslimArrow.svelte';
  import { createEventDispatcher } from 'svelte';
  export let required: boolean = true;
  export let label: string = 'Select an option';
  export let id: string = 'dropdown';
  export let placeholder: string = 'Choose...';
  export let options: string[] = [];
  export let selected: string = '';
  export let errorMessage: string = '';

  const dispatch = createEventDispatcher();

  let isOpen = false;

  const toggleDropdown = () => (isOpen = !isOpen);

  const selectOption = (option: string) => {
    selected = option;
    isOpen = false;
    dispatch('change', { selected });
  };
</script>

<div class="relative flex w-full flex-col gap-1">
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

  <button
    {id}
    type="button"
    on:click={toggleDropdown}
    class={`bg-surface-400 text-fs-ds-14 leading-fs-ds-143 flex w-full cursor-pointer items-center justify-between  rounded-sm px-2 py-2 text-left text-neutral-50 ${
      errorMessage ? 'border-red-500' : ''
    }`}
  >
    <span>{selected || placeholder}</span>
    <span class="ml-2">
      <DropdownslimArrow />
    </span>
  </button>

  {#if isOpen}
    <ul
      class="bg-surface-600 absolute top-full left-0 z-10 mt-1 max-h-60 w-full overflow-y-auto rounded-sm p-1 shadow-lg"
    >
      {#each options as option}
        <li
          class="hover:bg-surface-400 flex cursor-pointer items-center justify-between px-2 py-1 text-sm"
          on:click={() => selectOption(option.value)}
        >
          <span class="flex flex-col">
            <span
              class="text-fs-ds-12 font-fw-ds-400 leading-lh-ds-130 {selected === option?.value
                ? 'text-blue-300'
                : 'text-neutral-50'}">{option?.value}</span
            >
            {#if option.desc}
              <span class="text-fs-ds-12 leading-lh-ds-150 font-light text-neutral-300"
                >{option.desc}</span
              >
            {/if}</span
          >
          {#if selected === option.value}<BlueCheckIcon />{/if}
        </li>
      {/each}
    </ul>
  {/if}

  {#if errorMessage}
    <p class="mt-1 text-sm text-red-500">{errorMessage}</p>
  {/if}
</div>
