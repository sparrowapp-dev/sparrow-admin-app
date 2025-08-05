<script lang="ts">
  import Routes from './routes/Routes.svelte';
  import Toast from './components/Toast/Toast.svelte';

  // This is important! It provides the current URL to the Router
  const url = window.location.pathname;

  localStorage.setItem(
    'accessToken',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2ODBhMDQ5MWU3ODhhN2JkNGU1M2I4NGYiLCJlbWFpbCI6Im1pdGhlc2guZGV2LndvcmtAZ21haWwuY29tIiwibmFtZSI6Ik1pdGhlc2giLCJyb2xlIjoiYWRtaW4iLCJpc1N1cGVyQWRtaW4iOmZhbHNlLCJpYXQiOjE3NTQzNzEzMDIsImV4cCI6MTc1NDM5MjkwMn0.bttIE7zFfKz38Jn68soGSV0AczQJ0RCxOvzXGbr2mWw',
  );
  localStorage.setItem(
    'refreshToken',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2ODBhMDQ5MWU3ODhhN2JkNGU1M2I4NGYiLCJlbWFpbCI6Im1pdGhlc2guZGV2LndvcmtAZ21haWwuY29tIiwibmFtZSI6Ik1pdGhlc2giLCJyb2xlIjoiYWRtaW4iLCJpc1N1cGVyQWRtaW4iOmZhbHNlLCJpYXQiOjE3NTQzNzEzMDIsImV4cCI6MTc1NDk3NjEwMn0.Gn0AU08BQfFVOGnskAjzNDpgS4ge1c0Tbr0oNBUTODw',
  );
</script>

<Routes {url} />
<Toast />
