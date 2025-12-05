#!/usr/bin/env python
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from products.models import Product, ProductVariant, Category, Brand
from inventory.models import Stock, Warehouse

print("=" * 60)
print("DATABASE STATUS CHECK")
print("=" * 60)

# Products
products = Product.objects.filter(is_active=True)
print(f"\nActive Products: {products.count()}")
for p in products[:5]:
    variants = p.variants.filter(is_active=True)
    print(f"  - {p.name} (ID: {p.id})")
    print(f"    Brand: {p.brand.name if p.brand else 'None'}")
    print(f"    Category: {p.category.name if p.category else 'None'}")
    print(f"    Variants: {variants.count()}")
    for v in variants[:2]:
        print(f"      * {v.storage or 'N/A'} {v.color or ''} - Price: ${v.price}, Stock: {v.stock}")

# Variants
print(f"\nActive Variants: {ProductVariant.objects.filter(is_active=True).count()}")

# Stock
stocks = Stock.objects.all().select_related('variant', 'warehouse')
print(f"\nStock Records: {stocks.count()}")
for s in stocks[:5]:
    print(f"  - {s.variant.product.name} ({s.variant.id}) at {s.warehouse.name}: {s.quantity} units")

# Warehouses
print(f"\nWarehouses: {Warehouse.objects.count()}")
for w in Warehouse.objects.all()[:3]:
    print(f"  - {w.name} (Code: {w.code})")

# Categories
print(f"\nCategories: {Category.objects.count()}")
for c in Category.objects.all()[:5]:
    print(f"  - {c.name}")

# Brands
print(f"\nBrands: {Brand.objects.count()}")
for b in Brand.objects.all()[:5]:
    print(f"  - {b.name}")

print("\n" + "=" * 60)
