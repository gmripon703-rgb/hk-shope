# NovaDrop - Dropshipping Store with Cart, Cash on Delivery & Admin Dashboard

A high-converting, single-page dropshipping storefront featuring a fluid shopping cart, Cash on Delivery (COD), local mobile payments (bKash, Nagad, Rocket, Bank Transfer), real-time inventory synchronization, and a built-in **Admin Dashboard** for sales tracking and product management. Styled with a **Navy Blue Light Mix** theme.

---

## ⚡ Cloudflare Pages Node.js Setup (Fix for "Failed to setup node")

By default, Cloudflare Pages runs an outdated version of Node.js unless configured. Modern Vite + React 19 requires **Node.js 20**.

### Pre-configured in this repository:
1. **`.node-version`** and **`.nvmrc`**: Automatically instruct Cloudflare Pages to use **Node 20.18.0**.
2. **`.npmrc`**: Configured with `legacy-peer-deps=true` and `engine-strict=false` to prevent dependency conflicts during `npm ci`.
3. **`package-lock.json`**: Generated and tested for clean `npm ci` execution.

### If configuring in the Cloudflare Dashboard manually:
1. In your Cloudflare Dashboard, go to your Pages project:
   **Settings** > **Environment variables** (under **Production** or **All environments**).
2. Click **Add variable**:
   - **Variable name**: `NODE_VERSION`
   - **Value**: `20`
3. (Optional) Add a second variable:
   - **Variable name**: `NPM_FLAGS`
   - **Value**: `--legacy-peer-deps`
4. Click **Save**.
5. Go to **Deployments** > click the three dots on the latest deployment > **Retry deployment**. It will build cleanly in ~30 seconds!

---

## 🚀 How to Publish to GitHub & Deploy to Cloudflare Pages

### Step 1: Push to GitHub

1. Create a new repository on [GitHub](https://github.com/new) (e.g. `novadrop-store`).
2. Run these commands in your terminal:
   ```bash
   git add .
   git commit -m "fix: add Node 20 config and package-lock for Cloudflare Pages"
   git branch -M main
   git remote add origin https://github.com/<YOUR_GITHUB_USERNAME>/<YOUR_REPOSITORY_NAME>.git
   git push -u origin main
   ```

---

### Step 2: Deploy to Cloudflare Pages (Free Global CDN)

1. Log into your [Cloudflare Dashboard](https://dash.cloudflare.com/).
2. Click **Compute (Workers & Pages)** > **Create application** > **Pages** tab.
3. Click **Connect to Git** and choose your repository.
4. Set the build settings:
   - **Framework preset**: `Vite`
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
5. Under **Environment variables (advanced)**, ensure:
   - `NODE_VERSION` = `20`
6. Click **Save and Deploy**.

---

## 🛒 Key Storefront Features

- **Navy Blue Light Mix Theme**: Luxury navy canvas (`#070D1F` to `#0E1B38`) with ambient glowing sapphire and warm gold/amber accents.
- **Wonderful Shopping Cart**:
  - Slide-over drawer with itemized goods, custom quantity steppers, and free shipping progress meter.
  - Live coupon codes (e.g. `WELCOME10` for 10% off).
- **Cash on Delivery (COD) & Local Mobile Checkout**:
  - Full support for zero-advance COD: customers inspect the parcel upon courier arrival before paying.
  - Local Mobile Wallet options: bKash, Nagad, Rocket, or direct Bank Transfer with one-click copy number and Transaction ID (TrxID) input.
  - Automatic customer details verification (Full Name, Phone, Address, City/District).
  - Post-order success screen with tracking number, timeline, and direct **"Notify via WhatsApp"** button.
- **Admin Dashboard**:
  - Click **"Admin Panel"** in the top navigation bar.
  - **Sales Tracking**: Total Revenue, Total Orders, COD Pending count, and Average Order Value (AOV).
  - **Live Orders Manager**: View and manage customer orders, update dispatch status, and mark payments as received.
  - **Product Manager**: Add new products to the live store, adjust stock counts, or delete items.
  - **Payment Settings**: Update your official bKash, Nagad, and WhatsApp notification numbers anytime.
- **Mobile Sticky Action Bar**:
  - Touch-optimized bottom bar for instant cart view and 1-tap COD ordering on mobile devices.
- **Single-File Standalone Export**:
  - Click **"Export (PHP/HTML)"** to download self-contained single-page templates (`standalone-store.html` or `index.php`) ready to drop into any shared cPanel or Apache/Nginx web server.
