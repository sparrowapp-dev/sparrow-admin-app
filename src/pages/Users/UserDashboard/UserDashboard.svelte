<script>
  import ContributionIcon from '@/assets/icons/ContributionIcon.svelte';
  import Hubsicon from '@/assets/icons/Hubsicon.svelte';
  import WorkspaceIcon2 from '@/assets/icons/WorkspaceIcon2.svelte';
  import PieGraph from '@/graphs/PieGraph.svelte';
  import TrendLineGraph from '@/graphs/TrendLineGraph.svelte';
  import OverviewCards from '@/ui/OverviewCards/OverviewCards.svelte';
  import ChartLegend from '@/ui/ChartLegend/ChartLegend.svelte';
  import {
    pieChartConfig,
    trendData,
    trendLineConfig,
    userDistributionData,
  } from './dashboardData';

  // Reactive Statements
  $: cardsData = [
    {
      title: 'Total Users',
      value: '100',
      icon: ContributionIcon,
      history: '+12 from last month',
    },
    {
      title: 'New Invites',
      value: '7',
      icon: WorkspaceIcon2,
      history: '',
    },
    {
      title: 'Total Hubs',
      value: 50,
      icon: Hubsicon,
      history: '+1 from last month',
    },
  ];

  const legendItems = userDistributionData.map((item) => ({
    label: item.label,
    color: item.color,
  }));

  const trendLegendItems = trendData.series.map((series) => ({
    label: series.name,
    color: series.color,
  }));
</script>

<div class="bg-surface-900 w-full">
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
        points={card?.subData}
        history={card.history}
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

      <div class="h-[358px] pt-6">
        <PieGraph data={userDistributionData} config={pieChartConfig} showTotal={true} />
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
    </div>
  </div>
  <div class="bg-surface-700 mt-6 rounded-lg p-6">
    <h2 class="font-inter font-fw-ds-500 text-fs-ds-16 leading-lh-ds-120 text-neutral-50">
      Monthly Role Trends
    </h2>
    <p class="font-inter font-fw-ds-400 text-fs-ds-12 leading-lh-ds-130 mt-2 text-neutral-400">
      View monthly admin and member counts to understand team growth and balance roles.
    </p>

    <div class="h-[400px] pt-4">
      <TrendLineGraph data={trendData} config={trendLineConfig} />
    </div>

    <div class="py-4">
      <ChartLegend items={trendLegendItems} horizontal={true} trendLineLegend={true} />
    </div>
  </div>
</div>
