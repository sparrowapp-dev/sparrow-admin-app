<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { useLocation } from 'svelte-routing';
  import { derived } from 'svelte/store';
  import TableSearch from '@/components/TableSearch/TableSearch.svelte';
  import TableV2 from '@/components/Table/TableV2.svelte';
  import TablePagination from '@/components/TablePagination/TablePagination.svelte';
  import Button from '@/ui/Button/Button.svelte';
  import ManageMembersIcon from '@/assets/icons/ManageMembersIcon.svelte';
  import { createQuery } from '@/services/api.common';
  import { hubsService } from '@/services/hubs.service';
  import { getRelativeTime } from '@/utils/TimeFunction';
  import Modal from '@/components/Modal/Modal.svelte';
  import InviteCollaborators from '@/components/InviteCollaborators/InviteCollaborators.svelte';
  import Breadcrumbs from '@/components/Breadcrumbs/Breadcrumbs.svelte';
  import MembersDropdown from '@/components/TableComponents/MembersDropdown.svelte';
  import InviteDropdown from '@/components/TableComponents/InviteDropdown.svelte';

  // State management
  let activeTab = 'members'; // 'members' or 'invites'
  let showModal = false;
  let params: string | undefined;
  let unsubscribe;
  let breadcrumbItems;
  // Pagination and filtering
  let membersPagination = { pageIndex: 0, pageSize: 10 };
  let membersFilters = { searchTerm: '' };

  let invitesPagination = { pageIndex: 0, pageSize: 10 };
  let invitesFilters = { searchTerm: '' };

  // Column definitions for Members tab
  const membersColumns = [
    {
      accessorKey: 'name',
      header: 'Users',
      enableSorting: false,
    },
    {
      accessorKey: 'email',
      header: 'Email',
      enableSorting: false,
    },
    {
      accessorKey: 'role',
      header: 'Roles',
      enableSorting: false,
    },
    {
      accessorKey: 'workspaceAccess',
      header: 'Workspace access',
      enableSorting: false,
      cell: ({ getValue }) => `${getValue()}`,
    },
    {
      accessorKey: 'lastActive',
      header: 'Last Active',
      enableSorting: false,
      cell: ({ getValue }) => {
        const date = getValue();
        const relativeTime = getRelativeTime(date);
        return `<span class="text-neutral-50" title="${new Date(date).toLocaleString()}">
            ${relativeTime}
          </span>`;
      },
    },
    {
      id: 'actions',
      header: '',
      enableSorting: false,
      cell: ({ row }) => ({
        Component: MembersDropdown,
        props: { row: row },
      }),
    },
  ];

  // Column definitions for Invites tab
  const invitesColumns = [
    {
      accessorKey: 'email',
      header: 'Email',
      enableSorting: false,
    },
    {
      accessorKey: 'role',
      header: 'Roles',
      enableSorting: false,
    },
    {
      accessorKey: 'lastInvited',
      header: 'Last Invited',
      enableSorting: false,
      cell: ({ getValue }) => {
        const date = getValue();
        const relativeTime = getRelativeTime(date);
        return `<span class="text-neutral-50" title="${new Date(date).toLocaleString()}">
            ${relativeTime}
          </span>`;
      },
    },
    {
      id: 'actions',
      header: '',
      enableSorting: false,
      cell: ({ row }) => ({
        Component: InviteDropdown,
        props: { row: row },
      }),
    },
  ];

  // Extract hub ID from URL
  const location = useLocation();
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

  // Members query
  const {
    data: membersData,
    isFetching: isMembersFetching,
    refetch: refetchMembers,
  } = createQuery(async () => {
    if (!params) return { data: { members: [], totalCount: 0, hubName: '' } };

    const queryParams = {
      hubId: params,
      page: membersPagination.pageIndex + 1,
      limit: membersPagination.pageSize,
      search: membersFilters.searchTerm,
    };

    return hubsService.getHubMembers(queryParams);
  });

  // Invites query
  const {
    data: invitesData,
    isFetching: isInvitesFetching,
    refetch: refetchInvites,
  } = createQuery(async () => {
    if (!params) return { data: { invites: [], totalCount: 0 } };

    const queryParams = {
      hubId: params,
      page: invitesPagination.pageIndex + 1,
      limit: invitesPagination.pageSize,
      search: invitesFilters.searchTerm,
    };

    return hubsService.getHubInvites(queryParams);
  });

  // refetch data when params change
  $: if (params) {
    refetchMembers();
    refetchInvites();
  }

  // Switch tabs
  function setActiveTab(tab) {
    activeTab = tab;
  }

  // Search handlers
  function handleMembersSearch(event) {
    membersFilters = { ...membersFilters, searchTerm: event.detail };
    membersPagination = { ...membersPagination, pageIndex: 0 };
    refetchMembers();
  }

  function handleInvitesSearch(event) {
    invitesFilters = { ...invitesFilters, searchTerm: event.detail };
    invitesPagination = { ...invitesPagination, pageIndex: 0 };
    refetchInvites();
  }

  // Pagination handlers
  function handleMembersPageChange(event) {
    membersPagination = { ...membersPagination, pageIndex: event.detail };
    refetchMembers();
  }

  function handleMembersPageSizeChange(event) {
    membersPagination = { pageSize: event.detail, pageIndex: 0 };
    refetchMembers();
  }

  function handleInvitesPageChange(event) {
    invitesPagination = { ...invitesPagination, pageIndex: event.detail };
    refetchInvites();
  }

  function handleInvitesPageSizeChange(event) {
    invitesPagination = { pageSize: event.detail, pageIndex: 0 };
    refetchInvites();
  }

  // Handle invite complete
  function handleInviteComplete() {
    showModal = false;
    refetchInvites();
  }

  // Reactive data processing
  $: members = $membersData?.data?.members || [];
  $: membersTotalCount = $membersData?.data?.totalCount || 0;
  $: invites = $invitesData?.data?.invites || [];
  $: invitesTotalCount = $invitesData?.data?.totalCount || 0;
  $: hubName = $membersData?.data?.hubName || '';
  $: membersCount = $membersData?.data?.totalCount || 0;
  $: invitesCount = $invitesData?.data?.totalCount || 0;

  $: breadcrumbItems = [
    { label: 'Hubs', path: '/hubs' },
    { label: hubName, path: `/hubs/workspace/${params}` },
    { label: 'Members', path: `/hubs/members/${params}` },
  ];
</script>

<section class="w-full">
  <Breadcrumbs items={breadcrumbItems} />
  <h1 class="font-inter text-fs-ds-28 font-fw-ds-500 py-4 text-neutral-50">
    {hubName}
  </h1>

  <!-- Tab Navigation -->
  <div class="flex">
    <button
      class="font-inter text-fs-ds-12 bord font-fw-ds-400 relative flex cursor-pointer items-center border-blue-400 px-2 py-2.5 text-neutral-50 {activeTab ===
      'members'
        ? 'border-b-2'
        : 'border-b-2 border-transparent'}"
      on:click={() => setActiveTab('members')}
    >
      Members
      <span class="bg-surface-300 ml-2 rounded-full px-2 py-0.5 text-xs">{membersCount}</span>
    </button>
    <button
      class="font-inter text-fs-ds-12 font-fw-ds-400 relative flex cursor-pointer items-center border-blue-400 px-2 py-2.5 text-neutral-50 {activeTab ===
      'invites'
        ? 'border-b-2'
        : 'border-b-2 border-transparent'}"
      on:click={() => setActiveTab('invites')}
    >
      Manage Invites
      <span class="bg-surface-300 ml-2 rounded-full px-2 py-0.5 text-xs">{invitesCount}</span>
    </button>
  </div>

  <!-- Members Tab Content -->
  {#if activeTab === 'members'}
    <div class="bg-surface-900">
      <div class="flex items-center justify-between py-6">
        <TableSearch
          value={membersFilters.searchTerm}
          on:search={handleMembersSearch}
          isLoading={$isMembersFetching}
          placeholder="Search user in {hubName}"
          width="max-w-[300px]"
        />

        <Button
          variant="filled-primary"
          size="small"
          iconLeft={true}
          on:click={() => (showModal = true)}
        >
          <svelte:fragment slot="iconLeft">
            <ManageMembersIcon />
          </svelte:fragment>
          Invite Collaborators
        </Button>
      </div>

      {#if membersTotalCount === 0 && !$isMembersFetching}
        <div class="flex flex-col items-center justify-center py-16">
          <p class="text-fs-ds-14 font-fw-ds-300 text-neutral-400">No members found.</p>
        </div>
      {:else}
        <TableV2
          columns={membersColumns}
          data={members}
          isLoading={$isMembersFetching}
          pageIndex={membersPagination.pageIndex}
          pageSize={membersPagination.pageSize}
          totalItems={membersTotalCount}
        />

        <TablePagination
          pageIndex={membersPagination.pageIndex}
          pageSize={membersPagination.pageSize}
          totalItems={membersTotalCount}
          isLoading={$isMembersFetching}
          on:pageChange={handleMembersPageChange}
          on:pageSizeChange={handleMembersPageSizeChange}
        />
      {/if}
    </div>
  {/if}

  <!-- Invites Tab Content -->
  {#if activeTab === 'invites'}
    <div class="bg-surface-900">
      <div class="flex items-center justify-between py-6">
        <TableSearch
          value={invitesFilters.searchTerm}
          on:search={handleInvitesSearch}
          isLoading={$isInvitesFetching}
          placeholder="Search invites by email"
          width="max-w-[300px]"
        />

        <Button
          variant="filled-primary"
          size="small"
          iconLeft={true}
          on:click={() => (showModal = true)}
        >
          <svelte:fragment slot="iconLeft">
            <ManageMembersIcon />
          </svelte:fragment>
          Invite Collaborators
        </Button>
      </div>

      {#if invitesTotalCount === 0 && !$isInvitesFetching}
        <div class="flex flex-col items-center justify-center py-16">
          <p class="text-fs-ds-14 font-fw-ds-300 text-neutral-400">No pending invites.</p>
        </div>
      {:else}
        <TableV2
          columns={invitesColumns}
          data={invites}
          isLoading={$isInvitesFetching}
          pageIndex={invitesPagination.pageIndex}
          pageSize={invitesPagination.pageSize}
          totalItems={invitesTotalCount}
        />

        <TablePagination
          pageIndex={invitesPagination.pageIndex}
          pageSize={invitesPagination.pageSize}
          totalItems={invitesTotalCount}
          isLoading={$isInvitesFetching}
          on:pageChange={handleInvitesPageChange}
          on:pageSizeChange={handleInvitesPageSizeChange}
        />
      {/if}
    </div>
  {/if}

  <!-- Invite Modal -->
  {#if showModal}
    <Modal on:close={() => (showModal = false)}>
      <InviteCollaborators
        onClose={() => (showModal = false)}
        hubId={params}
        {hubName}
        onSuccess={handleInviteComplete}
      />
    </Modal>
  {/if}
</section>
