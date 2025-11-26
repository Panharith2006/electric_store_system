# User Authentication System - Quick Setup

## ✅ What Was Implemented

### User Model with Two Roles
- **User (Customer)**: Default role for new registrations
- **Admin**: Can manage users, products, and access admin panel

### API Endpoints Created
1. **Public Endpoints:**
   - `POST /api/users/register/` - User registration
   - `POST /api/users/login/` - User login

2. **Authenticated Endpoints:**
   - `POST /api/users/logout/` - User logout
   - `GET /api/users/profile/` - Get user profile
   - `PATCH /api/users/profile/` - Update profile
   - `POST /api/users/change-password/` - Change password

3. **Admin-Only Endpoints:**
   - `GET /api/users/manage/` - List all users
   - `GET /api/users/manage/{id}/` - Get user details
   - `PUT/PATCH /api/users/manage/{id}/` - Update user
   - `DELETE /api/users/manage/{id}/` - Delete user
   - `POST /api/users/manage/{id}/promote_to_admin/` - Promote to admin
   - `POST /api/users/manage/{id}/demote_to_user/` - Demote to user
   - `GET /api/users/manage/admins/` - List all admins
   - `GET /api/users/manage/customers/` - List all customers

### Features
- Token-based authentication
- Role-based permissions
- Password validation
- User profile management
- Admin user management
- Custom user model with additional fields

---

## 🚀 Setup Instructions

### **IMPORTANT: Delete Old Database First**
Since we added a custom user model, you need to reset the database:

```powershell
# Activate virtual environment
cd "d:\Year 3\WCT\Electric-Store-Management-System\backend"
.\venv\Scripts\Activate.ps1

# Delete old database
del db.sqlite3

# Delete migration files (keep __init__.py)
Get-ChildItem -Path . -Include migrations -Recurse -Directory | ForEach-Object { Get-ChildItem $_.FullName -Exclude __init__.py | Remove-Item -Recurse -Force }
```

### Or manually delete:
- `db.sqlite3`
- All files in `users/migrations/` except `__init__.py`
- All files in `products/migrations/` except `__init__.py`
- All files in `cart/migrations/` except `__init__.py`

---

### Step 1: Install Dependencies
```powershell
pip install -r requirements.txt
```

### Step 2: Create Migrations
```powershell
python manage.py makemigrations users
python manage.py makemigrations products
python manage.py makemigrations cart
python manage.py makemigrations
```

### Step 3: Apply Migrations
```powershell
python manage.py migrate
```

### Step 4: Create First Admin User
```powershell
python manage.py createsuperuser
```

Follow the prompts:
- Username: `admin`
- Email: `admin@example.com`
- Password: (choose a strong password)

**This user will automatically have admin privileges.**

### Step 5: Start Server
```powershell
python manage.py runserver
```

---

## 🧪 Testing the Authentication

### Test Registration (User)
```bash
curl -X POST http://localhost:8000/api/users/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_doe",
    "email": "john@example.com",
    "password": "SecurePass123!",
    "password_confirm": "SecurePass123!",
    "first_name": "John",
    "last_name": "Doe"
  }'
```

### Test Login
```bash
curl -X POST http://localhost:8000/api/users/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_doe",
    "password": "SecurePass123!"
  }'
```

**Save the token from the response!**

### Test Get Profile (Use your token)
```bash
curl http://localhost:8000/api/users/profile/ \
  -H "Authorization: Token YOUR_TOKEN_HERE"
```

### Test Admin Panel
1. Go to: `http://localhost:8000/admin/`
2. Login with your superuser credentials
3. You can manage users, promote/demote roles, etc.

---

## 📱 Frontend Integration

### 1. Create Auth Context/Hook
```typescript
// hooks/use-auth.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'USER' | 'ADMIN';
  is_admin: boolean;
}

interface AuthStore {
  user: User | null;
  token: string | null;
  login: (username: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

export const useAuth = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isAdmin: false,

      login: async (username, password) => {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/login/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password }),
        });

        const data = await response.json();
        
        if (response.ok) {
          set({
            user: data.user,
            token: data.token,
            isAuthenticated: true,
            isAdmin: data.user.role === 'ADMIN',
          });
        } else {
          throw new Error(data.error || 'Login failed');
        }
      },

      register: async (registerData) => {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/register/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(registerData),
        });

        const data = await response.json();
        
        if (response.ok) {
          set({
            user: data.user,
            token: data.token,
            isAuthenticated: true,
            isAdmin: data.user.role === 'ADMIN',
          });
        } else {
          throw new Error(JSON.stringify(data));
        }
      },

      logout: async () => {
        const token = get().token;
        
        if (token) {
          await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/logout/`, {
            method: 'POST',
            headers: { 'Authorization': `Token ${token}` },
          });
        }

        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isAdmin: false,
        });
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);
```

### 2. Update API Requests to Include Token
```typescript
// lib/api.ts
import { useAuth } from '@/hooks/use-auth';

export const apiRequest = async (url: string, options: RequestInit = {}) => {
  const token = useAuth.getState().token;
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Token ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${url}`, {
    ...options,
    headers,
  });

  return response;
};
```

### 3. Protect Admin Routes
```typescript
// app/admin/layout.tsx
'use client';

import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AdminLayout({ children }) {
  const { isAdmin, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    } else if (!isAdmin) {
      router.push('/products');
    }
  }, [isAuthenticated, isAdmin, router]);

  if (!isAdmin) return null;

  return <>{children}</>;
}
```

---

## 🔐 User Roles Summary

### Regular User (USER)
- Register and login
- Browse products
- Add to cart
- Place orders
- View order history
- Update profile
- **Cannot access admin endpoints**

### Admin (ADMIN)
- All user permissions
- Access admin panel
- Manage all users
- Promote/demote users
- Manage products and inventory
- View all orders
- Access analytics and reports

---

## 📋 Files Created/Updated

### Created:
1. `users/models.py` - Custom User model with roles
2. `users/serializers.py` - API serializers for authentication
3. `users/views.py` - Authentication views and user management
4. `users/permissions.py` - Custom permission classes
5. `users/urls.py` - URL routing for auth endpoints
6. `users/admin.py` - Enhanced admin panel
7. `AUTH_DOCUMENTATION.md` - Complete auth documentation

### Updated:
1. `core/settings.py` - Added AUTH_USER_MODEL, authtoken, authentication classes
2. `requirements.txt` - Dependencies (no changes needed, already correct)

---

## 🐛 Common Issues

### Issue: "Custom user model not found"
**Solution:** Delete db.sqlite3 and all migration files, then run migrations again.

### Issue: "Token authentication not working"
**Solution:** Make sure:
- `rest_framework.authtoken` is in INSTALLED_APPS
- Run `python manage.py migrate` to create token tables
- Send token as: `Authorization: Token <your_token>`

### Issue: "Admin can't login to admin panel"
**Solution:** Make sure user has:
- `role = 'ADMIN'`
- `is_staff = True`
- `is_superuser = True` (for full access)

---

## 📚 Documentation

- **Complete Authentication API Docs:** `AUTH_DOCUMENTATION.md`
- **Products & Cart API Docs:** `API_DOCUMENTATION.md`
- **Setup Guide:** `SETUP_GUIDE.md`

---

Ready to implement! Follow the setup instructions above to get started.
