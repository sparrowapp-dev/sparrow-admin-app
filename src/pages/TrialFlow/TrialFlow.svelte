<script lang="ts">
  import TrialNav from '@/components/TrialNav/TrialNav.svelte';
  import WelcomePage from '@/assets/images/WelcomePage.png';
  import Button from '@/ui/Button/Button.svelte';
  import { HubDetails, CardDetails, TeamDetails } from '@/components/TrialFlow';
  import Modal from '@/components/Modal/Modal.svelte';
  import PaymentProcessingModal from '@/components/PaymentProcessingModal/PaymentProcessingModal.svelte';
  import { onMount } from 'svelte';
  import TrialFlowViewModel from './TrialFlow.ViewModel';
  import { billingService } from '@/services/billing.service';
  import { handleStripePaymentConfirmation, initializeStripe } from '@/utils/stripeUtils';
  import { initializeStripeSocket } from '@/utils/socket.io.utils';
  import { API_BASE_URL } from '@/constants/environment';
  import { notification } from '@/components/Toast';
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
  let trialPeriod;
  let name;
  let teamDetailsComponent;

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

  function handleCardViewChange(event) {
    cardDetailsView = event.detail;
  }

  async function nextStep() {
    // Special handling for step 2
    if (currentStep == 1) {
      if (formData.hubName === '') {
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
          formDataToSend.append('isTrialHub', true);
          formDataToSend.append('trialId', trailData?.data?._id);
          const createdHub = await _viewModel.createTrialHub(formDataToSend);
          if (createdHub?.isSuccessful) {
            isHubCreated = true;
            createdHubId = createdHub.data.data._id;
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
        const { team } = data;
        console.log('Payment success team:', team);
        let formatTeamData: { email: string; role: string }[] = [];
        let userCount = 1;
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
          isProcessing = false;
          showProcessingModal = false;

          // Set data for success modal
          selectedPlanDetails = {
            fromPlan: 'Community',
            toPlan: 'Standard',
            hubName: team?.name || '',
            nextBilling: team?.billing?.current_period_end,
          };
          await _viewModel.sendConfirmationEmail(trailData?.data?._id, formatTeamData.length + 1);
          navigate(
            `/trialsuccess?hub=${team?.name}&users=${userCount}&trialstart=${trialstart}&trialend=${trialend}`,
            { replace: true },
          );
        }, 5000);

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
    const metadata = {
      hubId: createdHubId,
      userCount: triggerPoint === 'finish' ? teamdata.length.toString() : '1',
      planName: 'Standard',
    };
    const result = await billingService.createSubscription({
      customerId,
      priceId,
      paymentMethodId: paymentMethodId,
      metadata,
      trialPeriodDays: trailData?.data?.trialPeriod || 0,
      seats: triggerPoint === 'finish' ? teamdata.length : 1,
    });
    console.log('Subscription result:', result);
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
  onMount(async () => {
    const params = new URLSearchParams(window.location.search);
    const trialId = params.get('trialId');
    name = params.get('name');
    const response = await _viewModel.getTrialDetails(trialId);
    const pricingResponse = await _viewModel.getPricingDetails();
    if (pricingResponse.isSuccessful && pricingResponse.data?.data) {
      pricingDetails = pricingResponse.data.data;
      priceId = pricingDetails?.plans[0]?.billing[0]?.providers?.stripe ?? '';
    }
    if (response?.isSuccessful) {
      trailData = response.data;
      inviteCount = trailData?.data?.inviteCount ?? 0;
      trialPeriod = Math.round(trailData?.data?.trialPeriod / 30);
      isHubCreated = trailData?.data?.isHubCreated || false;
      createdHubId = trailData?.data?.createdHubId || '';
      if (isHubCreated) {
        const hubDetails = await _viewModel.getHubDetails(createdHubId);
        if (hubDetails?.isSuccessful) {
          formData.hubName = hubDetails.data.data.name || '';
          formData.hubUrl = getSubdomainFromHubUrl(hubDetails.data.data.hubUrl) || '';
        } else {
          console.error('Failed to fetch hub details:', hubDetails);
        }
      } else {
        formData.hubName = trailData?.data?.companyName || '';
      }
    }
    // Initialize Stripe
    stripe = await initializeStripe();

    // Set up socket connection for payment events
  });
</script>

<TrialNav />

<div
  class="flex min-h-screen items-start justify-center bg-cover bg-center bg-no-repeat p-4 pt-20"
  style="background-image: url('{WelcomePage}')"
>
  <div class="padding-y-14 mx-auto flex w-full max-w-2xl flex-col gap-10">
    <!-- Fixed Header Section -->
    <div class="text-center text-neutral-50">
      <h1 class="text-fs-ds-42 font-fw-ds-300 font-aileron text-neutral-50">
        Welcome to <span class="gradient-text">Sparrow</span>, {name}
      </h1>
      <p class="text-fs-ds-18 text-neutral-200">
        We're excited to have you on board! Let's quickly set up your hub so you can start exploring
        all the features of your {trialPeriod}-month free trial.
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

    <!-- Dynamic Content Area -->
    <div class="mb-8 w-full">
      {#if currentStep === 1}
        <HubDetails {formData} {handleInputChange} {hubFormError} />
      {:else if currentStep === 2}
        <CardDetails
          bind:this={cardDetailsComponent}
          {formData}
          {handleInputChange}
          on:viewChange={handleCardViewChange}
          bind:customerId
          {paymentMethodId}
          {isCardDetailsAdded}
        />
      {:else if currentStep === 3}
        <TeamDetails
          bind:this={teamDetailsComponent}
          {teamdata}
          on:change={handleTeamDataChange}
          {inviteCount}
          {formData}
        />
      {/if}
    </div>

    <!-- Navigation Buttons -->
    {#if currentStep === 1}
      <!-- Step 1: Continue only -->
      <div class="-mt-10 mb-8 flex w-full">
        <div class="mr-40 ml-25 flex-1">
          <Button variant="filled-primary" size="medium" className="w-full" on:click={nextStep}>
            Continue
          </Button>
        </div>
      </div>
    {:else if currentStep === 2}
      <!-- Step 2: Previous + Next/Continue -->
      <div class="-mt-14 mb-8 flex gap-3">
        <div class="flex-1">
          <Button variant="filled-secondary" size="medium" className="w-full" on:click={prevStep}>
            Previous
          </Button>
        </div>
        <div class="flex-1">
          <Button
            disabled={isPaymentProcessing}
            variant="filled-primary"
            size="medium"
            className="w-full"
            on:click={async () => {
              isPaymentProcessing = true;
              await nextStep();
              isPaymentProcessing = false;
            }}
          >
            {cardDetailsView === 'cardDetails' ? 'Next' : 'Continue'}
          </Button>
        </div>
      </div>
    {:else if currentStep === 3}
      <!-- Step 3: Skip + Previous + Finish Setup -->
      <!-- Step 3: Skip + Previous + Finish Setup -->
      <div class="-mt-10 mb-8 flex w-full items-center justify-between">
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
