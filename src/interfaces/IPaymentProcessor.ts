import { BaseTransaction } from "../models/BaseTransaction";


export interface IPaymentProcessor {

    /**
     * @param transaction - The transaction to process
     * @returns true if payment was successful
     */
    processPayment(transaction: BaseTransaction): boolean;

    /**
     * @param txnId - The transaction ID to cancel
     * @returns true if cancellation was successful
     */
    cancelPayment(txnId: string): boolean;
}
