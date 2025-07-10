<script>
  import { tweened } from 'svelte/motion';
  import { cubicOut } from 'svelte/easing';
  import { onMount } from 'svelte';

  export let label;
  export let value;

  // Simple modern animation
  const opacity = tweened(0, {
    duration: 600,
    easing: cubicOut
  });

  const translateY = tweened(20, {
    duration: 600,
    easing: cubicOut
  });

  const contentBlur = tweened(4, {
    duration: 300,
    easing: cubicOut
  });

  onMount(() => {
    setTimeout(() => {
      opacity.set(1);
      translateY.set(0);
      contentBlur.set(0);
    }, 100);
  });
</script>

<div 
  class="bg-surface-600 rounded-lg p-6"
  style="opacity: {$opacity}; transform: translateY({$translateY}px); filter: blur({$contentBlur}px);"
>
  <div class="flex flex-col gap-3">
    <div class="text-fs-ds-14 leading-lh-ds-143 font-fw-ds-400 text-neutral-50">
      {label}
    </div>
    <div class="font-inter text-fs-ds-24 leading-lh-ds-120 font-medium text-neutral-50">
      {value}
    </div>
  </div>
</div>
