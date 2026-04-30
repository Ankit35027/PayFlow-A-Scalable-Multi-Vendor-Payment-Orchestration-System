import "dotenv/config";
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import { sql } from "./db/client";

const app = express();
app.use(cors());
app.use(express.json());

// ── Health ──────────────────────────────────────────────────────────
app.get("/api/health", (_req: Request, res: Response) => {
  res.json({ status: "ok", env: !!process.env.DATABASE_URL });
});

// ── Root ────────────────────────────────────────────────────────────
app.get("/", (_req: Request, res: Response) => {
  res.json({
    name: "PayFlow API",
    status: "running",
    endpoints: [
      "GET  /api/health",
      "POST /api/auth/login",
      "POST /api/auth/register",
      "GET  /api/users",
      "GET  /api/balance/:accountNumber",
      "GET  /api/transactions",
      "GET  /api/transactions/:txnId",
      "POST /api/transactions",
      "PATCH /api/transactions/:txnId/cancel",
    ],
  });
});

// ── Auth: Login ─────────────────────────────────────────────────────
app.post("/api/auth/login", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId, password } = req.body;
    if (!userId || !password) { res.status(400).json({ error: "userId and password required" }); return; }
    const rows = await sql`SELECT * FROM users WHERE user_id = ${userId}`;
    if (!rows.length) { res.status(404).json({ error: "User not found" }); return; }
    const user = rows[0];
    if (user.password !== password) { res.status(401).json({ error: "Incorrect password" }); return; }
    const { password: _pw, mpin: _mp, ...safeUser } = user;
    res.json({ user: safeUser });
  } catch (e) { next(e); }
});

// ── Auth: Register ──────────────────────────────────────────────────
app.post("/api/auth/register", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, phoneNumber, accountNumber, userId, password, mpin } = req.body;
    if (!name || !phoneNumber || !accountNumber || !userId || !password || !mpin) {
      res.status(400).json({ error: "All fields required" }); return;
    }
    const existing = await sql`SELECT user_id FROM users WHERE user_id = ${userId} OR account_number = ${accountNumber}`;
    if (existing.length) { res.status(409).json({ error: "User ID or account number already exists" }); return; }
    await sql`INSERT INTO users (user_id, name, account_number, mpin, password, phone_number)
              VALUES (${userId}, ${name}, ${accountNumber}, ${parseInt(mpin)}, ${password}, ${phoneNumber})`;
    await sql`INSERT INTO balances (account_number, balance) VALUES (${accountNumber}, 10000)`;
    res.status(201).json({ success: true });
  } catch (e) { next(e); }
});

// ── Balance ─────────────────────────────────────────────────────────
app.get("/api/balance/:accountNumber", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const rows = await sql`SELECT balance FROM balances WHERE account_number = ${req.params.accountNumber}`;
    if (!rows.length) { res.status(404).json({ error: "Account not found" }); return; }
    res.json({ balance: parseFloat(rows[0].balance) });
  } catch (e) { next(e); }
});

// ── Users list ──────────────────────────────────────────────────────
app.get("/api/users", async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const rows = await sql`SELECT user_id, name, account_number, phone_number FROM users`;
    res.json({ users: rows });
  } catch (e) { next(e); }
});

// ── Transactions: List ──────────────────────────────────────────────
app.get("/api/transactions", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { account } = req.query;
    const rows = account
      ? await sql`SELECT * FROM transactions WHERE sender_bank = ${account as string} OR receiver_bank = ${account as string} ORDER BY timestamp DESC`
      : await sql`SELECT * FROM transactions ORDER BY timestamp DESC`;
    res.json({ transactions: rows });
  } catch (e) { next(e); }
});

// ── Transactions: Single ────────────────────────────────────────────
app.get("/api/transactions/:txnId", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const rows = await sql`SELECT * FROM transactions WHERE txn_id = ${req.params.txnId}`;
    if (!rows.length) { res.status(404).json({ error: "Transaction not found" }); return; }
    res.json({ transaction: rows[0] });
  } catch (e) { next(e); }
});

// ── Transactions: Process ───────────────────────────────────────────
app.post("/api/transactions", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { type, senderBank, receiverBank, amount, mpin } = req.body;
    if (!type || !senderBank || !receiverBank || !amount || !mpin) {
      res.status(400).json({ error: "type, senderBank, receiverBank, amount, mpin required" }); return;
    }
    const userRows = await sql`SELECT mpin FROM users WHERE account_number = ${senderBank}`;
    if (!userRows.length) { res.status(404).json({ error: "Sender account not found" }); return; }
    if (userRows[0].mpin !== parseInt(mpin)) { res.status(401).json({ error: "Invalid MPIN" }); return; }

    const balRows = await sql`SELECT balance FROM balances WHERE account_number = ${senderBank}`;
    if (!balRows.length || parseFloat(balRows[0].balance) < parseFloat(amount)) {
      res.status(400).json({ error: "Insufficient balance" }); return;
    }
    const recvRows = await sql`SELECT account_number FROM balances WHERE account_number = ${receiverBank}`;
    if (!recvRows.length) { res.status(404).json({ error: "Receiver account not found" }); return; }

    const txnId = `TXN${Date.now()}`;
    const senderNameRows = await sql`SELECT name FROM users WHERE account_number = ${senderBank}`;
    const receiverNameRows = await sql`SELECT name FROM users WHERE account_number = ${receiverBank}`;
    const senderName = senderNameRows[0]?.name || '';
    const receiverName = receiverNameRows[0]?.name || '';

    await sql`UPDATE balances SET balance = balance - ${parseFloat(amount)} WHERE account_number = ${senderBank}`;
    await sql`UPDATE balances SET balance = balance + ${parseFloat(amount)} WHERE account_number = ${receiverBank}`;
    await sql`INSERT INTO transactions (txn_id, type, amount, sender_bank, receiver_bank, status, sender_name, receiver_name)
              VALUES (${txnId}, ${type.toUpperCase()}, ${parseFloat(amount)}, ${senderBank}, ${receiverBank}, 'SUCCESS', ${senderName}, ${receiverName})`;
    res.status(201).json({ success: true, txnId, status: "SUCCESS" });
  } catch (e) { next(e); }
});

// ── Transactions: Cancel ────────────────────────────────────────────
app.patch("/api/transactions/:txnId/cancel", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const rows = await sql`SELECT * FROM transactions WHERE txn_id = ${req.params.txnId}`;
    if (!rows.length) { res.status(404).json({ error: "Transaction not found" }); return; }
    const txn = rows[0];
    if (txn.status === "SUCCESS") { res.status(400).json({ error: "Cannot cancel a successful transaction" }); return; }
    if (txn.status === "CANCELLED") { res.status(400).json({ error: "Already cancelled" }); return; }
    await sql`UPDATE transactions SET status = 'CANCELLED' WHERE txn_id = ${req.params.txnId}`;
    res.json({ success: true });
  } catch (e) { next(e); }
});

// ── Global error handler ────────────────────────────────────────────
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  res.status(500).json({ error: err.message });
});

// ── Local dev only ──────────────────────────────────────────────────
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`PayFlow API running on port ${PORT}`));
}

export default app;
