
# PayFlow — Payment Gateway System

A console-based Payment Gateway System built with TypeScript that simulates how users send money through a payment gateway. The project demonstrates Object-Oriented Programming, SOLID principles, and Design Patterns in a practical, real-world context.

The system also includes a standalone web-based frontend built with HTML, CSS, and Vanilla JavaScript, designed as a luxury fintech interface.

---

## Table of Contents

- [Project Structure](#project-structure)
- [Tech Stack](#tech-stack)
- [Core Functionalities](#core-functionalities)
- [Architecture](#architecture)
  - [Class Hierarchy](#class-hierarchy)
  - [Design Patterns](#design-patterns)
  - [OOP Concepts](#oop-concepts)
  - [SOLID Principles](#solid-principles)
- [UML Diagrams](#uml-diagrams)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
- [Running Tests](#running-tests)
- [Demo Credentials](#demo-credentials)
- [File Reference](#file-reference)
- [License](#license)

---

## Project Structure

```
PayFlow/
|
|-- payment-gateway/                 # Backend (TypeScript)
|   |-- src/
|   |   |-- bank/
|   |   |   |-- BankAPI.ts           # Simulated bank operations
|   |   |-- factory/
|   |   |   |-- TransactionFactory.ts # Factory pattern implementation
|   |   |-- gateway/
|   |   |   |-- PaymentGateway.ts    # Singleton gateway (core engine)
|   |   |-- interfaces/
|   |   |   |-- IPaymentProcessor.ts # Payment processing contract
|   |   |   |-- ITransactionQuery.ts # Transaction query contract
|   |   |   |-- IPaymentGateway.ts   # Combined interface (ISP)
|   |   |-- models/
|   |   |   |-- BaseTransaction.ts   # Abstract base class
|   |   |   |-- Transaction.ts       # Concrete transaction class
|   |   |   |-- UPIPayment.ts        # UPI payment (polymorphism)
|   |   |   |-- NetBankingPayment.ts # Net Banking payment (polymorphism)
|   |   |   |-- User.ts             # User model (encapsulation)
|   |   |-- utils/
|   |   |   |-- TransactionLogger.ts # Logging utility
|   |   |-- Main.ts                  # Console application entry point
|   |   |-- TestCases.ts             # Automated test suite
|   |-- diagrams/                    # UML diagrams
|   |-- package.json
|   |-- tsconfig.json
|
|-- payment-gateway-frontend/        # Frontend (HTML/CSS/JS)
|   |-- index.html                   # Single-page application shell
|   |-- styles/
|   |   |-- variables.css            # Design tokens and CSS variables
|   |   |-- base.css                 # Reset and base styles
|   |   |-- components.css           # Reusable UI components
|   |   |-- layout.css               # Page layout and grid
|   |   |-- pages.css                # Page-specific styles
|   |   |-- animations.css           # Micro-interactions and transitions
|   |-- js/
|   |   |-- data.js                  # State management (sessionStorage)
|   |   |-- ui.js                    # UI helpers (toasts, modals, loaders)
|   |   |-- auth.js                  # Login and registration flows
|   |   |-- dashboard.js             # Dashboard view
|   |   |-- payment.js               # Payment modal (3-step flow)
|   |   |-- history.js               # Transaction history with filters
|   |   |-- router.js                # Client-side view switching
|   |-- assets/
|   |   |-- icons.js                 # SVG icon library
|   |-- package.json
|
|-- README.md
```

---

## Tech Stack

| Layer    | Technology                          |
|----------|-------------------------------------|
| Backend  | TypeScript, Node.js, ts-node        |
| Frontend | HTML5, CSS3, Vanilla JavaScript     |
| Fonts    | Google Fonts (Sora, DM Sans, JetBrains Mono) |
| Server   | `npx serve` (static file server)    |
| Testing  | Custom test runner (TestCases.ts)   |

---

## Core Functionalities

| #  | Feature                | Description                                                    |
|----|------------------------|----------------------------------------------------------------|
| 1  | Register User          | Create a new user with account details and initial deposit     |
| 2  | Login                  | Validate userId and password                                   |
| 3  | Check Balance          | Query account balance via BankAPI                              |
| 4  | Send Money (UPI)       | Enter receiver, amount, MPIN — validate, debit, credit, log   |
| 5  | Send Money (Net Banking) | Same flow as UPI with IFSC code verification                 |
| 6  | View Transaction History | Display all transactions from the PaymentGateway Map          |
| 7  | Cancel Transaction     | Cancel a transaction if its status is PENDING                  |

---

## Architecture

### Class Hierarchy

```
BaseTransaction (abstract)
    |
    +-- Transaction
            |
            +-- UPIPayment
            +-- NetBankingPayment
```

- `BaseTransaction` defines common fields (txnId, amount, timestamp, status) and declares the abstract method `processPayment()`.
- `Transaction` extends it with sender/receiver bank information and User references.
- `UPIPayment` and `NetBankingPayment` override `processPayment()` with their own payment logic — this is runtime polymorphism.
### Design Patterns

**1. Singleton Pattern — PaymentGateway**

Only one instance of `PaymentGateway` exists throughout the application. This prevents inconsistent transaction state across the system.

```typescript
const gateway = PaymentGateway.getInstance();
```

- Constructor is private.
- Access is through `getInstance()` which lazily creates the single instance.

**2. Factory Pattern — TransactionFactory**

The `TransactionFactory` decouples object creation from business logic. The caller does not need to know which concrete class to instantiate.

```typescript
const txn = TransactionFactory.createTransaction("UPI", txnId, 500, "ACC1001", "ACC1002");
```

- Adding a new payment type (e.g., WalletPayment) requires only a new case in the factory — no changes to existing business logic.


### OOP Concepts

| Concept        | Where it is applied                                              |
|----------------|------------------------------------------------------------------|
| Encapsulation  | All class fields are private with getters/setters (User, BaseTransaction, Transaction) |
| Abstraction    | `BaseTransaction` is abstract; interfaces define contracts without exposing implementation details |
| Inheritance    | `BaseTransaction` -> `Transaction` -> `UPIPayment` / `NetBankingPayment` |
| Polymorphism   | `processPayment()` is overridden in each subclass; `PaymentGateway` calls it without knowing the concrete type |

