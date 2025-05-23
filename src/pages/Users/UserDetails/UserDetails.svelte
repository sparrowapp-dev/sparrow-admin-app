<script lang="ts">
  import Breadcrumbs from '@/components/Breadcrumbs/Breadcrumbs.svelte';
  import ChangeUserRole from '@/components/ChangeUserRole/ChangeUserRole.svelte';
  import Modal from '@/components/Modal/Modal.svelte';
  import RemoveuserPopup from '@/components/RemoveUserPopup/RemoveuserPopup.svelte';
  import Table from '@/components/Table/Table.svelte';
  import MembersDropdown from '@/components/TableComponents/MembersDropdown.svelte';
  import TablePagination from '@/components/TablePagination/TablePagination.svelte';
  import TableSearch from '@/components/TableSearch/TableSearch.svelte';
  import { ModalData, UserDetailsResponse } from '@/interface/Users';
  import { createQuery } from '@/services/api.common';
  import { userService } from '@/services/users.service';
  import ChangingRolesPopup from '@/ui/ChangingRolesPopup.svelte/ChangingRolesPopup.svelte';

  import { getRelativeTime } from '@/utils/TimeFunction';
  import type { SortingState } from '@tanstack/svelte-table';
  import { onDestroy, onMount } from 'svelte';
  import { useLocation } from 'svelte-routing';
  import { derived } from 'svelte/store';

  let params: string | undefined;
  let unsubscribe;

  const location = useLocation();
  const extractedParam = derived(location, ($location) => {
    const match = $location.pathname.match(/\/users\/users-overview\/([^\/]+)/);
    return match?.[1];
  });

  onMount(() => {
    unsubscribe = extractedParam.subscribe((id) => {
      if (id && id !== params) {
        params = id;
        refetch();
      }
    });
  });

  onDestroy(() => {
    unsubscribe?.();
  });

  const { data, isFetching, refetch } = createQuery<UserDetailsResponse>(async () => {
    if (!params) return;
    return userService.getUserDetails({ userId: params });
  });

  let showModal = false;
  let modalData: ModalData = { data: null };
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

  // Reactive values
  $: username = $data?.data?.userDetails?.name || '';
  $: userEmail = $data?.data.userDetails?.email || '';
  $: teamsData = $data?.data.hubDetails || [];

  const columns = [
    { accessorKey: 'teamName', header: 'Name', enableSorting: true },
    {
      accessorKey: 'role',
      header: 'Role',
      enableSorting: false,
      cell: ({ getValue }) => {
        const role = getValue();
        if (!role) return '';
        const formattedRole = role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
        return `<span class="text-neutral-50">${formattedRole}</span>`;
      },
    },
    {
      accessorKey: 'teamJoiningData',
      header: 'Joining Date',
      enableSorting: true,
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

  let filters = { searchTerm: '' };
  let pagination = { pageIndex: 0, pageSize: 10 };
  let sorting: SortingState = [];

  function formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return 'N/A';
    }
  }

  $: transformedTeamsData = teamsData;

  // Fixed filtering logic - only searches teamName
  $: filteredData = transformedTeamsData.filter((item) => {
    const searchTerm = filters.searchTerm.toLowerCase().trim();
    if (!searchTerm) return true;

    // Only search in teamName field
    const teamName = item.teamName || '';
    return teamName.toLowerCase().includes(searchTerm);
  });

  // Fixed sorting logic - compatible with TanStack Table
  $: sortedData = (() => {
    if (!sorting.length) return filteredData;

    const sortColumn = sorting[0];
    const { id: columnId, desc } = sortColumn;

    return [...filteredData].sort((a, b) => {
      let aValue, bValue;

      switch (columnId) {
        case 'teamName':
          aValue = (a.teamName || '').toLowerCase();
          bValue = (b.teamName || '').toLowerCase();
          break;
        case 'teamJoiningData':
          aValue = new Date(a.teamJoiningData || 0).getTime();
          bValue = new Date(b.teamJoiningData || 0).getTime();
          break;
        default:
          return 0;
      }

      if (typeof aValue === 'string') {
        const comparison = aValue.localeCompare(bValue);
        return desc ? -comparison : comparison;
      } else {
        return desc ? bValue - aValue : aValue - bValue;
      }
    });
  })();

  // Fixed pagination logic
  $: totalItems = sortedData.length;
  $: paginatedData = sortedData.slice(
    pagination.pageIndex * pagination.pageSize,
    (pagination.pageIndex + 1) * pagination.pageSize,
  );

  // Fixed event handlers
  function handleSearchChange(event: CustomEvent<string>) {
    filters.searchTerm = event.detail;
    pagination.pageIndex = 0; // Reset to first page when searching
  }

  function handleSortingChange(event: CustomEvent<SortingState>) {
    sorting = event.detail;
    pagination.pageIndex = 0; // Reset to first page when sorting changes
  }

  function handlePageChange(event: CustomEvent<number>) {
    pagination.pageIndex = event.detail;
  }

  function handlePageSizeChange(event: CustomEvent<number>) {
    pagination = { pageSize: event.detail, pageIndex: 0 };
  }

  function handleRowClick(event) {
    const rowData = event.detail;
    console.log('Row clicked:', rowData);
  }
  $: breadcrumbItems = [
    { label: 'Users', path: `/users/users-overview` },
    { label: username || '', path: `/users/users-overview/${params || ''}` },
  ];
</script>

<section>
  <div class="bg-surface-900 flex w-full flex-col px-4 text-left">
    <div class="flex flex-col gap-6">
      <Breadcrumbs items={breadcrumbItems} />
      <div class="flex flex-col gap-3">
        <div class="flex items-center gap-2 py-2">
          <div
            class="border-surface-50 font-fw-ds-400 leading-lh-ds-150 text-fs-ds-16 font-inter flex h-9 w-9 items-center justify-center rounded-[133.33px] border bg-purple-400 text-neutral-50"
          >
            {username ? username.charAt(0).toUpperCase() : '?'}
          </div>
          <div>
            <h2 class="font-inter font-fw-ds-500 leading-lh-ds-120 text-fs-d-s20 text-neutral-50">
              {username && username.length > 25 ? `${username.slice(0, 25)}...` : username}
            </h2>
            <h2 class="font-inter font-fw-ds-300 leading-lh-ds-150 text-fs-ds-12 text-neutral-300">
              {userEmail && userEmail.length > 50 ? `${userEmail.slice(0, 50)}...` : userEmail}
            </h2>
          </div>
        </div>
        <div class="font-inter font-fw-ds-300 leading-lh-ds-14 text-fs-ds-143 text-neutral-100">
          Manage {username && username.length > 25 ? `${username.slice(0, 25)}...` : username}'s
          permissions across Sparrow Hubs
        </div>
      </div>
      <div>
        <div class="bg-surface-900">
          <div class="flex items-center gap-3 py-6">
            <TableSearch
              value={filters.searchTerm}
              on:search={handleSearchChange}
              isLoading={$isFetching}
              placeholder="Search Hubs"
            />
          </div>

          {#if totalItems === 0 && !$isFetching}
            <div class="flex flex-col items-center justify-center py-16">
              <p class="text-fs-ds-14 font-fw-ds-300 text-neutral-400">No User Details Found</p>
            </div>
          {:else}
            <div>
              <Table
                {columns}
                data={paginatedData}
                isLoading={$isFetching}
                pageIndex={pagination.pageIndex}
                pageSize={pagination.pageSize}
                {totalItems}
                {sorting}
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
            </div>{/if}
        </div>
      </div>
    </div>

    {#if showModal}
      <Modal on:close={closePopups}>
        {#if modalVariants.changeRole}
          <ChangeUserRole
            onClose={closePopups}
            data={modalData?.data}
            removeUserPopupOpen={() => {
              modalVariants.changeRole = false;
              modalVariants.removeUser = true;
            }}
            changingRolePopupOpen={() => {
              modalVariants.changeRole = false;
              modalVariants.removeUser = false;
              modalVariants.changingRole = true;
            }}
            hubId={modalData?.data?.teamId}
            onSuccess={() => {
              refetch();
            }}
          />
        {:else if modalVariants.removeUser}
          <RemoveuserPopup
            onSuccess={() => {
              refetch();
            }}
            onClose={closePopups}
            hubName={modalData?.data?.teamName}
            data={modalData.data}
            hubId={modalData?.data?.teamId}
          />
        {:else if modalVariants.changingRole}
          <ChangingRolesPopup
            onSuccess={() => {
              refetch();
            }}
            onClose={closePopups}
            hubName={modalData?.data?.teamName}
            data={modalData.data}
            hubId={modalData?.data?.teamId}
          />
        {/if}
      </Modal>
    {/if}
  </div>
</section>
