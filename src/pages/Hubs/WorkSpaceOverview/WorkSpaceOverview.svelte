<script lang="ts">
  // ─── COMPONENT IMPORTS ──────────────────────────────
  import Modal from '@/components/Modal/Modal.svelte';
  import BottomWorkspace from './BottomWorkspace.svelte';
  import TopWorkspace from './TopWorkspace.svelte';
  import PopupModal from './PopupModal.svelte';

  // ─── DATA & SERVICES ────────────────────────────────
  import { createQuery } from '@/services/api.common';

  // ─── SVELTE LIFECYCLE & STORES ──────────────────────
  import { onDestroy, onMount } from 'svelte';
  import { derived } from 'svelte/store';
  import { navigate, useLocation } from 'svelte-routing';
  import { hubsService } from '@/services/hubs.service';
  import Breadcrumbs from '@/components/Breadcrumbs/Breadcrumbs.svelte';

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
  function handleOnSuccess() {
    if (modalVariants.isEditWorkspaceModalOpen) {
      TopDatarefetch();
    }
    if (modalVariants.isMakeItPublicModalOpen) {
      TopDatarefetch();
    }
    if (modalVariants.isInviteModal) {
    }
    if (modalVariants.isDeleteWorkspaceModalOpen) {
      navigate(`/hubs/workspace/${hubId}`);
    }
  }

  function handleRefresh(newState: Partial<typeof queryState>) {
    queryState = { ...queryState, ...newState };
    refetch();
  }

  // ─── ROUTE PARAM HANDLING ────────────────────────────
  const location = useLocation();
  let params: string | undefined;
  let hubId: string | undefined;
  let unsubscribe: (() => void) | undefined;

  const extractedParams = derived(location, ($location) => {
    const match = $location.pathname.match(/\/hubs\/workspace-details\/([^\/]+)\/([^\/]+)/);
    return {
      workspaceId: match?.[1],
      hubId: match?.[2],
    };
  });
  // onMount(() => {
  //   unsubscribe = extractedParam.subscribe((id) => {
  //     if (id && id !== params) {
  //       params = id;
  //       refetch();
  //       TopDatarefetch();
  //     }
  //   });
  // });
  onMount(() => {
    unsubscribe = extractedParams.subscribe(({ workspaceId: wId, hubId: hId }) => {
      if (wId && wId !== params) {
        params = wId;
        hubId = hId;
        refetch();
        TopDatarefetch();
      }
    });
  });
  onDestroy(() => {
    unsubscribe?.();
  });

  // ─── QUERY STATE ─────────────────────────────────────
  let queryState: {
    tab: 'resources' | 'members';
    pagination: { pageIndex: number; pageSize: number };
    filters: { searchTerm: string };
    sorting: { id: string; desc?: boolean }[];
    resourceType: string;
  } = {
    tab: 'resources',
    pagination: { pageIndex: 0, pageSize: 10 },
    filters: { searchTerm: '' },
    sorting: [],
    resourceType: '',
  };

  // ─── DATA FETCHING ───────────────────────────────────

  const {
    data: workspacesData,
    isFetching,
    refetch,
  } = createQuery(async () => {
    const queryParams = {
      workspaceId: params,
      hubId: hubId,
      page: queryState.pagination.pageIndex + 1,
      limit: queryState.pagination.pageSize,
      search: queryState.filters.searchTerm,
      sortBy: queryState.sorting[0]?.id || 'createdAt',
      sortOrder: queryState.sorting[0]?.desc ? 'desc' : 'asc',
      workspaceType: queryState.resourceType,
      tab: queryState.tab,
      resources: queryState.resourceType,
    };

    return hubsService.getWorkspaceDetails(queryParams);
  });

  const {
    data: topData,
    isFetching: isTopDataFetching,
    refetch: TopDatarefetch,
  } = createQuery(async () => {
    const queryParams = { workspaceId: params, hubId: hubId };

    return hubsService.getWorkspaceSummary(queryParams);
  });

  $: breadcrumbItems = [
    { label: 'Hubs', path: '/hubs' },
    { label: $topData?.data?.hubName, path: `/hubs/workspace-details/${hubId}` },
    { label: $topData?.data?.title, path: `/hubs/workspace-details/${params}/${hubId}` },
  ];
</script>

<section class="font-inter w-full text-neutral-50">
  <Breadcrumbs items={breadcrumbItems} />
  <div class="flex flex-col gap-6 pt-6">
    <TopWorkspace
      topdata={$topData?.data}
      {openModal}
      isLoading={$isTopDataFetching}
      workspaceId={params}
    />
    <BottomWorkspace
      data={$workspacesData?.data}
      onRefresh={handleRefresh}
      isLoading={$isFetching}
      {params}
      {TopDatarefetch}
    />
  </div>
  {#if showModal}
    <Modal on:close={closeAllModals}>
      <PopupModal
        onClose={closeAllModals}
        data={$topData.data}
        onSuccess={handleOnSuccess}
        {modalVariants}
        {params}
        {hubId}
      />
    </Modal>
  {/if}
</section>
