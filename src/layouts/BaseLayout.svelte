<script lang="ts">
  import OptionalSideNav from '@/components/OptionalSideNav/OptionalSideNav.svelte';
  import SideNav from '@/components/SideNav/SideNav.svelte';
  import TopNav from '@/components/TopNav/TopNav.svelte';
  import { writable } from 'svelte/store';

  const showOptionalSideNav = writable(false);

  function toggleOptionalSideNav() {
    showOptionalSideNav.update((v) => !v);
  }
</script>

<div class="relative h-screen">
  <!-- Top Navigation -->
  <div class="absolute top-0 left-0 z-10 w-full">
    <TopNav />
  </div>

  <div class="flex h-full pt-[48px]">
    <!-- Permanent Side Navigation -->
    <SideNav />

    <!-- Optional Side Nav + Main Content -->
    <div class="relative flex flex-1 overflow-auto transition-all duration-300 ease-in-out">
      <!-- Optional SideNav -->
      {#if $showOptionalSideNav}
        <div class="z-20 w-64">
          <OptionalSideNav />
        </div>
      {/if}

      <!-- Main Content Area -->
      <div
        class={`flex-1 p-6 transition-all duration-300 ease-in-out ${$showOptionalSideNav ? 'ml-0' : ''}`}
      >
        <button
          class="mb-4 rounded bg-blue-600 px-3 py-1 text-white"
          on:click={toggleOptionalSideNav}
        >
          Toggle Optional SideNav
        </button>

        <slot />
      </div>
    </div>
  </div>
</div>
