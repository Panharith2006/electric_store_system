from rest_framework import serializers
from .models import Cart, CartItem
from products.serializers import ProductSerializer, ProductVariantSerializer


class CartItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    variant = ProductVariantSerializer(read_only=True)
    product_id = serializers.CharField(write_only=True)
    variant_id = serializers.CharField(write_only=True)
    total_price = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True, source='get_total_price')
    
    # Expose cached fields for frontend compatibility
    selected_variant = serializers.SerializerMethodField()
    
    class Meta:
        model = CartItem
        fields = [
            'id', 'product', 'variant', 'product_id', 'variant_id',
            'quantity', 'price', 'storage', 'color', 'image',
            'total_price', 'selected_variant', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'price', 'storage', 'color', 'image', 'created_at', 'updated_at']
    
    def get_selected_variant(self, obj):
        """Return variant info in format expected by frontend"""
        return {
            'id': obj.variant_id,
            'storage': obj.storage,
            'color': obj.color,
            'price': float(obj.price),
            'image': obj.image
        }


class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    total_items = serializers.IntegerField(read_only=True, source='get_total_items')
    total_price = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True, source='get_total_price')
    
    class Meta:
        model = Cart
        fields = [
            'id', 'user', 'session_key', 'items', 
            'total_items', 'total_price', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'user', 'session_key', 'created_at', 'updated_at']


class AddToCartSerializer(serializers.Serializer):
    product_id = serializers.CharField()
    variant_id = serializers.CharField()
    quantity = serializers.IntegerField(min_value=1, default=1)


class UpdateCartItemSerializer(serializers.Serializer):
    quantity = serializers.IntegerField(min_value=0)
