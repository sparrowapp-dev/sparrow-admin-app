<script lang="ts">
  import TableModalCommonLayout from './Common/TableModalCommonLayout.svelte';
  import { createEventDispatcher, onMount } from 'svelte';
  import { hubsService } from '@/services/hubs.service';

  export let isOpen;
  export let currentPlan;
  export let selectedPlan;
  export let workspaces = [];
  export let hubId;
  export let planLimits:[];

  const dispatch = createEventDispatcher();
  let selected = new Set();
  let workspaceDetails = new Map();
  let loading = false;

  $: maxSelectable = planLimits?.workspacesPerHub?.value;
  
  console.log(currentPlan);
  const toggleWorkspace = (id) => {
    if (selected.has(id)) selected.delete(id);
    else if (selected.size < maxSelectable) selected.add(id);
    selected = new Set(selected);
  };

  const handleNext = async () => {
    const selectedWorkspaces = workspaces.filter((ws) => selected.has(ws.id));
    const unselected = workspaces.filter((ws) => !selected.has(ws.id));

    const isDowngradeToCommunity = selectedPlan?.toLowerCase?.() === 'community';
    let allMembers: any[] = [];

    if (isDowngradeToCommunity && selectedWorkspaces.length) {
      try {
        const results = await Promise.all(
          selectedWorkspaces.map(async (ws) => {
            const res = await hubsService.getWorkspaceDetails({
              workspaceId: ws.id,
              hubId,
              tab: 'members',
              page: 1,
              limit: 50,
              sortBy: 'updatedAt',
              sortOrder: 'desc',
            });

            const members = res?.data?.users || [];
            return members.map((m) => ({
              id: m._id,
              email: m.email,
              name: m.name || m.user || '',
              role: m.role || 'member',
            }));
          }),
        );

        const flattened = results.flat();
        const uniqueMembers = flattened.filter(
          (user, i, self) =>
            i ===
            self.findIndex((u) => u.email === user.email || u.id === user.id)
        );
    
        allMembers = uniqueMembers.filter((u) => (u.role || '').toLowerCase() !== 'owner');

        console.log('All unique workspace members:', allMembers);
      } catch (error) {
        console.error('Error fetching workspace members:', error);
      }
    }

    dispatch('next', {
      selected: selectedWorkspaces,
      unselected,
      members: allMembers,
    });
  };


  function getTimeDifference(updatedAt) {
    const updatedDate = new Date(updatedAt);
    const now = new Date();
    const diffInDays = Math.floor((now - updatedDate) / (1000 * 60 * 60 * 24));
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return '1 day ago';
    return `${diffInDays} days ago`;
  }
  onMount(async () => {
    const promises = workspaces.map(async (ws) => {
      try {
        const res = await hubsService.getWorkspaceDetails({
          workspaceId: ws.id,
        });

        console.log('Workspace Details Response:', res);
      } catch (error) {
        console.error('Error fetching workspace details:', error);
      }
    });
  });

  onMount(async () => {
    if (!workspaces?.length) return;
    loading = true;
    const promises = workspaces.map(async (ws) => {
      try {
        const res = await hubsService.getWorkspaceSummary({ workspaceId: ws.id, hubId });
        const data = res?.data;
        workspaceDetails.set(ws.id, {
          collections: data?.totalCollections ?? '-',
          contributors: data?.totalContributors ?? '-',
          updated: data?.updatedAt ? getTimeDifference(data.updatedAt) : '-',
        });
        workspaceDetails = new Map(workspaceDetails);
      } catch (err) {
        console.error(`Failed to fetch ${ws.name}`, err);
      }
    });
    await Promise.all(promises);
    loading = false;
  });
</script>

<TableModalCommonLayout
  {isOpen}
  title="Choose Your Active Workspaces"
  subheading1="Your new plan includes {maxSelectable} active private workspaces. Please select the ones you want to keep active below."
  subheading2="Unselected workspaces will be safely archived and can be restored anytime by upgrading."
  {maxSelectable}
  stepIndicator={maxSelectable === 3 ? true : false}
  selectedCount={selected.size}
  isPrimaryDisabled={selected.size !== maxSelectable}
  confirmText="Confirm Selection"
  on:confirm={handleNext}
  on:close={() => dispatch('close')}
>
  <div slot="stepIndicator" class="flex items-center gap-2">
    <div class="flex items-center gap-1">
      <div
        class="text-fs-ds-12 flex h-5 w-5 items-center justify-center rounded-full bg-[#2B74FF] font-medium"
      >
        1
      </div>
      <span class="text-fs-ds-14 font-medium text-gray-300">Step 1</span>
    </div>
    <div class="mx-2 h-px w-12 border-t border-dotted bg-gray-600"></div>
    <span class="text-fs-ds-14 text-gray-400">Step 2</span>
  </div>
  <!-- Slot: table content -->
  <div class="flex-grow overflow-y-auto">
    <table class="text-fs-ds-12 w-full border-collapse text-white">
      <thead class="sticky top-0 z-10 bg-[#181C26] text-left text-gray-400">
        <tr>
          <th class="w-[20px] py-2"></th>
          <th class="px-4 py-2">Workspaces</th>
          <th class="px-4 py-2">Collections</th>
          <th class="px-4 py-2">Contributors</th>
          <th class="px-3 py-2">Last updated</th>
        </tr>
      </thead>
      <tbody>
        {#each workspaces as ws}
          <tr
            class="cursor-pointer transition-colors hover:bg-[#2A2F3A]"
            on:click={() => toggleWorkspace(ws.id)}
          >
            <td class="relative px-2 py-2 text-center">
              <label class="relative flex items-center justify-center">
                <input
                  type="checkbox"
                  checked={selected.has(ws.id)}
                  on:change={() => toggleWorkspace(ws.id)}
                  disabled={!selected.has(ws.id) && selected.size >= maxSelectable}
                  class="peer h-4 w-4 cursor-pointer appearance-none rounded-sm border border-[#2A2F3A] bg-[#1E222C] checked:border-[#2B74FF] checked:bg-[#2B74FF] focus:outline-none"
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
            </td>

            <td class="px-4 py-3 font-bold">{ws.name}</td>
            <td class="px-4 py-3 font-bold">{workspaceDetails.get(ws.id)?.collections ?? '-'}</td>
            <td class="px-4 py-3 font-bold">{workspaceDetails.get(ws.id)?.contributors ?? '-'}</td>
            <td class="px-4 py-3 font-bold">{workspaceDetails.get(ws.id)?.updated ?? '-'}</td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</TableModalCommonLayout>
