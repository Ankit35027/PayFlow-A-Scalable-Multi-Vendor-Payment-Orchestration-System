
export abstract class BaseTransaction {

  
    private _txnId: string;
    private _amount: number;
    private _timestamp: Date;
    private _status: string; 

  
    constructor(txnId: string, amount: number) {
        this._txnId = txnId;
        this._amount = amount;
        this._timestamp = new Date();   
        this._status = "PENDING";       
    }

   
    abstract processPayment(): boolean;

   
    get txnId(): string {
        return this._txnId;
    }
    set txnId(value: string) {
        this._txnId = value;
    }

    get amount(): number {
        return this._amount;
    }
    set amount(value: number) {
        this._amount = value;
    }

    get timestamp(): Date {
        return this._timestamp;
    }
    set timestamp(value: Date) {
        this._timestamp = value;
    }

    get status(): string {
        return this._status;
    }
    set status(value: string) {
        this._status = value;
    }


    toDisplayString(): string {
        return `TxnID: ${this._txnId} | Amount: ₹${this._amount.toFixed(2)} | Status: ${this._status} | Time: ${this._timestamp.toLocaleString()}`;
    }
}
