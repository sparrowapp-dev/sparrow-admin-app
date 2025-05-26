<script lang="ts">
  import Breadcrumbs from '@/components/Breadcrumbs/Breadcrumbs.svelte';
  import ReusableSideNav from '@/components/ReuseableSideNav/ReusableSideNav.svelte';
  import { createQuery } from '@/services/api.common';
  import { hubsService } from '@/services/hubs.service';
  import { Route, Router, useLocation } from 'svelte-routing';
  import Overview from './Overview/Overview.svelte';
  import PaymentInformation from './PaymentInformation/PaymentInformation.svelte';
  import PaymentInvoices from './PaymentInvoices/PaymentInvoices.svelte';
  import HubsOverview from './PaymentHubsPage/HubsOverview.svelte';

  interface Team {
    teamId: string;
    teamName: string;
    role: string;
    workspaces: any[];
    users: any[];
  }

  interface ApiResponse {
    data: Team[];
  }

  interface DropdownOption {
    label: string;
    value: Team;
    plan: string | null;
  }

  let dropdownOptions: Array<DropdownOption> = [];

  const location = useLocation();
  // queries
  const { data, isFetching, isError, refetch } = createQuery<ApiResponse>(() =>
    hubsService.getAllHubs(),
  );

  $: {
    if ($data && $data?.data?.length > 0) {
      dropdownOptions = $data.data.map((team) => ({
        label: team?.teamName || '',
        value: team,
        plan: null,
      }));
    } else {
      dropdownOptions = [];
    }
  }

  interface PathMatcherResult {
    currentId: string | null;
    selectOption: Team | null;
  }
  const paymentPathMatcher = (
    pathname: string,
    dropdownOptions: DropdownOption[],
  ): PathMatcherResult => {
    let currentId = null;
    let selectOption = null;

    // Match any payment route pattern
    const paymentRouteMatch = pathname.match(/\/payment\/([^/]+)(?:\/([^/]+))?/);

    if (paymentRouteMatch) {
      const [, section, teamId] = paymentRouteMatch;

      // If we have a teamId, find the matching team
      if (teamId) {
        const foundTeam = dropdownOptions.find((option) => option.value.teamId === teamId);
        if (foundTeam) {
          currentId = teamId;
          selectOption = foundTeam.value;
        }
      }
      // If no teamId but section matches our known sections, use first team
      else if (['PaymentOverview', 'PaymentInformation', 'PaymentInvoices'].includes(section)) {
        const firstTeam = dropdownOptions[0]?.value || null;
        if (firstTeam) {
          currentId = firstTeam.teamId;
          selectOption = firstTeam;
        }
      }
    }

    return {
      currentId,
      selectOption,
    };
  };
</script>

<div>
  {#if $location.pathname.startsWith('/payment/PaymentOverview') || $location.pathname.startsWith('/payment/PaymentInformation') || $location.pathname.startsWith('/payment/PaymentInvoices')}
    <div class="bg-surface-900 flex" style="height: calc(100vh - 48px);">
      <!-- Sidebar - no longer passing data prop -->
      <div class="max-w-[266px] min-w-[266px]">
        <ReusableSideNav
          link={'/payment'}
          options={[
            { label: 'Overview', id: 'PaymentOverview' },
            { label: 'Payment Information', id: 'PaymentInformation' },
            { label: 'Invoices', id: 'PaymentInvoices' },
          ]}
          pathMatcher={paymentPathMatcher}
          placeholder="Search your Hub"
        />
      </div>

      <!-- Nested Route Content -->
      <div class="w-[100%] overflow-auto p-4">
        <Breadcrumbs />
        <Router>
          <Route path="PaymentOverview/:id" component={Overview} />
          <Route path="PaymentInformation/:id" component={PaymentInformation} />
          <Route path="PaymentInvoices/:id" component={PaymentInvoices} />
        </Router>
      </div>
    </div>{:else}
    <div class="bg-surface-900 flex" style="height: calc(100vh - 48px);">
      <HubsOverview />
    </div>
  {/if}
</div>
