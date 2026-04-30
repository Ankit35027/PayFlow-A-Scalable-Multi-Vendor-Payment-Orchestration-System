# PayFlow — Payment Gateway System

A scalable multi-vendor Payment Gateway System built with TypeScript, Express, and NeonDB — demonstrating Object-Oriented Programming, SOLID principles, and Design Patterns in a practical, real-world context.

The system includes a web-based frontend built with HTML, CSS, and Vanilla JavaScript, a REST API backend deployed on Vercel, and a PostgreSQL database hosted on NeonDB.

---

## 🚀 Live Deployment

| Layer    | URL |
|----------|-----|
| **Frontend** | https://payflow-frontend-qhic1pv2o-adarsh-vashishthas-projects.vercel.app |
| **Backend API** | https://payflow-backend-k5gp3gryw-adarsh-vashishthas-projects.vercel.app |
| **Database** | https://console.neon.tech/app/projects |

### Demo Credentials

| Name | User ID | Password | MPIN |
|------|---------|----------|------|
| Arjun Sharma | U001 | pass123 | 1234 |
| Priya Mehta | U002 | pass456 | 5678 |
| Rahul Verma | U003 | pass789 | 9012 |

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

| Layer      | Technology                                          |
|------------|-----------------------------------------------------|
| Backend    | TypeScript, Node.js, Express, ts-node               |
| Frontend   | HTML5, CSS3, Vanilla JavaScript                     |
| Database   | PostgreSQL (NeonDB serverless)                      |
| Deployment | Vercel (frontend + backend), NeonDB (database)      |
| Fonts      | Google Fonts (Sora, DM Sans, JetBrains Mono)        |
| Testing    | Custom test runner (TestCases.ts)                   |

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

### SOLID Principles

| Principle                      | Implementation                                                                    |
|-------------------------------|-----------------------------------------------------------------------------------|
| Single Responsibility (SRP)   | Each class has one job — `BankAPI` handles banking, `TransactionLogger` handles logging, `User` manages user data |
| Open/Closed (OCP)             | New payment types can be added by extending `Transaction` without modifying existing classes |
| Liskov Substitution (LSP)     | `UPIPayment` and `NetBankingPayment` can replace `Transaction` anywhere without breaking the system |
| Interface Segregation (ISP)   | `IPaymentProcessor` and `ITransactionQuery` are separated — clients depend only on what they need |
| Dependency Inversion (DIP)    | `PaymentGateway` depends on `BaseTransaction` abstraction, not on concrete `UPIPayment` or `NetBankingPayment` |

---

## UML Diagrams

All diagrams are located in `payment-gateway/diagrams/`.

| Diagram          | File                  | Description                                          |
|------------------|-----------------------|------------------------------------------------------|
| Class Diagram    | `class_diagram.png`   | All classes, interfaces, attributes, methods, and relationships |
| ER Diagram       | `er_diagram.png`      | Entity-Relationship model showing data entities and their associations |
| Sequence Diagram | `sequence_diagram.png`| End-to-end Send Money flow showing interactions between all components |
| Use Case Diagram | `usecase_diagram.png` | User-facing functionalities and their included sub-operations |

---

## Getting Started

### Prerequisites

- Node.js (v18 or above)
- npm
- A NeonDB account (https://neon.tech)

### Backend Setup (Local)

```bash
cd payment-gateway-Backend
npm install
cp .env.example .env
# Add your DATABASE_URL to .env
npm run dev
```

The API server starts on `http://localhost:3000`.

To run the original console-based CLI app:
```bash
npm run cli
```

### Frontend Setup (Local)

```bash
cd payment-gateway-frontend
# Update js/config.js with your local backend URL: http://localhost:3000
npm run dev
```

Opens on `http://localhost:3001`.

### Database Setup

1. Create a project on https://neon.tech
2. Run `schema.sql` in the NeonDB SQL editor
3. Add the connection string as `DATABASE_URL` in your `.env`

### Deploy to Vercel

```bash
# Backend
cd payment-gateway-Backend
vercel --prod
# Set DATABASE_URL in Vercel environment variables

# Frontend
cd payment-gateway-frontend
# Update js/config.js with your backend Vercel URL
vercel --prod
```

---

## Running Tests

The backend includes an automated test suite covering registration, login, balance checks, UPI payments, Net Banking payments, transaction history, and cancellation flows.

```bash
cd payment-gateway
npm test
```

This runs `TestCases.ts` which executes all test scenarios and prints pass/fail results to the console.

---

## Demo Credentials

The system comes pre-loaded with three user accounts for testing:

| Name   | User ID   | Password  | Account No | MPIN | Balance     |
|--------|-----------|-----------|------------|------|-------------|
| Ankit  | ankit01   | pass123   | ACC1001    | 1234 | 50,000.00   |
| Priya  | priya02   | pass456   | ACC1002    | 5678 | 30,000.00   |
| Rahul  | rahul03   | pass789   | ACC1003    | 9012 | 75,000.00   |

For the frontend, use: User ID `U001`, Password `pass123`, MPIN `1234`.

---

## File Reference

### Backend — Key Files

| File                    | Purpose                                                  |
|-------------------------|----------------------------------------------------------|
| `Main.ts`               | Application entry point with interactive console menu    |
| `TestCases.ts`          | Automated test suite with 75+ test scenarios             |
| `BaseTransaction.ts`    | Abstract base class with common transaction fields       |
| `Transaction.ts`        | Concrete class adding sender/receiver and User references|
| `UPIPayment.ts`         | UPI-specific payment processing logic                    |
| `NetBankingPayment.ts`  | Net Banking-specific payment processing logic            |
| `User.ts`               | User model with authentication methods                   |
| `PaymentGateway.ts`     | Singleton gateway — central transaction engine           |
| `TransactionFactory.ts` | Factory for creating payment type objects                 |
| `BankAPI.ts`            | Simulated bank backend (validate, debit, credit, balance)|
| `TransactionLogger.ts`  | Logging utility for transaction events                   |
| `IPaymentProcessor.ts`  | Interface for payment processing operations              |
| `ITransactionQuery.ts`  | Interface for transaction query operations               |
| `IPaymentGateway.ts`    | Combined interface extending both processor and query    |

### Frontend — Key Files

| File              | Purpose                                              |
|-------------------|------------------------------------------------------|
| `index.html`      | Single-page application shell                        |
| `data.js`         | State management using sessionStorage                |
| `ui.js`           | Reusable UI helpers (toasts, modals, loading states) |
| `auth.js`         | Login and registration form handling                 |
| `dashboard.js`    | Dashboard view with account summary                  |
| `payment.js`      | Three-step payment modal (Details, Confirm, Result)  |
| `history.js`      | Transaction list with search and filter              |
| `router.js`       | Client-side view switching and navigation            |
| `variables.css`   | Design tokens (colors, spacing, typography)          |
| `components.css`  | Reusable component styles (buttons, inputs, cards)   |
| `animations.css`  | Micro-interactions and CSS transitions               |

---

## License

MIT
