# Electric Store Management System - Complete API Documentation

## Overview
This document provides a comprehensive overview of all API endpoints for the Electric Store Management System.

---

## Authentication Endpoints

### Base URL: `/api/users/`

#### User Registration & Login
- `POST /api/users/send-otp/` - Send OTP to email
- `POST /api/users/register/` - Register new user with OTP verification
- `POST /api/users/login/` - Login with email and OTP
- `POST /api/users/logout/` - Logout user

#### User Profile
- `GET /api/users/profile/` - Get current user profile
- `PUT /api/users/profile/` - Update user profile
- `PATCH /api/users/profile/` - Partial update user profile

#### Admin User Management
- `GET /api/users/users/` - List all users (Admin only)
- `GET /api/users/users/{id}/` - Get user details (Admin only)
- `PUT /api/users/users/{id}/` - Update user (Admin only)
- `DELETE /api/users/users/{id}/` - Delete user (Admin only)
- `POST /api/users/users/{id}/toggle-active/` - Enable/disable user (Admin only)

---

## Product Endpoints

### Base URL: `/api/products/`

#### Products
- `GET /api/products/` - List all products (with filters, search, pagination)
  - Query params: `category`, `brand`, `search`, `ordering`
- `GET /api/products/{id}/` - Get product details
- `POST /api/products/` - Create product (Admin only)
- `PUT /api/products/{id}/` - Update product (Admin only)
- `PATCH /api/products/{id}/` - Partial update product (Admin only)
- `DELETE /api/products/{id}/` - Delete product (Admin only)
- `GET /api/products/{id}/variants/` - Get all variants for a product

#### Product Variants
- `GET /api/products/variants/` - List all product variants
- `GET /api/products/variants/{id}/` - Get variant details
- `POST /api/products/variants/` - Create variant (Admin only)
- `PUT /api/products/variants/{id}/` - Update variant (Admin only)
- `DELETE /api/products/variants/{id}/` - Delete variant (Admin only)
- `GET /api/products/variants/{id}/check_stock/` - Check stock availability

#### Categories
- `GET /api/products/categories/` - List all categories
- `GET /api/products/categories/{id}/` - Get category details
- `POST /api/products/categories/` - Create category (Admin only)
- `PUT /api/products/categories/{id}/` - Update category (Admin only)
- `DELETE /api/products/categories/{id}/` - Delete category (Admin only)

#### Brands
- `GET /api/products/brands/` - List all brands
- `GET /api/products/brands/{id}/` - Get brand details
- `POST /api/products/brands/` - Create brand (Admin only)
- `PUT /api/products/brands/{id}/` - Update brand (Admin only)
- `DELETE /api/products/brands/{id}/` - Delete brand (Admin only)

---

## Shopping Cart Endpoints

### Base URL: `/api/cart/`

- `GET /api/cart/` - Get current user's cart
- `POST /api/cart/add_item/` - Add item to cart
  ```json
  {
    "product_id": "iphone-15-pro",
    "variant_id": "iphone-15-pro-256gb-blue",
    "quantity": 1
  }
  ```
- `PATCH /api/cart/update_item/` - Update cart item quantity
- `DELETE /api/cart/remove_item/?product_id=xxx&variant_id=xxx` - Remove item from cart
- `POST /api/cart/clear/` - Clear all items from cart
- `GET /api/cart/summary/` - Get cart summary (totals)

---

## Order Endpoints

### Base URL: `/api/orders/`

#### Orders
- `GET /api/orders/orders/` - List user's orders
- `GET /api/orders/orders/{id}/` - Get order details
- `POST /api/orders/orders/` - Create order from cart
  ```json
  {
    "shipping_name": "John Doe",
    "shipping_email": "john@example.com",
    "shipping_phone": "+1234567890",
    "shipping_address_line1": "123 Main St",
    "shipping_city": "New York",
    "shipping_state": "NY",
    "shipping_postal_code": "10001",
    "payment_method": "CREDIT_CARD",
    "customer_notes": "Please ring doorbell"
  }
  ```
- `PATCH /api/orders/orders/{id}/update_status/` - Update order status (Admin only)
- `POST /api/orders/orders/{id}/cancel/` - Cancel order
- `GET /api/orders/orders/statistics/` - Get user order statistics

#### Favorites/Wishlist
- `GET /api/orders/favorites/` - List user's favorite products
- `POST /api/orders/favorites/` - Add product to favorites
  ```json
  {
    "product_id": "iphone-15-pro"
  }
  ```
- `DELETE /api/orders/favorites/remove/?product_id=xxx` - Remove from favorites
- `GET /api/orders/favorites/check/?product_id=xxx` - Check if product is in favorites

---

## Inventory Endpoints

### Base URL: `/api/inventory/`

#### Warehouses
- `GET /api/inventory/warehouses/` - List all warehouses (Admin only)
- `GET /api/inventory/warehouses/{id}/` - Get warehouse details (Admin only)
- `POST /api/inventory/warehouses/` - Create warehouse (Admin only)
- `PUT /api/inventory/warehouses/{id}/` - Update warehouse (Admin only)
- `DELETE /api/inventory/warehouses/{id}/` - Delete warehouse (Admin only)
- `GET /api/inventory/warehouses/{id}/stock_levels/` - Get stock levels for warehouse
- `GET /api/inventory/warehouses/{id}/low_stock_alerts/` - Get low stock alerts

#### Suppliers
- `GET /api/inventory/suppliers/` - List all suppliers (Admin only)
- `GET /api/inventory/suppliers/{id}/` - Get supplier details (Admin only)
- `POST /api/inventory/suppliers/` - Create supplier (Admin only)
- `PUT /api/inventory/suppliers/{id}/` - Update supplier (Admin only)
- `DELETE /api/inventory/suppliers/{id}/` - Delete supplier (Admin only)

#### Stock Management
- `GET /api/inventory/stock/` - List all stock records (Admin only)
- `GET /api/inventory/stock/{id}/` - Get stock details (Admin only)
- `POST /api/inventory/stock/` - Create stock record (Admin only)
- `PUT /api/inventory/stock/{id}/` - Update stock (Admin only)
- `GET /api/inventory/stock/low_stock/` - Get all low stock items
- `GET /api/inventory/stock/out_of_stock/` - Get all out of stock items
- `POST /api/inventory/stock/{id}/adjust/` - Adjust stock quantity manually
  ```json
  {
    "adjustment": 10,
    "reason": "Physical inventory count correction"
  }
  ```
- `POST /api/inventory/stock/{id}/transfer/` - Transfer stock between warehouses
  ```json
  {
    "target_warehouse_id": 2,
    "quantity": 50
  }
  ```

#### Stock Movements
- `GET /api/inventory/stock-movements/` - List all stock movements (Admin only)
- `GET /api/inventory/stock-movements/{id}/` - Get movement details (Admin only)

#### Stock Imports
- `GET /api/inventory/stock-imports/` - List all stock imports (Admin only)
- `GET /api/inventory/stock-imports/{id}/` - Get import details (Admin only)
- `POST /api/inventory/stock-imports/` - Create stock import (Admin only)
  ```json
  {
    "warehouse_id": 1,
    "supplier_id": 1,
    "order_date": "2025-01-15",
    "expected_date": "2025-01-20",
    "notes": "Quarterly restock",
    "items": [
      {
        "variant_id": "iphone-15-pro-256gb-blue",
        "quantity_ordered": 100,
        "unit_cost": 800.00
      }
    ]
  }
  ```
- `POST /api/inventory/stock-imports/{id}/receive/` - Mark stock as received
  ```json
  {
    "items": [
      {
        "item_id": 1,
        "quantity_received": 100
      }
    ]
  }
  ```

#### Stock Alerts
- `GET /api/inventory/stock-alerts/` - List all stock alerts (Admin only)
- `GET /api/inventory/stock-alerts/unresolved/` - Get unresolved alerts
- `POST /api/inventory/stock-alerts/{id}/resolve/` - Mark alert as resolved

---

## Reports & Analytics Endpoints

### Base URL: `/api/reports/`

#### Sales Reports
- `GET /api/reports/sales-reports/` - List all sales reports (Admin only)
- `GET /api/reports/sales-reports/{id}/` - Get report details (Admin only)
- `GET /api/reports/sales-reports/generate/` - Generate sales report (Admin only)
  - Query params: `report_type` (DAILY/WEEKLY/MONTHLY/YEARLY), `start_date`, `end_date`
- `GET /api/reports/sales-reports/dashboard_summary/` - Get dashboard summary

#### Product Performance
- `GET /api/reports/product-performance/` - List product performance data (Admin only)
- `GET /api/reports/product-performance/top_sellers/` - Get top selling products
  - Query params: `period_type`, `limit`
- `GET /api/reports/product-performance/low_sellers/` - Get low selling products
  - Query params: `period_type`, `limit`

#### Product Trends
- `GET /api/reports/product-trends/` - List product trends (Admin only)
- `GET /api/reports/product-trends/by_product/` - Get trends for specific product
  - Query params: `product_id`, `years` (default: 3)
- `GET /api/reports/product-trends/seasonal_products/` - Get seasonal products

#### Product Relations
- `GET /api/reports/product-relations/` - List product relations
- `GET /api/reports/product-relations/recommendations/` - Get product recommendations
  - Query params: `product_id`, `limit`

#### Customer Segments
- `GET /api/reports/customer-segments/` - List customer segments (Admin only)
- `GET /api/reports/customer-segments/distribution/` - Get segment distribution

#### General Analytics
- `GET /api/reports/analytics/overview/` - Get overall business analytics (Admin only)

---

## Query Parameters

### Filtering
Most list endpoints support filtering:
- `?category=1` - Filter by category ID
- `?brand=2` - Filter by brand ID
- `?is_active=true` - Filter by active status

### Search
- `?search=iphone` - Search by keyword

### Ordering
- `?ordering=name` - Order by field (ascending)
- `?ordering=-created_at` - Order by field (descending)

### Pagination
- `?page=1&page_size=20` - Paginate results

---

## Authentication

All endpoints (except login/register) require authentication using Token Auth:

```
Authorization: Token <your_auth_token>
```

---

## Error Responses

Standard error format:
```json
{
  "error": "Error message description"
}
```

HTTP Status Codes:
- `200 OK` - Success
- `201 Created` - Resource created
- `400 Bad Request` - Invalid request data
- `401 Unauthorized` - Authentication required
- `403 Forbidden` - Permission denied
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

---

## Features Implemented

### ✅ User Management
- OTP-based email authentication
- User and Admin roles
- Profile management
- Admin user management

### ✅ Product Management
- Full CRUD for products, variants, categories, brands
- Product reviews and ratings
- Promotions and bulk pricing rules
- Product filtering, search, and sorting

### ✅ Shopping Cart & Checkout
- Session-based and user-based carts
- Real-time stock validation
- Add/update/remove cart items

### ✅ Order Management
- Order creation from cart
- Order status tracking
- Order history
- Order cancellation

### ✅ Favorites/Wishlist
- Add/remove products to favorites
- View all favorites

### ✅ Inventory Management
- Multi-warehouse support
- Stock tracking and alerts
- Stock imports from suppliers
- Stock movements (imports, sales, transfers, adjustments)
- Low stock and out-of-stock alerts

### ✅ Reports & Analytics
- Sales reports (daily, weekly, monthly, yearly)
- Product performance tracking
- Product trend analysis (3+ years)
- Product relations (frequently bought together)
- Customer segmentation
- Dashboard analytics

---

## Next Steps

1. **Run Migrations**:
   ```bash
   python manage.py migrate
   ```

2. **Create Superuser**:
   ```bash
   python manage.py createsuperuser
   ```

3. **Test the APIs** using:
   - Django Admin: http://localhost:8000/admin/
   - API endpoints: http://localhost:8000/api/

4. **Configure MySQL** (if needed):
   - Update `DATABASES` in `core/settings.py`
   - Install: `pip install mysqlclient`

5. **Configure Email for OTP**:
   - Update `EMAIL_*` settings in `core/settings.py` for production
   - Currently uses console backend for development

---

## Notes

- All timestamps are in UTC
- All prices are in decimal format (2 decimal places)
- Stock quantities cannot be negative
- OTP expires after 10 minutes
- Admin permissions required for inventory and report endpoints
