# Salla-Klaviyo Simulator 🚀

**A simple tool to simulate a Salla store and test your Klaviyo integration.**

---

## 👋 What is this?
This dashboard helps you verify that your Salla integration is working correctly without needing a real store.
It simulates a merchant installing your app, adjusting settings, and receiving orders—just like the real world.

## ✨ Key Features
**1. Easy Simulation**
Create fake orders, customers, and app events with a single click.

**2. Multi-Account Testing**
Simulate multiple merchants at the same time to see if events go to the correct Klaviyo account.

**3. Integration Verification**
Check if your Server-side Tag Manager (sGTM) and Firestore database are connected properly.

---

## 🛠️ How to Use

### Step 1: Open the Dashboard
Open the simulator in your browser (usually `http://localhost:5173`).

### Step 2: Configure Your Test
1.  **Merchant ID**: The tool creates a random "Merchant ID" (e.g., `mer_123`) for you automatically.
2.  **Klaviyo Key**: Enter your **Klaviyo Private Key** (pk_...) so events go to your account.
3.  **GTM Preview (Optional)**: If you are debugging sGTM, paste your "X-Gtm-Server-Preview" header here.

### Step 3: Run the Flow (Important!)
You must follow this order for a new test:
1.  **Click "Installation (Authorize)"**: This registers the new merchant in your system.
2.  **Click "Update Settings"**: This saves your Klaviyo Key to the database.
3.  **Fire Events**: Now you can click **"Order Created"** or **"Customer Created"** to test!

---

## ⚡ Stress Testing (Multi-Account)
Want to see if your system can handle traffic?
1.  Go to the **"Multi-Account Performance"** section.
2.  Enter **multiple Klaviyo Keys** (or just use one).
3.  Set the number of **Concurrent Accounts** (e.g., 2 or 5).
4.  Click **"Run Stress Test"**.

The tool will simulate multiple merchants signing up and sending orders simultaneously.

---

## ❓ FAQ

**Q: Why are there more events in Klaviyo than I clicked?**
A: This is normal! One "Order Created" button click = Multiple events in Klaviyo:
*   `Placed Order` (Main event)
*   `Ordered Product` (One for each item in the cart)
*   `Update Profile` (Customer details)

**Q: My "Success Rate" is low?**
A: Check if you skipped **Step 1 (Installation)**. The system needs to register the merchant first!

**Q: Where do I see the data?**
A: Check your **Klaviyo Dashboard** (under "Activity Feed") or your **Google Tag Manager Debug Console**.
