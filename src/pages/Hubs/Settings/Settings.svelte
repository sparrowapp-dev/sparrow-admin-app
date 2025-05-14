<script lang="ts">
  import { onMount } from 'svelte';
  import Input from '@/ui/Input/Input.svelte';
  import Textarea from '@/ui/Textarea/Textarea.svelte';
  import Button from '@/ui/Button/Button.svelte';
  import FileUploadDragDrop from '@/components/FileUploadDragDrop/FileUploadDragDrop.svelte';
  import { notification } from '@/components/Toast';
  import { hubsService } from '@/services/hubs.service';
  import { useLocation } from 'svelte-routing';
  import { derived } from 'svelte/store';
  import GithubIcon from '@/assets/icons/GithubIcon.svelte';
  import LinkedinIcon from '@/assets/icons/LinkedinIcon.svelte';
  import XIcon from '@/assets/icons/XIcon.svelte';

  const location = useLocation();

  // State management
  let hubData = {
    id: '',
    name: '',
    summary: '',
    logoFile: null,
    logoUrl: '',
    githubLink: '',
    linkedinLink: '',
    xLink: '',
  };

  let originalData = { ...hubData };
  let isSaving = false;
  let params: string | undefined;

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
          summary: data.description || '',
          logoFile: null,
          logoUrl: data.logoUrl || '',
          githubLink: data.githubLink || '',
          linkedinLink: data.linkedinLink || '',
          xLink: data.xLink || '',
        };
        originalData = { ...hubData };
      }
    } catch (error) {
      notification.error('Failed to load hub details.');
      console.error('Error fetching hub details:', error);
    }
  }

  // Save changes function (called when blur events happen)
  async function saveChanges(field: string, value: any) {
    // Don't save if the value hasn't changed
    if (originalData[field] === value) return;

    try {
      isSaving = true;

      // Create payload with only the changed field
      const payload = { [field]: value };

      await hubsService.updateHub(params, payload);
      originalData[field] = value; // Update original data after save
      notification.success('Settings updated');
    } catch (error) {
      // Revert to original value on error
      hubData[field] = originalData[field];
      notification.error('Failed to update settings.');
      console.error('Error saving hub settings:', error);
    } finally {
      isSaving = false;
    }
  }

  // Handle logo upload
  function handleLogoChange(event) {
    const { file, preview } = event.detail;
    hubData.logoFile = file;

    if (file) {
      uploadLogo(file);
    }
  }

  // Upload logo to server
  async function uploadLogo(file: File) {
    try {
      isSaving = true;

      const formData = new FormData();
      formData.append('image', file);

      await hubsService.updateHubLogo(params, formData);
      notification.success('Logo uploaded successfully');
    } catch (error) {
      notification.error('Failed to upload logo.');
      console.error('Error uploading logo:', error);
    } finally {
      isSaving = false;
    }
  }
</script>

<section class="w-full pb-16">
  <h1 class="font-inter text-fs-ds-28 font-fw-ds-500 py-4 text-neutral-50">Settings</h1>

  <div class="grid grid-cols-1 gap-8 md:grid-cols-2">
    <!-- Left column -->
    <div class="flex flex-col gap-6">
      <!-- Logo upload -->
      <div class="mb-4">
        <FileUploadDragDrop
          label="Hub Logo"
          bind:value={hubData.logoFile}
          imagePreview={hubData.logoUrl}
          on:change={handleLogoChange}
        />
      </div>

      <!-- Hub name -->
      <div>
        <Input
          label="Hub Name"
          id="hubName"
          name="hubName"
          bind:value={hubData.name}
          placeholder="Enter hub name"
          on:blur={() => saveChanges('name', hubData.name)}
        />
      </div>

      <!-- Hub summary -->
      <div>
        <Textarea
          label="Hub Summary"
          id="summary"
          name="summary"
          bind:value={hubData.summary}
          placeholder="Write a short summary about your hub"
          charLimit={100}
          minHeight={120}
          on:blur={() => saveChanges('summary', hubData.summary)}
        />
      </div>
    </div>

    <!-- Right column - External links -->
    <div class="flex flex-col gap-6">
      <!-- GitHub link -->
      <div>
        <Input
          label="GitHub Link"
          id="githubLink"
          name="githubLink"
          bind:value={hubData.githubLink}
          placeholder="https://www.github.com/company/techdome"
          on:blur={() => saveChanges('githubLink', hubData.githubLink)}
        >
          <div slot="icon" class="absolute top-1/2 left-3 -translate-y-1/2">
            <GithubIcon />
          </div>
        </Input>
      </div>

      <!-- LinkedIn link -->
      <div>
        <Input
          label="LinkedIn Link"
          id="linkedinLink"
          name="linkedinLink"
          bind:value={hubData.linkedinLink}
          placeholder="https://www.github.com/company/techdome"
          on:blur={() => saveChanges('linkedinLink', hubData.linkedinLink)}
        >
          <div slot="icon" class="absolute top-1/2 left-3 -translate-y-1/2">
            <LinkedinIcon />
          </div>
        </Input>
      </div>

      <!-- X link -->
      <div>
        <Input
          label="X Link"
          id="xLink"
          name="xLink"
          bind:value={hubData.xLink}
          placeholder="https://www.github.com/company/techdome"
          on:blur={() => saveChanges('xLink', hubData.xLink)}
        >
          <div slot="icon" class="absolute top-1/2 left-3 -translate-y-1/2">
            <XIcon />
          </div>
        </Input>
      </div>
    </div>
  </div>

  <!-- Save button might be needed for mobile or if there are global settings -->
  <div class="mt-8">
    <Button
      variant="filled-primary"
      size="medium"
      disabled={isSaving}
      on:click={() => {
        saveChanges('name', hubData.name);
        saveChanges('summary', hubData.summary);
        saveChanges('githubLink', hubData.githubLink);
        saveChanges('linkedinLink', hubData.linkedinLink);
        saveChanges('xLink', hubData.xLink);
      }}
    >
      {isSaving ? 'Saving...' : 'Save All Changes'}
    </Button>
  </div>
</section>
