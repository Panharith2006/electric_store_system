# Electric Store Management System - Backend API Documentation

## Overview
This document provides comprehensive documentation for the Products and Cart APIs that connect the Django backend with the Next.js frontend.

## Base URL
```
http://localhost:8000
```

## Setup Instructions

### 1. Install Dependencies
```bash
cd backend
pip install djangorestframework django-filter django-cors-headers
```

### 2. Run Migrations
```bash
python manage.py makemigrations
python manage.py migrate
```

### 3. Create Superuser (for Admin Panel)
```bash
python manage.py createsuperuser
```

### 4. Run Development Server
```bash
python manage.py runserver
```

---

## Products API

### Base Endpoint: `/api/products/`

### 1. Get All Products
**GET** `/api/products/products/`

**Query Parameters:**
- `category`: Filter by category ID
- `brand`: Filter by brand ID
- `search`: Search in name, description, brand, category
- `ordering`: Sort by field (e.g., `name`, `-created_at`, `base_price`)
- `page`: Page number for pagination

**Response:**
```json
{
  "count": 100,
  "next": "http://localhost:8000/api/products/products/?page=2",
  "previous": null,
  "results": [
    {
      "id": "iphone-15-pro-max",
      "name": "iPhone 15 Pro Max",
      "brand_name": "Apple",
      "category_name": "Smartphones",
      "base_price": "1199.00",
      "image": "/iphone-15-pro-max-titanium.png",
      "variant_count": 8,
      "min_price": "1199.00",
      "max_price": "1599.00",
      "is_active": true
    }
  ]
}
```

### 2. Get Product Details
**GET** `/api/products/products/{product_id}/`

**Response:**
```json
{
  "id": "iphone-15-pro-max",
  "name": "iPhone 15 Pro Max",
  "brand": 1,
  "brand_name": "Apple",
  "category": 1,
  "category_name": "Smartphones",
  "base_price": "1199.00",
  "image": "/iphone-15-pro-max-titanium.png",
  "images": [
    "/iphone-15-pro-max-natural-titanium.png",
    "/iPhone_15_Pro_Blue_Titanium.webp"
  ],
  "description": "The ultimate iPhone...",
  "specs": {
    "Display": "6.7-inch Super Retina XDR",
    "Processor": "A17 Pro chip",
    "Camera": "48MP Main + 12MP Ultra Wide"
  },
  "features": [
    "Titanium design",
    "Action button",
    "USB-C connector"
  ],
  "gifts": ["Free AirTag", "Apple Care+ Trial"],
  "related_products": ["iphone-15-pro", "airpods-pro"],
  "variants": [
    {
      "id": "iphone-15-pro-max-256gb-blue",
      "storage": "256GB",
      "color": "Blue Titanium",
      "price": "1199.00",
      "original_price": "1299.00",
      "stock": 50,
      "images": ["/iphone-blue-1.png", "/iphone-blue-2.png"],
      "is_active": true
    }
  ],
  "is_active": true,
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

### 3. Get Product Variants
**GET** `/api/products/products/{product_id}/variants/`

**Response:**
```json
[
  {
    "id": "iphone-15-pro-max-256gb-blue",
    "storage": "256GB",
    "color": "Blue Titanium",
    "price": "1199.00",
    "original_price": null,
    "stock": 50,
    "images": ["/iphone-blue-1.png"],
    "is_active": true
  }
]
```

### 4. Get All Categories
**GET** `/api/products/categories/`

**Response:**
```json
[
  {
    "id": 1,
    "name": "Smartphones",
    "description": "Latest smartphones",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
]
```

### 5. Get All Brands
**GET** `/api/products/brands/`

**Response:**
```json
[
  {
    "id": 1,
    "name": "Apple",
    "description": "Apple Inc.",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
]
```

### 6. Check Variant Stock
**GET** `/api/products/variants/{variant_id}/check_stock/`

**Response:**
```json
{
  "variant_id": "iphone-15-pro-max-256gb-blue",
  "stock": 50,
  "available": true
}
```

---

## Cart API

### Base Endpoint: `/api/cart/`

### 1. Get Current Cart
**GET** `/api/cart/`

**Description:** Returns the cart for the current user (authenticated) or session (anonymous).

**Response:**
```json
{
  "id": 1,
  "user": 1,
  "session_key": null,
  "items": [
    {
      "id": 1,
      "product": {
        "id": "iphone-15-pro-max",
        "name": "iPhone 15 Pro Max",
        "brand_name": "Apple",
        "category_name": "Smartphones",
        "base_price": "1199.00",
        "image": "/iphone-15-pro-max-titanium.png"
      },
      "variant": {
        "id": "iphone-15-pro-max-256gb-blue",
        "storage": "256GB",
        "color": "Blue Titanium",
        "price": "1199.00",
        "stock": 50
      },
      "quantity": 2,
      "price": "1199.00",
      "storage": "256GB",
      "color": "Blue Titanium",
      "image": "/iphone-blue-1.png",
      "total_price": "2398.00",
      "selected_variant": {
        "id": "iphone-15-pro-max-256gb-blue",
        "storage": "256GB",
        "color": "Blue Titanium",
        "price": 1199.00,
        "image": "/iphone-blue-1.png"
      }
    }
  ],
  "total_items": 2,
  "total_price": "2398.00",
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

### 2. Add Item to Cart
**POST** `/api/cart/add_item/`

**Request Body:**
```json
{
  "product_id": "iphone-15-pro-max",
  "variant_id": "iphone-15-pro-max-256gb-blue",
  "quantity": 1
}
```

**Response:** Same as Get Current Cart

**Error Responses:**
- 400: Product/variant not found or out of stock
- 404: Invalid product/variant ID

### 3. Update Cart Item Quantity
**PATCH** `/api/cart/update_item/`

**Request Body:**
```json
{
  "product_id": "iphone-15-pro-max",
  "variant_id": "iphone-15-pro-max-256gb-blue",
  "quantity": 3
}
```

**Note:** Set `quantity: 0` to remove the item.

**Response:** Same as Get Current Cart

### 4. Remove Item from Cart
**DELETE** `/api/cart/remove_item/?product_id={product_id}&variant_id={variant_id}`

**Query Parameters:**
- `product_id`: Product ID to remove
- `variant_id`: Variant ID to remove

**Response:** Same as Get Current Cart

### 5. Clear Cart
**POST** `/api/cart/clear/`

**Response:** Empty cart
```json
{
  "id": 1,
  "user": 1,
  "session_key": null,
  "items": [],
  "total_items": 0,
  "total_price": "0.00",
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

### 6. Get Cart Summary
**GET** `/api/cart/summary/`

**Response:**
```json
{
  "total_items": 5,
  "total_price": "4999.00",
  "items_count": 3
}
```

---

## Frontend Integration

### Environment Variables
Create `.env.local` in your Next.js frontend:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Example Usage in Next.js

#### Fetch Products
```typescript
const fetchProducts = async () => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/products/products/`
  );
  const data = await response.json();
  return data.results;
};
```

#### Fetch Product Details
```typescript
const fetchProductDetails = async (productId: string) => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/products/products/${productId}/`
  );
  return await response.json();
};
```

#### Add to Cart
```typescript
const addToCart = async (productId: string, variantId: string, quantity: number = 1) => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/cart/add_item/`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Important for session handling
      body: JSON.stringify({
        product_id: productId,
        variant_id: variantId,
        quantity: quantity
      })
    }
  );
  return await response.json();
};
```

#### Get Cart
```typescript
const getCart = async () => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/cart/`,
    {
      credentials: 'include' // Important for session handling
    }
  );
  const data = await response.json();
  return data.results[0]; // Cart is returned as array
};
```

#### Update Cart Item
```typescript
const updateCartItem = async (
  productId: string, 
  variantId: string, 
  quantity: number
) => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/cart/update_item/`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        product_id: productId,
        variant_id: variantId,
        quantity: quantity
      })
    }
  );
  return await response.json();
};
```

---

## Data Models

### Product Model
- `id` (CharField): Unique product identifier (slug)
- `name` (CharField): Product name
- `brand` (ForeignKey): Brand reference
- `category` (ForeignKey): Category reference
- `base_price` (DecimalField): Starting price
- `image` (URLField): Main product image
- `images` (JSONField): Array of image URLs
- `description` (TextField): Product description
- `specs` (JSONField): Key-value specifications
- `features` (JSONField): Array of features
- `gifts` (JSONField): Array of included gifts
- `related_products` (JSONField): Array of related product IDs
- `is_active` (BooleanField): Product visibility

### ProductVariant Model
- `id` (CharField): Unique variant identifier (SKU)
- `product` (ForeignKey): Parent product
- `storage` (CharField): Storage option
- `color` (CharField): Color option
- `price` (DecimalField): Variant price
- `original_price` (DecimalField): Original price (for discounts)
- `stock` (IntegerField): Available quantity
- `images` (JSONField): Variant-specific images
- `is_active` (BooleanField): Variant availability

### Cart Model
- `user` (OneToOneField): User reference (authenticated)
- `session_key` (CharField): Session key (anonymous)
- One cart per user/session

### CartItem Model
- `cart` (ForeignKey): Parent cart
- `product` (ForeignKey): Product reference
- `variant` (ForeignKey): Variant reference
- `quantity` (PositiveIntegerField): Item quantity
- Cached fields: `variant_id`, `storage`, `color`, `price`, `image`

---

## Admin Panel

Access the Django admin panel at: `http://localhost:8000/admin/`

### Features:
- Manage Products, Variants, Categories, and Brands
- View and manage Carts and Cart Items
- Inline editing of product variants
- Bulk actions for products

---

## Testing the API

### Using curl:

#### Get Products
```bash
curl http://localhost:8000/api/products/products/
```

#### Get Product Details
```bash
curl http://localhost:8000/api/products/products/iphone-15-pro-max/
```

#### Add to Cart
```bash
curl -X POST http://localhost:8000/api/cart/add_item/ \
  -H "Content-Type: application/json" \
  -d '{
    "product_id": "iphone-15-pro-max",
    "variant_id": "iphone-15-pro-max-256gb-blue",
    "quantity": 1
  }'
```

#### Get Cart
```bash
curl http://localhost:8000/api/cart/
```

---

## Next Steps

1. **Run Migrations:**
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```

2. **Create Sample Data:**
   - Use Django admin to add categories, brands, products, and variants
   - Or create a data migration script

3. **Test API Endpoints:**
   - Use Postman, curl, or Django REST Framework's browsable API
   - Access: `http://localhost:8000/api/products/products/`

4. **Connect Frontend:**
   - Update `.env.local` in Next.js
   - Update frontend hooks to use the API endpoints
   - Test cart functionality with real backend

5. **Implement Authentication:**
   - Add JWT or session-based authentication
   - Protect user-specific endpoints

---

## Troubleshooting

### CORS Issues
- Make sure `corsheaders` is in `INSTALLED_APPS`
- `CORS_ALLOW_ALL_ORIGINS = True` for development
- For production, set `CORS_ALLOWED_ORIGINS`

### Session Issues
- Frontend must send `credentials: 'include'` in fetch requests
- Backend must have `SESSION_COOKIE_SAMESITE = 'None'` for cross-origin (production)

### Migration Errors
- Delete `db.sqlite3` and migrations if needed
- Run `python manage.py makemigrations` and `migrate` again

---

## Contact
For issues or questions, please refer to the project repository.
