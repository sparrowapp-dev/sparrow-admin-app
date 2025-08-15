<script lang="ts">
  import TrialNav from '@/components/TrialNav/TrialNav.svelte';
  import WelcomePage from '@/assets/images/WelcomePage.png';
  import Button from '@/ui/Button/Button.svelte';
  import { HubDetails, CardDetails, TeamDetails } from '@/components/TrialFlow';
  import Modal from '@/components/Modal/Modal.svelte';
  import PaymentProcessingModal from '@/components/PaymentProcessingModal/PaymentProcessingModal.svelte';
  import { onMount } from 'svelte';
  import TrialFlowViewModel from './UserTrialFlow.ViewModel';
  import { billingService } from '@/services/billing.service';
  import { handleStripePaymentConfirmation, initializeStripe } from '@/utils/stripeUtils';
  import { initializeStripeSocket } from '@/utils/socket.io.utils';
  import { API_BASE_URL } from '@/constants/environment';
  import { notification } from '@/components/Toast';
  import DropdownNoSearch from '@/components/DropdownNoSearch/DropdownNoSearch.svelte';
  import { navigate } from 'svelte-routing';
  let _viewModel = new TrialFlowViewModel();

  let currentStep = 1;
  let formData = {
    // Hub fields
    hubName: '',
    hubUrl: '',

    // Card details
    cardholderName: '',

    // Billing details
    billingName: '',
    billingEmail: '',
    billingAddress: '',
    billingAddress2: '',
    billingCity: '',
    billingState: '',
    billingZip: '',
    billingCountry: null,
    isDefaultPayment: false,
  };

  let teamdata = [
    {
      id: 1,
      email: '',
      role: { id: '', name: '' },
    },
  ];

  let promoCode = '';
  let promoError = '';
  let promoSuccessMsg = '';
  let isApplyingPromo = false;
  let isPromoApplied = false;
  let trialStartDate = '';
  let trialEndDate = '';
  let amountAfterTrial = '';
  let promoAppliedValue = '';
  let promoDiscountType = '';
  let promoDiscountValue = 0;
  let promoCodeId = '';
  let billingCycles;

  $: {
    const start = new Date();
    trialStartDate = start.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const end = new Date();
    end.setDate(start.getDate() + trialPeriod);
    trialEndDate = end.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  $: {
    if (pricingDetails && planTier && trialFrequency) {
      const selectedPlan = pricingDetails.plans.find((p) => p.tier.toLowerCase() === planTier);
      const billing = selectedPlan?.billing.find(
        (b) => b.interval.toLowerCase() === (trialFrequency?.toLowerCase() || 'monthly'),
      );
      if (billing) {
        // Real price per user per interval
        const price = Number(billing.price);
        const floored = Math.round(price * 100) / 100;
        const intervalLabel =
          billing.interval === 'monthly'
            ? 'month'
            : billing.interval === 'annual'
              ? 'year'
              : billing.interval;
        amountAfterTrial = `$${floored.toFixed(2)}/user/${intervalLabel}`;

        // Promo applied value
        if (promoDiscountType && promoDiscountValue > 0) {
          if (promoDiscountType === 'percentage') {
            const discountValue = Math.round(((price * promoDiscountValue) / 100) * 100) / 100;
            promoAppliedValue = `$${discountValue.toFixed(2)}/user/${intervalLabel}`;
          } else if (promoDiscountType === 'amount') {
            promoAppliedValue = `$${promoDiscountValue}/${intervalLabel}`;
          }
        }
      }
    }
  }

  async function handleApplyPromo() {
    promoError = '';
    promoSuccessMsg = '';
    isApplyingPromo = true;
    isPromoApplied = false;
    promoCodeId = '';

    if (!promoCode.trim()) {
      promoError = 'Please enter a promo code';
      isApplyingPromo = false;
      return;
    }

    try {
      const result = await _viewModel.validatePromoCode(promoCode, priceId);
      if (result.isSuccessful) {
        // Only set is_error and message
        isPromoApplied = !result.data.is_error;
        promoError = result.data.is_error ? result.data.message : '';
        promoSuccessMsg = !result.data.is_error ? result.data.message : '';
        if (!result.data.is_error && result.data.data) {
          promoDiscountType = result.data.data.type;
          promoDiscountValue = result.data.data.value;
          promoCodeId = result.data.data.promo_id || '';
          billingCycles = result.data.data.billing_cycles;
        }
      }
    } catch (err) {
      promoError = 'Failed to validate promo code. Please try again.';
    } finally {
      isApplyingPromo = false;
    }
  }

  // Dynamic plan options from backend
  let options = [];
  $: options = pricingDetails
    ? pricingDetails.plans.flatMap((plan) =>
        plan.billing.map((bill) => ({
          value: `${plan.tier.toLowerCase()}-${bill.interval.toLowerCase()}`,
          label: `${plan.tier} - ${bill.interval.charAt(0).toUpperCase() + bill.interval.slice(1)}`,
          description: `$${bill.price} per user/${bill.interval === 'monthly' ? 'month' : bill.interval === 'annual' ? 'year' : bill.interval}`,
        })),
      )
    : [];

  let selected;
  $: if (options && options.length > 0 && !selected) {
    selected = options[0];
  }

  function handleSelect(event) {
    selected = event.detail;
    // Update flowName and trialFrequency based on selection
    if (selected.value.startsWith('standard')) {
      flowName = 'signup_standard_trial';
    } else if (selected.value.startsWith('professional')) {
      flowName = 'signup_professional_trial';
    }

    if (selected.value.endsWith('annual')) {
      trialFrequency = 'annual';
    } else {
      trialFrequency = 'monthly';
    }

    // Update URL params
    const params = new URLSearchParams(window.location.search);
    params.set('flow', flowName);
    params.set('trialPeriod', trialFrequency);
    navigate(`${window.location.pathname}?${params.toString()}`, { replace: true });

    // Recalculate pricing and priceId
    recalculatePricing();
    // If a promo code is already entered, re-validate it for the new plan/interval
    if (promoCode.trim()) {
      handleApplyPromo();
    }
  }

  // function saveTeamData() {
  //   try {
  //     localStorage.setItem('teamdata', JSON.stringify(teamdata));
  //   } catch (error) {
  //     console.error('Error saving team data:', error);
  //   }
  // }

  // function loadTeamData() {
  //   try {
  //     const savedData = localStorage.getItem('teamdata');
  //     if (savedData) {
  //       const parsedData = JSON.parse(savedData);
  //       if (Array.isArray(parsedData)) {
  //         teamdata = parsedData;
  //       }
  //     }
  //   } catch (error) {
  //     console.error('Error loading team data:', error);
  //   }
  // }

  function handleTeamDataChange(event) {
    teamdata = event.detail;
  }

  const steps = [
    { id: 1, title: 'Name Your Hub', icon: '1' },
    { id: 2, title: 'Add Card Details', icon: '2' },
    { id: 3, title: 'Invite Team', icon: '3' },
  ];
  let hubFormError = {
    hubNameError: false,
    hubUrlError: false,
    hubNameErrorMessage: 'Please enter your hub name.',
    hubUrlErrorMessage: 'Please enter a valid hub URL.',
  };

  let showProcessingModal = false;
  let isHubUrlExist = false;
  let isHubCreated = false;
  let createdHubId = '';
  let trailData;
  let customerId = '';
  let paymentMethodId = '';
  let isCardDetailsAdded = false;
  let stripe;
  let socket;
  // let hubId = '';
  let inviteCount;
  let trialPeriod = 14;
  let name;
  let teamDetailsComponent;
  let showPromoCode;

  const formatHubUrl = (value) => {
    return value ? `https://${value}.sparrowhub.net` : '';
  };

  async function handleInputChange(field, value) {
    formData = { ...formData, [field]: value };
    if (field === 'hubUrl') {
      // Convert value to full hub URL
      const hubUrlExist = await _viewModel.checkHubUrlExists({
        hubUrl: formatHubUrl(value?.trim()),
      });
      if (hubUrlExist.isSuccessful) {
        if (hubUrlExist.data.data.isExist) {
          isHubUrlExist = true;
          hubFormError.hubUrlError = true;
          hubFormError.hubUrlErrorMessage =
            'This hub URL is already in use. Please enter a different one.';
        } else if (hubUrlExist.data.data?.isInvalid) {
          isHubUrlExist = true;
          hubFormError.hubUrlError = true;
          hubFormError.hubUrlErrorMessage =
            'Hub URL is invalid. It should contain only characters and numbers.';
        } else {
          isHubUrlExist = false;
          hubFormError.hubUrlError = false;
          hubFormError.hubUrlErrorMessage = '';
        }
      } else {
        console.error('Failed to check hub URL existence:', isHubUrlExist);
      }
    }
  }

  let cardDetailsView = 'cardDetails';
  let cardDetailsComponent = null;
  let priceId: string = '';
  let trialstart = '';
  let trialend = '';
  let isPaymentProcessing = false;
  let pricingDetails;
  let source;
  let accessToken;
  let refreshToken;
  let response;

  function handleCardViewChange(event) {
    cardDetailsView = event.detail;
  }

  async function nextStep() {
    // Special handling for step 2
    if (currentStep == 1) {
      if (!formData.hubName.trim()) {
        hubFormError.hubNameErrorMessage = 'Please enter your hub name.';
        hubFormError.hubNameError = true;
      } else if (formData.hubUrl === '') {
        hubFormError.hubUrlErrorMessage = 'Please enter a valid hub URL.';
        hubFormError.hubUrlError = true;
        hubFormError.hubNameError = false;
      } else if (isHubUrlExist) {
        hubFormError.hubUrlErrorMessage =
          'This hub URL is already in use. Please enter a different one.';
        hubFormError.hubUrlError = true;
        hubFormError.hubNameError = false;
      } else {
        hubFormError.hubNameError = false;
        hubFormError.hubUrlError = false;
        if (!isHubCreated) {
          // Create FormData for file upload with additional fields
          const formDataToSend = new FormData();
          formDataToSend.append('name', formData.hubName.trim());
          formDataToSend.append('hubUrl', formatHubUrl(formData.hubUrl.trim()));
          const createdHub = await _viewModel.createTrialHub(formDataToSend);
          if (createdHub?.isSuccessful) {
            createdHubId = createdHub.data.data._id;
            isHubCreated = true;
            sessionStorage.setItem('isHubCreated', 'true');
            sessionStorage.setItem('createdHubId', createdHubId);
            currentStep += 1; // Move to next step after processing
          } else {
            console.error('Failed to create hub:', createdHub);
          }
        } else {
          const formDataToSend = new FormData();
          formDataToSend.append('name', formData.hubName.trim());
          formDataToSend.append('hubUrl', formatHubUrl(formData.hubUrl.trim()));
          const updatedHub = await _viewModel.updateTrialHub(createdHubId, formDataToSend);
          if (updatedHub?.isSuccessful) {
            currentStep += 1; // Move to next step after processing
          } else {
            console.error('Failed to create hub:', updatedHub);
          }
        }
      }
    } else if (currentStep === 2 && cardDetailsView === 'cardDetails') {
      // Add null check before calling setView
      if (cardDetailsComponent && cardDetailsComponent.setView && !isCardDetailsAdded) {
        const cardData = await cardDetailsComponent.processCardDetailsAdd();
        if (cardData?.success) {
          paymentMethodId = cardData?.paymentMethodId || '';
          isCardDetailsAdded = true;
          cardDetailsComponent.setView('billingDetails');
          cardDetailsView = 'billingDetails';
        } else {
          console.error('Failed to process card details:', cardData);
        }
      } else {
        // Fallback if component isn't ready
        cardDetailsComponent.setView('billingDetails');
        cardDetailsView = 'billingDetails';
      }
    } else if (currentStep === 2 && cardDetailsView === 'billingDetails') {
      // Add null check before calling setView
      // if (cardDetailsComponent && cardDetailsComponent.setView) {
      if (cardDetailsComponent) {
        const billingData = await cardDetailsComponent.processBillingDetails();
        if (billingData.success) {
          currentStep += 1;
        }
      } else {
        currentStep += 1;
      }

      //   cardDetailsComponent.setView('billingDetails');
      //   cardDetailsView = 'billingDetails';
      // } else {
      //   // Fallback if component isn't ready
      //   cardDetailsView = 'billingDetails';
      // }
    } else {
      // Normal behavior
      if (currentStep < 3) currentStep += 1;
    }
  }

  const handleFinalSetup = async (triggerPoint: string) => {
    if (triggerPoint === 'finish') {
      // First validate that rows with data have both email and role
      const isValid = teamDetailsComponent?.validateForm();
      if (!isValid) {
        // Form has validation errors, don't proceed
        return;
      }
    }
    socket = initializeStripeSocket(API_BASE_URL, createdHubId, {
      onPaymentSuccess: (data) => {
        console.log('Payment success:', data);
        const { team, invoice } = data;
        console.log('Payment success team:', team);
        let formatTeamData: { email: string; role: string }[] = [];
        let userCount = 1;
        if (invoice?.amount_paid === 0) {
          setTimeout(async () => {
            if (triggerPoint === 'finish') {
              formatTeamData = teamdata
                .filter((user) => user.email?.trim() && user.role?.id) // Only include if both exist
                .map((user) => ({
                  email: user.email.trim(),
                  role: user.role.id === 'admin' ? 'admin' : 'member',
                }));
              const inviteResponse = await _viewModel.bulkInviteUsers({
                teamId: team._id,
                users: formatTeamData,
              });
              if (inviteResponse?.isSuccessful) {
                userCount = userCount + formatTeamData?.length;
              }
            }

            // Set data for success modal
            selectedPlanDetails = {
              fromPlan: 'Community',
              toPlan: 'Standard',
              hubName: team?.name || '',
              nextBilling: team?.billing?.current_period_end,
            };
            if (isPromoApplied) {
              await _viewModel.sendUserConfirmationEmail(
                createdHubId,
                planTier,
                trialFrequency,
                promoDiscountType,
                promoDiscountValue,
              );
            } else {
              await _viewModel.sendUserConfirmationEmail(createdHubId, planTier, trialFrequency);
            }
            sessionStorage.removeItem('createdHubId');
            sessionStorage.removeItem('isHubCreated');
            isProcessing = false;
            showProcessingModal = false;
            if (isPromoApplied) {
              navigate(
                `/trialsuccess?hub=${team?.name}&users=${userCount}&trialstart=${trialstart}&trialend=${trialend}&flow=${planTier}&trialFrequency=${trialFrequency}&source=${source}&accessToken=${accessToken}&refreshToken=${refreshToken}&response=${response}&promoType=${promoDiscountType}&promoValue=${promoDiscountValue}&billingCycles=${billingCycles}`,
                { replace: true },
              );
            } else {
              navigate(
                `/trialsuccess?hub=${team?.name}&users=${userCount}&trialstart=${trialstart}&trialend=${trialend}&flow=${planTier}&trialFrequency=${trialFrequency}&source=${source}&accessToken=${accessToken}&refreshToken=${refreshToken}&response=${response}`,
                { replace: true },
              );
            }
          }, 5000);
        }

        // Show success modal
        setTimeout(() => {
          // showSubscriptionConfirmModal = true;
        }, 5000);
      },
      onPaymentFailed: (data) => {
        console.log('Payment failed:', data);
        const { team } = data;
        setTimeout(() => {
          isProcessing = false;
          showProcessingModal = false;

          // Set data for failure modal
          selectedPlanDetails = {
            fromPlan: 'Community',
            toPlan: 'Standard',
            hubName: team?.name || '',
            nextBilling: team?.billing?.current_period_end,
          };
        }, 5000);

        setTimeout(() => {
          showSubscriptionFailedModal = true;
          notification.error('Failed to start Trial.');
        }, 5000);
      },
      // onSubscriptionUpdated: () => {},
      onSubscriptionCreated: (data) => {
        console.log('Subscription created:', data);
        // showProcessingModal = false;
      },
    });
    showProcessingModal = true;
    let formatTeamData = teamdata
      .filter((user) => user.email?.trim() && user.role?.id) // Only include if both exist
      .map((user) => ({
        email: user.email.trim(),
        role: user.role.id === 'admin' ? 'admin' : 'member',
      }));
    let hubUserCount = formatTeamData ? formatTeamData.length + 1 : 1;
    const metadata = {
      hubId: createdHubId,
      userCount: triggerPoint === 'finish' ? hubUserCount.toString() : '1',
      planName: capitalizedFlow,
    };
    const result = await billingService.createSubscription({
      customerId,
      priceId,
      paymentMethodId: paymentMethodId,
      metadata,
      trialPeriodDays: trialPeriod || 0,
      seats: triggerPoint === 'finish' ? hubUserCount : 1,
      promoCodeId,
    });
    trialstart = result?.subscription?.trial_start;
    trialend = result?.subscription?.trial_end;
    // Check if additional authentication is required (like 3D Secure)
    if (result.requiresAction && result.clientSecret) {
      await handleStripePaymentConfirmation(stripe, result.clientSecret);
    }

    // At this point, we just wait for socket events
    // The modals will be shown/hidden by the socket event handlers
  };
  function prevStep() {
    // If we're on step 2 and in billing details view, switch to card details view
    if (currentStep === 2 && cardDetailsView === 'billingDetails') {
      // Add null check here too
      if (cardDetailsComponent && cardDetailsComponent.setView) {
        cardDetailsComponent.setView('cardDetails');
        cardDetailsView = 'cardDetails';
      } else {
        // Fallback if component isn't ready
        cardDetailsView = 'cardDetails';
      }
    } else if (currentStep > 1) {
      // Otherwise, normal behavior - go to previous step
      currentStep -= 1;

      // When moving from step 3 back to step 2, reset to card details view
      if (currentStep === 2) {
        setTimeout(() => {
          if (cardDetailsComponent && cardDetailsComponent.setView) {
            cardDetailsComponent.setView('cardDetails');
            cardDetailsView = 'cardDetails';
          } else {
            // Fallback if component isn't ready
            cardDetailsView = 'cardDetails';
          }
        }, 0);
      }
    }
  }
  // Extracts the subdomain from a SparrowHub URL like "https://fivee.sparrowhub.net"
  function getSubdomainFromHubUrl(url: string): string | null {
    try {
      const { hostname } = new URL(url);
      const suffix = '.sparrowhub.net';
      if (hostname.endsWith(suffix)) {
        // Remove the suffix and return everything before it
        return hostname.slice(0, -suffix.length);
      }
      return null;
    } catch {
      return null;
    }
  }
  // Subscription Related
  let showSubscriptionFailedModal = false;
  let isProcessing = false;
  let selectedPlanDetails = {
    fromPlan: 'Community',
    toPlan: 'Standard',
    hubName: '',
    nextBilling: '',
  };
  let showSubscriptionConfirmModal = false;
  let flowName = '';
  let trialFrequency = 'monthly'; // Default to monthly, can be overridden by query params
  let planTier = '';
  function recalculatePricing() {
    if (pricingDetails) {
      // Normalize flowName to extract the plan/tier
      let normalizedFlow = flowName?.toLowerCase() || '';
      planTier = '';
      if (normalizedFlow.includes('professional')) {
        planTier = 'professional';
      } else {
        planTier = 'standard';
      }

      // Find the plan by tier
      const selectedPlan = pricingDetails.plans.find((p) => p.tier.toLowerCase() === planTier);

      // Find billing interval by trialFrequency (monthly/annual)
      const billing = selectedPlan?.billing.find(
        (b) => b.interval.toLowerCase() === (trialFrequency?.toLowerCase() || 'monthly'),
      );

      // Assign priceId if found, else fallback to first available
      priceId = billing?.providers?.stripe ?? selectedPlan?.billing[0]?.providers?.stripe ?? '';
    }
  }
  $: if (options && options.length > 0) {
    let normalizedFlow = flowName?.toLowerCase() || '';
    let frequency = (trialFrequency || 'monthly').toLowerCase();

    if (normalizedFlow.includes('standard')) {
      selected =
        options.find(
          (opt) => opt.value === (frequency === 'annual' ? 'standard-annual' : 'standard-monthly'),
        ) || options[0];
    } else if (normalizedFlow.includes('professional')) {
      selected =
        options.find(
          (opt) =>
            opt.value === (frequency === 'annual' ? 'professional-annual' : 'professional-monthly'),
        ) || options[1];
    } else {
      selected = options[0];
    }
  }
  onMount(async () => {
    const params = new URLSearchParams(window.location.search);
    createdHubId = sessionStorage.getItem('createdHubId') ?? '';
    isHubCreated = sessionStorage.getItem('isHubCreated') === 'true';
    const userName = params.get('name');
    trialFrequency = params.get('trialPeriod') || 'monthly';
    source = params.get('source');
    accessToken = params.get('accessToken');
    refreshToken = params.get('refreshToken');
    response = params.get('response');
    flowName = params.get('flow') || '';

    // Set selected plan based on flowName and trialFrequency
    let normalizedFlow = flowName?.toLowerCase() || '';
    let frequency = (trialFrequency || 'monthly').toLowerCase();

    const pricingResponse = await _viewModel.getPricingDetails();
    if (pricingResponse.isSuccessful && pricingResponse.data?.data) {
      pricingDetails = pricingResponse.data.data;
      recalculatePricing();
    }
    if (isHubCreated) {
      const hubDetails = await _viewModel.getHubDetails(createdHubId);
      if (hubDetails?.isSuccessful) {
        formData.hubName = hubDetails.data.data.name || '';
        formData.hubUrl = getSubdomainFromHubUrl(hubDetails.data.data.hubUrl) || '';
      } else {
        console.error('Failed to fetch hub details:', hubDetails);
      }
    } else {
      name = userName ?? '';
    }
    // Initialize Stripe
    stripe = await initializeStripe();

    // Set up socket connection for payment events
    showPromoCode =
      flowName === 'signup_standard_trial' ||
      flowName === 'signup_professional_trial' ||
      flowName === 'marketing_standard_trial' ||
      flowName === 'marketing_professional_trial' ||
      flowName === 'login_standard_trial' ||
      flowName === 'login_professional_trial';
  });
  $: capitalizedFlow = planTier ? planTier.charAt(0).toUpperCase() + planTier.slice(1) : '';
</script>

<TrialNav />

<div
  class="flex min-h-screen items-start justify-center bg-cover bg-center bg-no-repeat p-4 pt-20"
  style="background-image: url('{WelcomePage}')"
>
  <div class="padding-y-14 mx-auto flex w-full flex-col gap-10">
    <!-- Fixed Header Section -->
    <div class="mx-auto w-full max-w-2xl gap-10">
      <div class="text-center text-neutral-50">
        <h1 class="text-fs-ds-42 font-fw-ds-300 font-aileron text-neutral-50">
          Welcome to <span class="gradient-text">Sparrow</span>, {name ?? ''}
        </h1>
        <p class="text-fs-ds-18 mb-10 text-neutral-200">
          We’re excited to have you on board! Let’s quickly set up your hub so you can start
          exploring all the features of your 14 days free {capitalizedFlow} trial.
        </p>
      </div>

      <!-- Step Progress Indicator -->
      <div class="mb-12 flex justify-between">
        {#each steps as step, index}
          <div class="flex">
            <div class="flex flex-col items-center">
              <div
                class={`text-fs-ds-12 font-fw-ds-500 flex h-6 w-6 items-center justify-center rounded-full border transition-all
            ${
              currentStep > step.id
                ? 'border-green-400 bg-green-500 text-white'
                : currentStep === step.id
                  ? 'border-blue-400 bg-blue-500 text-white'
                  : 'border-gray-300 bg-white text-gray-500'
            }
          `}
              >
                {step.icon}
              </div>
              <span
                class={`mt-2 w-[100px] text-center text-xs transition-colors ${
                  currentStep >= step.id ? 'text-white' : 'text-gray-500'
                }`}
              >
                {step.title}
              </span>
            </div>
            {#if index < steps.length - 1}
              <div
                class="mt-3 -mr-6 -ml-6 w-60 self-start border-t-2 border-dashed border-gray-600"
              />
            {/if}
          </div>
        {/each}
      </div>

      <!-- Plan Dropdown -->
      <div class="mb-8 flex items-center justify-center gap-2">
        <div class="text-white">Your Plan:</div>
        {#if currentStep === 3}
          <div class="bg-surface-600 rounded-sm px-3 py-2 font-medium text-neutral-100">
            {selected.label}
          </div>
        {:else}
          <DropdownNoSearch
            width="min-w-[200px]"
            {options}
            bind:selected
            on:select={handleSelect}
            placeholder="Select Plan"
          />
        {/if}
      </div>
    </div>

    <!-- Dynamic Content Area -->
    <div class="mx-auto mb-8 w-full" class:max-w-2xl={!(currentStep === 2 && showPromoCode)}>
      {#if currentStep === 1}
        <HubDetails {formData} {handleInputChange} {hubFormError} type={'secondary'} />
      {:else if currentStep === 2}
        <CardDetails
          bind:this={cardDetailsComponent}
          {formData}
          {handleInputChange}
          on:viewChange={handleCardViewChange}
          bind:customerId
          {paymentMethodId}
          {isCardDetailsAdded}
          {showPromoCode}
          {cardDetailsView}
          {isPaymentProcessing}
          {nextStep}
          {prevStep}
          bind:promoCode
          {promoError}
          {promoSuccessMsg}
          {isApplyingPromo}
          {isPromoApplied}
          {handleApplyPromo}
          {trialStartDate}
          {trialEndDate}
          {amountAfterTrial}
          {promoAppliedValue}
        />
      {:else if currentStep === 3}
        <TeamDetails
          bind:this={teamDetailsComponent}
          {teamdata}
          on:change={handleTeamDataChange}
          type={'secondary'}
          {inviteCount}
          {formData}
        />
      {/if}
      <!-- Navigation Buttons -->
      <div class="mx-auto mt-10 mb-8 w-full max-w-2xl justify-center">
        {#if currentStep === 1}
          <!-- Step 1: Continue only -->
          <div class=" flex">
            <div class="mr-40 ml-25 flex-1">
              <Button variant="filled-primary" size="medium" className="w-full" on:click={nextStep}>
                Continue
              </Button>
            </div>
          </div>
        {:else if currentStep === 3}
          <!-- Step 3: Skip + Previous + Finish Setup -->
          <div class="flex w-full items-center justify-between">
            <!-- "I'll add later" on the left side -->
            <button
              class="text-sm text-gray-400 transition-colors hover:text-gray-300"
              on:click={() => {
                handleFinalSetup('skip');
              }}
            >
              I'll add later
            </button>

            <!-- Button group on the right side -->
            <div class="flex gap-3">
              <Button variant="filled-secondary" size="medium" on:click={prevStep}>Previous</Button>
              <Button
                variant="filled-primary"
                size="medium"
                on:click={() => {
                  handleFinalSetup('finish');
                }}>Finish Setup</Button
              >
            </div>
          </div>
        {/if}
      </div>
    </div>
  </div>
</div>

{#if showProcessingModal}
  <Modal width="max-w-xl" on:close={() => (showProcessingModal = false)}>
    <PaymentProcessingModal
      title="Activating Your Trial"
      description="Please don’t close this window. We’re setting up your hub and activating your trial. This will only take a moment."
      on:close={() => (showProcessingModal = false)}
    />
  </Modal>
{/if}

<style>
  .gradient-text {
    background: linear-gradient(180deg, #11adf0 0%, #6147ff 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    text-fill-color: transparent;
  }
</style>
