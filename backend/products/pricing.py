"""
Pricing rules and promotional pricing logic
"""
from django.db import models
from django.utils import timezone
from decimal import Decimal


class PricingRule(models.Model):
    """Pricing rules for bulk discounts and promotions"""
    
    class RuleType(models.TextChoices):
        PERCENTAGE_DISCOUNT = 'PERCENTAGE', 'Percentage Discount'
        FIXED_DISCOUNT = 'FIXED', 'Fixed Amount Discount'
        BULK_PRICING = 'BULK', 'Bulk/Volume Pricing'
        BUNDLE = 'BUNDLE', 'Bundle Deal'
        
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    rule_type = models.CharField(max_length=20, choices=RuleType.choices)
    
    # Applicable products (null = all products)
    products = models.ManyToManyField('products.Product', blank=True, related_name='pricing_rules')
    categories = models.ManyToManyField('products.Category', blank=True, related_name='pricing_rules')
    
    # Rule parameters (stored as JSON for flexibility)
    # Example for BULK: {"tiers": [{"min_qty": 10, "discount_pct": 20}, {"min_qty": 20, "discount_pct": 30}]}
    # Example for PERCENTAGE: {"discount_pct": 15}
    # Example for FIXED: {"discount_amount": 50}
    parameters = models.JSONField(default=dict)
    
    # Time constraints
    start_date = models.DateTimeField(null=True, blank=True)
    end_date = models.DateTimeField(null=True, blank=True)
    
    # Priority (higher number = higher priority)
    priority = models.IntegerField(default=0)
    
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-priority', '-created_at']
    
    def __str__(self):
        return self.name
    
    def is_valid_now(self):
        """Check if rule is currently valid"""
        if not self.is_active:
            return False
        
        now = timezone.now()
        if self.start_date and now < self.start_date:
            return False
        if self.end_date and now > self.end_date:
            return False
        
        return True
    
    def applies_to_product(self, product):
        """Check if rule applies to given product"""
        if not self.is_valid_now():
            return False
        
        # If no specific products/categories, applies to all
        if not self.products.exists() and not self.categories.exists():
            return True
        
        # Check if product is in rule
        if self.products.filter(pk=product.pk).exists():
            return True
        
        # Check if product's category is in rule
        if self.categories.filter(pk=product.category.pk).exists():
            return True
        
        return False
    
    def calculate_discount(self, base_price, quantity=1):
        """Calculate discounted price based on rule type and quantity"""
        base_price = Decimal(str(base_price))
        
        if self.rule_type == self.RuleType.PERCENTAGE_DISCOUNT:
            discount_pct = Decimal(str(self.parameters.get('discount_pct', 0)))
            return base_price * (Decimal('1') - discount_pct / Decimal('100'))
        
        elif self.rule_type == self.RuleType.FIXED_DISCOUNT:
            discount_amount = Decimal(str(self.parameters.get('discount_amount', 0)))
            return max(base_price - discount_amount, Decimal('0'))
        
        elif self.rule_type == self.RuleType.BULK_PRICING:
            # Find applicable tier
            tiers = self.parameters.get('tiers', [])
            applicable_tier = None
            
            for tier in sorted(tiers, key=lambda x: x['min_qty'], reverse=True):
                if quantity >= tier['min_qty']:
                    applicable_tier = tier
                    break
            
            if applicable_tier:
                discount_pct = Decimal(str(applicable_tier.get('discount_pct', 0)))
                return base_price * (Decimal('1') - discount_pct / Decimal('100'))
        
        return base_price


def get_effective_price(product, variant=None, quantity=1):
    """
    Calculate effective price for a product considering all applicable pricing rules
    
    Args:
        product: Product instance
        variant: ProductVariant instance (optional)
        quantity: Quantity being purchased
    
    Returns:
        Decimal: Final price after all applicable discounts
    """
    from products.models import PricingRule as PR
    
    # Start with base/variant price
    base_price = Decimal(str(variant.price if variant else product.base_price))
    
    # Get all applicable rules
    rules = PR.objects.filter(is_active=True).order_by('-priority')
    
    applicable_rules = [
        rule for rule in rules 
        if rule.is_valid_now() and rule.applies_to_product(product)
    ]
    
    if not applicable_rules:
        return base_price
    
    # Apply highest priority rule only (can be changed to stack discounts)
    best_rule = applicable_rules[0]
    final_price = best_rule.calculate_discount(base_price, quantity)
    
    return max(final_price, Decimal('0'))
