import { IPaymentProcessor } from "./IPaymentProcessor";
import { ITransactionQuery } from "./ITransactionQuery";

export interface IPaymentGateway extends IPaymentProcessor, ITransactionQuery {
}
