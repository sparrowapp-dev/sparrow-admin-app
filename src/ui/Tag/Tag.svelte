<script lang="ts">
  export let text: string = '';
  export let bgColor: string = 'bg-blue-500';
  export let textColor: string = 'text-neutral-50';
  export let borderColor: string = '';
  export let size: 'xs' | 'sm' | 'md' = 'xs';

  // Compute size classes
  $: sizeClasses = {
    xs: 'text-fs-ds-10 px-1.5 py-0.5 font-fw-ds-400',
    sm: 'text-fs-ds-12 px-2 py-1 font-fw-ds-400',
    md: 'text-fs-ds-14 px-3 py-1 font-fw-ds-400',
  }[size];
</script>

<div
  class="inline-block rounded {bgColor} {textColor} {borderColor
    ? borderColor + ' border'
    : ''} {sizeClasses}"
>
  {text}
</div>
