from rest_framework import serializers
from .models import Order, OrderItem, Favorite
from products.serializers import ProductSerializer, ProductListSerializer


class OrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = [
            'id', 'product', 'variant', 'product_name', 'variant_storage',
            'variant_color', 'unit_price', 'quantity', 'subtotal',
            'product_image', 'created_at'
        ]
        read_only_fields = ['id', 'created_at', 'subtotal']


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    total_items = serializers.SerializerMethodField()
    user_email = serializers.EmailField(source='user.email', read_only=True)
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    
    class Meta:
        model = Order
        fields = [
            'id', 'order_number', 'user', 'user_email', 'user_name', 'status',
            'shipping_name', 'shipping_email', 'shipping_phone',
            'shipping_address_line1', 'shipping_address_line2',
            'shipping_city', 'shipping_state', 'shipping_postal_code',
            'shipping_country', 'payment_method', 'payment_status',
            'payment_transaction_id', 'subtotal', 'tax', 'shipping_cost',
            'discount', 'total', 'customer_notes', 'admin_notes',
            'items', 'total_items', 'created_at', 'updated_at',
            'paid_at', 'shipped_at', 'delivered_at'
        ]
        read_only_fields = [
            'id', 'order_number', 'user', 'created_at', 'updated_at',
            'paid_at', 'shipped_at', 'delivered_at'
        ]
    
    def get_total_items(self, obj):
        return obj.get_total_items()


class OrderListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for order lists"""
    total_items = serializers.SerializerMethodField()
    
    class Meta:
        model = Order
        fields = [
            'id', 'order_number', 'status', 'total', 'total_items',
            'created_at', 'payment_method'
        ]
    
    def get_total_items(self, obj):
        return obj.get_total_items()


class CreateOrderSerializer(serializers.Serializer):
    """Serializer for creating new orders"""
    shipping_name = serializers.CharField(max_length=255)
    shipping_email = serializers.EmailField()
    shipping_phone = serializers.CharField(max_length=15)
    shipping_address_line1 = serializers.CharField(max_length=255)
    shipping_address_line2 = serializers.CharField(max_length=255, required=False, allow_blank=True)
    shipping_city = serializers.CharField(max_length=100)
    shipping_state = serializers.CharField(max_length=100)
    shipping_postal_code = serializers.CharField(max_length=20)
    shipping_country = serializers.CharField(max_length=100, default='USA')
    payment_method = serializers.ChoiceField(choices=Order.PaymentMethod.choices)
    customer_notes = serializers.CharField(required=False, allow_blank=True)


class FavoriteSerializer(serializers.ModelSerializer):
    product = ProductListSerializer(read_only=True)
    product_id = serializers.CharField(write_only=True)
    
    class Meta:
        model = Favorite
        fields = ['id', 'product', 'product_id', 'created_at']
        read_only_fields = ['id', 'created_at']
