/* ═══════════════════════════════════════════════════════════
   PAYMENT — Send Money UPI + Net Banking (3-step modal)
   ═══════════════════════════════════════════════════════════ */
const Payment = (() => {
  let currentStep = 1;
  let paymentType = 'UPI';
  let formData = {};
  let cachedUsers = [];

  async function open(type) {
    paymentType = type;
    currentStep = 1;
    formData = {};
    cachedUsers = await Data.getUsers();
    renderStep();
  }

  function renderStep() {
    const user = Data.getCurrentUser();
    const label = paymentType === 'UPI' ? '📱 UPI Payment' : '🏦 Net Banking';
    let body = '';

    if (currentStep === 1) body = renderStep1(user);
    else if (currentStep === 2) body = renderStep2(user);
    else body = renderStep3();

    UI.openModal(`
      <div class="modal__header"><h3 class="modal__title">${label}</h3><button class="modal__close" id="modal-close-btn" aria-label="Close">${Icons.close}</button></div>
      <div class="modal__body">${UI.buildSteps(currentStep)}${body}</div>
    `);

    document.getElementById('modal-close-btn').addEventListener('click', UI.closeModal);
    if (currentStep === 1) mountStep1();
    else if (currentStep === 2) mountStep2();
    else mountStep3();
  }

  function renderStep1(user) {
    const acc = user.account_number || user.accountNumber;
    const otherUsers = cachedUsers.filter(u => u.account_number !== acc);
    return `<form id="pay-step1" novalidate>
      <div class="input-group">
        <label class="input-group__label" for="pay-receiver">Receiver Account</label>
        <select class="input-group__field" id="pay-receiver">
          <option value="">Select recipient</option>
          ${otherUsers.map(u => `<option value="${u.account_number}">${u.name} (${Data.maskAccount(u.account_number)})</option>`).join('')}
        </select>
        <div class="input-group__error" aria-live="polite"></div>
      </div>
      <div class="input-group">
        <label class="input-group__label">Amount</label>
        <div class="input-amount"><span class="input-amount__symbol">₹</span><input class="input-amount__input" id="pay-amount" type="number" placeholder="0.00" min="1" step="0.01"></div>
        <div class="input-group__error" aria-live="polite"></div>
      </div>
      <div class="input-group">
        <label class="input-group__label">MPIN</label>
        <div class="mpin-dots" id="mpin-container">
          <input class="mpin-dots__dot" type="password" maxlength="1" inputmode="numeric" aria-label="MPIN digit 1">
          <input class="mpin-dots__dot" type="password" maxlength="1" inputmode="numeric" aria-label="MPIN digit 2">
          <input class="mpin-dots__dot" type="password" maxlength="1" inputmode="numeric" aria-label="MPIN digit 3">
          <input class="mpin-dots__dot" type="password" maxlength="1" inputmode="numeric" aria-label="MPIN digit 4">
        </div>
        <div class="input-group__error" aria-live="polite" id="mpin-error"></div>
      </div>
      <button type="submit" class="btn btn--primary btn--full btn--lg">Proceed</button>
    </form>`;
  }

  function mountStep1() {
    const container = document.getElementById('mpin-container');
    if (container) UI.initMpinDots(container);

    document.getElementById('pay-step1').addEventListener('submit', async (e) => {
      e.preventDefault();
      const user = Data.getCurrentUser();
      const acc = user.account_number || user.accountNumber;
      const receiver = document.getElementById('pay-receiver').value;
      const amount = parseFloat(document.getElementById('pay-amount').value);
      const mpin = UI.getMpinValue(document.getElementById('mpin-container'));

      let valid = true;
      const recvGroup = document.getElementById('pay-receiver').parentElement;
      const amtGroup = document.getElementById('pay-amount').closest('.input-group');
      UI.clearAllErrors(document.getElementById('pay-step1'));

      if (!receiver) { UI.setError(recvGroup, 'Select a recipient'); valid = false; }
      if (!amount || amount <= 0) { UI.setError(amtGroup, 'Enter valid amount'); valid = false; }
      if (mpin.length !== 4) { document.getElementById('mpin-error').textContent = 'Enter 4-digit MPIN'; valid = false; }
      if (!valid) return;

      // Check balance via API
      const balance = await Data.getBalance(acc);
      if (amount > balance) { UI.setError(amtGroup, `Insufficient balance (${Data.formatAmount(balance)})`); return; }

      const receiverUser = cachedUsers.find(u => u.account_number === receiver);
      formData = { receiver, amount, mpin, receiverName: receiverUser ? receiverUser.name : Data.maskAccount(receiver) };
      currentStep = 2;
      renderStep();
    });
  }

  function renderStep2(user) {
    const acc = user.account_number || user.accountNumber;
    return `<div class="confirm-summary">
      <div class="confirm-summary__row"><span class="confirm-summary__label">From</span><span class="confirm-summary__value">${user.name} (${Data.maskAccount(acc)})</span></div>
      <div class="confirm-summary__row"><span class="confirm-summary__label">To</span><span class="confirm-summary__value">${formData.receiverName}</span></div>
      <div class="confirm-summary__row"><span class="confirm-summary__label">Method</span><span class="confirm-summary__value">${paymentType}</span></div>
      <hr class="confirm-summary__divider">
      <div class="confirm-summary__row confirm-summary__total"><span class="confirm-summary__label">Amount</span><span class="confirm-summary__value">${Data.formatAmount(formData.amount)}</span></div>
    </div>
    <div style="display:flex;gap:var(--space-3)">
      <button class="btn btn--secondary btn--lg" id="pay-edit" style="flex:1">← Edit</button>
      <button class="btn btn--primary btn--lg" id="pay-confirm" style="flex:2">Confirm & Pay</button>
    </div>`;
  }

  function mountStep2() {
    document.getElementById('pay-edit').addEventListener('click', () => { currentStep = 1; renderStep(); });
    document.getElementById('pay-confirm').addEventListener('click', async () => {
      const btn = document.getElementById('pay-confirm');
      btn.disabled = true;
      btn.innerHTML = `<span class="btn__spinner"></span> Processing...`;

      const user = Data.getCurrentUser();
      const acc = user.account_number || user.accountNumber;
      const result = await Data.processTransaction(
        paymentType, acc, formData.receiver, formData.amount, formData.mpin
      );
      formData.result = result;
      currentStep = 3;
      renderStep();
    });
  }

  function renderStep3() {
    const result = formData.result;
    if (result.success) {
      const txn = result.transaction;
      return `<div class="result-anim">
        <div class="result-anim__circle result-anim__circle--success">${Icons.successCheck}</div>
        <div class="result-anim__title">Payment Successful!</div>
        <div class="result-anim__subtitle">Your money is on its way</div>
        <div class="receipt">
          <div class="receipt__row"><span class="receipt__label">Transaction ID</span><span class="receipt__value">${txn.txnId || ''}</span></div>
          <div class="receipt__row"><span class="receipt__label">Amount</span><span class="receipt__value">${Data.formatAmount(formData.amount)}</span></div>
          <div class="receipt__row"><span class="receipt__label">Method</span><span class="receipt__value">${paymentType}</span></div>
        </div>
      </div>
      <div style="display:flex;gap:var(--space-3);margin-top:var(--space-4)">
        <button class="btn btn--primary btn--lg" id="pay-new" style="flex:1">New Payment</button>
        <button class="btn btn--secondary btn--lg" id="pay-history" style="flex:1">View History</button>
      </div>`;
    }
    return `<div class="result-anim">
      <div class="result-anim__circle result-anim__circle--fail">${Icons.failX}</div>
      <div class="result-anim__title">Payment Failed</div>
      <div class="result-anim__subtitle">${result.error || 'Something went wrong'}</div>
    </div>
    <button class="btn btn--primary btn--full btn--lg" id="pay-retry" style="margin-top:var(--space-4)">Try Again</button>`;
  }

  function mountStep3() {
    const newBtn = document.getElementById('pay-new');
    const histBtn = document.getElementById('pay-history');
    const retryBtn = document.getElementById('pay-retry');
    if (newBtn) newBtn.addEventListener('click', () => { UI.closeModal(); setTimeout(() => open(paymentType), 200); });
    if (histBtn) histBtn.addEventListener('click', () => { UI.closeModal(); Router.navigate('history'); });
    if (retryBtn) retryBtn.addEventListener('click', () => { currentStep = 1; renderStep(); });
    if (formData.result?.success) UI.toast('success', 'Payment Sent!', Data.formatAmount(formData.amount));
  }

  return { open };
})();
