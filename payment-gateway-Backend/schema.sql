-- Run this in your NeonDB SQL editor to set up the database

CREATE TABLE IF NOT EXISTS users (
  user_id       TEXT PRIMARY KEY,
  name          TEXT NOT NULL,
  account_number TEXT UNIQUE NOT NULL,
  mpin          INTEGER NOT NULL,
  password      TEXT NOT NULL,
  phone_number  TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS balances (
  account_number TEXT PRIMARY KEY REFERENCES users(account_number),
  balance        NUMERIC(12, 2) NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS transactions (
  txn_id         TEXT PRIMARY KEY,
  type           TEXT NOT NULL,
  amount         NUMERIC(12, 2) NOT NULL,
  sender_bank    TEXT NOT NULL,
  receiver_bank  TEXT NOT NULL,
  status         TEXT NOT NULL DEFAULT 'PENDING',
  timestamp      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed demo users
INSERT INTO users (user_id, name, account_number, mpin, password, phone_number) VALUES
  ('U001', 'Arjun Sharma', 'ACC001', 1234, 'pass123', '9876543210'),
  ('U002', 'Priya Mehta',  'ACC002', 5678, 'pass456', '9123456789'),
  ('U003', 'Rahul Verma',  'ACC003', 9012, 'pass789', '9988776655')
ON CONFLICT DO NOTHING;

INSERT INTO balances (account_number, balance) VALUES
  ('ACC001', 25000.00),
  ('ACC002', 12500.50),
  ('ACC003', 8750.75)
ON CONFLICT DO NOTHING;

-- Seed demo transactions
INSERT INTO transactions (txn_id, type, amount, sender_bank, receiver_bank, status, timestamp) VALUES
  ('TXN202600001', 'UPI',        2500,  'ACC001', 'ACC002', 'SUCCESS', '2026-04-01T10:30:00Z'),
  ('TXN202600002', 'NETBANKING', 5000,  'ACC002', 'ACC003', 'PENDING', '2026-04-02T14:15:00Z'),
  ('TXN202600003', 'UPI',        750,   'ACC001', 'ACC003', 'FAILED',  '2026-04-03T09:45:00Z'),
  ('TXN202600004', 'NETBANKING', 12000, 'ACC003', 'ACC001', 'SUCCESS', '2026-04-04T16:20:00Z')
ON CONFLICT DO NOTHING;
