<script lang="ts">
  import EditIcon from '@/assets/icons/EditIcon.svelte';
  import ManageMembersIcon from '@/assets/icons/ManageMembersIcon.svelte';
  import UpgradeStandardIcon from '@/assets/icons/UpgradeStandardIcon.svelte';
  import { navigate } from 'svelte-routing';
  interface Workspace {
    id: string;
    name: string;
    type: 'PRIVATE' | 'PUBLIC';
    description: string;
    createdAt: string;
    updatedAt: string;
  }
  interface Contributor {
    id: string;
    role: string;
    email: string;
  }
  interface Hub {
    _id: string;
    name: string;
    hubUrl: string;
    workspaceStats: {
      total: number;
      private: number;
      public: number;
    };
    workspaces: Workspace[];
    contributors: {
      total: number;
      details: Contributor[];
    };
    createdAt: string;
    updatedAt: string;
  }
  export let row;
  const launchUrl = import.meta.env.VITE_SPARROW_LAUNCH_URL;
  function handleLaunch() {
    window.open(`${launchUrl}`, '_blank');
  }
  let activeDropdownId: string | null = null;
  function toggleDropdown(hubId: string) {
    if (activeDropdownId === hubId) {
      activeDropdownId = null; // Close if already open
    } else {
      activeDropdownId = hubId; // Open this dropdown
    }
  }
  function handleManageHub(event: Hub) {
    const hub = event;
    navigate(`/hubs/settings/${hub._id}`);
  }
  function handleManageMembers(event: Hub) {
    const hub = event;
    navigate(`/hubs/members/${hub._id}`);
  }
  function handleUpgrade(event: Hub) {}
</script>

<div class="relative flex items-center justify-end gap-4">
  <button
    class="font-inter text-fs-ds-12 font-regular leading-lh-ds-130 z-10
             cursor-pointer text-blue-300 opacity-0 transition-opacity
             duration-200 group-hover:opacity-100 hover:underline"
    data-action="launch"
    on:click|stopPropagation={handleLaunch}
    data-hub-id={row.original._id}
  >
    Launch in Sparrow
  </button>

  <div class="relative">
    <button
      class="cursor-pointer rounded-md p-2 text-neutral-300 transition-colors
               duration-200 hover:text-neutral-50"
      on:click|stopPropagation={() => toggleDropdown(row.original._id)}
      data-action="toggle-menu"
      data-hub-id={row.original._id}
      aria-label="More actions"
    >
      {#if typeof row.original.renderThreeDotsIcon === 'function'}
        {@html row.original.renderThreeDotsIcon()}
      {:else}
        ⋮
      {/if}
    </button>

    {#if activeDropdownId === row.original._id}
      <div class="bg-surface-600 absolute right-0 z-50 mt-2 w-48 rounded-md shadow-lg">
        <div class="flex flex-col gap-1 py-1">
          <button
            class="text-fs-ds-14 leading-lh-ds-130 font-inter hover:bg-surface-300 flex w-full cursor-pointer flex-row items-center gap-2
                     px-2 py-1 text-neutral-50 transition-colors duration-150"
            data-action="ManageHub"
            data-hub-id={row.original._id}
            on:click|stopPropagation={() => {
              handleManageHub(row.original);
              activeDropdownId = null;
            }}
          >
            <EditIcon />
            <h2>Manage Hub</h2>
          </button>
          <button
            class="text-fs-ds-14 leading-lh-ds-130 font-inter hover:bg-surface-300 flex w-full cursor-pointer flex-row items-center gap-2 px-2
                     py-1 text-neutral-50 transition-colors duration-150"
            data-action="manage-members"
            data-hub-id={row.original._id}
            on:click|stopPropagation={() => {
              handleManageMembers(row.original);
              activeDropdownId = null;
            }}
          >
            <ManageMembersIcon />
            <h2>Manage Members</h2>
          </button>
          <button
            class="text-fs-ds-14 leading-lh-ds-130 font-inter hover:bg-surface-300 flex w-full cursor-pointer flex-row items-center gap-2 px-2
                     py-1 text-neutral-50 transition-colors duration-150"
            data-action="upgrade"
            data-hub-id={row.original._id}
            on:click|stopPropagation={() => {
              handleUpgrade(row.original);
              activeDropdownId = null;
            }}
          >
            <UpgradeStandardIcon />
            <h2>Upgrade to Standard</h2>
          </button>
        </div>
      </div>
    {/if}
  </div>
</div>
