import { writable } from 'svelte/store';

// Store to manage hub data refetch events
export const hubRefetchTrigger = writable(0);

// Function to trigger hub data refetch
export function triggerHubRefetch() {
  hubRefetchTrigger.update((n) => n + 1);
}
