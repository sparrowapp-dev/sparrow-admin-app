<script>
  import CheckIcon from '@/assets/icons/Check.svelte';
  import Input from '@/ui/Input/Input.svelte';

  export let formData;
  export let handleInputChange;
  export let hubFormError;
  let isUrlInputFocused = false;
</script>

<div class="-mt-11 flex flex-col gap-5">
  <div class="text-fs-ds-24 font-fw-ds-500 mr-2 text-center text-neutral-50">
    Step 1: Set Your Hub Name and URL
  </div>
  <div class="">
    <div class="mb-6 text-center">
      <p class="max-w-1.5xl mx-auto text-gray-300">
        Your hub is the central space for your team on Sparrow, a place where collaboration,
        communication, and progress come together. Here's what to know:
      </p>
    </div>

    <div class="mx-auto ml-25 flex max-w-xl flex-col space-y-2">
      <div class="flex items-center gap-1.5">
        <CheckIcon width="17" height="13" color="#33CC7A" />
        <span class="text-fs-ds-16 font-fw-ds-300 text-neutral-200"
          >It acts as your team's home base on Sparrow.</span
        >
      </div>
      <div class="flex items-center gap-1">
        <CheckIcon width="17" height="13" color="#33CC7A" />
        <span class="text-fs-ds-16 font-fw-ds-300 text-neutral-200"
          >You can invite team members and manage all your work here.</span
        >
      </div>
      <div class="flex items-center gap-1">
        <CheckIcon width="17" height="13" color="#33CC7A" />
        <span class="text-fs-ds-16 font-fw-ds-300 text-neutral-200"
          >We've created one for you using your company name.</span
        >
      </div>
      <div class="flex items-center gap-1">
        <CheckIcon width="17" height="13" color="#33CC7A" />
        <span class="text-fs-ds-16 font-fw-ds-300 text-neutral-200"
          >Feel free to rename it and personalize the hub URL.</span
        >
      </div>
    </div>
  </div>
  <div class="mx-auto ml-25 max-w-xl space-y-4">
    <!-- Hub Name field using Input component -->
    <div>
      <Input
        label="Hub Name"
        id="hubName"
        name="hubName"
        required={true}
        placeholder="Enter hub name"
        value={formData.hubName}
        subtitle="Give your hub a name"
        on:input={(e) => handleInputChange('hubName', e.detail.target.value)}
        hasError={hubFormError?.hubNameError}
        errorMessage={hubFormError?.hubNameErrorMessage}
      />
    </div>

    <!-- Hub URL field - custom implementation since we need prefix/suffix -->
    <div>
      <label class="text-fs-ds-14 font-fw-ds-400 mb-0.5 flex items-center text-neutral-200">
        Hub URL <span class="ml-1 text-red-400">*</span>
      </label>
      <div class="text-fs-ds-12 font-fw-ds-300 mb-2 flex items-center text-neutral-400">
        Give your hub a URL
      </div>
      <div class="flex flex-col">
        <div
          class="url-input-wrapper flex items-center rounded-sm"
          class:focused={isUrlInputFocused}
          class:error={hubFormError?.hubUrlError}
        >
          <span
            class="text-fs-ds-14 bg-surface-400 flex items-center rounded-l-sm border-none px-3 text-neutral-500"
            style="height: 38px; max-height: 38px; min-height: 38px; box-sizing: border-box;"
          >
            https://
          </span>
          <div class="hub-url-input flex-1">
            <Input
              value={formData.hubUrl}
              placeholder="your hub"
              on:input={(e) => {
                handleInputChange('hubUrl', e.detail.target.value);
                isUrlInputFocused = true; // Also set focus to true on input
              }}
              on:focus={() => (isUrlInputFocused = true)}
              on:blur={() => (isUrlInputFocused = false)}
              hasError={hubFormError?.hubUrlError}
              maxLength={50}
            />
          </div>
          <span
            class="bg-surface-400 text-fs-ds-14 flex items-center rounded-r-sm border-none px-3 text-neutral-500"
            style="height: 38px; max-height: 38px; min-height: 38px; box-sizing: border-box;"
          >
            .sparrowhub.net
          </span>
        </div>
        {#if hubFormError?.hubUrlError}
          <div class="text-fs-ds-12 font-fw-ds-300 font-inter mt-1 mt-2 text-red-300">
            {hubFormError?.hubUrlErrorMessage}
          </div>
        {/if}
      </div>
    </div>
  </div>
</div>

<style>
  .url-input-wrapper {
    background-color: #222630; /* Match your surface-400 color */
    border: 1px solid transparent;
    transition: border-color 0.2s ease;
  }
  .url-input-wrapper.error {
    border-color: #f37472 !important;
  }
  .url-input-wrapper:hover {
    border-color: #9b9da1;
  }
  .url-input-wrapper.focused {
    border-color: #6894f9;
  }

  .hub-url-input {
    flex: 1;
    display: flex;
    align-items: stretch;
  }

  /* Remove border from the inner input component */
  .hub-url-input :global(input),
  .hub-url-input :global(.relative) {
    border: none !important;
  }
</style>
