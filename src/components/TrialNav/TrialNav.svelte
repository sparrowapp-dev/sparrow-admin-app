<script>
  import SparrowIcon from '@/assets/icons/SparrowIcon.svelte';
</script>

<header
  class="fixed top-0 left-0 z-50 flex h-[62px] w-full items-center bg-black px-6"
  style="
    border-bottom: 1px solid;
    border-image-source: radial-gradient(51.02% 51.02% at 50% 100%, #FFFFFF 0%, rgba(102, 102, 102, 0) 100%);
    border-image-slice: 1;
  "
>
  <div class="flex items-center">
    <div class="flex h-8 items-center space-x-2">
      <SparrowIcon />
      <span class="font-fw-ds-500 text-xl text-white">Sparrow</span>
    </div>
  </div>
</header>
