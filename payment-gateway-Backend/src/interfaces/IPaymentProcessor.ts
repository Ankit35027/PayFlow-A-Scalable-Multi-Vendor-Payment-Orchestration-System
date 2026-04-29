import { BaseTransaction } from "../models/BaseTransaction";

/**
 * ┌─────────────────────────────────────────────────────────────────┐
 * │ IPaymentProcessor Interface                                    │
 * ├─────────────────────────────────────────────────────────────────┤
 * │ SOLID: Interface Segregation Principle (ISP)                   │
 * │ This interface is SEPARATED from ITransactionQuery.            │
 * │ Classes that only need payment processing capabilities         │
 * │ implement ONLY this interface — they are NOT forced to         │
 * │ implement query methods they don't need.                       │
 * ├─────────────────────────────────────────────────────────────────┤
 * │ SOLID: Dependency Inversion Principle (DIP)                    │
 * │ PaymentGateway depends on THIS INTERFACE, not on concrete      │
 * │ UPIPayment or NetBankingPayment classes. High-level modules    │
 * │ depend on abstractions, not implementations.                   │
 * ├─────────────────────────────────────────────────────────────────┤
 * │ OOP: ABSTRACTION                                               │
 * │ Defines WHAT operations are available without specifying       │
 * │ HOW they are implemented.                                      │
 * └─────────────────────────────────────────────────────────────────┘
 */
export interface IPaymentProcessor {

    /**
     * Process a payment transaction.
     * @param transaction - The transaction to process
     * @returns true if payment was successful
     */
    processPayment(transaction: BaseTransaction): boolean;

    /**
     * Cancel an existing payment transaction.
     * @param txnId - The transaction ID to cancel
     * @returns true if cancellation was successful
     */
    cancelPayment(txnId: string): boolean;
}
