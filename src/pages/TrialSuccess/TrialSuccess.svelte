<script>
  import TrialNav from '@/components/TrialNav/TrialNav.svelte';
  import WelcomePage from '@/assets/images/WelcomePage.png';
  import TrialSuccess from '@/components/TrialFlow/TrialSuccess.svelte';
</script>

<TrialNav />
<div
  class="flex min-h-screen items-start justify-center bg-cover bg-center bg-no-repeat p-4 pt-18"
  style="background-image: url('{WelcomePage}')"
>
  <div class="padding-y-14 mx-auto flex w-full max-w-2xl flex-col gap-7">
    <div class="text-center text-neutral-50">
      <h1 class="text-fs-ds-42 font-fw-ds-300 font-aileron text-neutral-50">
        <span class="gradient-text">Standard Trial</span> Unlocked
      </h1>
    </div>
    <div>
      <TrialSuccess />
    </div>
  </div>
</div>

<style>
  .gradient-text {
    background: linear-gradient(180deg, #11adf0 0%, #6147ff 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    text-fill-color: transparent;
  }
</style>
