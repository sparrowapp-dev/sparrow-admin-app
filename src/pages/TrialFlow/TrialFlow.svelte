<script>
  import TrialNav from '@/components/TrialNav/TrialNav.svelte';
  import WelcomePage from '@/assets/images/WelcomePage.png';
  import Button from '@/ui/Button/Button.svelte';
  import { HubDetails, CardDetails, TeamDetails } from '@/components/TrialFlow';
  import Modal from '@/components/Modal/Modal.svelte';
  import PaymentProcessingModal from '@/components/PaymentProcessingModal/PaymentProcessingModal.svelte';

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

    // Team emails
    teamEmails: [''],
  };
  const steps = [
    { id: 1, title: 'Name Your Hub', icon: '1' },
    { id: 2, title: 'Add Card Details', icon: '2' },
    { id: 3, title: 'Invite Team', icon: '3' },
  ];

  let showProcessingModal = false;

  function handleInputChange(field, value) {
    formData = { ...formData, [field]: value };
  }

  function handleTeamEmailChange(index, value) {
    const newEmails = [...formData.teamEmails];
    newEmails[index] = value;
    formData = { ...formData, teamEmails: newEmails };
  }

  function addTeamEmail() {
    formData = { ...formData, teamEmails: [...formData.teamEmails, ''] };
  }
  let cardDetailsView = 'cardDetails';
  let cardDetailsComponent = null;

  function handleCardViewChange(event) {
    cardDetailsView = event.detail;
  }

  function nextStep() {
    // Special handling for step 2
    if (currentStep === 2 && cardDetailsView === 'cardDetails') {
      // Add null check before calling setView
      if (cardDetailsComponent && cardDetailsComponent.setView) {
        cardDetailsComponent.setView('billingDetails');
        cardDetailsView = 'billingDetails';
      } else {
        // Fallback if component isn't ready
        cardDetailsView = 'billingDetails';
      }
    } else {
      // Normal behavior
      if (currentStep < 3) currentStep += 1;
    }
  }
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
        Welcome to <span class="gradient-text">Sparrow</span>, John
      </h1>
      <p class="text-fs-ds-18 text-neutral-200">
        We're excited to have you on board! Let's quickly set up your hub so you can start exploring
        all the features of your 2-month free trial.
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
              ? 'border-green-500 bg-green-500 text-white'
              : currentStep === step.id
                ? 'border-blue-600 bg-blue-600 text-white'
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
        <HubDetails {formData} {handleInputChange} />
      {:else if currentStep === 2}
        <CardDetails
          bind:this={cardDetailsComponent}
          {formData}
          {handleInputChange}
          on:viewChange={handleCardViewChange}
        />
      {:else if currentStep === 3}
        <TeamDetails />
      {/if}
    </div>

    <!-- Navigation Buttons -->
    {#if currentStep === 1}
      <!-- Step 1: Continue only -->
      <div class="-mt-10 flex w-full">
        <div class="mr-45 ml-20 flex-1">
          <Button variant="filled-primary" size="medium" className="w-full" on:click={nextStep}>
            Continue
          </Button>
        </div>
      </div>
    {:else if currentStep === 2}
      <!-- Step 2: Previous + Next/Continue -->
      <div class="-mt-16 flex gap-3">
        <div class="flex-1">
          <Button variant="filled-secondary" size="medium" className="w-full" on:click={prevStep}>
            Previous
          </Button>
        </div>
        <div class="flex-1">
          <Button variant="filled-primary" size="medium" className="w-full" on:click={nextStep}>
            {cardDetailsView === 'cardDetails' ? 'Next' : 'Continue'}
          </Button>
        </div>
      </div>
    {:else if currentStep === 3}
      <!-- Step 3: Skip + Previous + Finish Setup -->
      <!-- Step 3: Skip + Previous + Finish Setup -->
      <div class="-mt-10 flex w-full items-center justify-between">
        <!-- "I'll add later" on the left side -->
        <button
          class="text-sm text-gray-400 transition-colors hover:text-gray-300"
          on:click={() => {}}
        >
          I'll add later
        </button>

        <!-- Button group on the right side -->
        <div class="flex gap-3">
          <Button variant="filled-secondary" size="medium" on:click={prevStep}>Previous</Button>
          <Button variant="filled-primary" size="medium" on:click={nextStep}>Finish Setup</Button>
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
