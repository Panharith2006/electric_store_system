from django.contrib import admin
from .models import (
    SalesReport, ProductPerformance, ProductTrend,
    ProductRelation, CustomerSegment
)

@admin.register(SalesReport)
class SalesReportAdmin(admin.ModelAdmin):
    list_display = ['report_type', 'report_date', 'total_orders', 'total_revenue', 'warehouse', 'generated_at']
    list_filter = ['report_type', 'report_date', 'warehouse']
    search_fields = ['report_date']
    readonly_fields = ['generated_at']


@admin.register(ProductPerformance)
class ProductPerformanceAdmin(admin.ModelAdmin):
    list_display = ['product', 'variant', 'period_type', 'report_date', 'units_sold', 'revenue']
    list_filter = ['period_type', 'report_date', 'warehouse']
    search_fields = ['product__name']
    readonly_fields = ['created_at']


@admin.register(ProductTrend)
class ProductTrendAdmin(admin.ModelAdmin):
    list_display = ['product', 'year', 'month', 'quarter', 'total_units_sold', 'total_revenue', 'trend_direction']
    list_filter = ['year', 'trend_direction', 'is_seasonal']
    search_fields = ['product__name']
    readonly_fields = ['calculated_at']


@admin.register(ProductRelation)
class ProductRelationAdmin(admin.ModelAdmin):
    list_display = ['product_a', 'product_b', 'times_bought_together', 'confidence_score']
    list_filter = ['last_updated']
    search_fields = ['product_a__name', 'product_b__name']
    readonly_fields = ['last_updated', 'created_at']


@admin.register(CustomerSegment)
class CustomerSegmentAdmin(admin.ModelAdmin):
    list_display = ['user', 'segment_type', 'total_orders', 'total_spent', 'last_purchase_date']
    list_filter = ['segment_type']
    search_fields = ['user__username', 'user__email']
    readonly_fields = ['updated_at']
