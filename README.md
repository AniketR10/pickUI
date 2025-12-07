# pickUI

**Capture your favourite UI Component from any website in a single click.**

pickUI is a Chrome Extension for developers that allows you to inspect any element on a webpage and extract its **HTML & CSS** as a clean, copy-pasteable component.

Unlike the standard Chrome DevTools, pickUI bakes the computed styles directly into the HTML tags as inline styles, allowing you to copy a button, card, nav bar etc. and paste it anywhere (React, HTML, Email templates) while preserving its exact look.

▶️ [Watch Demo Video](https://www.youtube.com/watch?v=MFA7a2hBQWI)


<div align="center">

| ⭐ [How to Contribute?](#contribute) |
|-------------------------------------|

</div>




## Features

*  Smart Inspector: Hover over any element to highlight it.
*  Gap-Proof HUD: Features a smart "Invisible Bridge" and debounce logic, so the "Get Component" button doesn't run away when you try to click it.
*  Clean CSS Extraction: Automatically filters out default browser styles, CSS variables, and vendor prefixes. Only captures what matters.
*  Side Panel Workflow: Uses Chrome's Side Panel API so the UI stays open while you browse and inspect multiple elements.

## 🛠️ Tech Stack

* **Core:** React + TypeScript
* **Build Tool:** Vite
* **Styling:** Tailwind CSS
* **Browser API:** Chrome Extension Manifest V3 (Side Panel, Scripting, Storage)

## 🚀 Installation & Setup

1.  **Clone the repository**
    ```bash
    git clone [https://github.com/yourusername/pickUI.git](https://github.com/yourusername/pickUI.git)
    cd pickUI
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    ```

3.  **Build the Extension**
    ```bash
    npm run build
    ```
    *This will create a `dist` folder in your project root.*

4.  **Load into Chrome**
    1.  Open Chrome and navigate to `chrome://extensions`.
    2.  Toggle **Developer Mode** (top right corner).
    3.  Click **Load Unpacked**.
    4.  Select the **`dist`** folder from your project directory.

## 📖 Usage

1.  Click the **pickUI icon** in your Chrome toolbar. This opens the **Side Panel** on the right.
2.  Click **"🎯 Pick Element"** in the side panel.
3.  Hover over any element on the current webpage.
4.  A **"✚ Get Component"** button will appear floating next to the element. Click it.
5.  The HTML code (with inline CSS) will appear in the Side Panel.
6.  Click **"Copy"** and paste it into your project!

## 📂 Project Structure

```text
pickUI/
├── public/
│   └── manifest.json      # Chrome Extension Manifest V3
├── src/
│   ├── background.ts      # Service Worker (Handles Side Panel toggle)
│   ├── content.ts         # The Inspector Logic (Runs on webpages)
│   └── popup/             # The Side Panel UI (React)
│       ├── App.tsx        # Main UI Logic & Code Generator
│       └── main.tsx       # Entry point
├── vite.config.ts         # Multi-page build configuration
└── tailwind.config.js     # Tailwind setup
```

## Contribute

Understanding where things live will help you move faster:

* **`src/content.ts`**: The Eye of the extension. This script runs on the webpage, handles the hover detection, the Invisible Bridge HUD button logic, and CSS extraction.
* **`src/popup/App.tsx`**: The Brain of the UI. This is the React application running in the Side Panel. It handles generating the HTML strings and displaying the data.
* **`src/background.ts`**: The Service Worker. Mainly handles opening the Side Panel when the icon is clicked.
* **`manifest.json`**: The configuration file (Permissions, versioning, etc.).


### 🐛 How to Report a Bug

If you find a bug, please create a new Issue and include:
1.  **Browser & Version:** (e.g., Chrome 120, Brave, Arc)
2.  **OS:** (e.g., Windows 11, macOS Sonoma)
3.  **Steps to Reproduce:**
    * Go to '...'
    * Click on '...'
    * See error '...'
4.  **Screenshots/Video:** Since this is a visual tool, a GIF or screenshot helps immensely.


### 💡 How to Submit a Pull Request

1.  **Create a Branch:**
    ```bash
    git checkout -b feature/amazing-feature
    ```
2.  **Make your changes.**
3.  **Test Manually:**
4.  **Commit your changes:**
    ```bash
    git commit -m "feat: Add support for capturing SVG gradients"
    ```
    *(Please use semantic commit messages: `feat`, `fix`, `docs`, `style`, `refactor`)*
5.  **Push to your fork:**
    ```bash
    git push origin feature/amazing-feature
    ```
6.  **Open a Pull Request** against the `main` branch.


## 🎨 Style Guide

* **TypeScript:** We use TypeScript for everything. Please avoid using `any` unless absolutely necessary (like when dealing with messy DOM APIs).
* **Styling:** We use Tailwind CSS. Avoid writing custom CSS files unless you are modifying the scrollbar or global resets.
* **Formatting:** If possible, ensure your code is formatted with Prettier before submitting.

---
