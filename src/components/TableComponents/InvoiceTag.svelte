<script lang="ts">
  import Tag from '../../ui/Tag/Tag.svelte';
  import { getDynamicCssClasses } from '../../utils/planTagStyles';
  export let value: string;

  $: tagProps = getDynamicCssClasses(value);
</script>

<Tag
  text={value}
  bgColor={tagProps.bgColor}
  borderColor={tagProps.borderColor}
  textColor={tagProps.textColor}
  size="xs"
/>
