<script lang="ts">
  import Tooltip from '@/components/Tooltip/Tooltip.svelte';
  import EditIcon from '@/assets/icons/EditIcon.svelte';

  export let row;
  export let on_editBilling;

  function handleDeleteCard(event) {
    event.stopPropagation();

    // IMPORTANT: Use the callback directly instead of dispatching an event
    if (typeof on_editBilling === 'function') {
      on_editBilling(row.original);
    } else {
      console.error('on_editBilling is not a function', on_editBilling);
    }
  }
</script>

<div class="relative flex items-center justify-end gap-4">
  <Tooltip text={'Edit Card'} position={'top'} mode="hover" size="xs">
    <button
      class="hover:bg-surface-300 cursor-pointer rounded px-3.5 py-2 text-neutral-300 transition-colors duration-200 hover:text-red-400"
      on:click={(e) => handleDeleteCard(e)}
      aria-label="Delete card"
      data-action="delete-card"
    >
      <EditIcon />
    </button>
  </Tooltip>
</div>
