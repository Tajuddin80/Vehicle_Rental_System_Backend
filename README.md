# 🚗 Vehicle Rental System - Backend API

A robust and secure backend API for managing vehicle rentals, built with Node.js, TypeScript, Express, and PostgreSQL.

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Technology Stack](#️-technology-stack)
- [Project Structure](#-project-structure)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Environment Configuration](#-environment-configuration)
- [Database Setup](#-database-setup)
- [Running the Application](#-running-the-application)
- [API Documentation](#-api-documentation)
- [Authentication](#-authentication)
- [Business Logic](#-business-logic)
- [Scripts](#-scripts)
- [Contributing](#-contributing)

---

## 🎯 Overview

The Vehicle Rental System is a comprehensive backend solution that enables:
- **Vehicle Management** - CRUD operations for vehicle inventory with real-time availability tracking
- **User Management** - Role-based access control for admins and customers
- **Booking System** - Complete rental lifecycle management with automated pricing and vehicle status updates
- **Authentication & Authorization** - Secure JWT-based authentication with role-based permissions

---

## ✨ Features

### 🔐 Security
- JWT-based authentication
- Password hashing with bcryptjs
- Role-based access control (Admin/Customer)
- Protected routes with middleware validation

### 🚗 Vehicle Management
- Add, view, update, and delete vehicles
- Real-time availability tracking
- Multiple vehicle types (Car, Bike, Van, SUV)
- Daily rental pricing

### 👥 User Management
- User registration and authentication
- Profile management
- Admin controls for user management
- Deletion protection (users with bookings cannot be deleted)

### 📅 Booking System
- Create bookings with automatic price calculation
- Vehicle availability validation
- Booking cancellation (before start date)
- Admin marking bookings as returned
- **Automated booking returns** via cron job (runs daily)
- Role-based booking views (admin sees all, customers see own)

### 🤖 Automation
- Automatic booking status updates when rental period ends
- Vehicle availability auto-updates
- Daily cron job for expired booking cleanup

---

## 🛠️ Technology Stack

| Technology | Purpose |
|------------|---------|
| **Node.js** | Runtime environment |
| **TypeScript** | Type-safe development |
| **Express.js** | Web framework |
| **PostgreSQL** | Relational database |
| **bcryptjs** | Password hashing |
| **jsonwebtoken** | JWT authentication |
| **Zod** | Schema validation |
| **node-cron** | Scheduled tasks |
| **pg** | PostgreSQL client |
| **tsx** | TypeScript execution |

---

## 📁 Project Structure

```
├── 📁 src
│   ├── 📁 config
│   │   ├── 📄 db.ts
│   │   └── 📄 index.ts
│   ├── 📁 middleware
│   │   └── 📄 verifyRoles.ts
│   ├── 📁 modules
│   │   ├── 📁 auth
│   │   │   ├── 📄 auth.constant.ts
│   │   │   ├── 📄 auth.controller.ts
│   │   │   ├── 📄 auth.routes.ts
│   │   │   ├── 📄 auth.service.ts
│   │   │   └── 📄 auth.validation.ts
│   │   ├── 📁 bookings
│   │   │   ├── 📄 booking.validation.ts
│   │   │   ├── 📄 bookings.controller.ts
│   │   │   ├── 📄 bookings.routes.ts
│   │   │   └── 📄 bookings.service.ts
│   │   ├── 📁 jobs
│   │   │   └── 📄 autoReturnBookings.ts
│   │   ├── 📁 users
│   │   │   ├── 📄 users.controller.ts
│   │   │   ├── 📄 users.routes.ts
│   │   │   ├── 📄 users.service.ts
│   │   │   └── 📄 users.validation.ts
│   │   └── 📁 vehicles
│   │       ├── 📄 vehicles.controller.ts
│   │       ├── 📄 vehicles.routes.ts
│   │       ├── 📄 vehicles.service.ts
│   │       └── 📄 vehicles.validation.ts
│   ├── 📁 types
│   │   └── 📁 express
│   │       └── 📄 index.d.ts
│   ├── 📄 app.ts
│   └── 📄 server.ts
├── ⚙️ .gitignore
├── 📝 README.md
├── ⚙️ package-lock.json
├── ⚙️ package.json
└── ⚙️ tsconfig.json
```

---

## 🔧 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v18 or higher)
- **PostgreSQL** (v14 or higher)
- **npm** or **yarn**

---

## 📦 Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd vehicle_rental_system_backend
```

2. **Install dependencies**
```bash
npm install
```

---

## ⚙️ Environment Configuration

Create a `.env` file in the root directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
PG_CONNECTION_STR=postgresql://username:password@localhost:5432/vehicle_rental_db

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here_change_in_production
```

---

## 🗄️ Database Setup

The application automatically creates all necessary tables and ENUM types on startup. The database schema includes:

### Tables Created:
- **users** - User accounts with role-based access
- **vehicles** - Vehicle inventory with availability tracking
- **bookings** - Rental records with pricing and status

### ENUM Types:
- `user_role`: 'admin', 'customer'
- `vehicle_type`: 'car', 'bike', 'van', 'SUV'
- `booking_status`: 'active', 'cancelled', 'returned'
- `status`: 'available', 'booked'

**Manual Database Creation:**
```bash
# Create database
psql -U postgres
CREATE DATABASE vehicle_rental_db;
\q
```

The application will automatically create all tables when it starts.

---

## 🚀 Running the Application

### Development Mode
```bash
npm run dev
```
The server will start on `http://localhost:5000` with hot-reload enabled.

### Production Build
```bash
npm run build
npm start
```

### Verify Server is Running
```bash
curl http://localhost:5000
```

Expected response:
```json
{
  "message": "Welcome to vehicle rental system by TajUddin",
  "status": "running",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

---

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api/v1
```

### API Endpoints Overview

#### 🔐 Authentication
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/auth/signup` | Public | Register new user |
| POST | `/auth/signin` | Public | Login and get JWT token |

#### 🚗 Vehicles
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/vehicles` | Admin | Create new vehicle |
| GET | `/vehicles` | Public | Get all vehicles |
| GET | `/vehicles/:vehicleId` | Public | Get vehicle by ID |
| PUT | `/vehicles/:vehicleId` | Admin | Update vehicle |
| DELETE | `/vehicles/:vehicleId` | Admin | Delete vehicle |

#### 👥 Users
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/users` | Admin | Get all users |
| PUT | `/users/:userId` | Admin/Own | Update user |
| DELETE | `/users/:userId` | Admin | Delete user |

#### 📅 Bookings
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/bookings` | Customer/Admin | Create booking |
| GET | `/bookings` | Role-based | Get bookings (filtered by role) |
| PUT | `/bookings/:bookingId` | Role-based | Update booking status |

---

## 🔐 Authentication

### Registration Example
```bash
curl -X POST http://localhost:5000/api/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "phone": "01712345678",
    "role": "customer"
  }'
```

### Login Example
```bash
curl -X POST http://localhost:5000/api/v1/auth/signin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Using Protected Endpoints
```bash
curl -X GET http://localhost:5000/api/v1/bookings \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

---

## 💼 Business Logic

### 📊 Booking Price Calculation
```typescript
total_price = daily_rent_price × number_of_days
number_of_days = rent_end_date - rent_start_date
```

### 🔄 Vehicle Status Updates
- **Booking Created** → Vehicle status: `"booked"`
- **Booking Returned** → Vehicle status: `"available"`
- **Booking Cancelled** → Vehicle status: `"available"`

### ⏰ Automated Returns
- Cron job runs **daily at 12:01 AM**
- Automatically marks bookings as `"returned"` when `rent_end_date` has passed
- Updates vehicle availability accordingly
- Logs all operations for monitoring

### 🛡️ Deletion Protection
- **Users** cannot be deleted if they have active bookings
- **Vehicles** cannot be deleted if they have active bookings
- **Active bookings** = status is `"active"`

### 🎯 Role-Based Access
- **Admin**:
  - Full system access
  - Manage all vehicles, users, and bookings
  - Mark bookings as returned
- **Customer**:
  - Create and view own bookings
  - Cancel bookings before start date
  - Update own profile

---

## 📜 Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot-reload |
| `npm run build` | Compile TypeScript to JavaScript |
| `npm start` | Run production server |
| `npm test` | Run test suite (not implemented yet) |

---

## 🧪 Testing the API

### Example: Create a Booking
```bash
# 1. Register a user
curl -X POST http://localhost:5000/api/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"John","email":"john@test.com","password":"123456","phone":"01712345678","role":"customer"}'

# 2. Login
curl -X POST http://localhost:5000/api/v1/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"john@test.com","password":"123456"}'

# 3. Create booking (use token from step 2)
curl -X POST http://localhost:5000/api/v1/bookings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "customer_id": 1,
    "vehicle_id": 1,
    "rent_start_date": "2024-12-15",
    "rent_end_date": "2024-12-20"
  }'
```

---

## 🔍 Error Handling

The API uses standard HTTP status codes:

| Code | Meaning | Example |
|------|---------|---------|
| 200 | Success | Resource retrieved/updated |
| 201 | Created | New resource created |
| 400 | Bad Request | Validation error, business rule violation |
| 401 | Unauthorized | Missing/invalid token |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource doesn't exist |
| 500 | Server Error | Unexpected error |

### Error Response Format
```json
{
  "success": false,
  "message": "Error description",
  "errors": ["Detailed error messages"]
}
```

---

## 🚦 Monitoring & Logs

The application logs important events:
- ✅ Database initialization
- ✅ Cron job execution
- ✅ Auto-return operations
- ❌ Error logs with timestamps

Example logs:
```
Database initialized successfully!
✅ Cron jobs initialized
[2024-12-07T00:01:00.000Z] Running auto-return job...
✅ Auto-returned 3 booking(s)
```

---

## 🛠️ Development Guidelines

### Adding New Features
1. Create feature module in `src/modules/`
2. Follow the pattern: `routes → controller → service`
3. Add validation with Zod
4. Update this README

### Code Style
- Use TypeScript strict mode
- Follow modular architecture
- Use async/await for async operations
- Handle errors with try-catch
- Validate all inputs with Zod

---

## 📝 License

This project is licensed under the ISC License.

---

## 👨‍💻 Author

**TajUddin**

---

## 🙏 Acknowledgments

- Express.js team for the excellent framework
- PostgreSQL community
- TypeScript team
- All open-source contributors

---

## 📞 Support

For issues, questions, or contributions, please:
1. Check existing documentation
2. Review API Reference
3. Open an issue on GitHub
4. Contact the development team

---

**Happy Coding! 🚀**