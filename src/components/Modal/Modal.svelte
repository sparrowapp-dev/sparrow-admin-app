<script>
  import { createEventDispatcher, onMount } from 'svelte';
  import { scale } from 'svelte/transition';

  const dispatch = createEventDispatcher();
  let modalRef;

  const handleClickOutside = (event) => {
    if (!modalRef.contains(event.target)) {
      dispatch('close');
    }
  };

  onMount(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  });
</script>

<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
  <div
    class="w-full max-w-lg"
    bind:this={modalRef}
    transition:scale={{ duration: 300 }}
  >
    <slot />
  </div>
</div>
