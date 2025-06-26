<script>
    import WelcomePage from "@/assets/images/WelcomePage.png";
    // import DeleteIcon from "@/assets/icons/DeleteIcon.svelte";

</script>






<div class="background" style="background-image: url({WelcomePage});"></div>
<div class="gradient-top"></div>
<div class="center-content">
    <div class="header">
    <img class="logo" src="your-logo-url.png" alt="Sparrow logo" />
    <span class="app-name">Sparrow</span>
</div>
    <div class="welcome-box">
        <div class="welcome-title">
            Welcome to <span class="highlight">Sparrow</span>, John
        </div>
        <div class="welcome-desc">
            We’re excited to have you on board! Let’s quickly set up your hub so you can start exploring all the features of your 2-month free trial.
        </div>
        <div class="steps">
            <div class="step active">
                <div class="step-number">1</div>
                Name Your Hub
            </div>
            <div class="step">
                <div class="step-number">2</div>
                Add Card Details
            </div>
            <div class="step">
                <div class="step-number">3</div>
                Invite Team
            </div>
        </div>
        <div class="section-title">Step 1: Set Your Hub Name</div>
        <div class="section-desc">
            Your hub is the central space for your team on Sparrow, a place where collaboration, communication, and progress come together. Here’s what to know:
        </div>
        <ul class="check-list">
            <li>It acts as your team’s home base on Sparrow.</li>
            <li>You can invite team members and manage all your work here.</li>
            <li>We’ve created one for you using your company name.</li>
            <li>Feel free to rename it and personalize the hub URL.</li>
        </ul>
        <form>
            <div class="form-group">
                <label class="form-label" for="hubName">Hub Name *</label>
                <input class="form-input" id="hubName" type="text" value="Techdome's Hub" />
            </div>
            <div class="form-group">
                <label class="form-label" for="hubUrl">Hub URL *</label>
                <input class="form-input" id="hubUrl" type="text" value="https://techdomeio.sparrowhub.net" disabled />
            </div>
            <button class="continue-btn" type="submit">Continue</button>
        </form>
    </div>
</div>

<style>
    .background {
        position: fixed;
        inset: 0;
        width: 100vw;
        height: 100vh;
        z-index: 0;
    }
    .gradient-top {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 300px;
        background: linear-gradient(180deg, #181C23 0%, rgba(24,28,35,0.0) 100%);
        z-index: 1;
        pointer-events: none;
    }
    .header {
        position: relative;
        z-index: 2;
        display: flex;
        align-items: center;
        padding: 32px 48px 0 48px;
    }
    .logo {
        width: 40px;
        height: 40px;
        margin-right: 12px;
    }
    .app-name {
        color: #fff;
        font-size: 1.6rem;
        font-weight: 700;
        letter-spacing: 1px;
    }
    .center-content {
        position: relative;
        z-index: 2;
        min-height: 100vh;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
    }
    .welcome-box {
        background: rgba(24,28,35,0.85);
        border-radius: 16px;
        padding: 48px 40px 40px 40px;
        max-width: 520px;
        width: 100%;
        box-shadow: 0 8px 32px rgba(0,0,0,0.25);
        text-align: center;
    }
    .welcome-title {
        font-size: 2.5rem;
        font-weight: 600;
        color: #fff;
        margin-bottom: 12px;
    }
    .welcome-title .highlight {
        color: #4F8CFF;
    }
    .welcome-desc {
        color: #bfc9db;
        font-size: 1.1rem;
        margin-bottom: 32px;
    }
    .steps {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 32px;
        margin-bottom: 32px;
    }
    .step {
        display: flex;
        flex-direction: column;
        align-items: center;
        color: #bfc9db;
        font-size: 0.95rem;
        position: relative;
    }
    .step-number {
        background: #4F8CFF;
        color: #fff;
        border-radius: 50%;
        width: 28px;
        height: 28px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 600;
        margin-bottom: 6px;
        font-size: 1rem;
    }
    .step:not(:last-child)::after {
        content: '';
        position: absolute;
        right: -48px;
        top: 13px;
        width: 40px;
        height: 2px;
        background: #3a4252;
        z-index: 0;
    }
    .step.active .step-number {
        background: #4F8CFF;
    }
    .step.active {
        color: #fff;
        font-weight: 600;
    }
    .section-title {
        font-size: 1.3rem;
        color: #fff;
        font-weight: 600;
        margin-bottom: 16px;
    }
    .section-desc {
        color: #bfc9db;
        font-size: 1rem;
        margin-bottom: 24px;
    }
    .check-list {
        text-align: left;
        margin: 0 auto 28px auto;
        max-width: 400px;
    }
    .check-list li {
        color: #7fffa7;
        margin-bottom: 8px;
        font-size: 1rem;
        list-style: none;
        position: relative;
        padding-left: 22px;
    }
    .check-list li::before {
        content: '✔';
        position: absolute;
        left: 0;
        color: #7fffa7;
        font-size: 1rem;
    }
    .form-group {
        margin-bottom: 18px;
        text-align: left;
    }
    .form-label {
        color: #bfc9db;
        font-size: 0.98rem;
        margin-bottom: 6px;
        display: block;
        font-weight: 500;
    }
    .form-input {
        width: 100%;
        padding: 10px 14px;
        border-radius: 8px;
        border: none;
        background: #232834;
        color: #fff;
        font-size: 1rem;
        margin-bottom: 0;
        outline: none;
    }
    .form-input[disabled] {
        opacity: 0.7;
        background: #181C23;
        color: #bfc9db;
    }
    .continue-btn {
        width: 100%;
        padding: 12px 0;
        background: #2563eb;
        color: #fff;
        border: none;
        border-radius: 8px;
        font-size: 1.1rem;
        font-weight: 600;
        cursor: pointer;
        margin-top: 18px;
        transition: background 0.2s;
    }
    .continue-btn:hover {
        background: #1e4fc3;
    }
</style>