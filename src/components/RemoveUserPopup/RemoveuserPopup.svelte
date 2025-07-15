<script lang="ts">
  import CloseIcon from '@/assets/icons/CloseIcon.svelte';
  import { hubsService } from '@/services/hubs.service';
  import Button from '@/ui/Button/Button.svelte';
  import { notification } from '../Toast';
  import { captureEvent } from '@/utils/posthogConfig';
  export let onClose;
  export let hubName;
  export let data;
  export let hubId;
  export let onSuccess;
  let isLoading = false;
  async function handleRemoveUser() {
    try {
      isLoading = true;
      captureRemoveUserClick();
      const response = await hubsService.deleteUserFromTeam({ userId: data.id, teamId: hubId });
      notification.success(
        `"${data?.name.length > 15 ? `${data.name.slice(0, 15)}...` : data.name}" is removed from "${hubName.length > 15 ? `${hubName.slice(0, 15)}...` : hubName}".`,
      );
      onSuccess();
    } catch (error) {
      notification.error(
        `Failed to remove "${data?.name.length > 15 ? `${data.name.slice(0, 15)}...` : data.name}".Please try again.`,
      );
    } finally {
      onClose();
    }
  }

  const captureRemoveUserClick = () =>{
    const eventProperties = {
      event_source : "admin_panel",
      cta_location : "user_management"
    }
    captureEvent("admin_remove_user", eventProperties);
  }
</script>

<div class="bg-surface-600 rounded-lg p-6">
  <div class="flex flex-col gap-6">
    <div class="flex justify-between">
      <h2 class="font-inter text-fs-ds-20 leading-lh-ds-120 font-medium text-neutral-50">
        Remove user?
      </h2>
      <span class="cursor-pointer" on:click={onClose}> <CloseIcon /></span>
    </div>
    <div class="flex flex-col gap-1">
      <div class="font-fw-ds-300 text-fs-ds-14 leading-lh-ds-143 font-inter text-surface-1000">
        Are you sure you want to remove <span class="text-neutral-50"
          >“{data?.name?.length > 15 ? `${data?.name.slice(0, 15)}...` : data?.name}”</span
        >? They will lose access to the
        <span class="text-neutral-50"
          >“{hubName?.length > 20 ? `${hubName.slice(0, 20)}...` : hubName}”</span
        >
        hub.
      </div>
      <div class="flex w-full justify-end gap-3">
        <Button on:click={onClose} variant="filled-secondary">Cancel</Button>
        <Button disabled={isLoading} on:click={handleRemoveUser} variant="filled-tertiary"
          >Remove</Button
        >
      </div>
    </div>
  </div>
</div>
