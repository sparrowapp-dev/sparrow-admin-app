<script lang="ts">
  import AllHubsIcon from '@/assets/icons/AllHubsIcon.svelte';
  import ManageMembersIcon from '@/assets/icons/ManageMembersIcon.svelte';
  import ResourceIcons from '@/assets/icons/ResourceIcons.svelte';
  import ChangeUserRole from '@/components/changeUserRole/ChangeUserRole.svelte';
  import DropdownNoSearch from '@/components/DropdownNoSearch/DropdownNoSearch.svelte';
  import InviteCollaborators from '@/components/InviteCollaborators/InviteCollaborators.svelte';
  import Modal from '@/components/Modal/Modal.svelte';
  import RemoveuserPopup from '@/components/RemoveUserPopup/RemoveuserPopup.svelte';
  import Table from '@/components/Table/Table.svelte';
  import MembersDropdown from '@/components/TableComponents/MembersDropdown.svelte';
  import TablePagination from '@/components/TablePagination/TablePagination.svelte';
  import TableSearch from '@/components/TableSearch/TableSearch.svelte';

  import { createQuery } from '@/services/api.common';
  import { hubsService } from '@/services/hubs.service';
  import { userId } from '@/store/auth';
  import Button from '@/ui/Button/Button.svelte';
  import ChangingRolesPopup from '@/ui/ChangigRolesPopup.svelte/ChangingRolesPopup.svelte';
  import { getRelativeTime } from '@/utils/TimeFunction';
  import type { SortingState } from '@tanstack/svelte-table';
  import { navigate } from 'svelte-routing';

  const id = userId;

  let isLoading;
  let selected = { value: 'all', label: 'All Hubs' };
  let filters = { searchTerm: '' };
  let pagination = { pageIndex: 0, pageSize: 10 };
  let sorting: SortingState = [];

  const { data, isFetching, refetch } = createQuery(async () => hubsService.getUsers());

  $: users = ($data?.users || []).filter((user) => user.id !== $userId);

  $: teams = ($data?.teams || []).filter((team) => {
    const teamUsers = team.users || [];
    return teamUsers.length > 1 || !teamUsers.some((user) => user.id === $userId);
  });

  $: isLoading = $isFetching;

  $: teamOptions = teams.map((team) => ({ value: team.id, label: team.name }));
  $: options = [{ value: 'all', label: 'All Teams' }, ...teamOptions];

  $: filteredUsers = users.filter((user) => {
    const matchesSearch =
      !filters.searchTerm || user.name.toLowerCase().includes(filters.searchTerm.toLowerCase());

    if (selected.value === 'all') return matchesSearch;

    const isInTeam = user.teams.some((team) => team.id === selected.value);
    return isInTeam && matchesSearch;
  });

  $: paginatedUsers = filteredUsers.slice(
    pagination.pageIndex * pagination.pageSize,
    (pagination.pageIndex + 1) * pagination.pageSize,
  );

  $: totalItems = filteredUsers.length;

  let membersPagination = { pageIndex: 0, pageSize: 10 };
  let membersFilters = { searchTerm: '' };
  let params = null;

  const {
    data: membersData,
    isFetching: isMembersFetching,
    refetch: refetchMembers,
  } = createQuery(async () => {
    if (!params) return { data: { members: [], totalCount: 0, hubName: '' } };

    return hubsService.getHubMembers({
      hubId: params,
      page: membersPagination.pageIndex + 1,
      limit: membersPagination.pageSize,
      search: membersFilters.searchTerm,
    });
  });

  function handleSearchChange(event: CustomEvent<string>) {
    filters.searchTerm = event.detail;
    pagination.pageIndex = 0;
  }

  function handlePageChange(event: CustomEvent<number>) {
    pagination.pageIndex = event.detail;
  }

  function handlePageSizeChange(event: CustomEvent<number>) {
    pagination = { pageSize: event.detail, pageIndex: 0 };
  }

  function handleSelect(event: CustomEvent<{ value: string; label: string }>) {
    selected = event.detail;
    pagination.pageIndex = 0;
    params = selected.value !== 'all' ? selected.value : null;
    if (params) refetchMembers();
  }

  let showModal = false;
  let modalData = { data: null };
  let modalVariants = { changeRole: false, removeUser: false, changingRole: false };

  function onClick({ data, click }) {
    handleshowModal(data);
    modalVariants.changeRole = click === 'changeRole';
    modalVariants.removeUser = click === 'removeUser';
  }

  function handleshowModal(data: any) {
    showModal = true;
    modalData.data = data;
  }

  function closePopups() {
    modalVariants.changeRole = false;
    modalVariants.removeUser = false;
    modalVariants.changingRole = false;
    showModal = false;
    modalData.data = null;
  }

  $: currentHubName =
    selected.value !== 'all' ? teams.find((team) => team.id === selected.value)?.name || '' : '';

  function handleModalSuccess() {
    closePopups();
    refetch();
    if (params) refetchMembers();
  }

  $: columns =
    selected.value === 'all'
      ? [
          { accessorKey: 'name', header: 'Users' },
          { accessorKey: 'email', header: 'Email', enableSorting: false },
          { accessorKey: 'teamsAccess', header: 'Hub access', enableSorting: false },
          {
            accessorKey: 'lastActive',
            header: 'Last Active',
            enableSorting: true,
            cell: ({ getValue }) => {
              const date = getValue();
              return `<span class="text-neutral-50" title="${new Date(date).toLocaleString()}">${getRelativeTime(date)}</span>`;
            },
          },
          {
            accessorKey: 'joinedOrg',
            header: 'Joining Date',
            cell: ({ getValue }) => {
              const date = getValue();
              return `<span class="text-neutral-50" title="${new Date(date).toLocaleString()}">${getRelativeTime(date, true)}</span>`;
            },
          },
        ]
      : [
          { accessorKey: 'name', header: 'Name' },
          { accessorKey: 'email', header: 'Email', enableSorting: false },
          {
            id: 'teamName',
            header: 'Hub access',
            enableSorting: false,
            accessorFn: (row) => row.teams.find((t) => t.id === selected.value)?.name || '-',
          },
          {
            id: 'role',
            header: 'Role',
            enableSorting: false,
            accessorFn: (row) => row.teams.find((t) => t.id === selected.value)?.role || '-',
          },
          {
            accessorKey: 'lastActive',
            header: 'Last Active',
            cell: ({ getValue }) => {
              const date = getValue();
              return `<span class="text-neutral-50" title="${new Date(date).toLocaleString()}">${getRelativeTime(date)}</span>`;
            },
          },
          {
            accessorKey: 'joinedOrg',
            header: 'Joining Date',
            cell: ({ getValue }) => {
              const date = getValue();
              return `<span class="text-neutral-50" title="${new Date(date).toLocaleString()}">${getRelativeTime(date, true)}</span>`;
            },
          },
          {
            id: 'actions',
            header: '',
            enableSorting: false,
            cell: ({ row }) => ({
              Component: MembersDropdown,
              props: { row, onClick },
            }),
          },
        ];

  function handleSortingChange(event: CustomEvent<SortingState>) {
    sorting = event.detail;
  }

  function handleRowClick(event) {
    const userId = event.detail.id;
    navigate(`/users/users-overview/${userId}`);
  }
</script>

<section>
  <div class="bg-surface-900 flex w-full flex-col px-4 text-left">
    <div class="flex flex-col gap-6">
      <div class="flex justify-between">
        <div class="flex flex-col gap-2">
          <h2 class="font-inter text-fs-20 leading-lh-ds-120 font-medium text-neutral-50">Users</h2>
          <h2 class="font-inter text-fs-ds-14 leading-lh-ds-143 font-light text-neutral-100">
            Manage users and their access rights
          </h2>
        </div>
        <Button
          variant="filled-primary"
          size="small"
          iconLeft={true}
          on:click={() => (showModal = true)}
          disabled={selected.value === 'all'}
        >
          <svelte:fragment slot="iconLeft">
            <ManageMembersIcon />
          </svelte:fragment>
          Invite Collaborators
        </Button>
      </div>

      <div class="bg-surface-900">
        <div class="flex items-center gap-3 py-6">
          <TableSearch
            value={filters.searchTerm}
            on:search={handleSearchChange}
            isLoading={$isFetching}
            placeholder="Search Users"
          />
          <DropdownNoSearch
            {options}
            bind:selected
            placeholder="Select Team"
            leftIcon={AllHubsIcon}
            variant="primary"
            width="w-48"
            on:select={handleSelect}
            pinLastOptionBottom={true}
          />
        </div>

        <Table
          {columns}
          data={paginatedUsers}
          isLoading={$isFetching}
          pageIndex={pagination.pageIndex}
          pageSize={pagination.pageSize}
          {totalItems}
          on:sortingChange={handleSortingChange}
          on:rowClick={handleRowClick}
        />

        <TablePagination
          pageIndex={pagination.pageIndex}
          pageSize={pagination.pageSize}
          {totalItems}
          isLoading={$isFetching}
          on:pageChange={handlePageChange}
          on:pageSizeChange={handlePageSizeChange}
        />
      </div>
    </div>
  </div>

  {#if showModal}
    <Modal on:close={closePopups}>
      {#if modalVariants.changeRole}
        <ChangeUserRole
          onClose={closePopups}
          data={$membersData.data?.members?.find(
            (data) => data.id.toString() === modalData?.data?.id.toString(),
          )}
          removeUserPopupOpen={() => {
            modalVariants.changeRole = false;
            modalVariants.removeUser = true;
          }}
          changingRolePopupOpen={() => {
            modalVariants.changeRole = false;
            modalVariants.removeUser = false;
            modalVariants.changingRole = true;
          }}
          hubId={selected.value !== 'all' ? selected.value : ''}
          hubName={currentHubName}
          onSuccess={handleModalSuccess}
        />
      {:else if modalVariants.removeUser}
        <RemoveuserPopup
          onSuccess={handleModalSuccess}
          onClose={closePopups}
          hubName={currentHubName}
          data={$membersData.data?.members?.find(
            (data) => data.id.toString() === modalData?.data?.id.toString(),
          )}
          hubId={selected.value !== 'all' ? selected.value : ''}
        />
      {:else if modalVariants.changingRole}
        <ChangingRolesPopup
          onSuccess={() => refetch()}
          onClose={closePopups}
          hubName={currentHubName}
          data={$membersData.data?.members?.find(
            (data) => data.id.toString() === modalData?.data?.id.toString(),
          )}
          hubId={params}
        />
      {:else}
        <InviteCollaborators
          onClose={() => (showModal = false)}
          hubId={params}
          hubName={currentHubName}
          onSuccess={() => {}}
        />
      {/if}
    </Modal>
  {/if}
</section>
