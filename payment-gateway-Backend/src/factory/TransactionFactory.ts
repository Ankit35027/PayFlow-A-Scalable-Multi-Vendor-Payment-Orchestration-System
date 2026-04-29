import { Transaction } from "../models/Transaction";
import { UPIPayment } from "../models/UPIPayment";
import { NetBankingPayment } from "../models/NetBankingPayment";

/**
 * ┌─────────────────────────────────────────────────────────────────┐
 * │ TransactionFactory — Factory Design Pattern                    │
 * ├─────────────────────────────────────────────────────────────────┤
 * │ DESIGN PATTERN: FACTORY                                        │
 * │   Decouples transaction OBJECT CREATION from business logic.   │
 * │   The caller doesn't need to know which concrete class to      │
 * │   instantiate — the factory decides based on the type string.  │
 * ├─────────────────────────────────────────────────────────────────┤
 * │ WHY FACTORY PATTERN?                                           │
 * │   • Adding a new payment type (e.g., CryptoPayment) requires  │
 * │     ZERO changes to existing business logic code.              │
 * │   • Only this factory needs a new case — everything else       │
 * │     works through the Transaction abstraction.                 │
 * │   • Follows the Open/Closed Principle (OCP).                   │
 * ├─────────────────────────────────────────────────────────────────┤
 * │ SCALABILITY:                                                   │
 * │   To add a new payment type (e.g., WalletPayment):             │
 * │   1. Create WalletPayment class extending Transaction ✅       │
 * │   2. Add one case in this factory ✅                            │
 * │   3. Done! No other code changes needed. ✅                     │
 * └─────────────────────────────────────────────────────────────────┘
 */
export class TransactionFactory {

    /**
     * Creates a Transaction object based on the specified type.
     *
     * @param type        - "UPI" or "NETBANKING"
     * @param txnId       - Unique transaction ID
     * @param amount      - Payment amount
     * @param senderBank  - Sender's account number
     * @param receiverBank - Receiver's account number
     * @returns A Transaction instance (UPIPayment or NetBankingPayment)
     * @throws Error if the type is unknown
     *
     * USAGE EXAMPLE:
     *   const txn = TransactionFactory.createTransaction("UPI", "TXN001", 500, "ACC1001", "ACC1002");
     *   txn.processPayment();  // Calls UPIPayment's overridden method (Polymorphism)
     */
    public static createTransaction(
        type: string,
        txnId: string,
        amount: number,
        senderBank: string,
        receiverBank: string
    ): Transaction {

        switch (type.toUpperCase()) {

            case "UPI":
                return new UPIPayment(txnId, amount, senderBank, receiverBank);

            case "NETBANKING":
                return new NetBankingPayment(txnId, amount, senderBank, receiverBank);

            // ── EXTENSIBILITY POINT ─────────────────────────────────
            // To add a new payment type, simply add a new case here:
            //
            // case "CRYPTO":
            //     return new CryptoPayment(txnId, amount, senderBank, receiverBank);
            //
            // case "WALLET":
            //     return new WalletPayment(txnId, amount, senderBank, receiverBank);

            default:
                throw new Error(
                    `❌ Unknown transaction type: "${type}". ` +
                    `Supported types: UPI, NETBANKING`
                );
        }
    }
}
