/* ═══════════════════════════════════════════════════════════
   HISTORY — Transaction History + Filter + Search
   ═══════════════════════════════════════════════════════════ */
const History = (() => {
  let activeFilter = 'ALL';
  let searchQuery = '';

  function render(user) {
    return `<div class="page-enter">
      <div class="main__header">
        <div><h2 class="main__title">Transaction History</h2><p class="main__subtitle">All your transactions in one place</p></div>
        <div class="search-bar"><span class="search-bar__icon">${Icons.search}</span><input class="search-bar__input" id="history-search" placeholder="Search by ID, amount..." type="text" aria-label="Search transactions"></div>
      </div>
      <div class="filter-pills" id="history-filters" style="margin-bottom:var(--space-6)">
        ${['ALL','UPI','NETBANKING','SUCCESS','FAILED','PENDING'].map(f =>
          `<button class="filter-pill ${f === activeFilter ? 'filter-pill--active' : ''}" data-filter="${f}">${f === 'NETBANKING' ? 'Net Banking' : f.charAt(0) + f.slice(1).toLowerCase()}</button>`
        ).join('')}
      </div>
      <div id="history-list"></div>
    </div>`;
  }

  function getFiltered(user) {
    let txns = Data.getTransactions().filter(t => t.senderBank === user.accountNumber || t.receiverBank === user.accountNumber);
    if (activeFilter === 'UPI' || activeFilter === 'NETBANKING') txns = txns.filter(t => t.type === activeFilter);
    else if (['SUCCESS','FAILED','PENDING','CANCELLED'].includes(activeFilter)) txns = txns.filter(t => t.status === activeFilter);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      txns = txns.filter(t => t.txnId.toLowerCase().includes(q) || String(t.amount).includes(q) || (Data.getUserByAccount(t.receiverBank)?.name || '').toLowerCase().includes(q));
    }
    return txns;
  }

  function renderList(user) {
    const txns = getFiltered(user);
    const listEl = document.getElementById('history-list');
    if (!listEl) return;
    if (!txns.length) {
      listEl.innerHTML = `<div class="empty-state"><div class="empty-state__icon">${Icons.emptyBox}</div><div class="empty-state__title">No transactions found</div><div class="empty-state__text">Try a different filter or search term</div></div>`;
      return;
    }
    listEl.innerHTML = txns.map(t => {
      const isSender = t.senderBank === user.accountNumber;
      const other = isSender ? Data.getUserByAccount(t.receiverBank) : Data.getUserByAccount(t.senderBank);
      const otherName = other ? other.name : Data.maskAccount(isSender ? t.receiverBank : t.senderBank);
      const iconCls = t.type === 'UPI' ? 'txn-card__icon--upi' : 'txn-card__icon--nb';
      const icon = t.type === 'UPI' ? Icons.phone : Icons.bank;
      const amtCls = isSender ? 'text-danger' : 'text-success';
      const prefix = isSender ? '- ' : '+ ';
      return `<div class="txn-card" data-txnid="${t.txnId}">
        <div class="txn-card__icon ${iconCls}">${icon}</div>
        <div class="txn-card__info"><div class="txn-card__name">${otherName}</div><div class="txn-card__id">${t.txnId}</div></div>
        <div class="txn-card__right"><div class="txn-card__amount mono ${amtCls}">${prefix}${Data.formatAmount(t.amount)}</div><div>${UI.statusBadge(t.status)}</div><div class="txn-card__date">${Data.formatDate(t.timestamp)}</div></div>
        <div class="txn-card__details" id="det-${t.txnId}">
          <div class="txn-card__detail-row"><span class="txn-card__detail-label">Transaction ID</span><span class="txn-card__detail-value">${t.txnId}</span></div>
          <div class="txn-card__detail-row"><span class="txn-card__detail-label">Sender</span><span class="txn-card__detail-value">${t.senderBank}</span></div>
          <div class="txn-card__detail-row"><span class="txn-card__detail-label">Receiver</span><span class="txn-card__detail-value">${t.receiverBank}</span></div>
          <div class="txn-card__detail-row"><span class="txn-card__detail-label">Timestamp</span><span class="txn-card__detail-value">${t.timestamp}</span></div>
        </div>
      </div>`;
    }).join('');

    // Accordion toggle
    listEl.querySelectorAll('.txn-card').forEach(card => {
      card.addEventListener('click', () => {
        const det = card.querySelector('.txn-card__details');
        if (det) det.classList.toggle('open');
      });
    });
  }

  function mount(user) {
    renderList(user);

    // Filters
    document.getElementById('history-filters')?.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-filter]');
      if (!btn) return;
      activeFilter = btn.dataset.filter;
      document.querySelectorAll('.filter-pill').forEach(p => p.classList.remove('filter-pill--active'));
      btn.classList.add('filter-pill--active');
      renderList(user);
    });

    // Search
    document.getElementById('history-search')?.addEventListener('input', (e) => {
      searchQuery = e.target.value;
      renderList(user);
    });
  }

  function reset() { activeFilter = 'ALL'; searchQuery = ''; }

  return { render, mount, reset };
})();
