<script lang="ts">
  // ─── IMPORTS ──────────────────────────────────────────
  import CloseIcon from '@/assets/icons/CloseIcon.svelte';
  import { notification } from '@/components/Toast';
  import { hubsService } from '@/services/hubs.service';
  import Button from '@/ui/Button/Button.svelte';
  import Input from '@/ui/Input/Input.svelte';
  import Textarea from '@/ui/Textarea/Textarea.svelte';
  import ProfileIcon from '@/assets/icons/ProfileIcon.svelte';
  import RoleDropdown from '@/components/RoleDropdown/RoleDropdown.svelte';
  import ChipInput from '@/ui/ChipInput/ChipInput.svelte';
  import { onMount } from 'svelte';
  import { SPARROW_DOCS_URL, SPARROW_LAUNCH_URL } from '@/constants/environment';

  // ─── PROPS ────────────────────────────────────────────
  export let onClose: () => void;
  export let onSuccess: () => void;
  export let data: any;
  export let hubId;
  export let workspaceId;
  export let modalVariants: {
    isEditWorkspaceModalOpen: boolean;
    isMakeItPublicModalOpen: boolean;
    isDeleteWorkspaceModalOpen: boolean;
    isInviteModal: boolean;
  };
  export let params;
  const baseUrl = SPARROW_LAUNCH_URL;
  let workspaces: { id: string; name: string }[] = [];
  onMount(async () => {
    if (modalVariants.isEditWorkspaceModalOpen) {
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
    }
  });
  // ─── TYPES ────────────────────────────────────────────
  interface FormData {
    workspaceName: string;
    summary: string;
    emails: string[];
    selectedRole: { id: string; name: string };
    publishWorkspaceName: string;
    deleteworkspaceName: string;
  }

  interface FormErrors {
    [key: string]: string;
  }

  // ─── CONSTANTS ────────────────────────────────────────
  const roles = [
    {
      value: 'admin',
      desc: 'Manage workspace resources and members. Add, edit, and remove resources, as well as invite or remove members.',
    },
    {
      value: 'editor',
      desc: 'Create and modify resources within a workspace.',
    },
    {
      value: 'viewer',
      desc: 'View resources in a workspace without making changes.',
    },
  ];

  // ─── STATE ────────────────────────────────────────────
  let isLoading = false;
  let formData: FormData = {
    workspaceName: data.title ?? '',
    summary: data.description ?? '',
    emails: [],
    selectedRole: { id: '', name: '' },
    publishWorkspaceName: '',
    deleteworkspaceName: '',
  };
  let errors: FormErrors = {};
  let chipInputComponent;
  // ─── VALIDATION ───────────────────────────────────────
  function validateForm(): boolean {
    const newErrors: FormErrors = {};

    if (!formData.workspaceName.trim()) {
      newErrors.workspaceName = 'Workspace name cannot be empty. Please enter the workspace name.';
    }
    if (
      modalVariants.isEditWorkspaceModalOpen &&
      formData.workspaceName.trim() &&
      workspaces.some((ws) => ws.name === formData.workspaceName.trim() && ws.id !== workspaceId)
    ) {
      newErrors.workspaceName = 'Workspace with same name already exists';
    }

    if (modalVariants.isInviteModal) {
      if (formData.emails.length === 0) {
        newErrors.emailError = 'Please enter email ID.';
      } else if (hasInvalidEmails) {
        newErrors.emailError = 'Please check and enter correct email address.';
      }

      // Validate role selection
      if (!formData.selectedRole.id) {
        newErrors.roleError = 'Please select role of the user.';
      }
    }

    if (modalVariants.isDeleteWorkspaceModalOpen) {
      if (!formData.deleteworkspaceName.trim()) {
        newErrors.deleteNameMismatchError =
          'Workspace name cannot be empty. Please enter the workspace name.';
      } else if (formData.deleteworkspaceName !== data?.title) {
        newErrors.deleteNameMismatchError = 'Workspace name does not match.';
      }
    }
    if (modalVariants.isMakeItPublicModalOpen && formData.publishWorkspaceName !== data?.title) {
      if (!formData.publishWorkspaceName.trim()) {
        newErrors.publishnameMismatchError =
          'Workspace name cannot be empty. Please enter the workspace name.';
      } else if (formData.publishWorkspaceName !== data?.title) {
        newErrors.publishnameMismatchError = "Workspace name doesn't  match";
      }
    }

    errors = newErrors;
    return Object.keys(newErrors).length === 0;
  }

  // ─── SUBMIT HANDLER ───────────────────────────────────
  async function handleSubmit() {
    if (!validateForm()) return;
    isLoading = true;

    try {
      // Handle different services based on modal variant
      if (modalVariants.isEditWorkspaceModalOpen) {
        // Handle editing workspace
        const response = await hubsService.editWorkspace({
          params: { workspaceId: params, hubId: hubId },
          data: { name: formData.workspaceName.trim(), description: formData.summary.trim() },
        });
        const updatedName = response?.data?.name ?? formData.workspaceName.trim();
        notification.success(`"${updatedName}" Workspace updated successfully.`);
      } else if (modalVariants.isMakeItPublicModalOpen) {
        // Handle making workspace public
        const response = await hubsService.makeitpublic({
          params: { workspaceId: params, hubId: hubId },
          data: { workspaceType: data?.WorkspaceType === 'PRIVATE' ? 'PUBLIC' : 'PRIVATE' },
        });
        notification.success(`Workspace Published. "${formData.workspaceName}" is now public.`);
      } else if (modalVariants.isDeleteWorkspaceModalOpen) {
        // Handle deleting workspace
        const response = await hubsService.deleteWorkspace({
          params: { workspaceId: params, hubId: hubId },
        });
        notification.success(
          `Workspace "${formData.workspaceName}" has been deleted successfully.`,
        );
      } else if (modalVariants.isInviteModal) {
        // Handle inviting collaborators
        const payload = {
          users: formData.emails,
          role: formData.selectedRole.id,
          teamId: hubId,
        };
        if (formData.selectedRole.id !== 'admin') {
          payload['workspaces'] = [{ id: workspaceId, name: data?.title }];
        }

        // Call the API to invite users
        await hubsService.inviteUsers(payload);

        notification.success('Invite sent successfully.');
      }

      onSuccess();
      onClose();
    } catch (error: any) {
      // Handle different error messages based on the action
      if (modalVariants.isEditWorkspaceModalOpen) {
        notification.error('Failed to update workspace. Please try again.');
      } else if (modalVariants.isMakeItPublicModalOpen) {
        notification.error('Failed to make workspace public. Please try again.');
      } else if (modalVariants.isDeleteWorkspaceModalOpen) {
        notification.error(
          `Failed to delete "${formData.workspaceName}" workspace. Please try again.`,
        );
      } else if (modalVariants.isInviteModal) {
        if (error.message === 'An invite has already been sent to this email.') {
          notification.error('An invite has already been sent to this email.');
        } else if (error.message === 'Hub Member already Exist.') {
          notification.error('User already in hub.');
        } else {
          notification.error('Failed to send invite. Please try again.');
        }
      }
    } finally {
      isLoading = false;
    }
  }
  let hasInvalidEmails = false;
  function handleEmailsChange(event) {
    formData.emails = event.detail;
    errors.emailError = '';
  }
  function handleEmailsValidity(event) {
    hasInvalidEmails = !event.detail.isValid;
    if (hasInvalidEmails) {
      errors.emailError = 'Please check and enter correct email address.';
    } else {
      errors.emailError = '';
    }
  }
  function handleRoleChange(event) {
    formData.selectedRole = event.detail;
    errors.roleError = '';
  }
</script>

<div class="bg-surface-600 rounded-md p-6">
  <!-- Edit Workspace Modal -->
  {#if modalVariants.isEditWorkspaceModalOpen}
    <div class="flex items-center justify-between">
      <h2 class="text-fs-ds-20 font-fw-ds-500 font-inter text-neutral-50">Edit Workspace</h2>
      <button type="button" on:click={onClose} class="cursor-pointer">
        <CloseIcon />
      </button>
    </div>

    <p class="text-fs-ds-14 font-fw-ds-300 font-inter mb-4 text-neutral-100">
      Edit your workspace name that reflects its purpose.
    </p>

    <form on:submit|preventDefault={handleSubmit} class="space-y-6">
      <Input
        label="Workspace Name"
        id="workspaceName"
        name="workspaceName"
        placeholder="Enter your workspace name"
        required={true}
        hasError={!!errors.workspaceName}
        errorMessage={errors.workspaceName || ''}
        bind:value={formData.workspaceName}
      />

      <Textarea
        label="Workspace Summary"
        id="summary"
        name="summary"
        bind:value={formData.summary}
        minHeight={96}
        charLimit={100}
        placeholder="Write a small summary about your workspace"
      />

      <div class="mt-6 flex w-full items-center justify-end gap-3">
        <Button variant="filled-secondary" size="medium" on:click={onClose}>Cancel</Button>
        <Button variant="filled-primary" size="medium" type="submit" disabled={isLoading}>
          Save
        </Button>
      </div>
    </form>

    <!-- Publish Workspace Modal -->
  {:else if modalVariants.isMakeItPublicModalOpen}
    <div class="mb-6 flex items-center justify-between">
      <h2 class="text-fs-ds-20 font-fw-ds-500 font-inter text-neutral-50">Publish Workspace</h2>
      <button type="button" on:click={onClose} class="cursor-pointer">
        <CloseIcon />
      </button>
    </div>
    <span class="flex flex-col gap-1">
      <span class="text-fs-ds-14 font-fw-ds-300 font-inter flex text-neutral-200">
        Publish
        <p class="max-w-[8rem] truncate px-2 text-ellipsis">"{data?.title}</p>
        " Workspace
      </span>
      <span class="mb-1">
        <p class="font-inter leading-lh-ds-150 text-fs-ds-12 text-left font-light text-neutral-400">
          Anyone with the link can view this workspace, but only collaborators you've added can make
          changes. Active sync collections will remain private and will not be made public. You can
          unpublish the workspace at any time to make it private again. By publishing, you agree to
          our
        </p>
        <span class="flex flex-col gap-1">
          <p class="font-inter leading-lh-ds-150 text-fs-ds-12 text-left text-neutral-400">
            <button
              type="button"
              class="leading-lh-ds-130 font-fw-ds-400 cursor-pointer text-neutral-200 underline underline-offset-2 hover:text-neutral-50"
              on:click={() => {
                const url = ` https://sparrowapp.dev/terms-of-service/`;

                // Open in a new tab
                window.open(url, '_blank');
              }}
            >
              Terms of service
            </button>
            and
            <button
              type="button"
              class="leading-lh-ds-130 font-fw-ds-400 cursor-pointer text-neutral-200 underline underline-offset-2 hover:text-neutral-50"
              on:click={() => {
                const url = `https://sparrowapp.dev/privacy-policy/`;

                // Open in a new tab
                window.open(url, '_blank');
              }}
            >
              Privacy Policy
            </button>
          </p>

          <p class="text-fs-ds-12 leading-lh-ds-130 font-inter font-light text-neutral-400">
            To proceed, type <span class="text-neutral-200">workspace name</span> below.
          </p></span
        ></span
      >
    </span>

    <form on:submit|preventDefault={handleSubmit} class="space-y-1">
      <Input
        id="workspaceName"
        name="workspaceName"
        placeholder="Type workspace name to proceed"
        required={true}
        hasError={!!errors.publishnameMismatchError}
        errorMessage={errors.publishnameMismatchError || ''}
        bind:value={formData.publishWorkspaceName}
      />
      <span class="font-inter text-fs-ds-12 leading-lh-ds-150 font-fw-ds-300 text-neutral-400"
        ><button
          class="cursor-pointer text-neutral-200 underline underline-offset-2 hover:text-neutral-50"
          on:click={() => {
            const url = `${SPARROW_DOCS_URL}`;

            // Open in a new tab
            window.open(url, '_blank');
          }}>Learn more</button
        > how public workspaces work.</span
      >
      <div class="mt-6 flex w-full items-center justify-end gap-3">
        <Button variant="filled-secondary" size="medium" on:click={onClose}>Cancel</Button>
        <Button variant="filled-primary" size="medium" type="submit" disabled={isLoading}>
          Publish
        </Button>
      </div>
    </form>

    <!-- Delete Workspace Modal -->
  {:else if modalVariants.isDeleteWorkspaceModalOpen}
    <div class="mb-6 flex items-center justify-between">
      <h2 class="text-fs-ds-20 font-fw-ds-500 font-inter text-neutral-50">Delete Workspace</h2>
      <button type="button" on:click={onClose} class="cursor-pointer">
        <CloseIcon />
      </button>
    </div>
    <span class="mb-1 flex flex-col gap-0.5">
      <p class="text-fs-ds-14 font-fw-ds-300 font-inter text-neutral-200">
        Enter workspace name to confirm <span class="ml-1 text-red-400">*</span>
      </p>

      <span
        class="font-inter leading-lh-ds-150 text-fs-ds-12 items-center pr-2 text-left text-neutral-400"
      >
        Everything in

        {data.title.length > 10 ? `${data.title.slice(0, 10)}...` : data.title}

        will be permanently removed, all contributors will lose access. This action cannot be
        undone.
      </span>
    </span>

    <form on:submit|preventDefault={handleSubmit} class="space-y-2">
      <Input
        id="workspaceName"
        name="workspaceName"
        placeholder="Enter the workspace name"
        required={true}
        hasError={!!errors.deleteNameMismatchError}
        errorMessage={errors.deleteNameMismatchError || ''}
        bind:value={formData.deleteworkspaceName}
      />
      <div class="flex items-end justify-between">
        <div class="flex items-center gap-3">
          <div
            class="bg-surface-500 border-surface-50 flex h-9 w-9 items-center justify-center rounded-[133.33px] border-[1.33px]"
          >
            <span class="font-inter text-fs-ds-14 font-fw-ds-500 text-neutral-50">
              {data?.hubName?.[0]?.toUpperCase() || ''}
            </span>
          </div>
          <span
            class="font-inter text-fs-ds-14 leading-lh-ds-143 font-fw-ds-400 w-[8rem] truncate text-neutral-50"
            >{data?.hubName}</span
          >
        </div>
        <div class="mt-6 flex items-center justify-end gap-3">
          <Button variant="filled-secondary" size="medium" on:click={onClose}>Cancel</Button>
          <Button variant="filled-tertiary" size="medium" type="submit" disabled={isLoading}>
            Delete Workspace
          </Button>
        </div>
      </div>
    </form>

    <!-- Default Modal (Invite Members) -->
  {:else}
    <div class="flex items-center justify-between">
      <h2 class="text-fs-ds-20 font-fw-ds-500 font-inter mb-6 text-neutral-50">
        Add People to Workspace
      </h2>
      <button type="button" on:click={onClose} class="cursor-pointer">
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
        <p class="text-fs-ds-12 font-fw-ds-300 mb-2 text-neutral-400">
          You can add multiple emails
        </p>
        <ChipInput
          bind:this={chipInputComponent}
          emails={formData.emails}
          on:change={handleEmailsChange}
          on:validity={handleEmailsValidity}
          hasError={!!errors.emailError}
          errorMessage={errors.emailError}
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
          selected={formData.selectedRole}
          on:change={handleRoleChange}
          placeholder="Select the role"
          hasError={!!errors.roleError}
          errorMessage={errors.roleError}
        />
      </div>

      <!-- Workspace Selection (only for editor and viewer roles) -->

      <!-- Hub display -->
      <div class="border-surface-500 mt-6 flex items-center border-t pt-4">
        <ProfileIcon />
        <div class="ml-3">
          <p class="text-fs-ds-12 font-fw-ds-400 w-[10rem] truncate text-neutral-50">
            {data?.hubName}
          </p>
        </div>
      </div>

      <!-- Action buttons -->
      <div class="mt-6 flex justify-end gap-3">
        <Button variant="filled-secondary" size="medium" on:click={onClose} disabled={isLoading}>
          Cancel
        </Button>
        <Button variant="filled-primary" size="medium" type="submit" disabled={isLoading}>
          {isLoading ? 'Sending...' : 'Send Invite'}
        </Button>
      </div>
    </form>
  {/if}
</div>
