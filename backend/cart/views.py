from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.shortcuts import get_object_or_404
from .models import Cart, CartItem
from products.models import Product, ProductVariant
from .serializers import (
    CartSerializer, CartItemSerializer, AddToCartSerializer, UpdateCartItemSerializer
)


class CartViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Cart operations
    Supports both authenticated users and anonymous sessions
    """
    serializer_class = CartSerializer
    permission_classes = [AllowAny]
    
    def get_queryset(self):
        if self.request.user.is_authenticated:
            return Cart.objects.filter(user=self.request.user).prefetch_related('items__product', 'items__variant')
        else:
            session_key = self.request.session.session_key
            if not session_key:
                self.request.session.create()
                session_key = self.request.session.session_key
            return Cart.objects.filter(session_key=session_key).prefetch_related('items__product', 'items__variant')
    
    def get_or_create_cart(self):
        """Get or create cart for current user/session"""
        if self.request.user.is_authenticated:
            cart, created = Cart.objects.get_or_create(user=self.request.user)
        else:
            session_key = self.request.session.session_key
            if not session_key:
                self.request.session.create()
                session_key = self.request.session.session_key
            cart, created = Cart.objects.get_or_create(session_key=session_key)
        return cart
    
    def list(self, request):
        """Get current cart"""
        cart = self.get_or_create_cart()
        serializer = self.get_serializer(cart)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'])
    def add_item(self, request):
        """Add item to cart"""
        serializer = AddToCartSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        product_id = serializer.validated_data['product_id']
        variant_id = serializer.validated_data['variant_id']
        quantity = serializer.validated_data['quantity']
        
        # Validate product and variant exist
        product = get_object_or_404(Product, id=product_id, is_active=True)
        variant = get_object_or_404(ProductVariant, id=variant_id, product=product, is_active=True)
        
        # Check stock availability
        if variant.stock < quantity:
            return Response(
                {'error': f'Only {variant.stock} items available in stock'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get or create cart
        cart = self.get_or_create_cart()
        
        # Check if item already exists in cart
        cart_item, created = CartItem.objects.get_or_create(
            cart=cart,
            product=product,
            variant=variant,
            defaults={'quantity': quantity}
        )
        
        if not created:
            # Update quantity if item already exists
            new_quantity = cart_item.quantity + quantity
            if variant.stock < new_quantity:
                return Response(
                    {'error': f'Only {variant.stock} items available in stock'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            cart_item.quantity = new_quantity
            cart_item.save()
        
        cart_serializer = CartSerializer(cart)
        return Response(cart_serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=False, methods=['patch'])
    def update_item(self, request):
        """Update cart item quantity"""
        product_id = request.data.get('product_id')
        variant_id = request.data.get('variant_id')
        
        serializer = UpdateCartItemSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        quantity = serializer.validated_data['quantity']
        
        cart = self.get_or_create_cart()
        
        try:
            cart_item = CartItem.objects.get(
                cart=cart,
                product_id=product_id,
                variant_id=variant_id
            )
        except CartItem.DoesNotExist:
            return Response(
                {'error': 'Item not found in cart'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        if quantity == 0:
            # Remove item if quantity is 0
            cart_item.delete()
        else:
            # Check stock availability
            if cart_item.variant.stock < quantity:
                return Response(
                    {'error': f'Only {cart_item.variant.stock} items available in stock'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            cart_item.quantity = quantity
            cart_item.save()
        
        cart_serializer = CartSerializer(cart)
        return Response(cart_serializer.data)
    
    @action(detail=False, methods=['delete'])
    def remove_item(self, request):
        """Remove item from cart"""
        product_id = request.query_params.get('product_id')
        variant_id = request.query_params.get('variant_id')
        
        if not product_id or not variant_id:
            return Response(
                {'error': 'product_id and variant_id are required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        cart = self.get_or_create_cart()
        
        try:
            cart_item = CartItem.objects.get(
                cart=cart,
                product_id=product_id,
                variant_id=variant_id
            )
            cart_item.delete()
        except CartItem.DoesNotExist:
            return Response(
                {'error': 'Item not found in cart'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        cart_serializer = CartSerializer(cart)
        return Response(cart_serializer.data)
    
    @action(detail=False, methods=['post'])
    def clear(self, request):
        """Clear all items from cart"""
        cart = self.get_or_create_cart()
        cart.items.all().delete()
        
        cart_serializer = CartSerializer(cart)
        return Response(cart_serializer.data)
    
    @action(detail=False, methods=['get'])
    def summary(self, request):
        """Get cart summary with totals"""
        cart = self.get_or_create_cart()
        
        return Response({
            'total_items': cart.get_total_items(),
            'total_price': cart.get_total_price(),
            'items_count': cart.items.count()
        })
