<script lang="ts">
  import PlusIcon from '@/assets/icons/PlusIcon.svelte';
  import AddWorkspace from '@/components/AddWorkspace/AddWorkspace.svelte';
  import Modal from '@/components/Modal/Modal.svelte';
  import Button from '@/ui/Button/Button.svelte';

  let showModal = false;
  const data = {
    teamName: 'Enterprise Hub',
    workspace: [],
  };
</script>

<section class="w-full">
  <h1 class="font-inter text-fs-ds-28 font-fw-ds-500 py-4 text-neutral-50">{data?.teamName}</h1>
  <h4 class="font-inter text-fs-ds-16 font-fw-ds-400 py-2 text-neutral-50">Workspaces</h4>
  <p class="font-inter text-fs-ds-14 font-fw-ds-300 text-neutral-100">
    All your Hub’s workspaces in one place, manage access, rename, or dive into details with ease.
  </p>

  <Button variant="filled-primary" size="small" iconLeft={true} on:click={() => (showModal = true)}>
    <svelte:fragment slot="iconLeft">
      <PlusIcon />
    </svelte:fragment>
    New Workspace</Button
  >

  {#if showModal}
    <Modal on:close={() => (showModal = false)}>
      <AddWorkspace onClose={() => (showModal = false)} />
    </Modal>
  {/if}
</section>
