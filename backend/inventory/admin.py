from django.contrib import admin
from .models import (
    Warehouse, Supplier, Stock, StockMovement,
    StockImport, StockImportItem, StockAlert
)


@admin.register(Warehouse)
class WarehouseAdmin(admin.ModelAdmin):
    list_display = ['name', 'code', 'city', 'state', 'is_active', 'created_at']
    list_filter = ['is_active', 'state']
    search_fields = ['name', 'code', 'city']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(Supplier)
class SupplierAdmin(admin.ModelAdmin):
    list_display = ['name', 'code', 'contact_person', 'email', 'phone', 'is_active', 'created_at']
    list_filter = ['is_active', 'country']
    search_fields = ['name', 'code', 'contact_person', 'email']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(Stock)
class StockAdmin(admin.ModelAdmin):
    list_display = ['warehouse', 'variant', 'quantity', 'reserved_quantity', 'available_quantity', 'is_low_stock', 'updated_at']
    list_filter = ['warehouse', 'updated_at']
    search_fields = ['variant__product__name', 'warehouse__name']
    readonly_fields = ['created_at', 'updated_at', 'last_restocked_at', 'available_quantity', 'is_low_stock', 'is_out_of_stock']


@admin.register(StockMovement)
class StockMovementAdmin(admin.ModelAdmin):
    list_display = ['warehouse', 'variant', 'movement_type', 'quantity', 'reference_number', 'created_by', 'created_at']
    list_filter = ['movement_type', 'warehouse', 'created_at']
    search_fields = ['variant__product__name', 'reference_number', 'notes']
    readonly_fields = ['created_at']


class StockImportItemInline(admin.TabularInline):
    model = StockImportItem
    extra = 0
    readonly_fields = ['total_cost']


@admin.register(StockImport)
class StockImportAdmin(admin.ModelAdmin):
    list_display = ['import_number', 'warehouse', 'supplier', 'status', 'order_date', 'total_cost', 'created_at']
    list_filter = ['status', 'warehouse', 'order_date']
    search_fields = ['import_number', 'warehouse__name', 'supplier__name']
    readonly_fields = ['import_number', 'created_at', 'updated_at']
    inlines = [StockImportItemInline]


@admin.register(StockAlert)
class StockAlertAdmin(admin.ModelAdmin):
    list_display = ['stock', 'alert_type', 'is_resolved', 'created_at', 'resolved_at']
    list_filter = ['alert_type', 'is_resolved', 'created_at']
    search_fields = ['stock__variant__product__name', 'message']
    readonly_fields = ['created_at', 'updated_at']
