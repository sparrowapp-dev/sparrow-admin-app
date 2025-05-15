<script lang="ts">
  import { onMount } from 'svelte';
  import FileUploadDragDrop from '@/components/FileUploadDragDrop/FileUploadDragDrop.svelte';
  import { notification } from '@/components/Toast';
  import { hubsService } from '@/services/hubs.service';
  import { useLocation } from 'svelte-routing';
  import { derived } from 'svelte/store';
  import Button from '@/ui/Button/Button.svelte';
  // input
  import Input from '@/ui/Input/Input.svelte';
  import Textarea from '@/ui/Textarea/Textarea.svelte';
  // icons
  import GithubIcon from '@/assets/icons/GithubIcon.svelte';
  import LinkedinIcon from '@/assets/icons/LinkedinIcon.svelte';
  import XIcon from '@/assets/icons/XIcon.svelte';
  import PlusIcon from '@/assets/icons/PlusIcon.svelte';
  import ManageMembersIcon from '@/assets/icons/ManageMembersIcon.svelte';
  import Modal from '@/components/Modal/Modal.svelte';
  import AddWorkspace from '@/components/AddWorkspace/AddWorkspace.svelte';

  const location = useLocation();

  // State management
  let hubData = {
    id: '',
    name: '',
    description: '',
    logoFile: null,
    logoUrl: '',
    githubUrl: '',
    linkedinUrl: '',
    xUrl: '',
  };

  let originalData = { ...hubData };
  let isSaving = false;
  let params: any;
  let showModal = false;

  // Add error tracking object
  let errors = {
    name: '',
  };

  // Extract hub ID from URL
  const extractedParam = derived(location, ($location) => {
    const match = $location.pathname.match(/\/hubs\/(?:workspace|settings|members)\/([^\/]+)/);
    return match?.[1];
  });

  onMount(() => {
    extractedParam.subscribe((id) => {
      if (id) {
        params = id;
        fetchHubDetails(id);
      }
    });
  });

  // Fetch hub details
  async function fetchHubDetails(hubId: string) {
    try {
      const response = await hubsService.getHubDetails(hubId);
      if (response?.data) {
        const data = response.data;
        hubData = {
          id: data._id || data.id,
          name: data.name || '',
          description: data.description || '',
          logoFile: null,
          logoUrl: data.logo?.bufferString
            ? `data:${data.logo.mimetype};base64,${data.logo.bufferString}`
            : '',
          githubUrl: data.githubUrl || '',
          linkedinUrl: data.linkedinUrl || '',
          xUrl: data.xUrl || '',
        };
        originalData = { ...hubData };
      }
    } catch (error) {
      notification.error('Error fetching hub details');
      console.error('Error fetching hub details:', error);
    }
  }

  // Validate hub name field
  function validateHubName(name: string): boolean {
    if (!name.trim()) {
      errors.name = 'Hub name is required';
      return false;
    }

    errors.name = '';
    return true;
  }

  // Clear error when typing
  function clearError(field: string) {
    if (errors[field]) {
      errors[field] = '';
    }
  }

  // Save changes function - only send the modified field
  async function saveChanges(field: string, value: any) {
    // Don't save if the value hasn't changed
    if (originalData[field] === value) return;

    // For name field, validate before saving
    if (field === 'name') {
      if (!validateHubName(value)) {
        return; // Don't proceed if validation fails
      }
    }

    try {
      isSaving = true;

      // Create FormData with ONLY the field being updated
      const formData = new FormData();

      // Only append the field that changed
      if (field === 'logo') {
        // For logo, we send the image file or an empty file for deletion
        if (value) {
          // Normal logo upload - send the file
          formData.append('image', value);
        } else {
          // Logo deletion - send an empty blob as binary
          const emptyBlob = new Blob([], { type: 'application/octet-stream' });
          formData.append('image', emptyBlob);
        }
      } else {
        // For text fields, just send the field that changed
        formData.append(field, value);
      }

      const response = await hubsService.updateHub(params, formData);

      if (response?.data) {
        // Update the stored data
        originalData[field] = value;

        // If logo was updated, update the preview URL from the response
        if (field === 'logo' && response.data.logo?.bufferString) {
          hubData.logoUrl = `data:${response.data.logo.mimetype};base64,${response.data.logo.bufferString}`;
          originalData.logoUrl = hubData.logoUrl;
        } else if (field === 'logo' && !value) {
          // Clear the logo URL if it was deleted
          originalData.logoUrl = '';
        }
      }

      notification.success('Hub details updated');
    } catch (error) {
      // Revert to original value on error
      hubData[field] = originalData[field];
      notification.error('Failed to update settings.');
      console.error('Error saving hub settings:', error);
    } finally {
      isSaving = false;
    }
  }

  // Special handler for hub name blur to ensure validation
  function handleHubNameBlur() {
    // First validate
    if (validateHubName(hubData.name)) {
      // Only save if validation passes
      saveChanges('name', hubData.name);
    }
  }

  // Handle logo upload/removal
  function handleLogoChange(event) {
    const { file, preview } = event.detail;
    hubData.logoFile = file;

    // Update the preview immediately for local display
    hubData.logoUrl = preview;

    // Save the logo - pass the file to be included in FormData
    if (file) {
      saveChanges('logo', file);
    } else {
      // For logo removal, pass null to indicate removal
      saveChanges('logo', null);
    }
  }
</script>

<section class="w-full">
  <div class="flex items-end justify-between">
    <h1
      class="font-inter text-fs-ds-28 font-fw-ds-500 w-1/4 truncate overflow-hidden py-4 whitespace-nowrap text-neutral-50"
    >
      {hubData.name}
    </h1>
    <div class="flex items-center gap-3">
      <Button variant="filled-secondary" size="small" iconLeft={true}>
        <svelte:fragment slot="iconLeft">
          <ManageMembersIcon />
        </svelte:fragment>
        Invite Collaborators
      </Button>
      <Button
        variant="filled-primary"
        size="small"
        iconLeft={true}
        on:click={() => (showModal = true)}
      >
        <svelte:fragment slot="iconLeft">
          <PlusIcon />
        </svelte:fragment>
        New Workspace
      </Button>
    </div>
  </div>

  <div class="mb-8 flex flex-col gap-2">
    <!-- Logo upload - using small variant -->
    <div>
      <FileUploadDragDrop
        label=""
        variant="small"
        bind:value={hubData.logoFile}
        imagePreview={hubData.logoUrl}
        on:change={handleLogoChange}
      />
    </div>
  </div>
  <!-- Wrapper that switches to row layout on md+ screens -->
  <div class="flex flex-col gap-8 md:flex-row md:gap-0">
    <!-- Left column -->
    <div class="flex flex-col gap-6 md:w-1/2 md:pr-6">
      <!-- Hub name with required field validation -->
      <div>
        <Input
          label="Hub Name"
          id="hubName"
          name="hubName"
          bind:value={hubData.name}
          placeholder="Enter hub name"
          required={true}
          hasError={!!errors.name}
          errorMessage={errors.name}
          on:input={() => clearError('name')}
          on:blur={handleHubNameBlur}
        />
      </div>

      <!-- Hub summary -->
      <div>
        <Textarea
          label="Hub Summary"
          id="description"
          name="description"
          bind:value={hubData.description}
          placeholder="Write a short summary about your hub"
          charLimit={100}
          minHeight={132}
          on:blur={() => saveChanges('description', hubData.description)}
        />
      </div>
    </div>

    <!-- Vertical divider -->
    <div class="bg-surface-100 hidden h-[70vh] w-px md:block"></div>

    <!-- Right column -->
    <div class="flex flex-col gap-6 md:w-1/2 md:pl-6">
      <!-- GitHub link -->
      <div>
        <Input
          label="GitHub Link"
          id="githubUrl"
          name="githubUrl"
          bind:value={hubData.githubUrl}
          placeholder="Enter your GitHub profile URL"
          on:blur={() => saveChanges('githubUrl', hubData.githubUrl)}
        >
          <div slot="icon" class="absolute top-1/2 left-2 -translate-y-1/2">
            <GithubIcon />
          </div>
        </Input>
      </div>

      <!-- LinkedIn link -->
      <div>
        <Input
          label="LinkedIn Link"
          id="linkedinUrl"
          name="linkedinUrl"
          bind:value={hubData.linkedinUrl}
          placeholder="Enter your LinkedIn profile URL"
          on:blur={() => saveChanges('linkedinUrl', hubData.linkedinUrl)}
        >
          <div slot="icon" class="absolute top-1/2 left-2 -translate-y-1/2">
            <LinkedinIcon />
          </div>
        </Input>
      </div>

      <!-- X link -->
      <div>
        <Input
          label="X Link"
          id="xUrl"
          name="xUrl"
          bind:value={hubData.xUrl}
          placeholder="Enter your X profile URL"
          on:blur={() => saveChanges('xUrl', hubData.xUrl)}
        >
          <div slot="icon" class="absolute top-1/2 left-2 -translate-y-1/2">
            <XIcon />
          </div>
        </Input>
      </div>
    </div>
  </div>
  {#if showModal}
    <Modal on:close={() => (showModal = false)}>
      <AddWorkspace onClose={() => (showModal = false)} hubId={params} onSuccess={() => {}} />
    </Modal>
  {/if}
</section>
