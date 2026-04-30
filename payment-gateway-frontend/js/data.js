/* ═══════════════════════════════════════════════════════════
   DATA — API-backed data layer (NeonDB via backend)
   ═══════════════════════════════════════════════════════════ */
const Data = (() => {
  // Set this to your deployed Vercel backend URL
  const API_BASE = window.PAYFLOW_API_BASE || "https://your-backend.vercel.app";

  // ── Current User (sessionStorage only) ──────────────────────────
  function getCurrentUser() {
    const u = sessionStorage.getItem('pgs_currentUser');
    return u ? JSON.parse(u) : null;
  }
  function setCurrentUser(u) { sessionStorage.setItem('pgs_currentUser', JSON.stringify(u)); }
  function clearCurrentUser() { sessionStorage.removeItem('pgs_currentUser'); }

  // ── Auth ─────────────────────────────────────────────────────────
  async function login(userId, password) {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, password }),
    });
    const data = await res.json();
    if (!res.ok) return { success: false, error: data.error };
    return { success: true, user: data.user };
  }

  async function registerUser(name, phone, accountNumber, userId, password, mpin) {
    const res = await fetch(`${API_BASE}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, phoneNumber: phone, accountNumber, userId, password, mpin }),
    });
    const data = await res.json();
    if (!res.ok) return { success: false, error: data.error };
    return { success: true };
  }

  // ── Balance ──────────────────────────────────────────────────────
  async function getBalance(accountNumber) {
    const res = await fetch(`${API_BASE}/api/balance/${accountNumber}`);
    const data = await res.json();
    return res.ok ? data.balance : 0;
  }

  // ── Users ────────────────────────────────────────────────────────
  async function getUsers() {
    const res = await fetch(`${API_BASE}/api/users`);
    const data = await res.json();
    return res.ok ? data.users : [];
  }

  async function getUserByAccount(accountNumber) {
    const users = await getUsers();
    return users.find(u => u.account_number === accountNumber) || null;
  }

  // ── Transactions ─────────────────────────────────────────────────
  async function getTransactions(accountNumber) {
    const url = accountNumber
      ? `${API_BASE}/api/transactions?account=${accountNumber}`
      : `${API_BASE}/api/transactions`;
    const res = await fetch(url);
    const data = await res.json();
    return res.ok ? data.transactions : [];
  }

  async function processTransaction(type, senderBank, receiverBank, amount, mpin, extra = {}) {
    const res = await fetch(`${API_BASE}/api/transactions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, senderBank, receiverBank, amount, mpin, ...extra }),
    });
    const data = await res.json();
    if (!res.ok) return { success: false, error: data.error };
    return { success: true, transaction: data };
  }

  async function cancelTransaction(txnId) {
    const res = await fetch(`${API_BASE}/api/transactions/${txnId}/cancel`, { method: 'PATCH' });
    const data = await res.json();
    if (!res.ok) return { success: false, error: data.error };
    return { success: true };
  }

  // ── Stats ────────────────────────────────────────────────────────
  async function getStatsForUser(accountNumber) {
    const [balance, txns] = await Promise.all([
      getBalance(accountNumber),
      getTransactions(accountNumber),
    ]);
    let totalSent = 0, totalReceived = 0, txnCount = 0;
    txns.forEach(t => {
      if (t.status === 'SUCCESS') {
        if (t.sender_bank === accountNumber) totalSent += parseFloat(t.amount);
        if (t.receiver_bank === accountNumber) totalReceived += parseFloat(t.amount);
      }
      if (t.sender_bank === accountNumber || t.receiver_bank === accountNumber) txnCount++;
    });
    return { balance, totalSent, totalReceived, txnCount };
  }

  // ── Formatters ───────────────────────────────────────────────────
  function formatAmount(n) {
    return '₹' + Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function formatDate(iso) {
    const d = new Date(iso);
    return d.toLocaleDateString('en-IN', { month: 'short', day: '2-digit', year: 'numeric' })
      + ' · ' + d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
  }

  function maskAccount(acc) {
    if (!acc || acc.length < 4) return acc;
    return acc.substring(0, 3) + '***' + acc.slice(-2);
  }

  function generateTxnId() { return 'TXN' + Date.now(); }

  return {
    getCurrentUser, setCurrentUser, clearCurrentUser,
    login, registerUser,
    getBalance, getUsers, getUserByAccount,
    getTransactions, processTransaction, cancelTransaction,
    getStatsForUser,
    formatAmount, formatDate, maskAccount, generateTxnId,
  };
})();
