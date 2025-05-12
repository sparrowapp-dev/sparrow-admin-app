<script lang="ts">
  import { navigate } from 'svelte-routing';
  import Navbarbg1 from '../../assets/images/NavbarBg1.png';
  import Sparrowadmin from '@/assets/icons/Sparrowadmin.svelte';
  import LaunchSparrow from '@/assets/icons/LaunchSparrow.svelte';
  import LaunchSparrow2 from '@/assets/icons/LaunchSparrow2.svelte';
  import BellIcon from '@/assets/icons/BellIcon.svelte';
  import Tooltip from '../Tooltip/Tooltip.svelte';
  import { userName } from '@/store/auth';
</script>

<div
  class="bg-surface-700 border-surface-900 relative flex max-h-[48px] w-full items-center border-b-4 px-2 py-3 text-neutral-50 shadow-md"
>
  <div
    class="absolute left-4 z-0 bg-cover bg-no-repeat opacity-100"
    style="background-image: url({Navbarbg1})"
  ></div>
  <div class="relative z-10 flex w-full items-center justify-between">
    <div class="font-fw-ds-600 text-xl">
      <div class="flex items-center gap-3">
        <Sparrowadmin />
        <h2 class="font-inter text-fs-ds-16 leading-lh-ds-150 font-fw-ds-400">Sparrow Admin</h2>
      </div>
    </div>
    <div class="flex items-center gap-4 px-1">
      <!-- Profile button -->
      <a href="https://web.sparrowapp.dev/app/collections" target="_blank">
        <button
          class="flex min-h-7 min-w-fit cursor-pointer items-center gap-1 rounded px-2 py-1 focus-visible:outline-2 focus-visible:outline-blue-300"
          ><span><LaunchSparrow /> </span>
          <p class="font-inter text-fs-ds-12 leading-lh-ds-130 font-fw-ds-400">Launch Sparrow</p>
          <span><LaunchSparrow2 /> </span></button
        ></a
      >
      <button
        class="font-inter font-fw-ds-400 text-fs-ds-12 leading-lh-ds-130 flex min-h-7 min-w-fit cursor-pointer items-center justify-center rounded px-2 py-1 text-center focus-visible:outline-2 focus-visible:outline-blue-300"
        >Help & Support</button
      >
      <a href="https://docs.sparrowapp.dev/" target="_blank">
        <button
          class="flex min-h-[28px] cursor-pointer items-center gap-0.5 rounded py-1 pr-[6px] pl-2 focus-visible:outline-2 focus-visible:outline-blue-300"
          ><p class="font-inter font-fw-ds-400 text-fs-ds-12 leading-lh-ds-130 font-fw-ds-400">
            Documentation
          </p>
          <span><LaunchSparrow2 /> </span>
        </button>
      </a>
      <Tooltip text="Notification" position="bottom" mode="hover" size="sm"
        ><button
          class="hover:bg-surface-300 cursor-pointer rounded p-1 focus-visible:outline-2 focus-visible:outline-blue-300"
          ><BellIcon />
        </button>
      </Tooltip>
      <button
        class="font-inter font-fw-ds-400 text-fs-ds-12 leading-lh-ds-130 h-[24px] w-[24px] rounded-[100px] bg-purple-400 text-center focus-visible:outline-2 focus-visible:outline-blue-300"
        >{$userName?.charAt(0)}</button
      >
    </div>
  </div>
</div>
