# SoleHub — Full-Stack Shoe E-Commerce Website

**Brand:** SoleHub  
**Tagline:** "Find Your Sole. Own Your Style."

A complete, responsive shoe e-commerce website built with React, Vite, and Supabase PostgreSQL. Designed for web development internship demonstrations with a distinctive editorial fashion-inspired design.

## 🚀 Technology Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite |
| Routing | React Router DOM v6 |
| Styling | CSS (Custom Properties, Responsive) |
| Icons | Lucide React |
| Database | Supabase PostgreSQL |
| Authentication | Supabase Auth |
| Security | Row Level Security (RLS) |
| Fonts | Space Grotesk (headings), Inter (body) |

## 📋 Features

### Customer-Facing
- 🏠 Homepage — Editorial hero, categories, featured products, promo banners
- 🛍️ Shop Page — Search, category/brand/price/size filters, sorting
- 👟 Product Details — Image gallery, size/color selection, stock validation
- 🔐 Authentication — Register/Login with Supabase Auth, profile management
- 🛒 Shopping Cart — Persistent cart, quantity controls, stock validation
- 💳 Checkout — Delivery details, demo payment (Card/UPI/COD)
- 📦 My Orders — Order history with status tracking
- 📱 Responsive — Mobile-first design on all devices

### Admin Dashboard
- 📊 Dashboard — Statistics (products, customers, orders, demo revenue)
- 📦 Product Management — Full CRUD, activate/deactivate, stock management
- 📋 Order Management — View all orders, update status, filter
- 👥 Customer Management — View users, role management
## ⚙️ Setup Instructions

### 1. Install Dependencies
```bash
cd c:\SOLE HUB\frontend
npm install
```

### 2. Configure Environment
Copy `.env.example` to `.env` and add your Supabase credentials:
```
VITE_SUPABASE_URL=your_project_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

Get these from Supabase Dashboard > Settings > API.

### 3. Run Migrations
In Supabase Dashboard > SQL Editor, run in order:
1. `supabase/migrations/001_initial_schema.sql`
2. `supabase/migrations/002_rls_policies.sql`
3. `supabase/migrations/003_database_functions.sql`
4. `supabase/migrations/004_seed_data.sql`

### 4. Create First Admin
1. Register at `/register`
2. In Supabase Table Editor > profiles, change your `role` to `admin`
3. Log in again

### 5. Start Development
```bash
npm run dev
# Open http://localhost:5173
```

## 🗄️ Database Schema

| Table | Purpose |
|-------|---------|
| profiles | User profiles (extends auth.users) |
| products | Product catalog |
| cart_items | Shopping cart per user |
| orders | Order records |
| order_items | Snapshot of products per order |
| payments | Demo payment transactions |

RLS is enabled on all tables. Public can read active products; users access only their own data; admins have full product access.

## 💳 Demo Payments

All payments are simulated — no real money charged. Methods: Card, UPI, Cash on Delivery. Payments processed server-side via `process_demo_payment()` function with ownership and amount validation.

## 👤 Admin Setup

Register normally, then in Supabase Table Editor > profiles, set `role = 'admin'` for your user ID. No public self-registration for admin roles.

## 🧪 Viva Prep

**Q: SQL vs NoSQL?** A: PostgreSQL (SQL) provides relational integrity with foreign keys, constraints, and ACID transactions — ideal for e-commerce order data.

**Q: What is RLS?** A: Row Level Security lets the database enforce row access policies (e.g., customers only read their own orders) rather than relying on frontend checks.

**Q: How is checkout secure?** A: Server-side PostgreSQL function validates stock, reads prices from DB, creates order atomically. Client cannot inject prices or bypass stock checks.

**Q: How are duplicate payments prevented?** A: Idempotency keys + checking existing SUCCESS status before processing new payments.

**Q: What happens on payment failure?** A: Order gets `payment_status: FAILED`, customer can retry same order (no duplicate order created).

### Security
- 🔒 Row Level Security (RLS) on all tables
- 🔐 Supabase Auth for customer accounts
- 🛡️ Server-side validated checkout via PostgreSQL functions
- 🚫 No service-role keys in frontend code