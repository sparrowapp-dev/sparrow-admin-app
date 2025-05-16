<script lang="ts">
  // ─── IMPORTS ──────────────────────────────────────────
  import CloseIcon from '@/assets/icons/CloseIcon.svelte';
  import { notification } from '@/components/Toast';
  import PopupDropdown from '@/components/ReusableDropdown/PopupDropdown.svelte';
  import { hubsService } from '@/services/hubs.service';
  import Button from '@/ui/Button/Button.svelte';
  import Input from '@/ui/Input/Input.svelte';
  import Textarea from '@/ui/Textarea/Textarea.svelte';
  import EmailInvite from '../../../components/EmailInvite/EmailInvite.svelte';
  import InvitePopupHubIcon from '@/assets/icons/InvitePopupHubIcon.svelte';

  // ─── PROPS ────────────────────────────────────────────
  export let onClose: () => void;
  export let onSuccess: () => void;
  export let data: any;
  export let hubId;
  export let modalVariants: {
    isEditWorkspaceModalOpen: boolean;
    isMakeItPublicModalOpen: boolean;
    isDeleteWorkspaceModalOpen: boolean;
    isInviteModal: boolean;
  };
  export let params;

  // ─── TYPES ────────────────────────────────────────────
  interface FormData {
    workspaceName: string;
    summary: string;
    emails: string[];
    role: string;
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
    summary: data.summary ?? '',
    emails: [],
    role: '',
    publishWorkspaceName: '',
    deleteworkspaceName: '',
  };
  let errors: FormErrors = {};

  // ─── VALIDATION ───────────────────────────────────────
  function validateForm(): boolean {
    const newErrors: FormErrors = {};

    if (!formData.workspaceName.trim()) {
      newErrors.workspaceName = 'Workspace name cannot be empty. Please enter the workspace name.';
    }

    if (modalVariants.isInviteModal) {
      if (formData.emails.length < 1) {
        newErrors.emptyEmailList = 'Add at least one email to invite.';
      }
      if (!roles.find((r) => r.value === formData.role)) {
        newErrors.roleError = 'Select a valid role.';
      }
    }

    if (modalVariants.isDeleteWorkspaceModalOpen && formData.deleteworkspaceName !== data?.title) {
      newErrors.deleteNameMismatchError = 'Workspace name does not match.';
    }
    if (modalVariants.isMakeItPublicModalOpen && formData.publishWorkspaceName !== data?.title) {
      newErrors.publishnameMismatchError = 'Workspace name does not match';
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
        notification.success(`"${formData.workspaceName}" is now public.`);
      } else if (modalVariants.isDeleteWorkspaceModalOpen) {
        // Handle deleting workspace
        const response = await hubsService.deleteWorkspace({
          params: { workspaceId: params, hubId: hubId },
        });
        notification.success(
          `"Workspace "${formData.workspaceName}" has been deleted successfully.`,
        );
      } else if (modalVariants.isInviteModal) {
        // Handle inviting collaborators
        const response = await hubsService.inviteCollaborators({
          params: { workspaceId: params, hubId: hubId },
          data: { users: formData?.emails, role: formData?.role },
        });
        notification.success(`Invite sent successfully.`);
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
        notification.error('Failed to send invite. Please try again.');
      }
    } finally {
      isLoading = false;
    }
  }
</script>

<div class="bg-surface-600 rounded-md p-6">
  <!-- Edit Workspace Modal -->
  {#if modalVariants.isEditWorkspaceModalOpen}
    <div class="flex items-center justify-between">
      <h2 class="text-fs-ds-20 font-fw-ds-500 font-inter text-neutral-50">Edit WorkSpace</h2>
      <button type="button" on:click={onClose} class="cursor-pointer">
        <CloseIcon />
      </button>
    </div>

    <p class="text-fs-ds-14 font-fw-ds-300 font-inter mb-4 text-neutral-100">
      Edit your workspace name to reflect its purpose
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
      <h2 class="text-fs-ds-20 font-fw-ds-500 font-inter text-neutral-50">Publish WorkSpace</h2>
      <button type="button" on:click={onClose} class="cursor-pointer">
        <CloseIcon />
      </button>
    </div>
    <span class="flex flex-col gap-1">
      <p class="text-fs-ds-14 font-fw-ds-300 font-inter text-neutral-200">
        Publish "{data.title}" Workspace
      </p>
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
            >
              Terms of services
            </button>
            and
            <button
              type="button"
              class="leading-lh-ds-130 font-fw-ds-400 cursor-pointer text-neutral-200 underline underline-offset-2 hover:text-neutral-50"
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
      <span class="font-inter text-fs-ds-12 leading-lh-ds-150 font-neutral-400 font-light"
        ><button
          class="cursor-pointer text-neutral-200 underline underline-offset-2 hover:text-neutral-50"
          >Learn more</button
        > how public workspaces work</span
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
      <h2 class="text-fs-ds-20 font-fw-ds-500 font-inter text-neutral-50">Delete WorkSpace</h2>
      <button type="button" on:click={onClose} class="cursor-pointer">
        <CloseIcon />
      </button>
    </div>
    <span class="mb-1 flex flex-col gap-0.5">
      <p class="text-fs-ds-14 font-fw-ds-300 font-inter text-neutral-200">
        Enter workspace name to confirm <span class="ml-1 text-red-400">*</span>
      </p>

      <p class="font-inter leading-lh-ds-150 text-fs-ds-12 pr-2 text-left text-neutral-400">
        Everything in {data.title} Workspace will be permanently removed, all contributors will lose
        access. This action cannot be undone.
      </p></span
    >

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
          <span class="font-inter text-fs-ds-14 leading-lh-ds-143 font-fw-ds-400 text-neutral-50"
            >{data?.hubName}</span
          >
        </div>
        <div class="mt-6 flex items-center justify-end gap-3">
          <Button variant="filled-secondary" size="medium" on:click={onClose}>Cancel</Button>
          <Button variant="filled-tertiary" size="medium" type="submit" disabled={isLoading}>
            Delete WorkSpace
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

    <form on:submit|preventDefault={handleSubmit} class="space-y-4">
      <EmailInvite
        label="Invite by email"
        id="emails"
        placeholder="Enter email ID"
        maxHeight="76px"
        required={true}
        desc="You can add multiple emails"
        bind:emails={formData.emails}
        errorMessage={errors.emptyEmailList}
      />

      <PopupDropdown
        label="Select Role"
        id="roleDropdown"
        placeholder="Role"
        options={roles}
        bind:selected={formData.role}
        errorMessage={errors.roleError}
      />
      <div class="flex items-center gap-1 py-1 pr-1 pl-2">
        <div
          class="bg-surface-100 flex h-[24px] w-[24px] items-center justify-center rounded-[100px]"
        >
          <InvitePopupHubIcon />
        </div>
        <h2 class="font-inter font-fw-ds-400 text-fs-ds-12 leading-lh-ds-130 text-neutral-50">
          {data?.hubName}
        </h2>
      </div>

      <div class="mt-6 flex w-full items-center justify-end gap-3">
        <Button variant="filled-secondary" size="medium" on:click={onClose}>Cancel</Button>
        <Button variant="filled-primary" size="medium" type="submit" disabled={isLoading}>
          Save
        </Button>
      </div>
    </form>
  {/if}
</div>
