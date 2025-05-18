<script lang="ts">
  import CloseIcon from '@/assets/icons/CloseIcon.svelte';
  import MemberRolesDropdown from '../MemberRoleDropdown/MemberRolesDropdown.svelte';
  import { hubsService } from '@/services/hubs.service';
  import { notification } from '../Toast';

  export let onClose: () => void;
  export let data: {
    id: string;
    name: string;
    email: string;
    role: string;
    simplifiedWorkspaces: Array<{
      workspace: {
        name: string;
        _id: string;
      };
      userRole: string;
    }>;
  };
  export let removeUserPopupOpen: () => void;
  export let onSuccess: () => void;
  export let hubId: string;
  let isLoading = false;
  const options = [
    { id: 'Admin', name: 'Admin' },
    { id: 'Member', name: 'Member' },
    { id: 'Remove User', name: 'Remove User' },
  ];

  const workspaceOptions = [
    { id: 'viewer', name: 'Viewer' },
    { id: 'editor', name: 'Editor' },
    { id: 'Remove User', name: 'Remove' },
  ];

  let selected = { id: data?.role, name: data?.role };
  let workspaceSelected: Record<string, { id: string; name: string }> = {};

  $: if (data?.simplifiedWorkspaces?.length) {
    workspaceSelected = {};

    data.simplifiedWorkspaces.forEach((ws, i) => {
      workspaceSelected[ws.workspace._id] = {
        id: ws.userRole,
        name: ws.userRole === 'editor' ? 'Editor' : 'Viewer',
      };
    });
  }

  async function handleRoleChange(event) {
    const selectedRole = event.detail.id;

    try {
      isLoading = true;
      if (selectedRole === 'Remove User') {
        removeUserPopupOpen();
        return;
      }

      if (selectedRole === 'Member' || selectedRole === 'Admin') {
        const action =
          selectedRole === 'Member'
            ? hubsService.changeRoletoMember
            : hubsService.changeRoletoAdmin;

        await action({ userId: data?.id, hubId });
        notification.success(`Successfully changed role to ${selectedRole}`);
        selected = event?.detail;
        onSuccess();
      }
    } catch (error) {
      notification.error(`Error while changing role to ${selectedRole.toLowerCase()}`);
    } finally {
      onClose();
      isLoading = false;
    }
  }

  async function handleWorkspaceRoleChange(event, workspace) {
    const selectedRole = event?.detail?.id;

    try {
      isLoading = true;
      if (selectedRole === 'Remove User') {
        await hubsService.deleteUserFromWorkspace({
          userId: data?.id,
          workspaceId: workspace?.workspace?._id,
        });
        notification.success('Successfully removed user from workspace');
      } else {
        await hubsService.changeRoles({
          params: { workspaceId: workspace?.workspace?._id, userId: data?.id },
          data: { role: selectedRole },
        });
        notification.success(`Successfully changed role to ${selectedRole.toLowerCase()}`);
        workspaceSelected[workspace.workspace._id] = event?.detail;
      }
      onSuccess();
    } catch (error) {
      notification.error(`Error while changing role to ${selectedRole.toLowerCase()}`);
    } finally {
      isLoading = false;
    }
  }
</script>

<section class="bg-surface-600 rounded-8px">
  <div class="p-6">
    <div class="flex flex-col gap-6">
      <div class="flex justify-between">
        <h2 class="font-fw-ds-500 text-fs-ds-20 leading-lh-ds-120 font-inter text-neutral-50">
          Access to Enterprise Hub
        </h2>
        <span on:click={onClose}><CloseIcon /></span>
      </div>

      <div class="flex flex-col gap-3">
        <div class="flex justify-between">
          <div class="flex flex-col gap-2">
            <h2 class="font-inter text-fs-ds-12 leading-lh-ds-130 font-fw-ds-400 text-neutral-50">
              {data.name}
            </h2>
            <h2 class="font-inter font-fw-ds-300 text-fs-ds-12 leading-lh-ds-150 text-neutral-300">
              {data.email}
            </h2>
          </div>
          <div class="relative">
            <MemberRolesDropdown
              dropdownId="hub-role-dropdown"
              {options}
              {selected}
              on:change={handleRoleChange}
            />
          </div>
        </div>

        <div class="border-b-surface-100 border-b"></div>

        <div class="h-[200px] overflow-y-auto">
          {#each data.simplifiedWorkspaces as workspace, i}
            <div
              class="text-fs-ds-12 font-fw-ds-500 leading-lh-ds-150 font-inter flex w-full justify-between p-1 text-neutral-400"
            >
              <h2>{workspace.workspace.name}</h2>
              <span>
                <MemberRolesDropdown
                  disabled={selected.id === 'Admin'}
                  dropdownId={`workspace-role-dropdown-${i}`}
                  selected={workspaceSelected[workspace.workspace._id]}
                  options={workspaceOptions}
                  on:change={(event) => handleWorkspaceRoleChange(event, workspace)}
                />
              </span>
            </div>
          {/each}
        </div>
      </div>
    </div>
  </div>
</section>
