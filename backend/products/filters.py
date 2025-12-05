"""
Custom filters for products
"""
from django_filters import rest_framework as filters
from django.db import models
from .models import Product


class ProductFilter(filters.FilterSet):
    """Custom filter for products with price range support"""
    
    # Price range filters
    min_price = filters.NumberFilter(field_name='base_price', lookup_expr='gte')
    max_price = filters.NumberFilter(field_name='base_price', lookup_expr='lte')
    
    # Category filters (support both ID and name)
    category = filters.CharFilter(field_name='category__id')
    category__name = filters.CharFilter(field_name='category__name', lookup_expr='iexact')
    
    # Brand filters (support both ID and name)
    brand = filters.CharFilter(field_name='brand__id')
    brand__name = filters.CharFilter(field_name='brand__name', lookup_expr='iexact')
    
    # Custom search filter
    search = filters.CharFilter(method='search_filter')
    
    class Meta:
        model = Product
        fields = ['category', 'brand', 'is_active', 'min_price', 'max_price']
    
    def search_filter(self, queryset, name, value):
        """Custom search across multiple fields"""
        return queryset.filter(
            models.Q(name__icontains=value) |
            models.Q(description__icontains=value) |
            models.Q(brand__name__icontains=value) |
            models.Q(category__name__icontains=value)
        )
