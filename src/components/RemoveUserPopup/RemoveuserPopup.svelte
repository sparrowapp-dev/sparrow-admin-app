<script lang="ts">
  import CloseIcon from '@/assets/icons/CloseIcon.svelte';
  import { hubsService } from '@/services/hubs.service';
  import Button from '@/ui/Button/Button.svelte';
  import { notification } from '../Toast';
  export let onClose;
  export let hubName;
  export let data;
  export let hubId;
  export let onSuccess;
  let isLoading = false;
  async function handleRemoveUser() {
    try {
      isLoading = true;
      const response = await hubsService.deleteUserFromTeam({ userId: data.id, teamId: hubId });
      notification.success('removed user');
      onSuccess();
    } catch (error) {
      notification.error('fail to remove user');
    } finally {
      onClose();
    }
  }
</script>

<div class="bg-surface-600 rounded-[8px] p-6">
  <div class="flex flex-col gap-6">
    <div class="flex justify-between">
      <h2 class="font-inter text-fs-ds-20 leading-lh-ds-120 font-medium text-neutral-50">
        Remove user?
      </h2>
      <span class="cursor-pointer" on:click={onClose}> <CloseIcon /></span>
    </div>
    <div class="flex flex-col gap-1">
      <div class="font-fw-ds-300 text-fs-ds-14 leading-lh-ds-143 font-inter text-neutral-200">
        Are you sure you want to remove <span class="text-neutral-50">“{data.name}”</span>? They
        will lose access to the <span class="text-neutral-50">“{hubName}”</span>
        team.
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
