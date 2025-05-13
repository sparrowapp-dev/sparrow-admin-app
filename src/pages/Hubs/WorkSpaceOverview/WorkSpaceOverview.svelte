<script lang="ts">
  import BottomWorkspace from './BottomWorkspace.svelte';
  import TopWorkspace from './TopWorkspace.svelte';
  import { topdata } from './dummyData';
</script>

<section class="font-inter w-full text-neutral-50">
  <div class="flex flex-col gap-6">
    <TopWorkspace {topdata} />
    <BottomWorkspace />
  </div>
</section>
