import { User } from "./models/User";
import { Transaction } from "./models/Transaction";
import { UPIPayment } from "./models/UPIPayment";
import { NetBankingPayment } from "./models/NetBankingPayment";
import { BaseTransaction } from "./models/BaseTransaction";
import { PaymentGateway } from "./gateway/PaymentGateway";
import { TransactionFactory } from "./factory/TransactionFactory";
import { BankAPI } from "./bank/BankAPI";
import { TransactionLogger } from "./utils/TransactionLogger";


let passCount = 0;
let failCount = 0;
let totalTests = 0;
const failures: string[] = [];

function assert(condition: boolean, testName: string): void {
    totalTests++;
    if (condition) {
        passCount++;
        console.log(`  ✅ PASS: ${testName}`);
    } else {
        failCount++;
        failures.push(testName);
        console.log(`  ❌ FAIL: ${testName}`);
    }
}

function assertEqual<T>(actual: T, expected: T, testName: string): void {
    assert(actual === expected, `${testName} (expected: ${expected}, got: ${actual})`);
}

function section(name: string): void {
    console.log(`\n  ╔${"═".repeat(56)}╗`);
    console.log(`  ║  ${name.padEnd(54)}║`);
    console.log(`  ╚${"═".repeat(56)}╝\n`);
}

// Suppress console output during tests
const originalLog = console.log;
const originalError = console.error;
function suppressLogs(): void {
    console.log = () => {};
    console.error = () => {};
}
function restoreLogs(): void {
    console.log = originalLog;
    console.error = originalError;
}

function resetAll(): void {
    BankAPI.reset();
    PaymentGateway.resetInstance();
}


function testUserRegistrationAndLogin(): void {
    section("TEST SUITE 1: Register User & Login");


    const user = new User("TestUser", "ACC9001", "testuser01", 1111, "testpass", "9999999999");
    assert(user.name === "TestUser", "TC-1.1: Create user with valid name");

    assertEqual(user.accountNumber, "ACC9001", "TC-1.2a: accountNumber getter");
    assertEqual(user.userId, "testuser01", "TC-1.2b: userId getter");
    assertEqual(user.phoneNumber, "9999999999", "TC-1.2c: phoneNumber getter");

    assert(user.validatePassword("testpass"), "TC-1.3: Login with correct password");

    assert(!user.validatePassword("wrongpass"), "TC-1.4: Login with wrong password rejected");

    assert(user.validateMpin(1111), "TC-1.5: Correct MPIN validates");

    assert(!user.validateMpin(9999), "TC-1.6: Wrong MPIN rejected");

    user.name = "UpdatedName";
    assertEqual(user.name, "UpdatedName", "TC-1.7: setName() works (Encapsulation)");

    const created = BankAPI.createAccount("ACC9001", 25000);
    assert(created, "TC-1.8: BankAPI.createAccount() succeeds for new account");

    const duplicate = BankAPI.createAccount("ACC9001", 5000);
    assert(!duplicate, "TC-1.9: Duplicate account creation rejected");
}



function testCheckBalance(): void {
    section("TEST SUITE 2: Check Balance");


    assertEqual(BankAPI.checkBalance("ACC1001"), 50000, "TC-2.1: Ankit's balance = ₹50,000");


    assertEqual(BankAPI.checkBalance("ACC1002"), 30000, "TC-2.2: Priya's balance = ₹30,000");

    assertEqual(BankAPI.checkBalance("ACC9999"), -1, "TC-2.3: Non-existent account returns -1");


    assert(BankAPI.validateAccount("ACC1001"), "TC-2.4: ACC1001 exists");


    assert(!BankAPI.validateAccount("INVALID"), "TC-2.5: INVALID account doesn't exist");
}



function testUPIPayment(): void {
    section("TEST SUITE 3: Send Money (UPI)");
    resetAll();

    const gateway = PaymentGateway.getInstance();
    const sender = new User("Ankit", "ACC1001", "ankit01", 1234, "pass123", "9876543210");
    const receiver = new User("Priya", "ACC1002", "priya02", 5678, "pass456", "9123456780");


    suppressLogs();
    const txn1 = TransactionFactory.createTransaction("UPI", "TXN001", 5000, "ACC1001", "ACC1002");
    txn1.sender = sender;
    txn1.receiver = receiver;
    const result1 = gateway.processPayment(txn1);
    restoreLogs();

    assert(result1, "TC-3.1: UPI payment of ₹5,000 succeeds");
    assertEqual(txn1.status, "SUCCESS", "TC-3.1b: Transaction status = SUCCESS");
    assertEqual(BankAPI.checkBalance("ACC1001"), 45000, "TC-3.1c: Sender debited (₹50K → ₹45K)");
    assertEqual(BankAPI.checkBalance("ACC1002"), 35000, "TC-3.1d: Receiver credited (₹30K → ₹35K)");


    suppressLogs();
    const txn2 = TransactionFactory.createTransaction("UPI", "TXN002", 999999, "ACC1001", "ACC1002");
    const result2 = gateway.processPayment(txn2);
    restoreLogs();

    assert(!result2, "TC-3.2: UPI payment with insufficient balance fails");
    assertEqual(txn2.status, "FAILED", "TC-3.2b: Status = FAILED");


    suppressLogs();
    const txn3 = TransactionFactory.createTransaction("UPI", "TXN003", 100, "ACC1001", "INVALID");
    const result3 = gateway.processPayment(txn3);
    restoreLogs();

    assert(!result3, "TC-3.3: UPI payment to invalid account fails");


    suppressLogs();
    const txn4 = TransactionFactory.createTransaction("UPI", "TXN004", 100, "INVALID", "ACC1002");
    const result4 = gateway.processPayment(txn4);
    restoreLogs();

    assert(!result4, "TC-3.4: UPI payment from invalid sender fails");

    assert(txn1 instanceof UPIPayment, "TC-3.5: Factory creates UPIPayment instance");
    assertEqual(txn1.type, "UPI", "TC-3.5b: Transaction type = 'UPI'");
}



function testNetBankingPayment(): void {
    section("TEST SUITE 4: Send Money (Net Banking)");
    resetAll();

    const gateway = PaymentGateway.getInstance();


    suppressLogs();
    const txn1 = TransactionFactory.createTransaction("NETBANKING", "TXN010", 10000, "ACC1003", "ACC1001");
    const result1 = gateway.processPayment(txn1);
    restoreLogs();

    assert(result1, "TC-4.1: Net Banking payment of ₹10,000 succeeds");
    assertEqual(txn1.status, "SUCCESS", "TC-4.1b: Status = SUCCESS");
    assertEqual(BankAPI.checkBalance("ACC1003"), 65000, "TC-4.1c: Sender debited (₹75K → ₹65K)");
    assertEqual(BankAPI.checkBalance("ACC1001"), 60000, "TC-4.1d: Receiver credited (₹50K → ₹60K)");


    assert(txn1 instanceof NetBankingPayment, "TC-4.2: Factory creates NetBankingPayment");
    assertEqual(txn1.type, "NETBANKING", "TC-4.2b: type = 'NETBANKING'");


    suppressLogs();
    const txn2 = TransactionFactory.createTransaction("NETBANKING", "TXN011", 999999, "ACC1003", "ACC1001");
    const result2 = gateway.processPayment(txn2);
    restoreLogs();

    assert(!result2, "TC-4.3: Net Banking with insufficient balance fails");
}

function testTransactionHistory(): void {
    section("TEST SUITE 5: View Transaction History");
    resetAll();

    const gateway = PaymentGateway.getInstance();


    assertEqual(gateway.getTransactionHistory().length, 0, "TC-5.1: History empty at start");


    suppressLogs();
    const txn1 = TransactionFactory.createTransaction("UPI", "TXN020", 1000, "ACC1001", "ACC1002");
    gateway.processPayment(txn1);
    const txn2 = TransactionFactory.createTransaction("NETBANKING", "TXN021", 2000, "ACC1002", "ACC1003");
    gateway.processPayment(txn2);
    restoreLogs();

    assertEqual(gateway.getTransactionHistory().length, 2, "TC-5.2: History has 2 transactions");


    const history = gateway.getTransactionHistory();
    assertEqual(history[0].txnId, "TXN020", "TC-5.3: First transaction ID correct");
    assertEqual(history[1].txnId, "TXN021", "TC-5.3b: Second transaction ID correct");
}


function testCancelTransaction(): void {
    section("TEST SUITE 6: Cancel Transaction");
    resetAll();

    const gateway = PaymentGateway.getInstance();

    // Create a PENDING transaction (it will fail because we use invalid accounts)
    suppressLogs();
    const pendingTxn = TransactionFactory.createTransaction("UPI", "TXN030", 500, "ACC1001", "INVALID");
    gateway.processPayment(pendingTxn); // This will fail, status = FAILED

    // Create a successful transaction
    const successTxn = TransactionFactory.createTransaction("UPI", "TXN031", 100, "ACC1001", "ACC1002");
    gateway.processPayment(successTxn);

    // TC-6.1: Cannot cancel a successful transaction
    const cancelSuccess = gateway.cancelPayment("TXN031");
    restoreLogs();
    assert(!cancelSuccess, "TC-6.1: Cannot cancel a SUCCESS transaction");

    // TC-6.2: Cannot cancel a non-existent transaction
    suppressLogs();
    const cancelMissing = gateway.cancelPayment("NON_EXISTENT");
    restoreLogs();
    assert(!cancelMissing, "TC-6.2: Cannot cancel non-existent transaction");

    // TC-6.3: Can cancel a FAILED transaction (changing status to CANCELLED)
    suppressLogs();
    // The pendingTxn is FAILED — let's manually set one to PENDING for testing
    const manualPending = TransactionFactory.createTransaction("UPI", "TXN032", 200, "ACC1001", "ACC1002");
    // Store without processing (stays PENDING)
    (gateway as any).transactions.set("TXN032", manualPending);
    const cancelPending = gateway.cancelPayment("TXN032");
    restoreLogs();

    assert(cancelPending, "TC-6.3: Cancel PENDING transaction succeeds");
    assertEqual(manualPending.status, "CANCELLED", "TC-6.3b: Status changed to CANCELLED");

    // TC-6.4: Cannot cancel an already cancelled transaction
    suppressLogs();
    const cancelAgain = gateway.cancelPayment("TXN032");
    restoreLogs();
    assert(!cancelAgain, "TC-6.4: Cannot cancel already-cancelled transaction");
}



function testTransactionStatus(): void {
    section("TEST SUITE 7: Check Transaction Status");
    resetAll();

    const gateway = PaymentGateway.getInstance();

    // TC-7.1: Non-existent transaction returns "NOT FOUND"
    assertEqual(gateway.getTransactionStatus("FAKE"), "NOT FOUND", "TC-7.1: Unknown txnId → NOT FOUND");

    // TC-7.2: Successful transaction has status SUCCESS
    suppressLogs();
    const txn = TransactionFactory.createTransaction("UPI", "TXN040", 500, "ACC1001", "ACC1002");
    gateway.processPayment(txn);
    restoreLogs();

    assertEqual(gateway.getTransactionStatus("TXN040"), "SUCCESS", "TC-7.2: Successful txn → SUCCESS");

    // TC-7.3: O(1) lookup via Map — functional verification
    const start = Date.now();
    for (let i = 0; i < 10000; i++) {
        gateway.getTransactionStatus("TXN040");
    }
    const elapsed = Date.now() - start;
    assert(elapsed < 100, `TC-7.3: 10,000 lookups in ${elapsed}ms (Map O(1) efficiency)`);
}



function testDesignPatterns(): void {
    section("TEST SUITE 8: Design Patterns");
    resetAll();

    // ── Singleton Pattern ───────────────────────────────────────────

    // TC-8.1: getInstance() returns the same instance
    const gw1 = PaymentGateway.getInstance();
    const gw2 = PaymentGateway.getInstance();
    assert(gw1 === gw2, "TC-8.1: Singleton — same instance returned");

    // TC-8.2: State shared across references
    suppressLogs();
    const txn = TransactionFactory.createTransaction("UPI", "TXN050", 100, "ACC1001", "ACC1002");
    gw1.processPayment(txn);
    restoreLogs();
    assertEqual(gw2.getTransactionHistory().length, 1, "TC-8.2: Singleton — state shared");



    // TC-8.3: Factory creates UPIPayment for "UPI"
    const upiTxn = TransactionFactory.createTransaction("UPI", "F1", 100, "ACC1001", "ACC1002");
    assert(upiTxn instanceof UPIPayment, "TC-8.3: Factory creates UPIPayment for 'UPI'");

    // TC-8.4: Factory creates NetBankingPayment for "NETBANKING"
    const nbTxn = TransactionFactory.createTransaction("NETBANKING", "F2", 200, "ACC1001", "ACC1002");
    assert(nbTxn instanceof NetBankingPayment, "TC-8.4: Factory creates NetBankingPayment");

    // TC-8.5: Factory throws for unknown type
    let threwError = false;
    try {
        TransactionFactory.createTransaction("CRYPTO", "F3", 100, "A", "B");
    } catch (e) {
        threwError = true;
    }
    assert(threwError, "TC-8.5: Factory throws for unknown type 'CRYPTO'");

    // TC-8.6: Factory returns Transaction base type (LSP — Liskov)
    const txn2: Transaction = TransactionFactory.createTransaction("UPI", "F4", 100, "A", "B");
    assert(txn2 instanceof Transaction, "TC-8.6: LSP — UPIPayment is-a Transaction");
    assert(txn2 instanceof BaseTransaction, "TC-8.6b: LSP — UPIPayment is-a BaseTransaction");
}
function testOOPConcepts(): void {
    section("TEST SUITE 9: OOP Concepts");
    resetAll();

    // ── Inheritance ─────────────────────────────────────────────────

    // TC-9.1: UPIPayment inherits from Transaction
    const upi = new UPIPayment("INH1", 500, "ACC1001", "ACC1002");
    assert(upi instanceof Transaction, "TC-9.1: Inheritance — UPIPayment extends Transaction");
    assert(upi instanceof BaseTransaction, "TC-9.1b: Inheritance — chain to BaseTransaction");

    // TC-9.2: Inherited fields accessible
    assertEqual(upi.txnId, "INH1", "TC-9.2: Inherited txnId accessible");
    assertEqual(upi.amount, 500, "TC-9.2b: Inherited amount accessible");
    assertEqual(upi.status, "PENDING", "TC-9.2c: Inherited status = PENDING");

    suppressLogs();
    const upiPay = TransactionFactory.createTransaction("UPI", "POLY1", 100, "ACC1001", "ACC1002");
    const nbPay = TransactionFactory.createTransaction("NETBANKING", "POLY2", 100, "ACC1001", "ACC1003");


    const r1 = upiPay.processPayment();
    const r2 = nbPay.processPayment();
    restoreLogs();

    assert(r1, "TC-9.3: Polymorphism — UPI processPayment() succeeds");
    assert(r2, "TC-9.3b: Polymorphism — NetBanking processPayment() succeeds");

    const transactions: BaseTransaction[] = [upiPay, nbPay];
    assert(transactions.length === 2, "TC-9.4: Polymorphic array holds both types");

    const user = new User("Enc", "A1", "enc01", 1234, "pwd", "1234567890");
    user.name = "Changed";
    assertEqual(user.name, "Changed", "TC-9.5: Encapsulation — setter/getter works");
}



function testBankAPI(): void {
    section("TEST SUITE 10: BankAPI Operations");
    resetAll();

    // TC-10.1: Debit succeeds with sufficient balance
    assert(BankAPI.debitAmount("ACC1001", 10000), "TC-10.1: Debit ₹10K from ₹50K succeeds");
    assertEqual(BankAPI.checkBalance("ACC1001"), 40000, "TC-10.1b: Balance = ₹40K after debit");

    // TC-10.2: Debit fails with insufficient balance
    assert(!BankAPI.debitAmount("ACC1001", 999999), "TC-10.2: Debit ₹999K from ₹40K fails");
    assertEqual(BankAPI.checkBalance("ACC1001"), 40000, "TC-10.2b: Balance unchanged after fail");

    // TC-10.3: Credit works
    assert(BankAPI.creditAmount("ACC1001", 5000), "TC-10.3: Credit ₹5K succeeds");
    assertEqual(BankAPI.checkBalance("ACC1001"), 45000, "TC-10.3b: Balance = ₹45K after credit");


    assert(!BankAPI.debitAmount("FAKE", 100), "TC-10.4: Debit from non-existent fails");


    assert(!BankAPI.creditAmount("FAKE", 100), "TC-10.5: Credit to non-existent fails");


    const id1 = BankAPI.generateTransactionId();
    const id2 = BankAPI.generateTransactionId();
    assert(id1 !== id2, "TC-10.6: Transaction IDs are unique");
    assert(id1.startsWith("TXN"), "TC-10.6b: ID starts with 'TXN'");


    BankAPI.createAccount("ACC_NEW", 15000);
    assertEqual(BankAPI.checkBalance("ACC_NEW"), 15000, "TC-10.7: New account balance = ₹15K");


    assert(BankAPI.debitAmount("ACC1002", 0), "TC-10.8: Zero debit succeeds (edge case)");

    const exactBal = BankAPI.checkBalance("ACC1002");
    assert(BankAPI.debitAmount("ACC1002", exactBal), "TC-10.9: Debit exact balance succeeds");
    assertEqual(BankAPI.checkBalance("ACC1002"), 0, "TC-10.9b: Balance = ₹0 after exact debit");
}


function runAllTests(): void {
    console.log("\n");
    console.log("  ╔══════════════════════════════════════════════════════════╗");
    console.log("  ║        🧪 PayFlow — Automated Test Suite                 ║");
    console.log("  ╚══════════════════════════════════════════════════════════╝");

    testUserRegistrationAndLogin();   
    testCheckBalance();               
    testUPIPayment();                 
    testNetBankingPayment();          
    testTransactionHistory();        
    testCancelTransaction();          
    testTransactionStatus();          
    testDesignPatterns();            
    testOOPConcepts();                
    testBankAPI();                    

    console.log(`\n  ╔══════════════════════════════════════════════════════════╗`);
    console.log(`  ║              📊 Test Results Summary                      ║`);
    console.log(`  ╠══════════════════════════════════════════════════════════╣`);
    console.log(`  ║  Total Tests  : ${String(totalTests).padEnd(40)}║`);
    console.log(`  ║  ✅ Passed    : ${String(passCount).padEnd(40)}║`);
    console.log(`  ║  ❌ Failed    : ${String(failCount).padEnd(40)}║`);
    console.log(`  ║  Pass Rate   : ${(((passCount / totalTests) * 100).toFixed(1) + "%").padEnd(40)}║`);
    console.log(`  ╠══════════════════════════════════════════════════════════╣`);

    if (failCount === 0) {
        console.log(`  ║  🎉 ALL TESTS PASSED!                                    ║`);
    } else {
        console.log(`  ║  ⚠  Some tests failed:                                   ║`);
        failures.forEach((f) => {
            console.log(`  ║    • ${f.substring(0, 52).padEnd(52)}║`);
        });
    }
    console.log(`  ╚══════════════════════════════════════════════════════════╝\n`);

    process.exit(failCount > 0 ? 1 : 0);
}

runAllTests();
