<script lang="ts">
  import HomeIcon from '@/assets/icons/homeIcon.svg';
  import ChartIcon from '@/assets/icons/chartIcon.svg';
  import UsersIcon from '@/assets/icons/usersIcon.svg';
  import WorkspaceIcon from '@/assets/icons/workspaceIcon.svg';
  import { Link } from 'svelte-routing';
</script>

<div class="bg-surface-300 w-14 p-4 text-white">
  <ul>
    <li>
      <Link to="/workspace" class=" rounded px-4 py-2 hover:bg-gray-700">
        <img src={HomeIcon} alt="" />
      </Link>
    </li>
    <li>
      <Link to="/workspace" class=" rounded px-4 py-2 hover:bg-gray-700">
        <img src={ChartIcon} alt="" />
      </Link>
    </li>
    <li>
      <Link to="/workspace" class=" rounded px-4 py-2 hover:bg-gray-700">
        <img src={WorkspaceIcon} alt="" />
      </Link>
    </li>
    <li>
      <Link to="/hubs" class=" rounded px-4 py-2 hover:bg-gray-700">
        <img src={UsersIcon} alt="" />
      </Link>
    </li>
  </ul>
</div>
