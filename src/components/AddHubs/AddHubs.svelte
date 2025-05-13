<script lang="ts">
  import CloseIcon from '@/assets/icons/CloseIcon.svelte';
  import Button from '@/ui/Button/Button.svelte';
  import Input from '@/ui/Input/Input.svelte';
  import Textarea from '@/ui/Textarea/Textarea.svelte';
  import { notification } from '../Toast';
  import { hubsService } from '@/services/hubs.service';

  export let onClose: () => void;
  export let hubId: any;
  export let onSuccess: () => void;

  // Form data with TypeScript interface
  interface FormData {
    workspaceName: string;
    summary: string;
  }

  // Error object with the same keys as FormData
  interface FormErrors {
    [key: string]: string;
  }

  let formData: FormData = {
    workspaceName: '',
    summary: '',
  };

  let errors: FormErrors = {};
  let isLoading = false;

  // Validate form fields
  function validateForm(): boolean {
    const newErrors: FormErrors = {};

    // Validation rules
    if (!formData.workspaceName.trim()) {
      newErrors.workspaceName = 'Please enter your workspace name.';
    }

    errors = newErrors;
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit() {
    if (!validateForm()) return;

    try {
      isLoading = true;
      const response = await hubsService.createWorkspace({
        id: hubId,
        name: formData.workspaceName.trim(),
        description: formData.summary.trim(),
      });
      const workspaceName = response?.data.name ?? formData.workspaceName.trim();
      notification.success(`"${workspaceName}" workspace is created successfully.`);
      onSuccess();
      onClose();
    } catch (error: any) {
      notification.error('Failed to create new workspace. Please try again.');
    } finally {
      isLoading = false;
    }
  }
</script>

<div class="bg-surface-600 rounded-2xl p-6">
  <div class="flex items-center justify-between">
    <h2 class="text-fs-ds-20 font-fw-ds-500 font-inter text-neutral-50">Add Workspace</h2>
    <div on:click={onClose} class="cursor-pointer">
      <CloseIcon />
    </div>
  </div>

  <p class="text-fs-ds-14 font-fw-ds-300 font-inter mb-4 text-neutral-100">
    Give your workspace a name that reflects its purpose.
  </p>

  <form on:submit|preventDefault={handleSubmit} class="space-y-4">
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
      <Button variant="filled-primary" size="medium" type="submit" disabled={isLoading}>Save</Button
      >
    </div>
  </form>
</div>
