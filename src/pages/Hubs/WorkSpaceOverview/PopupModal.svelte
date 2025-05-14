<script lang="ts">
  // ─── IMPORTS ──────────────────────────────────────────
  import CloseIcon from '@/assets/icons/CloseIcon.svelte';
  import { notification } from '@/components/Toast';
  import PopupDropdown from '@/components/ReusableDropdown/PopupDropdown.svelte';
  import { hubsService } from '@/services/hubs.service';
  import Button from '@/ui/Button/Button.svelte';
  import Input from '@/ui/Input/Input.svelte';
  import Textarea from '@/ui/Textarea/Textarea.svelte';
  import EmailInvite from './EmailInvite.svelte';
  import { topdata } from './dummyData';
  import { get } from 'svelte/store';

  // ─── PROPS ────────────────────────────────────────────
  export let onClose: () => void;
  export let onSuccess: () => void;
  export let data: any;
  export let modalVariants: {
    isEditWorkspaceModalOpen: boolean;
    isMakeItPublicModalOpen: boolean;
    isDeleteWorkspaceModalOpen: boolean;
    isInviteModal: boolean;
  };

  // ─── TYPES ────────────────────────────────────────────
  interface FormData {
    workspaceName: string;
    summary: string;
    emails: string[];
    role: string;
    deleteworkspaceName: string;
  }

  interface FormErrors {
    [key: string]: string;
  }

  // ─── CONSTANTS ────────────────────────────────────────
  const roles = [
    {
      value: 'Admin',
      desc: 'Manage workspace resources and members. Add, edit, and remove resources, as well as invite or remove members.',
    },
    {
      value: 'Editor',
      desc: 'Create and modify resources within a workspace.',
    },
    {
      value: 'Manager',
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

    if (
      modalVariants.isDeleteWorkspaceModalOpen &&
      formData.deleteworkspaceName !== formData.workspaceName
    ) {
      newErrors.deleteNameMismatchError = 'Workspace name does not match.';
    }

    errors = newErrors;
    return Object.keys(newErrors).length === 0;
  }

  // ─── SUBMIT HANDLER ───────────────────────────────────
  async function handleSubmit() {
    if (!validateForm()) return;

    isLoading = true;

    try {
      const response = await hubsService.createWorkspace({
        id: topdata.id,
        name: formData.workspaceName.trim(),
        description: formData.summary.trim(),
      });

      const createdName = response?.data?.name ?? formData.workspaceName.trim();
      notification.success(`"${createdName}" workspace created successfully.`);
      onSuccess();
      onClose();
    } catch (error: any) {
      notification.error('Failed to create workspace. Please try again.');
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
        hasError={!!errors.workspaceName}
        errorMessage={errors.workspaceName || ''}
        bind:value={formData.workspaceName}
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
    <span class="mb-0.5 flex flex-col gap-0.5">
      <p class="text-fs-ds-14 font-fw-ds-300 font-inter text-neutral-200">
        Enter workspace name to confirm <span class="ml-1 text-red-400">*</span>
      </p>

      <p class="font-inter leading-lh-ds-150 text-fs-ds-12 text-left text-neutral-400">
        Everything in {data.title} Workspace will be permanently removed, all contributors will lose
        access. This action cannot be undone.
      </p></span
    >

    <form on:submit|preventDefault={handleSubmit} class="space-y-6">
      <Input
        id="workspaceName"
        name="workspaceName"
        placeholder="Enter the workspace name"
        required={true}
        hasError={!!errors.workspaceName}
        errorMessage={errors.workspaceName || ''}
        bind:value={formData.workspaceName}
      />

      <div class="mt-6 flex w-full items-center justify-end gap-3">
        <Button variant="filled-secondary" size="medium" on:click={onClose}>Cancel</Button>
        <Button variant="filled-tertiary" size="medium" type="submit" disabled={isLoading}>
          Delete WorkSpace
        </Button>
      </div>
    </form>

    <!-- Default Modal (Invite Members) -->
  {:else}
    <div class="flex items-center justify-between">
      <h2 class="text-fs-ds-20 font-fw-ds-500 font-inter text-neutral-50">Invite Members</h2>
      <button type="button" on:click={onClose} class="cursor-pointer">
        <CloseIcon />
      </button>
    </div>

    <p class="text-fs-ds-14 font-fw-ds-300 font-inter mb-4 text-neutral-100">
      Invite members to collaborate on this workspace
    </p>

    <form on:submit|preventDefault={handleSubmit} class="space-y-6">
      <EmailInvite
        label="Invite by email"
        id="emails"
        placeholder="Enter email ID"
        maxHeight="200px"
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

      <div class="mt-6 flex w-full items-center justify-end gap-3">
        <Button variant="filled-secondary" size="medium" on:click={onClose}>Cancel</Button>
        <Button variant="filled-primary" size="medium" type="submit" disabled={isLoading}>
          Save
        </Button>
      </div>
    </form>
  {/if}
</div>
