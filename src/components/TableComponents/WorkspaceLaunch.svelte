<script lang="ts">
  import { SPARROW_LAUNCH_URL } from '@/constants/environment';

  export let workspaceId: string;
</script>

<a
  href={`sparrow://`}
  target="_blank"
  rel="noopener noreferrer"
  class="flex items-center gap-2 px-2 py-1 transition-colors"
>
  <span class="text-fs-ds-12 whitespace-nowrap text-blue-300 underline">Launch in Sparrow</span>
</a>
