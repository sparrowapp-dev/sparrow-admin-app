<script>
  import { writable, get } from 'svelte/store';
  import WorkspaceIcon from '@/assets/icons/WorkspaceIcon.svelte';
  import ChartIcon from '@/assets/icons/ChartIcon.svelte';
  import HomeIcon from '@/assets/icons/HomeIcon.svelte';
  import UsersIcon from '@/assets/icons/UsersIcon.svelte';
  import { onMount } from 'svelte';
  import { navigate } from 'svelte-routing';
  import BillingIcon from '@/assets/icons/BillingIcon.svelte';
  import AuditIcon from '@/assets/icons/AuditIcon.svelte';
  import SecurityIcon from '@/assets/icons/SecurityIcon.svelte';
  import HostingIcon from '@/assets/icons/HostingIcon.svelte';
  import SettingsIcon from '@/assets/icons/SettingsIcon.svelte';

  const currentPath = writable(window.location.pathname);
  let hoveredPath = null;

  // Update currentPath on mount
  onMount(() => {
    window.addEventListener('popstate', () => {
      currentPath.set(window.location.pathname);
    });
  });

  // Function to determine icon variant
  const getIconVariant = (path) => {
    const current = get(currentPath);
    if (current === path) return 'selected';
    return 'default';
  };

  // Reactive variant computations
  $: homeVariant = getIconVariant('/home');
  $: dashboardVariant = getIconVariant('/dashboard');
  $: workspaceVariant = getIconVariant('/workspace');
  $: hubsVariant = getIconVariant('/hubs');

  // Reactive variant computations
  $: billingVariant = getIconVariant('/billing');
  $: auditVariant = getIconVariant('/audit');
  $: securityVariant = getIconVariant('/security');
  $: HostingVariant = getIconVariant('/self-hosting');
  $: settingsVariant = getIconVariant('/settings');
</script>

<div class="bg-surface-300 flex flex-col justify-between p-1 text-white">
  <!-- top section -->
  <div class="flex flex-col space-y-0">
    <!-- Home Icon -->

    <button
      class="group hover:bg-surface-500 relative cursor-pointer rounded focus-visible:outline-2 focus-visible:outline-blue-300"
      class:active={$currentPath === '/home'}
      on:click={() => navigate('/home')}
      on:mouseenter={() => (hoveredPath = '/home')}
      on:mouseleave={() => (hoveredPath = null)}
    >
      <div class="rounded px-4 py-4">
        <HomeIcon
          variant={hoveredPath === '/home' && $currentPath !== '/home' ? 'hover' : homeVariant}
        />
      </div>
      <div
        class={`absolute inset-y-1 left-0 w-[2px] rounded  transition-all  ${$currentPath === '/home' ? 'bg-blue-500' : ''}`}
      ></div>
    </button>

    <!-- Dashboard Icon -->

    <button
      class="group hover:bg-surface-500 relative cursor-pointer rounded focus-visible:outline-2 focus-visible:outline-blue-300"
      class:active={$currentPath === '/dashboard'}
      on:click={() => navigate('/dashboard')}
      on:mouseenter={() => (hoveredPath = '/dashboard')}
      on:mouseleave={() => (hoveredPath = null)}
    >
      <div class="rounded px-4 py-4">
        <ChartIcon
          variant={hoveredPath === '/dashboard' && $currentPath !== '/dashboard'
            ? 'hover'
            : dashboardVariant}
        />
      </div>
      <div
        class={`absolute inset-y-1 left-0 w-[2px] rounded  transition-all  ${$currentPath === '/dashboard' ? 'bg-blue-500' : ''}`}
      ></div>
    </button>

    <!-- Workspace Icon -->

    <button
      class="group hover:bg-surface-500 relative cursor-pointer rounded focus-visible:outline-2 focus-visible:outline-blue-300"
      class:active={$currentPath === '/workspace'}
      on:click={() => navigate('/workspace')}
      on:mouseenter={() => (hoveredPath = '/workspace')}
      on:mouseleave={() => (hoveredPath = null)}
    >
      <div class="rounded px-4 py-4">
        <WorkspaceIcon
          variant={hoveredPath === '/workspace' && $currentPath !== '/workspace'
            ? 'hover'
            : workspaceVariant}
        />
      </div>
      <div
        class={`absolute inset-y-1 left-0 w-[2px] rounded  transition-all  ${$currentPath === '/workspace' ? 'bg-blue-500' : ''}`}
      ></div>
    </button>

    <!-- Hubs Icon -->

    <button
      class="group hover:bg-surface-500 relative cursor-pointer rounded focus-visible:outline-2 focus-visible:outline-blue-300"
      class:active={$currentPath === '/hubs'}
      on:click={() => navigate('/hubs')}
      on:mouseenter={() => (hoveredPath = '/hubs')}
      on:mouseleave={() => (hoveredPath = null)}
    >
      <div class=" px-4 py-4">
        <UsersIcon
          variant={hoveredPath === '/hubs' && $currentPath !== '/hubs' ? 'hover' : hubsVariant}
        />
      </div>
      <div
        class={`absolute inset-y-1 left-0 w-[2px] rounded  transition-all  ${$currentPath === '/hubs' ? 'bg-blue-500' : ''}`}
      ></div>
    </button>
  </div>

  <!-- bottom section -->
  <div class="flex flex-col space-y-0">
    <!-- Billing Icon -->

    <button
      class="group hover:bg-surface-500 relative cursor-pointer rounded focus-visible:outline-2 focus-visible:outline-blue-300"
      class:active={$currentPath === '/billing'}
      on:click={() => navigate('/billing')}
      on:mouseenter={() => (hoveredPath = '/billing')}
      on:mouseleave={() => (hoveredPath = null)}
    >
      <div class="rounded px-4 py-4">
        <BillingIcon
          variant={hoveredPath === '/billing' && $currentPath !== '/billing'
            ? 'hover'
            : billingVariant}
        />
      </div>
      <div
        class={`absolute inset-y-1 left-0 w-[2px] rounded  transition-all  ${$currentPath === '/billing' ? 'bg-blue-500' : ''}`}
      ></div>
    </button>

    <!-- Audit Icon -->

    <button
      class="group hover:bg-surface-500 relative cursor-pointer rounded focus-visible:outline-2 focus-visible:outline-blue-300"
      class:active={$currentPath === '/audit'}
      on:click={() => navigate('/audit')}
      on:mouseenter={() => (hoveredPath = '/audit')}
      on:mouseleave={() => (hoveredPath = null)}
    >
      <div class="rounded px-4 py-4">
        <AuditIcon
          variant={hoveredPath === '/audit' && $currentPath !== '/audit' ? 'hover' : auditVariant}
        />
      </div>
      <div
        class={`absolute inset-y-1 left-0 w-[2px] rounded  transition-all  ${$currentPath === '/audit' ? 'bg-blue-500' : ''}`}
      ></div>
    </button>

    <!-- Security Icon -->

    <button
      class="group hover:bg-surface-500 relative cursor-pointer rounded focus-visible:outline-2 focus-visible:outline-blue-300"
      class:active={$currentPath === '/security'}
      on:click={() => navigate('/security')}
      on:mouseenter={() => (hoveredPath = '/security')}
      on:mouseleave={() => (hoveredPath = null)}
    >
      <div class="rounded px-4 py-4">
        <SecurityIcon
          variant={hoveredPath === '/security' && $currentPath !== '/security'
            ? 'hover'
            : securityVariant}
        />
      </div>
      <div
        class={`absolute inset-y-1 left-0 w-[2px] rounded  transition-all  ${$currentPath === '/security' ? 'bg-blue-500' : ''}`}
      ></div>
    </button>

    <!-- Hosting Icon -->

    <button
      class="group hover:bg-surface-500 relative cursor-pointer rounded focus-visible:outline-2 focus-visible:outline-blue-300"
      class:active={$currentPath === '/self-hosting'}
      on:click={() => navigate('/self-hosting')}
      on:mouseenter={() => (hoveredPath = '/self-hosting')}
      on:mouseleave={() => (hoveredPath = null)}
    >
      <div class=" px-4 py-4">
        <HostingIcon
          variant={hoveredPath === '/self-hosting' && $currentPath !== '/self-hosting'
            ? 'hover'
            : HostingVariant}
        />
      </div>
      <div
        class={`absolute inset-y-1 left-0 w-[2px] rounded  transition-all  ${$currentPath === '/self-hosting' ? 'bg-blue-500' : ''}`}
      ></div>
    </button>

    <!-- Settings Icon -->

    <button
      class="group hover:bg-surface-500 relative cursor-pointer rounded focus-visible:outline-2 focus-visible:outline-blue-300"
      class:active={$currentPath === '/settings'}
      on:click={() => navigate('/settings')}
      on:mouseenter={() => (hoveredPath = '/settings')}
      on:mouseleave={() => (hoveredPath = null)}
    >
      <div class=" px-4 py-4">
        <SettingsIcon
          variant={hoveredPath === '/settings' && $currentPath !== '/settings'
            ? 'hover'
            : settingsVariant}
        />
      </div>
      <div
        class={`absolute inset-y-1 left-0 w-[2px] rounded  transition-all  ${$currentPath === '/settings' ? 'bg-blue-500' : ''}`}
      ></div>
    </button>
  </div>
</div>
