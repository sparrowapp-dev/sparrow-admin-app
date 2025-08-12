<script lang="ts">
  import { useLocation, navigate } from 'svelte-routing';
  import { userId } from '@/store/auth';
  import { validateQueryToken } from '@/utils/tokenValidation';
  import SparrowBirdBg from '@/assets/icons/SparrowBirdBg.svelte';
  import { clearTokens } from '@/store/auth';
  import Button from '@/ui/Button/Button.svelte';

  export let autoLogin: boolean = false;

  const location = useLocation();
  let currentUserId: string | null = null;
  let queryToken: string | null = null;
  let showGlobalAlert = false;
  let isProfileDropdownOpen = false;

  const LOGIN_REDIRECT_URL = '/login';

  $: currentUserId = $userId;
  $: if ($location) {
    extractAndValidateToken();
  }

  function extractAndValidateToken() {
    const urlParams = new URLSearchParams($location.search);
    const tokenFromUrl = urlParams.get('xid');

    if (tokenFromUrl) {
      queryToken = tokenFromUrl;
      validateToken();
    } else {
      showGlobalAlert = false;
      queryToken = null;
    }
  }

  function validateToken() {
    if (!queryToken || !currentUserId) return;

    const { isSameUser } = validateQueryToken(queryToken, currentUserId);

    if (!isSameUser) {
      showGlobalAlert = true;
    }
  }

  function handleLogout() {
    try {
      isProfileDropdownOpen = false;
      clearTokens();
      navigate(LOGIN_REDIRECT_URL);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }

  function handleCancel() {
    navigate('/hubs');
  }
</script>

<!-- Global Authentication Alert -->
{#if showGlobalAlert}
  <div
    class="bg-surface-900 flex h-screen w-full flex-col items-center justify-center px-4 text-center"
  >
    <SparrowBirdBg />
    <h1 class="font-fw-ds-500 font-inter text-fs-ds-16 mt-5 max-w-xl text-neutral-200">
      Account does not match with logged in account
    </h1>
    <p class="font-fw-ds-400 font-inter text-fs-ds-14 max-w-xl text-neutral-400">
      This link belongs to a different account. To continue, please log out and sign in with the
      correct account.
    </p>

    <div class="mt-6 flex w-full max-w-xl items-center justify-center gap-3">
      <Button variant="filled-secondary" size="medium" on:click={handleCancel}>Cancel</Button>
      <Button variant="filled-primary" size="medium" on:click={handleLogout}>
        Login with Different Account
      </Button>
    </div>
  </div>
{:else}
  <slot />
{/if}
