<script lang="ts">
  import CloseIcon from '@/assets/icons/CloseIcon.svelte';
  import { userEmail, userName } from '@/store/auth';
  import Button from '@/ui/Button/Button.svelte';

  export let limit = 3;
  export let userRole = 'owner';
  export let isOwner = false;
  export let onClose;
  export let reDirect;
  export let limitText;
  export let currentCount;
</script>

<section
  class="bg-surface-600 flex min-w-[540px] flex-col items-center justify-center gap-4 rounded-[8px] p-6"
>
  <div class="flex flex-col gap-6">
    <div class="flex flex-col gap-6">
      <div class="flex justify-between">
        <h2 class="font-fw-ds-500 font-inter leading-lh-ds-120 text-fs-ds-20 text-neutral-50">
          {#if isOwner}It’s time to Upgrade Plan{:else}Upgrade Needed – Contact Owner to Upgrade{/if}
        </h2>
        <span on:click={onClose} class="cursor-pointer"><CloseIcon /></span>
      </div>
      <div class="flex flex-col gap-2.5">
        <h2 class="font-inter text-fw-ds-300 text-fs-ds-14 leading-lh-ds-143 text-neutral-100">
          {#if isOwner}
            You’ve reached the maximum limit for your current plan. To continue using this feature,
            you’ll need to upgrade. We’ll take you to the payment page.
          {:else}
            You’ve reached the maximum usage for your current plan. To continue using this feature,
            you’ll need to upgrade. Only the owner can upgrade the plan. Please contact the owner to
            get the plan upgraded.
          {/if}
        </h2>
        <h2 class="flex items-center gap-3">
          <h3 class="text-fw-ds-300 text-fs-ds-14 leading-lh-ds-143 text-neutral-100">
            {limitText}:
          </h3>
          <h3 class="font-inter text-fw-ds-400 text-fs-ds-14 leading-lh-ds-143 text-neutral-400">
            <span class="font-fw-ds-500 text-fs-ds-24 leading-lh-ds-120 text-red-400"
              >{#if currentCount}{currentCount}{:else}{limit}{/if}</span
            >/{limit}
          </h3>
        </h2>

        {#if isOwner}
          <span>
            <h2 class="text-fs-ds-14 leading-lh-ds-143 font-fw-ds-300 font-inter text-neutral-400">
              Note: To unlock the Enterprise plan and access more features, please <a
                href="mailto:contactus@sparrowapp.dev"
                class="text-blue-400 underline">contact sales</a
              > for more information.
            </h2>
          </span>
        {:else}
          <span class="flex items-center justify-between"
            ><div class="flex gap-2">
              <div
                class="border-surface-50 text text-fs-ds-16 leading-lh-ds-150 flex h-9 w-9 items-center justify-center rounded-[133.33px] border-[1.33px] bg-purple-400 text-neutral-50"
              >
                {$userName.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 class="font-fw-ds-400 text-fs-ds-12 leading-lh-ds-130 text-neutral-50">
                  {$userName?.length > 15 ? `${$userName.slice(0, 15)}...` : $userName}(You)
                </h2>
                <h2 class="font-fw-ds-300 text-fs-ds-12 leading-lh-ds-150 text-neutral-300">
                  {$userEmail?.length > 40 ? `${$userEmail.slice(0, 40)}...` : $userEmail}
                </h2>
              </div>
            </div>
            <h2
              class="font-inter text-fw-ds-400 text-fs-ds-12 leading-lh-ds-130 pr-2 text-neutral-50"
            >
              {userRole?.charAt(0).toUpperCase() + userRole?.slice(1)}
            </h2>
          </span>
        {/if}
      </div>
    </div>
    <div class="flex justify-end gap-3">
      <Button variant="filled-secondary" on:click={onClose}>Cancel</Button>
      <Button on:click={reDirect}>{isOwner ? 'Upgrade Plan' : 'Contact Owner'}</Button>
    </div>
  </div>
</section>
