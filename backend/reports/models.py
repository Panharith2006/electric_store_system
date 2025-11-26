from django.db import models
from django.conf import settings
from products.models import Product, ProductVariant, Category, Brand
from inventory.models import Warehouse


class SalesReport(models.Model):
    """Aggregated sales reports"""
    
    class ReportType(models.TextChoices):
        DAILY = 'DAILY', 'Daily'
        WEEKLY = 'WEEKLY', 'Weekly'
        MONTHLY = 'MONTHLY', 'Monthly'
        YEARLY = 'YEARLY', 'Yearly'
    
    report_type = models.CharField(max_length=10, choices=ReportType.choices)
    report_date = models.DateField()
    
    # Sales metrics
    total_orders = models.IntegerField(default=0)
    total_items_sold = models.IntegerField(default=0)
    total_revenue = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    average_order_value = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    
    # Customer metrics
    new_customers = models.IntegerField(default=0)
    returning_customers = models.IntegerField(default=0)
    
    # Optional filters
    warehouse = models.ForeignKey(Warehouse, on_delete=models.CASCADE, null=True, blank=True, related_name='sales_reports')
    category = models.ForeignKey(Category, on_delete=models.CASCADE, null=True, blank=True, related_name='sales_reports')
    brand = models.ForeignKey(Brand, on_delete=models.CASCADE, null=True, blank=True, related_name='sales_reports')
    
    # Metadata
    generated_at = models.DateTimeField(auto_now_add=True)
    generated_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    
    class Meta:
        unique_together = ['report_type', 'report_date', 'warehouse', 'category', 'brand']
        ordering = ['-report_date', 'report_type']
        indexes = [
            models.Index(fields=['-report_date', 'report_type']),
            models.Index(fields=['warehouse']),
        ]
    
    def __str__(self):
        return f"{self.report_type} Report - {self.report_date}"


class ProductPerformance(models.Model):
    """Track individual product performance over time"""
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='performance_reports')
    variant = models.ForeignKey(ProductVariant, on_delete=models.CASCADE, null=True, blank=True, related_name='performance_reports')
    
    # Time period
    report_date = models.DateField()
    period_type = models.CharField(max_length=10, choices=SalesReport.ReportType.choices)
    
    # Performance metrics
    units_sold = models.IntegerField(default=0)
    revenue = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    
    # Optional warehouse filter
    warehouse = models.ForeignKey(Warehouse, on_delete=models.CASCADE, null=True, blank=True)
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['product', 'variant', 'report_date', 'period_type', 'warehouse']
        ordering = ['-report_date', '-units_sold']
        indexes = [
            models.Index(fields=['-report_date', '-units_sold']),
            models.Index(fields=['product', '-report_date']),
        ]
    
    def __str__(self):
        variant_str = f" - {self.variant}" if self.variant else ""
        return f"{self.product.name}{variant_str}: {self.units_sold} units ({self.period_type})"


class ProductTrend(models.Model):
    """Long-term product trend analysis (for 3+ years)"""
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='trends')
    
    # Time period
    year = models.IntegerField()
    quarter = models.IntegerField(null=True, blank=True)  # 1-4
    month = models.IntegerField(null=True, blank=True)  # 1-12
    
    # Trend metrics
    total_units_sold = models.IntegerField(default=0)
    total_revenue = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    average_price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    
    # Growth indicators
    growth_rate = models.DecimalField(max_digits=6, decimal_places=2, default=0)  # Percentage
    trend_direction = models.CharField(max_length=20, default='STABLE')  # GROWING, DECLINING, STABLE
    
    # Seasonality indicators
    is_seasonal = models.BooleanField(default=False)
    peak_season = models.CharField(max_length=100, blank=True)
    
    # Metadata
    calculated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['product', 'year', 'quarter', 'month']
        ordering = ['-year', '-month']
        indexes = [
            models.Index(fields=['product', '-year']),
            models.Index(fields=['-year', '-total_revenue']),
        ]
    
    def __str__(self):
        period = f"{self.year}"
        if self.month:
            period += f"-{self.month:02d}"
        elif self.quarter:
            period += f"-Q{self.quarter}"
        return f"{self.product.name} Trend: {period}"


class ProductRelation(models.Model):
    """Track frequently bought together products"""
    product_a = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='related_products_a')
    product_b = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='related_products_b')
    
    # Relationship strength
    times_bought_together = models.IntegerField(default=0)
    confidence_score = models.DecimalField(max_digits=5, decimal_places=4, default=0)  # 0-1
    
    # Metadata
    last_updated = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['product_a', 'product_b']
        ordering = ['-times_bought_together']
        indexes = [
            models.Index(fields=['product_a', '-times_bought_together']),
        ]
    
    def __str__(self):
        return f"{self.product_a.name} + {self.product_b.name} ({self.times_bought_together} times)"


class CustomerSegment(models.Model):
    """Customer segmentation for personalized recommendations"""
    
    class SegmentType(models.TextChoices):
        HIGH_VALUE = 'HIGH_VALUE', 'High Value'
        REGULAR = 'REGULAR', 'Regular'
        OCCASIONAL = 'OCCASIONAL', 'Occasional'
        NEW = 'NEW', 'New Customer'
    
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='segment')
    segment_type = models.CharField(max_length=20, choices=SegmentType.choices, default=SegmentType.NEW)
    
    # Metrics
    total_orders = models.IntegerField(default=0)
    total_spent = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    average_order_value = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    
    # Preferences
    favorite_categories = models.JSONField(default=list)  # List of category IDs
    favorite_brands = models.JSONField(default=list)  # List of brand IDs
    
    # Behavior
    last_purchase_date = models.DateField(null=True, blank=True)
    purchase_frequency = models.IntegerField(default=0)  # Days between purchases
    
    # Metadata
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-total_spent']
    
    def __str__(self):
        return f"{self.user.username} - {self.segment_type}"
