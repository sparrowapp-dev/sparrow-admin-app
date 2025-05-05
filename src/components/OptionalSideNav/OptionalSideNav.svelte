<script lang="ts">
  import GiftIcon from '@/assets/icons/GiftIcon.svelte';
  import Dropdown from '../ReusableDropdown/dropdown.svelte';
  import { data } from './data';
</script>

<section class="bg-surface-700 h-full w-full rounded-r-xl p-3">
  <div class="flex flex-col gap-3">
    <div class="border-surface-100 border-b pb-3">
      <Dropdown
        icon={GiftIcon}
        label="Enterprise Hub"
        options={[
          { value: 'Integration Hub', plan: 'Enterprise' },
          { value: 'Dev Hub', plan: 'Community' },
          { value: 'Core Hub', plan: 'Standard' },
          { value: 'SprintHub', plan: 'Professional' },
          { value: 'Enterprise Hub', plan: 'Enterprise' },
          { value: 'Enterprise Hub', plan: 'Enterprise' },
          { value: 'Enterprise Hub', plan: 'Enterprise' },
          { value: 'Enterprise Hub', plan: 'Enterprise' },
          { value: 'Enterprise Hub', plan: 'Enterprise' },
          { value: 'Enterprise Hub', plan: 'Enterprise' },
        ]}
        onSelect={(val) => console.log('Selected value:', val)}
      />
    </div>
    <div class="flex flex-col gap-0.5">
      {#each data as item}
        <div class="font-inter font-regular text-fs-ds-12 leading-lh-ds-130 p-3 text-neutral-50">
          {item}
        </div>
      {/each}
    </div>
  </div>
</section>
