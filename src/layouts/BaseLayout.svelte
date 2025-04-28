<script lang="ts">
  import SideNav from '@/components/SideNav/SideNav.svelte';
  import TopNav from '@/components/TopNav/TopNav.svelte';
</script>

<div class="relative h-screen">
  <!-- Top Navigation - position it at the top of the screen, spanning the full width -->
  <div class="absolute top-0 left-0 z-10 w-full">
    <TopNav />
  </div>

  <div class="flex h-full pt-[72px]">
    <!-- Add padding-top equal to TopNav height -->
    <!-- Side Navigation -->
    <SideNav />

    <!-- Main content area -->
    <div class="flex-1 overflow-auto p-6">
      <slot />
    </div>
  </div>
</div>
