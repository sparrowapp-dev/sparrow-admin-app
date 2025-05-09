<script lang="ts">
  import SparrowBirdBg from '@/assets/icons/SparrowBirdBg.svelte';
</script>

<div
  class="bg-surface-900 flex h-screen w-full flex-col items-center justify-center px-4 text-center"
>
  <SparrowBirdBg />

  <h1 class="font-fw-ds-500 font-inter text-fs-ds-16 mt-5 max-w-xl text-neutral-200">
    This application requires a redirect URL from Sparrow.
  </h1>
  <p class="font-fw-ds-400 font-inter text-fs-ds-14 max-w-xl text-neutral-400">
    Please navigate from the Sparrow application to log in properly.
  </p>
</div>
