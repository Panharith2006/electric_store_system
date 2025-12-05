"""
Stock alert system for low stock notifications
"""
from django.db import models
from django.core.mail import send_mail
from django.conf import settings
from django.utils import timezone
from inventory.models import Stock, Warehouse
from products.models import ProductVariant
import logging

logger = logging.getLogger(__name__)


class StockAlert(models.Model):
    """Stock alert notifications"""
    
    class AlertType(models.TextChoices):
        LOW_STOCK = 'LOW_STOCK', 'Low Stock'
        OUT_OF_STOCK = 'OUT_OF_STOCK', 'Out of Stock'
        CRITICAL = 'CRITICAL', 'Critical Level'
    
    class AlertStatus(models.TextChoices):
        ACTIVE = 'ACTIVE', 'Active'
        ACKNOWLEDGED = 'ACKNOWLEDGED', 'Acknowledged'
        RESOLVED = 'RESOLVED', 'Resolved'
    
    stock = models.ForeignKey('inventory.Stock', on_delete=models.CASCADE, related_name='alerts')
    alert_type = models.CharField(max_length=20, choices=AlertType.choices)
    status = models.CharField(max_length=20, choices=AlertStatus.choices, default=AlertStatus.ACTIVE)
    
    # Alert details
    current_quantity = models.IntegerField()
    threshold_quantity = models.IntegerField()
    message = models.TextField()
    
    # Notification tracking
    email_sent = models.BooleanField(default=False)
    sms_sent = models.BooleanField(default=False)
    notification_count = models.IntegerField(default=0)
    last_notified_at = models.DateTimeField(null=True, blank=True)
    
    # Resolution
    resolved_at = models.DateTimeField(null=True, blank=True)
    resolved_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='resolved_alerts'
    )
    resolution_notes = models.TextField(blank=True)
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['status', '-created_at']),
            models.Index(fields=['stock', 'status']),
        ]
    
    def __str__(self):
        return f"{self.alert_type} - {self.stock.variant.product.name} at {self.stock.warehouse.name}"
    
    def send_email_notification(self, recipients=None):
        """Send email notification for this alert"""
        if recipients is None:
            # Default to warehouse manager and admins
            from users.models import User
            recipients = []
            
            # Add warehouse manager if exists
            if self.stock.warehouse.email:
                recipients.append(self.stock.warehouse.email)
            
            # Add admin emails
            admin_users = User.objects.filter(role='ADMIN', is_active=True)
            recipients.extend([user.email for user in admin_users if user.email])
        
        if not recipients:
            logger.warning(f"No recipients found for stock alert {self.id}")
            return False
        
        subject = f"🚨 {self.alert_type} Alert: {self.stock.variant.product.name}"
        message = self.get_email_body()
        
        try:
            send_mail(
                subject=subject,
                message=message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=recipients,
                fail_silently=False,
            )
            
            self.email_sent = True
            self.notification_count += 1
            self.last_notified_at = timezone.now()
            self.save()
            
            logger.info(f"Stock alert email sent for {self.stock}")
            return True
        except Exception as e:
            logger.error(f"Failed to send stock alert email: {e}")
            return False
    
    def get_email_body(self):
        """Generate email body for alert"""
        variant = self.stock.variant
        product = variant.product
        warehouse = self.stock.warehouse
        
        body = f"""
Stock Alert Notification
=========================

Alert Type: {self.get_alert_type_display()}
Status: {self.get_status_display()}

Product Details:
- Product: {product.name}
- Variant: {variant.storage} - {variant.color}
- SKU: {variant.id}

Stock Information:
- Warehouse: {warehouse.name} ({warehouse.code})
- Current Quantity: {self.current_quantity}
- Threshold: {self.threshold_quantity}
- Reserved: {self.stock.reserved_quantity}

Message:
{self.message}

Action Required:
Please review and restock this item as soon as possible to avoid stockouts.

Alert Created: {self.created_at.strftime('%Y-%m-%d %H:%M:%S')}

---
This is an automated notification from the Electric Store Management System.
        """.strip()
        
        return body
    
    def acknowledge(self, user=None):
        """Mark alert as acknowledged"""
        self.status = self.AlertStatus.ACKNOWLEDGED
        self.save()
        logger.info(f"Alert {self.id} acknowledged by {user}")
    
    def resolve(self, user=None, notes=''):
        """Mark alert as resolved"""
        self.status = self.AlertStatus.RESOLVED
        self.resolved_at = timezone.now()
        self.resolved_by = user
        self.resolution_notes = notes
        self.save()
        logger.info(f"Alert {self.id} resolved by {user}")


def check_stock_levels():
    """
    Check all stock levels and create alerts for low/out of stock items
    This should be run as a periodic task (celery beat or cron)
    
    Returns:
        Dict with statistics of alerts created
    """
    from inventory.models import Stock
    
    stats = {
        'checked': 0,
        'low_stock': 0,
        'out_of_stock': 0,
        'critical': 0,
        'notifications_sent': 0,
    }
    
    # Get all active stock records
    stocks = Stock.objects.filter(
        variant__is_active=True,
        warehouse__is_active=True
    ).select_related('variant__product', 'warehouse')
    
    for stock in stocks:
        stats['checked'] += 1
        
        # Calculate available quantity (total - reserved)
        available = stock.quantity - stock.reserved_quantity
        
        # Determine alert type
        alert_type = None
        message = None
        
        if available <= 0:
            alert_type = StockAlert.AlertType.OUT_OF_STOCK
            message = f"Product is out of stock at {stock.warehouse.name}"
            stats['out_of_stock'] += 1
        elif available <= (stock.low_stock_threshold * 0.3):
            # Critical: 30% or less of threshold
            alert_type = StockAlert.AlertType.CRITICAL
            message = f"Critical stock level: {available} units remaining (threshold: {stock.low_stock_threshold})"
            stats['critical'] += 1
        elif available <= stock.low_stock_threshold:
            alert_type = StockAlert.AlertType.LOW_STOCK
            message = f"Low stock level: {available} units remaining (threshold: {stock.low_stock_threshold})"
            stats['low_stock'] += 1
        
        if alert_type:
            # Check if active alert already exists
            existing_alert = StockAlert.objects.filter(
                stock=stock,
                status=StockAlert.AlertStatus.ACTIVE,
                alert_type=alert_type
            ).first()
            
            if existing_alert:
                # Update existing alert
                existing_alert.current_quantity = available
                existing_alert.message = message
                existing_alert.save()
                
                # Resend notification if it's been more than 24 hours
                if existing_alert.last_notified_at:
                    hours_since_notification = (timezone.now() - existing_alert.last_notified_at).total_seconds() / 3600
                    if hours_since_notification >= 24:
                        if existing_alert.send_email_notification():
                            stats['notifications_sent'] += 1
            else:
                # Create new alert
                alert = StockAlert.objects.create(
                    stock=stock,
                    alert_type=alert_type,
                    current_quantity=available,
                    threshold_quantity=stock.low_stock_threshold,
                    message=message
                )
                
                # Send notification
                if alert.send_email_notification():
                    stats['notifications_sent'] += 1
    
    logger.info(f"Stock level check complete: {stats}")
    return stats


def auto_resolve_alerts():
    """
    Automatically resolve alerts when stock levels are restored
    This should be run as a periodic task
    
    Returns:
        Int: Number of alerts auto-resolved
    """
    resolved_count = 0
    
    # Get all active alerts
    active_alerts = StockAlert.objects.filter(
        status__in=[StockAlert.AlertStatus.ACTIVE, StockAlert.AlertStatus.ACKNOWLEDGED]
    ).select_related('stock')
    
    
    for alert in active_alerts:
        stock = alert.stock
        available = stock.quantity - stock.reserved_quantity
        
        # Check if stock is back above threshold
        should_resolve = False
        
        if alert.alert_type == StockAlert.AlertType.OUT_OF_STOCK:
            should_resolve = available > 0
        elif alert.alert_type == StockAlert.AlertType.CRITICAL:
            should_resolve = available > (stock.low_stock_threshold * 0.3)
        elif alert.alert_type == StockAlert.AlertType.LOW_STOCK:
            should_resolve = available > stock.low_stock_threshold
        
        if should_resolve:
            alert.resolve(notes=f'Auto-resolved: Stock level restored to {available} units')
            resolved_count += 1
    
    if resolved_count > 0:
        logger.info(f"Auto-resolved {resolved_count} stock alerts")
    
    return resolved_count


# Add this model to inventory app's models.py
StockAlert._meta.app_label = 'inventory'
