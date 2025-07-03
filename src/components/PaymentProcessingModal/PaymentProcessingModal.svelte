<script lang="ts">
  import CloseIcon from '@/assets/icons/CloseIcon.svelte';
  import { onMount, onDestroy, createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher<{
    close: void;
  }>();

  function handleClose() {
    dispatch('close');
  }

  // Maximum time in seconds (5 minutes)
  const MAX_TIME = 300;

  export let title;
  export let description;

  let timeLeft = MAX_TIME;
  let timer;
  let progress = 0;

  onMount(() => {
    startTimer();
  });

  onDestroy(() => {
    if (timer) clearInterval(timer);
  });

  function startTimer() {
    timer = setInterval(() => {
      if (timeLeft > 0) {
        timeLeft--;
        progress = ((MAX_TIME - timeLeft) / MAX_TIME) * 100;
      } else {
        clearInterval(timer);
      }
    }, 1000);
  }

  function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
</script>

<div class="bg-surface-600 flex flex-col items-center gap-4 rounded-lg p-6 text-white">
  <div class="w-full items-start justify-between">
    <div class="mb-4 flex w-full items-center justify-between">
      <h2 class="text-fs-ds-20 font-inter font-fw-ds-500">{title}</h2>
      <button on:click={handleClose} class="cursor-pointer">
        <CloseIcon />
      </button>
    </div>

    <div class="flex items-center gap-2">
      <p class="text-fs-ds-12 font-inter font-fw-ds-400 text-neutral-100">
        {description}
      </p>
      <div class="relative flex items-center justify-center">
        <!-- Timer circle background -->
        <svg class="h-12 w-12 -rotate-90 transform" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="#31353F"
            stroke-width="6"
            class="text-surface-100"
          />
          <!-- Progress circle -->
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="#6894F9"
            stroke-width="6"
            stroke-linecap="round"
            stroke-dasharray="283"
            stroke-dashoffset={(283 * progress) / 100}
            class="text-blue-300 transition-all duration-500 ease-in-out"
          />
        </svg>
        <!-- Timer text -->
        <span class="text-fs-ds-12 font-inter font-fw-ds-400 absolute text-neutral-200"
          >{formatTime(timeLeft)}</span
        >
      </div>
    </div>
  </div>
</div>

<style>
  circle {
    transition: stroke-dashoffset 0.5s ease-in-out;
  }
</style>
