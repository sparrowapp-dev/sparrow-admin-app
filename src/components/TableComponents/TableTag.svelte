<script lang="ts">
  export let value: string;

  // Color mapping for plans
  const colorMap: Record<string, string> = {
    Professional: 'bg-blue-600 border-blue-400 text-white',
    Standard: 'bg-green-600 border-green-400 text-white',
    Community: 'bg-neutral-700 border-neutral-500 text-white',
    Pro: 'bg-purple-600 border-purple-400 text-white',
    Enterprise: 'bg-yellow-600 border-yellow-400 text-black',
    // Add more plan types as needed
  };

  $: colorClass = colorMap[value] || 'bg-neutral-700 border-neutral-500 text-white';
</script>

<span
  class={`text-fs-ds-12 leading-lh-ds-130 font-inter font-regular w-fit rounded-[2px] border px-1 py-0.5 ${colorClass}`}
  >{value}</span
>
