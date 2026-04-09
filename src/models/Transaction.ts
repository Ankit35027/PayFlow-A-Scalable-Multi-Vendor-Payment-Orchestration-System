import { BaseTransaction } from "./BaseTransaction";
import { User } from "./User";


export class Transaction extends BaseTransaction {

    
    private _senderBank: string;
    private _receiverBank: string;
    private _sender: User | null;      
    private _receiver: User | null;    
    private _type: string;             

    
    constructor(txnId: string, amount: number, senderBank: string, receiverBank: string) {
        super(txnId, amount);  
        this._senderBank = senderBank;
        this._receiverBank = receiverBank;
        this._sender = null;
        this._receiver = null;
        this._type = "BASE";
    }

    
    processPayment(): boolean {
        console.log("  [Transaction] Base processPayment() called.");
        console.log("  ⚠  Use a specific payment type (UPI / NetBanking) instead.");
        return false;
    }

   
    get senderBank(): string {
        return this._senderBank;
    }
    set senderBank(value: string) {
        this._senderBank = value;
    }

    get receiverBank(): string {
        return this._receiverBank;
    }
    set receiverBank(value: string) {
        this._receiverBank = value;
    }

    get sender(): User | null {
        return this._sender;
    }
    set sender(value: User | null) {
        this._sender = value;
    }

    get receiver(): User | null {
        return this._receiver;
    }
    set receiver(value: User | null) {
        this._receiver = value;
    }

    get type(): string {
        return this._type;
    }
    set type(value: string) {
        this._type = value;
    }

   
    override toDisplayString(): string {
        const senderName = this._sender?.name ?? "N/A";
        const receiverName = this._receiver?.name ?? "N/A";
        return `${super.toDisplayString()} | Type: ${this._type} | From: ${senderName} → To: ${receiverName}`;
    }
}
