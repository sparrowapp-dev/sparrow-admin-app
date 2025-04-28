import { writable } from 'svelte/store';

type AuthData = {
  token: string;
  refresh: string;
  email: string;
};

// Retrieve auth data from localStorage, if available
const saved = localStorage.getItem('auth');
export const auth = writable<AuthData | null>(saved ? JSON.parse(saved) : null);

// Sync the store with localStorage
auth.subscribe((value) => {
  if (value) {
    localStorage.setItem('auth', JSON.stringify(value));
  } else {
    localStorage.removeItem('auth');
  }
});
