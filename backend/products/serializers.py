from rest_framework import serializers
from .models import Product, ProductVariant, Category, Brand
from django.db.models import Sum, F
from inventory.models import Stock
from django.conf import settings


def _make_absolute_url(request, value: str):
    if not value:
        return value
    # already absolute
    if value.startswith('http://') or value.startswith('https://'):
        return value
    # If value starts with a slash, treat as absolute path on the site
    if value.startswith('/'):
        return request.build_absolute_uri(value)
    # Otherwise prefix MEDIA_URL
    media_url = settings.MEDIA_URL or '/media/'
    if not media_url.endswith('/'):
        media_url = media_url + '/'
    return request.build_absolute_uri(media_url + value)


class CategorySerializer(serializers.ModelSerializer):
    product_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Category
        fields = ['id', 'name', 'description', 'product_count', 'created_at', 'updated_at']
        read_only_fields = ['id', 'product_count', 'created_at', 'updated_at']
    
    def get_product_count(self, obj):
        """Return the count of products in this category"""
        return obj.products.filter(is_active=True).count()


class BrandSerializer(serializers.ModelSerializer):
    class Meta:
        model = Brand
        fields = ['id', 'name', 'description', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class ProductVariantSerializer(serializers.ModelSerializer):
    effective_price = serializers.SerializerMethodField()
    total_stock = serializers.SerializerMethodField()
    # Allow images to be written as JSON (list of URLs or paths)
    images = serializers.JSONField(required=False)
    class Meta:
        model = ProductVariant
        fields = [
            'id', 'storage', 'color', 'price', 'original_price', 
            'stock', 'total_stock', 'images', 'is_active', 'created_at', 'updated_at', 'effective_price'
        ]
        read_only_fields = ['created_at', 'updated_at']

    def get_effective_price(self, obj):
        try:
            # ProductVariant.get_effective_price may return a Decimal
            val = obj.get_effective_price()
            return float(val) if val is not None else None
        except Exception:
            return float(obj.price)

    def get_total_stock(self, obj):
        try:
            qs = Stock.objects.filter(variant=obj)
            agg = qs.aggregate(total_qty=Sum('quantity'), total_reserved=Sum('reserved_quantity'))
            total = (agg.get('total_qty') or 0) - (agg.get('total_reserved') or 0)
            return max(0, int(total))
        except Exception:
            # Fallback to variant.stock field if inventory table is unavailable
            try:
                return int(obj.stock or 0)
            except Exception:
                return 0

    def to_representation(self, instance):
        data = super().to_representation(instance)
        # Normalize images to absolute URLs for clients
        request = self.context.get('request') if hasattr(self, 'context') else None
        raw = getattr(instance, 'images', None) or []
        imgs = []
        for v in raw:
            try:
                imgs.append(_make_absolute_url(request, str(v)) if request else str(v))
            except Exception:
                imgs.append(str(v))
        data['images'] = imgs
        return data


class ProductSerializer(serializers.ModelSerializer):
    # Allow the API caller to omit `id` when creating a product; the
    # serializer.create() will generate one from the name if missing.
    id = serializers.CharField(required=False, allow_blank=True)
    variants = ProductVariantSerializer(many=True, read_only=True)
    brand_name = serializers.CharField(source='brand.name', read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)
    # Make `image` writable so admin/front-end updates persist
    image = serializers.CharField(required=False, allow_blank=True)
    # Allow images to be written as JSON; we'll convert to absolute URLs on output
    images = serializers.JSONField(required=False)
    
    # Accept brand and category by name for create/update
    brand = serializers.CharField(required=False)
    category = serializers.CharField(required=False)
    # Optional initial stock when creating a product without explicit variants
    initial_stock = serializers.IntegerField(write_only=True, required=False, min_value=0)
    
    class Meta:
        model = Product
        fields = [
            'id', 'name', 'brand', 'brand_name', 'category', 'category_name',
            'base_price', 'image', 'images', 'description', 'specs', 
            'features', 'gifts', 'related_products', 'variants', 'initial_stock',
            'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']
    
    def validate(self, attrs):
        """Convert brand and category names to objects"""
        if 'brand' in attrs and isinstance(attrs['brand'], str):
            brand_name = attrs['brand']
            brand, created = Brand.objects.get_or_create(
                name=brand_name,
                defaults={'description': f'{brand_name} products'}
            )
            attrs['brand'] = brand
        
        if 'category' in attrs and isinstance(attrs['category'], str):
            category_name = attrs['category']
            category, created = Category.objects.get_or_create(
                name=category_name,
                defaults={'description': f'{category_name} category'}
            )
            attrs['category'] = category
        
        return attrs

    # Note: `to_representation` below will normalize `image` to an absolute URL
    
    def create(self, validated_data):
        """Create product with auto-generated ID if not provided"""
        # Pull out any initial_stock value before creating the product
        initial_stock = validated_data.pop('initial_stock', None)

        if 'id' not in validated_data or not validated_data['id']:
            # Generate ID from name
            from django.utils.text import slugify
            validated_data['id'] = slugify(validated_data['name'])[:100]

        product = super().create(validated_data)

        # If an initial_stock was provided, create a default variant and a Stock row
        if initial_stock is not None:
            try:
                from .models import ProductVariant
                from inventory.models import Warehouse, Stock

                # Create a simple default variant
                variant = ProductVariant.objects.create(
                    id=f"{product.id}-default",
                    product=product,
                    name=f"{product.name} (Default)",
                    sku=f"{product.id}-default",
                    storage="",
                    color="",
                    price=product.base_price,
                    stock=int(initial_stock),
                )

                # Ensure a default warehouse exists and create Stock row
                warehouse = Warehouse.objects.filter(name__icontains='main', is_active=True).first() or Warehouse.objects.filter(is_active=True).first()
                if warehouse:
                    Stock.objects.get_or_create(
                        warehouse=warehouse,
                        variant=variant,
                        defaults={'quantity': int(initial_stock)}
                    )
            except Exception:
                # best-effort only; don't fail product creation
                pass

        return product


class ProductListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for product lists"""
    brand_name = serializers.CharField(source='brand.name', read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)
    variant_count = serializers.SerializerMethodField()
    min_price = serializers.SerializerMethodField()
    max_price = serializers.SerializerMethodField()
    total_stock = serializers.SerializerMethodField()
    in_stock = serializers.SerializerMethodField()
    
    class Meta:
        model = Product
        fields = [
            'id', 'name', 'brand_name', 'category_name', 'base_price',
            'image', 'variant_count', 'min_price', 'max_price', 'is_active',
            'total_stock', 'in_stock',
        ]
    
    def get_variant_count(self, obj):
        return obj.variants.filter(is_active=True).count()
    
    def get_min_price(self, obj):
        variants = obj.variants.filter(is_active=True)
        if variants.exists():
            # Use effective price (promotions) when available
            prices = []
            for v in variants:
                try:
                    prices.append(float(v.get_effective_price() or v.price))
                except Exception:
                    prices.append(float(v.price))
            return min(prices)
        return float(obj.base_price)
    
    def get_max_price(self, obj):
        variants = obj.variants.filter(is_active=True)
        if variants.exists():
            prices = []
            for v in variants:
                try:
                    prices.append(float(v.get_effective_price() or v.price))
                except Exception:
                    prices.append(float(v.price))
            return max(prices)
        return float(obj.base_price)

    def get_total_stock(self, obj):
        # Sum available stock across warehouses for all active variants.
        try:
            # Get all variant ids for this product
            variant_ids = list(obj.variants.filter(is_active=True).values_list('id', flat=True))
            if not variant_ids:
                return 0
            qs = Stock.objects.filter(variant_id__in=variant_ids)
            agg = qs.aggregate(total_qty=Sum('quantity'), total_reserved=Sum('reserved_quantity'))
            total = (agg.get('total_qty') or 0) - (agg.get('total_reserved') or 0)
            return max(0, int(total))
        except Exception:
            # Fallback: sum variant.stock fields
            variants = obj.variants.filter(is_active=True)
            if not variants.exists():
                return 0
            total = 0
            for v in variants:
                try:
                    total += int(v.stock or 0)
                except Exception:
                    continue
            return total

    def get_in_stock(self, obj):
        return self.get_total_stock(obj) > 0

    def get_image(self, obj):
        val = getattr(obj, 'image', '') or ''
        request = self.context.get('request') if hasattr(self, 'context') else None
        try:
            if request:
                return _make_absolute_url(request, str(val))
            return str(val)
        except Exception:
            return str(val)

    def get_images(self, obj):
        # kept for backward compatibility but not used; actual representation
        # is handled in `to_representation` to allow images to be writable.
        raw = getattr(obj, 'images', None) or []
        request = self.context.get('request') if hasattr(self, 'context') else None
        out = []
        for v in raw:
            try:
                out.append(_make_absolute_url(request, str(v)) if request else str(v))
            except Exception:
                out.append(str(v))
        return out

    def to_representation(self, instance):
        data = super().to_representation(instance)
        request = self.context.get('request') if hasattr(self, 'context') else None
        raw = getattr(instance, 'images', None) or []
        imgs = []
        for v in raw:
            try:
                imgs.append(_make_absolute_url(request, str(v)) if request else str(v))
            except Exception:
                imgs.append(str(v))
        data['images'] = imgs
        # Ensure main image is absolute as well
        data['image'] = _make_absolute_url(request, str(getattr(instance, 'image', '') or '')) if request else str(getattr(instance, 'image', '') or '')
        return data
