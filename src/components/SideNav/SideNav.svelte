<script>
  import { writable, get } from 'svelte/store';
  import { onMount } from 'svelte';
  import { navigate } from 'svelte-routing';
  // icons
  import WorkspaceIcon from '@/assets/icons/WorkspaceIcon.svelte';
  import ChartIcon from '@/assets/icons/ChartIcon.svelte';
  import HomeIcon from '@/assets/icons/HomeIcon.svelte';
  import UsersIcon from '@/assets/icons/UsersIcon.svelte';
  import BillingIcon from '@/assets/icons/BillingIcon.svelte';
  import AuditIcon from '@/assets/icons/AuditIcon.svelte';
  import SecurityIcon from '@/assets/icons/SecurityIcon.svelte';
  import HostingIcon from '@/assets/icons/HostingIcon.svelte';
  import SettingsIcon from '@/assets/icons/SettingsIcon.svelte';
  import Tooltip from '../Tooltip/Tooltip.svelte';

  const currentPath = writable(window.location.pathname);
  let hoveredPath = null;
  let focusedPath = null;

  // Update currentPath on mount
  onMount(() => {
    window.addEventListener('popstate', () => {
      currentPath.set(window.location.pathname);
    });
  });

  // Function to determine if a path is active (including child paths)
  const isPathActive = (path) => {
    const current = get(currentPath);

    // Special case for home to avoid matching everything
    if (path === '/home') {
      return current === '/home';
    }

    // For all other paths, check if current path starts with this path
    return current.startsWith(path);
  };

  // Function to determine icon variant
  const getIconVariant = (path) => {
    if (isPathActive(path)) return 'selected';
    return 'default';
  };

  // Reactive top variant computations
  $: homeVariant = getIconVariant('/home');
  $: dashboardVariant = getIconVariant('/analytics');
  $: workspaceVariant = getIconVariant('/hubs');
  $: hubsVariant = getIconVariant('/users');

  // Reactive bottom variant computations
  $: billingVariant = getIconVariant('/billing');
  $: auditVariant = getIconVariant('/audit');
  $: securityVariant = getIconVariant('/security');
  $: HostingVariant = getIconVariant('/self-hosting');
  $: settingsVariant = getIconVariant('/settings');
</script>

<div
  class="bg-surface-700 border-surface-900 flex flex-col justify-between border border-r-4 p-1 text-white"
>
  <!-- top section -->
  <div class="flex flex-col items-center justify-center">
    <!-- Home Icon -->
    <Tooltip
      text="Home"
      position="right"
      mode="controlled"
      show={focusedPath === '/home' || hoveredPath === '/home'}
      size="sm"
    >
      <button
        class="group hover:bg-surface-500 relative cursor-pointer rounded focus-visible:outline-2 focus-visible:outline-blue-300"
        class:active={isPathActive('/home')}
        on:click={() => navigate('/home')}
        on:mouseenter={() => (hoveredPath = '/home')}
        on:mouseleave={() => (hoveredPath = null)}
        on:focus={() => (focusedPath = '/home')}
        on:blur={() => (focusedPath = null)}
      >
        <div class="rounded px-4 py-4">
          <HomeIcon
            variant={hoveredPath === '/home' && !isPathActive('/home') ? 'hover' : homeVariant}
          />
        </div>
        <div
          class={`absolute inset-y-1 left-0 w-[2px] rounded transition-all ${isPathActive('/home') ? 'bg-blue-500' : ''}`}
        ></div>
      </button>
    </Tooltip>
    <!-- Dashboard Icon -->
    <Tooltip
      text="Analytics"
      position="right"
      mode="controlled"
      show={focusedPath === '/analytics' || hoveredPath === '/analytics'}
      size="sm"
    >
      <button
        class="group hover:bg-surface-500 relative cursor-pointer rounded focus-visible:outline-2 focus-visible:outline-blue-300"
        class:active={isPathActive('/analytics')}
        on:click={() => navigate('/analytics')}
        on:mouseenter={() => (hoveredPath = '/analytics')}
        on:mouseleave={() => (hoveredPath = null)}
        on:focus={() => (focusedPath = '/analytics')}
        on:blur={() => (focusedPath = null)}
      >
        <div class="rounded px-4 py-4">
          <ChartIcon
            variant={hoveredPath === '/analytics' && !isPathActive('/analytics')
              ? 'hover'
              : dashboardVariant}
          />
        </div>
        <div
          class={`absolute inset-y-1 left-0 w-[2px] rounded transition-all ${isPathActive('/analytics') ? 'bg-blue-500' : ''}`}
        ></div>
      </button>
    </Tooltip>
    <!-- Hubs Icon -->
    <Tooltip
      text="Hubs"
      position="right"
      mode="controlled"
      show={focusedPath === '/hubs' || hoveredPath === '/hubs'}
      size="sm"
    >
      <button
        class="group hover:bg-surface-500 relative cursor-pointer rounded focus-visible:outline-2 focus-visible:outline-blue-300"
        class:active={isPathActive('/hubs')}
        on:click={() => navigate('/hubs')}
        on:mouseenter={() => (hoveredPath = '/hubs')}
        on:mouseleave={() => (hoveredPath = null)}
        on:focus={() => (focusedPath = '/hubs')}
        on:blur={() => (focusedPath = null)}
      >
        <div class="rounded px-4 py-4">
          <WorkspaceIcon
            variant={hoveredPath === '/hubs' && !isPathActive('/hubs') ? 'hover' : workspaceVariant}
          />
        </div>
        <div
          class={`absolute inset-y-1 left-0 w-[2px] rounded transition-all ${isPathActive('/hubs') ? 'bg-blue-500' : ''}`}
        ></div>
      </button>
    </Tooltip>

    <!-- Users Icon -->
    <Tooltip
      text="Users"
      position="right"
      mode="controlled"
      show={focusedPath === '/users' || hoveredPath === '/users'}
      size="sm"
    >
      <button
        class="group hover:bg-surface-500 relative cursor-pointer rounded focus-visible:outline-2 focus-visible:outline-blue-300"
        class:active={isPathActive('/users')}
        on:click={() => navigate('/users')}
        on:mouseenter={() => (hoveredPath = '/users')}
        on:mouseleave={() => (hoveredPath = null)}
        on:focus={() => (focusedPath = '/users')}
        on:blur={() => (focusedPath = null)}
      >
        <div class="px-4 py-4">
          <UsersIcon
            variant={hoveredPath === '/users' && !isPathActive('/users') ? 'hover' : hubsVariant}
          />
        </div>
        <div
          class={`absolute inset-y-1 left-0 w-[2px] rounded transition-all ${isPathActive('/users') ? 'bg-blue-500' : ''}`}
        ></div>
      </button>
    </Tooltip>
  </div>

  <!-- bottom section -->
  <div class="flex flex-col items-center justify-center">
    <!-- Billing Icon -->
    <Tooltip
      text="Billing"
      position="right"
      mode="controlled"
      show={focusedPath === '/billing' || hoveredPath === '/billing'}
      size="sm"
    >
      <button
        class="group hover:bg-surface-500 relative cursor-pointer rounded focus-visible:outline-2 focus-visible:outline-blue-300"
        class:active={isPathActive('/billing')}
        on:click={() => navigate('/billing')}
        on:mouseenter={() => (hoveredPath = '/billing')}
        on:mouseleave={() => (hoveredPath = null)}
        on:focus={() => (focusedPath = '/billing')}
        on:blur={() => (focusedPath = null)}
      >
        <div class="rounded px-4 py-4">
          <BillingIcon
            variant={hoveredPath === '/billing' && !isPathActive('/billing')
              ? 'hover'
              : billingVariant}
          />
        </div>
        <div
          class={`absolute inset-y-1 left-0 w-[2px] rounded transition-all ${isPathActive('/billing') ? 'bg-blue-500' : ''}`}
        ></div>
      </button>
    </Tooltip>
    <!-- Audit Icon -->
    <Tooltip
      text="Audit Logs"
      position="right"
      mode="controlled"
      show={focusedPath === '/audit' || hoveredPath === '/audit'}
      size="sm"
    >
      <button
        class="group hover:bg-surface-500 relative cursor-pointer rounded focus-visible:outline-2 focus-visible:outline-blue-300"
        class:active={isPathActive('/audit')}
        on:click={() => navigate('/audit')}
        on:mouseenter={() => (hoveredPath = '/audit')}
        on:mouseleave={() => (hoveredPath = null)}
        on:focus={() => (focusedPath = '/audit')}
        on:blur={() => (focusedPath = null)}
      >
        <div class="rounded px-4 py-4">
          <AuditIcon
            variant={hoveredPath === '/audit' && !isPathActive('/audit') ? 'hover' : auditVariant}
          />
        </div>
        <div
          class={`absolute inset-y-1 left-0 w-[2px] rounded transition-all ${isPathActive('/audit') ? 'bg-blue-500' : ''}`}
        ></div>
      </button>
    </Tooltip>
    <!-- Security Icon -->
    <Tooltip
      text="Security"
      position="right"
      mode="controlled"
      show={focusedPath === '/security' || hoveredPath === '/security'}
      size="sm"
    >
      <button
        class="group hover:bg-surface-500 relative cursor-pointer rounded focus-visible:outline-2 focus-visible:outline-blue-300"
        class:active={isPathActive('/security')}
        on:click={() => navigate('/security')}
        on:mouseenter={() => (hoveredPath = '/security')}
        on:mouseleave={() => (hoveredPath = null)}
        on:focus={() => (focusedPath = '/security')}
        on:blur={() => (focusedPath = null)}
      >
        <div class="rounded px-4 py-4">
          <SecurityIcon
            variant={hoveredPath === '/security' && !isPathActive('/security')
              ? 'hover'
              : securityVariant}
          />
        </div>
        <div
          class={`absolute inset-y-1 left-0 w-[2px] rounded transition-all ${isPathActive('/security') ? 'bg-blue-500' : ''}`}
        ></div>
      </button>
    </Tooltip>
    <!-- Hosting Icon -->
    <Tooltip
      text="Self Hosting"
      position="right"
      mode="controlled"
      show={focusedPath === '/self-hosting' || hoveredPath === '/self-hosting'}
      size="sm"
    >
      <button
        class="group hover:bg-surface-500 relative cursor-pointer rounded focus-visible:outline-2 focus-visible:outline-blue-300"
        class:active={isPathActive('/self-hosting')}
        on:click={() => navigate('/self-hosting')}
        on:mouseenter={() => (hoveredPath = '/self-hosting')}
        on:mouseleave={() => (hoveredPath = null)}
        on:focus={() => (focusedPath = '/self-hosting')}
        on:blur={() => (focusedPath = null)}
      >
        <div class="px-4 py-4">
          <HostingIcon
            variant={hoveredPath === '/self-hosting' && !isPathActive('/self-hosting')
              ? 'hover'
              : HostingVariant}
          />
        </div>
        <div
          class={`absolute inset-y-1 left-0 w-[2px] rounded transition-all ${isPathActive('/self-hosting') ? 'bg-blue-500' : ''}`}
        ></div>
      </button>
    </Tooltip>
    <!-- Settings Icon -->
    <Tooltip
      text="Settings"
      position="right"
      mode="controlled"
      show={focusedPath === '/settings' || hoveredPath === '/settings'}
      size="sm"
    >
      <button
        class="group hover:bg-surface-500 relative cursor-pointer rounded focus-visible:outline-2 focus-visible:outline-blue-300"
        class:active={isPathActive('/settings')}
        on:click={() => navigate('/settings')}
        on:mouseenter={() => (hoveredPath = '/settings')}
        on:mouseleave={() => (hoveredPath = null)}
        on:focus={() => (focusedPath = '/settings')}
        on:blur={() => (focusedPath = null)}
      >
        <div class="px-4 py-4">
          <SettingsIcon
            variant={hoveredPath === '/settings' && !isPathActive('/settings')
              ? 'hover'
              : settingsVariant}
          />
        </div>
        <div
          class={`absolute inset-y-1 left-0 w-[2px] rounded transition-all ${isPathActive('/settings') ? 'bg-blue-500' : ''}`}
        ></div>
      </button>
    </Tooltip>
  </div>
</div>
