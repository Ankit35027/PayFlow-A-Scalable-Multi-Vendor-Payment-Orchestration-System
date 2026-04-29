import { BaseTransaction } from "../models/BaseTransaction";

/**
 * ┌─────────────────────────────────────────────────────────────────┐
 * │ ITransactionQuery Interface                                    │
 * ├─────────────────────────────────────────────────────────────────┤
 * │ SOLID: Interface Segregation Principle (ISP)                   │
 * │ This interface is SEPARATED from IPaymentProcessor.            │
 * │ Classes that only need to QUERY transactions (e.g., a          │
 * │ reporting/analytics module) implement ONLY this interface —    │
 * │ they don't need payment processing methods.                    │
 * └─────────────────────────────────────────────────────────────────┘
 */
export interface ITransactionQuery {

    /**
     * Get the status of a specific transaction.
     * @param txnId - The transaction ID to look up
     * @returns The status string (PENDING, SUCCESS, FAILED, CANCELLED)
     */
    getTransactionStatus(txnId: string): string;

    /**
     * Get the complete history of all transactions.
     * @returns Array of all transactions processed
     */
    getTransactionHistory(): BaseTransaction[];
}
