<script lang="ts">
  import SideNav from '@/components/SideNav/SideNav.svelte';
  import TopNav from '@/components/TopNav/TopNav.svelte';
  import { TopUpgradeBanner, TopFailedBanner } from '@/components/TopBanners/index';
  import { createQuery } from '@/services/api.common';
  import { hubsService } from '@/services/hubs.service';
  import { navigate, useLocation } from 'svelte-routing';
  import { writable } from 'svelte/store';
  import { hubRefetchTrigger } from '@/store/hubRefetch';
  import { captureEvent } from '@/utils/posthogConfig';

  const showOptionalSideNav = writable(false);
  const location = useLocation();

  // Helper: Extract hubId from pathname
  function extractHubId(path: string): string | null {
    const segments = path.split('/');
    if (
      path.startsWith('/hubs/workspace/') ||
      path.startsWith('/hubs/settings/') ||
      path.startsWith('/hubs/members/')
    ) {
      return segments[3] || null;
    }
    if (path.startsWith('/hubs/workspace-details/')) {
      return segments[4] || null;
    }
    return null;
  }

  // Reactive hubId
  $: hubId = extractHubId($location.pathname);

  // Store hub data
  const { data: hubData, refetch: hubsDataRefetch } = createQuery(() =>
    hubsService.getHubDetails(hubId),
  );

  // Clear stale hubData when hubId changes
  $: if (hubId) {
    hubData.set(null); // Clear previous data
    hubsDataRefetch();
  }

  // Listen to global refetch trigger
  $: if ($hubRefetchTrigger > 0 && hubId) {
    hubsDataRefetch();
  }

  // Helpers for route match
  const isHubRoute = (path: string) =>
    path.startsWith('/hubs/workspace') ||
    path.startsWith('/hubs/settings') ||
    path.startsWith('/hubs/members');

  // Banner states
  $: isCommunityPlan = isHubRoute($location.pathname) && $hubData?.data?.plan?.name === 'Community';

  $: isBillingFailed =
    isHubRoute($location.pathname) &&
    ['action_required', 'payment_failed'].includes($hubData?.data?.billing?.status || '');

  $: topBannerShow = isCommunityPlan || isBillingFailed;

  $: paddingTop = topBannerShow ? 'pt-[68px]' : 'pt-[48px]';

  const handleRedirect = () => {
    captureUserClicUpgrade();
    if (hubId) navigate(`/billing/billingOverview/${hubId}`);
  };

  const captureUserClicUpgrade = () => {
    const eventProperties = {
      event_source: 'admin',
      cta_location: 'upgrade_banner',
    };
    captureEvent('admin_upgrade_intent', eventProperties);
  };
</script>

<div class="relative h-screen">
  <!-- Top Navigation -->
  <div class="absolute top-0 left-0 z-10 w-full">
    <TopNav />
  </div>

  <!-- Top Banner -->
  {#if topBannerShow}
    <div class="absolute top-[48px] z-1 flex w-full flex-col gap-1">
      {#if isCommunityPlan && !isBillingFailed}
        <TopUpgradeBanner reDirect={handleRedirect} />
      {/if}
      {#if isBillingFailed}
        <TopFailedBanner reDirect={handleRedirect} />
      {/if}
    </div>
  {/if}

  <div class={`flex h-full ${paddingTop}`}>
    <SideNav />

    <!-- Main Content -->
    <div
      class="bg-surface-900 relative flex flex-1 overflow-auto transition-all duration-300 ease-in-out"
    >
      <div
        class={`flex-1 transition-all duration-300 ease-in-out ${$showOptionalSideNav ? 'ml-0' : ''}`}
      >
        <slot />
      </div>
    </div>
  </div>
</div>
