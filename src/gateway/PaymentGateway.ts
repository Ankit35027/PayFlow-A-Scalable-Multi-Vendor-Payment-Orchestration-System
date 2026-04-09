import { IPaymentGateway } from "../interfaces/IPaymentGateway";
import { BaseTransaction } from "../models/BaseTransaction";
import { Transaction } from "../models/Transaction";
import { User } from "../models/User";
import { TransactionLogger } from "../utils/TransactionLogger";



export class PaymentGateway implements IPaymentGateway {


    private static instance: PaymentGateway | null = null;


    private transactions: Map<string, BaseTransaction>;


    private registeredUsers: Map<string, User>;


    private constructor() {
        this.transactions = new Map();
        this.registeredUsers = new Map();
    }

    public static getInstance(): PaymentGateway {
        if (PaymentGateway.instance === null) {
            PaymentGateway.instance = new PaymentGateway();
        }
        return PaymentGateway.instance;
    }

    public registerUser(user: User): void {
        this.registeredUsers.set(user.accountNumber, user);
        TransactionLogger.logInfo(`User "${user.name}" registered with account ${user.accountNumber}`);
    }

    public getUser(accountNumber: string): User | undefined {
        return this.registeredUsers.get(accountNumber);
    }

    public getAllUsers(): User[] {
        return Array.from(this.registeredUsers.values());
    }

    // ═══════════════════════════════════════════════════════════════
    // ── IPaymentProcessor Implementation ────────────────────────────
    // ═══════════════════════════════════════════════════════════════

    /**
    
     * @param transaction - The transaction to process (any subtype)
     * @returns true if payment was successful
     */
    processPayment(transaction: BaseTransaction): boolean {
        console.log("\n  ─────────────────────────────────────────────────");
        console.log("  🔄 PaymentGateway: Raising transaction request...");
        console.log("  ─────────────────────────────────────────────────");

        this.transactions.set(transaction.txnId, transaction);

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


    /**
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
     * @returns Array of all transactions processed
     */
    getTransactionHistory(): BaseTransaction[] {
        return Array.from(this.transactions.values());
    }


    getTransaction(txnId: string): BaseTransaction | undefined {
        return this.transactions.get(txnId);
    }


    setTransactionAmount(txn: BaseTransaction, amount: number): void {
        txn.amount = amount;
    }

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


    public static resetInstance(): void {
        PaymentGateway.instance = null;
    }
}
