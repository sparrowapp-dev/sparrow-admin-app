<script lang="ts">
  import GiftIcon from '@/assets/icons/GiftIcon.svelte';
  import Dropdown from '../ReusableDropdown/Dropdown.svelte';
  import { Link } from 'svelte-routing';
  let dropdownOpen = false;
  let selectOption = null;
  const apiResponse = [
    {
      teamId: '67dd3d367331fd132b665738',
      teamName: "Mithesh's TeamxXZ",
      role: 'owner',
      users: [
        {
          id: '67dd3d367331fd132b665737',
          email: 'mithesh.bangera@techdome.net.in',
          name: 'Mithesh Bangera',
          role: 'owner',
        },
      ],
      workspaces: [
        {
          id: '67dd3d697331fd132b66573a',
          name: 'My Workspace',
        },
        {
          id: '67dd3ea47331fd132b66573c',
          name: 'My Workspace 2',
        },
      ],
    },
    {
      teamId: '67fe3e9c8a47696105024e39',
      teamName: 'asd2',
      role: 'owner',
      users: [
        {
          id: '67dd3d367331fd132b665737',
          email: 'mithesh.bangera@techdome.net.in',
          name: 'Mithesh Bangera',
          role: 'owner',
        },
      ],
      workspaces: [],
    },
  ];

  const dropdownOptions = apiResponse.map((team) => ({
    label: team.teamName,
    value: team, // full team object
    plan: team.plan, // optional plan value, can be undefined
  }));
</script>

<section class="bg-surface-700 h-full w-full rounded-r-xl p-3">
  <div class="flex flex-col gap-3">
    <div class="border-surface-100 border-b pb-3">
      <Dropdown
        bind:open={dropdownOpen}
        icon={GiftIcon}
        label={selectOption?.teamName ? selectOption?.teamName : 'Select your Hub'}
        options={dropdownOptions}
        onSelect={(val) => (selectOption = val)}
      />
    </div>
    {#if selectOption}
      <nav class="flex flex-col gap-0.5 p-2">
        {#if !dropdownOpen}
          <Link
            to={`/hubs/workspace/${selectOption.teamId}`}
            class="font-inter font-fw-ds-400 text-fs-ds-12 leading-lh-ds-130 hover:bg-surface-500 cursor-pointer rounded-sm p-3 text-neutral-50"
          >
            Workspace
          </Link>
          <Link
            to={`/hubs/members/${selectOption.teamId}`}
            class="font-inter font-fw-ds-400 text-fs-ds-12 leading-lh-ds-130 hover:bg-surface-500 cursor-pointer rounded-sm p-3 text-neutral-50"
          >
            Members
          </Link>
          <Link
            to={`/hubs/settings/${selectOption.teamId}`}
            class="font-inter font-fw-ds-400 text-fs-ds-12 leading-lh-ds-130 hover:bg-surface-500 cursor-pointer rounded-sm p-3 text-neutral-50"
          >
            Settings
          </Link>
        {/if}
      </nav>
    {/if}
  </div>
</section>
