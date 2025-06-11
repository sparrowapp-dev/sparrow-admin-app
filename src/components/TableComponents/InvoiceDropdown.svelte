<script lang="ts">
  import { onMount, onDestroy, tick } from 'svelte';
  import Tooltip from '../Tooltip/Tooltip.svelte';
  import Eye from '@/assets/icons/Eye.svelte';
  import ArrowDownload from '@/assets/icons/ArrowDownload.svelte';

  export let invoice;
  export let openInvoiceDetails: (invoice: any) => void;

  let isOpen = false;
  let openUp = false;
  let triggerEl: HTMLButtonElement;
  let dropdownEl: HTMLDivElement;
  let position = { top: 0, left: 0, width: 0 };

  function toggleDropdown(event) {
    event.stopPropagation();
    if (!isOpen) {
      window.dispatchEvent(new CustomEvent('close-all-dropdowns'));
      isOpen = true;
      tick().then(calculatePosition);
    } else {
      isOpen = false;
    }
  }

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
          : triggerRect.right - dropdownWidth + 30,
      width: dropdownWidth,
    };
  }

  function closeDropdown() {
    isOpen = false;
  }

  function handleViewDetails(event) {
    event.stopPropagation();
    if (openInvoiceDetails) openInvoiceDetails(invoice);
    closeDropdown();
  }

  function handleDownloadInvoice(event) {
    event.stopPropagation();
    const url = invoice.invoicePdf;
    if (url) {
      window.open(url, '_blank');
    }
    closeDropdown();
  }

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

  onMount(() => {
    document.addEventListener('click', handleClickOutside);
    window.addEventListener('close-all-dropdowns', closeDropdown);
    window.addEventListener('scroll', closeDropdown, true);
  });

  onDestroy(() => {
    document.removeEventListener('click', handleClickOutside);
    window.removeEventListener('close-all-dropdowns', closeDropdown);
    window.removeEventListener('scroll', closeDropdown, true);
  });
</script>

<div class="relative flex items-center justify-end gap-4">
  <Tooltip text={'Show Actions'} position={'top'} mode="hover" size="xs">
    <button
      bind:this={triggerEl}
      class="hover:bg-surface-300 cursor-pointer rounded px-3.5 py-2 text-neutral-300 transition-colors duration-200 hover:text-neutral-50"
      on:click={toggleDropdown}
      aria-label="More actions"
      aria-haspopup="true"
      aria-expanded={isOpen}
      data-action="toggle-menu"
    >
      ⋮
    </button>
  </Tooltip>
</div>

{#if isOpen}
  <div
    bind:this={dropdownEl}
    class="fixed z-[999] shadow-xl"
    style="top: {position.top}px; left: {position.left}px; width: {position.width || 180}px;"
    on:click|stopPropagation
  >
    <div class="bg-surface-600 flex flex-col gap-1 overflow-hidden rounded-sm px-1 py-1">
      <button
        class="hover:bg-surface-300 flex w-full cursor-pointer items-center gap-2 px-2 py-2 text-neutral-50 hover:rounded"
        on:click={handleViewDetails}
      >
        <Eye />
        <h2 class="text-fs-ds-12 font-regular">View More Details</h2>
      </button>
      <button
        class="hover:bg-surface-300 flex w-full cursor-pointer items-center gap-2 px-2 py-2 text-neutral-50 hover:rounded"
        on:click={handleDownloadInvoice}
      >
        <ArrowDownload />
        <h2 class="text-fs-ds-12 font-regular">Download Invoice</h2>
      </button>
    </div>
  </div>
{/if}
