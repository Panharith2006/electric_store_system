from django.contrib import admin
from .models import Cart, CartItem


class CartItemInline(admin.TabularInline):
    model = CartItem
    extra = 0
    readonly_fields = ['variant_id', 'storage', 'color', 'price', 'image', 'created_at']
    fields = ['product', 'variant', 'quantity', 'storage', 'color', 'price', 'created_at']


@admin.register(Cart)
class CartAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'session_key', 'get_total_items', 'get_total_price', 'updated_at']
    list_filter = ['created_at', 'updated_at']
    search_fields = ['user__username', 'session_key']
    ordering = ['-updated_at']
    inlines = [CartItemInline]
    readonly_fields = ['created_at', 'updated_at']
    
    def get_total_items_display(self, obj):
        return obj.get_total_items()
    get_total_items_display.short_description = 'Total Items'
    
    def get_total_price_display(self, obj):
        return f"${obj.get_total_price():.2f}"
    get_total_price_display.short_description = 'Total Price'


@admin.register(CartItem)
class CartItemAdmin(admin.ModelAdmin):
    list_display = ['id', 'cart', 'product', 'variant', 'quantity', 'price', 'get_total_price', 'created_at']
    list_filter = ['created_at', 'updated_at']
    search_fields = ['product__name', 'variant_id', 'color', 'storage']
    ordering = ['-created_at']
    readonly_fields = ['variant_id', 'storage', 'color', 'price', 'image', 'created_at', 'updated_at']
    
    fieldsets = (
        ('Cart Information', {
            'fields': ('cart', 'product', 'variant', 'quantity')
        }),
        ('Cached Variant Details', {
            'fields': ('variant_id', 'storage', 'color', 'price', 'image'),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def get_total_price_display(self, obj):
        return f"${obj.get_total_price():.2f}"
    get_total_price_display.short_description = 'Total Price'
