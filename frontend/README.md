# 🎨 Frontend – Smart Campus Bus Booking & Management System

> **Owner:** [@Dhakshi03](https://github.com/Dhakshi03)  
> **Tech Stack:** React 18, Vite, Tailwind CSS, Axios, React Router v6, React Hot Toast, HTML5-QRCode, Razorpay Checkout

Full-featured modern React SPA connecting to the FastAPI backend to digitize campus bus reservations, passenger ticketing, QR validation, and fleet administration.

---

## 📁 Project Structure

```
frontend/
├── src/
│   ├── api/                   # Centralized Axios API services
│   │   ├── client.js          # Base Axios client with JWT interceptor & auto-redirects
│   │   ├── auth.js            # Register, login, get current profile
│   │   ├── routes.js          # Route scheduling & queries
│   │   ├── buses.js           # Fleet and vehicle management
│   │   ├── bookings.js        # Seat bookings, user history & QR scan verification
│   │   ├── payments.js        # Razorpay order generation & verification
│   │   └── admin.js           # Summary KPIs & system user directory
│   ├── components/            # Reusable UI components
│   │   ├── Navbar.jsx         # Role-aware responsive navigation bar
│   │   ├── ProtectedRoute.jsx # Role-based access control router guard
│   │   └── Icons.jsx          # Self-contained SVG icon system
│   ├── context/
│   │   └── AuthContext.jsx    # Global JWT authentication and user session provider
│   ├── pages/
│   │   ├── Home.jsx           # Landing / portal gateway
│   │   ├── auth/
│   │   │   ├── Login.jsx      # Email + password authentication with demo quick-fills
│   │   │   └── Register.jsx   # Student registration
│   │   ├── student/
│   │   │   ├── StudentDashboard.jsx  # Student hub with booking stats
│   │   │   ├── ViewRoutes.jsx        # Bus route directory with search & seat filters
│   │   │   ├── BookTicket.jsx        # Seat reservation with travel date selection
│   │   │   ├── Payment.jsx           # Razorpay checkout integration
│   │   │   └── MyBookings.jsx        # Digital passes with QR popup & cancellation
│   │   ├── scanner/
│   │   │   └── QRScanner.jsx         # Live camera ticket verification via html5-qrcode
│   │   └── admin/
│   │       ├── AdminDashboard.jsx    # Real-time KPIs & fleet metrics
│   │       ├── ManageBuses.jsx       # Bus fleet registration & capacity table
│   │       ├── ManageRoutes.jsx      # Route schedules, stops, and fares
│   │       ├── AllBookings.jsx       # Master passenger reservation registry
│   │       └── AllUsers.jsx          # System user directory
│   ├── App.jsx                # Router configuration & notifications
│   ├── main.jsx               # React DOM root entry
│   └── index.css              # Tailwind CSS directives
├── index.html                 # HTML shell with Razorpay SDK
├── vite.config.js             # Vite configuration with /api backend proxy
├── tailwind.config.js         # Tailwind typography & theme configuration
└── Dockerfile                 # Multi-stage production container build
```

---

## 🚀 Running Locally

### Prerequisites
- Node.js 18+
- npm 9+

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```
The application will be live at `http://localhost:3000` (or `http://localhost:5173`).

### 3. Build for Production
```bash
npm run build
```
Compiled static assets are generated in `dist/`.

---

## 🔐 Role-Based Access Routing

| Role | Accessible Routes | Default Redirect |
|---|---|---|
| **Public** | `/`, `/login`, `/register` | `/` |
| **Student** | `/student`, `/student/routes`, `/student/book/:id`, `/student/payment/:id`, `/student/bookings` | `/student` |
| **Scanner** | `/scanner` | `/scanner` |
| **Admin** | `/admin`, `/admin/buses`, `/admin/routes`, `/admin/bookings`, `/admin/users`, `/scanner` | `/admin` |
