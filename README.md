# 💰 DailyOS - Smart Expense & Task Management

![Project Status](https://img.shields.io/badge/status-active-success.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Build](https://img.shields.io/badge/build-passing-brightgreen.svg)
![Firebase](https://img.shields.io/badge/firebase-authentication-orange.svg)

**DailyOS** is a robust web application designed to streamline personal finance and productivity. It features a secure, multi-provider authentication system powered by **Firebase**, real-time budget tracking, and an AI-ready architecture for financial insights.

---

## 📸 Screenshots

| Login Page | Dashboard |
|:---:|:---:|
| ![Login Screen](assets/images/login-preview.png) | ![Dashboard](assets/images/dashboard-preview.png) |
*(Place screenshots of your Login Page and Dashboard in `assets/images`)*

---

## 🔐 Authentication & Security

DailyOS prioritizes user security using **Google Firebase Authentication**. The application ensures a seamless and secure onboarding experience with multiple login methods.

### Supported Login Providers:
* **Google Auth:** One-click login using Google accounts.
* **GitHub Auth:** Developer-friendly login via GitHub.
* **Facebook Auth:** Social login integration.
* **Email & Password:** Standard secure registration and login flow.

**Security Features:**
* **Session Management:** Persistent user sessions managed securely via Firebase SDK.
* **Data Isolation:** User data is strictly isolated based on the unique User ID (UID) generated upon login.
* **Route Protection:** Non-authenticated users are automatically redirected to the Login page, protecting the Dashboard and sensitive financial data.

---

## 🔄 Application Workflow

The user journey in DailyOS is designed for speed and clarity:

1.  **Onboarding (Login/Sign-up):**
    * User lands on the Login Page.
    * Chooses a preferred provider (Google/GitHub/FB/Email).
    * *System Action:* Firebase verifies credentials and returns a secure token.

2.  **Dashboard Initialization:**
    * Upon successful login, the app fetches the specific user's settings and transaction history.
    * Real-time statistics (Total Income, Expenses, Net Worth) are calculated instantly.

3.  **Data Entry (The "Action" Phase):**
    * User clicks the Floating Action Button (+) to add a **Transaction** (Income/Expense) or a **Task**.
    * Data is validated and stored locally (synced with Firestore in future updates).

4.  **Analysis & Insights:**
    * The app updates the **Budget Doughnut Chart** and **Spending Bar Chart** in real-time.
    * The "AI Insights" module analyzes the last 90 days of data to generate spending predictions and financial advice.

---

## ✨ Detailed Functionality

### 1. 💵 Financial Suite
* **Smart Transaction Logging:** Categorize expenses (Food, Bills, Transport, etc.) with date timestamps and optional notes.
* **Dynamic Budgeting:** Set a monthly cap. The app visually warns you (Yellow/Red progress bars) as you approach your limit.
* **Currency Support:** Toggle between INR (₹), USD ($), EUR (€), and GBP (£) instantly via Settings.

### 2. ✅ Productivity Hub
* **Priority Task Manager:** Organize daily to-dos by priority (High/Medium/Low).
* **Deadline Tracking:** Visual indicators for due dates.
* **Interactive Completion:** Satisfying "check" animations and automatic sorting of completed vs. pending tasks.

### 3. 🤖 AI-Powered Coach (Simulation)
* **Habit Identification:** The system identifies top spending categories automatically.
* **Predictive Analysis:** Estimates end-of-month spending based on current daily average.
* **Actionable Tips:** Provides contextual advice (e.g., "You are spending 40% on Food, try meal prepping").

---

## 🛠️ Tech Stack

* **Frontend:** HTML5, CSS3 (Modern Variables & Flexbox), Vanilla JavaScript (ES6+).
* **Authentication (BaaS):** **Google Firebase Auth** (SDK v9+).
* **Visualization:** Chart.js (Interactive Data Visualization).
* **Icons:** FontAwesome 6.0.
* **State Management:** Component-based rendering with LocalStorage caching.

---

## 🚀 Installation & Setup

To run this project locally with authentication working, you must configure your own Firebase project.

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/yourusername/DailyOS.git](https://github.com/yourusername/DailyOS.git)
    cd DailyOS
    ```

2.  **Firebase Configuration:**
    * Go to [Firebase Console](https://console.firebase.google.com/).
    * Create a new project.
    * Enable **Authentication** and turn on Google, GitHub, Facebook, and Email/Password providers.
    * Copy your `firebaseConfig` object.

3.  **Update Config:**
    * Open `assets/js/script.js` (or your firebase init file).
    * Replace the placeholder config with your actual credentials:
        ```javascript
        const firebaseConfig = {
          apiKey: "YOUR_API_KEY",
          authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
          projectId: "YOUR_PROJECT_ID",
          // ... other keys
        };
        ```

4.  **Run:**
    Open `index.html` in your browser (preferably using a local server like Live Server for auth domains to work correctly).

---

## 👤 Author

**Avinash Hugar**

* **Website:** [abhiwebdesign.great-site.net](http://abhiwebdesign.great-site.net)
* **Project:** DailyOS (Daily's)

---

## 📄 License

Distributed under the MIT License.
