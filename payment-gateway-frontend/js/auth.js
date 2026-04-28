/* ═══════════════════════════════════════════════════════════
   AUTH — Login, Register, Logout
   ═══════════════════════════════════════════════════════════ */
const Auth = (() => {
  let activeTab = 'login';

  function render() {
    return `<div class="login-page" id="page-login">
      <div class="login-card anim-fade-up">
        <div class="login-brand">
          <div class="login-brand__shapes"><div class="login-brand__shape"></div><div class="login-brand__shape"></div><div class="login-brand__shape"></div></div>
          <div class="login-brand__orb"></div>
          <div class="login-brand__logo" aria-hidden="true">PGS</div>
          <div class="login-brand__tagline">Secure.<br>Instant.<br>Yours.</div>
          <div class="login-brand__features">
            <span class="login-brand__pill">${Icons.shield} 256-bit Encrypted</span>
            <span class="login-brand__pill">${Icons.zap} Instant Transfers</span>
            <span class="login-brand__pill">${Icons.headphones} 24/7 Support</span>
          </div>
        </div>
        <div class="login-form-panel">
          <div class="tabs login-tabs" role="tablist">
            <div class="tabs__indicator" id="tab-indicator"></div>
            <button class="tabs__btn tabs__btn--active" id="tab-login" role="tab" aria-selected="true" data-tab="login">Login</button>
            <button class="tabs__btn" id="tab-register" role="tab" aria-selected="false" data-tab="register">Register</button>
          </div>
          <div id="auth-form-area"></div>
          <div class="login-demo">
            <button class="login-demo__toggle" id="demo-toggle" aria-expanded="false">${Icons.chevDown} Demo Credentials</button>
            <div class="login-demo__content" id="demo-content">U001 / pass123 (Arjun)<br>U002 / pass456 (Priya)<br>U003 / pass789 (Rahul)<br>MPIN: 1234 / 5678 / 9012</div>
          </div>
        </div>
      </div>
    </div>`;
  }

  function renderLoginForm() {
    return `<form class="login-form" id="login-form" novalidate>
      <div class="input-group"><label class="input-group__label" for="login-uid">User ID</label><input class="input-group__field" id="login-uid" type="text" placeholder="e.g. U001" autocomplete="username"><div class="input-group__error" aria-live="polite"></div></div>
      <div class="input-group"><label class="input-group__label" for="login-pw">Password</label><input class="input-group__field" id="login-pw" type="password" placeholder="Enter password" autocomplete="current-password"><div class="input-group__error" aria-live="polite"></div></div>
      <button type="submit" class="btn btn--primary btn--full btn--lg">Login</button>
    </form>`;
  }

  function renderRegisterForm() {
    return `<form class="login-form" id="register-form" novalidate>
      <div class="input-group"><label class="input-group__label" for="reg-name">Full Name</label><input class="input-group__field" id="reg-name" type="text" placeholder="Your name"><div class="input-group__error" aria-live="polite"></div></div>
      <div class="input-group"><label class="input-group__label" for="reg-phone">Phone Number</label><input class="input-group__field" id="reg-phone" type="tel" placeholder="10-digit number"><div class="input-group__error" aria-live="polite"></div></div>
      <div class="input-group"><label class="input-group__label" for="reg-acc">Account Number</label><input class="input-group__field" id="reg-acc" type="text" placeholder="e.g. ACC004"><div class="input-group__error" aria-live="polite"></div></div>
      <div class="input-group"><label class="input-group__label" for="reg-uid">User ID</label><input class="input-group__field" id="reg-uid" type="text" placeholder="Choose a unique ID"><div class="input-group__error" aria-live="polite"></div></div>
      <div class="input-group"><label class="input-group__label" for="reg-pw">Password</label><input class="input-group__field" id="reg-pw" type="password" placeholder="Min 4 characters"><div class="input-group__error" aria-live="polite"></div></div>
      <div class="input-group"><label class="input-group__label" for="reg-mpin">MPIN (4 digits)</label><input class="input-group__field" id="reg-mpin" type="password" placeholder="4-digit MPIN" maxlength="4"><div class="input-group__error" aria-live="polite"></div></div>
      <button type="submit" class="btn btn--primary btn--full btn--lg">Register</button>
    </form>`;
  }

  function mount() {
    const area = document.getElementById('auth-form-area');
    if (!area) return;
    area.innerHTML = activeTab === 'login' ? renderLoginForm() : renderRegisterForm();

    // Tab switching
    document.querySelectorAll('[data-tab]').forEach(btn => {
      btn.addEventListener('click', () => {
        activeTab = btn.dataset.tab;
        document.querySelectorAll('[data-tab]').forEach(b => { b.classList.remove('tabs__btn--active'); b.setAttribute('aria-selected', 'false'); });
        btn.classList.add('tabs__btn--active');
        btn.setAttribute('aria-selected', 'true');
        const ind = document.getElementById('tab-indicator');
        ind.className = activeTab === 'register' ? 'tabs__indicator tabs__indicator--right' : 'tabs__indicator';
        area.innerHTML = activeTab === 'login' ? renderLoginForm() : renderRegisterForm();
        bindForms();
      });
    });

    // Demo toggle
    const dt = document.getElementById('demo-toggle');
    const dc = document.getElementById('demo-content');
    if (dt && dc) dt.addEventListener('click', () => { dc.classList.toggle('open'); dt.setAttribute('aria-expanded', dc.classList.contains('open')); });

    bindForms();
  }

  function bindForms() {
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
      loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        UI.clearAllErrors(loginForm);
        const uid = document.getElementById('login-uid').value.trim();
        const pw = document.getElementById('login-pw').value;
        if (!uid) { UI.setError(document.getElementById('login-uid').parentElement, 'User ID is required'); return; }
        if (!pw) { UI.setError(document.getElementById('login-pw').parentElement, 'Password is required'); return; }
        const user = Data.getUsers().find(u => u.userId === uid);
        if (!user) { UI.setError(document.getElementById('login-uid').parentElement, 'User not found'); return; }
        if (user.password !== pw) { UI.setError(document.getElementById('login-pw').parentElement, 'Incorrect password'); return; }
        Data.setCurrentUser(user);
        UI.toast('success', 'Welcome!', `Logged in as ${user.name}`);
        Router.navigate('dashboard');
      });
    }
    const regForm = document.getElementById('register-form');
    if (regForm) {
      regForm.addEventListener('submit', (e) => {
        e.preventDefault();
        UI.clearAllErrors(regForm);
        const name = document.getElementById('reg-name').value.trim();
        const phone = document.getElementById('reg-phone').value.trim();
        const acc = document.getElementById('reg-acc').value.trim();
        const uid = document.getElementById('reg-uid').value.trim();
        const pw = document.getElementById('reg-pw').value;
        const mpin = document.getElementById('reg-mpin').value;
        let valid = true;
        if (!name) { UI.setError(document.getElementById('reg-name').parentElement, 'Name is required'); valid = false; }
        if (!phone || phone.length < 10) { UI.setError(document.getElementById('reg-phone').parentElement, 'Valid phone required'); valid = false; }
        if (!acc) { UI.setError(document.getElementById('reg-acc').parentElement, 'Account number required'); valid = false; }
        if (!uid) { UI.setError(document.getElementById('reg-uid').parentElement, 'User ID required'); valid = false; }
        if (!pw || pw.length < 4) { UI.setError(document.getElementById('reg-pw').parentElement, 'Min 4 characters'); valid = false; }
        if (!mpin || mpin.length !== 4) { UI.setError(document.getElementById('reg-mpin').parentElement, 'Must be 4 digits'); valid = false; }
        if (!valid) return;
        const result = Data.registerUser(name, phone, acc, uid, pw, mpin);
        if (!result.success) { UI.toast('error', 'Registration Failed', result.error); return; }
        UI.toast('success', 'Account Created!', 'You can now login');
        const loginTabBtn = document.getElementById('tab-login');
        if (loginTabBtn) loginTabBtn.click();
      });
    }
  }

  function logout() { Data.clearCurrentUser(); Router.navigate('login'); UI.toast('info', 'Logged Out', 'Session ended'); }

  return { render, mount, logout };
})();
