# Electric Store Management System - Production Setup Guide

## ✅ What's Been Implemented

### 1. Backend Features

#### Authentication & Users
- ✅ Email + OTP authentication (10-minute expiry)
- ✅ Two roles: Admin and Customer
- ✅ Token-based authentication
- ✅ Protected endpoints with role-based access

#### Product Management
- ✅ Full CRUD for products and variants
- ✅ Category and brand management
- ✅ **NEW: Product recommendations (frequently bought together)**
- ✅ **NEW: Trending products analysis**
- ✅ **NEW: Top/low selling products**
- ✅ Filtering, search, and sorting
- ✅ **NEW: Pricing rules (bulk discounts, promotions, bundles)**

#### Shopping Cart & Orders
- ✅ Session and user-based cart
- ✅ Real-time stock validation
- ✅ Order creation and management
- ✅ Order status tracking
- ✅ **NEW: Payment processing (Stripe integration)**
- ✅ **NEW: Refund processing**

#### Stock Management
- ✅ Warehouse/branch management
- ✅ Supplier tracking
- ✅ Stock levels per warehouse
- ✅ **NEW: Automated low-stock alerts (email notifications)**
- ✅ **NEW: Stock alert system with auto-resolution**

#### Reporting & Analytics
- ✅ **NEW: Daily sales reports** (revenue, orders, customers, payment methods, top products)
- ✅ **NEW: Weekly reports** (7-day trends, WoW comparison, daily breakdown)
- ✅ **NEW: Monthly reports** (weekly breakdown, MoM comparison, category/brand performance)
- ✅ **NEW: Yearly reports** (monthly breakdown, YoY comparison, top products)
- ✅ **NEW: 3-year trend analysis** (seasonality, growth patterns, CAGR)
- ✅ **NEW: Product relations** (frequently bought together)
- ✅ Admin dashboard with statistics

#### User Features
- ✅ User profile management
- ✅ Order history
- ✅ Favorites/wishlist

### 2. Frontend Features
- ✅ Next.js with TypeScript
- ✅ Responsive design (Tailwind CSS + Shadcn UI)
- ✅ Theme toggle (light/dark mode)
- ✅ API client with error handling
- ✅ Auth context (login/register/logout)
- ✅ Product listing with pagination
- ✅ Cart management
- ✅ Admin pages

---

## 🚀 Quick Start

### Backend Setup

1. **Install Dependencies**
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

2. **Configure Environment Variables**
   
   Create/update `backend/.env`:
   ```env
   # Database
   DB_ENGINE=django.db.backends.mysql
   DB_NAME=electric_store
   DB_USER=Rith
   DB_PASSWORD=123456
   DB_HOST=localhost
   DB_PORT=3307
   
   # Django
   SECRET_KEY=your-secret-key-here
   DEBUG=True
   ALLOWED_HOSTS=localhost,127.0.0.1
   
   # CORS (Frontend URL)
   CSRF_TRUSTED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
   
   # Email (Development - Console Backend)
   EMAIL_BACKEND=django.core.mail.backends.console.EmailBackend
   DEFAULT_FROM_EMAIL=noreply@electricstore.com
   
   # For Production SMTP (Gmail example):
   # EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
   # EMAIL_HOST=smtp.gmail.com
   # EMAIL_PORT=587
   # EMAIL_USE_TLS=True
   # EMAIL_HOST_USER=your-email@gmail.com
   # EMAIL_HOST_PASSWORD=your-app-password
   
   # Payment Gateway (Stripe)
   STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
   STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
   STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
   
   # PayPal (Optional)
   PAYPAL_CLIENT_ID=your_paypal_client_id
   PAYPAL_CLIENT_SECRET=your_paypal_secret
   PAYPAL_MODE=sandbox
   ```

3. **Run Migrations**
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```

4. **Create Admin User**
   ```bash
   python manage.py createsuperuser
   # Or create via shell:
   python manage.py shell
   >>> from users.models import User
   >>> admin = User.objects.create_user(email='admin@example.com', password='admin123', role='ADMIN')
   >>> admin.save()
   ```

5. **Start Development Server**
   ```bash
   python manage.py runserver
   ```

### Frontend Setup

1. **Install Dependencies**
   ```bash
   cd Frontend
   pnpm install
   # or: npm install
   ```

2. **Configure Environment**
   
   Create `Frontend/.env.local`:
   ```env
   NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000/api
   
   # Stripe (Frontend Key)
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
   ```

3. **Start Development Server**
   ```bash
   pnpm dev
   # or: npm run dev
   ```

4. **Access the Application**
   - Frontend: http://localhost:3000
   - Backend API: http://127.0.0.1:8000/api
   - Admin Panel: http://127.0.0.1:8000/admin

---

## 💳 Payment Integration Setup

### Stripe Setup (Recommended)

1. **Create Stripe Account**
   - Sign up at https://stripe.com
   - Get test API keys from Dashboard

2. **Configure Backend**
   - Add `STRIPE_SECRET_KEY` to `.env`
   - Backend automatically processes payments via `orders/payment.py`

3. **Configure Frontend**
   - Add `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` to `.env.local`
   - Payment flow: Create order → Get payment intent → Stripe checkout → Confirm payment

4. **API Endpoints**
   - `POST /api/orders/{id}/create_payment_intent/` - Create payment
   - `POST /api/orders/{id}/confirm_payment/` - Confirm payment
   - `POST /api/orders/{id}/refund/` - Process refund (admin)

### PayPal Setup (Optional)

Currently placeholder. To implement:
1. Install: `pip install paypalrestsdk`
2. Update `orders/payment.py` with PayPal SDK
3. Configure credentials in `.env`

---

## 📊 Reporting & Analytics Features

### Available Reports

#### 1. Daily Reports
- **Endpoint**: `GET /api/reports/daily/?date=2024-01-15`
- **Metrics**: Orders, revenue, AOV, customers, payment methods, top products

#### 2. Weekly Reports
- **Endpoint**: `GET /api/reports/weekly/?start_date=2024-01-08`
- **Metrics**: 7-day trends, WoW comparison, daily breakdown

#### 3. Monthly Reports
- **Endpoint**: `GET /api/reports/monthly/?year=2024&month=1`
- **Metrics**: Weekly breakdown, MoM comparison, category/brand performance

#### 4. Yearly Reports
- **Endpoint**: `GET /api/reports/yearly/?year=2024`
- **Metrics**: Monthly breakdown, YoY comparison, annual top products

### Advanced Analytics

#### Product Recommendations
```
GET /api/products/{id}/recommendations/
GET /api/products/{id}/frequently_bought_together/
```

#### Trending Products
```
GET /api/products/trending/?days=30&limit=10
```

#### 3-Year Trend Analysis
```python
from reports.analytics import analyze_three_year_trends
analysis = analyze_three_year_trends(product)
# Returns: yearly performance, seasonal patterns, growth rates, CAGR
```

---

## 🔔 Stock Alert System

### Features
- Automatic monitoring of stock levels
- Email notifications to admins and warehouse managers
- Three alert types:
  - OUT_OF_STOCK (quantity = 0)
  - CRITICAL (≤30% of threshold)
  - LOW_STOCK (≤threshold)
- Auto-resolution when stock restored

### Usage

#### Manual Check (run as cron job)
```python
from inventory.alerts import check_stock_levels
stats = check_stock_levels()
# Returns: {'checked': 500, 'low_stock': 15, 'notifications_sent': 10}
```

#### Auto-resolve Alerts
```python
from inventory.alerts import auto_resolve_alerts
resolved = auto_resolve_alerts()
# Returns: number of alerts auto-resolved
```

### Recommended: Setup Cron Job
```bash
# Check stock every hour
0 * * * * cd /path/to/backend && python manage.py shell -c "from inventory.alerts import check_stock_levels; check_stock_levels()"
```

---

## 🎯 Pricing Rules & Promotions

### Features
- Bulk/volume discounts (buy 10+ get 20% off)
- Time-limited promotions
- Percentage or fixed amount discounts
- Category or product-specific rules
- Priority-based rule application

### Example Usage

```python
from products.models import PricingRule, Category

# Create bulk discount
rule = PricingRule.objects.create(
    name="Bulk Discount - 20% off 10+ units",
    rule_type='BULK',
    parameters={
        "tiers": [
            {"min_qty": 10, "discount_pct": 20},
            {"min_qty": 20, "discount_pct": 30}
        ]
    },
    is_active=True
)

# Apply to all products in category
category = Category.objects.get(name="Smartphones")
rule.categories.add(category)
```

### API Integration
```python
from products.pricing import get_effective_price

# Get price with discounts applied
effective_price = get_effective_price(product, variant, quantity=15)
```

---

## 🏢 Multi-Warehouse Support

### Features
- Multiple warehouse/branch locations
- Stock tracking per warehouse
- Warehouse-specific reporting
- Manager contact information

### API Endpoints
```
GET /api/inventory/warehouses/
POST /api/inventory/warehouses/
GET /api/inventory/stocks/?warehouse=1
```

---

## 🔒 Security Best Practices

### For Production Deployment

1. **Environment Variables**
   - ✅ Never commit `.env` files
   - ✅ Use strong `SECRET_KEY`
   - ✅ Set `DEBUG=False`
   - ✅ Restrict `ALLOWED_HOSTS`

2. **Database**
   - ✅ Use strong passwords
   - ✅ Use non-default ports
   - ✅ Enable SSL connections

3. **HTTPS**
   - ⚠️ **Required**: Force HTTPS in production
   - Update `settings.py`:
     ```python
     if not DEBUG:
         SECURE_SSL_REDIRECT = True
         SESSION_COOKIE_SECURE = True
         CSRF_COOKIE_SECURE = True
     ```

4. **CORS**
   - ✅ Restrict to your frontend domain
   - Update `CORS_ALLOWED_ORIGINS` in settings

5. **Rate Limiting**
   - ⚠️ Add rate limiting for OTP endpoints
   - Consider: `django-ratelimit` package

6. **Payment Security**
   - ✅ Never expose secret keys in frontend
   - ✅ PCI-DSS compliance (Stripe handles this)
   - ✅ Use webhook signatures for payment confirmation

---

## 📦 Production Deployment

### Backend (Django)

1. **Install Production Server**
   ```bash
   pip install gunicorn
   ```

2. **Collect Static Files**
   ```bash
   python manage.py collectstatic --noinput
   ```

3. **Run with Gunicorn**
   ```bash
   gunicorn core.wsgi:application --bind 0.0.0.0:8000 --workers 4
   ```

4. **Process Manager (Systemd)**
   ```ini
   [Unit]
   Description=Electric Store Backend
   After=network.target
   
   [Service]
   User=www-data
   WorkingDirectory=/path/to/backend
   ExecStart=/path/to/venv/bin/gunicorn core.wsgi:application --bind 0.0.0.0:8000
   
   [Install]
   WantedBy=multi-user.target
   ```

### Frontend (Next.js)

1. **Build**
   ```bash
   pnpm build
   ```

2. **Start Production Server**
   ```bash
   pnpm start
   ```

3. **Deploy Options**
   - Vercel (recommended for Next.js)
   - Netlify
   - AWS/DigitalOcean with PM2

---

## 🧪 Testing

### Backend Tests
```bash
cd backend
python manage.py test
```

### Frontend Tests
```bash
cd Frontend
pnpm test
```

---

## 📝 API Documentation

### Key Endpoints

#### Authentication
- `POST /api/users/send-otp/` - Send OTP to email
- `POST /api/users/register/` - Register with OTP
- `POST /api/users/login/` - Login (email + password or OTP)
- `GET /api/users/profile/` - Get user profile

#### Products
- `GET /api/products/` - List products (with filters)
- `GET /api/products/{id}/` - Product details
- `GET /api/products/{id}/recommendations/` - Recommendations
- `GET /api/products/{id}/frequently_bought_together/` - Relations
- `GET /api/products/trending/` - Trending products

#### Cart
- `GET /api/cart/` - Get cart
- `POST /api/cart/add-item/` - Add to cart
- `PATCH /api/cart/update-item/{id}/` - Update quantity
- `DELETE /api/cart/remove-item/{id}/` - Remove item

#### Orders
- `GET /api/orders/` - List orders
- `POST /api/orders/` - Create order
- `POST /api/orders/{id}/create_payment_intent/` - Initialize payment
- `POST /api/orders/{id}/confirm_payment/` - Confirm payment
- `POST /api/orders/{id}/cancel/` - Cancel order

#### Reports (Admin)
- `GET /api/reports/daily/` - Daily report
- `GET /api/reports/weekly/` - Weekly report
- `GET /api/reports/monthly/` - Monthly report
- `GET /api/reports/yearly/` - Yearly report

---

## 🛠️ Maintenance Tasks

### Daily
- ✅ Monitor stock alerts
- ✅ Check pending orders
- ✅ Review payment transactions

### Weekly
- ✅ Generate weekly reports
- ✅ Analyze trending products
- ✅ Review low-stock items

### Monthly
- ✅ Generate monthly reports
- ✅ Analyze 3-year trends
- ✅ Customer segmentation analysis
- ✅ Update pricing rules/promotions

### Database Backup
```bash
# MySQL backup
mysqldump -u Rith -p electric_store > backup_$(date +%Y%m%d).sql
```

---

## 🐛 Troubleshooting

### Common Issues

#### 1. Black Screen / Theme Issues
- ✅ Fixed: Added ThemeToggle component
- Theme persists in localStorage
- Force light theme: Remove `theme` from localStorage

#### 2. MySQL Connection
- Check port (3307)
- Verify credentials in `.env`
- Ensure MySQL service running

#### 3. OTP Not Working
- Check `EMAIL_BACKEND` in settings
- In development, OTP appears in console
- For production, configure SMTP

#### 4. Payment Failures
- Verify Stripe keys in `.env`
- Check Stripe dashboard for errors
- Test with Stripe test cards: 4242 4242 4242 4242

#### 5. Stock Alerts Not Sending
- Check email configuration
- Ensure cron job running
- Check alert logs: `python manage.py shell`

---

## 📞 Support & Documentation

- **Backend API**: http://127.0.0.1:8000/api
- **Admin Panel**: http://127.0.0.1:8000/admin
- **Frontend**: http://localhost:3000

### Useful Commands

```bash
# Create sample data
python manage.py shell
>>> from products.models import Category, Brand
>>> Category.objects.create(name="Smartphones")

# Check migrations
python manage.py showmigrations

# Clear cache
python manage.py clear_cache

# Run stock checks
python manage.py shell -c "from inventory.alerts import check_stock_levels; check_stock_levels()"
```

---

## ✨ Next Steps for Full Production

1. ⚠️ **Add Error Boundaries** (frontend)
2. ⚠️ **Implement rate limiting** (OTP endpoints)
3. ⚠️ **Add Celery** for background tasks (stock alerts, report generation)
4. ⚠️ **Setup Redis** for caching and sessions
5. ⚠️ **Add comprehensive logging** (Sentry integration)
6. ⚠️ **Performance optimization** (database indexing, query optimization)
7. ⚠️ **Mobile app** (React Native or Flutter)
8. ⚠️ **Real-time notifications** (WebSockets)
9. ⚠️ **Advanced search** (Elasticsearch)
10. ⚠️ **Automated testing** (CI/CD pipeline)

---

## 📄 License

MIT License - See LICENSE file for details

---

**Version**: 2.0
**Last Updated**: January 2025
**Status**: Production-Ready (with recommended enhancements noted above)
