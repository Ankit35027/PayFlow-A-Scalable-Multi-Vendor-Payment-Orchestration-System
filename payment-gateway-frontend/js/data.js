/* ═══════════════════════════════════════════════════════════
   DATA — Mock data + sessionStorage helpers
   ═══════════════════════════════════════════════════════════ */
const Data = (() => {
  const MOCK_USERS = [
    { userId: "U001", name: "Arjun Sharma", accountNumber: "ACC001", mpin: 1234, password: "pass123", phoneNumber: "9876543210" },
    { userId: "U002", name: "Priya Mehta", accountNumber: "ACC002", mpin: 5678, password: "pass456", phoneNumber: "9123456789" },
    { userId: "U003", name: "Rahul Verma", accountNumber: "ACC003", mpin: 9012, password: "pass789", phoneNumber: "9988776655" },
  ];
  const MOCK_BALANCES = { "ACC001": 25000.00, "ACC002": 12500.50, "ACC003": 8750.75 };
  const MOCK_TRANSACTIONS = [
    { txnId: "TXN202600001", type: "UPI", amount: 2500, senderBank: "ACC001", receiverBank: "ACC002", status: "SUCCESS", timestamp: "2026-04-01T10:30:00" },
    { txnId: "TXN202600002", type: "NETBANKING", amount: 5000, senderBank: "ACC002", receiverBank: "ACC003", status: "PENDING", timestamp: "2026-04-02T14:15:00" },
    { txnId: "TXN202600003", type: "UPI", amount: 750, senderBank: "ACC001", receiverBank: "ACC003", status: "FAILED", timestamp: "2026-04-03T09:45:00" },
    { txnId: "TXN202600004", type: "NETBANKING", amount: 12000, senderBank: "ACC003", receiverBank: "ACC001", status: "SUCCESS", timestamp: "2026-04-04T16:20:00" },
  ];

  function init() {
    if (!sessionStorage.getItem('pgs_users')) sessionStorage.setItem('pgs_users', JSON.stringify(MOCK_USERS));
    if (!sessionStorage.getItem('pgs_balances')) sessionStorage.setItem('pgs_balances', JSON.stringify(MOCK_BALANCES));
    if (!sessionStorage.getItem('pgs_transactions')) sessionStorage.setItem('pgs_transactions', JSON.stringify(MOCK_TRANSACTIONS));
  }

  function getUsers() { return JSON.parse(sessionStorage.getItem('pgs_users') || '[]'); }
  function setUsers(u) { sessionStorage.setItem('pgs_users', JSON.stringify(u)); }
  function getBalances() { return JSON.parse(sessionStorage.getItem('pgs_balances') || '{}'); }
  function setBalances(b) { sessionStorage.setItem('pgs_balances', JSON.stringify(b)); }
  function getTransactions() { return JSON.parse(sessionStorage.getItem('pgs_transactions') || '[]'); }
  function setTransactions(t) { sessionStorage.setItem('pgs_transactions', JSON.stringify(t)); }

  function getCurrentUser() {
    const u = sessionStorage.getItem('pgs_currentUser');
    return u ? JSON.parse(u) : null;
  }
  function setCurrentUser(u) { sessionStorage.setItem('pgs_currentUser', JSON.stringify(u)); }
  function clearCurrentUser() { sessionStorage.removeItem('pgs_currentUser'); }

  function getUserByAccount(acc) { return getUsers().find(u => u.accountNumber === acc); }
  function getBalance(acc) { return getBalances()[acc] ?? 0; }

  function generateTxnId() { return 'TXN' + Date.now(); }

  function processTransaction(type, senderAcc, receiverAcc, amount) {
    const balances = getBalances();
    const senderBal = balances[senderAcc] ?? 0;
    if (senderBal < amount) return { success: false, error: 'Insufficient balance' };
    if (!balances.hasOwnProperty(receiverAcc)) return { success: false, error: 'Invalid receiver account' };

    balances[senderAcc] -= amount;
    balances[receiverAcc] += amount;
    setBalances(balances);

    const txn = {
      txnId: generateTxnId(), type, amount,
      senderBank: senderAcc, receiverBank: receiverAcc,
      status: 'SUCCESS', timestamp: new Date().toISOString(),
    };
    const txns = getTransactions();
    txns.unshift(txn);
    setTransactions(txns);
    return { success: true, transaction: txn };
  }

  function registerUser(name, phone, accountNumber, userId, password, mpin) {
    const users = getUsers();
    if (users.find(u => u.userId === userId)) return { success: false, error: 'User ID already exists' };
    if (users.find(u => u.accountNumber === accountNumber)) return { success: false, error: 'Account number already exists' };

    const newUser = { userId, name, accountNumber, mpin: parseInt(mpin), password, phoneNumber: phone };
    users.push(newUser);
    setUsers(users);

    const balances = getBalances();
    balances[accountNumber] = 10000;
    setBalances(balances);

    return { success: true, user: newUser };
  }

  function getStatsForUser(acc) {
    const txns = getTransactions();
    const balance = getBalance(acc);
    let totalSent = 0, totalReceived = 0, txnCount = 0;
    txns.forEach(t => {
      if (t.status === 'SUCCESS') {
        if (t.senderBank === acc) totalSent += t.amount;
        if (t.receiverBank === acc) totalReceived += t.amount;
      }
      if (t.senderBank === acc || t.receiverBank === acc) txnCount++;
    });
    return { balance, totalSent, totalReceived, txnCount };
  }

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

  init();
  return {
    getUsers, setUsers, getBalances, setBalances, getTransactions, setTransactions,
    getCurrentUser, setCurrentUser, clearCurrentUser,
    getUserByAccount, getBalance, generateTxnId, processTransaction,
    registerUser, getStatsForUser, formatAmount, formatDate, maskAccount,
  };
})();
