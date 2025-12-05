from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.db import transaction
from django.utils import timezone
from .models import Order, OrderItem, Favorite
from .serializers import (
    OrderSerializer, OrderListSerializer, CreateOrderSerializer,
    OrderItemSerializer, FavoriteSerializer
)
from cart.models import Cart
from products.models import Product, ProductVariant
from inventory.models import Stock, StockMovement


class OrderViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Order operations
    """
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.OrderingFilter, filters.SearchFilter]
    ordering_fields = ['created_at', 'total', 'status']
    ordering = ['-created_at']
    search_fields = ['order_number', 'shipping_name', 'shipping_email']
    
    def get_queryset(self):
        user = self.request.user
        if user.is_admin:
            return Order.objects.all().prefetch_related('items__product', 'items__variant')
        return Order.objects.filter(user=user).prefetch_related('items__product', 'items__variant')
    
    def get_serializer_class(self):
        if self.action == 'list':
            return OrderListSerializer
        elif self.action == 'create':
            return CreateOrderSerializer
        return OrderSerializer
    
    @transaction.atomic
    def create(self, request):
        """Create order from cart"""
        serializer = CreateOrderSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        user = request.user
        
        # Get user's cart
        try:
            cart = Cart.objects.get(user=user)
        except Cart.DoesNotExist:
            return Response(
                {'error': 'Cart is empty'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        cart_items = cart.items.all()
        if not cart_items.exists():
            return Response(
                {'error': 'Cart is empty'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Validate stock availability for all items
        for cart_item in cart_items:
            if cart_item.variant.stock < cart_item.quantity:
                return Response(
                    {'error': f'Insufficient stock for {cart_item.product.name}'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        # Calculate totals
        subtotal = sum(item.get_total_price() for item in cart_items)
        tax = subtotal * 0.08  # 8% tax (adjust as needed)
        shipping_cost = 0 if subtotal > 100 else 10  # Free shipping over $100
        total = subtotal + tax + shipping_cost
        
        # Create order
        order = Order.objects.create(
            user=user,
            status=Order.OrderStatus.PENDING,
            shipping_name=serializer.validated_data['shipping_name'],
            shipping_email=serializer.validated_data['shipping_email'],
            shipping_phone=serializer.validated_data['shipping_phone'],
            shipping_address_line1=serializer.validated_data['shipping_address_line1'],
            shipping_address_line2=serializer.validated_data.get('shipping_address_line2', ''),
            shipping_city=serializer.validated_data['shipping_city'],
            shipping_state=serializer.validated_data['shipping_state'],
            shipping_postal_code=serializer.validated_data['shipping_postal_code'],
            shipping_country=serializer.validated_data.get('shipping_country', 'USA'),
            payment_method=serializer.validated_data['payment_method'],
            customer_notes=serializer.validated_data.get('customer_notes', ''),
            subtotal=subtotal,
            tax=tax,
            shipping_cost=shipping_cost,
            total=total
        )
        
        # Create order items and update stock
        for cart_item in cart_items:
            OrderItem.objects.create(
                order=order,
                product=cart_item.product,
                variant=cart_item.variant,
                product_name=cart_item.product.name,
                variant_storage=cart_item.storage,
                variant_color=cart_item.color,
                unit_price=cart_item.price,
                quantity=cart_item.quantity,
                product_image=cart_item.image or cart_item.product.image
            )
            
            # Update stock
            cart_item.variant.stock -= cart_item.quantity
            cart_item.variant.save()
        
        # Clear cart
        cart_items.delete()
        
        order_serializer = OrderSerializer(order)
        return Response(order_serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['patch'])
    def update_status(self, request, pk=None):
        """Update order status (admin only)"""
        if not request.user.is_admin:
            return Response(
                {'error': 'Permission denied'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        order = self.get_object()
        new_status = request.data.get('status')
        
        if new_status not in dict(Order.OrderStatus.choices):
            return Response(
                {'error': 'Invalid status'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        order.status = new_status
        
        # Update timestamps based on status
        now = timezone.now()
        if new_status == Order.OrderStatus.SHIPPED and not order.shipped_at:
            order.shipped_at = now
        elif new_status == Order.OrderStatus.DELIVERED and not order.delivered_at:
            order.delivered_at = now
        
        order.save()
        
        serializer = OrderSerializer(order)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """Cancel order"""
        order = self.get_object()
        
        if order.status not in [Order.OrderStatus.PENDING, Order.OrderStatus.PROCESSING]:
            return Response(
                {'error': 'Cannot cancel order in current status'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        with transaction.atomic():
            # Restore stock
            for item in order.items.all():
                item.variant.stock += item.quantity
                item.variant.save()
            
            order.status = Order.OrderStatus.CANCELLED
            order.save()
        
        serializer = OrderSerializer(order)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """Get order statistics for current user"""
        user = request.user
        orders = Order.objects.filter(user=user)
        
        return Response({
            'total_orders': orders.count(),
            'pending_orders': orders.filter(status=Order.OrderStatus.PENDING).count(),
            'completed_orders': orders.filter(status=Order.OrderStatus.DELIVERED).count(),
            'total_spent': sum(o.total for o in orders.filter(status=Order.OrderStatus.DELIVERED)),
        })
    
    @action(detail=True, methods=['post'])
    def create_payment_intent(self, request, pk=None):
        """Create payment intent for Stripe/PayPal"""
        from .payment import process_payment
        
        order = self.get_object()
        
        # Check if order is already paid
        if order.payment_status == 'PAID':
            return Response(
                {'error': 'Order is already paid'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        payment_method = request.data.get('payment_method', order.payment_method)
        
        # Process payment
        result = process_payment(order, payment_method)
        
        if result.get('success'):
            # Update order with payment intent details
            if 'payment_intent_id' in result:
                order.transaction_id = result['payment_intent_id']
                order.payment_status = 'PENDING'
                order.save()
            
            return Response(result)
        else:
            return Response(result, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'])
    def confirm_payment(self, request, pk=None):
        """Confirm payment completion"""
        from .payment import confirm_payment_for_order
        
        order = self.get_object()
        payment_intent_id = request.data.get('payment_intent_id')
        
        if not payment_intent_id:
            return Response(
                {'error': 'payment_intent_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        result = confirm_payment_for_order(order, payment_intent_id)
        
        if result.get('success'):
            # Update order status
            order.status = Order.OrderStatus.PROCESSING
            order.paid_at = timezone.now()
            order.save()
            
            serializer = OrderSerializer(order)
            return Response({
                'message': 'Payment confirmed successfully',
                'order': serializer.data
            })
        else:
            return Response(result, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'])
    def refund(self, request, pk=None):
        """Process refund for order (admin only)"""
        from .payment import process_refund
        
        if not request.user.is_admin:
            return Response(
                {'error': 'Permission denied'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        order = self.get_object()
        amount = request.data.get('amount')  # None for full refund
        
        if amount:
            from decimal import Decimal
            amount = Decimal(str(amount))
        
        result = process_refund(order, amount)
        
        if result.get('success'):
            serializer = OrderSerializer(order)
            return Response({
                'message': 'Refund processed successfully',
                'refund': result,
                'order': serializer.data
            })
        else:
            return Response(result, status=status.HTTP_400_BAD_REQUEST)


class FavoriteViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing user favorites/wishlist
    """
    permission_classes = [IsAuthenticated]
    serializer_class = FavoriteSerializer
    
    def get_queryset(self):
        return Favorite.objects.filter(user=self.request.user).select_related('product')
    
    def create(self, request):
        """Add product to favorites"""
        product_id = request.data.get('product_id')
        
        if not product_id:
            return Response(
                {'error': 'product_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        product = get_object_or_404(Product, id=product_id, is_active=True)
        
        favorite, created = Favorite.objects.get_or_create(
            user=request.user,
            product=product
        )
        
        if not created:
            return Response(
                {'message': 'Product already in favorites'},
                status=status.HTTP_200_OK
            )
        
        serializer = self.get_serializer(favorite)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=False, methods=['delete'])
    def remove(self, request):
        """Remove product from favorites"""
        product_id = request.query_params.get('product_id')
        
        if not product_id:
            return Response(
                {'error': 'product_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            favorite = Favorite.objects.get(user=request.user, product_id=product_id)
            favorite.delete()
            return Response({'message': 'Removed from favorites'}, status=status.HTTP_200_OK)
        except Favorite.DoesNotExist:
            return Response(
                {'error': 'Product not in favorites'},
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=False, methods=['get'])
    def check(self, request):
        """Check if product is in favorites"""
        product_id = request.query_params.get('product_id')
        
        if not product_id:
            return Response(
                {'error': 'product_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        is_favorite = Favorite.objects.filter(
            user=request.user,
            product_id=product_id
        ).exists()
        
        return Response({'is_favorite': is_favorite})
