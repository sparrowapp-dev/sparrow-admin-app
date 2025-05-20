<script>
  export let label;
  export let value;
</script>

<div class="bg-surface-600 rounded-lg p-6">
  <div class="flex flex-col gap-3">
    <div class="text-fs-ds-14 leading-lh-ds-143 font-fw-ds-400 text-neutral-50">
      {label}
    </div>
    <div class="font-inter text-fs-ds-24 leading-lh-ds-120 font-medium text-neutral-50">
      {value}
    </div>
  </div>
</div>
