from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Sum, Count, Avg, F, Q
from django.utils import timezone
from datetime import timedelta, datetime
from .models import (
    SalesReport, ProductPerformance, ProductTrend,
    ProductRelation, CustomerSegment
)
from .serializers import (
    SalesReportSerializer, ProductPerformanceSerializer,
    ProductTrendSerializer, ProductRelationSerializer,
    CustomerSegmentSerializer
)
from users.permissions import IsAdminUser
from orders.models import Order, OrderItem
from products.models import Product


class SalesReportViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for viewing sales reports
    """
    queryset = SalesReport.objects.all()
    serializer_class = SalesReportSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['report_type', 'warehouse', 'category', 'brand']
    ordering_fields = ['report_date', 'total_revenue']
    ordering = ['-report_date']
    
    @action(detail=False, methods=['get'])
    def generate(self, request):
        """Generate sales report for a specific period"""
        report_type = request.query_params.get('report_type', 'DAILY')
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        
        if not start_date or not end_date:
            return Response(
                {'error': 'start_date and end_date are required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            start = datetime.strptime(start_date, '%Y-%m-%d').date()
            end = datetime.strptime(end_date, '%Y-%m-%d').date()
        except ValueError:
            return Response(
                {'error': 'Invalid date format. Use YYYY-MM-DD'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get orders in the date range
        orders = Order.objects.filter(
            created_at__date__gte=start,
            created_at__date__lte=end,
            status=Order.OrderStatus.DELIVERED
        )
        
        # Calculate metrics
        total_orders = orders.count()
        total_revenue = orders.aggregate(Sum('total'))['total__sum'] or 0
        total_items = OrderItem.objects.filter(order__in=orders).aggregate(Sum('quantity'))['quantity__sum'] or 0
        avg_order_value = total_revenue / total_orders if total_orders > 0 else 0
        
        # Customer metrics
        unique_customers = orders.values('user').distinct().count()
        
        report_data = {
            'report_type': report_type,
            'period': f'{start} to {end}',
            'total_orders': total_orders,
            'total_items_sold': total_items,
            'total_revenue': float(total_revenue),
            'average_order_value': float(avg_order_value),
            'unique_customers': unique_customers,
        }
        
        return Response(report_data)
    
    @action(detail=False, methods=['get'])
    def dashboard_summary(self, request):
        """Get dashboard summary with key metrics"""
        today = timezone.now().date()
        last_30_days = today - timedelta(days=30)
        
        # Today's stats
        today_orders = Order.objects.filter(
            created_at__date=today,
            status=Order.OrderStatus.DELIVERED
        )
        today_revenue = today_orders.aggregate(Sum('total'))['total__sum'] or 0
        
        # Last 30 days stats
        month_orders = Order.objects.filter(
            created_at__date__gte=last_30_days,
            status=Order.OrderStatus.DELIVERED
        )
        month_revenue = month_orders.aggregate(Sum('total'))['total__sum'] or 0
        
        # Top products (last 30 days)
        top_products = OrderItem.objects.filter(
            order__created_at__date__gte=last_30_days,
            order__status=Order.OrderStatus.DELIVERED
        ).values('product__name').annotate(
            total_sold=Sum('quantity'),
            total_revenue=Sum(F('unit_price') * F('quantity'))
        ).order_by('-total_sold')[:5]
        
        return Response({
            'today': {
                'orders': today_orders.count(),
                'revenue': float(today_revenue),
            },
            'last_30_days': {
                'orders': month_orders.count(),
                'revenue': float(month_revenue),
            },
            'top_products': list(top_products)
        })


class ProductPerformanceViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for viewing product performance
    """
    queryset = ProductPerformance.objects.all().select_related('product', 'variant', 'warehouse')
    serializer_class = ProductPerformanceSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['product', 'period_type', 'warehouse']
    ordering_fields = ['report_date', 'units_sold', 'revenue']
    ordering = ['-report_date', '-units_sold']
    
    @action(detail=False, methods=['get'])
    def top_sellers(self, request):
        """Get top selling products"""
        period_type = request.query_params.get('period_type', 'MONTHLY')
        limit = int(request.query_params.get('limit', 10))
        
        # Get recent report date for the period
        latest = ProductPerformance.objects.filter(
            period_type=period_type
        ).order_by('-report_date').first()
        
        if not latest:
            return Response([])
        
        top_products = ProductPerformance.objects.filter(
            period_type=period_type,
            report_date=latest.report_date
        ).order_by('-units_sold')[:limit]
        
        serializer = self.get_serializer(top_products, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def low_sellers(self, request):
        """Get low selling products"""
        period_type = request.query_params.get('period_type', 'MONTHLY')
        limit = int(request.query_params.get('limit', 10))
        
        latest = ProductPerformance.objects.filter(
            period_type=period_type
        ).order_by('-report_date').first()
        
        if not latest:
            return Response([])
        
        low_products = ProductPerformance.objects.filter(
            period_type=period_type,
            report_date=latest.report_date,
            units_sold__gt=0
        ).order_by('units_sold')[:limit]
        
        serializer = self.get_serializer(low_products, many=True)
        return Response(serializer.data)


class ProductTrendViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for viewing product trends (3+ years)
    """
    queryset = ProductTrend.objects.all().select_related('product')
    serializer_class = ProductTrendSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['product', 'year']
    ordering_fields = ['year', 'month', 'total_revenue']
    ordering = ['-year', '-month']
    
    @action(detail=False, methods=['get'])
    def by_product(self, request):
        """Get trend data for a specific product"""
        product_id = request.query_params.get('product_id')
        years = int(request.query_params.get('years', 3))
        
        if not product_id:
            return Response(
                {'error': 'product_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        current_year = timezone.now().year
        start_year = current_year - years
        
        trends = ProductTrend.objects.filter(
            product_id=product_id,
            year__gte=start_year
        ).order_by('year', 'month')
        
        serializer = self.get_serializer(trends, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def seasonal_products(self, request):
        """Get products with seasonal trends"""
        seasonal = ProductTrend.objects.filter(
            is_seasonal=True
        ).values('product__name', 'peak_season').distinct()
        
        return Response(list(seasonal))


class ProductRelationViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for viewing product relations (frequently bought together)
    """
    queryset = ProductRelation.objects.all().select_related('product_a', 'product_b')
    serializer_class = ProductRelationSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['product_a', 'product_b']
    ordering_fields = ['times_bought_together', 'confidence_score']
    ordering = ['-times_bought_together']
    
    @action(detail=False, methods=['get'])
    def recommendations(self, request):
        """Get product recommendations based on a product"""
        product_id = request.query_params.get('product_id')
        limit = int(request.query_params.get('limit', 5))
        
        if not product_id:
            return Response(
                {'error': 'product_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get products frequently bought with this product
        relations = ProductRelation.objects.filter(
            product_a_id=product_id
        ).order_by('-confidence_score')[:limit]
        
        serializer = self.get_serializer(relations, many=True)
        return Response(serializer.data)


class CustomerSegmentViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for viewing customer segments
    """
    queryset = CustomerSegment.objects.all().select_related('user')
    serializer_class = CustomerSegmentSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['segment_type']
    ordering_fields = ['total_spent', 'total_orders']
    ordering = ['-total_spent']
    
    @action(detail=False, methods=['get'])
    def distribution(self, request):
        """Get customer segment distribution"""
        distribution = CustomerSegment.objects.values('segment_type').annotate(
            count=Count('id'),
            total_revenue=Sum('total_spent')
        ).order_by('-total_revenue')
        
        return Response(list(distribution))


class AnalyticsViewSet(viewsets.ViewSet):
    """
    ViewSet for general analytics endpoints
    """
    permission_classes = [IsAuthenticated, IsAdminUser]
    
    @action(detail=False, methods=['get'])
    def overview(self, request):
        """Get overall business analytics"""
        # Time periods
        today = timezone.now().date()
        this_month_start = today.replace(day=1)
        last_month_start = (this_month_start - timedelta(days=1)).replace(day=1)
        this_year_start = today.replace(month=1, day=1)
        
        # Total statistics
        total_orders = Order.objects.filter(status=Order.OrderStatus.DELIVERED).count()
        total_revenue = Order.objects.filter(
            status=Order.OrderStatus.DELIVERED
        ).aggregate(Sum('total'))['total__sum'] or 0
        
        # Monthly comparison
        this_month = Order.objects.filter(
            created_at__date__gte=this_month_start,
            status=Order.OrderStatus.DELIVERED
        )
        this_month_revenue = this_month.aggregate(Sum('total'))['total__sum'] or 0
        
        last_month = Order.objects.filter(
            created_at__date__gte=last_month_start,
            created_at__date__lt=this_month_start,
            status=Order.OrderStatus.DELIVERED
        )
        last_month_revenue = last_month.aggregate(Sum('total'))['total__sum'] or 0
        
        # Calculate growth
        growth = 0
        if last_month_revenue > 0:
            growth = ((this_month_revenue - last_month_revenue) / last_month_revenue) * 100
        
        return Response({
            'total_orders': total_orders,
            'total_revenue': float(total_revenue),
            'this_month_revenue': float(this_month_revenue),
            'last_month_revenue': float(last_month_revenue),
            'growth_percentage': round(growth, 2),
            'total_customers': CustomerSegment.objects.count(),
            'total_products': Product.objects.filter(is_active=True).count(),
        })
