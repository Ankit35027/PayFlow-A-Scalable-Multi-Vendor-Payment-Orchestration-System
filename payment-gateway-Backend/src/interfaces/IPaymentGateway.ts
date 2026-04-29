import { IPaymentProcessor } from "./IPaymentProcessor";
import { ITransactionQuery } from "./ITransactionQuery";

/**
 * ┌─────────────────────────────────────────────────────────────────┐
 * │ IPaymentGateway Interface                                      │
 * ├─────────────────────────────────────────────────────────────────┤
 * │ OOP: ABSTRACTION                                               │
 * │ This interface defines the complete contract for a payment     │
 * │ gateway by COMBINING both segregated interfaces.               │
 * │                                                                │
 * │ It extends:                                                    │
 * │   • IPaymentProcessor → processPayment(), cancelPayment()     │
 * │   • ITransactionQuery → getTransactionStatus(),               │
 * │                         getTransactionHistory()                │
 * │                                                                │
 * │ PaymentGateway implements THIS combined interface.             │
 * ├─────────────────────────────────────────────────────────────────┤
 * │ SOLID: ISP + DIP Working Together                              │
 * │ Any class needing full gateway capabilities uses this.         │
 * │ Any class needing only processing uses IPaymentProcessor.      │
 * │ Any class needing only queries uses ITransactionQuery.          │
 * └─────────────────────────────────────────────────────────────────┘
 */
export interface IPaymentGateway extends IPaymentProcessor, ITransactionQuery {
    // Combines both interfaces — no additional methods needed.
    // PaymentGateway implements this full contract.
}
