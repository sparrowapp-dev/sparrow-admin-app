import { writable } from 'svelte/store';

// Store to trigger hub details refetch across components
export const hubDetailsRefreshTrigger = writable(0);

// Function to trigger a refresh of hub details
export const triggerHubDetailsRefresh = () => {
  hubDetailsRefreshTrigger.update(n => n + 1);
};