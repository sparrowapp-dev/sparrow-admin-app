<script lang="ts">
  export let catchError: Function;

  // Simulating an error for demonstration
  setTimeout(() => {
    try {
      throw new Error('Something went wrong in Workspace!');
    } catch (error) {
      catchError(error);
    }
  }, 1000);
</script>

<div class="rounded-lg bg-white p-6 shadow-md">
  <h1 class="text-2xl font-bold text-black">Workspace</h1>
  <p class="mt-4 text-black">
    Welcome to your workspace page! This is where you can manage your projects and collaborate.
  </p>
</div>
