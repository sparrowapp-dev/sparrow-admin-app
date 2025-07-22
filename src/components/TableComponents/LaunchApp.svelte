<script lang="ts">
  import { SPARROW_LAUNCH_URL } from '@/constants/environment';
  import { captureEvent } from '@/utils/posthogConfig';

  export let workspaceId: string;
  export let hubId: string;
  export let ctaLocation:string = "Launch Sparrow";

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

      captureLaunchSparrowClick("workspace");
      // Open in a new tab
      window.open(url, '_blank');
    } else if (hubId) {
      // Build URL with required query parameters
      const baseUrl = `${SPARROW_LAUNCH_URL}/home`;
      const params = new URLSearchParams();

      // Add hubId parameter
      params.set('adminRedirectHubId', hubId);

      const url = `${baseUrl}?${params.toString()}`;

      captureLaunchSparrowClick("Hub");
      // Open in a new tab
      window.open(url, '_blank');
    }
  }

  const captureLaunchSparrowClick = (resourceType:string)=>{
    const eventProperties = {
      event_source : "admin_panel",
      resource:resourceType,
      cta_location:ctaLocation,
    }
    captureEvent("admin_launch_web_app", eventProperties);
  }
</script>

<button
  on:click={handleLaunch}
  class="flex cursor-pointer items-center gap-2 px-2 py-1 transition-colors"
>
  <span class="text-fs-ds-12 whitespace-nowrap text-blue-300 underline">Launch in Sparrow</span>
</button>
