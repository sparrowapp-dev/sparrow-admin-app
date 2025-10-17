<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import DowngradeModalButtons from '@/ui/DowngradeModalButtons/DowngradeModalButtons.svelte';

  export let currentPlan: string;
  export let selectedPlan: string;
  export let hubName: string;
  export let hubWorkspaces: [];
  export let expiryDate: string;
  export let selectedWorkspaces: [];
  export let selectedMembers: [];
  export let isOpen: boolean = false;

  const dispatch = createEventDispatcher();

  let feedback = '';
  const maxChars = 3500;

  function handleCancel() {
    dispatch('close');
  }

  function handleConfirm() {
    dispatch('confirm', { feedback });
  }
  $: modalHeight = selectedPlan?.toLowerCase() === 'community' ? 'h-[555px]' : 'h-[485px]';
</script>

{#if isOpen}
  <div
    class="w-[533px] bg-[#181C26] ${modalHeight} flex flex-col gap-4 rounded-md p-6 text-white shadow-2xl"
  >
    <!-- Header -->
    <div class="flex items-start justify-between">
      <h2 class="font-inter text-fs-ds-20 font-medium text-neutral-50">
        Please Review Your Scheduled Downgrade
      </h2>
      <button
        class="text-fs-ds-20 mt-1 h-[11px] w-[11px] cursor-pointer leading-none text-neutral-400 hover:text-neutral-200"
        on:click={handleCancel}
      >
        ✕
      </button>
    </div>

    <!-- Info -->
    <p class="font-inter text-fs-ds-12 leading-relaxed font-light text-neutral-200">
      You are about to schedule your downgrade plan from
      <span>{currentPlan}</span> edition to
      <span>{selectedPlan}</span> edition for
      <span>{expiryDate}</span>. Please review the changes below before you confirm. You can go back
      to make changes.
    </p>

    <!-- Active Workspaces -->
    <div class="mt-2">
      <p class="font-inter text-fs-ds-14 font-medium text-neutral-100">Active Workspaces</p>
      {#if selectedWorkspaces.length === 0}
        <p class="text-fs-ds-12 mt-2 ml-2 text-neutral-400 italic">
          No active workspaces for this hub
        </p>
      {:else}
        <div class="text-fs-ds-12 mt-2 ml-2 flex flex-wrap gap-x-4 gap-y-2 text-neutral-300">
          {#each selectedWorkspaces as ws}
            <span>• {ws.name || ws}</span>
          {/each}
        </div>
      {/if}
    </div>

    {#if selectedPlan?.toLowerCase() === 'community'}
      <div class="mt-3">
        <p class="font-inter text-fs-ds-14 font-medium text-neutral-100">Active Members</p>

        {#if selectedMembers.length === 0}
          <p class="text-fs-ds-12 mt-2 ml-2 text-neutral-400 italic">
            No active members for this hub
          </p>
        {:else}
          <div class="text-fs-ds-12 mt-2 ml-2 flex flex-wrap gap-x-4 gap-y-2 text-neutral-300">
            {#each selectedMembers as member}
              <span>• {member.email || member}</span>
            {/each}
          </div>
        {/if}
      </div>
    {/if}

    <!-- Feedback -->
    <div class="mt-4">
      <p class="font-inter text-fs-ds-14 mb-1 font-medium text-neutral-100">Share Feedback</p>
      <textarea
        bind:value={feedback}
        maxlength={maxChars}
        placeholder="We're always looking to improve. We'd be grateful to know the main reason for your downgrade."
        class="text-fs-ds-14 w-full resize-none rounded-md bg-[#222630] p-3 text-neutral-100 outline-none focus:ring-neutral-500"
        rows="4"
      ></textarea>
      <p class="text-right text-[11px] text-neutral-500">{feedback.length}/{maxChars}</p>
    </div>

    <!-- Footer -->
    <div class="mt-auto">
      <DowngradeModalButtons
        showSupport={true}
        disableSupport={false}
        supportText="Contact Support"
        cancelText="Make Changes"
        confirmText="Confirm Downgrade"
        primaryVariant="filled-tertiary"
        on:cancel={handleCancel}
        on:confirm={handleConfirm}
        on:support={() => window.open('mailto:contactus@sparrowapp.dev', '_blank')}
      />
    </div>
  </div>
{/if}
