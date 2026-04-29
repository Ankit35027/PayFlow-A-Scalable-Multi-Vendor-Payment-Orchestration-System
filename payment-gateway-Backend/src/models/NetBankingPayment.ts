import { Transaction } from "./Transaction";
import { BankAPI } from "../bank/BankAPI";
import { TransactionLogger } from "../utils/TransactionLogger";


export class NetBankingPayment extends Transaction {

    
    private _bankCode: string;
    private _ifscCode: string;

    
    constructor(txnId: string, amount: number, senderBank: string, receiverBank: string) {
        super(txnId, amount, senderBank, receiverBank);   // Inheritance
        this._bankCode = "";
        this._ifscCode = "";
        this.type = "NETBANKING";    // Tag the transaction type
    }

    
    get bankCode(): string {
        return this._bankCode;
    }
    set bankCode(value: string) {
        this._bankCode = value;
    }

    get ifscCode(): string {
        return this._ifscCode;
    }
    set ifscCode(value: string) {
        this._ifscCode = value;
    }

    
    override processPayment(): boolean {
        console.log("");
        console.log("  ╔══════════════════════════════════════════════════╗");
        console.log("  ║       🏦 Processing Net Banking Payment...      ║");
        console.log("  ╚══════════════════════════════════════════════════╝");
        console.log(`    → Bank Code    : ${this._bankCode || "N/A"}`);
        console.log(`    → IFSC Code    : ${this._ifscCode || "N/A"}`);
        console.log(`    → Amount       : ₹${this.amount.toFixed(2)}`);
        console.log(`    → Sender Acc   : ${this.senderBank}`);
        console.log(`    → Receiver Acc : ${this.receiverBank}`);
        console.log("");

        if (!this._ifscCode || this._ifscCode.length === 0) {
            console.log("    ⚠  No IFSC code provided. Using default routing...");
        } else {
            console.log(`    ✓ IFSC Code ${this._ifscCode} verified.`);
        }

        
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

   
        console.log("    ⏳ Initiating inter-bank transfer via NEFT...");
        if (BankAPI.debitAmount(this.senderBank, this.amount)) {

   
            if (BankAPI.creditAmount(this.receiverBank, this.amount)) {
                this.status = "SUCCESS";
                console.log("    ✓ Net Banking Payment Successful! ✅");
                console.log("    ℹ  Settlement: Processed via NEFT/RTGS channel.");
                TransactionLogger.logTransaction(this);
                return true;
            } else {
                // Rollback: Credit amount back to sender
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
