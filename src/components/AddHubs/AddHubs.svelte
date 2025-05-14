<script lang="ts">
  import CloseIcon from '@/assets/icons/CloseIcon.svelte';
  import Button from '@/ui/Button/Button.svelte';
  import Input from '@/ui/Input/Input.svelte';
  import Textarea from '@/ui/Textarea/Textarea.svelte';
  import FileUploadDragDrop from '../FileUploadDragDrop/FileUploadDragDrop.svelte';
  import { notification } from '../Toast';
  import { hubsService } from '@/services/hubs.service';
  import { userId } from '@/store/auth';
  import { navigate } from 'svelte-routing';

  export let onClose: () => void;
  // Form data with TypeScript interface
  interface FormData {
    hubName: string;
    summary: string;
    logoFile: File | null;
  }

  // Error object with the same keys as FormData
  interface FormErrors {
    [key: string]: string;
  }

  let formData: FormData = {
    hubName: '',
    summary: '',
    logoFile: null,
  };
  let logoPreview: string | null = null;

  let errors: FormErrors = {};
  let isLoading = false;

  // Validate form fields
  function validateForm(): boolean {
    const newErrors: FormErrors = {};

    // Validation rules
    if (!formData.hubName.trim()) {
      newErrors.hubName = 'Please enter your hub name.';
    }

    errors = newErrors;
    return Object.keys(newErrors).length === 0;
  }

  function handleFileChange(event: CustomEvent) {
    const { file, preview } = event.detail;
    formData.logoFile = file;
    logoPreview = preview;
  }

  async function handleSubmit() {
    if (!validateForm()) return;

    try {
      isLoading = true;

      // Get current user ID from store
      const currentUserId = $userId;

      if (!currentUserId) {
        notification.error('User authentication error. Please log in again.');
        return;
      }

      // Create FormData for file upload with additional fields
      const formDataToSend = new FormData();

      formDataToSend.append('name', formData.hubName.trim());
      formDataToSend.append('description', formData.summary.trim());
      formDataToSend.append('owner', currentUserId);
      formDataToSend.append('createdBy', currentUserId);

      // Format date to ISO string format (optional, server may handle this)
      const currentDate = new Date().toISOString();
      formDataToSend.append('createdAt', currentDate);

      // Add image if available
      if (formData.logoFile) {
        formDataToSend.append('image', formData.logoFile);
      }

      const response = await hubsService.createHub(formDataToSend);
      const hubName = response?.data.name ?? formData.hubName.trim();
      notification.success(`"${hubName}" hub is created successfully.`);
      onClose();
      navigate(`/hubs/workspace/${response.data._id}`);
    } catch (error: any) {
      notification.error('Failed to create new hub. Please try again.');
    } finally {
      isLoading = false;
    }
  }
</script>

<div class="bg-surface-600 rounded-lg p-6">
  <div class="flex items-start justify-between">
    <h2 class="text-fs-ds-20 font-fw-ds-500 font-inter mb-6 text-neutral-50">New Hub</h2>
    <button type="button" class="cursor-pointer" on:click={onClose}> <CloseIcon /> </button>
  </div>

  <form on:submit|preventDefault={handleSubmit} class="space-y-4">
    <Input
      label="Hub Name"
      id="hubName"
      name="hubName"
      placeholder="Enter your hub name"
      required={true}
      hasError={!!errors.hubName}
      errorMessage={errors.hubName || ''}
      bind:value={formData.hubName}
    />

    <Textarea
      label="Hub Summary"
      id="summary"
      name="summary"
      bind:value={formData.summary}
      minHeight={96}
      charLimit={100}
      placeholder="Write a short summary about your hub"
    />

    <FileUploadDragDrop
      label="Upload Logo"
      bind:value={formData.logoFile}
      bind:imagePreview={logoPreview}
      on:change={handleFileChange}
    />

    <div class="mt-6 flex w-full items-center justify-end gap-3">
      <Button variant="filled-secondary" size="medium" on:click={onClose}>Cancel</Button>
      <Button variant="filled-primary" size="medium" type="submit" disabled={isLoading}>Save</Button
      >
    </div>
  </form>
</div>
