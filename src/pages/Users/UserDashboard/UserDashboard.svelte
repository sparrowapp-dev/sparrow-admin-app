<script>
  import ContributionIcon from '@/assets/icons/ContributionIcon.svelte';
  import Hubsicon from '@/assets/icons/Hubsicon.svelte';
  import PieGraph from '@/graphs/PieGraph.svelte';
  import TrendLineGraph from '@/graphs/TrendLineGraph.svelte';
  import OverviewCards from '@/ui/OverviewCards/OverviewCards.svelte';
  import ChartLegend from '@/ui/ChartLegend/ChartLegend.svelte';
  import { createQuery } from '@/services/api.common';
  import { userService } from '@/services/users.service';
  import { pieChartConfig, trendLineConfig } from './dashboardData';
  import ActivityList from '@/ui/ActivityList/ActivityList.svelte';
  import NewInvites from '@/assets/icons/NewInvites.svelte';
    import CircularLoader from '@/ui/CircularLoader/CircularLoader.svelte';

  // Fetch dashboard stats using createQuery
  const { data: dashboardStats, isFetching: isLoadingStats } = createQuery(async () => {
    return userService.getDashboardStats();
  });

  // Fetch user distribution data for pie chart
  const { data: userDistribution, isFetching: isLoadingDistribution } = createQuery(async () => {
    return userService.getUserDistribution();
  });

  // Fetch user trend data for line chart
  const { data: userTrends, isFetching: isLoadingTrends } = createQuery(async () => {
    return userService.getUserTrends();
  });

  // Reactive statement to create cards data from API response
  $: cardsData = [
    {
      title: 'Total Users',
      value: $dashboardStats?.data?.users?.total?.toString() || '0',
      icon: ContributionIcon,
      history:
        $dashboardStats?.data?.users?.changeFromLastMonth > 0
          ? `+${$dashboardStats?.data?.users?.changeFromLastMonth} from last month`
          : '',
      loading: $isLoadingStats,
    },
    {
      title: 'New Invites',
      value: $dashboardStats?.data?.invites?.total?.toString() || '0',
      icon: NewInvites,
      history:
        $dashboardStats?.data?.invites?.changeFromLastMonth > 0
          ? `+${$dashboardStats?.data?.invites?.changeFromLastMonth} from last month`
          : '',
      loading: $isLoadingStats,
    },
    {
      title: 'Total Hubs',
      value: $dashboardStats?.data?.hubs?.total?.toString() || '0',
      icon: Hubsicon,
      history:
        $dashboardStats?.data?.hubs?.changeFromLastMonth > 0
          ? `+${$dashboardStats?.data?.hubs?.changeFromLastMonth} from last month`
          : '',
      loading: $isLoadingStats,
    },
  ];

  // Generate legend items from API data
  $: legendItems =
    $userDistribution?.data?.map((item) => ({
      label: item.label,
      color: item.color,
    })) || [];

  // Generate trend legend items from API data
  $: trendLegendItems =
    $userTrends?.data?.series?.map((series) => ({
      label: series.name,
      color: series.color,
    })) || [];

  // user activity data
  const { data: userActivity, isFetching: isLoadingActivity } = createQuery(async () => {
    return userService.getUserActivity(1, 50);
  });
</script>

<div class="bg-surface-900 w-full">
  {#if !$userTrends?.httpStatusCode}
    <div class="flex h-[calc(100vh-4rem)] w-full items-center justify-center">
      <CircularLoader />
    </div>
  {:else}
    <h1 class="font-fw-ds-500 font-inter text-fs-ds-20 leading-lh-ds-120 text-neutral-50">
      User Management Dashboard
    </h1>
    <p class="font-inter text-fs-ds-14 font-fw-ds-300 text-neutral-100">
      Manage your users and collaborators
    </p>
    <div class="mt-6 flex flex-row justify-between">
      {#each cardsData as card}
        <OverviewCards
          icon={card.icon}
          title={card.title}
          value={card.value}
          history={card.history}
          loading={card.loading}
        />
      {/each}
    </div>

    <!-- User Distribution Chart Section -->
    <div class="grid grid-cols-2 gap-6">
      <div class="bg-surface-700 mt-6 rounded-lg p-6">
        <h2 class="font-inter font-fw-ds-500 text-fs-ds-16 leading-lh-ds-120 text-neutral-50">
          User Distribution by Role
        </h2>
        <p class="font-inter font-fw-ds-400 text-fs-ds-12 leading-lh-ds-130 mt-2 text-neutral-400">
          Track of Admins and Members
        </p>

        <div class="relative h-[358px] pt-6">
          {#if $isLoadingDistribution}
            <!-- Loading state for pie chart -->
            <div class="absolute inset-0 flex items-center justify-center">
              <div
                class="border-t-primary-500 h-12 w-12 animate-spin rounded-full border-4 border-neutral-400"
              ></div>
            </div>
          {:else if $userDistribution?.data}
            <PieGraph data={$userDistribution.data} config={pieChartConfig} showTotal={true} />
          {/if}
        </div>

        <div class="py-6">
          <ChartLegend items={legendItems} horizontal={true} />
        </div>
      </div>
      <div class="bg-surface-700 mt-6 rounded-lg p-6">
        <h2 class="font-inter font-fw-ds-500 text-fs-ds-16 leading-lh-ds-120 text-neutral-50">
          Recent Activity
        </h2>
        <p class="font-inter font-fw-ds-400 text-fs-ds-12 leading-lh-ds-130 mt-2 text-neutral-400">
          Timeline of recent events
        </p>
        <div class="mt-6 h-[420px] overflow-y-auto">
          <ActivityList
            activities={$userActivity?.data?.activities || []}
            loading={$isLoadingActivity}
          />
        </div>
      </div>
    </div>
    <div class="bg-surface-700 mt-6 rounded-lg p-6">
      <h2 class="font-inter font-fw-ds-500 text-fs-ds-16 leading-lh-ds-120 text-neutral-50">
        Monthly Role Trends
      </h2>
      <p class="font-inter font-fw-ds-400 text-fs-ds-12 leading-lh-ds-130 mt-2 text-neutral-400">
        View monthly admin and member counts to understand team growth and balance roles.
      </p>

      <div class="relative h-[400px] pt-4">
        {#if $isLoadingTrends}
          <!-- Loading state for trend line chart -->
          <div class="absolute inset-0 flex items-center justify-center">
            <div
              class="border-t-primary-500 h-12 w-12 animate-spin rounded-full border-4 border-neutral-400"
            ></div>
          </div>
        {:else if $userTrends?.data}
          <TrendLineGraph data={$userTrends.data} config={trendLineConfig} />
        {/if}
      </div>

      <div class="py-4">
        <ChartLegend items={trendLegendItems} horizontal={true} trendLineLegend={true} />
      </div>
    </div>
  {/if}
</div>
