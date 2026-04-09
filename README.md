
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
