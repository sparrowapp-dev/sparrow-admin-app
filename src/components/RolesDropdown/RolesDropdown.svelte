<script lang="ts">
  import { createEventDispatcher, onMount, onDestroy, tick } from 'svelte';
  import DropdownArrow from '@/assets/icons/DropdownArrow.svelte';
  import BlueCheckIcon from '@/assets/icons/BlueCheckIcon.svelte';

  export let selected: string;
  export let options: string[] = [];
  export let disabled: boolean = false;
  export let onChange;

  let isOpen = false;
  let openUp = false;
  let triggerEl: HTMLButtonElement;
  let dropdownEl: HTMLDivElement;
  let position = { top: 0, left: 0, width: 0 };

  function calculatePosition() {
    if (!triggerEl || !dropdownEl) return;

    const triggerRect = triggerEl.getBoundingClientRect();
    const dropdownHeight = dropdownEl.offsetHeight;
    const dropdownWidth = dropdownEl.offsetWidth;
    const spaceBelow = window.innerHeight - triggerRect.bottom;
    const spaceRight = window.innerWidth - triggerRect.right;

    openUp = spaceBelow < dropdownHeight + 5;

    position = {
      top: openUp ? triggerRect.top - dropdownHeight - 5 : triggerRect.bottom + 5,
      left:
        spaceRight < dropdownWidth
          ? triggerRect.right - dropdownWidth
          : triggerRect.right - dropdownWidth,
      width: dropdownWidth,
    };
  }

  async function toggleDropdown(event) {
    event.stopPropagation();
    if (!isOpen) {
      window.dispatchEvent(new CustomEvent('close-all-dropdowns'));
      isOpen = true;
      await tick();
      calculatePosition();
    } else {
      isOpen = false;
    }
  }

  function closeDropdown() {
    isOpen = false;
  }

  function handleSelect(option: string) {
    closeDropdown();
    onChange(option.value);
  }

  onMount(() => {
    window.addEventListener('close-all-dropdowns', closeDropdown);
    window.addEventListener('click', handleClickOutside);
  });

  onDestroy(() => {
    window.removeEventListener('close-all-dropdowns', closeDropdown);
    window.removeEventListener('click', handleClickOutside);
  });

  function handleClickOutside(event) {
    if (
      isOpen &&
      triggerEl &&
      !triggerEl.contains(event.target) &&
      dropdownEl &&
      !dropdownEl.contains(event.target)
    ) {
      closeDropdown();
    }
  }
</script>

<div class="relative flex items-center gap-5">
  <div class="relative flex gap-1">
    <div class="flex w-[61px] gap-1">{selected.label}</div>
    {#if !disabled}
      <button
        bind:this={triggerEl}
        class="cursor-pointer rounded-md p-2 text-neutral-300 transition-colors duration-200 hover:text-neutral-50"
        on:click={toggleDropdown}
        aria-label="More actions"
      >
        <DropdownArrow open={isOpen} />
      </button>
    {/if}

    {#if isOpen}
      <div
        bind:this={dropdownEl}
        style="top: {position.top}px; left: {position.left}px; width: {position.width || 105}px;"
        class={`bg-surface-600 fixed right-0 z-[999] w-48 rounded-md  shadow-lg ${
          openUp ? 'bottom-full mb-2' : 'mt-1'
        } text-fs-ds-12 font-regular leading-lh-ds-130 text-neutral-50`}
      >
        <div class="bg-surface-600 flex flex-col gap-1 rounded-sm py-1">
          {#each options as option}
            <button
              class="hover:bg-surface-300 flex w-full items-center justify-between gap-1 px-2 py-1 {selected ===
              option.value
                ? 'text-blue-400'
                : 'text-neutral-50'}"
              on:click={() => handleSelect(option)}
            >
              <h2>{option.label}</h2>
              {#if selected === option.value}
                <BlueCheckIcon />
              {/if}
            </button>
          {/each}
        </div>
      </div>
    {/if}
  </div>
</div>
