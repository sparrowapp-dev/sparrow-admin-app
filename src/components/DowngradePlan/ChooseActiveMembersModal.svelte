<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte';
  import DowngradeModalButtons from '@/ui/DowngradeModalButtons/DowngradeModalButtons.svelte';
  import TableModalCommonLayout from './Common/TableModalCommonLayout.svelte';
  import { hubsService } from '@/services/hubs.service';
  import { userService, UserService } from '@/services/users.service';
  import { createQuery } from '@/services/api.common';

  export let isOpen: boolean = false;
  export let planLimits: [];
  export let users = [];
  export let hubId: string;
  export let hubOwner: any;
  export let expiryDate: string;

  const dispatch = createEventDispatcher();
  let selected = new Set();
  $: maxSelectable = planLimits?.usersPerHub?.value;
  $: filteredUsers = Array.isArray(users) ? users : [];

  const toggleMember = (id: string) => {
    if (selected.has(id)) {
      selected.delete(id);
    } else if (selected.size < maxSelectable) {
      selected.add(id);
    }
    selected = new Set(selected);
  };

  const getLastActive = async () => {
    try {
      const res = await userService.getUsers();
      if (res?.data?.users?.length) {
        users = users.map((u) => {
          const match = res.data.users.find(
            (apiUser) => apiUser.id === u.id || apiUser._id === u._id || apiUser.email === u.email,
          );

          return {
            ...u,
            lastActiveAt: match?.lastActive || u.lastActiveAt || '',
          };
        });
      }
    } catch (err) {
      console.error('Error fetching last active users:', err);
    }
  };

  const handleNext = () => {
    const selectedMembers = filteredUsers
      .filter((ws) => selected.has(ws.id))
      .map((ws) => ({
        id: ws.id,
        email: ws.email,
      }));
    dispatch('next', { selected: selectedMembers });
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

  $: isConfirmEnabled = (() => {
    if (!filteredUsers.length) return true;
    if (filteredUsers.length <= maxSelectable) {
      return selected.size >= 1; // must select at least one
    }

    return selected.size === maxSelectable; // must select exactly 4
  })();

</script>

<TableModalCommonLayout
  {isOpen}
  title="Choose Your Active Members"
  subheading1="Your new plan includes {maxSelectable} active members (plus you as the Hub Owner). Please select the team members to keep active."
  subheading2="Unselected members will be removed from the Hub on {expiryDate}."
  {maxSelectable}
  stepIndicator={true}
  selectedCount={selected.size}
  isPrimaryDisabled={!isConfirmEnabled}
  confirmText="Confirm Selections"
  on:confirm={handleNext}
  on:close={() => dispatch('close')}
>
  <div slot="stepIndicator" class="flex items-center gap-2">
    <span class="text-fs-ds-14 text-gray-400">Step 1</span>
    <div class="mx-2 h-px w-12 bg-gray-600"></div>
    <div class="flex items-center gap-1">
      <div
        class="text-fs-ds-12 flex h-5 w-5 items-center justify-center rounded-full bg-[#2B74FF] font-medium"
      >
        2
      </div>
      <span class="text-fs-ds-14 font-medium text-gray-300">Step 2</span>
    </div>
  </div>
  <div class="flex-grow overflow-y-auto">
    {#if filteredUsers.length > 0}
      {#each filteredUsers as user}
        <div
          class="flex cursor-pointer items-center justify-between px-4 py-3 hover:bg-[#2A2F3A] text-left"
          on:click={() => toggleMember(user.id)}
        >
          <div class="flex items-center gap-3">
            <label class="relative flex items-center justify-center">
            <input
              type="checkbox"
              checked={selected.has(user.id)}
              on:click|stopPropagation={() => toggleMember(user.id)}
              disabled={!selected.has(user.id) && selected.size >= maxSelectable}
              class="peer h-4 w-4 cursor-pointer appearance-none rounded-sm border border-[#2A2F3A] bg-[#1E222C] checked:border-[#2B74FF] checked:bg-[#2B74FF] focus:outline-none"
            />
            <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="pointer-events-none absolute h-3 w-3 text-black opacity-0 transition-opacity peer-checked:opacity-100"
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
            <div>
              <span class="text-[12px] font-medium text-white">
                {getFirstName(user.name || user.email)}
              </span>
              <span class="text-[12px] text-gray-400">({getRoleLabel(user.role)})</span>
              <div class="truncate text-[11px] text-gray-500">{user.email}</div>
            </div>
          </div>
          <div class="text-[12px] text-gray-400 text-left">
            Last active: {getTimeDifference(user.lastActiveAt)}
          </div>
        </div>
      {/each}
    {:else}
      <div class="flex items-center justify-center py-8 text-sm text-gray-400 italic">
        No active members present for the selected workspaces.
      </div>
    {/if}
  </div>
</TableModalCommonLayout>
