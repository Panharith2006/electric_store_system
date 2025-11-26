from django.contrib import admin
from .models import (
    Product, ProductVariant, Category, Brand,
    Promotion, BulkPricingRule, ProductReview
)


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'created_at', 'updated_at']
    search_fields = ['name', 'description']
    ordering = ['name']


@admin.register(Brand)
class BrandAdmin(admin.ModelAdmin):
    list_display = ['name', 'created_at', 'updated_at']
    search_fields = ['name', 'description']
    ordering = ['name']


class ProductVariantInline(admin.TabularInline):
    model = ProductVariant
    extra = 1
    fields = ['id', 'storage', 'color', 'price', 'original_price', 'stock', 'is_active']


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ['id', 'name', 'brand', 'category', 'base_price', 'average_rating', 'is_active', 'created_at']
    list_filter = ['brand', 'category', 'is_active', 'created_at']
    search_fields = ['id', 'name', 'description']
    ordering = ['-created_at']
    inlines = [ProductVariantInline]
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('id', 'name', 'brand', 'category', 'base_price', 'is_active')
        }),
        ('Images', {
            'fields': ('image', 'images')
        }),
        ('Details', {
            'fields': ('description', 'specs', 'features')
        }),
        ('Ratings', {
            'fields': ('average_rating', 'total_reviews')
        }),
        ('Related', {
            'fields': ('gifts', 'related_products'),
            'classes': ('collapse',)
        }),
    )


@admin.register(ProductVariant)
class ProductVariantAdmin(admin.ModelAdmin):
    list_display = ['id', 'product', 'storage', 'color', 'price', 'stock', 'is_active']
    list_filter = ['product', 'storage', 'color', 'is_active']
    search_fields = ['id', 'product__name', 'storage', 'color']
    ordering = ['product', 'storage', 'color']
    
    fieldsets = (
        ('Product Information', {
            'fields': ('id', 'product')
        }),
        ('Variant Details', {
            'fields': ('storage', 'color', 'images')
        }),
        ('Pricing & Stock', {
            'fields': ('price', 'original_price', 'stock', 'is_active')
        }),
    )


@admin.register(Promotion)
class PromotionAdmin(admin.ModelAdmin):
    list_display = ['name', 'discount_type', 'start_date', 'end_date', 'is_active', 'created_at']
    list_filter = ['discount_type', 'is_active', 'start_date', 'end_date']
    search_fields = ['name', 'description']
    filter_horizontal = ['products', 'variants', 'categories', 'brands']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('Promotion Details', {
            'fields': ('name', 'description', 'discount_type', 'is_active')
        }),
        ('Discount Values', {
            'fields': ('discount_percentage', 'discount_amount')
        }),
        ('Time Period', {
            'fields': ('start_date', 'end_date')
        }),
        ('Apply To', {
            'fields': ('products', 'variants', 'categories', 'brands')
        }),
        ('Metadata', {
            'fields': ('created_by', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(BulkPricingRule)
class BulkPricingRuleAdmin(admin.ModelAdmin):
    list_display = ['name', 'min_quantity', 'discount_percentage', 'is_active', 'created_at']
    list_filter = ['is_active', 'created_at']
    search_fields = ['name', 'description']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(ProductReview)
class ProductReviewAdmin(admin.ModelAdmin):
    list_display = ['product', 'user', 'rating', 'is_verified_purchase', 'is_approved', 'created_at']
    list_filter = ['rating', 'is_verified_purchase', 'is_approved', 'created_at']
    search_fields = ['product__name', 'user__username', 'title', 'comment']
    readonly_fields = ['created_at', 'updated_at']
    
    actions = ['approve_reviews', 'reject_reviews']
    
    def approve_reviews(self, request, queryset):
        queryset.update(is_approved=True)
    approve_reviews.short_description = "Approve selected reviews"
    
    def reject_reviews(self, request, queryset):
        queryset.update(is_approved=False)
    reject_reviews.short_description = "Reject selected reviews"
