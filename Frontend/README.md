# Electric Store Management System - Frontend

Next.js frontend for the Electric Store Management System.

## Features

- **Product Catalog**: Browse products with filters, search, and categories
- **Shopping Cart**: Add/remove items, quantity management
- **User Authentication**: OTP-based registration and login
- **Order Management**: Place orders, track order history
- **Favorites**: Save favorite products
- **Admin Dashboard**: Product management, stock management, analytics
- **Responsive Design**: Mobile-first, works on all devices
- **Dark Mode**: Built-in theme support

## Tech Stack

- Next.js 14+
- React 18+
- TypeScript
- Tailwind CSS
- Shadcn/ui components
- Zustand (State management)

## Setup Instructions

### 1. Prerequisites

- Node.js 18+
- pnpm (or npm/yarn)
- Backend API running

### 2. Installation

```bash
# Navigate to frontend directory
cd Frontend

# Install dependencies
pnpm install
# or
npm install
```

### 3. Environment Configuration

```bash
# Copy the example env file
cp .env.example .env.local

# Edit .env.local with your API URL
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000/api
```

### 4. Run Development Server

```bash
pnpm dev
# or
npm run dev
```

Application will be available at `http://localhost:3000`

## Project Structure

```
Frontend/
├── app/                    # Next.js app router pages
│   ├── admin/             # Admin dashboard pages
│   ├── cart/              # Shopping cart
│   ├── checkout/          # Checkout process
│   ├── login/             # Login page
│   ├── register/          # Registration page
│   ├── products/          # Product listing and details
│   ├── orders/            # Order history
│   └── profile/           # User profile
├── components/            # React components
│   ├── admin/            # Admin components
│   ├── auth/             # Authentication components
│   ├── cart/             # Cart components
│   ├── products/         # Product components
│   └── ui/               # Reusable UI components
├── hooks/                # Custom React hooks
├── lib/                  # Utilities and helpers
│   ├── api-client.ts     # Centralized API client
│   ├── utils.ts          # Utility functions
│   └── products-data.ts  # Local product fixtures
└── public/               # Static assets
```

## API Integration

The frontend uses a centralized API client (`lib/api-client.ts`) for all backend communication.

### Usage Example

```typescript
import { apiClient } from '@/lib/api-client'

// Get products
const { data, error } = await apiClient.getProducts()

// Add to cart
await apiClient.addToCart({
  product_variant: 'variant-id',
  quantity: 1
})

// Create order
await apiClient.createOrder(orderData)
```

## Available Scripts

```bash
# Development
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm start        # Start production server
pnpm lint         # Run ESLint

# Type checking
pnpm type-check   # Run TypeScript compiler
```

## Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| NEXT_PUBLIC_API_BASE_URL | Backend API URL | http://127.0.0.1:8000/api | Yes |

## Production Deployment

### 1. Build the Application

```bash
pnpm build
```

### 2. Update Environment Variables

```bash
# Create .env.production
NEXT_PUBLIC_API_BASE_URL=https://api.yourdomain.com/api
```

### 3. Deployment Options

#### Option A: Vercel (Recommended for Next.js)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

#### Option B: Docker

```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/next.config.mjs ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
CMD ["node", "server.js"]
```

```bash
# Build and run
docker build -t electric-store-frontend .
docker run -p 3000:3000 -e NEXT_PUBLIC_API_BASE_URL=https://api.yourdomain.com/api electric-store-frontend
```

#### Option C: Static Export

```bash
# Update next.config.mjs
output: 'export'

# Build
pnpm build

# Deploy the 'out' directory to any static hosting
# (Netlify, GitHub Pages, S3, etc.)
```

#### Option D: Node.js Server

```bash
# Build
pnpm build

# Start production server
pnpm start

# Or with PM2
pm2 start npm --name "electric-store-frontend" -- start
```

### 4. Nginx Configuration (Optional)

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Features Guide

### User Features

1. **Browse Products**
   - View all products with images and prices
   - Filter by category, brand, price range
   - Search products
   - Sort by price, name, etc.

2. **Product Details**
   - View detailed product information
   - Select variants (color, storage)
   - Check stock availability
   - Add to cart or favorites

3. **Shopping Cart**
   - Add/remove items
   - Update quantities
   - View total price
   - Apply discounts

4. **Checkout**
   - Enter shipping information
   - Review order
   - Place order

5. **Order Tracking**
   - View order history
   - Track order status
   - Cancel orders

### Admin Features

1. **Product Management**
   - Add/edit/delete products
   - Manage product variants
   - Set pricing rules
   - Upload images

2. **Stock Management**
   - View stock levels
   - Adjust inventory
   - Set low stock alerts
   - Track stock movements

3. **Analytics**
   - Sales reports
   - Product performance
   - Customer insights
   - Revenue tracking

## Customization

### Theme

Update `app/globals.css` to customize colors and styles.

### Components

All UI components are in `components/ui/` and built with Shadcn/ui. Customize them as needed.

### API Client

Modify `lib/api-client.ts` to add new endpoints or change request handling.

## Troubleshooting

### API Connection Issues
- Verify backend is running
- Check NEXT_PUBLIC_API_BASE_URL in .env.local
- Check browser console for CORS errors
- Ensure backend CORS settings allow your frontend domain

### Build Errors
- Delete .next folder: `rm -rf .next`
- Clear node_modules: `rm -rf node_modules && pnpm install`
- Check for TypeScript errors: `pnpm type-check`

### Image Loading Issues
- Verify image URLs in backend
- Check Next.js image configuration in next.config.mjs
- Ensure images are in public/ directory or properly referenced

### State Management Issues
- Clear browser localStorage
- Check Zustand store implementations in hooks/
- Verify state persistence settings

## Testing

```bash
# Run Jest tests (if configured)
pnpm test

# Run E2E tests with Playwright (if configured)
pnpm test:e2e
```

## Performance Optimization

- Images are optimized automatically by Next.js
- Code splitting is handled by Next.js
- Use React.memo() for expensive components
- Implement virtual scrolling for large lists
- Use Next.js Image component for all images

## Security

- Never commit .env.local to git
- Use HTTPS in production
- Implement CSP headers
- Validate all user inputs
- Use environment variables for sensitive data

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers

## License

MIT License
