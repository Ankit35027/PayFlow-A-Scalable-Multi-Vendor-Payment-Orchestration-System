import { BaseTransaction } from "../models/BaseTransaction";


export class TransactionLogger {

   
    private static logs: string[] = [];

   
    public static logTransaction(txn: BaseTransaction): void {
        const logEntry = `[${new Date().toISOString()}] TXN: ${txn.txnId} | ₹${txn.amount.toFixed(2)} | Status: ${txn.status}`;
        this.logs.push(logEntry);
        console.log(`  📝 Log: ${logEntry}`);
    }

    
    public static logError(message: string): void {
        const logEntry = `[${new Date().toISOString()}] ❌ ERROR: ${message}`;
        this.logs.push(logEntry);
        console.error(`  ${logEntry}`);
    }

    
    public static logInfo(message: string): void {
        const logEntry = `[${new Date().toISOString()}] ℹ️  INFO: ${message}`;
        this.logs.push(logEntry);
    }

   
    public static getLogs(): string[] {
        return [...this.logs]; // Return a copy to protect internal state
    }

    
    public static printAllLogs(): void {
        console.log("\n  ╔══════════════════════════════════════════════════╗");
        console.log("  ║            📋 Transaction Logs                  ║");
        console.log("  ╚══════════════════════════════════════════════════╝\n");
        if (this.logs.length === 0) {
            console.log("  (No logs recorded yet)");
        } else {
            this.logs.forEach((log, index) => {
                console.log(`  ${index + 1}. ${log}`);
            });
        }
    }
}
