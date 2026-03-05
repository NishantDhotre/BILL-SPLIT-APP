# Bill Splitter Pro — Product Requirements Document (PRD)

## 1. Product Overview

**Bill Splitter Pro** is a mobile-first web application (deployed as an Android APK via Capacitor) that helps groups of people split restaurant bills and shared expenses fairly. It supports per-item allocation, two split modes (equal and unit-based), AI-powered receipt scanning, manual JSON import, and UPI QR code generation for instant payments.

---

## 2. Problem Statement

Splitting bills among friends is a frequent but error-prone task. Existing solutions are either too simple (equal-split only) or too complex (require accounts, sign-ups, server infrastructure). Users need a **fast, offline-capable, privacy-first** tool that:

- Lets them split individual items, not just the total
- Handles tax, discounts, and service charges proportionally
- Works without creating accounts or sharing data with a server
- Runs on Android natively (no app store dependency)

---

## 3. Target Users

| Persona | Description |
|---|---|
| **Primary** | Groups of friends dining out who want to split the bill item-by-item |
| **Secondary** | Roommates splitting grocery/household bills |
| **Power User** | Users who want AI receipt scanning to skip manual entry |

---

## 4. Core Features

### 4.1 Participant Management
- Add/remove named participants
- User's own name auto-added from Profile as default participant
- Removable by the user during bill splitting

### 4.2 Item Management
- Add, edit, delete bill items (name, price, quantity)
- Two split modes per item:
  - **EQUAL** — cost split evenly among selected participants
  - **UNIT** — cost split by consumption units per participant
- New items auto-include all current participants (EQUAL mode)
- New participants auto-added to all existing EQUAL items

### 4.3 Bill Calculations
- Per-item split based on mode and consumption
- **Proportional tax** — distributed based on each participant's share of subtotal
- **Proportional discount** — deducted based on each participant's share of subtotal
- Real-time recalculation on any change

### 4.4 AI Receipt Scanning
- Upload receipt image (camera or gallery via Capacitor Camera plugin)
- Drag-and-drop support on desktop/web
- Powered by **Google Gemini** (user-provided API key)
- Structured prompt extracts items, quantities, prices, tax, and bill name
- Parsed JSON auto-populates the bill

### 4.5 Manual JSON Import (No-API Mode)
- Two-step flow: copy prompt → paste AI response
- Works with any external AI (ChatGPT, Claude, Gemini web)
- Demo data available for quick testing
- Dark mode compatible

### 4.6 User Profile
- Stores user name (used as default participant)
- Import preference: `AI Scan`, `JSON Import`, or `Both`
  - Conditionally shows/hides import buttons based on preference
- API key management (only shown when AI is relevant)
- UPI payment configuration
- Auto-opens on first launch; accessible via avatar button

### 4.7 Focused API Key Prompt
- When user tries AI scan without a key, shows a minimal prompt with:
  - API key input field
  - Option to switch to JSON Import instead
- No other settings shown — keeps flow focused

### 4.8 UPI QR Code Generation
- Toggle-able per-user feature
- Generates per-participant QR codes with their exact share amount
- Standard UPI deep link format: `upi://pay?pa=...&pn=...&am=...&cu=INR`

### 4.9 Bill History
- Save current bill to history (persisted in localStorage)
- Load, view, and delete saved bills
- Full state restoration including items, participants, and split config

### 4.10 Share & Export
- Capture bill summary as an image (using `html-to-image`)
- Share via native Android share sheet (Capacitor Share plugin)
- Haptic feedback on key interactions

---

## 5. Non-Functional Requirements

| Category | Requirement |
|---|---|
| **Privacy** | All data stored locally (localStorage). No server calls except Gemini API for scanning. |
| **Offline** | Full functionality without internet (except AI scan) |
| **Performance** | Real-time recalculation, ~300 KB production bundle |
| **Platform** | Android APK (~29 MB), also runs as Progressive Web App |
| **Accessibility** | Dark mode support (system preference), safe area insets for notched devices |
| **Testing** | 17 automated tests (14 calculation + 3 store) via Vitest |

---

## 6. Out of Scope (v1)

- Multi-currency support
- User accounts / cloud sync
- Group management / contact list integration
- Recurring bills
- iOS build (Capacitor supports it, but not configured yet)

---

## 7. Success Metrics

| Metric | Target |
|---|---|
| Time to split a 10-item bill | < 2 minutes with AI scan |
| Test coverage | 100% of core calculation logic |
| APK size | < 35 MB |
| First Contentful Paint | < 1 second |
