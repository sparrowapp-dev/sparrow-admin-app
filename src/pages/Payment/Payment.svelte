<script lang="ts">
  // Svelte
  import { navigate, Route, Router, useLocation } from 'svelte-routing';

  // Services
  import { createQuery } from '@/services/api.common';
  import { hubsService } from '@/services/hubs.service';

  // App Components
  import Breadcrumbs from '@/components/Breadcrumbs/Breadcrumbs.svelte';
  import ReusableSideNav from '@/components/ReuseableSideNav/ReusableSideNav.svelte';

  // Local Components
  import Overview from './Overview/Overview.svelte';
  import PaymentInformation from './PaymentInformation/PaymentInformation.svelte';
  import PaymentInvoices from './PaymentInvoices/PaymentInvoices.svelte';
  import PaymentDetails from './PaymentInformation/PaymentDetails/PaymentDetails.svelte';
  import PaymentMethodSelectionPage from './PaymentInformation/PaymentMethodSelectionPage.svelte';
  import ChangePlanPage from './PaymentInformation/ChangePlanPage.svelte';

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
  $: if ($location.pathname === '/billing') {
    setTimeout(() => {
      const firstTeamId = $data?.data?.[0]?.teamId || '';
      navigate(`/billing/billingOverview/${firstTeamId}`);
    }, 100);
  }
  const paymentPathMatcher = (
    pathname: string,
    dropdownOptions: DropdownOption[],
  ): PathMatcherResult => {
    let currentId: string | null = null;
    let selectOption: Team | null = null;

    // Match any payment route pattern including addPaymentDetails and paymentMethod
    const paymentRouteMatch = pathname.match(/\/billing\/([^/]+)(?:\/([^/]+))?(?:\/([^/]+))?/);

    if (paymentRouteMatch) {
      const [, section, subsection, teamId] = paymentRouteMatch;

      // Handle nested routes like addPaymentDetails or selectPaymentMethod
      const isNestedRoute = ['addPaymentDetails', 'selectPaymentMethod'].includes(subsection);
      const actualTeamId = isNestedRoute ? teamId : subsection;

      if (actualTeamId) {
        const foundTeam = dropdownOptions.find((option) => option.value.teamId === actualTeamId);
        if (foundTeam) {
          currentId = actualTeamId;
          selectOption = foundTeam.value;
        }
      }
      // Handle root sections
      else if (
        ['billingOverview', 'billingInformation', 'billingInvoices', 'addPaymentDetails', 'selectPaymentMethod'].includes(
          section,
        )
      ) {
        const firstTeam = dropdownOptions[0]?.value || null;
        navigate(`/billing/billingOverview/${firstTeam?.teamId || ''}`);
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

<div class="bg-surface-900 flex" style="height: calc(100vh - 48px);">
  <!-- Sidebar - no longer passing data prop -->
  <div class="max-w-[266px] min-w-[266px]">
    <ReusableSideNav
      link={'/billing'}
      options={[
        { label: 'Overview', id: 'billingOverview' },
        { label: 'Payment Information', id: 'billingInformation' },
        { label: 'Invoices', id: 'billingInvoices' },
      ]}
      pathMatcher={paymentPathMatcher}
      placeholder="Search your Hub"
    />
  </div>

  <!-- Nested Route Content -->
  <div class="w-[100%] overflow-auto p-4">
    <Breadcrumbs />
    <Router>
      <Route path="billingOverview/:id" component={Overview} />
      <Route path="billingInformation/:id" component={PaymentInformation} />
      <Route path="billingInformation/addPaymentDetails/:id" component={PaymentDetails} />
      <Route path="billingInformation/selectPaymentMethod/:id" component={PaymentMethodSelectionPage} />
      <Route path="billingInformation/changePlan/:id" component={ChangePlanPage} />
      <Route path="billingInvoices/:id" component={PaymentInvoices} />
    </Router>
  </div>
</div>
