# Security & Configuration Guide

This guide explains how to obtain the necessary API keys for your application and provides context on key security concepts.

---

## 1. Getting Your API Keys

### 🔑 Google OAuth (for "Login with Google")
1.  Go to the [Google Cloud Console](https://console.cloud.google.com/).
2.  Create a **New Project** (e.g., "Meet-io-Auth").
3.  Navigate to **APIs & Services** > **Credentials**.
4.  Click **Create Credentials** > **OAuth client ID**.
5.  If prompted, configure the **OAuth consent screen** (choose "External", fill in app name/email).
6.  Select **Web application** as the type.
7.  Add Authorized **Redirect URIs**:
    -   Dev: `http://localhost:5000/api/auth/google/callback`
    -   Prod: `https://your-domain.com/api/auth/google/callback`
8.  Copy the **Client ID** and **Client Secret** into your `.env` file.

### 🐙 GitHub OAuth (for "Login with GitHub")
1.  Go to [GitHub Developer Settings](https://github.com/settings/developers).
2.  Click **New OAuth App**.
3.  Fill in the details:
    -   **Application Name**: Meet-io
    -   **Homepage URL**: `http://localhost:5173` (or your prod URL)
    -   **Authorization callback URL**: `http://localhost:5000/api/auth/github/callback`
4.  Click **Register Application**.
5.  Generate a **New Client Secret**.
6.  Copy the **Client ID** and **Client Secret** into your `.env` file.

### 📧 SMTP Credentials (for Email Verification)
To send real emails (preventing fake accounts), you need an SMTP provider.
**Option A: Gmail (Quickest for personal testing)**
1.  Go to your Google Account > Security.
2.  Enable **2-Step Verification**.
3.  Search for **App Passwords**.
4.  Create one named "Meet-io".
5.  Use these settings in `.env`:
    -   `SMTP_HOST=smtp.gmail.com`
    -   `SMTP_PORT=587`
    -   `SMTP_USER=your-email@gmail.com`
    -   `SMTP_PASS=xxxx xxxx xxxx xxxx` (the app password)

**Option B: SendGrid / Mailgun (Best for Production)**
1.  Sign up for [SendGrid](https://sendgrid.com/) (Free tier).
2.  Create an API Key with "Mail Send" permissions.
3.  Use their provided Host, User (usually `apikey`), and Password (your API key).

---

## 2. Security Concepts Explained

### 🛡️ What is "CSRF"? (Cross-Site Request Forgery)
**The Threat:**
Imagine you are logged into your bank (Bank A). You visit a malicious site (BadSite). BadSite has a hidden form that submits a request to `bank-a.com/transfer-money`. Since your browser automatically sends your cookies to Bank A, the bank thinks *you* made the request and transfers the money. This is CSRF.

**How we protect against it:**
1.  **SameSite Cookies:** We set your auth cookie to `SameSite: 'strict'` or `'lax'`. This tells the browser *not* to send the cookie if the request comes from a different website (like BadSite).
2.  **CSRF Tokens (Headers):** A more advanced method. The server sends a unique, random "secret token" to your frontend. Every time you make a request (like updating your profile), you must send this token back in a header. The malicious site can't see this token, so their fake request fails.

### 📧 Why SMTP for Security?
**The Problem:**
Without email verification, `bot123@fake.com`, `bot124@fake.com`, etc., can flood your database. They don't exist, but your server spends resources storing them.

**The Solution:**
By using a real SMTP server to send a unique link to the user's email:
1.  **Proof of Ownership:** We verify that a human actually owns `realuser@gmail.com`.
2.  **Spam Prevention:** Bots cannot click the link in an inbox they don't control. They stay "Unverified" and can't log in.
3.  **Trust:** Sending emails from a reputable domain (via SendGrid/Gmail) ensures they land in the Inbox, not Spam.
