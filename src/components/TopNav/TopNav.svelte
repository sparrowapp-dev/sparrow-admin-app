<script lang="ts">
  import { navigate } from 'svelte-routing';
  import Navbarbg1 from '../../assets/images/NavbarBg1.png';
  import Sparrowadmin from '@/assets/icons/Sparrowadmin.svelte';
  import LaunchSparrow from '@/assets/icons/LaunchSparrow.svelte';
  import LaunchSparrow2 from '@/assets/icons/LaunchSparrow2.svelte';
  import BellIcon from '@/assets/icons/BellIcon.svelte';
  import Tooltip from '../Tooltip/Tooltip.svelte';
  import { userName } from '@/store/auth';
  import { onDestroy, onMount } from 'svelte';
  import { SPARROW_DOCS_URL, SPARROW_LAUNCH_URL } from '@/constants/environment';
  let focusedPath: string | null = null;
  let hoveredPath: string | null = null;
  let isPressed: string | null = null;
  function launchSparrow() {
    window.open(`${SPARROW_LAUNCH_URL}app/collections`, '_blank');
  }

  const docsUrl = SPARROW_DOCS_URL;
  function navigateToSparrowDocs() {
    window.open(docsUrl, '_blank');
  }
  onMount(() => {
    window.addEventListener('pointerup', handleGlobalPointerUp);
  });

  // Clean up event listeners
  onDestroy(() => {
    window.removeEventListener('pointerup', handleGlobalPointerUp);
  });
  function handleGlobalPointerUp() {
    setTimeout(() => {
      isPressed = null;
    }, 100);
  }
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
      <button
        on:click={launchSparrow}
        class="flex min-h-7 min-w-fit cursor-pointer items-center gap-1 rounded px-2 py-1 focus-visible:outline-2 focus-visible:outline-blue-300"
        ><span><LaunchSparrow /> </span>
        <p class="font-inter text-fs-ds-12 leading-lh-ds-130 font-fw-ds-400">Launch Sparrow</p>
        <span><LaunchSparrow2 /> </span></button
      >
      <a
        href="https://sparrowapp.canny.io/feedback"
        target="_blank"
        class="font-inter font-fw-ds-400 text-fs-ds-12 leading-lh-ds-130 hover:bg-surface-600 flex min-h-7 min-w-fit cursor-pointer items-center justify-center rounded px-2 py-1 text-center transition-colors focus-visible:outline-2 focus-visible:outline-blue-300"
      >
        Help & Support
      </a>

      <button
        on:click={navigateToSparrowDocs}
        class="flex min-h-[28px] cursor-pointer items-center gap-0.5 rounded py-1 pr-[6px] pl-2 focus-visible:outline-2 focus-visible:outline-blue-300"
        ><p class="font-inter font-fw-ds-400 text-fs-ds-12 leading-lh-ds-130">Documentation</p>
        <span><LaunchSparrow2 /> </span>
      </button>

      <!-- <Tooltip
        text="Notification"
        position="bottom"
        mode="controlled"
        show={focusedPath === '/notification' || hoveredPath === '/notification'}
        size="sm"
        ><button
          class="hover:bg-surface-300 active:bg-surface-300 cursor-pointer rounded p-1 focus-visible:outline-2 focus-visible:outline-blue-300"
          on:mouseenter={() => (hoveredPath = '/notification')}
          on:mouseleave={() => (hoveredPath = null)}
          on:focus={() => (focusedPath = '/notification')}
          on:blur={() => (focusedPath = null)}
          on:click={() => (isPressed = '/notification')}
          ><BellIcon isPressed={isPressed === '/notification'} />
        </button>
      </Tooltip> -->
      <Tooltip text="Notification" position="bottom" mode="controlled" show={false} size="sm">
        <button
          class="cursor-not-allowed rounded p-1 opacity-50"
          on:mouseenter|preventDefault
          on:mouseleave|preventDefault
          on:focus|preventDefault
          on:blur|preventDefault
          on:click|preventDefault
        >
          <BellIcon isPressed={false} />
        </button>
      </Tooltip>

      <button
        class="font-inter font-fw-ds-400 text-fs-ds-12 leading-lh-ds-130 h-[24px] w-[24px] rounded-[100px] bg-purple-400 text-center focus-visible:outline-2 focus-visible:outline-blue-300"
        >{$userName?.charAt(0).toUpperCase()}</button
      >
    </div>
  </div>
</div>
