<script lang="ts">
  // ─── COMPONENT IMPORTS ──────────────────────────────
  import Modal from '@/components/Modal/Modal.svelte';
  import BottomWorkspace from './BottomWorkspace.svelte';
  import TopWorkspace from './TopWorkspace.svelte';
  import PopupModal from './PopupModal.svelte';

  // ─── DATA & SERVICES ────────────────────────────────
  import { members, ResourceData, topdata } from './dummyData';
  import { createQuery } from '@/services/api.common';

  // ─── SVELTE LIFECYCLE & STORES ──────────────────────
  import { onDestroy, onMount } from 'svelte';
  import { derived } from 'svelte/store';
  import { useLocation } from 'svelte-routing';

  // ─── STATE VARIABLES ────────────────────────────────
  let showModal = false;

  let modalVariants = {
    isEditWorkspaceModalOpen: false,
    isMakeItPublicModalOpen: false,
    isDeleteWorkspaceModalOpen: false,
    isInviteModal: false,
  };

  const resetModalVariants = () => ({
    isEditWorkspaceModalOpen: false,
    isMakeItPublicModalOpen: false,
    isDeleteWorkspaceModalOpen: false,
    isInviteModal: false,
  });

  function closeAllModals() {
    modalVariants = resetModalVariants();
    showModal = false;
  }

  function openModal(type: 'deleteWorkSpace' | 'makeItPublic' | 'editWorkspace' | 'invite') {
    modalVariants = resetModalVariants();
    showModal = true;

    switch (type) {
      case 'deleteWorkSpace':
        modalVariants.isDeleteWorkspaceModalOpen = true;
        break;
      case 'makeItPublic':
        modalVariants.isMakeItPublicModalOpen = true;
        break;
      case 'editWorkspace':
        modalVariants.isEditWorkspaceModalOpen = true;
        break;
      default:
        modalVariants.isInviteModal = true;
    }
  }

  // ─── CALLBACKS ───────────────────────────────────────
  function handleWorkspaceCreated() {
    console.log('Workspace created');
  }

  function handleRefresh(newState: Partial<typeof queryState>) {
    queryState = { ...queryState, ...newState };
    refetch();
  }

  // ─── ROUTE PARAM HANDLING ────────────────────────────
  const location = useLocation();
  let params: string | undefined;
  let unsubscribe: (() => void) | undefined;

  const extractedParam = derived(location, ($location) => {
    const match = $location.pathname.match(/\/hubs\/(?:workspace|settings|members)\/([^\/]+)/);
    return match?.[1];
  });

  // ─── QUERY STATE ─────────────────────────────────────
  let queryState: {
    tab: 'Resources' | 'Members';
    pagination: { pageIndex: number; pageSize: number };
    filters: { searchTerm: string };
    sorting: { id: string; desc?: boolean }[];
    resourceType: string;
  } = {
    tab: 'Resources',
    pagination: { pageIndex: 0, pageSize: 10 },
    filters: { searchTerm: '' },
    sorting: [],
    resourceType: '',
  };

  // ─── DATA FETCHING ───────────────────────────────────
  const fetchTabData = async (tab: 'Resources' | 'Members', queryParams: any) => {
    await new Promise((resolve) => setTimeout(resolve, 2000));
    return tab === 'Resources' ? ResourceData : members;
  };

  const {
    data: workspacesData,
    isFetching,
    refetch,
  } = createQuery(async () => {
    const queryParams = {
      hubId: params,
      page: queryState.pagination.pageIndex + 1,
      limit: queryState.pagination.pageSize,
      search: queryState.filters.searchTerm,
      sortBy: queryState.sorting[0]?.id || 'createdAt',
      sortOrder: queryState.sorting[0]?.desc ? 'desc' : 'asc',
      workspaceType: queryState.resourceType,
    };

    return fetchTabData(queryState.tab, queryParams);
  });

  // ─── LIFECYCLE HOOKS ─────────────────────────────────
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
</script>

<section class="font-inter w-full text-neutral-50">
  <div class="flex flex-col gap-6">
    <TopWorkspace {topdata} {openModal} />
    <BottomWorkspace
      data={$workspacesData?.data}
      onRefresh={handleRefresh}
      isLoading={$isFetching}
    />
  </div>
  {#if showModal}
    <Modal on:close={closeAllModals}>
      <PopupModal
        onClose={closeAllModals}
        data={topdata}
        onSuccess={handleWorkspaceCreated}
        {modalVariants}
      />
    </Modal>
  {/if}
</section>
