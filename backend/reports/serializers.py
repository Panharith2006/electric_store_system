from rest_framework import serializers
from .models import (
    SalesReport, ProductPerformance, ProductTrend,
    ProductRelation, CustomerSegment
)
from products.serializers import ProductListSerializer


class SalesReportSerializer(serializers.ModelSerializer):
    warehouse_name = serializers.CharField(source='warehouse.name', read_only=True, allow_null=True)
    category_name = serializers.CharField(source='category.name', read_only=True, allow_null=True)
    brand_name = serializers.CharField(source='brand.name', read_only=True, allow_null=True)
    
    class Meta:
        model = SalesReport
        fields = [
            'id', 'report_type', 'report_date', 'total_orders', 'total_items_sold',
            'total_revenue', 'average_order_value', 'new_customers',
            'returning_customers', 'warehouse', 'warehouse_name', 'category',
            'category_name', 'brand', 'brand_name', 'generated_at', 'generated_by'
        ]
        read_only_fields = ['id', 'generated_at']


class ProductPerformanceSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    product_brand = serializers.CharField(source='product.brand.name', read_only=True)
    variant_details = serializers.SerializerMethodField()
    warehouse_name = serializers.CharField(source='warehouse.name', read_only=True, allow_null=True)
    
    class Meta:
        model = ProductPerformance
        fields = [
            'id', 'product', 'product_name', 'product_brand', 'variant',
            'variant_details', 'report_date', 'period_type', 'units_sold',
            'revenue', 'warehouse', 'warehouse_name', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']
    
    def get_variant_details(self, obj):
        if obj.variant:
            return {
                'storage': obj.variant.storage,
                'color': obj.variant.color,
            }
        return None


class ProductTrendSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    product_brand = serializers.CharField(source='product.brand.name', read_only=True)
    period_label = serializers.SerializerMethodField()
    
    class Meta:
        model = ProductTrend
        fields = [
            'id', 'product', 'product_name', 'product_brand', 'year', 'quarter',
            'month', 'period_label', 'total_units_sold', 'total_revenue',
            'average_price', 'growth_rate', 'trend_direction', 'is_seasonal',
            'peak_season', 'calculated_at'
        ]
        read_only_fields = ['id', 'calculated_at']
    
    def get_period_label(self, obj):
        period = f"{obj.year}"
        if obj.month:
            period += f"-{obj.month:02d}"
        elif obj.quarter:
            period += f"-Q{obj.quarter}"
        return period


class ProductRelationSerializer(serializers.ModelSerializer):
    product_a_name = serializers.CharField(source='product_a.name', read_only=True)
    product_b_name = serializers.CharField(source='product_b.name', read_only=True)
    product_a_image = serializers.URLField(source='product_a.image', read_only=True)
    product_b_image = serializers.URLField(source='product_b.image', read_only=True)
    
    class Meta:
        model = ProductRelation
        fields = [
            'id', 'product_a', 'product_a_name', 'product_a_image',
            'product_b', 'product_b_name', 'product_b_image',
            'times_bought_together', 'confidence_score',
            'last_updated', 'created_at'
        ]
        read_only_fields = ['id', 'last_updated', 'created_at']


class CustomerSegmentSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source='user.email', read_only=True)
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    
    class Meta:
        model = CustomerSegment
        fields = [
            'id', 'user', 'user_email', 'user_name', 'segment_type',
            'total_orders', 'total_spent', 'average_order_value',
            'favorite_categories', 'favorite_brands', 'last_purchase_date',
            'purchase_frequency', 'updated_at'
        ]
        read_only_fields = ['id', 'updated_at']
