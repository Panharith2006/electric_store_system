from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.parsers import MultiPartParser, FormParser
from .models import Product, ProductVariant, Category, Brand
from .serializers import (
    ProductSerializer, ProductListSerializer, ProductVariantSerializer,
    CategorySerializer, BrandSerializer
)
from .filters import ProductFilter
import os
import uuid


class CategoryViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Category CRUD operations
    """
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'created_at']


class BrandViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Brand CRUD operations
    """
    queryset = Brand.objects.all()
    serializer_class = BrandSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'created_at']


class ProductViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Product CRUD operations with filtering and search
    """
    queryset = Product.objects.filter(is_active=True).prefetch_related('variants', 'brand', 'category')
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = ProductFilter
    search_fields = ['name', 'description', 'brand__name', 'category__name']
    ordering_fields = ['name', 'base_price', 'created_at', 'average_rating']
    ordering = ['-created_at']
    
    def get_serializer_class(self):
        if self.action == 'list':
            return ProductListSerializer
        return ProductSerializer

    def create(self, request, *args, **kwargs):
        """
        Wrap default create to log validation errors with payload context
        so it's easier to diagnose 400 responses from the admin client.
        """
        serializer = self.get_serializer(data=request.data)
        try:
            serializer.is_valid(raise_exception=True)
        except Exception as exc:
            # log a compact summary of the incoming data and the serializer errors
            import logging, json
            logger = logging.getLogger(__name__)
            try:
                # build a compact preview of request.data
                preview = {}
                for k, v in list(request.data.items()):
                    try:
                        if isinstance(v, str) and len(v) > 200:
                            preview[k] = v[:200] + '...'
                        else:
                            preview[k] = v
                    except Exception:
                        preview[k] = str(type(v))

                logger.error("Product create failed validation; data=%s; errors=%s",
                             json.dumps(preview, default=str), json.dumps(serializer.errors, default=str))
            except Exception:
                logger.exception("Failed to log product create validation error")
            # re-raise so DRF returns a proper 400 response with details
            raise

        return super().create(request, *args, **kwargs)
    
    @action(detail=False, methods=['get'])
    def categories(self, request):
        """Get all unique categories"""
        categories = Category.objects.all()
        serializer = CategorySerializer(categories, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def brands(self, request):
        """Get all unique brands"""
        brands = Brand.objects.all()
        serializer = BrandSerializer(brands, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def variants(self, request, pk=None):
        """Get all variants for a specific product"""
        product = self.get_object()
        variants = product.variants.filter(is_active=True)
        serializer = ProductVariantSerializer(variants, many=True)
        return Response(serializer.data)

    def destroy(self, request, *args, **kwargs):
        """
        Soft-delete products by marking `is_active=False` so that existing
        references (orders, history) remain valid and storefront users can't
        see deleted products. Admins can still view/manage inactive records
        via the Django admin if needed.
        """
        instance = self.get_object()
        instance.is_active = False
        instance.save()
        return Response(status=status.HTTP_204_NO_CONTENT)
    
    @action(detail=True, methods=['get'])
    def recommendations(self, request, pk=None):
        """Get product recommendations based on purchase history"""
        from reports.analytics import generate_product_recommendations
        
        product = self.get_object()
        recommended_products = generate_product_recommendations(product, limit=5)
        serializer = ProductListSerializer(recommended_products, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def frequently_bought_together(self, request, pk=None):
        """Get products frequently bought together with this product"""
        from reports.analytics import analyze_product_relations
        
        product = self.get_object()
        relations = analyze_product_relations(product, min_occurrences=3)
        return Response(relations)
    
    @action(detail=False, methods=['get'])
    def trending(self, request):
        """Get currently trending products"""
        from reports.analytics import get_trending_products
        
        days = int(request.query_params.get('days', 30))
        limit = int(request.query_params.get('limit', 10))
        trending = get_trending_products(days=days, limit=limit)
        return Response(trending)
    
    @action(detail=False, methods=['get'])
    def top_selling(self, request):
        """Get top selling products"""
        from reports.analytics import get_top_selling_products
        
        days = int(request.query_params.get('days', 30))
        category_id = request.query_params.get('category')
        brand_id = request.query_params.get('brand')
        limit = int(request.query_params.get('limit', 10))
        
        category = None
        brand = None
        
        if category_id:
            from .models import Category
            category = Category.objects.filter(id=category_id).first()
        if brand_id:
            from .models import Brand
            brand = Brand.objects.filter(id=brand_id).first()
        
        top_products = get_top_selling_products(
            days=days,
            category=category,
            brand=brand,
            limit=limit
        )
        return Response(top_products)


class ProductVariantViewSet(viewsets.ModelViewSet):
    """
    ViewSet for ProductVariant CRUD operations
    """
    queryset = ProductVariant.objects.filter(is_active=True).select_related('product')
    serializer_class = ProductVariantSerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['product', 'storage', 'color', 'is_active']
    ordering_fields = ['price', 'stock', 'created_at']

    def perform_create(self, serializer):
        """When a variant is created, also ensure there's a Stock row in the
        default warehouse so stock management reflects the variant's stock."""
        instance = serializer.save()
        try:
            # prefer a warehouse named 'Main Warehouse' or the first active warehouse
            from inventory.models import Warehouse, Stock
            warehouse = Warehouse.objects.filter(name__icontains='main', is_active=True).first() or Warehouse.objects.filter(is_active=True).first()
            if warehouse:
                Stock.objects.get_or_create(
                    warehouse=warehouse,
                    variant=instance,
                    defaults={'quantity': int(instance.stock or 0)}
                )
        except Exception:
            # best-effort only
            pass

    def perform_update(self, serializer):
        """When a variant's stock is updated via the product/variant API,
        propagate the change to the default warehouse Stock row so both
        product management and stock management remain consistent.
        """
        instance = serializer.save()
        try:
            from inventory.models import Warehouse, Stock
            warehouse = Warehouse.objects.filter(name__icontains='main', is_active=True).first() or Warehouse.objects.filter(is_active=True).first()
            if warehouse:
                stock_obj, created = Stock.objects.get_or_create(
                    warehouse=warehouse,
                    variant=instance,
                    defaults={'quantity': int(instance.stock or 0)}
                )
                if not created:
                    stock_obj.quantity = int(instance.stock or 0)
                    stock_obj.save()
        except Exception:
            pass
    
    @action(detail=True, methods=['get'])
    def check_stock(self, request, pk=None):
        """Check stock availability for a variant"""
        variant = self.get_object()
        return Response({
            'variant_id': variant.id,
            'stock': variant.stock,
            'available': variant.stock > 0
        })

    def destroy(self, request, *args, **kwargs):
        """
        Soft-delete variants by setting `is_active=False`. This prevents
        hard-deleting variants that may be referenced by orders while keeping
        them hidden from storefront listings.
        """
        instance = self.get_object()
        instance.is_active = False
        instance.save()
        return Response(status=status.HTTP_204_NO_CONTENT)


class ProductImageUploadViewSet(viewsets.ModelViewSet):
    """
    A viewset to handle image uploads for products and product variants.
    """
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    parser_classes = (MultiPartParser, FormParser)

    def update(self, request, *args, **kwargs):
        """
        Handle image updates for a product.
        """
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)

        # Handle image upload: save files to storage and persist absolute URLs
        try:
            from django.core.files.base import ContentFile
            from django.core.files.storage import default_storage
            if 'image' in request.FILES:
                f = request.FILES['image']
                ext = os.path.splitext(f.name)[1].lower()
                fname = f'products/{uuid.uuid4()}{ext}'
                path = default_storage.save(fname, ContentFile(f.read()))
                url = request.build_absolute_uri(default_storage.url(path))
                instance.image = url
                instance.save()

            # images can be passed as a list of URLs/paths or as uploaded files
            images_list = []
            # files with key images[] or images
            for key in request.FILES:
                if key.startswith('images'):
                    f = request.FILES[key]
                    ext = os.path.splitext(f.name)[1].lower()
                    fname = f'products/{uuid.uuid4()}{ext}'
                    path = default_storage.save(fname, ContentFile(f.read()))
                    images_list.append(request.build_absolute_uri(default_storage.url(path)))

            # also accept images provided as form values
            if 'images' in request.data:
                # if it's a comma-separated string or a list
                val = request.data.getlist('images') if hasattr(request.data, 'getlist') else request.data.get('images')
                if isinstance(val, list):
                    images_list.extend(val)
                elif isinstance(val, str):
                    # try comma split
                    images_list.extend([s.strip() for s in val.split(',') if s.strip()])

            if images_list:
                instance.images = images_list
                instance.save()
        except Exception:
            # best-effort only; don't fail the update
            pass

        return Response(serializer.data)

    def create(self, request, *args, **kwargs):
        """
        Handle image uploads during product creation.
        """
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)

        # Handle image upload
        instance = serializer.instance
        try:
            from django.core.files.base import ContentFile
            from django.core.files.storage import default_storage
            if 'image' in request.FILES:
                f = request.FILES['image']
                ext = os.path.splitext(f.name)[1].lower()
                fname = f'products/{uuid.uuid4()}{ext}'
                path = default_storage.save(fname, ContentFile(f.read()))
                url = request.build_absolute_uri(default_storage.url(path))
                instance.image = url
                instance.save()

            images_list = []
            for key in request.FILES:
                if key.startswith('images'):
                    f = request.FILES[key]
                    ext = os.path.splitext(f.name)[1].lower()
                    fname = f'products/{uuid.uuid4()}{ext}'
                    path = default_storage.save(fname, ContentFile(f.read()))
                    images_list.append(request.build_absolute_uri(default_storage.url(path)))

            if 'images' in request.data:
                val = request.data.getlist('images') if hasattr(request.data, 'getlist') else request.data.get('images')
                if isinstance(val, list):
                    images_list.extend(val)
                elif isinstance(val, str):
                    images_list.extend([s.strip() for s in val.split(',') if s.strip()])

            if images_list:
                instance.images = images_list
                instance.save()
        except Exception:
            pass

        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def perform_create(self, serializer):
        """
        When a product is created, if the request included an `initial_stock`
        value and no variants are provided, create a default ProductVariant
        and ensure a Stock row exists in the default warehouse so the new
        product is not accidentally left out-of-stock in the admin UI.
        This is a best-effort helper for admin flows.
        """
        instance = serializer.save()

        # Best-effort: if creator provided an `initial_stock` in the payload
        # and there are no variants on the created product, create a simple
        # default variant and corresponding Stock row.
        try:
            request = getattr(self, 'request', None)
            if request is None:
                return

            init_stock = request.data.get('initial_stock') or request.data.get('initialStock')
            # Only create when variants are absent and initial_stock is provided
            if init_stock is not None and (not getattr(instance, 'variants', None) or len(instance.variants.all()) == 0):
                from .models import ProductVariant
                from inventory.models import Warehouse, Stock

                try:
                    qty = int(init_stock)
                except Exception:
                    qty = 0

                # Create a default variant (SKU derived from product id)
                variant_id = f"{instance.id}-default"
                variant, created = ProductVariant.objects.get_or_create(
                    id=variant_id,
                    defaults={
                        'product': instance,
                        'storage': 'Default',
                        'color': 'Default',
                        'price': instance.base_price,
                        'stock': qty,
                    }
                )

                # Ensure there's a stock record in the preferred warehouse
                warehouse = Warehouse.objects.filter(name__icontains='main', is_active=True).first() or Warehouse.objects.filter(is_active=True).first()
                if warehouse:
                    Stock.objects.get_or_create(
                        warehouse=warehouse,
                        variant=variant,
                        defaults={'quantity': qty}
                    )
        except Exception:
            # Don't fail product creation if stock creation fails; admin can fix later
            pass
