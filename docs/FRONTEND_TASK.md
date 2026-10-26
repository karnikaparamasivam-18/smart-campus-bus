# 🎨 Frontend Task – Smart Campus Bus
**Assigned to:** [@Dhakshi03](https://github.com/Dhakshi03)
**Tech:** React.js + Tailwind CSS + Axios

---

## 🎯 Your Goal
Build the complete frontend for the Smart Campus Bus app. It connects to the FastAPI backend already built by Karnika.

---

## ⚙️ Setup Steps

```bash
# 1. Clone the repo
git clone https://github.com/karnikaparamasivam-18/smart-campus-bus.git
cd smart-campus-bus

# 2. Create your branch
git checkout -b feature/frontend

# 3. Set up React inside the frontend folder
cd frontend
npm create vite@latest . -- --template react
npm install
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
npm install axios react-router-dom react-hot-toast html5-qrcode
```

---

## 📁 Folder Structure to Create

```
frontend/
├── src/
│   ├── api/           # Axios API calls
│   ├── components/    # Reusable components (Navbar, QRScanner, etc.)
│   ├── pages/
│   │   ├── auth/      # Login, Register
│   │   ├── student/   # Dashboard, Routes, Booking, History
│   │   ├── scanner/   # QR Scanner page
│   │   └── admin/     # Dashboard, Buses, Routes, Users, Reports
│   ├── context/       # AuthContext (store token + user info)
│   └── App.jsx
```

---

## 📄 Pages to Build

### Auth Pages
| Page | Route | Description |
|------|-------|-------------|
| Login | `/login` | Email + password login form |
| Register | `/register` | Register as student |

### Student Pages
| Page | Route | Description |
|------|-------|-------------|
| Dashboard | `/student` | Welcome + quick links |
| View Routes | `/student/routes` | List all available routes with seats + fare |
| Book Ticket | `/student/book/:routeId` | Select date, confirm booking |
| Payment | `/student/payment/:bookingId` | Razorpay checkout integration |
| My Bookings | `/student/bookings` | List of past bookings with QR codes |

### Scanner Pages
| Page | Route | Description |
|------|-------|-------------|
| QR Scanner | `/scanner` | Camera-based QR scan using html5-qrcode |

### Admin Pages
| Page | Route | Description |
|------|-------|-------------|
| Dashboard | `/admin` | Summary stats (users, bookings, buses) |
| Manage Buses | `/admin/buses` | Add/Edit/Delete buses |
| Manage Routes | `/admin/routes` | Add/Edit/Delete routes |
| All Bookings | `/admin/bookings` | View all bookings |
| All Users | `/admin/users` | View all users |

---

## 🔌 API Base URL
```
http://localhost:8000/api/v1
```

## 🔌 Key API Endpoints to Call

| Action | Method | Endpoint |
|--------|--------|----------|
| Register | POST | `/auth/register` |
| Login | POST | `/auth/login` |
| Get profile | GET | `/users/me` |
| List routes | GET | `/routes/` |
| Book ticket | POST | `/bookings/` |
| My bookings | GET | `/bookings/my` |
| Cancel booking | DELETE | `/bookings/{id}` |
| Create payment order | POST | `/payments/create-order` |
| Verify payment | POST | `/payments/verify` |
| Scan QR | POST | `/bookings/scan` |
| Admin: List users | GET | `/admin/users` |
| Admin: Summary | GET | `/admin/reports/summary` |
| Admin: Manage buses | GET/POST/PUT/DELETE | `/buses/` |
| Admin: Manage routes | GET/POST/PUT/DELETE | `/routes/` |

---

## 🔐 Auth Flow
1. On login, store `access_token` in `localStorage`
2. Add to all API requests as header: `Authorization: Bearer <token>`
3. Use React context (`AuthContext`) to manage user state globally
4. Redirect unauthenticated users to `/login`
5. Role-based routing: students → `/student`, scanner → `/scanner`, admin → `/admin`

---

## 📦 Razorpay Integration (Student Payment Page)

```jsx
// Load Razorpay script and open checkout
const options = {
  key: data.key_id,              // from API response
  amount: data.amount * 100,
  currency: "INR",
  order_id: data.razorpay_order_id,
  handler: async (response) => {
    // Call /payments/verify with response data
    await axios.post('/api/v1/payments/verify', {
      razorpay_order_id: response.razorpay_order_id,
      razorpay_payment_id: response.razorpay_payment_id,
      razorpay_signature: response.razorpay_signature,
    }, { headers: { Authorization: `Bearer ${token}` }});
  }
};
const rzp = new window.Razorpay(options);
rzp.open();
```

---

## 📷 QR Scanner (Scanner Page)

```jsx
import { Html5QrcodeScanner } from "html5-qrcode";

// After scan success, call:
await axios.post('/api/v1/bookings/scan', {
  qr_token: scannedText
}, { headers: { Authorization: `Bearer ${token}` }});
// Show result: valid ✅ or invalid ❌
```

---

## 🌿 Git Workflow

```bash
# Work on your branch
git add .
git commit -m "feat: add student dashboard page"
git push origin feature/frontend

# When done, open a Pull Request on GitHub:
# feature/frontend → dev
```

### Commit message style:
- `feat: add login page`
- `feat: add QR scanner component`
- `feat: integrate razorpay payment`
- `fix: fix route listing API call`
- `style: apply tailwind to admin dashboard`

---

## ✅ Checklist
- [ ] Auth: Login + Register pages
- [ ] Student: Route list page
- [ ] Student: Booking page + date picker
- [ ] Student: Payment with Razorpay
- [ ] Student: My Bookings with QR display
- [ ] Scanner: QR camera scanner
- [ ] Admin: Dashboard stats
- [ ] Admin: Bus management
- [ ] Admin: Route management
- [ ] Protected routes (role-based)
- [ ] Responsive UI with Tailwind
