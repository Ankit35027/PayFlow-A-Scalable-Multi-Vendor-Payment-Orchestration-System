import { Transaction } from "../models/Transaction";
import { UPIPayment } from "../models/UPIPayment";
import { NetBankingPayment } from "../models/NetBankingPayment";


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
