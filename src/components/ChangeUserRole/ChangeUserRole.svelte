<script lang="ts">
  import CloseIcon from '@/assets/icons/CloseIcon.svelte';
  import MemberRolesDropdown from '../MemberRoleDropdown/MemberRolesDropdown.svelte';
  import { hubsService } from '@/services/hubs.service';
  import { notification } from '../Toast';
  import { captureEvent } from '@/utils/posthogConfig';

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
  } | null = null;
  export let removeUserPopupOpen: () => void;
  export let onSuccess: () => void;
  export let hubId: string | null = null;
  export let hubName: string | null = null;
  export let changingRolePopupOpen;
  let isLoading = false;
  let options = [
    { id: 'Admin', name: 'Admin' },
    { id: 'Member', name: 'Member' },
    { id: 'Remove User', name: 'Remove User' },
  ];

  const workspaceOptions = [
    { id: 'viewer', name: 'Viewer' },
    { id: 'editor', name: 'Editor' },
    { id: 'Remove User', name: 'Remove' },
  ];
  let selected: { id: string; name: string } = { id: '', name: '' };
  $: if (data) {
    selected = {
      id: data?.role,
      name: data?.role.charAt(0).toUpperCase() + data?.role.slice(1)?.toLowerCase(),
    };
  }
  let workspaceSelected: Record<string, { id: string; name: string }> = {};

  $: if (data?.simplifiedWorkspaces?.length) {
    workspaceSelected = {};

    data.simplifiedWorkspaces?.forEach((ws, i) => {
      workspaceSelected[ws.workspace._id] = {
        id: ws.userRole,
        name: ws.userRole?.charAt(0).toUpperCase() + ws.userRole.slice(1)?.toLowerCase(),
      };
    });
  }

  async function handleRoleChange(event) {
    let previouslySelectedRole = selected;
    const selectedRole = event.detail.id;
    captureUserRoleChange(selected.name, selectedRole);
    selected = event?.detail;
    if (selectedRole === 'Remove User') {
      removeUserPopupOpen();
      return;
    } else {
      changingRolePopupOpen();
      return;
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
        notification.success(
          `"${data?.name ? (data?.name.length > 15 ? `${data?.name.slice(0, 15)}...` : data?.name) : ''}" is removed from "${workspace.workspace.name.length > 20 ? `${workspace.workspace.name.slice(0, 20)}` : workspace?.workspace.name}".`,
        );
      } else {
        await hubsService.changeRoles({
          params: { workspaceId: workspace?.workspace?._id, userId: data?.id },
          data: { role: selectedRole },
        });
        notification.success(
          `Successfully changed role to ${selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1).toLowerCase()}.`,
        );

        workspaceSelected[workspace.workspace._id] = event?.detail;
      }
      onSuccess();
    } catch (error) {
      if (selectedRole === 'Remove User') {
        notification.error(
          `Failed to remove “${data?.name ? (data?.name?.length > 15 ? `${data?.name.slice(0, 15)}...` : data?.name) : ''}” from “${workspace?.workspace.name.length > 20 ? `${workspace?.workspace.name.slice(0, 20)}` : workspace?.workspace.name}”. Please try again.`,
        );
      } else {
        notification.error(
          `Error while changing role to ${selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1).toLowerCase()}`,
        );
      }
    } finally {
      isLoading = false;
    }
  }

  const captureUserRoleChange = (currentRole: string, updatedRole: string) => {
    const eventProperties = {
      role_change: `${currentRole} to ${updatedRole}`,
    };
    captureEvent('admin_workspace_row_actions_clicked', eventProperties);
  };
</script>

<section class="bg-surface-600 rounded-lg">
  <div class="p-6">
    <div class="flex flex-col gap-6">
      <div class="flex justify-between">
        <h2 class="font-fw-ds-500 text-fs-ds-20 leading-lh-ds-120 font-inter text-neutral-50">
          Access to {hubName} Hub
        </h2>
        <span class="cursor-pointer" on:click={onClose}><CloseIcon /></span>
      </div>

      <div class="flex flex-col gap-3">
        <div class="flex justify-between">
          <div class="flex flex-col">
            <h2 class="font-inter text-fs-ds-12 leading-lh-ds-130 font-fw-ds-400 text-neutral-50">
              {data?.name
                ? data?.name?.length > 15
                  ? `${data?.name.slice(0, 15)}...`
                  : data?.name
                : ''}
            </h2>
            <h2 class="font-inter font-fw-ds-300 text-fs-ds-12 leading-lh-ds-150 text-neutral-300">
              {data?.email
                ? data?.email?.length > 20
                  ? `${data?.email.slice(0, 20)}...`
                  : data?.email
                : ''}
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
          {#if data?.simplifiedWorkspaces && data.simplifiedWorkspaces?.length > 0}
            {#each data.simplifiedWorkspaces as workspace, i}
              {#if workspace.userRole !== null}<div
                  class="text-fs-ds-12 font-fw-ds-500 leading-lh-ds-150 font-inter flex w-full items-center justify-between p-1 text-neutral-400"
                >
                  <h2>
                    {workspace.workspace.name.length > 20
                      ? `${workspace.workspace.name.slice(0, 20)}...`
                      : workspace.workspace.name}
                  </h2>
                  <span class="">
                    <MemberRolesDropdown
                      disabled={selected?.id.toLowerCase() === 'admin'}
                      dropdownId={`workspace-role-dropdown-${i}`}
                      selected={workspaceSelected[workspace.workspace._id]}
                      options={workspaceOptions}
                      on:change={(event) => {
                        handleWorkspaceRoleChange(event, workspace);
                        captureUserRoleChange(workspace.userRole, event?.detail?.id);
                      }}
                    />
                  </span>
                </div>{/if}
            {/each}
          {/if}
        </div>
      </div>
    </div>
  </div>
</section>
