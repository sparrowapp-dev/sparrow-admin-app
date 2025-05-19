<script lang="ts">
  import { Link, navigate, useLocation } from 'svelte-routing';
  import { onMount } from 'svelte';

  // Get current path using the useLocation hook
  const location = useLocation();

  // Reactive variables for active states
  $: isOverviewActive = $location.pathname === '/users/overview' || $location.pathname === '/users';
  $: isUsersActive = $location.pathname === '/users/users-overview';

  // Function to handle navigation with active state updates
  function handleNavigation(path) {
    navigate(path);
  }

  // Redirect to overview if on the base /users path
  onMount(() => {
    if ($location.pathname === '/users') {
      navigate('/users/overview', { replace: true });
    }
  });
</script>

<section class="bg-surface-700 h-full w-full rounded-r-xl p-3">
  <div class="flex flex-col gap-3">
    <nav class="flex flex-col gap-0.5 p-2">
      <button
        on:click={() => handleNavigation('/users/overview')}
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
