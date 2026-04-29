import * as readline from "readline";
import { User } from "./models/User";
import { UPIPayment } from "./models/UPIPayment";
import { NetBankingPayment } from "./models/NetBankingPayment";
import { PaymentGateway } from "./gateway/PaymentGateway";
import { TransactionFactory } from "./factory/TransactionFactory";
import { BankAPI } from "./bank/BankAPI";
import { TransactionLogger } from "./utils/TransactionLogger";

/**
 * Main.ts — Console Application Entry Point
 *
 * CORE FUNCTIONALITIES:
 *  1. Register User        — Create new user + bank account
 *  2. Login                — Validate userId + password
 *  3. Check Balance        — BankAPI.checkBalance()
 *  4. Send Money (UPI)     — Factory → UPIPayment → processPayment()
 *  5. Send Money (NetBank) — Factory → NetBankingPayment → processPayment()
 *  6. View Txn History     — PaymentGateway's Map
 *  7. Cancel Transaction   — cancelPayment() if status is PENDING
 */

// ── Readline ────────────────────────────────────────────────────────
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
function prompt(q: string): Promise<string> {
    return new Promise((res) => rl.question(q, (a) => res(a.trim())));
}

// ── Pre-loaded Users ────────────────────────────────────────────────
const users: User[] = [
    new User("Ankit", "ACC1001", "ankit01", 1234, "pass123", "9876543210"),
    new User("Priya", "ACC1002", "priya02", 5678, "pass456", "9123456780"),
    new User("Rahul", "ACC1003", "rahul03", 9012, "pass789", "9988776655"),
];

// ── Singleton Gateway ───────────────────────────────────────────────
const gateway = PaymentGateway.getInstance();
users.forEach((u) => gateway.registerUser(u));

// ═══════════════════════════════════════════════════════════════════
// ── UI Helpers ──────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════

function printBanner(): void {
    console.clear();
    console.log("");
    console.log("  ╔══════════════════════════════════════════════════════╗");
    console.log("  ║       💳  P A Y F L O W                              ║");
    console.log("  ║       Payment Gateway System                         ║");
    console.log("  ║       Built with TypeScript                          ║");
    console.log("  ║       OOP • SOLID • Design Patterns                  ║");
    console.log("  ╚══════════════════════════════════════════════════════╝\n");
}

function div(): void { console.log("\n  ═══════════════════════════════════════════════════════\n"); }

// ═══════════════════════════════════════════════════════════════════
// ── 1. REGISTER USER ────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════

async function registerUser(): Promise<void> {
    div();
    console.log("  ┌──────────────────────────────────────────────────────┐");
    console.log("  │           📝 Register New User                       │");
    console.log("  └──────────────────────────────────────────────────────┘\n");

    const name = await prompt("  Full Name          : ");
    if (!name) { console.log("  ❌ Name cannot be empty!"); return; }

    const userId = await prompt("  Choose User ID     : ");
    if (!userId) { console.log("  ❌ User ID cannot be empty!"); return; }
    if (users.find((u) => u.userId === userId)) {
        console.log(`  ❌ User ID "${userId}" already taken!`); return;
    }

    const password = await prompt("  Set Password       : ");
    if (!password || password.length < 4) { console.log("  ❌ Password must be ≥4 chars!"); return; }

    const mpinStr = await prompt("  Set 4-digit MPIN   : ");
    const mpin = parseInt(mpinStr);
    if (isNaN(mpin) || mpinStr.length !== 4) { console.log("  ❌ MPIN must be 4 digits!"); return; }

    const phone = await prompt("  Phone Number       : ");
    if (!phone || phone.length < 10) { console.log("  ❌ Phone must be ≥10 digits!"); return; }

    const balStr = await prompt("  Initial Deposit (₹): ");
    const deposit = parseFloat(balStr);
    if (isNaN(deposit) || deposit < 0) { console.log("  ❌ Invalid amount!"); return; }

    const accNo = BankAPI.generateAccountNumber();
    if (!BankAPI.createAccount(accNo, deposit)) {
        console.log("  ❌ Failed to create bank account."); return;
    }

    const newUser = new User(name, accNo, userId, mpin, password, phone);
    users.push(newUser);
    gateway.registerUser(newUser);

    console.log("\n  ✅ Registration Successful!");
    console.log(`     Name: ${name} | Account: ${accNo} | Balance: ₹${deposit.toFixed(2)}`);
    console.log("  ℹ  You can now login with your User ID and Password.\n");
}

// ═══════════════════════════════════════════════════════════════════
// ── 2. LOGIN ────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════

async function loginFlow(): Promise<User | null> {
    div();
    console.log("  ┌──────────────────────────────────────────────────────┐");
    console.log("  │               🔐 User Login                          │");
    console.log("  ├──────────────────────────────────────────────────────┤");
    users.forEach((u, i) => {
        console.log(`  │    ${i + 1}. ${u.name.padEnd(10)} (ID: ${u.userId})`.padEnd(56) + "│");
    });
    console.log("  └──────────────────────────────────────────────────────┘\n");

    const userId = await prompt("  User ID  : ");
    const password = await prompt("  Password : ");

    const user = users.find((u) => u.userId === userId);
    if (!user) { console.log("\n  ❌ User not found!"); return null; }
    if (!user.validatePassword(password)) { console.log("\n  ❌ Wrong password!"); return null; }

    console.log(`\n  ✅ Welcome back, ${user.name}!`);
    return user;
}

// ═══════════════════════════════════════════════════════════════════
// ── 3. CHECK BALANCE ────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════

function checkBalance(u: User): void {
    div();
    const bal = BankAPI.checkBalance(u.accountNumber);
    console.log("  ┌──────────────────────────────────────────────────────┐");
    console.log("  │           💰 Account Balance                         │");
    console.log("  ├──────────────────────────────────────────────────────┤");
    console.log(`  │  Account : ${u.accountNumber}`);
    console.log(`  │  Balance : ₹${bal.toFixed(2)}`);
    console.log("  └──────────────────────────────────────────────────────┘");
}

// ═══════════════════════════════════════════════════════════════════
// ── 4 & 5. SEND MONEY (UPI / NET BANKING) ───────────────────────────
// ═══════════════════════════════════════════════════════════════════

async function sendMoney(currentUser: User, paymentType: "UPI" | "NETBANKING"): Promise<void> {
    div();
    const label = paymentType === "UPI" ? "📱 UPI" : "🏦 Net Banking";
    console.log(`  ┌──────────────────────────────────────────────────────┐`);
    console.log(`  │       💸 Send Money via ${label.padEnd(29)}│`);
    console.log(`  └──────────────────────────────────────────────────────┘`);

    // Show recipients
    console.log("\n  Available Recipients:");
    users.filter((u) => u.accountNumber !== currentUser.accountNumber)
         .forEach((u) => console.log(`    → ${u.name.padEnd(12)} Account: ${u.accountNumber}`));

    const receiverAcc = await prompt("\n  Receiver Account No: ");
    if (receiverAcc === currentUser.accountNumber) { console.log("  ❌ Can't send to yourself!"); return; }
    if (!BankAPI.validateAccount(receiverAcc)) { console.log("  ❌ Invalid account!"); return; }

    const amount = parseFloat(await prompt("  Amount (₹)         : "));
    if (isNaN(amount) || amount <= 0) { console.log("  ❌ Invalid amount!"); return; }

    const bal = BankAPI.checkBalance(currentUser.accountNumber);
    if (amount > bal) { console.log(`  ❌ Insufficient balance! (₹${bal.toFixed(2)})`); return; }

    const mpin = parseInt(await prompt("  Enter MPIN         : "));
    if (!currentUser.validateMpin(mpin)) { console.log("  ❌ Invalid MPIN!"); return; }

    // ── FACTORY PATTERN — create correct type automatically ─────────
    const txnId = BankAPI.generateTransactionId();
    const txn = TransactionFactory.createTransaction(paymentType, txnId, amount, currentUser.accountNumber, receiverAcc);

    // Composition — Transaction owns User references
    txn.sender = currentUser;
    txn.receiver = gateway.getUser(receiverAcc) ?? null;

    // Set type-specific fields
    if (txn instanceof UPIPayment) {
        txn.upiId = await prompt("  UPI ID (e.g. user@bank): ");
    } else if (txn instanceof NetBankingPayment) {
        txn.ifscCode = await prompt("  IFSC Code (or Enter to skip): ");
        txn.bankCode = "PAYFLOW";
    }

    // ── DIP + POLYMORPHISM — gateway calls txn.processPayment() ─────
    gateway.processPayment(txn);
}

// ═══════════════════════════════════════════════════════════════════
// ── 6. VIEW TRANSACTION HISTORY ─────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════

function viewHistory(): void { div(); gateway.displayTransactionHistory(); }

// ═══════════════════════════════════════════════════════════════════
// ── 7. CANCEL TRANSACTION ───────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════

async function cancelTransaction(): Promise<void> {
    div();
    console.log("  ┌──────────────────────────────────────────────────────┐");
    console.log("  │       🚫 Cancel Transaction (PENDING only)           │");
    console.log("  └──────────────────────────────────────────────────────┘");

    const history = gateway.getTransactionHistory();
    if (history.length === 0) { console.log("\n  ℹ  No transactions found."); return; }

    console.log("\n  Transactions:");
    history.forEach((t, i) => {
        const icon = t.status === "PENDING" ? "⏳" : t.status === "SUCCESS" ? "✅" :
                     t.status === "CANCELLED" ? "🚫" : "❌";
        console.log(`    ${i + 1}. ${icon} ${t.txnId.substring(0, 22)} | ₹${t.amount.toFixed(2)} | ${t.status}`);
    });

    const txnId = await prompt("\n  Transaction ID to cancel: ");
    if (!txnId) { console.log("  ❌ ID cannot be empty!"); return; }

    gateway.cancelPayment(txnId);
}

// ── Check Status ────────────────────────────────────────────────────

async function checkStatus(): Promise<void> {
    div();
    console.log("  ┌──────────────────────────────────────────────────────┐");
    console.log("  │           🔍 Check Transaction Status                │");
    console.log("  └──────────────────────────────────────────────────────┘");

    const txnId = await prompt("\n  Transaction ID: ");
    const status = gateway.getTransactionStatus(txnId);

    if (status === "NOT FOUND") { console.log(`\n  ❌ "${txnId}" not found.`); return; }

    const txn = gateway.getTransaction(txnId);
    console.log(`\n  ID     : ${txnId}`);
    console.log(`  Status : ${status}`);
    if (txn) {
        console.log(`  Amount : ₹${txn.amount.toFixed(2)}`);
        console.log(`  Time   : ${txn.timestamp.toLocaleString()}`);
    }
}

// ── View Profile ────────────────────────────────────────────────────

function viewProfile(u: User): void {
    div();
    const bal = BankAPI.checkBalance(u.accountNumber);
    console.log("  ┌──────────────────────────────────────────────────────┐");
    console.log("  │           👤 User Profile                            │");
    console.log("  ├──────────────────────────────────────────────────────┤");
    console.log(`  │  Name    : ${u.name}`);
    console.log(`  │  User ID : ${u.userId}`);
    console.log(`  │  Account : ${u.accountNumber}`);
    console.log(`  │  Phone   : ${u.phoneNumber}`);
    console.log(`  │  Balance : ₹${bal.toFixed(2)}`);
    console.log("  └──────────────────────────────────────────────────────┘");
}

// ═══════════════════════════════════════════════════════════════════
// ── MAIN APPLICATION LOOP ───────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════

async function main(): Promise<void> {
    printBanner();
    let appRunning = true;

    while (appRunning) {
        // ── Welcome Screen ──────────────────────────────────────────
        console.log("  ┌──────────────────────────────────────────────────────┐");
        console.log("  │               🏠 Welcome to PayFlow                  │");
        console.log("  ├──────────────────────────────────────────────────────┤");
        console.log("  │  [1]  📝  Register New User                         │");
        console.log("  │  [2]  🔐  Login                                     │");
        console.log("  │  [3]  🚪  Exit                                      │");
        console.log("  └──────────────────────────────────────────────────────┘");

        const wc = await prompt("\n  Choice (1-3): ");

        if (wc === "1") {
            await registerUser();
            await prompt("\n  Press Enter to continue...");
            continue;
        }
        if (wc === "3") {
            appRunning = false;
            console.log("\n  👋 Thank you for using PayFlow!\n");
            break;
        }
        if (wc !== "2") {
            console.log("  ⚠  Invalid choice.");
            await prompt("\n  Press Enter...");
            continue;
        }

        // ── Login ───────────────────────────────────────────────────
        const user = await loginFlow();
        if (!user) { await prompt("\n  Press Enter to try again..."); continue; }

        // ── Logged-in Menu Loop ─────────────────────────────────────
        let loggedIn = true;
        while (loggedIn) {
            console.log("\n  ┌──────────────────────────────────────────────────────┐");
            console.log("  │                   📋 Main Menu                       │");
            console.log("  ├──────────────────────────────────────────────────────┤");
            console.log("  │  [1]  💰  Check Balance                             │");
            console.log("  │  [2]  📱  Send Money (UPI)                          │");
            console.log("  │  [3]  🏦  Send Money (Net Banking)                  │");
            console.log("  │  [4]  📋  View Transaction History                  │");
            console.log("  │  [5]  🚫  Cancel Transaction                        │");
            console.log("  │  [6]  🔍  Check Transaction Status                  │");
            console.log("  │  [7]  👤  View Profile                              │");
            console.log("  │  [8]  📝  View Transaction Logs                     │");
            console.log("  │  [9]  🔓  Logout                                    │");
            console.log("  └──────────────────────────────────────────────────────┘");

            const c = await prompt("\n  Choice (1-9): ");

            switch (c) {
                case "1": checkBalance(user); break;
                case "2": await sendMoney(user, "UPI"); break;
                case "3": await sendMoney(user, "NETBANKING"); break;
                case "4": viewHistory(); break;
                case "5": await cancelTransaction(); break;
                case "6": await checkStatus(); break;
                case "7": viewProfile(user); break;
                case "8": div(); TransactionLogger.printAllLogs(); break;
                case "9": loggedIn = false; console.log(`\n  🔓 Logged out. Bye, ${user.name}!\n`); break;
                default: console.log("  ⚠  Enter 1-9.");
            }
            if (loggedIn) await prompt("\n  Press Enter to continue...");
        }
    }
    rl.close();
}

main().catch((e) => { console.error("❌ Fatal:", e.message); rl.close(); process.exit(1); });
