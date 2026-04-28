/* ═══════════════════════════════════════════════════════════
   DASHBOARD — Stats, Recent Transactions, Quick Actions
   ═══════════════════════════════════════════════════════════ */
const Dashboard = (() => {
  function render(user) {
    const stats = Data.getStatsForUser(user.accountNumber);
    const txns = Data.getTransactions().filter(t => t.senderBank === user.accountNumber || t.receiverBank === user.accountNumber).slice(0, 5);

    return `<div class="page-enter">
      <div class="main__header"><div><h2 class="main__title">Dashboard</h2><p class="main__subtitle">Welcome back, ${user.name}</p></div></div>

      <div class="grid-4 section">
        <div class="card stat-card anim-fade-up anim-delay-1"><div class="stat-card__icon stat-card__icon--green">${Icons.wallet}</div><div class="stat-card__label">Total Balance</div><div class="stat-card__value" id="stat-balance" data-format="amount" data-target="${stats.balance}">₹0.00</div></div>
        <div class="card stat-card anim-fade-up anim-delay-2"><div class="stat-card__icon stat-card__icon--red">${Icons.arrowUp}</div><div class="stat-card__label">Total Sent</div><div class="stat-card__value" id="stat-sent" data-format="amount" data-target="${stats.totalSent}">₹0.00</div></div>
        <div class="card stat-card anim-fade-up anim-delay-3"><div class="stat-card__icon stat-card__icon--green">${Icons.arrowDown}</div><div class="stat-card__label">Total Received</div><div class="stat-card__value" id="stat-recv" data-format="amount" data-target="${stats.totalReceived}">₹0.00</div></div>
        <div class="card stat-card anim-fade-up anim-delay-4"><div class="stat-card__icon stat-card__icon--blue">${Icons.activity}</div><div class="stat-card__label">Transactions</div><div class="stat-card__value" id="stat-count" data-target="${stats.txnCount}">0</div></div>
      </div>

      <div class="section">
        <div class="section__header"><h3 class="section__title">Recent Transactions</h3><button class="section__link" data-nav="history">View All →</button></div>
        <div class="table-wrap">${renderTable(txns, user)}</div>
      </div>

      <div class="section"><div class="section__header"><h3 class="section__title">Quick Actions</h3></div>
        <div class="grid-2">
          <div class="quick-action quick-action--upi" role="button" tabindex="0" id="qa-upi" aria-label="Send via UPI"><div class="quick-action__icon">${Icons.phone}</div><div class="quick-action__content"><div class="quick-action__title">Send via UPI</div><div class="quick-action__desc">Instant mobile payment</div></div><div class="quick-action__arrow">${Icons.arrowRight}</div></div>
          <div class="quick-action quick-action--nb" role="button" tabindex="0" id="qa-nb" aria-label="Send via Net Banking"><div class="quick-action__icon">${Icons.bank}</div><div class="quick-action__content"><div class="quick-action__title">Send via Net Banking</div><div class="quick-action__desc">Bank-to-bank transfer</div></div><div class="quick-action__arrow">${Icons.arrowRight}</div></div>
        </div>
      </div>
    </div>`;
  }

  function renderTable(txns, user) {
    if (!txns.length) return `<div class="empty-state"><div class="empty-state__icon">${Icons.emptyBox}</div><div class="empty-state__title">No transactions yet</div><div class="empty-state__text">Your transactions will appear here</div></div>`;
    return `<table class="table"><thead><tr><th>Txn ID</th><th>Type</th><th>Amount</th><th>To / From</th><th>Status</th><th>Date</th></tr></thead><tbody>${txns.map(t => {
      const isSender = t.senderBank === user.accountNumber;
      const otherAcc = isSender ? t.receiverBank : t.senderBank;
      const otherUser = Data.getUserByAccount(otherAcc);
      const otherName = otherUser ? otherUser.name : Data.maskAccount(otherAcc);
      const amtClass = isSender ? 'text-danger' : 'text-success';
      const amtPrefix = isSender ? '- ' : '+ ';
      return `<tr data-txn="${t.txnId}"><td class="mono text-muted" style="max-width:120px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${t.txnId}</td><td>${t.type}</td><td class="mono ${amtClass}">${amtPrefix}${Data.formatAmount(t.amount)}</td><td>${otherName}</td><td>${UI.statusBadge(t.status)}</td><td class="text-muted">${Data.formatDate(t.timestamp)}</td></tr>`;
    }).join('')}</tbody></table>`;
  }

  function mount() {
    // Animate counters
    document.querySelectorAll('.stat-card__value[data-target]').forEach(el => {
      UI.animateCounter(el, parseFloat(el.dataset.target));
    });
    // Quick actions
    const qaUpi = document.getElementById('qa-upi');
    const qaNb = document.getElementById('qa-nb');
    if (qaUpi) qaUpi.addEventListener('click', () => Payment.open('UPI'));
    if (qaNb)  qaNb.addEventListener('click', () => Payment.open('NETBANKING'));
    // View all link
    document.querySelectorAll('[data-nav]').forEach(el => {
      el.addEventListener('click', () => Router.navigate(el.dataset.nav));
    });
  }

  return { render, mount };
})();
