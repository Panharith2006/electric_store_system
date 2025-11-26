from rest_framework import serializers
from .models import Product, ProductVariant, Category, Brand


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'description', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class BrandSerializer(serializers.ModelSerializer):
    class Meta:
        model = Brand
        fields = ['id', 'name', 'description', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class ProductVariantSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductVariant
        fields = [
            'id', 'storage', 'color', 'price', 'original_price', 
            'stock', 'images', 'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']


class ProductSerializer(serializers.ModelSerializer):
    variants = ProductVariantSerializer(many=True, read_only=True)
    brand_name = serializers.CharField(source='brand.name', read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)
    
    class Meta:
        model = Product
        fields = [
            'id', 'name', 'brand', 'brand_name', 'category', 'category_name',
            'base_price', 'image', 'images', 'description', 'specs', 
            'features', 'gifts', 'related_products', 'variants',
            'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']


class ProductListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for product lists"""
    brand_name = serializers.CharField(source='brand.name', read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)
    variant_count = serializers.SerializerMethodField()
    min_price = serializers.SerializerMethodField()
    max_price = serializers.SerializerMethodField()
    
    class Meta:
        model = Product
        fields = [
            'id', 'name', 'brand_name', 'category_name', 'base_price',
            'image', 'variant_count', 'min_price', 'max_price', 'is_active'
        ]
    
    def get_variant_count(self, obj):
        return obj.variants.filter(is_active=True).count()
    
    def get_min_price(self, obj):
        variants = obj.variants.filter(is_active=True)
        if variants.exists():
            return min(v.price for v in variants)
        return obj.base_price
    
    def get_max_price(self, obj):
        variants = obj.variants.filter(is_active=True)
        if variants.exists():
            return max(v.price for v in variants)
        return obj.base_price
