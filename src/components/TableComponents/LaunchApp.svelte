<script lang="ts">
  import { SPARROW_LAUNCH_URL } from '@/constants/environment';

  export let workspaceId: string;
  export let hubId: string;

  function handleLaunch(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();

    if (workspaceId) {
      // Build URL with required query parameters
      const baseUrl = `${SPARROW_LAUNCH_URL}/app/collections`;
      const params = new URLSearchParams();

      // Add workspaceId parameter
      params.set('adminRedirectWorkspaceId', workspaceId);

      const url = `${baseUrl}?${params.toString()}`;

      // Open in a new tab
      window.open(url, '_blank');
    } else if (hubId) {
      // Build URL with required query parameters
      const baseUrl = `${SPARROW_LAUNCH_URL}/home`;
      const params = new URLSearchParams();

      // Add hubId parameter
      params.set('adminRedirectHubId', hubId);

      const url = `${baseUrl}?${params.toString()}`;

      // Open in a new tab
      window.open(url, '_blank');
    }
  }
</script>

<button
  on:click={handleLaunch}
  class="flex cursor-pointer items-center gap-2 px-2 py-1 transition-colors"
>
  <span class="text-fs-ds-12 whitespace-nowrap text-blue-300 underline">Launch in Sparrow</span>
</button>
