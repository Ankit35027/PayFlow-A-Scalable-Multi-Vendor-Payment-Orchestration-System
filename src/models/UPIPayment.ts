import { Transaction } from "./Transaction";
import { BankAPI } from "../bank/BankAPI";
import { TransactionLogger } from "../utils/TransactionLogger";


export class UPIPayment extends Transaction {

    
    private _upiId: string;

    
    constructor(txnId: string, amount: number, senderBank: string, receiverBank: string) {
        super(txnId, amount, senderBank, receiverBank);   
        this._upiId = "";
        this.type = "UPI";    
    }

    
    get upiId(): string {
        return this._upiId;
    }
    set upiId(value: string) {
        this._upiId = value;
    }

    
    override processPayment(): boolean {
        console.log("");
        console.log("  ╔══════════════════════════════════════════════════╗");
        console.log("  ║       📱 Processing UPI Payment...              ║");
        console.log("  ╚══════════════════════════════════════════════════╝");
        console.log(`    → UPI ID      : ${this._upiId || "N/A"}`);
        console.log(`    → Amount      : ₹${this.amount.toFixed(2)}`);
        console.log(`    → Sender Acc  : ${this.senderBank}`);
        console.log(`    → Receiver Acc: ${this.receiverBank}`);
        console.log("");

       
        if (!BankAPI.validateAccount(this.senderBank)) {
            this.status = "FAILED";
            console.log("    ✗ Sender account validation FAILED!");
            TransactionLogger.logTransaction(this);
            return false;
        }

        
        if (!BankAPI.validateAccount(this.receiverBank)) {
            this.status = "FAILED";
            console.log("    ✗ Receiver account validation FAILED!");
            TransactionLogger.logTransaction(this);
            return false;
        }

       
        if (BankAPI.debitAmount(this.senderBank, this.amount)) {

            
            if (BankAPI.creditAmount(this.receiverBank, this.amount)) {
                this.status = "SUCCESS";
                console.log("    ✓ UPI Payment Successful! ✅");
                TransactionLogger.logTransaction(this);
                return true;
            } else {
                
                BankAPI.creditAmount(this.senderBank, this.amount);
                this.status = "FAILED";
                console.log("    ✗ Credit to receiver failed! Amount refunded.");
                TransactionLogger.logTransaction(this);
                return false;
            }

        } else {
            this.status = "FAILED";
            console.log("    ✗ Insufficient balance in sender's account!");
            TransactionLogger.logTransaction(this);
            return false;
        }
    }
}
