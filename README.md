# Bill Splitter PRO 🧾

**Bill Splitter PRO** is a modern, privacy-first, offline-capable application built with **React**, **Material Design 3**, and **Capacitor**. It's designed to seamlessly split restaurant bills and group expenses fairly—item by item—using AI receipt scanning, dynamic item fractionalization, and instant UPI payment codes.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/react-%2320232a.svg?style=flat&logo=react&logoColor=%2361DAFB)
![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=flat&logo=tailwind-css&logoColor=white)
![Android](https://img.shields.io/badge/Android-3DDC84?style=flat&logo=android&logoColor=white)

---

## ✨ Key Features

- **AI Receipt Scanning**: Snap a photo or upload your restaurant bill. Integrated deeply with the **Google Gemini API**, our backend-less scanner instantly rips out items, prices, and totals natively on your device.
- **Fair & Unit-Based Splitting**: Not hungry? Don't pay equally! Assign fractional units (e.g., Alice had 2 slices of Pizza, Bob had 1), or just hit the standard EQUAL split. The app handles the complex math.
- **Proportional Taxes & Discounts**: Tired of calculating exactly how much tax everyone owes? Bill Splitter PRO intelligently distributes taxes and discounts based on the exact percentage of the subtotal each person actively consumed.
- **Instant UPI QR Payments (India)**: Getting paid back is simple. Users can enter their UPI ID into their profile, and the app automatically generates personalized UPI payment QR links for every participant directly mapped to their exact debt.
- **Offline & Private Architecture**: The app runs 100% locally. API Keys, profiles, and history states are hardened in `localStorage`. Aside from strictly communicating with the Google API during scanning, no tracking, analytics, or remote database syncs occur.
- **Saved History States**: All actively calculated bills can be saved dynamically and reloaded from the History module at any time.

## 🛠️ Tech Stack & Polish

- **Engine**: React 18+ (Vite) & TypeScript
- **Styling**: Tailwind CSS v4 featuring Custom Material 3 Color Tokens, fluid dark-mode, and `framer-motion` grade animations.
- **State**: `zustand` strictly handling global mutability.
- **Calculus**: Hard-tested deterministic math logic resolving JS floating point issues, validated with intensive `vitest`.
- **Mobile Runtime**: Compiled to native APK via **Capacitor 7** providing hardware haptics, safe-area screen padding, edge-to-edge rendering, status bar theming, and the Native Share Sheet.

---

## 🚀 Getting Started (Developers)

### Prerequisites
- Node.js (v18+)
- Android Studio (for mobile APK builds)

### 1. Installation
```bash
git clone https://github.com/yourusername/bill-splitter-pro.git
cd bill-splitter-pro
npm install
```

### 2. Local Web Development
Starts the hot-reloading Vite server at `http://localhost:5173`.
```bash
npm run dev
```

### 3. Production Compilation & Linting
Our CI pipeline enforces strict code quality and 0 unused variables. To verify your state before building:
```bash
npm run lint
npm test
npm run build
```

### 4. Compiling the Android APK
Once the React assets are bundled to `dist/`, sync them securely into your Android Gradle shell via Capacitor:
```bash
npx cap sync android
```
You can then open `android/` directly in Android Studio, or execute:
```bash
cd android
./gradlew.bat assembleDebug
```
The final Application Package defaults into `android/app/build/outputs/apk/debug/app-debug.apk`.

---

## 🎨 Asset Automation

The project includes Python scripts strictly for regenerating consistent geometric visual branding over the native wrappers:

- **`scripts/generate_logo.py`**: Geometric "Bill Splitter PRO" Logo.
- **`scripts/generate_assets.py`**: Generates responsive Favicons, 512px Play Store variants, and deeply scaled Android Adaptive Mipmap layers.

```bash
pip install Pillow
cd scripts
python generate_logo.py
python generate_assets.py
```

## 🔒 Privacy & API Key Handling
**Bill Splitter PRO operates strictly locally without telemetry server handshakes.**
To utilize the AI component, users are seamlessly prompted to retrieve a free [Google AI Studio API Key](https://aistudio.google.com/) locally inside the App Profile module. These tokens are saved inside encrypted storage bounds natively within the device and NEVER logged anywhere external.

## 📄 License
This project is officially licensed under the MIT License.
