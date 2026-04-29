# 💳 PayFlow — Payment Gateway System

> A **console-based Payment Gateway System** built with TypeScript that simulates how users
> send money through a payment gateway. Demonstrates **OOP**, **SOLID Principles**, and
> **Design Patterns** in a clean, beginner-friendly codebase.

---

## 📁 Project Structure

```
payment-gateway/
├── src/
│   ├── models/
│   │   ├── BaseTransaction.ts      ← Abstract base class (Inheritance, OCP)
│   │   ├── Transaction.ts          ← Extends BaseTransaction (Composition with User)
│   │   ├── UPIPayment.ts           ← Polymorphic UPI processing
│   │   ├── NetBankingPayment.ts    ← Polymorphic NetBanking processing
│   │   └── User.ts                 ← User data (Encapsulation, SRP)
│   ├── interfaces/
│   │   ├── IPaymentProcessor.ts    ← Payment operations (ISP)
│   │   ├── ITransactionQuery.ts    ← Query operations (ISP)
│   │   └── IPaymentGateway.ts      ← Combined interface (extends both)
│   ├── gateway/
│   │   └── PaymentGateway.ts       ← Singleton gateway (DIP, Composition)
│   ├── factory/
│   │   └── TransactionFactory.ts   ← Factory pattern (OCP)
│   ├── bank/
│   │   └── BankAPI.ts              ← Simulated bank backend (SRP)
│   ├── utils/
│   │   └── TransactionLogger.ts    ← Logging utility (SRP)
│   └── Main.ts                     ← Console app entry point
├── package.json
├── tsconfig.json
├── README.md
└── diagrams/
    ├── class_diagram.png
    ├── usecase_diagram.png
    ├── sequence_diagram.png
    └── er_diagram.png
```

---

## 🚀 How to Run

### Prerequisites
- **Node.js** (v16 or higher)
- **npm** (comes with Node.js)

### Steps

```bash
# 1. Navigate to the project directory
cd payment-gateway

# 2. Install dependencies
npm install

# 3. Run the application
npm start
```

### Pre-loaded Test Users

| Name  | User ID  | Password | MPIN | Account   | Balance    |
|-------|----------|----------|------|-----------|------------|
| Ankit | ankit01  | pass123  | 1234 | ACC1001   | ₹50,000.00 |
| Priya | priya02  | pass456  | 5678 | ACC1002   | ₹30,000.00 |
| Rahul | rahul03  | pass789  | 9012 | ACC1003   | ₹75,000.00 |

---

## 🏗️ OOP Concepts — Where Each is Used

### 1. Encapsulation
> **All fields in every class are `private`** — accessible only through getters/setters.

| Class            | What's Encapsulated                                         |
|------------------|-------------------------------------------------------------|
| `User`           | name, accountNumber, userId, **mpin**, **password**, phone  |
| `BaseTransaction`| txnId, amount, timestamp, status                            |
| `Transaction`    | senderBank, receiverBank, sender (User), receiver (User)    |
| `PaymentGateway` | transactions Map, registeredUsers Map, **singleton instance**|

**Why?** Protects sensitive data (MPIN, password) from unauthorized direct access.
External code must use `user.validateMpin(pin)` instead of reading `user.mpin` directly.

---

### 2. Abstraction
> **`BaseTransaction`** is an `abstract` class with an `abstract processPayment()` method.
> Interfaces (`IPaymentProcessor`, `ITransactionQuery`) define contracts without implementation.

```
                    ┌─────────────────────┐
                    │ «abstract»          │
                    │ BaseTransaction      │
                    ├─────────────────────┤
                    │ + processPayment()  │  ← abstract method
                    └─────────┬───────────┘
                              │ extends
                    ┌─────────┴───────────┐
                    │ Transaction          │
                    └─────────┬───────────┘
              ┌───────────────┼───────────────┐
              │ extends       │               │ extends
    ┌─────────┴───────┐             ┌────────┴──────────┐
    │ UPIPayment       │             │ NetBankingPayment  │
    │ processPayment() │             │ processPayment()   │
    └──────────────────┘             └────────────────────┘
```

---

### 3. Inheritance
> **3-level hierarchy:** `BaseTransaction` → `Transaction` → `UPIPayment`/`NetBankingPayment`

- `BaseTransaction` defines common fields (txnId, amount, timestamp)
- `Transaction` extends it with sender/receiver details
- `UPIPayment` and `NetBankingPayment` extend `Transaction` with type-specific behavior

---

### 4. Polymorphism
> **Same method name** (`processPayment()`), **different behavior** at runtime.

```typescript
// In PaymentGateway.processPayment():
const success = transaction.processPayment();
// ↑ This calls UPIPayment.processPayment() OR NetBankingPayment.processPayment()
//   depending on the ACTUAL type at runtime — this is runtime polymorphism.
```

| Type              | processPayment() Behavior                            |
|-------------------|------------------------------------------------------|
| `UPIPayment`      | Validates UPI ID, processes via UPI channel           |
| `NetBankingPayment`| Verifies IFSC code, processes via NEFT/RTGS channel  |

---

## 🎨 Design Patterns — 2 Implemented

### 1. Singleton Pattern — `PaymentGateway`

```typescript
export class PaymentGateway implements IPaymentGateway {
    private static instance: PaymentGateway | null = null;

    private constructor() { }  // ← PRIVATE constructor

    public static getInstance(): PaymentGateway {
        if (PaymentGateway.instance === null) {
            PaymentGateway.instance = new PaymentGateway();
        }
        return PaymentGateway.instance;
    }
}
```

**Why Singleton?**
- Prevents **multiple gateway instances** causing **inconsistent transaction state**
- All parts of the application share the **same transaction map**
- Mirrors real-world architecture: there's ONE central payment gateway

---

### 2. Factory Pattern — `TransactionFactory`

```typescript
export class TransactionFactory {
    public static createTransaction(type: string, ...): Transaction {
        switch (type) {
            case "UPI":        return new UPIPayment(...);
            case "NETBANKING": return new NetBankingPayment(...);
            default: throw new Error("Unknown type");
        }
    }
}
```

**Why Factory?**
- **Decouples** object creation from business logic
- Adding a new payment type (e.g., `CryptoPayment`) requires **ZERO changes** to existing code
- Only the factory needs a new `case` — everything else works through the `Transaction` abstraction

---

## 📐 SOLID Principles — All 5 Documented

### S — Single Responsibility Principle (SRP)

| Class               | Single Responsibility                              |
|---------------------|-----------------------------------------------------|
| `User.ts`           | ✅ Only manages user data                           |
| `BankAPI.ts`        | ✅ Only handles bank operations (validate, debit, credit) |
| `TransactionLogger.ts` | ✅ Only logs transactions                        |
| `PaymentGateway.ts` | ✅ Only coordinates payment processing              |

---

### O — Open/Closed Principle (OCP)

`BaseTransaction` and `Transaction` are **OPEN** for extension but **CLOSED** for modification:
- ✅ Added `UPIPayment` — no changes to `Transaction`
- ✅ Added `NetBankingPayment` — no changes to `Transaction`
- ✅ Want to add `CryptoPayment`? Just create a new class extending `Transaction`

---

### L — Liskov Substitution Principle (LSP)

`UPIPayment` and `NetBankingPayment` can **replace `Transaction` anywhere** without breaking:

```typescript
// PaymentGateway accepts BaseTransaction — any subtype works:
gateway.processPayment(upiPayment);         // ✅ Works
gateway.processPayment(netBankingPayment);   // ✅ Works
gateway.processPayment(anyFuturePayment);    // ✅ Will work
```

---

### I — Interface Segregation Principle (ISP)

Instead of one monolithic interface, we split into TWO focused interfaces:

```
    IPaymentProcessor                     ITransactionQuery
    ├── processPayment()                  ├── getTransactionStatus()
    └── cancelPayment()                   └── getTransactionHistory()
              │                                      │
              └──────────┬───────────────────────────┘
                         │ extends both
                  IPaymentGateway
                         │ implements
                   PaymentGateway
```

**Why?** A reporting module only needs `ITransactionQuery`. It should NOT be forced to implement payment processing methods.

---

### D — Dependency Inversion Principle (DIP)

```
HIGH-LEVEL MODULE                       LOW-LEVEL MODULES
┌─────────────────┐                  ┌──────────────┐
│ PaymentGateway   │ ──depends on──→ │ BaseTransaction │ ← ABSTRACTION
└─────────────────┘                  └──────┬───────────┘
                                            │
                                    ┌───────┼───────┐
                                    │               │
                              ┌─────┴─────┐  ┌─────┴──────────┐
                              │ UPIPayment │  │ NetBankingPayment│
                              └───────────┘  └────────────────┘
```

PaymentGateway depends on `BaseTransaction` (abstraction), **NOT** on concrete `UPIPayment` or `NetBankingPayment` directly.

---

## 📊 UML Relationships

### Composition (◆ filled diamond)
- `Transaction` ◆─── `User` → Transaction CANNOT exist without User
- `PaymentGateway` ◆─── `Transaction` → If gateway is destroyed, transactions go with it

### Aggregation (◇ hollow diamond)
- `PaymentGateway` ◇─── `User` → Gateway references Users, but Users exist independently

---

## 🧠 System Design & Scalability Considerations

| Decision | Reasoning |
|----------|-----------|
| **Singleton for PaymentGateway** | Prevents multiple instances causing inconsistent transaction state |
| **Map<string, Transaction>** | O(1) lookup by txnId — scales much better than an array (O(n)) |
| **Factory Pattern** | Adding new payment types = zero changes to existing code |
| **Separated BankAPI** | In real systems, this would be a microservice. Our simulation mirrors that boundary |
| **Interface Segregation** | Allows different modules to depend only on what they need |

---

## 🛠️ Technologies

- **TypeScript** — Type-safe JavaScript with strict mode enabled
- **Node.js** — Runtime environment
- **ts-node** — Directly runs TypeScript without separate build step
- **readline** — Built-in Node.js module for console input

---

## 📜 License

MIT License — feel free to use, modify, and distribute.
