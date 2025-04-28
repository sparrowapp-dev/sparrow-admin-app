<script lang="ts">
  import { Link } from 'svelte-routing';
</script>

<div class="w-62 bg-gray-800 p-4 text-white">
  <ul>
    <li>
      <Link to="/workspace" class="block rounded px-4 py-2 hover:bg-gray-700">Workspace</Link>
    </li>
    <li>
      <Link to="/hubs" class="block rounded px-4 py-2 hover:bg-gray-700">Hubs</Link>
    </li>
  </ul>
</div>
