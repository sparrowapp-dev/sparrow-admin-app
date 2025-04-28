<script lang="ts">
  import { navigate } from 'svelte-routing';

  // Function to clear storage and navigate to NotFound route
  function handleLogout() {
    localStorage.clear();

    navigate('*');
  }
</script>

<div class="bg-gray-900 p-4 text-white shadow-md">
  <div class="flex items-center justify-between">
    <h1 class="text-xl font-semibold">Admin Panel</h1>
    <div class="space-x-4">
      <!-- Profile button -->
      <button class="rounded p-2 hover:bg-gray-700">Profile</button>

      <!-- Logout button that clears storage and navigates to NotFound -->
      <button on:click={handleLogout} class="rounded p-2 hover:bg-gray-700">Logout</button>
    </div>
  </div>
</div>
