<script lang="ts">
  import SideNav from '@/components/SideNav/SideNav.svelte';
  import TopNav from '@/components/TopNav/TopNav.svelte';
  import { writable } from 'svelte/store';

  const showOptionalSideNav = writable(false);
</script>

<div class="relative h-screen">
  <!-- Top Navigation -->
  <div class="absolute top-0 left-0 z-10 w-full">
    <TopNav />
  </div>

  <div class="flex h-full pt-[48px]">
    <!-- Permanent Side Navigation -->
    <SideNav />

    <!--  Main Content -->
    <div class="relative flex flex-1 overflow-auto transition-all duration-300 ease-in-out">
      <!-- Main Content Area -->
      <div
        class={`flex-1 transition-all duration-300 ease-in-out ${$showOptionalSideNav ? 'ml-0' : ''}`}
      >
        <slot />
      </div>
    </div>
  </div>
</div>
