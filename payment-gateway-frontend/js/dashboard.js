/* ═══════════════════════════════════════════════════════════
   DASHBOARD — Stats, Recent Transactions, Quick Actions
   ═══════════════════════════════════════════════════════════ */
const Dashboard = (() => {
  function render(user) {
    return `<div class="page-enter">
      <div class="main__header"><div><h2 class="main__title">Dashboard</h2><p class="main__subtitle">Welcome back, ${user.name}</p></div></div>

      <div class="grid-4 section">
        <div class="card stat-card anim-fade-up anim-delay-1"><div class="stat-card__icon stat-card__icon--green">${Icons.wallet}</div><div class="stat-card__label">Total Balance</div><div class="stat-card__value" id="stat-balance">Loading...</div></div>
        <div class="card stat-card anim-fade-up anim-delay-2"><div class="stat-card__icon stat-card__icon--red">${Icons.arrowUp}</div><div class="stat-card__label">Total Sent</div><div class="stat-card__value" id="stat-sent">Loading...</div></div>
        <div class="card stat-card anim-fade-up anim-delay-3"><div class="stat-card__icon stat-card__icon--green">${Icons.arrowDown}</div><div class="stat-card__label">Total Received</div><div class="stat-card__value" id="stat-recv">Loading...</div></div>
        <div class="card stat-card anim-fade-up anim-delay-4"><div class="stat-card__icon stat-card__icon--blue">${Icons.activity}</div><div class="stat-card__label">Transactions</div><div class="stat-card__value" id="stat-count">0</div></div>
      </div>

      <div class="section">
        <div class="section__header"><h3 class="section__title">Recent Transactions</h3><button class="section__link" data-nav="history">View All →</button></div>
        <div class="table-wrap" id="recent-txns-wrap"><div class="empty-state"><div class="empty-state__title">Loading...</div></div></div>
      </div>

      <div class="section"><div class="section__header"><h3 class="section__title">Quick Actions</h3></div>
        <div class="grid-2">
          <div class="quick-action quick-action--upi" role="button" tabindex="0" id="qa-upi" aria-label="Send via UPI"><div class="quick-action__icon">${Icons.phone}</div><div class="quick-action__content"><div class="quick-action__title">Send via UPI</div><div class="quick-action__desc">Instant mobile payment</div></div><div class="quick-action__arrow">${Icons.arrowRight}</div></div>
          <div class="quick-action quick-action--nb" role="button" tabindex="0" id="qa-nb" aria-label="Send via Net Banking"><div class="quick-action__icon">${Icons.bank}</div><div class="quick-action__content"><div class="quick-action__title">Send via Net Banking</div><div class="quick-action__desc">Bank-to-bank transfer</div></div><div class="quick-action__arrow">${Icons.arrowRight}</div></div>
        </div>
      </div>
    </div>`;
  }

  function renderTable(txns, acc) {
    if (!txns.length) return `<div class="empty-state"><div class="empty-state__icon">${Icons.emptyBox}</div><div class="empty-state__title">No transactions yet</div><div class="empty-state__text">Your transactions will appear here</div></div>`;
    return `<table class="table"><thead><tr><th>Txn ID</th><th>Type</th><th>Amount</th><th>To / From</th><th>Status</th><th>Date</th></tr></thead><tbody>${txns.map(t => {
      const isSender = t.sender_bank === acc;
      const otherAcc = isSender ? t.receiver_bank : t.sender_bank;
      const otherName = isSender ? (t.receiver_name || Data.maskAccount(otherAcc)) : (t.sender_name || Data.maskAccount(otherAcc));
      const amtClass = isSender ? 'text-danger' : 'text-success';
      const amtPrefix = isSender ? '- ' : '+ ';
      return `<tr><td class="mono text-muted" style="max-width:120px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${t.txn_id}</td><td>${t.type}</td><td class="mono ${amtClass}">${amtPrefix}${Data.formatAmount(t.amount)}</td><td>${otherName}</td><td>${UI.statusBadge(t.status)}</td><td class="text-muted">${Data.formatDate(t.timestamp)}</td></tr>`;
    }).join('')}</tbody></table>`;
  }

  async function mount(user) {
    const acc = user.account_number || user.accountNumber;
    const [stats, txns] = await Promise.all([
      Data.getStatsForUser(acc),
      Data.getTransactions(acc),
    ]);

    const balEl = document.getElementById('stat-balance');
    const sentEl = document.getElementById('stat-sent');
    const recvEl = document.getElementById('stat-recv');
    const countEl = document.getElementById('stat-count');
    if (balEl) { balEl.dataset.target = stats.balance; balEl.dataset.format = 'amount'; UI.animateCounter(balEl, stats.balance); }
    if (sentEl) { sentEl.dataset.target = stats.totalSent; sentEl.dataset.format = 'amount'; UI.animateCounter(sentEl, stats.totalSent); }
    if (recvEl) { recvEl.dataset.target = stats.totalReceived; recvEl.dataset.format = 'amount'; UI.animateCounter(recvEl, stats.totalReceived); }
    if (countEl) { countEl.dataset.target = stats.txnCount; UI.animateCounter(countEl, stats.txnCount); }

    const wrap = document.getElementById('recent-txns-wrap');
    if (wrap) wrap.innerHTML = renderTable(txns.slice(0, 5), acc);

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
