<script lang="ts">
  import { Link } from 'svelte-routing';
  import { onMount } from 'svelte';
  import { writable } from 'svelte/store';

  import HomeIcon from '@/assets/icons/homeIcon.svg';
  import ChartIcon from '@/assets/icons/chartIcon.svg';
  import UsersIcon from '@/assets/icons/usersIcon.svg';
  import WorkspaceIcon from '@/assets/icons/workspaceIcon.svg';

  // Create a writable store to hold the current pathname
  const currentPath = writable(window.location.pathname);

  // Update the currentPath when the component mounts
  onMount(() => {
    window.addEventListener('popstate', () => {
      currentPath.set(window.location.pathname);
    });
  });
</script>

<div class="bg-surface-300 p-1 text-white">
  <div class="flex flex-col space-y-4">
    <div class="group relative" class:active={$currentPath === '/home'}>
      <Link to="/home">
        <img src={HomeIcon} alt="Home Icon" class="rounded px-4 py-4" />
      </Link>
      <div
        class={`absolute inset-y-0 left-0 w-[2px] bg-transparent transition-all group-hover:bg-blue-500 ${$currentPath === '/workspace' ? 'bg-blue-500' : ''}`}
      ></div>
    </div>

    <div class="group relative" class:active={$currentPath === '/dashboard'}>
      <Link to="/dashboard">
        <img src={ChartIcon} alt="Chart Icon" class="rounded px-4 py-4" />
      </Link>
      <div
        class={`absolute inset-y-0 left-0 w-[2px] bg-transparent transition-all group-hover:bg-blue-500 ${$currentPath === '/workspace' ? 'bg-blue-500' : ''}`}
      ></div>
    </div>

    <div class="group relative" class:active={$currentPath === '/workspace'}>
      <Link to="/workspace">
        <img src={WorkspaceIcon} alt="Workspace Icon" class="rounded px-4 py-4" />
      </Link>
      <div
        class={`absolute inset-y-0 left-0 w-[2px] bg-transparent transition-all group-hover:bg-blue-500 ${$currentPath === '/workspace' ? 'bg-blue-500' : ''}`}
      ></div>
    </div>

    <div class="group relative" class:active={$currentPath === '/hubs'}>
      <Link to="/hubs">
        <img src={UsersIcon} alt="Users Icon" class="rounded px-4 py-4" />
      </Link>
      <div
        class={`absolute inset-y-0 left-0 w-[2px] bg-transparent transition-all group-hover:bg-blue-500 ${$currentPath === '/hubs' ? 'bg-blue-500' : ''}`}
      ></div>
    </div>
  </div>
</div>

<style>
  /* Define the active state styles */
  .active .absolute {
    background: linear-gradient(124.46deg, #11adf0 0%, #6147ff 101.37%);
  }
</style>
