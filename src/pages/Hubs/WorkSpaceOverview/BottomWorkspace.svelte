<script lang="ts">
  // ─── COMPONENTS ──────────────────────────────────────
  import ResourceIcons from '@/assets/icons/ResourceIcons.svelte';

  import TableV2 from '@/components/Table/TableV2.svelte';
  import TablePagination from '@/components/TablePagination/TablePagination.svelte';
  import TableSearch from '@/components/TableSearch/TableSearch.svelte';
  import HubsDropdown from '@/components/TableComponents/HubsDropdown.svelte';
  import RolesDropdown from '../../../components/RolesDropdown/RolesDropdown.svelte';
  import DropdownNoSearch from '@/components/DropdownNoSearch/DropdownNoSearch.svelte';
  import Button from '@/ui/Button/Button.svelte';

  // ─── UTILITIES ───────────────────────────────────────
  import { getRelativeTime } from '@/utils/TimeFunction';

  // ─── ROUTING & SVELTE CORE ───────────────────────────
  import { onMount, onDestroy } from 'svelte';
  import { derived } from 'svelte/store';
  import { useLocation } from 'svelte-routing';

  // ─── DATA ────────────────────────────────────────────
  import type { CellContext, SortingState } from '@tanstack/svelte-table';
  import { hubsService } from '@/services/hubs.service';
  import { notification } from '@/components/Toast';

  // ─── PROPS ───────────────────────────────────────────
  export let data;
  export let onRefresh: (args: {
    tab: 'resources' | 'members';
    pagination: typeof pagination;
    filters: typeof filters;
    sorting: SortingState;
    resourceType: string;
  }) => void;
  export let isLoading: boolean = false;
  export let overviewRefetch;

  // ─── ROUTE PARAM ─────────────────────────────────────
  const location = useLocation();
  export let params: string | undefined;
  let unsubscribe: (() => void) | undefined;

  const extractedParam = derived(location, ($location) => {
    const match = $location.pathname.match(/\/hubs\/(?:workspace|settings|members)\/([^\/]+)/);
    return match?.[1];
  });

  onMount(() => {
    unsubscribe = extractedParam.subscribe((id) => {
      if (id && id !== params) {
        params = id;
      }
    });
  });

  onDestroy(() => {
    unsubscribe?.();
  });

  // ─── STATE ───────────────────────────────────────────
  let selectedTab: 'resources' | 'members' = 'resources';
  let showModal = false;

  let pagination = { pageIndex: 0, pageSize: 10 };
  let filters = { searchTerm: '' };
  let sorting: SortingState = [];

  const options = [
    { value: 'collections', label: 'Collections' },
    { value: 'testflows', label: 'Test Flows' },
    { value: 'environments', label: 'Environments' },
    { value: 'all', label: 'All Resources' },
  ];

  let selected = { value: '', label: 'All Workspaces' };

  // ─── DATA REFETCH TRIGGER ────────────────────────────
  function triggerRefresh() {
    onRefresh({
      tab: selectedTab,
      pagination,
      filters,
      sorting,
      resourceType: selected.value,
    });
  }

  // ─── REACTIVE UPDATES ────────────────────────────────
  $: if (params) {
    triggerRefresh();
  }

  $: if (selectedTab) {
    pagination.pageIndex = 0;
    triggerRefresh();
  }
  let selectedRoles: Record<string, string> = {};

  $: totalItems = data?.totalCount || 0;

  $: processedData =
    selectedTab === 'resources'
      ? {
          workspaces: data?.resources || [],
        }
      : {
          teamName: 'Members',
          workspaces: data?.users || [],
        };

  $: columns =
    selectedTab === 'resources'
      ? [
          {
            accessorKey: 'resourceType',
            header: 'Resources',
            enableSorting: true,
          },
          {
            accessorKey: 'name',
            header: 'Name',
          },
          {
            accessorKey: 'keyStats',
            header: 'Key Stats',
          },
          {
            accessorKey: 'updatedAt',
            header: 'Last Updated',
            enableSorting: true,
            cell: ({ getValue }) => {
              const date = getValue();
              const relativeTime = getRelativeTime(date);
              return `<span class="text-neutral-50" title="${new Date(date).toLocaleString()}">${relativeTime}</span>`;
            },
          },
          {
            accessorKey: 'createdBy',
            header: 'Created by',
          },
        ]
      : [
          {
            accessorKey: 'user',
            header: 'Users',
          },
          {
            accessorKey: 'email',
            header: 'Email',
          },
          {
            accessorKey: 'role',
            header: 'Roles',
            cell: ({ row }: CellContext<any, any>) => {
              const userId = row.original._id;
              const role = selectedRoles[userId] || row.original.role;
              const isAdmin = role === 'admin';

              const roleOptions = [
                { value: 'editor', label: 'Editor' },
                { value: 'viewer', label: 'Viewer' },
              ];

              const selectedOption = roleOptions.find((opt) => opt.value === role) || {
                value: 'admin',
                label: 'Admin',
              };

              return {
                Component: RolesDropdown,
                props: {
                  selected: selectedOption,
                  options: roleOptions,
                  disabled: isAdmin,
                  onChange: async (newRole: string) => {
                    const previousRole = selectedRoles[userId];

                    selectedRoles = {
                      ...selectedRoles,
                      [userId]: newRole,
                    };

                    try {
                      await hubsService.changeRoles({
                        params: { workspaceId: params, userId },
                        data: { role: newRole },
                      });

                      overviewRefetch();
                      notification.success(`Role changed to ${newRole}`);
                    } catch (error) {
                      selectedRoles = {
                        ...selectedRoles,
                        [userId]: previousRole,
                      };
                      notification.error('Failed to change role. Please try again.');
                    }
                  },
                },
              };
            },
          },
        ];

  // ─── EVENT HANDLERS ──────────────────────────────────
  function handleTabChange(tab: 'resources' | 'members') {
    selectedTab = tab;
  }

  function handleSortingChange(event: CustomEvent<SortingState>) {
    sorting = event.detail;
    triggerRefresh();
  }

  function handleSearchChange(event: CustomEvent<string>) {
    filters.searchTerm = event.detail;
    pagination.pageIndex = 0;
    triggerRefresh();
  }

  function handlePageChange(event: CustomEvent<number>) {
    pagination.pageIndex = event.detail;
    triggerRefresh();
  }

  function handlePageSizeChange(event: CustomEvent<number>) {
    pagination = { pageSize: event.detail, pageIndex: 0 };
    triggerRefresh();
  }

  function handleSelect(event: CustomEvent<{ value: string; label: string }>) {
    selected = event.detail;
    triggerRefresh();
  }
</script>

<div class="flex flex-col gap-6">
  <div class="flex gap-2">
    <button
      class={`text-fs-ds-12 leading-lh-ds-130 font-fw-ds-400 font-inter cursor-pointer border-b-2 pb-1
          ${selectedTab === 'resources' ? 'border-blue-500 text-neutral-50' : 'border-transparent text-neutral-100'}`}
      on:click={() => (selectedTab = 'resources')}
    >
      Resources
    </button>

    <button
      class={`text-fs-ds-12 leading-lh-ds-130 font-fw-ds-400 font-inter cursor-pointer border-b-2 pb-1
          ${selectedTab === 'members' ? 'border-blue-500 text-neutral-50' : 'border-transparent text-neutral-100'}`}
      on:click={() => (selectedTab = 'members')}
    >
      Members
    </button>
  </div>
  <div class="bg-surface-900">
    <div class="flex items-center gap-3 py-6">
      <TableSearch
        value={filters.searchTerm}
        on:search={handleSearchChange}
        {isLoading}
        placeholder="Search Workspace"
      />{#if selectedTab === 'resources'}
        <DropdownNoSearch
          {options}
          bind:selected
          placeholder="Select option"
          leftIcon={ResourceIcons}
          variant="primary"
          width="w-48"
          on:select={handleSelect}
        />
      {/if}
    </div>

    <TableV2
      {columns}
      data={processedData.workspaces}
      {isLoading}
      pageIndex={pagination.pageIndex}
      pageSize={pagination.pageSize}
      {totalItems}
      on:sortingChange={handleSortingChange}
      on:rowClick={(e) => console.log('Row clicked:', e.detail)}
    />

    <TablePagination
      pageIndex={pagination.pageIndex}
      pageSize={pagination.pageSize}
      {totalItems}
      {isLoading}
      on:pageChange={handlePageChange}
      on:pageSizeChange={handlePageSizeChange}
    />
  </div>
</div>
