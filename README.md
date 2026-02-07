# Bill Splitter Pro 🧾

A modern, AI-powered bill splitting application built with **React**, **Material Design 3**, and **Capacitor**. Seamlessly split bills with friends using receipt scanning, drag-and-drop uploads, and fair share calculations.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/react-%2320232a.svg?style=flat&logo=react&logoColor=%2361DAFB)
![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=flat&logo=tailwind-css&logoColor=white)
![Android](https://img.shields.io/badge/Android-3DDC84?style=flat&logo=android&logoColor=white)

## ✨ Features

- **Material Design 3 (Material You)**: A unified, adaptive design system with dynamic color tokens and native-like interactions.
- **AI Receipt Scanning**: Upload bill images to automatically extract items and prices using **Google Gemini AI**.
- **Smart Splitting**: Support for **Equally** sharing items or assigning specific **Units** to participants.
- **Native Android Experience**:
  - Haptic feedback on interactions.
  - EDGE-to-edge design with transparent status bars.
  - Native keyboard optimization for numeric inputs.
- **Shareable Summaries**: Generate and share bill summaries as images.
- **Offline First**: Fast and responsive local-first architecture.

## 🛠️ Tech Stack

- **Frontend**: React 18+, TypeScript, Vite
- **Styling**: Tailwind CSS v4 (using CSS variables for dynamic theming)
- **State Management**: Zustand
- **Mobile Runtime**: Capacitor 7 (Android)
- **AI Integration**: Google Generative AI SDK (Gemini)
- **Utils**: `html-to-image` for receipt sharing.

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+)
- Android Studio (for mobile build)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/yourusername/bill-splitter-pro.git
    cd bill-splitter-pro
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up Gemini API Key:**
    - Get your key from [Google AI Studio](https://aistudio.google.com/).
    - Enter it in the app's "Configure Key" settings (stored locally).

### 🏃‍♂️ Running Web App

Start the development server:

```bash
npm run dev
```

Visit `http://localhost:5173` to view the app.

### 📱 Running Android App

1.  **Sync Web Assets:**
    ```bash
    npm run build
    npx cap sync
    ```

2.  **Open in Android Studio:**
    ```bash
    npx cap open android
    ```

3.  **Run on Device/Emulator:**
    - Use the "Run" button in Android Studio to deploy to a connected device or emulator.

## 🎨 Asset Generation

The project includes Python scripts to generate consistent branding assets:

- **`generate_logo.py`**: Creates the geometric "Bill Splitter" logo source.
- **`generate_assets.py`**: Generates Favicons, Web Manifest icons, and Android Adaptive Icons (mipmaps).

To regenerate assets:

```bash
# Requires Python & Pillow
pip install Pillow
python generate_logo.py
python generate_assets.py
```

## 📱 Mobile Polish

This app implements several native optimizations:
- **`@capacitor/status-bar`**: Used for immersive transparent status bars.
- **`@capacitor/haptics`**: Provides tactile feedback.
- **`@capacitor/keyboard`**: Optimizes layout when keyboard opens.
- **CSS Optimizations**: `overscroll-behavior-y: none` and `touch-action` management for a native feel.

## 📄 License

This project is licensed under the MIT License.
