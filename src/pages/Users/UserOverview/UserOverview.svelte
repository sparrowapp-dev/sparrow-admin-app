<script lang="ts">
  import AllHubsIcon from '@/assets/icons/AllHubsIcon.svelte';
  import ManageMembersIcon from '@/assets/icons/ManageMembersIcon.svelte';
  import ChangeUserRole from '@/components/ChangeUserRole/ChangeUserRole.svelte';
  import DropdownNoSearch from '@/components/DropdownNoSearch/DropdownNoSearch.svelte';
  import InviteCollaborators from '@/components/InviteCollaborators/InviteCollaborators.svelte';
  import Modal from '@/components/Modal/Modal.svelte';
  import RemoveuserPopup from '@/components/RemoveUserPopup/RemoveuserPopup.svelte';
  import Table from '@/components/Table/Table.svelte';
  import MembersDropdown from '@/components/TableComponents/MembersDropdown.svelte';
  import TablePagination from '@/components/TablePagination/TablePagination.svelte';
  import TableSearch from '@/components/TableSearch/TableSearch.svelte';
  import { ModalData } from '@/interface/Users';
  import UpgradeHubPopup from '@/components/UpgradeHubPopup/UpgradeHubPopup.svelte';

  import { createQuery } from '@/services/api.common';
  import { hubsService } from '@/services/hubs.service';
  import { userService } from '@/services/users.service';
  import { userId } from '@/store/auth';
  import Button from '@/ui/Button/Button.svelte';
  import ChangingRolesPopup from '@/ui/ChangingRolesPopup/ChangingRolesPopup.svelte';
  import CircularLoader from '@/ui/CircularLoader/CircularLoader.svelte';
  import { getRelativeTime } from '@/utils/TimeFunction';
  import type { SortingState } from '@tanstack/svelte-table';
  import { navigate } from 'svelte-routing';
    import { captureEvent } from '@/utils/posthogConfig';

  const id = userId;

  let isLoading;
  let selected = { value: 'all', label: 'All Hubs' };
  let filters = { searchTerm: '' };
  let pagination = { pageIndex: 0, pageSize: 10 };
  let sorting: SortingState = [];
  let liveEmailsCount = 0;

  const { data, isFetching, refetch } = createQuery(async () => userService.getUsers());

  $: users = ($data?.data?.users || []).filter((user) => user.id !== $userId);

  $: teams = ($data?.data?.teams || []).filter((team) => {
    const teamUsers = team.users || [];
    return teamUsers.length > 1 || !teamUsers.some((user) => user.id === $userId);
  });

  $: isLoading = $isFetching;

  $: teamOptions = teams.map((team) => ({ value: team.id, label: team.name }));
  $: options = [{ value: 'all', label: 'All Hubs' }, ...teamOptions];

  $: filteredUsers = users.filter((user) => {
    const matchesSearch =
      !filters.searchTerm || user.name.toLowerCase().includes(filters.searchTerm.toLowerCase());

    if (selected.value === 'all') return matchesSearch;

    const isInTeam = user.teams.some((team) => team.id === selected.value);
    return isInTeam && matchesSearch;
  });

  $: sortedUsers = [...filteredUsers].sort((a, b) => {
    if (!sorting.length) return 0;
    const { id: sortKey, desc } = sorting[0];
    const aValue = (a[sortKey] || '').toString().toLowerCase();
    const bValue = (b[sortKey] || '').toString().toLowerCase();
    if (aValue < bValue) return desc ? 1 : -1;
    if (aValue > bValue) return desc ? -1 : 1;
    return 0;
  });

  $: paginatedUsers = sortedUsers.slice(
    pagination.pageIndex * pagination.pageSize,
    (pagination.pageIndex + 1) * pagination.pageSize,
  );

  $: totalItems = filteredUsers.length;

  let hubId: string | null = null;

  const {
    data: membersData,
    isFetching: isMembersFetching,
    refetch: refetchMembers,
  } = createQuery(async () => {
    if (!hubId) return { data: { members: [], totalCount: 0, hubName: '' } };

    return hubsService.getHubMembers({
      hubId: hubId,
      page: 1,
      limit: 1000000,
      search: '',
    });
  });

  // Get hub details
  const { data: hubDetailsData, refetch: hubDetailsRefetch } = createQuery(async () => {
    if (!hubId) return null;
    return hubsService.getHubDetails(hubId);
  });

  // Get hub statistics using the new API
  const { data: hubStats, refetch: hubStatsRefetch } = createQuery(async () => {
    if (!hubId) return null;
    return hubsService.getHubStatics(hubId);
  });

  // Reactive variables for collaborator count and limits
  $: hubUsers = $hubDetailsData?.data?.users || [];
  $: user = hubUsers?.find((u) => u.id.toString() === $userId?.toString());
  $: owner = hubUsers?.find((u) => u.role === 'owner');
  $: isOwner = user?.role === 'owner';
  $: collaboratorLimit = $hubDetailsData?.data?.plan?.limits?.usersPerHub?.value || 0;
  $: collaboratorCount = $hubStats?.data?.collaboratorCount || 0;
  $: pendingInvites = $hubStats?.data?.pendingInvites || 0;
  $: totalCollaborators = collaboratorCount + pendingInvites;

  let showUpgradePopup = false;

  // Function to handle invite collaborators button click - properly connected to the button
  function handleInviteButtonClick() {
    if (totalCollaborators + liveEmailsCount >= collaboratorLimit) {
      showUpgradePopup = true;
    } else {
      showModal = true;
    }
  }

  const captureUserClickUpgrade =() =>{
    const eventProperties ={
      event_source : "admin",
      cta_location:"limit_exceeded_modal"
    }
    captureEvent("admin_upgrade_intent",eventProperties)
  }
  

  // Redirect handler for upgrade popup
  function handleRedirect() {
    captureUserClickUpgrade();
    if (isOwner) {
      navigate(`/billing/billingOverview/${hubId}redirectTo=changePlan`);
    } else {
      window.open(`mailto:${owner?.email}`);
    }
  }

  function handleLiveEmailsCount(event) {
    liveEmailsCount = event.detail;
  }

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
    captureDropdownSelect(selected.label, "All Hubs");
    hubId = selected?.value !== 'all' ? selected.value : null;
    if (hubId) {
      refetchMembers();
      hubDetailsRefetch();
      hubStatsRefetch();
    }
  }

  let showModal = false;
  let modalData: ModalData = { data: null };
  let modalVariants = { changeRole: false, removeUser: false, changingRole: false };

  function onClick({ data, click }) {
    handleShowModal(data);
    modalVariants.changeRole = click === 'changeRole';
    modalVariants.removeUser = click === 'removeUser';
  }

  function handleShowModal(data: any) {
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
    if (hubId) {
      refetchMembers();
      hubDetailsRefetch();
      hubStatsRefetch();
    }
  }

  $: columns =
    selected.value === 'all'
      ? [
          {
            accessorKey: 'name',
            header: 'Users',
            sortingFn: (rowA, rowB, columnId) => {
              const a = (rowA.getValue(columnId) || '').toLowerCase();
              const b = (rowB.getValue(columnId) || '').toLowerCase();
              return a.localeCompare(b);
            },
            cell: ({ getValue }) => {
              const value = getValue();
              return `<span class="text-neutral-50">${value}</span>`;
            },
          },
          { accessorKey: 'email', header: 'Email', enableSorting: false },
          { accessorKey: 'teamsAccess', header: 'Hub access', enableSorting: false },
          {
            accessorKey: 'lastActive',
            header: 'Last Active',
            cell: ({ getValue }) => {
              const date = getValue();
              const title = new Date(date).toLocaleString();
              const relative = getRelativeTime(date);
              return `<span class='text-neutral-50 px-3 py-2 block' title='${title}'>${relative}</span>`;
            },
          },
          {
            accessorKey: 'joinedOrg',
            header: 'Joining Date',
            cell: ({ getValue }) => {
              const date = getValue();
              return `<span class="text-neutral-50" title="${new Date(date).toLocaleString()}">${date ? getRelativeTime(date, true) : ''}</span>`;
            },
          },
        ]
      : [
          {
            accessorKey: 'name',
            header: 'Name',
            sortingFn: (rowA, rowB, columnId) => {
              const a = (rowA.getValue(columnId) || '').toLowerCase();
              const b = (rowB.getValue(columnId) || '').toLowerCase();
              return a.localeCompare(b);
            },
          },
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
              return `<span class="text-neutral-50" title="${new Date(date).toLocaleString()}">${date ? getRelativeTime(date, true) : ''}</span>`;
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

  const captureDropdownSelect = (selectName:string,buttonName:string) =>{
    const eventProperties = {
      button_name: buttonName,
      select_type: selectName
    }
    captureEvent("admin_hub_filter_applied", eventProperties);
  }

  const captureInviteCollaborator = (buttonName:string) =>{
    const eventProperties = {
      button_name: buttonName,
    }
    captureEvent("admin_invite_collaborator_clicked", eventProperties);
  }
</script>

<section>
  {#if !$data?.httpStatusCode}
    <div class="flex h-[calc(100vh-4rem)] w-full items-center justify-center">
      <CircularLoader />
    </div>
  {:else}
    <div class="bg-surface-900 flex w-full flex-col px-4 text-left">
      <div class="flex flex-col gap-6">
        <div class="flex justify-between">
          <div class="flex flex-col gap-2">
            <h2 class="font-inter text-fs-20 leading-lh-ds-120 font-medium text-neutral-50">
              Users
            </h2>
            <h2 class="font-inter text-fs-ds-14 leading-lh-ds-143 font-light text-neutral-100">
              Manage users and their access rights
            </h2>
          </div>
          <Button
            variant="filled-primary"
            size="small"
            iconLeft={true}
            on:click={() => {
              (showModal = true) 
              captureInviteCollaborator("Invite Collaborators")
            }}
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
              placeholder="Search user"
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
          {#if totalItems === 0 && !$isFetching}
            <div class="flex flex-col items-center justify-center py-16">
              <p class="text-fs-ds-14 font-fw-ds-300 text-neutral-400">No Results Found</p>
            </div>
          {:else}
            <div>
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
          {/if}
        </div>
      </div>
    </div>

    {#if showModal}
      <Modal on:close={closePopups}>
        {#if modalVariants.changeRole}
          <ChangeUserRole
            onClose={closePopups}
            data={$membersData.data?.members?.find(
              (data) => data.id.toString() === modalData?.data?.id?.toString(),
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
            onSuccess={() => {
              refetch();
              refetchMembers();
              hubDetailsRefetch();
              hubStatsRefetch();
            }}
          />
        {:else if modalVariants.removeUser}
          <RemoveuserPopup
            onSuccess={() => {
              refetchMembers();
              handleModalSuccess();
              hubDetailsRefetch();
              hubStatsRefetch();
            }}
            onClose={closePopups}
            hubName={currentHubName}
            data={$membersData.data?.members?.find(
              (data) => data.id.toString() === modalData?.data?.id.toString(),
            )}
            hubId={selected.value !== 'all' ? selected.value : ''}
          />
        {:else if modalVariants.changingRole}
          <ChangingRolesPopup
            onSuccess={() => {
              refetch();
              refetchMembers();
              hubDetailsRefetch();
              hubStatsRefetch();
            }}
            onClose={closePopups}
            hubName={currentHubName}
            data={$membersData.data?.members?.find(
              (data) => data.id.toString() === modalData?.data?.id.toString(),
            )}
            {hubId}
          />
        {:else}
          <InviteCollaborators
            onClose={() => (showModal = false)}
            {hubId}
            hubName={currentHubName}
            hubPlan={$hubDetailsData?.data?.plan?.name}
            on:emailsChange={handleLiveEmailsCount}
            onSuccess={() => {}}
            on:openUpgradePlan={handleInviteButtonClick}
          />
        {/if}
      </Modal>
    {/if}

    {#if showUpgradePopup}
      <Modal on:close={() => (showUpgradePopup = false)}>
        <UpgradeHubPopup
          onClose={() => (showUpgradePopup = false)}
          limit={collaboratorLimit}
          userRole={user?.role}
          {isOwner}
          reDirect={handleRedirect}
          limitText="Collaborators"
          currentCount={totalCollaborators + liveEmailsCount}
        />
      </Modal>
    {/if}
  {/if}
</section>
