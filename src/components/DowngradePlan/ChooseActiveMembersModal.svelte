<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import DowngradeModalButtons from '@/ui/DowngradeModalButtons/DowngradeModalButtons.svelte';
  
    export let isOpen: boolean = false;
    export let maxSelectable: number = 4;
    export let users = [];
    export let hubId: string;
    export let hubOwner: any;
  
    const dispatch = createEventDispatcher();
    let selected = new Set();
  
    $: filteredUsers = Array.isArray(users)
      ? users.filter((u) => (u.id || u._id) !== (hubOwner?.id || hubOwner?._id))
      : [];
  
    const toggleMember = (id: string) => {
      if (selected.has(id)) {
        selected.delete(id);
      } else if (selected.size < maxSelectable) {
        selected.add(id);
      }
      selected = new Set(selected);
    };
  
    const handleNext = () => {
        const selectedMembers = filteredUsers
        .filter((ws) => selected.has(ws.id))
        .map((ws) => ({
            id: ws.id,
            email: ws.email,
        }));
        console.log(selectedMembers);
        dispatch('next', { selected: selectedMembers });
    };
  
    const handleClose = () => {
      dispatch('close');
    };
  
    const handleBackdropClick = (e: MouseEvent) => {
      if (e.target === e.currentTarget) {
        handleClose();
      }
    };
  
    function getFirstName(fullNameOrEmail: string): string {
      if (!fullNameOrEmail) return '';
      if (fullNameOrEmail.includes('@')) {
        return fullNameOrEmail.split('@')[0];
      }
      return fullNameOrEmail.split(' ')[0];
    }
  
    function getTimeDifference(lastActiveAt: string): string {
      if (!lastActiveAt) return 'Never';
      const lastActiveDate = new Date(lastActiveAt);
      const now = new Date();
      const diffInMinutes = Math.floor((now.getTime() - lastActiveDate.getTime()) / (1000 * 60));
  
      if (diffInMinutes < 1) return 'Just now';
      if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
  
      const diffInHours = Math.floor(diffInMinutes / 60);
      if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
  
      const diffInDays = Math.floor(diffInHours / 24);
      if (diffInDays === 1) return '1 day ago';
      return `${diffInDays} days ago`;
    }
  
    function getRoleLabel(role: string): string {
      const r = role?.toLowerCase?.() || '';
      if (r === 'owner') return 'Owner';
      if (r === 'admin') return 'Admin';
      return 'Member';
    }
  
    // ✅ Conditional logic for enabling the Confirm button
    $: isConfirmEnabled = (() => {
      if (!filteredUsers.length) return false;
  
      // Case 1: Less than or equal to maxSelectable members
      if (filteredUsers.length <= maxSelectable) {
        return selected.size >= 1; // must select at least one
      }
  
      // Case 2: More than maxSelectable members
      return selected.size === maxSelectable; // must select exactly 4
    })();
  </script>
  

{#if isOpen}
  <!-- Custom Modal Backdrop -->
  <div
    class="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-xs"
    on:click={handleBackdropClick}
    role="presentation"
  >
    <!-- Modal Content -->
    <div
      class="bg-[#181C26] relative mx-auto flex h-[642px] w-[533px] flex-col gap-4 rounded-lg p-6 text-white shadow-2xl"
      role="dialog"
      aria-modal="true"
    >
      <!-- Header -->
      <div class="flex items-start justify-between">
        <div class="flex items-center gap-2">
          <div class="flex items-center gap-1">
            <div
              class="flex h-5 w-5 items-center justify-center rounded-full bg-[#10B981] text-[12px] font-medium"
            >
              ✓
            </div>
            <span class="text-[14px] font-medium text-gray-400">Step 1</span>
          </div>
          <div class="mx-2 h-px w-12 bg-gray-600"></div>
          <div class="flex items-center gap-1">
            <div
              class="flex h-5 w-5 items-center justify-center rounded-full bg-[#2B74FF] text-[12px] font-medium"
            >
              2
            </div>
            <span class="text-[14px] font-medium text-gray-300">Step 2</span>
          </div>
        </div>
        <button
          on:click={handleClose}
          class="text-[20px] text-gray-400 transition hover:text-white"
          type="button"
        >
          ✕
        </button>
      </div>

      <!-- Title & Description -->
      <div class="flex flex-col gap-y-2">
        <h2 class="text-[20px] leading-tight font-semibold">Choose Your Active Members</h2>
        <p class="mt-2 text-[12px] leading-snug text-gray-400">
          Your new plan includes {maxSelectable} active members (plus you as the Hub Owner). Please select
          the team members to keep active.
        </p>
        <p class="mt-1 text-[12px] leading-snug text-gray-400">
          Unselected members will be remove from the Hub on 28 Aug 2025
        </p>
      </div>

      <!-- Members List -->
      <div
        class="flex h-[320px] max-w-[492px] flex-grow flex-col overflow-hidden rounded-md border border-[#2A2F3A]"
      >
        <div class="flex-grow overflow-y-auto">
          {#each filteredUsers as user}
            <div
              class="font-fw-ds-600 font-inter flex cursor-pointer items-center justify-between px-4 py-3 transition-colors hover:bg-[#2A2F3A]"
              on:click={() => toggleMember(user.id)}
            >
              <!-- Left side: Checkbox + User Info -->
              <div class="flex items-center gap-3" on:click|stopPropagation>
                <label class="relative flex h-4 w-4 items-center justify-center">
                  <input
                    type="checkbox"
                    checked={selected.has(user.id)}
                    on:click={(e) => {
                      e.stopPropagation();
                      toggleMember(user.id);
                    }}
                    disabled={!selected.has(user.id) && selected.size >= maxSelectable}
                    class="peer absolute h-4 w-4 cursor-pointer appearance-none rounded-sm border border-[#2A2F3A] bg-[#1E222C] checked:border-[#2B74FF] checked:bg-[#2B74FF] focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                  />
                  <!-- Checkmark icon -->
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="pointer-events-none absolute h-3 w-3 text-white opacity-0 transition-opacity peer-checked:opacity-100"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M16.707 5.293a1 1 0 00-1.414 0L8 12.586 4.707 9.293a1 1 0 00-1.414 1.414l4 4a1 1 0 001.414 0l8-8a1 1 0 000-1.414z"
                      clip-rule="evenodd"
                    />
                  </svg>
                </label>

                <!-- User Info -->
                <div class="flex flex-col">
                  <div class="flex items-center gap-2">
                    <span class="text-[12px] font-medium text-white">
                      {getFirstName(user.name || user.email)}
                    </span>
                    <span class="text-[12px] text-gray-400">({getRoleLabel(user.role)})</span>
                  </div>
                  <span class="truncate text-[11px] text-gray-500">{user.email}</span>
                </div>
              </div>

              <!-- Right side: Last Active -->
              <div class="text-[12px] text-gray-400">
                Last active: {getTimeDifference(user.lastActiveAt)}
              </div>
            </div>
          {/each}
        </div>
      </div>

      <!-- Selection Counter -->
      <p class="text-right text-[12px] text-gray-500">
        You have selected {selected.size} of {maxSelectable}
      </p>

      <!-- Action Buttons -->
      <div class="">
        <DowngradeModalButtons
          showSupport={true}
          supportText="Contact Support"
          cancelText="Cancel"
          confirmText="Confirm Selections"
          primaryVariant="filled-primary"
          isPrimaryDisabled={!isConfirmEnabled}
          on:support={() => console.log('Support clicked')}
          on:cancel={handleClose}
          on:confirm={handleNext}
        />
      </div>
    </div>
  </div>
{/if}
