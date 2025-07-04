<script lang="ts">
  import { tweened } from 'svelte/motion';
  import { cubicOut } from 'svelte/easing';
  import { onMount } from 'svelte';
  import { formatDate } from '@/utils/TimeFunction';

  export let activities: Array<{ user: { name: string }; message: string; createdAt: string }> = [];
  export let loading = false;
  export let emptyMessage = 'No recent activity to display';

  // Function to get user initials
  function getUserInitials(name: string): string {
    if (!name) return '??';

    const nameParts = name.trim().split(' ');
    if (nameParts.length === 1) {
      return nameParts[0].substring(0, 2).toUpperCase();
    }

    return (nameParts[0].charAt(0) + nameParts[nameParts.length - 1].charAt(0)).toUpperCase();
  }

  $: displayActivities = activities;
</script>

<div class="activity-feed w-full">
  {#if loading}
    <div class="flex w-full flex-col space-y-4">
      {#each Array(3) as _}
        <div class="flex animate-pulse items-start space-x-3">
          <div class="bg-surface-600 h-10 w-10 rounded-full"></div>
          <div class="flex-1">
            <div class="bg-surface-600 mb-2 h-4 w-3/4 rounded"></div>
            <div class="bg-surface-600 h-3 w-1/4 rounded"></div>
          </div>
        </div>
      {/each}
    </div>
  {:else if displayActivities.length === 0}
    <div class="font-inter text-fs-ds-14 py-10 text-center text-neutral-300">
      {emptyMessage}
    </div>
  {:else}
    <div class="relative flex flex-col space-y-8">
      {#each displayActivities as activity, index}
        <div
          class="activity-item relative z-10 flex items-start space-x-3"
          style="animation-delay: {index * 80}ms;"
        >
          <!-- User initial circle -->
          <div
            class="border-surface-50 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border bg-purple-400 font-medium text-white"
            style="font-size: 16px;"
          >
            {getUserInitials(activity.user?.name)}
          </div>

          <!-- Activity content -->
          <div class="flex-1">
            <p class="font-inter font-fw-ds-400 text-fs-ds-12 break-all text-neutral-50">
              {activity.message}
            </p>
            <span class="font-inter font-fw-ds-300 text-fs-ds-12 text-neutral-300">
              {formatDate(activity.createdAt)}
            </span>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
  @keyframes stackIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  .activity-item {
    opacity: 0;
    animation: stackIn 500ms ease-out forwards;
  }
</style>
