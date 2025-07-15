<script lang="ts">
  import { onMount, createEventDispatcher } from 'svelte';
  import CloseIcon from '@/assets/icons/CloseIcon.svelte';
  import Button from '@/ui/Button/Button.svelte';
  import ChipInput from '@/ui/ChipInput/ChipInput.svelte';
  import RoleDropdown from '../RoleDropdown/RoleDropdown.svelte';
  import CheckboxDropdown from '../CheckboxDropdown/CheckboxDropdown.svelte';
  import { notification } from '@/components/Toast';
  import { hubsService } from '@/services/hubs.service';
  import ProfileIcon from '@/assets/icons/ProfileIcon.svelte';
  import { captureEvent } from '@/utils/posthogConfig';
  const dispatch = createEventDispatcher();
  export let onClose: () => void;
  export let hubId: any;
  export let hubName: string;
  export let onSuccess: () => void;
  export let hubPlan: string;

  let emails: string[] = [];
  let selectedRole: { id: string; name: string } = { id: '', name: '' };
  let selectedWorkspaces: { id: string; name: string }[] = [];
  let workspaces: { id: string; name: string }[] = [];

  let isSubmitting = false;
  let emailError = '';
  let roleError = '';
  let workspacesError = '';
  let hasInvalidEmails = false;

  // Reference to the ChipInput component
  let chipInputComponent;

  // Fetch workspaces for the hub
  onMount(async () => {
    try {
      const response = await hubsService.getHubWorkspaces({
        hubId,
        limit: 500,
      });

      if (response && response.data && response.data.hubs) {
        workspaces = response?.data?.hubs?.map((ws) => ({
          id: ws.id,
          name: ws.name,
        }));
      }
    } catch (error) {
      console.error('Failed to fetch workspaces:', error);
    }
  });

  function handleEmailsChange(event) {
    emails = event.detail;
    emailError = '';
    dispatch('emailsChange', emails?.length);
  }

  function handleEmailsValidity(event) {
    hasInvalidEmails = !event.detail.isValid;
    if (hasInvalidEmails) {
      emailError = 'Please check and enter correct email address.';
    } else {
      emailError = '';
    }
  }

  function handleRoleChange(event) {
    selectedRole = event.detail;
    roleError = '';
    // Clear workspace error when role changes
    workspacesError = '';
  }

  function handleWorkspacesChange(event) {
    selectedWorkspaces = event.detail;
    workspacesError = '';
  }

  function validateForm(): boolean {
    let isValid = true;

    // Validate emails
    if (emails.length === 0) {
      emailError = 'Please enter email ID.';
      isValid = false;
    } else if (hasInvalidEmails) {
      // Check for invalid emails
      emailError = 'Please check and enter correct email address.';
      isValid = false;
    }

    // Validate role selection
    if (!selectedRole.id) {
      roleError = 'Please select role of the user.';
      isValid = false;
    }

    // Validate workspaces if role is editor or viewer
    if (selectedRole.id !== 'admin' && selectedRole.id !== '' && selectedWorkspaces.length === 0) {
      workspacesError = 'Please select at least one workspace';
      isValid = false;
    }

    return isValid;
  }

  async function handleSubmit() {
    if (!validateForm()) return;

    isSubmitting = true;

    try {
      // Create the request payload
      const payload = {
        users: emails,
        role: selectedRole.id,
        teamId: hubId,
      };

      // Add workspaces if role is not admin
      if (selectedRole.id !== 'admin') {
        payload['workspaces'] = selectedWorkspaces;
      }

      // Call the API to invite users
      await hubsService.inviteUsers(payload);
      captureUserSendInvites();
      notification.success('Invite sent successfully.');
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error inviting users:', error);
      if (error.message === 'An invite has already been sent to this email.') {
        notification.error('An invite has already been sent to this email.');
      } else if (error.message === 'Hub Member already Exist.') {
        notification.error('User already in hub.');
      } else if (error?.message === 'Plan limit reached') {
        dispatch('openUpgradePlan');
      } else if (
        error.message ===
          'Invite failed. Please complete payment authentication to send invites.' ||
        error.message === 'Invite failed. Please resolve your payment issue to send invites.' ||
        error.message === 'Invite blocked due to your scheduled downgrade.'
      ) {
        notification.error(error.message);
      } else {
        notification.error('Failed to send invite. Please try again.');
      }
    } finally {
      isSubmitting = false;
    }
  }

  const captureUserSendInvites = () =>{
    const eventProperties ={
      event_source:"admin_panel",
      cta_location:"user_management"
    }
    captureEvent("admin_send_invite", eventProperties)
  }
</script>

<div class="bg-surface-700 w-full max-w-xl rounded-lg p-6">
  <div class="mb-4 flex items-start justify-between">
    <h2 class="text-fs-ds-20 font-fw-ds-500 font-inter text-neutral-50">Add People to Hub</h2>
    <button
      type="button"
      class="cursor-pointer text-neutral-300 hover:text-neutral-100"
      on:click={onClose}
    >
      <CloseIcon />
    </button>
  </div>

  <form on:submit|preventDefault={handleSubmit} class="space-y-6">
    <!-- Email Input -->
    <div>
      <label
        class="text-fs-ds-14 font-fw-ds-400 font-inter mb-1 flex items-center text-neutral-200"
      >
        Invite by email
        <span class="ml-1 text-red-400">*</span>
      </label>
      <p class="text-fs-ds-12 font-fw-ds-300 mb-2 text-neutral-400">You can add multiple emails</p>
      <ChipInput
        bind:this={chipInputComponent}
        {emails}
        on:change={handleEmailsChange}
        on:validity={handleEmailsValidity}
        hasError={!!emailError}
        errorMessage={emailError}
        placeholder="Enter email ID"
      />
    </div>

    <!-- Role Selection -->
    <div>
      <label
        class="text-fs-ds-14 font-fw-ds-400 font-inter mb-1 flex items-center text-neutral-200"
      >
        Role
        <span class="ml-1 text-red-400">*</span>
      </label>
      <RoleDropdown
        selected={selectedRole}
        on:change={handleRoleChange}
        placeholder="Select the role"
        hasError={!!roleError}
        errorMessage={roleError}
        disableValues={['member']}
      />

      {#if selectedRole.id === 'admin'}
        <p class="text-fs-ds-12 font-fw-ds-300 mt-2 text-neutral-400">
          Admins will have access to all current and future hub workspaces.
        </p>
      {/if}
    </div>

    <!-- Workspace Selection (only for editor and viewer roles) -->
    {#if selectedRole.id !== 'admin' && selectedRole.id !== ''}
      <div>
        <label
          class="text-fs-ds-14 font-fw-ds-400 font-inter mb-1 flex items-center text-neutral-200"
        >
          Specify Workspace
          <span class="ml-1 text-red-400">*</span>
        </label>
        <p class="text-fs-ds-12 font-fw-ds-300 mb-2 text-neutral-400">
          Select workspaces you would want to give access to.
        </p>
        <CheckboxDropdown
          {workspaces}
          {selectedWorkspaces}
          on:change={handleWorkspacesChange}
          hasError={!!workspacesError}
          errorMessage={workspacesError}
          placeholder="Select workspaces"
        />
      </div>
    {/if}
    {#if hubPlan !== 'Community'}
      <div class="text-fs-ds-14 font-fw-ds-300 mt-2 text-neutral-400">
        Note: Inviting a user reserves a license and may trigger a charge, unless an unused license
        is available.
      </div>
    {/if}
    <!-- Hub display -->
    <div class="border-surface-500 mt-6 flex items-center">
      <ProfileIcon />
      <div class="ml-3">
        <p class="text-fs-ds-12 font-fw-ds-400 w-[10rem] truncate text-neutral-50">{hubName}</p>
      </div>
    </div>

    <!-- Action buttons -->
    <div class="mt-6 flex justify-end gap-3">
      <Button variant="filled-secondary" size="medium" on:click={onClose} disabled={isSubmitting}>
        Cancel
      </Button>
      <Button variant="filled-primary" size="medium" type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Sending...' : 'Send Invite'}
      </Button>
    </div>
  </form>
</div>
