<script lang="ts">
  import { onMount, onDestroy, tick } from 'svelte';
  import Tooltip from '../Tooltip/Tooltip.svelte';
  import WithdrawInviteIcon from '@/assets/icons/WithdrawInviteIcon.svelte';
  import ResendInvite from '@/assets/icons/ResendInvite.svelte';
  import { notification } from '@/components/Toast';
  import { hubsService } from '@/services/hubs.service';

  export let row;
  export let refetchInvites;
  export let hubId;

  let isOpen = false;
  let openUp = false;
  let triggerEl: HTMLButtonElement;
  let dropdownEl: HTMLDivElement;
  let position = { top: 0, left: 0, width: 0 };
  let isLoading = { resend: false, withdraw: false };

  async function toggleDropdown(event) {
    event.stopPropagation();

    if (!isOpen) {
      window.dispatchEvent(new CustomEvent('close-all-dropdowns'));
      isOpen = true;
      await tick();
      calculatePosition();
    } else {
      isOpen = false;
    }
  }

  function calculatePosition() {
    if (!triggerEl || !dropdownEl) return;

    const triggerRect = triggerEl.getBoundingClientRect();
    const dropdownHeight = dropdownEl.offsetHeight;
    const dropdownWidth = dropdownEl.offsetWidth;
    const spaceBelow = window.innerHeight - triggerRect.bottom;
    const spaceRight = window.innerWidth - triggerRect.right;

    openUp = spaceBelow < dropdownHeight + 5;

    position = {
      top: openUp ? triggerRect.top - dropdownHeight - 5 : triggerRect.bottom + 5,
      left:
        spaceRight < dropdownWidth
          ? triggerRect.right - dropdownWidth
          : triggerRect.right - dropdownWidth + 30,
      width: dropdownWidth,
    };
  }

  function closeDropdown() {
    isOpen = false;
  }

  // Withdraw invite handler
  async function handleWithdrawInvite(event) {
    event.stopPropagation();

    try {
      isLoading.withdraw = true;
      const email = row.original.email;

      await hubsService.withdrawInvite(hubId, email);
      notification.success('Invite withdrawn successfully.');
      refetchInvites();
      closeDropdown();
    } catch (error: any) {
      console.error('Error withdrawing invite:', error);
      notification.error('Failed to withdraw invite. Please try again.');
    } finally {
      isLoading.withdraw = false;
    }
  }

  // Resend invite handler
  async function handleResendInvite(event) {
    event.stopPropagation();

    try {
      isLoading.resend = true;
      const email = row.original.email;

      await hubsService.resendInvite(hubId, email);
      notification.success('Invite resent successfully.');
      refetchInvites();
      closeDropdown();
    } catch (error: any) {
      console.error('Error resending invite:', error);
      notification.error('Failed to resend invite. Please try again.');
    } finally {
      isLoading.resend = false;
    }
  }

  function handleClickOutside(event) {
    if (
      isOpen &&
      triggerEl &&
      !triggerEl.contains(event.target) &&
      dropdownEl &&
      !dropdownEl.contains(event.target)
    ) {
      closeDropdown();
    }
  }

  onMount(() => {
    document.addEventListener('click', handleClickOutside);
    window.addEventListener('close-all-dropdowns', closeDropdown);
    window.addEventListener('scroll', closeDropdown, true);
  });

  onDestroy(() => {
    document.removeEventListener('click', handleClickOutside);
    window.removeEventListener('close-all-dropdowns', closeDropdown);
    window.removeEventListener('scroll', closeDropdown, true);
  });
</script>

<!-- Dropdown trigger -->
<div class="relative flex items-center justify-end">
  <Tooltip text={'Show Actions'} position={'top'} mode="hover" size="xs">
    <button
      bind:this={triggerEl}
      class="hover:bg-surface-300 cursor-pointer rounded px-3.5 py-2 text-neutral-300 transition-colors duration-200 hover:text-neutral-50"
      on:click={toggleDropdown}
      aria-label="More actions"
      aria-haspopup="true"
      aria-expanded={isOpen}
      data-action="toggle-menu"
    >
      {#if typeof row.original.renderThreeDotsIcon === 'function'}
        {@html row.original.renderThreeDotsIcon()}
      {:else}
        ⋮
      {/if}
    </button>
  </Tooltip>
</div>

<!-- Dropdown menu -->
{#if isOpen}
  <div
    bind:this={dropdownEl}
    class="fixed z-[999] shadow-xl"
    style="top: {position.top}px; left: {position.left}px; width: {position.width || 160}px;"
    on:click|stopPropagation
  >
    <div class="bg-surface-600 flex flex-col gap-1 overflow-hidden rounded-sm px-1 py-1">
      <button
        class="hover:bg-surface-300 flex w-full cursor-pointer items-center gap-2 px-2 py-2 text-neutral-50 hover:rounded"
        on:click={handleWithdrawInvite}
        disabled={isLoading.withdraw}
      >
        <WithdrawInviteIcon />
        <h2 class="text-fs-ds-12 font-fw-ds-400">
          {isLoading.withdraw ? 'Withdrawing...' : 'Withdraw Invite'}
        </h2>
      </button>

      <button
        class="hover:bg-surface-300 flex w-full cursor-pointer items-center gap-2 px-2 py-2 text-neutral-50 hover:rounded"
        on:click={handleResendInvite}
        disabled={isLoading.resend}
      >
        <ResendInvite />
        <h2 class="text-fs-ds-12 font-regular font-fw-ds-400">
          {isLoading.resend ? 'Resending...' : 'Resend Invite'}
        </h2>
      </button>
    </div>
  </div>
{/if}
