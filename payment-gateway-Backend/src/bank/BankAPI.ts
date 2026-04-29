/**
 * ┌─────────────────────────────────────────────────────────────────┐
 * │ BankAPI — Simulated Bank Backend                               │
 * ├─────────────────────────────────────────────────────────────────┤
 * │ SOLID: Single Responsibility Principle (SRP)                   │
 * │   This class ONLY handles bank operations:                     │
 * │   validate accounts, debit, credit, check balance.             │
 * │   It does NOT process payments or manage users.                │
 * ├─────────────────────────────────────────────────────────────────┤
 * │ SYSTEM DESIGN: Separation of Concerns                          │
 * │   In real systems, this would be a separate MICROSERVICE.      │
 * │   Our simulation mirrors that architectural boundary.           │
 * │   The PaymentGateway communicates with this API just like      │
 * │   it would with a real bank's REST API.                        │
 * └─────────────────────────────────────────────────────────────────┘
 */
export class BankAPI {

    // ── Simulated Bank Database ─────────────────────────────────────
    // Map<accountNumber, balance>
    // Pre-loaded with 3 dummy accounts
    private static bankAccounts: Map<string, number> = new Map([
        ["ACC1001", 50000.00],   // Ankit's account
        ["ACC1002", 30000.00],   // Priya's account
        ["ACC1003", 75000.00],   // Rahul's account
    ]);

    // Transaction ID counter for generating unique IDs
    private static txnCounter: number = 1000;

    // ── Validate Account ────────────────────────────────────────────
    /**
     * Checks if an account number exists in the bank database.
     * @param accountNumber - The account number to validate
     * @returns true if account exists
     */
    public static validateAccount(accountNumber: string): boolean {
        return this.bankAccounts.has(accountNumber);
    }

    // ── Debit Amount ────────────────────────────────────────────────
    /**
     * Deducts money from an account (sender's side).
     * @param accountNumber - Account to debit from
     * @param amount - Amount to debit
     * @returns true if debit was successful (sufficient balance)
     */
    public static debitAmount(accountNumber: string, amount: number): boolean {
        const balance = this.bankAccounts.get(accountNumber);
        if (balance !== undefined && balance >= amount) {
            this.bankAccounts.set(accountNumber, balance - amount);
            return true;
        }
        return false;
    }

    // ── Credit Amount ───────────────────────────────────────────────
    /**
     * Adds money to an account (receiver's side).
     * @param accountNumber - Account to credit to
     * @param amount - Amount to credit
     * @returns true if credit was successful
     */
    public static creditAmount(accountNumber: string, amount: number): boolean {
        const balance = this.bankAccounts.get(accountNumber);
        if (balance !== undefined) {
            this.bankAccounts.set(accountNumber, balance + amount);
            return true;
        }
        return false;
    }

    // ── Check Balance ───────────────────────────────────────────────
    /**
     * Returns the current balance of an account.
     * @param accountNumber - Account to check
     * @returns balance amount, or -1 if account not found
     */
    public static checkBalance(accountNumber: string): number {
        return this.bankAccounts.get(accountNumber) ?? -1;
    }

    // ── Generate Transaction ID ─────────────────────────────────────
    /**
     * Generates a unique transaction ID.
     * Format: TXN + timestamp + incrementing counter
     * @returns unique transaction ID string
     */
    public static generateTransactionId(): string {
        this.txnCounter++;
        return `TXN${Date.now()}${this.txnCounter}`;
    }

    // ── Create Account ──────────────────────────────────────────────
    /**
     * Creates a new bank account with an initial balance.
     * Used during user registration.
     * @param accountNumber - New account number
     * @param initialBalance - Starting balance (default ₹10,000)
     * @returns true if account was created, false if it already exists
     */
    public static createAccount(accountNumber: string, initialBalance: number = 10000): boolean {
        if (this.bankAccounts.has(accountNumber)) {
            return false;  // Account already exists
        }
        this.bankAccounts.set(accountNumber, initialBalance);
        return true;
    }

    // ── Generate Account Number ─────────────────────────────────────
    /**
     * Generates a unique account number.
     * Format: ACC + 4-digit incrementing number
     * @returns unique account number string
     */
    private static accCounter: number = 1003; // After ACC1001, ACC1002, ACC1003
    public static generateAccountNumber(): string {
        this.accCounter++;
        return `ACC${this.accCounter}`;
    }

    // ── Reset (for testing) ─────────────────────────────────────────
    /**
     * Resets the bank database to initial state.
     * Used in test cases to ensure clean state.
     */
    public static reset(): void {
        this.bankAccounts = new Map([
            ["ACC1001", 50000.00],
            ["ACC1002", 30000.00],
            ["ACC1003", 75000.00],
        ]);
        this.txnCounter = 1000;
        this.accCounter = 1003;
    }
}
