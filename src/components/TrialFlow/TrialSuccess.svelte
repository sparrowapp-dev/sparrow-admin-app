<script>
  import fallingConfetti from '@/assets/images/falling_confetti_purple_red.gif';
  import CheckmarkStarburst from '@/assets/icons/CheckmarkStarburst.svelte';
  import Button from '@/ui/Button/Button.svelte';
</script>

<div class="flex items-center justify-center">
  <div class="relative w-full">
    <div class="bg-surface-600 rounded-lg p-8 shadow-xl">
      <div class="flex flex-col gap-8">
        <div class="font-fw-ds-400 flex flex-col items-center gap-2 text-center text-neutral-50">
          <CheckmarkStarburst />
          <div class="text-fs-ds-16">Congratulations! Your Standard Trial is Unlocked</div>
          <div class="text-fs-ds-14">
            You’ve successfully activated the Standard Trial for ‘Techdome Hub’. All premium
            features are now available, start exploring, collaborating, and building with your team.
          </div>
        </div>
        <div class="mr-5 ml-15 flex w-full max-w-md flex-col gap-8">
          <div
            class=" flex items-center
          justify-between gap-7"
          >
            <div class="flex flex-col items-center justify-center gap-1">
              <span class="text-fs-ds-12 text-neutral-400">Hub Name</span>
              <span class="text-ds-ds-16 font-fw-ds-400 text-neutral-50">Techdome Hub</span>
            </div>
            <div class="flex flex-col items-center justify-center gap-1">
              <span class="text-fs-ds-12 text-neutral-400">Amount After Trial</span>
              <span class="text-ds-ds-16 font-fw-ds-400 text-neutral-50">$39.96/month</span>
            </div>
          </div>
          <div
            class=" flex items-center
          justify-between gap-5"
          >
            <div class="flex flex-col items-center justify-center gap-1">
              <span class="text-fs-ds-12 text-neutral-400">Trial Start Date</span>
              <span class="text-ds-ds-16 font-fw-ds-400 text-neutral-50">July 2, 2025</span>
            </div>
            <div class="flex flex-col items-center justify-center gap-1">
              <span class="text-fs-ds-12 text-neutral-400">Trial End Date</span>
              <span class="text-ds-ds-16 font-fw-ds-400 text-neutral-50">September 2, 2025</span>
            </div>
          </div>
          <div
            class=" flex items-center
          justify-between gap-5"
          >
            <div class="flex flex-col items-center justify-center gap-1">
              <span class="text-fs-ds-12 text-neutral-400">Total Members</span>
              <span class="text-ds-ds-16 font-fw-ds-400 text-neutral-50">04</span>
            </div>
          </div>
        </div>
        <div>
          <div class="flex justify-center gap-3">
            <Button variant="filled-secondary" size="medium" on:click={() => {}}
              >Open Admin Panel</Button
            >
            <Button variant="filled-primary" size="medium" on:click={() => {}}>Open Web App</Button>
          </div>
        </div>
      </div>
    </div>

    <!-- Confetti Animation - Now inside the container -->
    <!-- Top-left confetti -->
    <div class="absolute top-0 left-0 h-[150px] w-[150px] overflow-hidden">
      <img
        src={fallingConfetti}
        alt="Confetti Animation"
        class="absolute -top-10 -left-30 h-[267px] w-[150px] rotate-36"
      />
    </div>

    <!-- Bottom-right confetti -->
    <div class="absolute right-0 bottom-0 h-[150px] w-[150px] overflow-hidden">
      <img
        src={fallingConfetti}
        alt="Confetti Animation"
        class="absolute -right-30 -bottom-10 h-[267px] w-[150px] rotate-36"
      />
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
    font-weight: 600;
  }
</style>
