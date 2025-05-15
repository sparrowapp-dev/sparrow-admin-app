<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import DropdownArrow from '@/assets/icons/DropdownArrow.svelte';
  import Check from '@/assets/icons/Check.svelte';
  import BlueCheckIcon from '@/assets/icons/BlueCheckIcon.svelte';

  export let row;
  const isAdmin = row.original.role === 'admin';
  let selectedRole = row.original.role;
  const roles = ['editor', 'viewer'];
  let isOpen = false;
  let openUp = false;
  let triggerEl: HTMLButtonElement;
  let dropdownEl: HTMLDivElement;

  function toggleDropdown() {
    if (!isOpen) {
      window.dispatchEvent(new CustomEvent('close-all-dropdowns'));

      // Wait for DOM to render
      requestAnimationFrame(() => {
        if (triggerEl && dropdownEl) {
          const triggerRect = triggerEl.getBoundingClientRect();
          const dropdownHeight = dropdownEl.offsetHeight * 1.8;
          const spaceBelow = window.innerHeight - triggerRect.bottom;
          const spaceAbove = triggerRect.top;

          openUp = spaceBelow < dropdownHeight && spaceAbove > dropdownHeight;
        }
      });
    }

    isOpen = !isOpen;
  }

  function closeDropdown() {
    isOpen = false;
  }

  onMount(() => {
    window.addEventListener('close-all-dropdowns', closeDropdown);
  });

  onDestroy(() => {
    window.removeEventListener('close-all-dropdowns', closeDropdown);
  });
</script>

<div class="relative flex items-center gap-5">
  <div class="relative flex gap-1">
    <div class="flex w-[61px] gap-1 pr-5">{selectedRole}</div>
    {#if !isAdmin}
      <button
        bind:this={triggerEl}
        class="cursor-pointer rounded-md p-2 text-neutral-300 transition-colors duration-200 hover:text-neutral-50"
        on:click|stopPropagation={toggleDropdown}
        aria-label="More actions"
      >
        <DropdownArrow open={isOpen} />
      </button>
    {/if}

    {#if isOpen}
      <div
        bind:this={dropdownEl}
        class={`bg-surface-600 absolute right-0 z-50 w-48 rounded-md shadow-lg ${
          openUp ? 'bottom-full mb-2' : 'top-8 mt-1'
        } text-fs-ds-12 font-regular leading-lh-ds-130 text-neutral-50`}
      >
        <div class="bg-surface-600 flex flex-col gap-1 py-1">
          {#each roles as role}
            <button
              class="hover:bg-surface-300 flex w-full items-center justify-between gap-2 px-2 py-1 {selectedRole ===
              role
                ? 'text-blue-400'
                : 'text-neutral-50'}"
              on:click={() => {
                selectedRole = role;
                isOpen = false;
              }}
            >
              <h2>{role}</h2>

              {#if selectedRole === role}
                <BlueCheckIcon />
              {/if}
            </button>
          {/each}
        </div>
      </div>
    {/if}
  </div>
</div>
