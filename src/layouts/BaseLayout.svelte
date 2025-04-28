<script lang="ts">
  import SideNav from '@/components/SideNav/SideNav.svelte';
  import TopNav from '@/components/TopNav/TopNav.svelte';
</script>

<div class="flex h-screen">
  <!-- Side Navigation -->
  <SideNav />

  <!-- Main content area -->
  <div class="flex flex-1 flex-col">
    <!-- Top Navigation -->
    <TopNav />

    <!-- Main content (child routes) -->
    <div class="flex-1 overflow-auto p-6">
      <slot />
    </div>
  </div>
</div>
