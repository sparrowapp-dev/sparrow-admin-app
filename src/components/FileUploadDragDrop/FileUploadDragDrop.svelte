<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import EditIconWhite from '@/assets/icons/EditIconWhite.svelte';
  import FileUploadIcon from '@/assets/icons/FileUploadIcon.svelte';
  import Image from '@/assets/icons/Image.svelte';
  import Delete from '@/assets/icons/Delete.svelte';
  import FileUploadIconV2 from '@/assets/icons/FileUploadIconV2.svelte';

  export let label = 'Upload File';
  export let hint = 'Upload your image (max 2MB, square format). Supported: .jpg, .jpeg, .png.';
  export let maxSizeMB = 2;
  export let acceptedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
  export let value: File | null = null;
  export let imagePreview: string | null = null;
  export let variant: 'default' | 'small' = 'default';

  const dispatch = createEventDispatcher();
  let fileInput: HTMLInputElement;
  let dragActive = false;
  let error: string | null = null;
  const formats = ['PNG', 'JPG', 'JPEG'];

  const maxSizeBytes = maxSizeMB * 1024 * 1024;

  function handleFileChange(event: Event) {
    const target = event.target as HTMLInputElement;
    const files = target.files;
    if (files && files.length > 0) {
      validateAndSetFile(files[0]);
    }
  }

  function validateAndSetFile(file: File) {
    error = null;

    // Check file type
    if (!acceptedTypes.includes(file.type)) {
      error = `This file type is not supported. Please reupload in any of the following file formats: .jpg, .jpeg, .png .`;
      dispatch('error', error);
      return;
    }

    // Check file size
    if (file.size > maxSizeBytes) {
      error = `The size of the file you are trying to upload is more than 2 MB.`;
      dispatch('error', error);
      return;
    }

    // Set file and create preview
    value = file;
    const reader = new FileReader();
    reader.onload = (e) => {
      imagePreview = e.target?.result as string;
      dispatch('change', { file: value, preview: imagePreview });
    };
    reader.readAsDataURL(file);
  }

  function handleDragOver(event: DragEvent) {
    event.preventDefault();
    dragActive = true;
  }

  function handleDragLeave() {
    dragActive = false;
  }

  function handleDrop(event: DragEvent) {
    event.preventDefault();
    dragActive = false;

    if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
      validateAndSetFile(event.dataTransfer.files[0]);
    }
  }

  function handleDelete() {
    value = null;
    imagePreview = null;
    if (fileInput) fileInput.value = '';
    dispatch('change', { file: null, preview: null });
  }

  function handleEdit() {
    fileInput?.click();
  }
</script>

<div class="w-full">
  {#if label}
    <label class="text-fs-ds-14 font-fw-ds-400 font-inter mb-2 block text-neutral-200">
      {label}
    </label>
  {/if}

  {#if hint && !imagePreview && variant === 'default'}
    <p class="text-fs-ds-12 font-fw-ds-300 mb-2 text-neutral-400">
      {hint}
    </p>
  {/if}

  {#if imagePreview}
    <!-- Small variant preview -->
    {#if variant === 'small'}
      <div class="relative mb-2">
        <div class="group relative flex h-[60px] w-[60px] items-end gap-2 rounded-md">
          <img src={imagePreview} alt="Uploaded" class="h-full w-full object-cover" />
          <div class="flex gap-2">
            <button
              type="button"
              class="hover:bg-surface-400 flex cursor-pointer items-center justify-center rounded p-2"
              on:click={handleEdit}
              title="Edit"
            >
              <EditIconWhite />
            </button>
            <button
              type="button"
              class="hover:bg-surface-400 flex cursor-pointer items-center justify-center rounded p-2"
              on:click={handleDelete}
              title="Delete"
            >
              <Delete />
            </button>
          </div>
        </div>
      </div>
      <!-- Default variant preview -->
    {:else}
      <div class="relative mb-2 flex items-end gap-2">
        <div class="h-28 w-28 overflow-hidden rounded-md">
          <img src={imagePreview} alt="Uploaded" class="h-full w-full object-cover" />
        </div>

        <div class="flex gap-2">
          <button
            type="button"
            class="hover:bg-surface-400 flex cursor-pointer items-center justify-center rounded p-2"
            on:click={handleEdit}
            title="Edit"
          >
            <EditIconWhite />
          </button>
          <button
            type="button"
            class="hover:bg-surface-400 flex cursor-pointer items-center justify-center rounded p-2"
            on:click={handleDelete}
            title="Delete"
          >
            <Delete />
          </button>
        </div>
      </div>
    {/if}
  {:else}
    <!-- Small variant upload area -->
    {#if variant === 'small'}
      <div class="flex items-center gap-4">
        <div
          class=" flex h-[60px] w-[60px] cursor-pointer flex-col items-center justify-center rounded-md border-1 border-dashed active:border-blue-300"
          class:border-blue-300={dragActive && !error}
          class:border-neutral-300={!dragActive && !error}
          class:border-red-300={error}
          on:dragover={handleDragOver}
          on:dragleave={handleDragLeave}
          on:drop={handleDrop}
          on:click={handleEdit}
        >
          <div class="text-neutral-100">
            <FileUploadIconV2 />
          </div>
        </div>
        {#if !imagePreview && !error}
          <p class="text-fs-ds-12 font-fw-ds-300 w-1/3 text-neutral-500">
            Upload or drag and drop your image. For best results, use a square image under 2 MB in
            size. Supported formats: .jpg, .jpeg, .png.
          </p>
        {/if}
        {#if error}
          <p class="text-fs-ds-12 font-fw-ds-300 mt-2 text-red-300">{error}</p>
        {/if}
      </div>

      <!-- Default variant upload area -->
    {:else}
      <div
        class="bg-surface-400 flex h-40 w-full cursor-pointer flex-col items-center justify-center rounded-md border-1 border-dashed active:border-blue-300"
        class:border-blue-300={dragActive && !error}
        class:border-surface-100={!dragActive && !error}
        class:border-red-300={error}
        on:dragover={handleDragOver}
        on:dragleave={handleDragLeave}
        on:drop={handleDrop}
        on:click={handleEdit}
      >
        <div class="mb-2 text-neutral-100">
          <FileUploadIcon />
        </div>
        <div class="flex flex-col items-center">
          <p class="text-fs-ds-14 font-fw-ds-400 mb-3 text-center text-neutral-400">
            Drag & Drop or <span class="text-blue-300">Upload File</span> here
          </p>
          <div class="text-fs-ds-12 font-fw-ds-400 flex items-center gap-2 text-neutral-400">
            {#each formats as format, i (format)}
              <div class="flex items-center gap-1">
                <Image />
                <span>{format}</span>
              </div>

              {#if i < formats.length - 1}
                <span class="mx-2 h-4 w-px bg-neutral-600"></span>
              {/if}
            {/each}
          </div>
        </div>
      </div>
    {/if}
  {/if}

  {#if error && variant === 'default'}
    <p class="text-fs-ds-12 font-fw-ds-300 mt-2 text-red-300">{error}</p>
  {/if}

  <input
    bind:this={fileInput}
    type="file"
    accept={acceptedTypes.join(',')}
    class="hidden"
    on:change={handleFileChange}
  />
</div>
