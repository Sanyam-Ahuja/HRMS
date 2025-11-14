# HRMS - Human Resource Management System

A comprehensive government-style HR Management System built with Next.js, MongoDB, and modern web technologies.

## 🎯 Features

- **Admin Management**: Create and manage admin users
- **Employee Management**: Complete CRUD operations for employee profiles
- **Payroll Management**: Generate and track salary payments
- **Authentication**: Secure JWT-based login system
- **Audit Logs**: Track all administrative actions
- **HR Chatbot**: AI-powered assistant for HR queries
- **Responsive Design**: Works on desktop and mobile devices
- **Dark/Light Mode**: Theme switching support

## 🏗️ Tech Stack

- **Frontend**: Next.js 14+ (App Router), TailwindCSS, TypeScript
- **Backend**: Next.js API Routes
- **Database**: MongoDB Atlas with Mongoose
- **Authentication**: JWT with HTTP-only cookies
- **Password Security**: bcrypt hashing
- **Validation**: Zod schemas
- **Icons**: Lucide React

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone <repository-url>
cd hrms-app
npm install
```

### 2. Environment Setup

Create `.env.local` file:

```env
MONGODB_URI=mongodb+srv://sam:sam123@cluster0.ggprwnf.mongodb.net/?appName=Cluster0
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_random
OPENROUTER_API_KEY=your_openrouter_api_key_here
NEXT_PUBLIC_OPENROUTER_MODEL=gpt-4o-mini
NEXTAUTH_URL=http://localhost:3000
```

### 3. Initialize Database

```bash
# Seed admin user
node seed-admin.js
```

This creates:
- **Username**: `admin`
- **Password**: `admin123`

### 4. Run Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## 📋 User Roles & Permissions

### Admin Features
- ✅ Create/Edit/Delete employees
- ✅ Generate payroll slips
- ✅ Manage salary information
- ✅ Process promotions
- ✅ View audit logs
- ✅ Create additional admin users
- ✅ Access all employee data

### Employee Features
- ✅ View personal profile
- ✅ Edit contact details (phone, address)
- ✅ Download salary slips
- ✅ View payroll history
- ✅ Use HR chatbot
- ✅ Check job responsibilities

## 🗂️ Project Structure

```
src/
├── app/
│   ├── admin/                 # Admin dashboard pages
│   │   ├── dashboard/
│   │   ├── employees/
│   │   └── payroll/
│   ├── employee/              # Employee portal pages
│   │   ├── dashboard/
│   │   ├── profile/
│   │   └── salary-slips/
│   ├── api/                   # Backend API routes
│   │   ├── auth/
│   │   ├── employees/
│   │   ├── payroll/
│   │   └── chatbot/
│   ├── login/                 # Authentication page
│   └── chatbot/               # Public chatbot
├── components/
│   ├── ui/                    # Reusable UI components
│   └── layout/                # Layout components
├── lib/
│   ├── mongodb.ts            # Database connection
│   ├── auth.ts               # JWT utilities
│   ├── validations.ts        # Zod schemas
│   └── audit.ts              # Audit logging
└── models/                    # Mongoose schemas
    ├── User.ts
    ├── EmployeeProfile.ts
    ├── Payroll.ts
    └── AuditLog.ts
```

## 🔐 Security Features

- **Password Encryption**: bcrypt with salt rounds
- **JWT Authentication**: Secure token-based auth
- **HTTP-only Cookies**: Prevent XSS attacks
- **Input Validation**: Zod schema validation
- **Role-based Access**: Admin/Employee permissions
- **Audit Logging**: Track all admin actions

## 📊 Database Schema

### Users
- Basic user information and authentication
- Role-based access control

### Employee Profiles
- Job details, salary, and employment information
- Separate from user data for flexibility

### Payroll Records
- Monthly salary calculations
- Historical payroll data

### Audit Logs
- Track all administrative actions
- Before/after state recording

## 🤖 AI Chatbot Features

The HR Assistant can help with:
- **Login Issues**: Password reset and account access
- **Salary Queries**: Current salary and allowances
- **Profile Information**: Job role and responsibilities
- **Payroll History**: Salary slip downloads
- **General HR**: Company policies and procedures

## 🚀 Deployment

### Vercel Deployment

1. **Push to Git**: Commit your code to GitHub/GitLab
2. **Connect Vercel**: Link your repository to Vercel
3. **Environment Variables**: Add all `.env.local` variables to Vercel
4. **Deploy**: Automatic deployment on push

### Environment Variables for Production

```env
MONGODB_URI=your_production_mongodb_url
JWT_SECRET=super_strong_production_secret
OPENROUTER_API_KEY=your_openrouter_key
NEXT_PUBLIC_OPENROUTER_MODEL=gpt-4o-mini
NEXTAUTH_URL=https://your-domain.vercel.app
```

## 🛠️ Development Commands

```bash
# Development server
npm run dev

# Production build
npm run build

# Start production server
npm run start

# Lint code
npm run lint

# Seed admin user
node seed-admin.js
```

## 🎨 UI Components

Built with custom components:
- **Cards**: Information containers
- **Buttons**: Action triggers with loading states
- **Inputs**: Form controls with validation
- **Tables**: Data display with sorting/filtering
- **Modals**: Overlay dialogs
- **Navigation**: Responsive sidebar and navbar

## 📱 Responsive Design

- **Mobile First**: Optimized for mobile devices
- **Tablet Support**: Adapted layouts for tablets
- **Desktop**: Full-featured desktop experience
- **Print Friendly**: Salary slips optimized for printing

## 🔧 Troubleshooting

### Common Issues

1. **MongoDB Connection**: Verify connection string and network access
2. **JWT Errors**: Check JWT_SECRET environment variable
3. **Build Errors**: Ensure all dependencies are installed
4. **Auth Issues**: Clear cookies and try logging in again

### Support

For technical support:
1. Check the console for error messages
2. Verify environment variables
3. Ensure MongoDB Atlas is accessible
4. Contact system administrator

## 📄 License

MIT License - See LICENSE file for details

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

---

**Built with ❤️ using Next.js and modern web technologies**
