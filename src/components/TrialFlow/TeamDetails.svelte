<script lang="ts">
  import InviteForm from '@/ui/InviteForm/InviteForm.svelte';
  import { createEventDispatcher } from 'svelte';

  export let teamdata;
  export let inviteCount;
  export let formData;

  export let type: 'primary' | 'secondary' = 'primary';

  const dispatch = createEventDispatcher();
  let inviteFormComponent;

  function handleFormChange(event) {
    dispatch('change', event.detail);
  }

  export function validateForm() {
    return inviteFormComponent.validate();
  }
</script>

<div class="-mt-11 flex flex-col gap-10">
  <div class="flex flex-col gap-5">
    <div class="text-fs-ds-24 font-fw-ds-500 text-center text-neutral-50">
      Step 3: Add People to {formData?.hubName} Hub
    </div>
    <div class="mb-6 text-center">
      <p class="mx-auto max-w-2xl text-gray-300">
        {#if type === 'primary'}
          Invite teammates or collaborators to join your hub and start working together. You can add
          people now or skip this step and do it anytime later from your dashboard. The Standard
          Trial supports up to {inviteCount} members, excluding you.
        {:else}
          Invite teammates or collaborators to join your hub and start working together. You can add
          people now or skip this step and do it anytime later from your dashboard.
        {/if}
      </p>
    </div>
  </div>

  <div class="mx-auto w-full max-w-2xl p-8">
    <div class="mb-2 grid grid-cols-[1fr_1fr_40px] gap-4">
      <div>
        <h2 class="text-fs-ds-14 text-neutral-200">Invite by email</h2>
      </div>
      <div>
        <h2 class="text-fs-ds-14 text-neutral-200">Role</h2>
      </div>
      <div></div>
    </div>
    <hr class="border-surface-200 my-4 w-full border-t" />
    <div
      class="scrollbar-thin scrollbar-thumb-surface-400 scrollbar-track-surface-600 max-h-[170px] overflow-y-auto pr-1"
    >
      {#if (type = 'primary')}
        <InviteForm
          bind:this={inviteFormComponent}
          bind:rows={teamdata}
          maxRows={inviteCount}
          on:change={handleFormChange}
        />
      {:else}
        <InviteForm
          bind:this={inviteFormComponent}
          bind:rows={teamdata}
          on:change={handleFormChange}
        />
      {/if}
    </div>
  </div>
</div>
