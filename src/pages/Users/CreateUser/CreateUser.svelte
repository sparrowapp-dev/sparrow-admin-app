<script lang="ts">
  import sparrowicon from '@/assets/logoSparrowSquare.svg';
  import eyeHide from '@/assets/eye-hide.svg';
  import eyeShow from '@/assets/eye-show.svg';
  import vector1 from '@/assets/Vector1.svg';
  import vector2 from '@/assets/Vector2.svg';
  import vector3 from '@/assets/Vector3.svg';
  import Button from '@/ui/Button/Button.svelte';
  import { notification } from '@/components/Toast';
  import { userService } from '@/services/users.service';
  import CircularLoader from '@/ui/CircularLoader/CircularLoader.svelte';
  export let id = '';
  export let onClose = () => {};

  let userData = {
    email: id || '',
    fullName: '',
    password: '',
    tnsCheckbox: false,
    marketingUpdates: false,
  };
  let isDuplicateEmail = false;
  let validationErrors: any = {};

  let isPasswordValid1 = false;
  let isPasswordValid2 = false;
  let isPasswordValid3 = false;

  let isCheckboxTouched = false;
  let isEmailTouched = false;
  let isFullNameTouched = false;
  let isPasswordTouched = false;

  let isPasswordVisible = false;
  let registerLoader = false;
  let passwordInputEl: HTMLInputElement | null = null;

  const validatePassword = () => {
    const password = userData.password;
    isPasswordValid1 = password.length >= 8;
    isPasswordValid2 = /(?=.*[0-9])/.test(password);
    isPasswordValid3 = /(?=.*[!@#$%^&*])/.test(password);
  };

  const togglePasswordVisibility = () => {
    isPasswordVisible = !isPasswordVisible;
    if (passwordInputEl) {
      passwordInputEl.type = isPasswordVisible ? 'text' : 'password';
    }
  };

  $: isFormValid =
    !validationErrors?.fullName && !validationErrors?.email && !validationErrors?.password;

  // Dummy validation function, replace with your actual logic
  async function handleRegisterValidation(data) {
    let errors: any = {};
    if (!data.fullName.trim()) errors.fullName = 'Full name is required';
    if (!data.email.trim()) errors.email = 'Email is required';
    if (!data.password.trim()) errors.password = 'Password is required';
    return errors;
  }

  async function handleSubmit() {
    isCheckboxTouched = true;
    isEmailTouched = true;
    isFullNameTouched = true;
    isPasswordTouched = true;
    validationErrors = await handleRegisterValidation(userData);

    if (isDuplicateEmail) {
      notification.error('Email ID already exists.');
      return;
    }

    if (isFormValid) {
      registerLoader = true;
      try {
        // Prepare request body as expected by backend
        const payload = {
          email: userData.email,
          name: userData.fullName,
          password: userData.password,
        };
        const res = await userService.createUser(payload);
        if (res?.httpStatusCode === 200) {
          notification.success('User created!');
          onClose();
        } else {
          notification.error(res?.message || 'Failed to create user.');
        }
      } catch (err) {
        notification.error('Failed to create user.');
      }
      registerLoader = false;
    }
  }
</script>

<div class="create-user-modal">
  <header class="modal-header">
    <div class="titles">
      <div class="mb-4 flex gap-2">
        <div class="logo-wrap">
          <img src={sparrowicon} alt="Sparrow" />
        </div>
        <h1 class="title" style="font-size: 24px;">Sparrow</h1>
      </div>
      <h1 class="title" style="margin-bottom: 8px;">Create Profile</h1>
      <p class="subtitle">Let's create new user profile</p>
    </div>
  </header>

  <form class="modal-form" novalidate on:submit|preventDefault={handleSubmit}>
    <label class="field-label" for="fullName">Full Name <span class="required">*</span></label>
    <input
      id="fullName"
      type="text"
      class="input"
      placeholder="Enter user full name"
      bind:value={userData.fullName}
      on:blur={async () => {
        isFullNameTouched = true;
        validationErrors = await handleRegisterValidation(userData);
      }}
      on:input={async () => {
        validationErrors = await handleRegisterValidation(userData);
      }}
    />
    {#if validationErrors?.fullName && isFullNameTouched}
      <div class="field-error">{validationErrors?.fullName}</div>
    {/if}

    <label class="field-label" for="email">Email ID <span class="required">*</span></label>
    <input
      id="email"
      type="email"
      class="input"
      placeholder="Enter user email address"
      bind:value={userData.email}
      on:blur={async () => {
        isEmailTouched = true;
        validationErrors = await handleRegisterValidation(userData);
      }}
      on:input={async () => {
        validationErrors = await handleRegisterValidation(userData);
      }}
    />
    {#if validationErrors?.email && isEmailTouched}
      <div class="field-error">{validationErrors?.email}</div>
    {/if}

    <label class="field-label" for="expamplePassword"
      >Create Password <span class="required">*</span></label
    >
    <div class="password-wrap">
      <input
        id="expamplePassword"
        class="input password-input"
        type="password"
        placeholder="Create password for user"
        maxlength="32"
        bind:value={userData.password}
        bind:this={passwordInputEl}
        on:blur={async () => {
          isPasswordTouched = true;
          validationErrors = await handleRegisterValidation(userData);
          validatePassword();
        }}
        on:input={async () => {
          validationErrors = await handleRegisterValidation(userData);
          validatePassword();
        }}
      />
      <button
        type="button"
        class="eye-btn"
        on:click={togglePasswordVisibility}
        aria-label="Toggle password"
      >
        {#if isPasswordVisible}
          <img src={eyeShow} alt="show" />
        {:else}
          <img src={eyeHide} alt="hide" />
        {/if}
      </button>
    </div>
    {#if validationErrors?.password && isPasswordTouched}
      <div class="field-error">{validationErrors?.password}</div>
    {/if}

    <ul class="password-rules">
      <li>
        <img src={isPasswordValid1 ? vector2 : isPasswordTouched ? vector3 : vector1} alt="" />
        <span class:is-valid={isPasswordValid1}>Min 8 characters</span>
      </li>
      <li>
        <img src={isPasswordValid2 ? vector2 : isPasswordTouched ? vector3 : vector1} alt="" />
        <span class:is-valid={isPasswordValid2}>Has at least one number</span>
      </li>
      <li>
        <img src={isPasswordValid3 ? vector2 : isPasswordTouched ? vector3 : vector1} alt="" />
        <span class:is-valid={isPasswordValid3}>Has at least one special character</span>
      </li>
    </ul>

    <div class="action-row">
      <Button
        variant="filled-primary-white"
        size="medium"
        disabled={!isFormValid || registerLoader}
        className="w-full create-btn"
        type="submit"
      >
        {#if registerLoader}
          <CircularLoader size={22} color="#3670f7" thickness={0.18} duration={0.8} />
        {:else}
          Create Account
        {/if}
      </Button>
    </div>
  </form>
</div>

<style>
  /* Modal container: more opaque background, no backdrop blur, subtle shadow */
  :global(.create-user-modal) {
    width: 380px;
    max-width: calc(100vw - 32px);
    background-color: var(--surface-600, #101318);
    border-radius: 0.5rem; /* rounded-lg */
    padding: 1.5rem; /* p-6 */
    color: var(--white-color, #fff);
    backdrop-filter: none;
    -webkit-backdrop-filter: none;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08); /* subtle, optional */
    font-family: 'Roboto', sans-serif;
  }

  /* Centered, stacked header */
  .modal-header {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 24px;
    margin-bottom: 18px;
  }

  /* small brand row: logo + product name */
  .titles .flex {
    display: flex;
    gap: 8px;
    align-items: center;
    justify-content: center;
  }

  /* brand label next to logo (smaller) */
  .titles .flex .title {
    margin: 0;
    font-size: 14px;
    font-weight: 700;
    color: #ffffff;
    letter-spacing: 0.2px;
  }

  /* main heading (Create Profile) */
  .titles > .title {
    margin: 0;
    font-size: 22px;
    font-weight: 700;
    color: #ffffff;
    line-height: 1;
  }

  .titles .subtitle {
    margin: 0;
    font-size: 13px;
    color: var(--labelColor, #bfc3c8);
  }

  .logo-wrap {
    width: 30px;
    height: 30px;
    border-radius: 5px;
    background: var(--sparrow-primary-color, #3670f7);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  .logo-wrap img {
    width: 22px;
    height: 22px;
  }

  /* Form layout */
  .modal-form {
    margin-top: 12px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .field-label {
    font-size: 14px;
    color: #d6d6d8;
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .required {
    color: var(--error--color, #eb5651);
    font-weight: 600;
    font-size: 13px;
  }

  .input {
    background: #181c26;
    border: 1px solid rgba(255, 255, 255, 0.04);
    color: #ffffff;
    padding: 10px 12px;
    border-radius: 8px;
    outline: none;
    font-size: 14px;
    width: 100%;
    transition:
      border-color 120ms ease,
      box-shadow 120ms ease;
  }
  .input::placeholder {
    color: #82858a;
    font-size: 14px;
  }
  .input:focus {
    border-color: rgba(255, 255, 255, 0.14);
    box-shadow: 0 4px 14px rgba(18, 18, 20, 0.25);
  }

  .password-wrap {
    position: relative;
    display: flex;
  }
  .password-input {
    padding-right: 44px;
    width: 100%;
  }
  .eye-btn {
    position: absolute;
    right: 8px;
    top: 50%;
    transform: translateY(-50%);
    background: transparent;
    border: none;
    padding: 6px;
    cursor: pointer;
  }
  .eye-btn img {
    width: 18px;
    height: 18px;
    opacity: 0.9;
  }

  .password-rules {
    list-style: none;
    padding: 0;
    margin: 6px 0 0 0;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .password-rules li {
    display: flex;
    align-items: center;
    gap: 10px;
    color: var(--labelColor, #bfc3c8);
    font-size: 13px;
  }
  .password-rules img {
    width: 16px;
    height: 16px;
  }

  .password-rules span.is-valid {
    color: var(--success-color, #8dc599);
    font-weight: 600;
  }
  .field-error {
    color: var(--error--color, #EB5651);
    font-size: 12px;
  }

  .link {
    color: var(--sparrow-primary-color, #3670f7);
    text-decoration: none;
    font-weight: 600;
  }

  .action-row {
    margin-top: 10px;
  }
  :global(.create-btn) {
    height: 44px;
    border-radius: 8px;
    font-weight: 600;
  }

  .support-links {
    display: flex;
    justify-content: center;
    gap: 10px;
    margin-top: 12px;
    color: var(--labelColor, #bfc3c8);
    font-size: 12px;
  }
  .help-link {
    color: var(--labelColor, #bfc3c8);
    text-decoration: none;
  }
  .sep {
    opacity: 0.3;
  }

  /* Small screens: keep modal centered and responsive */
  @media (max-width: 420px) {
    :global(.create-user-modal) {
      padding: 20px;
      width: calc(100vw - 24px);
    }
    .logo-wrap {
      width: 40px;
      height: 40px;
    }
    .logo-wrap img {
      width: 20px;
      height: 20px;
    }
    .titles > .title {
      font-size: 20px;
    }
  }
</style>
