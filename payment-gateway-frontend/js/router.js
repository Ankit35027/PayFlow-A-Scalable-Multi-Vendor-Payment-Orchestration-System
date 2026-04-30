/* ═══════════════════════════════════════════════════════════
   ROUTER — Client-side view switching
   ═══════════════════════════════════════════════════════════ */
const Router = (() => {
  let currentRoute = 'login';

  function navigate(route) {
    const user = Data.getCurrentUser();
    if (route !== 'login' && !user) { route = 'login'; }
    currentRoute = route;
    UI.showLoading();

    setTimeout(() => {
      const app = document.getElementById('app');
      if (route === 'login') {
        app.innerHTML = Auth.render();
        Auth.mount();
      } else {
        app.innerHTML = renderLayout(user, route);
        mountLayout(user, route);
      }
      UI.hideLoading();
      updateBottomNav(route);
    }, 200);
  }

  function renderLayout(user, route) {
    const initials = user.name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();
    const navItems = [
      { id: 'dashboard', icon: Icons.home,   label: 'Dashboard' },
      { id: 'send',      icon: Icons.send,   label: 'Send Money' },
      { id: 'history',   icon: Icons.list,   label: 'History' },
      { id: 'balance',   icon: Icons.wallet, label: 'Balance' },
    ];
    const userId = user.user_id || user.userId;

    const sidebar = `<aside class="sidebar" role="navigation" aria-label="Main navigation">
      <div class="sidebar__brand"><div class="sidebar__logo" aria-hidden="true">PGS</div><span class="sidebar__brand-text">PayFlow</span></div>
      <div class="sidebar__user"><div class="sidebar__avatar" aria-hidden="true">${initials}</div><div class="sidebar__user-info"><div class="sidebar__user-name">${user.name}</div><div class="sidebar__user-id">${userId}</div></div></div>
      <nav class="sidebar__nav">${navItems.map(n => `<button class="sidebar__link ${route === n.id ? 'sidebar__link--active' : ''}" data-nav="${n.id}" aria-label="${n.label}"><span class="sidebar__link-icon">${n.icon}</span><span class="sidebar__link-text">${n.label}</span></button>`).join('')}
        <button class="sidebar__link" id="sidebar-logout" aria-label="Logout"><span class="sidebar__link-icon">${Icons.logout}</span><span class="sidebar__link-text">Logout</span></button>
      </nav>
      <div class="sidebar__footer">PayFlow v1.0</div>
    </aside>`;

    const bottomNav = `<div class="bottom-nav" id="bottom-nav" role="navigation" aria-label="Mobile navigation"><div class="bottom-nav__links">
      ${navItems.map(n => `<button class="bottom-nav__link ${route === n.id ? 'bottom-nav__link--active' : ''}" data-nav="${n.id}" aria-label="${n.label}">${n.icon}<span>${n.label}</span></button>`).join('')}
      <button class="bottom-nav__link" id="bnav-logout" aria-label="Logout">${Icons.logout}<span>Logout</span></button>
    </div></div>`;

    let mainContent = '';
    if (route === 'dashboard') mainContent = Dashboard.render(user);
    else if (route === 'history') mainContent = History.render(user);
    else if (route === 'balance') mainContent = renderBalance(user);
    else if (route === 'send') mainContent = renderSendPage(user);

    return `<div class="layout">${sidebar}<main class="main" id="main-content">${mainContent}</main>${bottomNav}</div>`;
  }

  function renderBalance(user) {
    const acc = user.account_number || user.accountNumber;
    return `<div class="page-enter"><div class="main__header"><h2 class="main__title">Check Balance</h2></div>
      <div class="balance-page">
        <div class="balance-page__icon">${Icons.wallet}</div>
        <div class="balance-page__account">${Data.maskAccount(acc)}</div>
        <div class="balance-page__amount" id="balance-amount"></div>
        <button class="btn btn--primary btn--lg" id="reveal-balance">${Icons.eye} Reveal Balance</button>
        <div class="balance-page__time" id="balance-time"></div>
      </div>
    </div>`;
  }

  function renderSendPage(user) {
    return `<div class="page-enter">
      <div class="main__header"><h2 class="main__title">Send Money</h2><p class="main__subtitle">Choose a payment method</p></div>
      <div class="grid-2">
        <div class="quick-action quick-action--upi" role="button" tabindex="0" id="sp-upi" aria-label="Send via UPI"><div class="quick-action__icon">${Icons.phone}</div><div class="quick-action__content"><div class="quick-action__title">Send via UPI</div><div class="quick-action__desc">Instant mobile payment</div></div><div class="quick-action__arrow">${Icons.arrowRight}</div></div>
        <div class="quick-action quick-action--nb" role="button" tabindex="0" id="sp-nb" aria-label="Send via Net Banking"><div class="quick-action__icon">${Icons.bank}</div><div class="quick-action__content"><div class="quick-action__title">Send via Net Banking</div><div class="quick-action__desc">Bank-to-bank transfer</div></div><div class="quick-action__arrow">${Icons.arrowRight}</div></div>
      </div>
    </div>`;
  }

  function mountLayout(user, route) {
    // Sidebar & bottom nav
    document.querySelectorAll('[data-nav]').forEach(el => {
      el.addEventListener('click', () => navigate(el.dataset.nav));
    });
    document.getElementById('sidebar-logout')?.addEventListener('click', Auth.logout);
    document.getElementById('bnav-logout')?.addEventListener('click', Auth.logout);

    // Page-specific
    if (route === 'dashboard') Dashboard.mount(user);
    else if (route === 'history') History.mount(user);
    else if (route === 'balance') mountBalance(user);
    else if (route === 'send') {
      document.getElementById('sp-upi')?.addEventListener('click', () => Payment.open('UPI'));
      document.getElementById('sp-nb')?.addEventListener('click', () => Payment.open('NETBANKING'));
    }
  }

  function mountBalance(user) {
    const btn = document.getElementById('reveal-balance');
    const amtEl = document.getElementById('balance-amount');
    const timeEl = document.getElementById('balance-time');
    if (!btn) return;
    btn.addEventListener('click', async () => {
      const acc = user.account_number || user.accountNumber;
      const bal = await Data.getBalance(acc);
      amtEl.classList.add('visible');
      amtEl.classList.add('glowing');
      amtEl.dataset.format = 'amount';
      UI.animateCounter(amtEl, bal);
      timeEl.textContent = 'Last updated: ' + new Date().toLocaleTimeString();
      btn.style.display = 'none';
      setTimeout(() => amtEl.classList.remove('glowing'), 2000);
    });
  }

  function updateBottomNav(route) {
    document.querySelectorAll('.bottom-nav__link').forEach(el => {
      el.classList.toggle('bottom-nav__link--active', el.dataset.nav === route);
    });
  }

  // Init
  function init() {
    const user = Data.getCurrentUser();
    navigate(user ? 'dashboard' : 'login');

    // Modal overlay click-to-close
    document.getElementById('modal-overlay').addEventListener('click', (e) => {
      if (e.target === e.currentTarget) UI.closeModal();
    });

    // ESC to close modal
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') UI.closeModal();
    });
  }

  return { navigate, init };
})();

// Boot
document.addEventListener('DOMContentLoaded', Router.init);
