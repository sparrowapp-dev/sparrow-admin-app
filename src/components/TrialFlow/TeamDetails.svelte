<script lang="ts">
  import InviteForm from '@/ui/InviteForm/InviteForm.svelte';
  import { createEventDispatcher } from 'svelte';

  export let teamdata;

  const dispatch = createEventDispatcher();

  function handleFormChange(event) {
    dispatch('change', event.detail);
  }
</script>

<div class="-mt-11 flex flex-col gap-10">
  <div class="flex flex-col gap-5">
    <div class="text-fs-ds-24 font-fw-ds-500 text-center text-neutral-50">
      Step 3: Add People to Techdome Hub
    </div>
    <div class="mb-6 text-center">
      <p class="mx-auto max-w-2xl text-gray-300">
        Invite teammates or collaborators to join your hub and start working together. You can add
        people now or skip this step and do it anytime later from your dashboard. The Standard Trial
        supports up to 10 members, including you.
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
      <InviteForm bind:rows={teamdata} on:change={handleFormChange} />
    </div>
  </div>
</div>
