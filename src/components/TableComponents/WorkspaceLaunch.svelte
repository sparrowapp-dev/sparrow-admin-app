<script lang="ts">
  export let workspaceId: string;

  function handleLaunch(event: MouseEvent) {
    event.preventDefault();
    window.location.href = `sparrow://`;
  }
</script>

<button on:click={handleLaunch} class="cursor-pointer flex items-center gap-2 px-2 py-1 transition-colors">
  <span class="text-fs-ds-12 whitespace-nowrap text-blue-300 underline">Launch in Sparrow</span>
</button>
