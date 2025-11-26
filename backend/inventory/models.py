from django.db import models
from django.conf import settings
from products.models import Product, ProductVariant
from django.core.validators import MinValueValidator


class Warehouse(models.Model):
    """Warehouse/Branch location model"""
    name = models.CharField(max_length=255, unique=True)
    code = models.CharField(max_length=50, unique=True)
    
    # Address
    address_line1 = models.CharField(max_length=255)
    address_line2 = models.CharField(max_length=255, blank=True)
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    postal_code = models.CharField(max_length=20)
    country = models.CharField(max_length=100, default='USA')
    
    # Contact
    phone = models.CharField(max_length=15)
    email = models.EmailField()
    manager_name = models.CharField(max_length=255, blank=True)
    
    # Status
    is_active = models.BooleanField(default=True)
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['name']
    
    def __str__(self):
        return f"{self.name} ({self.code})"


class Supplier(models.Model):
    """Supplier model for tracking product suppliers"""
    name = models.CharField(max_length=255, unique=True)
    code = models.CharField(max_length=50, unique=True)
    
    # Contact Information
    contact_person = models.CharField(max_length=255)
    email = models.EmailField()
    phone = models.CharField(max_length=15)
    
    # Address
    address_line1 = models.CharField(max_length=255)
    address_line2 = models.CharField(max_length=255, blank=True)
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    postal_code = models.CharField(max_length=20)
    country = models.CharField(max_length=100, default='USA')
    
    # Additional Info
    website = models.URLField(blank=True)
    notes = models.TextField(blank=True)
    
    # Status
    is_active = models.BooleanField(default=True)
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['name']
    
    def __str__(self):
        return self.name


class Stock(models.Model):
    """Stock inventory tracking per warehouse"""
    warehouse = models.ForeignKey(Warehouse, on_delete=models.CASCADE, related_name='stocks')
    variant = models.ForeignKey(ProductVariant, on_delete=models.CASCADE, related_name='warehouse_stocks')
    
    # Stock levels
    quantity = models.IntegerField(default=0, validators=[MinValueValidator(0)])
    reserved_quantity = models.IntegerField(default=0, validators=[MinValueValidator(0)])
    
    # Alert thresholds
    low_stock_threshold = models.IntegerField(default=10, validators=[MinValueValidator(0)])
    
    # Metadata
    last_restocked_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['warehouse', 'variant']
        ordering = ['warehouse', 'variant']
        indexes = [
            models.Index(fields=['warehouse', 'variant']),
            models.Index(fields=['quantity']),
        ]
    
    def __str__(self):
        return f"{self.variant} at {self.warehouse.name}: {self.quantity}"
    
    @property
    def available_quantity(self):
        """Calculate available stock (total - reserved)"""
        return max(0, self.quantity - self.reserved_quantity)
    
    @property
    def is_low_stock(self):
        """Check if stock is below threshold"""
        return self.available_quantity <= self.low_stock_threshold
    
    @property
    def is_out_of_stock(self):
        """Check if completely out of stock"""
        return self.available_quantity == 0


class StockMovement(models.Model):
    """Track all stock movements (imports, sales, adjustments, transfers)"""
    
    class MovementType(models.TextChoices):
        IMPORT = 'IMPORT', 'Stock Import'
        SALE = 'SALE', 'Sale'
        ADJUSTMENT = 'ADJUSTMENT', 'Adjustment'
        TRANSFER = 'TRANSFER', 'Transfer'
        RETURN = 'RETURN', 'Return/Refund'
        DAMAGED = 'DAMAGED', 'Damaged/Lost'
    
    warehouse = models.ForeignKey(Warehouse, on_delete=models.CASCADE, related_name='stock_movements')
    variant = models.ForeignKey(ProductVariant, on_delete=models.CASCADE, related_name='stock_movements')
    
    # Movement details
    movement_type = models.CharField(max_length=20, choices=MovementType.choices)
    quantity = models.IntegerField()  # Can be positive or negative
    
    # Reference
    reference_number = models.CharField(max_length=100, blank=True)
    notes = models.TextField(blank=True)
    
    # User tracking
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['-created_at']),
            models.Index(fields=['warehouse', 'variant']),
            models.Index(fields=['movement_type']),
        ]
    
    def __str__(self):
        return f"{self.movement_type}: {self.quantity} {self.variant} at {self.warehouse.name}"


class StockImport(models.Model):
    """Stock import/purchase order"""
    
    class ImportStatus(models.TextChoices):
        PENDING = 'PENDING', 'Pending'
        RECEIVED = 'RECEIVED', 'Received'
        PARTIALLY_RECEIVED = 'PARTIALLY_RECEIVED', 'Partially Received'
        CANCELLED = 'CANCELLED', 'Cancelled'
    
    # Import identification
    import_number = models.CharField(max_length=50, unique=True, editable=False)
    warehouse = models.ForeignKey(Warehouse, on_delete=models.CASCADE, related_name='stock_imports')
    supplier = models.ForeignKey(Supplier, on_delete=models.SET_NULL, null=True, related_name='stock_imports')
    
    # Status
    status = models.CharField(
        max_length=20,
        choices=ImportStatus.choices,
        default=ImportStatus.PENDING
    )
    
    # Dates
    order_date = models.DateField()
    expected_date = models.DateField(null=True, blank=True)
    received_date = models.DateField(null=True, blank=True)
    
    # Totals
    total_cost = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    
    # Additional info
    notes = models.TextField(blank=True)
    
    # User tracking
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Import {self.import_number} - {self.warehouse.name}"
    
    def save(self, *args, **kwargs):
        if not self.import_number:
            import datetime
            timestamp = datetime.datetime.now().strftime('%Y%m%d%H%M%S')
            self.import_number = f"IMP-{timestamp}"
        super().save(*args, **kwargs)


class StockImportItem(models.Model):
    """Items in a stock import"""
    stock_import = models.ForeignKey(StockImport, on_delete=models.CASCADE, related_name='items')
    variant = models.ForeignKey(ProductVariant, on_delete=models.CASCADE)
    
    # Quantities
    quantity_ordered = models.IntegerField(validators=[MinValueValidator(1)])
    quantity_received = models.IntegerField(default=0, validators=[MinValueValidator(0)])
    
    # Pricing
    unit_cost = models.DecimalField(max_digits=10, decimal_places=2)
    total_cost = models.DecimalField(max_digits=12, decimal_places=2)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['created_at']
    
    def __str__(self):
        return f"{self.quantity_ordered}x {self.variant}"
    
    def save(self, *args, **kwargs):
        self.total_cost = self.unit_cost * self.quantity_ordered
        super().save(*args, **kwargs)


class StockAlert(models.Model):
    """Low stock alerts"""
    
    class AlertType(models.TextChoices):
        LOW_STOCK = 'LOW_STOCK', 'Low Stock'
        OUT_OF_STOCK = 'OUT_OF_STOCK', 'Out of Stock'
    
    stock = models.ForeignKey(Stock, on_delete=models.CASCADE, related_name='alerts')
    alert_type = models.CharField(max_length=20, choices=AlertType.choices)
    
    # Alert details
    message = models.TextField()
    is_resolved = models.BooleanField(default=False)
    resolved_at = models.DateTimeField(null=True, blank=True)
    
    # Notification tracking
    notified_users = models.ManyToManyField(settings.AUTH_USER_MODEL, blank=True, related_name='stock_alerts_received')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.alert_type}: {self.stock}"
