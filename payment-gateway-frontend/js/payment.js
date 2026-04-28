/* ═══════════════════════════════════════════════════════════
   PAYMENT — Send Money UPI + Net Banking (3-step modal)
   ═══════════════════════════════════════════════════════════ */
const Payment = (() => {
  let currentStep = 1;
  let paymentType = 'UPI';
  let formData = {};

  function open(type) {
    paymentType = type;
    currentStep = 1;
    formData = {};
    renderStep();
  }

  function renderStep() {
    const user = Data.getCurrentUser();
    const label = paymentType === 'UPI' ? '📱 UPI Payment' : '🏦 Net Banking';
    let body = '';

    if (currentStep === 1) {
      body = renderStep1(user);
    } else if (currentStep === 2) {
      body = renderStep2(user);
    } else {
      body = renderStep3();
    }

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
    const otherUsers = Data.getUsers().filter(u => u.accountNumber !== user.accountNumber);
    return `<form id="pay-step1" novalidate>
      <div class="input-group">
        <label class="input-group__label" for="pay-receiver">Receiver Account</label>
        <select class="input-group__field" id="pay-receiver">
          <option value="">Select recipient</option>
          ${otherUsers.map(u => `<option value="${u.accountNumber}">${u.name} (${Data.maskAccount(u.accountNumber)})</option>`).join('')}
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

    document.getElementById('pay-step1').addEventListener('submit', (e) => {
      e.preventDefault();
      const user = Data.getCurrentUser();
      const receiver = document.getElementById('pay-receiver').value;
      const amount = parseFloat(document.getElementById('pay-amount').value);
      const mpin = UI.getMpinValue(document.getElementById('mpin-container'));

      // Validate
      let valid = true;
      const recvGroup = document.getElementById('pay-receiver').parentElement;
      const amtGroup = document.getElementById('pay-amount').closest('.input-group');
      UI.clearAllErrors(document.getElementById('pay-step1'));

      if (!receiver) { UI.setError(recvGroup, 'Select a recipient'); valid = false; }
      if (!amount || amount <= 0) { UI.setError(amtGroup || document.getElementById('pay-amount').parentElement.parentElement, 'Enter valid amount'); valid = false; }
      if (amount > Data.getBalance(user.accountNumber)) { UI.setError(amtGroup || document.getElementById('pay-amount').parentElement.parentElement, 'Insufficient balance'); valid = false; }
      if (mpin.length !== 4) { document.getElementById('mpin-error').textContent = 'Enter 4-digit MPIN'; valid = false; }
      if (mpin.length === 4 && parseInt(mpin) !== user.mpin) { document.getElementById('mpin-error').textContent = 'Incorrect MPIN'; valid = false; }
      if (!valid) return;

      formData = { receiver, amount, mpin, receiverName: Data.getUserByAccount(receiver)?.name || Data.maskAccount(receiver) };
      currentStep = 2;
      renderStep();
    });
  }

  function renderStep2(user) {
    return `<div class="confirm-summary">
      <div class="confirm-summary__row"><span class="confirm-summary__label">From</span><span class="confirm-summary__value">${user.name} (${Data.maskAccount(user.accountNumber)})</span></div>
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
      await UI.delay(1200);

      const user = Data.getCurrentUser();
      const result = Data.processTransaction(paymentType, user.accountNumber, formData.receiver, formData.amount);
      formData.result = result;
      currentStep = 3;
      renderStep();
    });
  }

  function renderStep3() {
    const result = formData.result;
    if (result.success) {
      return `<div class="result-anim">
        <div class="result-anim__circle result-anim__circle--success">${Icons.successCheck}</div>
        <div class="result-anim__title">Payment Successful!</div>
        <div class="result-anim__subtitle">Your money is on its way</div>
        <div class="receipt">
          <div class="receipt__row"><span class="receipt__label">Transaction ID</span><span class="receipt__value">${result.transaction.txnId}</span></div>
          <div class="receipt__row"><span class="receipt__label">Amount</span><span class="receipt__value">${Data.formatAmount(result.transaction.amount)}</span></div>
          <div class="receipt__row"><span class="receipt__label">Method</span><span class="receipt__value">${result.transaction.type}</span></div>
          <div class="receipt__row"><span class="receipt__label">Time</span><span class="receipt__value">${Data.formatDate(result.transaction.timestamp)}</span></div>
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
