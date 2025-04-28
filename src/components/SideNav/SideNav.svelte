<script lang="ts">
  import { Link } from 'svelte-routing';
</script>

<div class="w-64 bg-gray-800 p-4 text-white">
  <h2 class="mb-6 text-xl font-bold">Dashboard</h2>
  <ul>
    <li>
      <Link to="/workspace" class="block rounded px-4 py-2 hover:bg-gray-700">Workspace</Link>
    </li>
    <li>
      <Link to="/hubs" class="block rounded px-4 py-2 hover:bg-gray-700">Hubs</Link>
    </li>
  </ul>
</div>
