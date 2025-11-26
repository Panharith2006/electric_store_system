# Quick Setup Guide

## Backend Setup

### 1. Navigate to backend directory
```bash
cd backend
```

### 2. Install dependencies
```bash
pip install djangorestframework django-filter django-cors-headers
```

### 3. Run migrations
```bash
python manage.py makemigrations
python manage.py migrate
```

### 4. Create superuser (for admin access)
```bash
python manage.py createsuperuser
```

### 5. Start the development server
```bash
python manage.py runserver
```

The backend will be available at: `http://localhost:8000`

### 6. Access Admin Panel
- URL: `http://localhost:8000/admin/`
- Login with the superuser credentials you created

---

## API Endpoints Available

### Products
- `GET /api/products/products/` - List all products
- `GET /api/products/products/{id}/` - Get product details
- `GET /api/products/products/{id}/variants/` - Get product variants
- `GET /api/products/categories/` - List all categories
- `GET /api/products/brands/` - List all brands
- `GET /api/products/variants/{id}/check_stock/` - Check variant stock

### Cart
- `GET /api/cart/` - Get current cart
- `POST /api/cart/add_item/` - Add item to cart
- `PATCH /api/cart/update_item/` - Update cart item quantity
- `DELETE /api/cart/remove_item/` - Remove item from cart
- `POST /api/cart/clear/` - Clear cart
- `GET /api/cart/summary/` - Get cart summary

---

## Frontend Setup

### 1. Navigate to frontend directory
```bash
cd Frontend
```

### 2. Create environment file
Create a file named `.env.local` with:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### 3. Install dependencies (if not already done)
```bash
pnpm install
```

### 4. Update the cart hook to use the backend API

In `Frontend/hooks/use-cart.ts`, you'll need to replace the local Zustand store with API calls to the backend. Here's a simplified example:

```typescript
// Example: Fetching cart from backend
const fetchCart = async () => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/cart/`,
    {
      credentials: 'include'
    }
  );
  const data = await response.json();
  return data.results?.[0] || data;
};

// Example: Adding to cart
const addToCart = async (productId: string, variantId: string, quantity: number) => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/cart/add_item/`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ product_id: productId, variant_id: variantId, quantity })
    }
  );
  return await response.json();
};
```

### 5. Start the development server
```bash
pnpm dev
```

The frontend will be available at: `http://localhost:3000`

---

## What Was Implemented

### ✅ Products App
- **Models:**
  - `Product` - Main product model with all details matching frontend structure
  - `ProductVariant` - Product variants (color + storage combinations)
  - `Category` - Product categories
  - `Brand` - Product brands

- **API Features:**
  - Full CRUD operations for products, variants, categories, brands
  - Filtering by category, brand
  - Search functionality
  - Pagination
  - Product variants listing
  - Stock checking

### ✅ Cart App
- **Models:**
  - `Cart` - User/session cart
  - `CartItem` - Items in cart with cached variant details

- **API Features:**
  - Get/create cart (supports both authenticated users and anonymous sessions)
  - Add items to cart with stock validation
  - Update item quantities
  - Remove items
  - Clear cart
  - Cart summary with totals
  - Automatic variant detail caching for performance

### ✅ Admin Panel
- Full admin interface for managing products, variants, categories, brands
- Cart and cart item management
- Inline editing for product variants
- Search and filtering

### ✅ Configuration
- Django REST Framework configured
- CORS enabled for frontend connection
- Session-based cart for anonymous users
- Pagination configured
- Filter backends set up

---

## Testing the Connection

### 1. Start both servers
- Backend: `python manage.py runserver` (port 8000)
- Frontend: `pnpm dev` (port 3000)

### 2. Add sample data
- Go to `http://localhost:8000/admin/`
- Add categories (e.g., "Smartphones", "Laptops")
- Add brands (e.g., "Apple", "Samsung")
- Add products with variants

### 3. Test API endpoints
- Visit `http://localhost:8000/api/products/products/` in browser
- You should see the browsable API with your products

### 4. Test from frontend
- Update your frontend hooks to call the backend APIs
- Test adding products to cart
- Check cart persistence

---

## Next Steps

1. **Populate Database:**
   - Use admin panel to add products, or
   - Create a data migration/script to import products from your frontend data

2. **Update Frontend Hooks:**
   - Modify `use-cart.ts` to call backend APIs instead of local storage
   - Modify `use-products.ts` to fetch from backend

3. **Implement Authentication:**
   - Add user authentication for cart persistence
   - Implement JWT or session-based auth

4. **Deploy:**
   - Deploy backend (Render, Railway, etc.)
   - Deploy frontend (Vercel, Netlify)
   - Update API URLs in production

---

## Troubleshooting

### "No module named 'rest_framework'"
```bash
pip install djangorestframework
```

### "No module named 'django_filters'"
```bash
pip install django-filter
```

### CORS errors in frontend
- Make sure `corsheaders` is installed
- Check `CORS_ALLOW_ALL_ORIGINS = True` in settings.py
- Ensure `credentials: 'include'` in frontend fetch calls

### Cart not persisting
- Check that `credentials: 'include'` is set in all fetch requests
- Verify session middleware is enabled in Django

---

## File Structure Created

```
backend/
├── products/
│   ├── models.py          ✅ Product, ProductVariant, Category, Brand
│   ├── serializers.py     ✅ API serializers
│   ├── views.py           ✅ ViewSets and endpoints
│   ├── urls.py            ✅ URL routing
│   └── admin.py           ✅ Admin configuration
├── cart/
│   ├── models.py          ✅ Cart, CartItem
│   ├── serializers.py     ✅ API serializers
│   ├── views.py           ✅ Cart operations
│   ├── urls.py            ✅ URL routing
│   └── admin.py           ✅ Admin configuration
├── core/
│   ├── settings.py        ✅ Updated with new apps and configs
│   └── urls.py            ✅ Main URL configuration
└── API_DOCUMENTATION.md   ✅ Complete API docs
```

---

For detailed API documentation, see `API_DOCUMENTATION.md`
