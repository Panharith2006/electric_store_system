from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils import timezone


class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = "Categories"
        ordering = ['name']

    def __str__(self):
        return self.name


class Brand(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return self.name


class Product(models.Model):
    # Basic Information
    id = models.CharField(max_length=100, primary_key=True)  # e.g., "iphone-15-pro-max"
    name = models.CharField(max_length=255)
    brand = models.ForeignKey(Brand, on_delete=models.CASCADE, related_name='products')
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='products')
    
    # Pricing
    base_price = models.DecimalField(max_digits=10, decimal_places=2)
    
    # Images
    image = models.URLField(max_length=500)  # Default/main image
    images = models.JSONField(default=list)  # Array of image URLs
    
    # Product Details
    description = models.TextField()
    specs = models.JSONField(default=dict)  # Specifications as key-value pairs
    features = models.JSONField(default=list)  # Array of feature strings
    
    # Related Information
    gifts = models.JSONField(default=list, blank=True)  # Array of gift strings
    related_products = models.JSONField(default=list, blank=True)  # Array of product IDs
    
    # Ratings
    average_rating = models.DecimalField(max_digits=3, decimal_places=2, default=0, validators=[MinValueValidator(0), MaxValueValidator(5)])
    total_reviews = models.IntegerField(default=0)
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.name


class ProductVariant(models.Model):
    # Variant ID (SKU)
    id = models.CharField(max_length=100, primary_key=True)  # e.g., "iphone-15-pro-max-256gb-blue"
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='variants')
    
    # Variant Attributes
    storage = models.CharField(max_length=50)  # e.g., "256GB", "512GB"
    color = models.CharField(max_length=50)  # e.g., "Blue Titanium", "Natural Titanium"
    
    # Pricing
    price = models.DecimalField(max_digits=10, decimal_places=2)
    original_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    
    # Stock
    stock = models.IntegerField(default=0)
    
    # Variant-specific Images
    images = models.JSONField(default=list, blank=True)  # Color-specific images
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['product', 'storage', 'color']
        unique_together = ['product', 'storage', 'color']

    def __str__(self):
        return f"{self.product.name} - {self.storage} - {self.color}"
    
    def get_effective_price(self):
        """Get the effective price considering active promotions"""
        promotions = self.promotions.filter(
            is_active=True,
            start_date__lte=timezone.now(),
            end_date__gte=timezone.now()
        )
        
        if promotions.exists():
            promotion = promotions.first()
            return promotion.calculate_discounted_price(self.price)
        return self.price


class Promotion(models.Model):
    """Promotional pricing and discounts"""
    
    class DiscountType(models.TextChoices):
        PERCENTAGE = 'PERCENTAGE', 'Percentage Discount'
        FIXED = 'FIXED', 'Fixed Amount Discount'
        BULK = 'BULK', 'Bulk/Volume Discount'
        BUNDLE = 'BUNDLE', 'Bundle Deal'
    
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    discount_type = models.CharField(max_length=20, choices=DiscountType.choices)
    
    # Discount value
    discount_percentage = models.DecimalField(
        max_digits=5, 
        decimal_places=2, 
        null=True, 
        blank=True,
        validators=[MinValueValidator(0), MaxValueValidator(100)]
    )
    discount_amount = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        null=True, 
        blank=True,
        validators=[MinValueValidator(0)]
    )
    
    # Time-limited promotion
    start_date = models.DateTimeField()
    end_date = models.DateTimeField()
    
    # Apply to
    products = models.ManyToManyField(Product, blank=True, related_name='promotions')
    variants = models.ManyToManyField(ProductVariant, blank=True, related_name='promotions')
    categories = models.ManyToManyField(Category, blank=True, related_name='promotions')
    brands = models.ManyToManyField(Brand, blank=True, related_name='promotions')
    
    # Status
    is_active = models.BooleanField(default=True)
    
    # Metadata
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return self.name
    
    def is_valid(self):
        """Check if promotion is currently valid"""
        now = timezone.now()
        return self.is_active and self.start_date <= now <= self.end_date
    
    def calculate_discounted_price(self, original_price):
        """Calculate price after discount"""
        if self.discount_type == self.DiscountType.PERCENTAGE:
            discount = original_price * (self.discount_percentage / 100)
            return original_price - discount
        elif self.discount_type == self.DiscountType.FIXED:
            return max(0, original_price - self.discount_amount)
        return original_price


class BulkPricingRule(models.Model):
    """Tiered/bulk pricing rules (buy more, pay less)"""
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    
    # Apply to
    product = models.ForeignKey(Product, on_delete=models.CASCADE, null=True, blank=True, related_name='bulk_pricing_rules')
    variant = models.ForeignKey(ProductVariant, on_delete=models.CASCADE, null=True, blank=True, related_name='bulk_pricing_rules')
    category = models.ForeignKey(Category, on_delete=models.CASCADE, null=True, blank=True, related_name='bulk_pricing_rules')
    
    # Minimum quantity to trigger rule
    min_quantity = models.IntegerField(validators=[MinValueValidator(1)])
    
    # Discount
    discount_percentage = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        validators=[MinValueValidator(0), MaxValueValidator(100)]
    )
    
    # Status
    is_active = models.BooleanField(default=True)
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['min_quantity']
    
    def __str__(self):
        return f"{self.name} (Buy {self.min_quantity}+, get {self.discount_percentage}% off)"


class ProductReview(models.Model):
    """Customer product reviews"""
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='reviews')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='product_reviews')
    
    # Review content
    rating = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    title = models.CharField(max_length=255, blank=True)
    comment = models.TextField()
    
    # Verification
    is_verified_purchase = models.BooleanField(default=False)
    
    # Status
    is_approved = models.BooleanField(default=True)
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['product', 'user']
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.user.username} - {self.product.name} ({self.rating}/5)"
