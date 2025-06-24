<script lang="ts">
  import SparrowBirdBg from '@/assets/icons/SparrowBirdBg.svelte';
</script>

<div
  class="bg-surface-900 flex h-full w-full flex-col items-center justify-center px-4 text-center"
>
  <SparrowBirdBg />

  <h1 class="font-fw-ds-500 font-inter text-fs-ds-32 mt-5 max-w-xl text-neutral-50">
    You don’t have access to Billing
  </h1>
  <p class="font-fw-ds-300 font-inter text-fs-ds-12 mt-5 max-w-2xl text-neutral-400">
    Looks like you don't have access. Only the hub owner or admins can manage the billing details
    and subscription plans. If you have any questions, we're here to help, reach out to us at <a
      href="mailto:contactus@sparrowapp.dev"
      class="text-blue-400 underline">contactus@sparrowapp.dev</a
    >
  </p>
</div>
