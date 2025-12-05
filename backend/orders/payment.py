"""
Payment gateway integration for Stripe and PayPal
"""
import stripe
from decimal import Decimal
from django.conf import settings
from typing import Dict, Optional
import logging

logger = logging.getLogger(__name__)

# Initialize Stripe (add STRIPE_SECRET_KEY to settings)
if hasattr(settings, 'STRIPE_SECRET_KEY'):
    stripe.api_key = settings.STRIPE_SECRET_KEY


class PaymentProcessor:
    """Base payment processor class"""
    
    def create_payment_intent(self, amount: Decimal, currency: str, metadata: Dict) -> Dict:
        """Create a payment intent"""
        raise NotImplementedError
    
    def confirm_payment(self, payment_id: str) -> Dict:
        """Confirm a payment"""
        raise NotImplementedError
    
    def refund_payment(self, payment_id: str, amount: Optional[Decimal] = None) -> Dict:
        """Process a refund"""
        raise NotImplementedError


class StripePaymentProcessor(PaymentProcessor):
    """Stripe payment integration"""
    
    def create_payment_intent(self, amount: Decimal, currency: str = 'usd', metadata: Dict = None) -> Dict:
        """
        Create a Stripe payment intent
        
        Args:
            amount: Payment amount (will be converted to cents)
            currency: Currency code (default: 'usd')
            metadata: Additional metadata (order_id, customer_email, etc.)
        
        Returns:
            Dict with client_secret and payment_intent_id
        """
        try:
            # Convert dollars to cents
            amount_cents = int(amount * 100)
            
            payment_intent = stripe.PaymentIntent.create(
                amount=amount_cents,
                currency=currency,
                metadata=metadata or {},
                automatic_payment_methods={
                    'enabled': True,
                },
            )
            
            return {
                'success': True,
                'client_secret': payment_intent.client_secret,
                'payment_intent_id': payment_intent.id,
                'status': payment_intent.status,
            }
        except stripe.error.StripeError as e:
            logger.error(f"Stripe payment intent creation failed: {e}")
            return {
                'success': False,
                'error': str(e),
            }
    
    def confirm_payment(self, payment_intent_id: str) -> Dict:
        """
        Confirm a Stripe payment
        
        Args:
            payment_intent_id: Stripe payment intent ID
        
        Returns:
            Dict with payment status
        """
        try:
            payment_intent = stripe.PaymentIntent.retrieve(payment_intent_id)
            
            return {
                'success': True,
                'status': payment_intent.status,
                'amount': Decimal(payment_intent.amount) / 100,
                'currency': payment_intent.currency,
                'payment_method': payment_intent.payment_method,
            }
        except stripe.error.StripeError as e:
            logger.error(f"Stripe payment confirmation failed: {e}")
            return {
                'success': False,
                'error': str(e),
            }
    
    def refund_payment(self, payment_intent_id: str, amount: Optional[Decimal] = None) -> Dict:
        """
        Process a Stripe refund
        
        Args:
            payment_intent_id: Stripe payment intent ID
            amount: Refund amount (None for full refund)
        
        Returns:
            Dict with refund status
        """
        try:
            refund_data = {'payment_intent': payment_intent_id}
            
            if amount is not None:
                refund_data['amount'] = int(amount * 100)
            
            refund = stripe.Refund.create(**refund_data)
            
            return {
                'success': True,
                'refund_id': refund.id,
                'status': refund.status,
                'amount': Decimal(refund.amount) / 100,
            }
        except stripe.error.StripeError as e:
            logger.error(f"Stripe refund failed: {e}")
            return {
                'success': False,
                'error': str(e),
            }
    
    def create_customer(self, email: str, name: str, metadata: Dict = None) -> Dict:
        """Create a Stripe customer for recurring payments"""
        try:
            customer = stripe.Customer.create(
                email=email,
                name=name,
                metadata=metadata or {},
            )
            
            return {
                'success': True,
                'customer_id': customer.id,
            }
        except stripe.error.StripeError as e:
            logger.error(f"Stripe customer creation failed: {e}")
            return {
                'success': False,
                'error': str(e),
            }


class PayPalPaymentProcessor(PaymentProcessor):
    """
    PayPal payment integration (placeholder - needs PayPal SDK)
    For production, install: pip install paypalrestsdk
    """
    
    def create_payment_intent(self, amount: Decimal, currency: str = 'USD', metadata: Dict = None) -> Dict:
        """
        Create a PayPal payment
        NOTE: This is a placeholder. For production:
        1. Install paypalrestsdk
        2. Configure PayPal API credentials
        3. Implement PayPal payment flow
        """
        return {
            'success': False,
            'error': 'PayPal integration not yet implemented. Please use Stripe or Cash on Delivery.',
        }
    
    def confirm_payment(self, payment_id: str) -> Dict:
        """Confirm PayPal payment"""
        return {
            'success': False,
            'error': 'PayPal integration not yet implemented.',
        }
    
    def refund_payment(self, payment_id: str, amount: Optional[Decimal] = None) -> Dict:
        """Process PayPal refund"""
        return {
            'success': False,
            'error': 'PayPal integration not yet implemented.',
        }


def get_payment_processor(method: str) -> PaymentProcessor:
    """
    Get payment processor instance by method
    
    Args:
        method: Payment method ('CARD', 'PAYPAL', etc.)
    
    Returns:
        PaymentProcessor instance
    """
    if method in ['CARD', 'CREDIT_CARD', 'STRIPE']:
        return StripePaymentProcessor()
    elif method == 'PAYPAL':
        return PayPalPaymentProcessor()
    else:
        raise ValueError(f"Unsupported payment method: {method}")


def process_payment(order, payment_method: str) -> Dict:
    """
    Process payment for an order
    
    Args:
        order: Order instance
        payment_method: Payment method code
    
    Returns:
        Dict with payment result
    """
    # Cash on delivery doesn't need processing
    if payment_method == 'COD':
        return {
            'success': True,
            'payment_method': 'COD',
            'message': 'Order will be paid on delivery',
        }
    
    # Get appropriate processor
    try:
        processor = get_payment_processor(payment_method)
    except ValueError as e:
        return {
            'success': False,
            'error': str(e),
        }
    
    # Create payment intent
    metadata = {
        'order_number': order.order_number,
        'customer_email': order.user.email if order.user else order.shipping_email,
        'customer_name': order.shipping_name,
    }
    
    result = processor.create_payment_intent(
        amount=order.total,
        currency='usd',
        metadata=metadata,
    )
    
    return result


def confirm_payment_for_order(order, payment_intent_id: str) -> Dict:
    """
    Confirm payment for an order
    
    Args:
        order: Order instance
        payment_intent_id: Payment gateway transaction ID
    
    Returns:
        Dict with confirmation result
    """
    processor = get_payment_processor(order.payment_method)
    result = processor.confirm_payment(payment_intent_id)
    
    if result.get('success'):
        # Update order
        order.payment_status = 'PAID'
        order.transaction_id = payment_intent_id
        order.save()
    
    return result


def process_refund(order, amount: Optional[Decimal] = None) -> Dict:
    """
    Process a refund for an order
    
    Args:
        order: Order instance
        amount: Refund amount (None for full refund)
    
    Returns:
        Dict with refund result
    """
    if not order.transaction_id:
        return {
            'success': False,
            'error': 'No transaction ID found for this order',
        }
    
    processor = get_payment_processor(order.payment_method)
    result = processor.refund_payment(order.transaction_id, amount)
    
    if result.get('success'):
        # Update order status
        order.status = 'REFUNDED'
        order.save()
    
    return result
