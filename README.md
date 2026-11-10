# 💼 TaxPal – Personal Finance & Tax Management Platform for Freelancers

A full-stack, production-ready MERN application crafted specifically for freelancers, independent contractors, consultants, and gig workers. TaxPal enables users to track income and deductible expenses, manage monthly budget thresholds, calculate quarterly estimated taxes across configurable progressive tax slabs, track tax calendars, and generate audit-ready PDF/CSV financial statements.

---

## 🌟 Key Features

1. **Enterprise Authentication & Session Security**
   - JWT authentication stored in HTTP-Only cookies with fallback bearer token header.
   - bcrypt password hashing with salt rounds.
   - One-click **Demo Account** instant sign-in pre-populated with realistic historical data.
   - Profile management, password reset flow, and active session control.

2. **Real-Time Financial Dashboard**
   - 6 dynamic summary cards: Monthly Income, Monthly Expenses, Estimated Tax Due, Savings Rate, Total Budget, Remaining Budget.
   - Dynamic comparisons with previous month and health indicators.
   - Cashflow trend visualization (Recharts) with timeframe filters (3M, 6M, All).
   - Category expense distribution donut chart with percentage breakdown.
   - Real-time recent transaction ledger and budget progress bars.

3. **Income & Deductible Expense Ledger**
   - Full CRUD operations with instant optimistic UI updates.
   - Multi-field filtering: Search query, Category, Transaction Type, and Date Range.
   - Sorting by amount and date with server-side pagination.
   - One-click CSV export directly from the transaction ledger.

4. **Monthly Budget Thresholds & Health Monitoring**
   - Category-level monthly spending limits.
   - Automatic live calculation of actual expenditures vs configured limits.
   - Dynamic health badges: **Good** (<75%), **Warning** (75%–100%), and **Exceeded** (>100%).
   - Automated alert generation when category spending crosses safety limits.
   - Duplicate prevention for identical categories in the same month.

5. **Configurable Progressive Tax Calculation Engine**
   - Progressive tax slab calculations without hardcoded or invented rates.
   - Database-backed `TaxProfile` models with verified tax rules:
     - **India**: New Tax Regime (Section 115BAC) & Old Regime (Presumptive 44ADA / Regular) with 4% Health & Education Cess.
     - **United States**: Federal Freelance & Self-Employed brackets with Standard Deductions and QBI.
   - Visual comparison bar charts showing Gross vs Deductions vs Taxable vs Annual and Quarterly Liabilities.
   - Full tier-by-tier slab breakdown table and historical estimates archive.
   - Prominent official disclaimer: *"TaxPal provides estimated tax calculations for informational purposes only. It is not a substitute for professional tax advice."*

6. **Quarterly Tax Calendar & Notifications**
   - Jurisdiction-specific advance tax schedules (e.g., India Q1–Q4 installments: 15%, 45%, 75%, 100%; US 1040-ES dates).
   - Estimated quarterly voucher payment amounts calculated from user's latest tax projection.
   - Status indicators: **Upcoming**, **Due Soon**, **Overdue**, and **Completed**.
   - Node-cron automated daily reminder job for approaching deadlines.

7. **Financial Statements & Report Generation**
   - Formats: **PDF** (rendered via `PDFKit` with header banners, financial summary cards, category tables, and disclaimer footers) and **CSV** (via `json2csv`).
   - Report Types: *Income Statement*, *Expense Statement*, *Financial Summary*, *Tax Report*, *Budget Report*, and *Detailed Transactions*.
   - Periods: *Current Month*, *Previous Month*, *Current Quarter*, *Previous Quarter*, *Current Year*, and *Custom Date Range*.
   - Complete archived reports list with direct download endpoints.

8. **Category & System Customization**
   - Separate tabs for Expense Categories and Income Categories.
   - Custom category creation with color picker and icon assignments.
   - Protected system defaults with usage validation (prevents deleting categories in active use).

---

## 🏗️ Architecture & Technology Stack

### Frontend
- **Framework**: React 18 with Vite
- **Styling**: Tailwind CSS (light lavender & slate palette, subtle card shadows)
- **Icons**: Lucide React
- **Charts**: Recharts (Responsive bar and donut charts)
- **Routing**: React Router DOM v6 (Protected route wrappers)
- **HTTP Client**: Axios with global request/response interceptors
- **State Management**: React Context API (`AuthContext`, `ThemeContext`)
- **Notifications**: React Hot Toast

### Backend
- **Runtime**: Node.js & Express.js (MVC architecture)
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JSON Web Tokens (JWT) & bcryptjs
- **Security**: Helmet, CORS with whitelist origins, Express Rate Limiter
- **Document Generation**: PDFKit (PDF statements), json2csv (spreadsheets)
- **Scheduled Jobs**: Node-cron (daily tax reminders & budget threshold checks)

---

## 📁 Project Directory Structure

```
texpal/
├── backend/
│   ├── config/
│   │   └── db.js                      # MongoDB connection & diagnostics
│   ├── controllers/
│   │   ├── alertController.js         # Alert notifications & status
│   │   ├── authController.js          # Auth, registration, demo login, password reset
│   │   ├── budgetController.js        # Budget CRUD & progress aggregation
│   │   ├── categoryController.js      # Category management with usage checks
│   │   ├── reportController.js        # Statement generation & file downloads
│   │   ├── taxController.js           # Progressive tax calculation & calendar
│   │   ├── transactionController.js   # Transaction ledger & dashboard summary
│   │   └── userController.js          # Profile & preferences settings
│   ├── jobs/
│   │   └── taxReminderJob.js          # Daily node-cron reminder scheduler
│   ├── middleware/
│   │   ├── authMiddleware.js          # JWT verification & user attachment
│   │   ├── errorMiddleware.js         # Centralized error handler & 404 catcher
│   │   └── validateMiddleware.js      # Request sanitization & validation
│   ├── models/
│   │   ├── Alert.js                   # Deadline & threshold notifications
│   │   ├── Budget.js                  # Monthly category spending limits
│   │   ├── Category.js                # Custom & default income/expense categories
│   │   ├── Report.js                  # Generated report metadata
│   │   ├── TaxEstimate.js             # Saved user tax calculations
│   │   ├── TaxProfile.js              # Configurable jurisdiction tax rules & slabs
│   │   ├── Transaction.js             # Income and expense transactions
│   │   └── User.js                    # User account schema with password hashing
│   ├── routes/
│   │   ├── alertRoutes.js
│   │   ├── authRoutes.js
│   │   ├── budgetRoutes.js
│   │   ├── categoryRoutes.js
│   │   ├── reportRoutes.js
│   │   ├── taxRoutes.js
│   │   ├── transactionRoutes.js
│   │   └── userRoutes.js
│   ├── services/
│   │   ├── budgetService.js           # Spent calculation & alert dispatch
│   │   ├── notificationService.js     # Jurisdiction deadline engines
│   │   ├── reportService.js           # PDFKit and json2csv document generation
│   │   └── taxCalculationService.js   # Progressive slab calculation service
│   ├── utils/
│   │   ├── asyncHandler.js
│   │   └── generateToken.js
│   ├── uploads/reports/               # Generated PDF & CSV files directory
│   ├── app.js                         # Express middleware & route mounting
│   ├── server.js                      # Server entry point & initial seeding
│   ├── seed.js                        # Complete realistic demo dataset seeder
│   ├── test-api.js                    # Automated comprehensive test suite
│   ├── .env                           # Environment configuration
│   ├── .env.example
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── budgets/               # BudgetModal, BudgetProgressBar
│   │   │   ├── charts/                # IncomeExpenseChart, ExpensePieChart, TaxBreakdownChart
│   │   │   ├── common/                # Button, Badge, Modal, FormInput, StatCard, etc.
│   │   │   ├── dashboard/             # StatCardGrid, QuickActions, RecentTransactionsWidget
│   │   │   ├── forms/                 # TaxCalculationForm, CategoryModal
│   │   │   ├── layout/                # Sidebar, Navbar, MainLayout, NotificationDropdown
│   │   │   ├── reports/               # ReportGenerator, ReportList
│   │   │   └── transactions/          # TransactionTable, TransactionFilters, TransactionModal
│   │   ├── context/
│   │   │   ├── AuthContext.jsx
│   │   │   └── ThemeContext.jsx
│   │   ├── pages/
│   │   │   ├── Budgets.jsx
│   │   │   ├── Categories.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── NotFound.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Reports.jsx
│   │   │   ├── Settings.jsx
│   │   │   ├── TaxCalendar.jsx
│   │   │   └── TaxEstimator.jsx
│   │   ├── routes/
│   │   │   └── ProtectedRoute.jsx
│   │   ├── services/
│   │   │   ├── alertService.js
│   │   │   ├── api.js
│   │   │   ├── authService.js
│   │   │   ├── budgetService.js
│   │   │   ├── categoryService.js
│   │   │   ├── reportService.js
│   │   │   ├── taxService.js
│   │   │   ├── transactionService.js
│   │   │   └── userService.js
│   │   ├── utils/
│   │   │   ├── dateHelpers.js
│   │   │   └── formatCurrency.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── package.json
│
├── package.json                       # Root orchestration package
└── README.md                          # Comprehensive documentation
```

---

## 🚀 Getting Started Locally

### Prerequisites
- [Node.js](https://nodejs.org/) v18 or higher (v22 tested)
- [MongoDB](https://www.mongodb.com/) running locally on port 27017 or a [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) connection URI.

### 1. Clone the Repository
```bash
git clone <repository-url>
cd texpal
```

### 2. Configure Backend Environment
Create `backend/.env` (or copy from `backend/.env.example`):
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/taxpal
JWT_SECRET=taxpal_production_super_secret_jwt_key_2026_change_in_production
CLIENT_URL=http://localhost:5173
```

### 3. Seed Realistic Demo Data
The seed script will populate verified tax profiles (India New/Old regimes & US SE), create the default demo user, and seed 36 historical transactions, category budgets, tax calculations, and deadline alerts:
```bash
npm run seed
```

> **Demo User Credentials:**
> - **Email**: `demo@taxpal.dev`
> - **Password**: `Password123!`
> *(Alternatively, use the **Explore Demo Account** one-click button on the login screen.)*

### 4. Run Automated Test Suite
Verify that all 6 core modules (Auth, Categories, Ledger, Budgets, Progressive Tax Slabs, and Report Generation) pass:
```bash
npm run test:backend
```

### 5. Start the Application
Open two terminal windows:

**Terminal 1 (Backend API):**
```bash
cd backend
npm run dev
# Server runs on http://localhost:5000
```

**Terminal 2 (Frontend Client):**
```bash
cd frontend
npm run dev
# Frontend runs on http://localhost:5173
```

---

## 📡 REST API Reference

### Authentication (`/api/auth`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register a new user | Public |
| `POST` | `/api/auth/login` | Authenticate & receive token/cookie | Public |
| `POST` | `/api/auth/demo` | Instant demo login | Public |
| `POST` | `/api/auth/logout` | Clear cookie session | Public |
| `GET` | `/api/auth/me` | Current authenticated user profile | Private |
| `POST` | `/api/auth/forgot-password` | Generate reset token | Public |
| `POST` | `/api/auth/reset-password` | Reset password using token | Public |

### Transactions (`/api/transactions`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/api/transactions` | Query transactions (filters, pagination) | Private |
| `POST` | `/api/transactions` | Create income or expense record | Private |
| `GET` | `/api/transactions/summary`| Dashboard totals, trends, & pie breakdown | Private |
| `GET` | `/api/transactions/:id` | Single transaction detail | Private |
| `PUT` | `/api/transactions/:id` | Update transaction | Private |
| `DELETE`| `/api/transactions/:id` | Remove transaction | Private |

### Categories (`/api/categories`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/api/categories` | Get custom & default categories | Private |
| `POST` | `/api/categories` | Add custom category | Private |
| `PUT` | `/api/categories/:id` | Edit custom category | Private |
| `DELETE`| `/api/categories/:id` | Delete category (checks transaction usage)| Private |

### Budgets (`/api/budgets`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/api/budgets` | Get monthly budgets with live spending | Private |
| `POST` | `/api/budgets` | Create category budget | Private |
| `GET` | `/api/budgets/summary` | Overall monthly budget health & metrics | Private |
| `PUT` | `/api/budgets/:id` | Update limit or description | Private |
| `DELETE`| `/api/budgets/:id` | Delete budget allocation | Private |

### Tax Estimator & Calendar (`/api/tax`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `POST` | `/api/tax/calculate` | Compute progressive tax & persist estimate| Private |
| `GET` | `/api/tax/estimates` | List historical user tax calculations | Private |
| `GET` | `/api/tax/estimates/:id` | View specific calculation breakdown | Private |
| `GET` | `/api/tax/profiles` | List verified jurisdiction tax profiles | Private |
| `GET` | `/api/tax/calendar` | Quarterly tax deadlines & voucher amounts | Private |

### Reports (`/api/reports`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `POST` | `/api/reports/generate` | Generate PDF or CSV financial statement | Private |
| `GET` | `/api/reports` | List generated statements archive | Private |
| `GET` | `/api/reports/:id` | View report metadata | Private |
| `GET` | `/api/reports/:id/download`| Stream/download generated PDF or CSV file | Private |

### Alerts (`/api/alerts`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/api/alerts` | List deadline and budget alerts | Private |
| `PUT` | `/api/alerts/:id/read` | Mark alert as read | Private |
| `PUT` | `/api/alerts/read-all` | Mark all alerts as read | Private |
| `DELETE`| `/api/alerts/:id` | Dismiss alert | Private |

---

## ☁️ Deployment Guidelines

### Backend Deployment (Render / Railway / AWS)
1. Set the root directory to `backend`.
2. Build command: `npm install`.
3. Start command: `node server.js`.
4. Configure Environment Variables in the hosting dashboard:
   - `PORT`: `5000`
   - `NODE_ENV`: `production`
   - `MONGODB_URI`: `<Your MongoDB Atlas Connection String>`
   - `JWT_SECRET`: `<A strong random 64-character secret>`
   - `CLIENT_URL`: `https://your-taxpal-app.vercel.app`

### Frontend Deployment (Vercel)
1. Set root directory to `frontend`.
2. Framework preset: **Vite**.
3. Build command: `npm run build`.
4. Output directory: `dist`.
5. Environment variable:
   - `VITE_API_URL`: `https://your-taxpal-api.onrender.com/api`

---

## 🔒 Security Best Practices Implemented
- Passwords are salted and hashed using `bcryptjs` with 10 salt rounds.
- Database access restricts query scopes strictly to `req.user._id` across all controllers, eliminating horizontal privilege escalation.
- Rate limiting on authentication routes prevents brute-force attempts.
- HTTP security headers provided by `helmet`.
- Input validation sanitizes all incoming payloads.
- Secrets and tokens are never committed or exposed on the client.

---

## ⚖️ License
This project is licensed under the MIT License.

