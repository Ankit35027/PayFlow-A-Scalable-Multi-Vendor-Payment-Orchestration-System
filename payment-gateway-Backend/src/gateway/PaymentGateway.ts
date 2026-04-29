import { IPaymentGateway } from "../interfaces/IPaymentGateway";
import { BaseTransaction } from "../models/BaseTransaction";
import { Transaction } from "../models/Transaction";
import { User } from "../models/User";
import { TransactionLogger } from "../utils/TransactionLogger";

/**
 * ┌─────────────────────────────────────────────────────────────────┐
 * │ PaymentGateway — Singleton + Interface Implementation          │
 * ├─────────────────────────────────────────────────────────────────┤
 * │ DESIGN PATTERN: SINGLETON                                      │
 * │   Only ONE instance of PaymentGateway can exist at a time.     │
 * │   Use PaymentGateway.getInstance() to get the single instance. │
 * │   The constructor is PRIVATE — cannot use `new`.               │
 * │                                                                │
 * │   WHY SINGLETON?                                               │
 * │   • Prevents multiple gateway instances causing INCONSISTENT   │
 * │     transaction state.                                         │
 * │   • All parts of the app share the same transaction map.       │
 * │   • Mirrors real-world: there's one central payment gateway.   │
 * ├─────────────────────────────────────────────────────────────────┤
 * │ OOP: ABSTRACTION                                               │
 * │   Implements IPaymentGateway interface (which combines         │
 * │   IPaymentProcessor + ITransactionQuery via ISP).              │
 * ├─────────────────────────────────────────────────────────────────┤
 * │ SOLID: Dependency Inversion Principle (DIP)                    │
 * │   PaymentGateway depends on BaseTransaction ABSTRACTION,       │
 * │   NOT on concrete UPIPayment or NetBankingPayment classes.     │
 * │   It calls txn.processPayment() without knowing which          │
 * │   concrete type it is — polymorphic dispatch handles it.       │
 * ├─────────────────────────────────────────────────────────────────┤
 * │ SYSTEM DESIGN: Map<String, Transaction>                        │
 * │   WHY Map instead of Array?                                    │
 * │   • O(1) lookup by transaction ID — scales much better.        │
 * │   • Array would require O(n) search for every status check.    │
 * ├─────────────────────────────────────────────────────────────────┤
 * │ UML: COMPOSITION with Transaction (filled diamond ◆)           │
 * │   PaymentGateway OWNS the transactions Map.                    │
 * │   If gateway is destroyed, all transactions go with it.        │
 * │ UML: AGGREGATION with User (hollow diamond ◇)                  │
 * │   PaymentGateway REFERENCES users but doesn't own them.        │
 * │   Users can exist independently of the gateway.                │
 * └─────────────────────────────────────────────────────────────────┘
 */
export class PaymentGateway implements IPaymentGateway {

    // ── Singleton Instance ──────────────────────────────────────────
    private static instance: PaymentGateway | null = null;

    // ── Composition: Gateway OWNS transactions ──────────────────────
    // Map<txnId, Transaction> → O(1) lookup by ID
    private transactions: Map<string, BaseTransaction>;

    // ── Aggregation: Gateway REFERENCES users (doesn't own them) ────
    private registeredUsers: Map<string, User>;

    // ── Private Constructor (Singleton) ─────────────────────────────
    /**
     * PRIVATE constructor — prevents direct instantiation.
     * Use PaymentGateway.getInstance() instead.
     */
    private constructor() {
        this.transactions = new Map();
        this.registeredUsers = new Map();
    }

    // ── Singleton: Get Instance ─────────────────────────────────────
    /**
     * Returns the single instance of PaymentGateway.
     * Creates it on first call (lazy initialization).
     */
    public static getInstance(): PaymentGateway {
        if (PaymentGateway.instance === null) {
            PaymentGateway.instance = new PaymentGateway();
        }
        return PaymentGateway.instance;
    }

    // ── User Registration (Aggregation) ─────────────────────────────
    /**
     * Registers a user with the payment gateway.
     * Aggregation: the gateway holds a reference, not ownership.
     */
    public registerUser(user: User): void {
        this.registeredUsers.set(user.accountNumber, user);
        TransactionLogger.logInfo(`User "${user.name}" registered with account ${user.accountNumber}`);
    }

    /**
     * Retrieves a registered user by account number.
     */
    public getUser(accountNumber: string): User | undefined {
        return this.registeredUsers.get(accountNumber);
    }

    /**
     * Returns all registered users.
     */
    public getAllUsers(): User[] {
        return Array.from(this.registeredUsers.values());
    }

    // ═══════════════════════════════════════════════════════════════
    // ── IPaymentProcessor Implementation ────────────────────────────
    // ═══════════════════════════════════════════════════════════════

    /**
     * Process a payment transaction.
     *
     * DIP IN ACTION:
     *   This method accepts BaseTransaction (abstraction).
     *   It calls txn.processPayment() — the CONCRETE type
     *   (UPIPayment or NetBankingPayment) determines the behavior
     *   at RUNTIME. This is Dependency Inversion + Polymorphism.
     *
     * @param transaction - The transaction to process (any subtype)
     * @returns true if payment was successful
     */
    processPayment(transaction: BaseTransaction): boolean {
        console.log("\n  ─────────────────────────────────────────────────");
        console.log("  🔄 PaymentGateway: Raising transaction request...");
        console.log("  ─────────────────────────────────────────────────");

        // Store the transaction (Composition: gateway owns it now)
        this.transactions.set(transaction.txnId, transaction);

        // POLYMORPHIC CALL — DIP:
        // We don't know if this is UPIPayment or NetBankingPayment.
        // The correct processPayment() is called automatically.
        const success = transaction.processPayment();

        if (success) {
            console.log(`\n  ✅ Transaction ${transaction.txnId} completed successfully!`);
        } else {
            console.log(`\n  ❌ Transaction ${transaction.txnId} failed.`);
        }

        return success;
    }

    /**
     * Cancel an existing payment transaction.
     *
     * @param txnId - The transaction ID to cancel
     * @returns true if cancellation was successful
     */
    cancelPayment(txnId: string): boolean {
        const txn = this.transactions.get(txnId);
        if (!txn) {
            console.log(`  ✗ Transaction ${txnId} not found.`);
            return false;
        }

        if (txn.status === "SUCCESS") {
            console.log(`  ⚠  Cannot cancel a successful transaction. Use refund instead.`);
            return false;
        }

        if (txn.status === "CANCELLED") {
            console.log(`  ℹ  Transaction ${txnId} is already cancelled.`);
            return false;
        }

        txn.status = "CANCELLED";
        console.log(`  ✓ Transaction ${txnId} has been cancelled.`);
        TransactionLogger.logTransaction(txn);
        return true;
    }

    // ═══════════════════════════════════════════════════════════════
    // ── ITransactionQuery Implementation ────────────────────────────
    // ═══════════════════════════════════════════════════════════════

    /**
     * Get the status of a specific transaction.
     *
     * WHY Map<String, Transaction>?
     *   This lookup is O(1) — instant, regardless of how many
     *   transactions exist. An array would be O(n).
     *
     * @param txnId - The transaction ID to look up
     * @returns Status string or "NOT FOUND"
     */
    getTransactionStatus(txnId: string): string {
        const txn = this.transactions.get(txnId);
        if (!txn) {
            return "NOT FOUND";
        }
        return txn.status;
    }

    /**
     * Get the complete history of all transactions.
     *
     * @returns Array of all transactions processed
     */
    getTransactionHistory(): BaseTransaction[] {
        return Array.from(this.transactions.values());
    }

    /**
     * Get a specific transaction by ID.
     */
    getTransaction(txnId: string): BaseTransaction | undefined {
        return this.transactions.get(txnId);
    }

    // ── Additional Gateway Methods ──────────────────────────────────

    /**
     * Sets the transaction amount (as per UML specification).
     */
    setTransactionAmount(txn: BaseTransaction, amount: number): void {
        txn.amount = amount;
    }

    /**
     * Display all transactions in a formatted table.
     */
    displayTransactionHistory(): void {
        const history = this.getTransactionHistory();
        console.log("\n  ╔══════════════════════════════════════════════════════════════════════════════════════╗");
        console.log("  ║                           📋 Transaction History                                   ║");
        console.log("  ╠══════════════════════════════════════════════════════════════════════════════════════╣");

        if (history.length === 0) {
            console.log("  ║  (No transactions recorded yet)                                                   ║");
        } else {
            console.log("  ║  #   │ Transaction ID          │ Amount       │ Status     │ Time                 ║");
            console.log("  ╟──────┼─────────────────────────┼──────────────┼────────────┼──────────────────────╢");

            history.forEach((txn, index) => {
                const num = String(index + 1).padEnd(4);
                const id = txn.txnId.substring(0, 21).padEnd(23);
                const amt = `₹${txn.amount.toFixed(2)}`.padEnd(12);
                const st = txn.status.padEnd(10);
                const time = txn.timestamp.toLocaleTimeString().padEnd(20);
                console.log(`  ║  ${num}│ ${id} │ ${amt} │ ${st} │ ${time} ║`);
            });
        }

        console.log("  ╚══════════════════════════════════════════════════════════════════════════════════════╝");
    }

    /**
     * Reset the singleton (useful for testing).
     */
    public static resetInstance(): void {
        PaymentGateway.instance = null;
    }
}
