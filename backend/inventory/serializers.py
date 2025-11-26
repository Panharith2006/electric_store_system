from rest_framework import serializers
from .models import (
    Warehouse, Supplier, Stock, StockMovement,
    StockImport, StockImportItem, StockAlert
)
from products.serializers import ProductVariantSerializer


class WarehouseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Warehouse
        fields = [
            'id', 'name', 'code', 'address_line1', 'address_line2',
            'city', 'state', 'postal_code', 'country', 'phone', 'email',
            'manager_name', 'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class SupplierSerializer(serializers.ModelSerializer):
    class Meta:
        model = Supplier
        fields = [
            'id', 'name', 'code', 'contact_person', 'email', 'phone',
            'address_line1', 'address_line2', 'city', 'state',
            'postal_code', 'country', 'website', 'notes', 'is_active',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class StockSerializer(serializers.ModelSerializer):
    warehouse_name = serializers.CharField(source='warehouse.name', read_only=True)
    variant_details = ProductVariantSerializer(source='variant', read_only=True)
    product_name = serializers.CharField(source='variant.product.name', read_only=True)
    available_quantity = serializers.ReadOnlyField()
    is_low_stock = serializers.ReadOnlyField()
    is_out_of_stock = serializers.ReadOnlyField()
    
    class Meta:
        model = Stock
        fields = [
            'id', 'warehouse', 'warehouse_name', 'variant', 'variant_details',
            'product_name', 'quantity', 'reserved_quantity', 'available_quantity',
            'low_stock_threshold', 'is_low_stock', 'is_out_of_stock',
            'last_restocked_at', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'last_restocked_at']


class StockMovementSerializer(serializers.ModelSerializer):
    warehouse_name = serializers.CharField(source='warehouse.name', read_only=True)
    product_name = serializers.CharField(source='variant.product.name', read_only=True)
    created_by_username = serializers.CharField(source='created_by.username', read_only=True)
    
    class Meta:
        model = StockMovement
        fields = [
            'id', 'warehouse', 'warehouse_name', 'variant', 'product_name',
            'movement_type', 'quantity', 'reference_number', 'notes',
            'created_by', 'created_by_username', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class StockImportItemSerializer(serializers.ModelSerializer):
    variant_details = ProductVariantSerializer(source='variant', read_only=True)
    
    class Meta:
        model = StockImportItem
        fields = [
            'id', 'variant', 'variant_details', 'quantity_ordered',
            'quantity_received', 'unit_cost', 'total_cost', 'created_at'
        ]
        read_only_fields = ['id', 'total_cost', 'created_at']


class StockImportSerializer(serializers.ModelSerializer):
    items = StockImportItemSerializer(many=True, read_only=True)
    warehouse_name = serializers.CharField(source='warehouse.name', read_only=True)
    supplier_name = serializers.CharField(source='supplier.name', read_only=True)
    created_by_username = serializers.CharField(source='created_by.username', read_only=True)
    
    class Meta:
        model = StockImport
        fields = [
            'id', 'import_number', 'warehouse', 'warehouse_name', 'supplier',
            'supplier_name', 'status', 'order_date', 'expected_date',
            'received_date', 'total_cost', 'notes', 'created_by',
            'created_by_username', 'items', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'import_number', 'created_at', 'updated_at']


class CreateStockImportSerializer(serializers.Serializer):
    warehouse_id = serializers.IntegerField()
    supplier_id = serializers.IntegerField(required=False, allow_null=True)
    order_date = serializers.DateField()
    expected_date = serializers.DateField(required=False, allow_null=True)
    notes = serializers.CharField(required=False, allow_blank=True)
    items = serializers.ListField(
        child=serializers.DictField(),
        allow_empty=False
    )


class StockAlertSerializer(serializers.ModelSerializer):
    warehouse_name = serializers.CharField(source='stock.warehouse.name', read_only=True)
    product_name = serializers.CharField(source='stock.variant.product.name', read_only=True)
    variant_details = serializers.SerializerMethodField()
    
    class Meta:
        model = StockAlert
        fields = [
            'id', 'stock', 'warehouse_name', 'product_name', 'variant_details',
            'alert_type', 'message', 'is_resolved', 'resolved_at',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_variant_details(self, obj):
        return {
            'storage': obj.stock.variant.storage,
            'color': obj.stock.variant.color,
        }
