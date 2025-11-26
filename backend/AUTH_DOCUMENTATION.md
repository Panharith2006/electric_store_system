# User Authentication System Documentation

## Overview
This authentication system provides role-based access control with two user roles: **Admin** and **User**.

---

## User Roles

### 1. **User (Regular Customer)**
- Can register, login, and manage their own profile
- Can browse products, add to cart, place orders
- Can view their own orders and favorites
- **Cannot** access admin panel or manage other users

### 2. **Admin**
- Has all User permissions
- Can access admin panel (`/admin/`)
- Can manage all users (view, edit, promote, demote, deactivate)
- Can manage products, inventory, and reports
- Can view all orders and analytics

---

## API Endpoints

### Base URL: `/api/users/`

### 1. **User Registration**
**POST** `/api/users/register/`

**Public Endpoint** (No authentication required)

**Request Body:**
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "password_confirm": "SecurePass123!",
  "first_name": "John",
  "last_name": "Doe",
  "phone_number": "+1234567890"
}
```

**Response (201 Created):**
```json
{
  "user": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "full_name": "John Doe",
    "role": "USER",
    "is_admin": false,
    "phone_number": "+1234567890",
    "profile_picture": null,
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  },
  "token": "9944b09199c62bcf9418ad846dd0e4bbdfc6ee4b",
  "message": "User registered successfully"
}
```

---

### 2. **User Login**
**POST** `/api/users/login/`

**Public Endpoint**

**Request Body:**
```json
{
  "username": "john_doe",
  "password": "SecurePass123!"
}
```

**Response (200 OK):**
```json
{
  "user": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "full_name": "John Doe",
    "role": "USER",
    "is_admin": false,
    "phone_number": "+1234567890",
    "profile_picture": null,
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  },
  "token": "9944b09199c62bcf9418ad846dd0e4bbdfc6ee4b",
  "message": "Login successful"
}
```

**Error Response (401 Unauthorized):**
```json
{
  "error": "Invalid credentials"
}
```

---

### 3. **User Logout**
**POST** `/api/users/logout/`

**Requires Authentication** (Token in header)

**Headers:**
```
Authorization: Token 9944b09199c62bcf9418ad846dd0e4bbdfc6ee4b
```

**Response (200 OK):**
```json
{
  "message": "Logout successful"
}
```

---

### 4. **Get User Profile**
**GET** `/api/users/profile/`

**Requires Authentication**

**Headers:**
```
Authorization: Token 9944b09199c62bcf9418ad846dd0e4bbdfc6ee4b
```

**Response:**
```json
{
  "id": 1,
  "username": "john_doe",
  "email": "john@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "full_name": "John Doe",
  "role": "USER",
  "is_admin": false,
  "phone_number": "+1234567890",
  "profile_picture": "https://example.com/profile.jpg",
  "date_of_birth": "1990-01-01",
  "address_line1": "123 Main St",
  "address_line2": "Apt 4B",
  "city": "New York",
  "state": "NY",
  "postal_code": "10001",
  "country": "USA",
  "newsletter_subscribed": true,
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

---

### 5. **Update User Profile**
**PATCH** `/api/users/profile/`

**Requires Authentication**

**Headers:**
```
Authorization: Token 9944b09199c62bcf9418ad846dd0e4bbdfc6ee4b
```

**Request Body (partial update allowed):**
```json
{
  "first_name": "John",
  "last_name": "Smith",
  "phone_number": "+1987654321",
  "address_line1": "456 Oak Ave",
  "city": "Los Angeles",
  "state": "CA",
  "postal_code": "90001",
  "newsletter_subscribed": false
}
```

**Response:** Updated user profile (same format as GET)

---

### 6. **Change Password**
**POST** `/api/users/change-password/`

**Requires Authentication**

**Headers:**
```
Authorization: Token 9944b09199c62bcf9418ad846dd0e4bbdfc6ee4b
```

**Request Body:**
```json
{
  "old_password": "OldPass123!",
  "new_password": "NewSecurePass456!",
  "new_password_confirm": "NewSecurePass456!"
}
```

**Response (200 OK):**
```json
{
  "message": "Password changed successfully"
}
```

**Error Response (400 Bad Request):**
```json
{
  "error": "Invalid old password"
}
```

---

## Admin-Only Endpoints

### 7. **List All Users**
**GET** `/api/users/manage/`

**Requires Admin Role**

**Headers:**
```
Authorization: Token <admin_token>
```

**Response:**
```json
{
  "count": 50,
  "next": "http://localhost:8000/api/users/manage/?page=2",
  "previous": null,
  "results": [
    {
      "id": 1,
      "username": "john_doe",
      "email": "john@example.com",
      "first_name": "John",
      "last_name": "Doe",
      "full_name": "John Doe",
      "role": "USER",
      "is_admin": false,
      "is_active": true,
      "is_staff": false,
      "is_superuser": false,
      "phone_number": "+1234567890",
      "profile_picture": null,
      "date_of_birth": "1990-01-01",
      "address_line1": "123 Main St",
      "address_line2": "",
      "city": "New York",
      "state": "NY",
      "postal_code": "10001",
      "country": "USA",
      "newsletter_subscribed": true,
      "last_login": "2024-01-15T10:30:00Z",
      "date_joined": "2024-01-01T00:00:00Z",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-10T12:00:00Z"
    }
  ]
}
```

---

### 8. **Get User Details** (Admin)
**GET** `/api/users/manage/{user_id}/`

**Requires Admin Role**

---

### 9. **Update User** (Admin)
**PUT/PATCH** `/api/users/manage/{user_id}/`

**Requires Admin Role**

---

### 10. **Delete User** (Admin)
**DELETE** `/api/users/manage/{user_id}/`

**Requires Admin Role**

---

### 11. **Promote User to Admin**
**POST** `/api/users/manage/{user_id}/promote_to_admin/`

**Requires Admin Role**

**Response:**
```json
{
  "message": "john_doe promoted to admin"
}
```

---

### 12. **Demote Admin to User**
**POST** `/api/users/manage/{user_id}/demote_to_user/`

**Requires Admin Role**

**Response:**
```json
{
  "message": "john_doe demoted to user"
}
```

---

### 13. **List All Admins**
**GET** `/api/users/manage/admins/`

**Requires Admin Role**

**Response:** List of users with role='ADMIN'

---

### 14. **List All Customers**
**GET** `/api/users/manage/customers/`

**Requires Admin Role**

**Response:** List of users with role='USER'

---

## User Model Fields

### Basic Information
- `id` - Unique identifier
- `username` - Unique username (required)
- `email` - Email address (required, unique)
- `first_name` - First name
- `last_name` - Last name
- `password` - Hashed password

### Role & Permissions
- `role` - User role: `USER` or `ADMIN` (default: `USER`)
- `is_active` - Account status (default: `True`)
- `is_staff` - Staff status (auto-set for admins)
- `is_superuser` - Superuser status

### Contact Information
- `phone_number` - Phone number with validation
- `profile_picture` - URL to profile picture

### Address
- `address_line1` - Primary address
- `address_line2` - Secondary address (apartment, suite, etc.)
- `city` - City
- `state` - State/Province
- `postal_code` - ZIP/Postal code
- `country` - Country (default: 'USA')

### Additional
- `date_of_birth` - Date of birth
- `newsletter_subscribed` - Newsletter subscription status
- `last_login` - Last login timestamp
- `date_joined` - Account creation date
- `created_at` - Record creation timestamp
- `updated_at` - Record update timestamp

---

## Frontend Integration

### Store Token
After successful login/registration, store the token:

```typescript
// In localStorage or secure cookie
localStorage.setItem('authToken', response.token);
localStorage.setItem('user', JSON.stringify(response.user));
```

### Send Token with Requests
Include token in headers for authenticated requests:

```typescript
const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Token ${localStorage.getItem('authToken')}`
};

fetch(`${API_URL}/api/users/profile/`, { headers });
```

### Check User Role
```typescript
const user = JSON.parse(localStorage.getItem('user'));
const isAdmin = user.role === 'ADMIN';

// Conditionally render admin features
if (isAdmin) {
  // Show admin panel link
}
```

### Example: Login Component
```typescript
const login = async (username: string, password: string) => {
  const response = await fetch(`${API_URL}/api/users/login/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  
  const data = await response.json();
  
  if (response.ok) {
    localStorage.setItem('authToken', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    
    // Redirect based on role
    if (data.user.role === 'ADMIN') {
      router.push('/admin');
    } else {
      router.push('/products');
    }
  }
};
```

---

## Setup Instructions

### 1. Delete Existing Database (if needed)
```bash
del db.sqlite3
rd /s /q users\migrations
rd /s /q products\migrations
rd /s /q cart\migrations
```

### 2. Create Migrations
```bash
python manage.py makemigrations
python manage.py migrate
```

### 3. Create First Admin User
```bash
python manage.py createsuperuser
```

When prompted, provide:
- Username
- Email
- Password

Then in Django shell or admin panel, set `role='ADMIN'` and `is_staff=True`.

Or use the admin panel after login to promote users.

---

## Admin Panel Access

### URL
`http://localhost:8000/admin/`

### Features
- View and manage all users
- Filter by role, active status, staff status
- Search by username, email, phone
- Bulk actions: promote to admin, demote to user, activate/deactivate
- Edit user profiles and permissions

---

## Security Notes

1. **Always use HTTPS in production**
2. **Token Authentication**: Tokens are stored in database and linked to users
3. **Password Validation**: Django's built-in validators ensure strong passwords
4. **Role-Based Access**: Endpoints check user roles before allowing access
5. **Session Security**: Sessions expire after 2 weeks of inactivity

---

## Troubleshooting

### "Custom User Model" Error
If you see errors about custom user model:
1. Delete `db.sqlite3`
2. Delete all migration files except `__init__.py`
3. Run `makemigrations` and `migrate` again

### Token Not Working
- Make sure token is sent in header: `Authorization: Token <token>`
- Check that `rest_framework.authtoken` is in `INSTALLED_APPS`
- Run `python manage.py migrate` to create token tables

---

## Testing the API

### Using curl

**Register:**
```bash
curl -X POST http://localhost:8000/api/users/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "TestPass123!",
    "password_confirm": "TestPass123!",
    "first_name": "Test",
    "last_name": "User"
  }'
```

**Login:**
```bash
curl -X POST http://localhost:8000/api/users/login/ \
  -H "Content-Type: application/json" \
  -d '{"username": "testuser", "password": "TestPass123!"}'
```

**Get Profile:**
```bash
curl http://localhost:8000/api/users/profile/ \
  -H "Authorization: Token <your_token>"
```

---

For more details, see the main `API_DOCUMENTATION.md` file.
