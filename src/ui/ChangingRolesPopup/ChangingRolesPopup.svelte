<script lang="ts">
  import CloseIcon from '@/assets/icons/CloseIcon.svelte';
  import { notification } from '@/components/Toast';
  import { hubsService } from '@/services/hubs.service';
  import Button from '@/ui/Button/Button.svelte';
  import { slide } from 'svelte/transition';
  export let onClose;
  export let hubName;
  export let data;
  export let hubId;
  export let onSuccess;
  let isLoading = false;
  async function UpdateRole() {
    try {
      isLoading = true;

      const action =
        data?.role.toLowerCase() === 'member'
          ? hubsService.changeRoletoAdmin
          : hubsService.changeRoletoMember;

      await action({ userId: data?.id, hubId });
      notification.success(
        `${data?.name?.length > 15 ? `${data.length.slice(0, 15)}...` : data?.name} is now a ${data?.role.toLowerCase() === 'member' ? 'Admin' : 'Member'}.`,
      );

      onSuccess();
    } catch (error) {
      notification.error(
        `Failed to assign ${data?.name?.length > 15 ? `${data.length.slice(0, 15)}...` : data?.name} as a ${data?.role.toLowerCase() === 'member' ? 'Admin' : 'Member'}.Please try again.`,
      );
    } finally {
      onClose();
      isLoading = false;
    }
  }
</script>

<div class="bg-surface-600 rounded-lg p-6">
  <div class="flex flex-col gap-6">
    <div class="flex justify-between">
      <h2 class="font-inter text-fs-ds-20 leading-lh-ds-120 font-medium text-neutral-50">
        Changing Role?
      </h2>
      <span class="cursor-pointer" on:click={onClose}> <CloseIcon /></span>
    </div>
    <div class="flex flex-col gap-4">
      <div class="flex flex-col gap-2">
        <div class="flex items-center gap-2">
          <div
            class="border-surface-50 text-fs-ds-14 leading-lh-ds-143 font-fw-ds-400 flex h-9 w-9 items-center justify-center rounded-[133.33px] border bg-purple-400 text-neutral-50"
          >
            {data.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 class="text-fs-ds-12 leading-lh-ds-130 font-fw-ds-400 font-inter text-neutral-50">
              {data?.name.length > 20 ? `${data?.name.slice(0, 20)}...` : data?.name}
            </h2>

            <h2 class="text-fs-ds-12 leading-lh-ds-150 font-fw-ds-300 text-neutral-300">
              {data.email.length > 50 ? `${data.email.length.slice(0, 50)}...` : data.email}
            </h2>
          </div>
        </div>
        <div>
          {#if data.role.toLowerCase() === 'admin'}
            <div class="font-fw-ds-300 text-fs-ds-14 leading-lh-ds-143 font-inter text-neutral-200">
              Upon transitioning an Admin to a Member, ‘Edit’ access will be automatically provided
              for all assigned workspaces.
            </div>
          {:else}
            <div class="font-fw-ds-600 text-fs-ds-14 leading-lh-ds-143 font-inter text-neutral-200">
              You are assigning the role of an <span class="text-neutral-50">'Admin'</span> to
              {data.name.length > 20 ? `${data.name.slice(0, 10)}...` : data.name}. Following access
              will be provided to
              {data.name.length > 20 ? `${data.name.slice(0, 10)}...` : data.name}

              <ul
                class="font-fw-ds-300 text-fs-ds-12 leading-lh-ds-150 mt-2 ml-5 list-disc space-y-1 text-neutral-200"
              >
                <li>Create New Workspaces.</li>
                <li>Send Invites</li>
                <li>Change role of Admin and Members</li>
                <li>View/edit all the workspaces in the team.</li>
                <li>See all the user,their email and roles.</li>
                <li>See access details of user.</li>
              </ul>
            </div>
          {/if}
        </div>
      </div>
      <div class="mt-2 flex w-full justify-between gap-2">
        <div class="flex items-center gap-2">
          <div
            class="border-surface-50 text-fs-ds-14 leading-lh-ds-143 font-fw-ds-400 flex h-9 w-9 items-center justify-center rounded-[133.33px] border bg-purple-400 text-neutral-50"
          >
            {hubName.charAt(0).toUpperCase()}
          </div>
          <div class="font-inter text-fs-ds-12 leading-lh-ds-130 font-fw-ds-400 text-neutral-50">
            {hubName.length > 20 ? `${hubName.slice(0, 20)}...` : hubName}
          </div>
        </div>
        <Button disabled={isLoading} on:click={UpdateRole} variant="filled-primary"
          >Update Access</Button
        >
      </div>
    </div>
  </div>
</div>
