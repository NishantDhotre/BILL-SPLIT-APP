# Bill Splitter Pro — Tech Stack

## Overview

A fully client-side React application packaged as an Android APK via Capacitor. No backend server, no database — all state lives in the browser's localStorage.

---

## Core Framework

| Technology | Version | Purpose |
|---|---|---|
| **React** | 19.2 | UI framework with functional components and hooks |
| **TypeScript** | 5.9 | Type safety across the entire codebase |
| **Vite** | 7.2 | Dev server, HMR, and production bundler |

---

## State Management

| Technology | Version | Purpose |
|---|---|---|
| **Zustand** | 5.0 | Lightweight global store — single store, no context providers, no boilerplate |

**Why Zustand over Redux/Context?**
- Zero boilerplate (no reducers, action types, or dispatch)
- Direct mutability via `set()` — simpler mental model
- Built-in selectors for performant re-renders
- ~1 KB gzipped — aligns with the app's lightweight philosophy

---

## Styling

| Technology | Version | Purpose |
|---|---|---|
| **Tailwind CSS** | 4.1 | Utility-first CSS with custom M3 design tokens |

### Design System

The app uses a **Material Design 3 (M3) token-based** theming system defined in `index.css`:

- **Light mode**: Lavender & Charcoal palette
- **Dark mode**: Ultraviolet & Periwinkle palette (auto via `prefers-color-scheme`)
- **Neumorphic shadows**: 5-level elevation system with theme-aware shadows
- **Typography**: `Outfit` (display/headings) + `Plus Jakarta Sans` (body)
- **Tokens**: `m3-primary`, `m3-surface`, `m3-on-surface-variant`, etc. — used throughout components instead of hardcoded colors

---

## Mobile / Native

| Technology | Version | Purpose |
|---|---|---|
| **Capacitor** | 8.0 | Web-to-native bridge for Android deployment |
| **@capacitor/camera** | 8.0 | Photo capture and gallery access |
| **@capacitor/haptics** | 8.0 | Tactile feedback on button presses |
| **@capacitor/share** | 8.0 | Native share sheet integration |
| **@capacitor/keyboard** | 8.0 | Keyboard behavior control |
| **@capacitor/status-bar** | 8.0 | Status bar styling |
| **@capacitor/filesystem** | 8.1 | File system access |

### Android Build

- **Build Tool**: Gradle (via `gradlew.bat assembleDebug`)
- **App ID**: `com.billsplitter.app`
- **Web Dir**: `dist/` (Vite production output)
- **APK Size**: ~29 MB (debug build)

---

## AI Integration

| Technology | Version | Purpose |
|---|---|---|
| **@google/generative-ai** | 0.24 | Google Gemini SDK for receipt OCR |

- **Model**: Gemini (multimodal — accepts image + text)
- **Auth**: User-provided API key (stored in localStorage)
- **Usage**: Send receipt image → receive structured JSON with items, tax, bill name

---

## Utilities

| Library | Version | Purpose |
|---|---|---|
| **html-to-image** | 1.11 | Capture bill summary section as a shareable PNG |
| **qrcode.react** | 4.2 | Generate UPI payment QR codes as SVG |

---

## Testing

| Technology | Version | Purpose |
|---|---|---|
| **Vitest** | 4.0 | Unit test runner (Vite-native, fast) |

- **17 tests** across 2 test files
- `calculations.test.ts` — 14 tests covering EQUAL/UNIT splits, proportional tax/discount, edge cases
- `useBillStore.test.ts` — 3 tests covering auto-selection logic and participant propagation

---

## Development Tooling

| Tool | Purpose |
|---|---|
| **ESLint** | Linting with React hooks and refresh plugins |
| **TypeScript `tsc -b`** | Type checking before production build |
| **PostCSS + Autoprefixer** | CSS processing pipeline for Tailwind |

---

## Project Structure

```
BILL SPLIT APP/
├── android/                  # Capacitor Android project
├── docs/                     # PRD, System Design, Tech Stack
├── src/
│   ├── components/           # 9 React components
│   │   ├── Dashboard.tsx     # Main layout & orchestration
│   │   ├── BillTable.tsx     # Item table with split controls
│   │   ├── ProfileModal.tsx  # User profile settings
│   │   ├── ApiKeyPrompt.tsx  # Focused API key entry
│   │   ├── ManualImportModal.tsx  # JSON import flow
│   │   ├── HistoryModal.tsx  # Saved bills browser
│   │   ├── UploadBill.tsx    # Camera/file upload
│   │   ├── ParticipantManagement.tsx
│   │   └── SplitControls.tsx
│   ├── store/
│   │   ├── useBillStore.ts   # Zustand store (all state + actions)
│   │   └── useBillStore.test.ts
│   ├── services/
│   │   └── billService.ts    # Gemini API integration
│   ├── utils/
│   │   ├── calculations.ts   # Core split algorithm
│   │   ├── calculations.test.ts
│   │   ├── dispatcher.ts     # Chat action dispatcher
│   │   ├── mockBill.ts       # Demo data
│   │   └── shareUtils.ts     # Image capture & share
│   ├── types.ts              # TypeScript interfaces
│   ├── index.css             # M3 design tokens + theme
│   ├── App.tsx               # Root component
│   └── main.tsx              # Entry point
├── capacitor.config.ts       # Capacitor config
├── vite.config.ts            # Vite config
├── package.json
├── tsconfig.json
├── tsconfig.app.json
└── tsconfig.node.json
```

---

## Build & Deploy Pipeline

```
npm test          →  Run 17 Vitest tests
npm run build     →  tsc -b && vite build (~308 KB bundle)
npx cap sync      →  Copy dist/ to Android WebView assets
cd android && ./gradlew.bat assembleDebug  →  Generate APK
```
