<script lang="ts">
  import SideNav from '@/components/SideNav/SideNav.svelte';
  import TopNav from '@/components/TopNav/TopNav.svelte';
  import TopUpgradeBanner from '@/components/TopUpgradeBanner/TopUpgradeBanner.svelte';
  import { createQuery } from '@/services/api.common';
  import { hubsService } from '@/services/hubs.service';
  import { navigate, useLocation } from 'svelte-routing';
  import { writable } from 'svelte/store';

  const showOptionalSideNav = writable(false);
  const location = useLocation();

  $: hubId = (() => {
    const path = $location.pathname;
    if (path.startsWith('/hubs/workspace/')) return path.split('/')[3];
    if (path.startsWith('/hubs/settings/')) return path.split('/')[3];
    if (path.startsWith('/hubs/members/')) return path.split('/')[3];
    return null;
  })();

  const {
    data: hubData,
    refetch: hubsDataRefetch,
    isFetching: HubsDataFetching,
  } = createQuery(async () => {
    return hubsService.getHubDetails(hubId);
  });

  $: if (hubId) {
    hubsDataRefetch();
  }
  $: topBannerShow =
    ($location.pathname.startsWith('/hubs/workspace') ||
      $location.pathname.startsWith('/hubs/settings') ||
      $location.pathname.startsWith('/hubs/members')) &&
    $hubData?.data?.plan?.name === 'Community';

  const handleRedirect = () => {
    navigate(`/billing/billingOverview/${hubId}`);
  };
</script>

<div class="relative h-screen">
  <!-- Top Navigation -->
  <div class="absolute top-0 left-0 z-10 w-full">
    <TopNav />
  </div>
  {#if topBannerShow}
    <div class="absolute z-10 flex w-full pt-[48px]">
      <TopUpgradeBanner reDirect={handleRedirect} />
    </div>
  {/if}
  <div class={`flex h-full  ${topBannerShow ? 'pt-[68px]' : 'pt-[48px]'}`}>
    <!-- Permanent Side Navigation -->
    <SideNav />

    <!--  Main Content -->
    <div
      class="bg-surface-900 relative flex flex-1 overflow-auto transition-all duration-300 ease-in-out"
    >
      <!-- Main Content Area -->
      <div
        class={`flex-1 transition-all duration-300 ease-in-out ${$showOptionalSideNav ? 'ml-0' : ''}`}
      >
        <slot />
      </div>
    </div>
  </div>
</div>
