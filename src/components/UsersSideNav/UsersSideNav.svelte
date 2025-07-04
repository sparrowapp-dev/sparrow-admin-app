<script lang="ts">
  import { Link, navigate, useLocation } from 'svelte-routing';
  import { onMount } from 'svelte';
  import { tweened } from 'svelte/motion';
  import { cubicOut } from 'svelte/easing';

  // Get current path using the useLocation hook
  const location = useLocation();

  // Animation stores for sidebar slide-in effect
  const sidebarOpacity = tweened(0, {
    duration: 500,
    easing: cubicOut
  });

  const sidebarTranslateX = tweened(-100, {
    duration: 500,
    easing: cubicOut
  });

  // Reactive variables for active states
  $: isOverviewActive =
    $location.pathname === '/users/users-dashboard' || $location.pathname === '/users';
  $: isUsersActive = $location.pathname.startsWith('/users/users-overview');

  // Function to handle navigation with active state updates
  function handleNavigation(path) {
    navigate(path);
  }

  // Handle route changes reactively
  $: if ($location.pathname === '/users') {
    navigate('/users/users-dashboard', { replace: true });
  }

  onMount(() => {
    // Trigger slide-in animation
    setTimeout(() => {
      sidebarOpacity.set(1);
      sidebarTranslateX.set(0);
    }, 150);
  });
</script>

<section
  class="bg-surface-700 h-full w-full rounded-r-xl p-3"
  style="
    transform: translateX({$sidebarTranslateX}px);
    opacity: {$sidebarOpacity};
  "
>
  <div class="flex flex-col gap-3">
    <nav class="flex flex-col gap-0.5 p-2">
      <button
        on:click={() => handleNavigation('/users/users-dashboard')}
        class="font-inter font-fw-ds-400 text-fs-ds-12 leading-lh-ds-130 hover:bg-surface-500 cursor-pointer rounded-sm p-3 text-left text-neutral-50 {isOverviewActive
          ? 'bg-surface-500'
          : ''}"
      >
        Overview
      </button>

      <button
        on:click={() => handleNavigation('/users/users-overview')}
        class="font-inter font-fw-ds-400 text-fs-ds-12 leading-lh-ds-130 hover:bg-surface-500 cursor-pointer rounded-sm p-3 text-left text-neutral-50 {isUsersActive
          ? 'bg-surface-500'
          : ''}"
      >
        Users
      </button>
    </nav>
  </div>
</section>
