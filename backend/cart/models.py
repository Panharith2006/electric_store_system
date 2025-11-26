from django.db import models
from django.conf import settings
from products.models import Product, ProductVariant


class Cart(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, null=True, blank=True, related_name='cart')
    session_key = models.CharField(max_length=40, null=True, blank=True, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-updated_at']

    def __str__(self):
        if self.user:
            return f"Cart for {self.user.username}"
        return f"Cart {self.session_key}"

    def get_total_items(self):
        return sum(item.quantity for item in self.items.all())

    def get_total_price(self):
        return sum(item.get_total_price() for item in self.items.all())


class CartItem(models.Model):
    cart = models.ForeignKey(Cart, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    variant = models.ForeignKey(ProductVariant, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)
    # Cache variant details for faster access (do NOT name this variant_id, as it clashes with the FK)
    cached_variant_id = models.CharField(max_length=100)  # SKU or variant.id
    storage = models.CharField(max_length=50)
    color = models.CharField(max_length=50)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    image = models.URLField(max_length=500, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        unique_together = ['cart', 'product', 'variant']

    def __str__(self):
        return f"{self.quantity}x {self.product.name} ({self.color}, {self.storage})"

    def get_total_price(self):
        return self.price * self.quantity

    def save(self, *args, **kwargs):
        # Auto-populate cached fields from variant
        if self.variant:
            self.cached_variant_id = str(self.variant.id)
            self.storage = self.variant.storage
            self.color = self.variant.color
            self.price = self.variant.price
            if hasattr(self.variant, 'images') and self.variant.images:
                self.image = self.variant.images[0] if isinstance(self.variant.images, list) else self.variant.images
        super().save(*args, **kwargs)
