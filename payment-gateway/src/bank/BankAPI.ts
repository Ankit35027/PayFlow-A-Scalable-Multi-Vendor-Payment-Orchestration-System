
export class BankAPI {


    private static bankAccounts: Map<string, number> = new Map([
        ["ACC1001", 50000.00],   
        ["ACC1002", 30000.00],   
        ["ACC1003", 75000.00],   
    ]);

    private static txnCounter: number = 1000;


    public static validateAccount(accountNumber: string): boolean {
        return this.bankAccounts.has(accountNumber);
    }


    public static debitAmount(accountNumber: string, amount: number): boolean {
        const balance = this.bankAccounts.get(accountNumber);
        if (balance !== undefined && balance >= amount) {
            this.bankAccounts.set(accountNumber, balance - amount);
            return true;
        }
        return false;
    }


    public static creditAmount(accountNumber: string, amount: number): boolean {
        const balance = this.bankAccounts.get(accountNumber);
        if (balance !== undefined) {
            this.bankAccounts.set(accountNumber, balance + amount);
            return true;
        }
        return false;
    }


    public static checkBalance(accountNumber: string): number {
        return this.bankAccounts.get(accountNumber) ?? -1;
    }


    public static generateTransactionId(): string {
        this.txnCounter++;
        return `TXN${Date.now()}${this.txnCounter}`;
    }


    public static createAccount(accountNumber: string, initialBalance: number = 10000): boolean {
        if (this.bankAccounts.has(accountNumber)) {
            return false;  // Account already exists
        }
        this.bankAccounts.set(accountNumber, initialBalance);
        return true;
    }


    private static accCounter: number = 1003;
    public static generateAccountNumber(): string {
        this.accCounter++;
        return `ACC${this.accCounter}`;
    }

    public static reset(): void {
        this.bankAccounts = new Map([
            ["ACC1001", 50000.00],
            ["ACC1002", 30000.00],
            ["ACC1003", 75000.00],
        ]);
        this.txnCounter = 1000;
        this.accCounter = 1003;
    }
}
