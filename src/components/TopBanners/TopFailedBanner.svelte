<script>
  export let reDirect;
</script>

<div
  class="text-fs-ds-12 leading-lh-ds-130 font-fw-ds-400 relative flex h-7 w-full items-center justify-center border-[0.6px] border-red-900 bg-red-800 text-neutral-50"
>
  Payment failed: Please check or update billing details in the Admin Panel to avoid service
  interruption.&nbsp;<span
    on:click={reDirect}
    class="leading-lh-ds-130 text-fs-ds-12 font-inter cursor-pointer text-blue-300 underline"
    >Fix Now</span
  >
</div>
