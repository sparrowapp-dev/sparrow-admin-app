<script lang="ts">
  import { Route } from 'svelte-routing';
  import { auth } from '@/store/auth';
  import BaseLayout from '@/layouts/BaseLayout.svelte';
  import GlobalAuthWrapper from '@/components/GlobalAuthWrapper/GlobalAuthWrapper.svelte';

  export let path: string;
  export let component: any;

  // Check if user is logged in
  let isLoggedIn: boolean = !!$auth?.token;
</script>

{#if isLoggedIn}
  <!-- Render route if logged in -->
  <Route {path} let:params>
    <GlobalAuthWrapper>
      <BaseLayout>
        <svelte:component this={component} {...params} />
      </BaseLayout>
    </GlobalAuthWrapper>
  </Route>
{/if}
