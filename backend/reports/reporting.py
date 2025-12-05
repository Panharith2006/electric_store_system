"""
Comprehensive reporting generation for daily, weekly, monthly, and yearly reports
"""
from django.db.models import Sum, Count, Avg, F, Q
from django.utils import timezone
from datetime import datetime, timedelta
from decimal import Decimal
from typing import Dict, List, Optional
from reports.models import SalesReport, ProductPerformance, ProductTrend
from orders.models import Order
from products.models import Product, ProductVariant, Category, Brand
from inventory.models import Warehouse
from users.models import User
import logging

logger = logging.getLogger(__name__)


def generate_daily_report(date: datetime.date, warehouse: Optional[Warehouse] = None) -> Dict:
    """
    Generate comprehensive daily sales report
    
    Args:
        date: Date for the report
        warehouse: Optional warehouse filter
    
    Returns:
        Dict with daily metrics
    """
    # Query orders for the day
    orders_query = Order.objects.filter(
        created_at__date=date,
        status__in=['PROCESSING', 'SHIPPED', 'DELIVERED']
    )
    
    if warehouse:
        orders_query = orders_query.filter(warehouse=warehouse)
    
    # Calculate metrics
    total_orders = orders_query.count()
    total_items = orders_query.aggregate(
        items=Sum('items__quantity')
    )['items'] or 0
    
    revenue_data = orders_query.aggregate(
        revenue=Sum('total'),
        subtotal=Sum('subtotal'),
        tax=Sum('tax_amount'),
        shipping=Sum('shipping_cost'),
        discount=Sum('discount_amount')
    )
    
    total_revenue = revenue_data['revenue'] or Decimal('0')
    avg_order_value = (total_revenue / total_orders) if total_orders > 0 else Decimal('0')
    
    # Payment method breakdown
    payment_methods = orders_query.values('payment_method').annotate(
        count=Count('id'),
        revenue=Sum('total')
    )
    
    # Top products for the day
    from orders.models import OrderItem
    top_products = OrderItem.objects.filter(
        order__in=orders_query
    ).values(
        'variant__product__name',
        'variant__product__id'
    ).annotate(
        units_sold=Sum('quantity'),
        revenue=Sum(F('price') * F('quantity'))
    ).order_by('-units_sold')[:10]
    
    # New vs returning customers
    customer_ids = orders_query.filter(user__isnull=False).values_list('user_id', flat=True)
    new_customers = 0
    returning_customers = 0
    
    for customer_id in set(customer_ids):
        first_order = Order.objects.filter(user_id=customer_id).order_by('created_at').first()
        if first_order and first_order.created_at.date() == date:
            new_customers += 1
        else:
            returning_customers += 1
    
    report_data = {
        'report_date': date,
        'report_type': 'DAILY',
        'total_orders': total_orders,
        'total_items_sold': total_items,
        'total_revenue': float(total_revenue),
        'average_order_value': float(avg_order_value),
        'new_customers': new_customers,
        'returning_customers': returning_customers,
        'payment_methods': list(payment_methods),
        'top_products': list(top_products),
        'revenue_breakdown': {
            'subtotal': float(revenue_data['subtotal'] or 0),
            'tax': float(revenue_data['tax'] or 0),
            'shipping': float(revenue_data['shipping'] or 0),
            'discount': float(revenue_data['discount'] or 0),
        }
    }
    
    # Save to database
    SalesReport.objects.update_or_create(
        report_type='DAILY',
        report_date=date,
        warehouse=warehouse,
        defaults={
            'total_orders': total_orders,
            'total_items_sold': total_items,
            'total_revenue': total_revenue,
            'average_order_value': avg_order_value,
            'new_customers': new_customers,
            'returning_customers': returning_customers,
        }
    )
    
    logger.info(f"Daily report generated for {date}: {total_orders} orders, ${total_revenue} revenue")
    return report_data


def generate_weekly_report(start_date: datetime.date, warehouse: Optional[Warehouse] = None) -> Dict:
    """
    Generate weekly sales report (7 days)
    
    Args:
        start_date: Start date of the week
        warehouse: Optional warehouse filter
    
    Returns:
        Dict with weekly metrics
    """
    end_date = start_date + timedelta(days=6)
    
    # Query orders for the week
    orders_query = Order.objects.filter(
        created_at__date__gte=start_date,
        created_at__date__lte=end_date,
        status__in=['PROCESSING', 'SHIPPED', 'DELIVERED']
    )
    
    if warehouse:
        orders_query = orders_query.filter(warehouse=warehouse)
    
    # Calculate metrics
    total_orders = orders_query.count()
    total_items = orders_query.aggregate(items=Sum('items__quantity'))['items'] or 0
    total_revenue = orders_query.aggregate(revenue=Sum('total'))['revenue'] or Decimal('0')
    avg_order_value = (total_revenue / total_orders) if total_orders > 0 else Decimal('0')
    
    # Daily breakdown
    daily_breakdown = []
    for i in range(7):
        day = start_date + timedelta(days=i)
        day_orders = orders_query.filter(created_at__date=day)
        daily_breakdown.append({
            'date': day.isoformat(),
            'orders': day_orders.count(),
            'revenue': float(day_orders.aggregate(r=Sum('total'))['r'] or 0)
        })
    
    # Week-over-week comparison
    prev_start = start_date - timedelta(days=7)
    prev_end = start_date - timedelta(days=1)
    prev_orders = Order.objects.filter(
        created_at__date__gte=prev_start,
        created_at__date__lte=prev_end,
        status__in=['PROCESSING', 'SHIPPED', 'DELIVERED']
    )
    if warehouse:
        prev_orders = prev_orders.filter(warehouse=warehouse)
    
    prev_revenue = prev_orders.aggregate(r=Sum('total'))['r'] or Decimal('0')
    revenue_change = float(((total_revenue - prev_revenue) / prev_revenue * 100) if prev_revenue > 0 else 0)
    
    # Top products
    from orders.models import OrderItem
    top_products = OrderItem.objects.filter(
        order__in=orders_query
    ).values(
        'variant__product__name',
        'variant__product__id'
    ).annotate(
        units_sold=Sum('quantity'),
        revenue=Sum(F('price') * F('quantity'))
    ).order_by('-revenue')[:10]
    
    report_data = {
        'report_type': 'WEEKLY',
        'start_date': start_date,
        'end_date': end_date,
        'total_orders': total_orders,
        'total_items_sold': total_items,
        'total_revenue': float(total_revenue),
        'average_order_value': float(avg_order_value),
        'revenue_change_percent': revenue_change,
        'daily_breakdown': daily_breakdown,
        'top_products': list(top_products),
    }
    
    # Save to database
    SalesReport.objects.update_or_create(
        report_type='WEEKLY',
        report_date=start_date,
        warehouse=warehouse,
        defaults={
            'total_orders': total_orders,
            'total_items_sold': total_items,
            'total_revenue': total_revenue,
            'average_order_value': avg_order_value,
        }
    )
    
    logger.info(f"Weekly report generated for {start_date} to {end_date}: {total_orders} orders, ${total_revenue} revenue")
    return report_data


def generate_monthly_report(year: int, month: int, warehouse: Optional[Warehouse] = None) -> Dict:
    """
    Generate comprehensive monthly sales report
    
    Args:
        year: Year for the report
        month: Month (1-12) for the report
        warehouse: Optional warehouse filter
    
    Returns:
        Dict with monthly metrics
    """
    from calendar import monthrange
    
    start_date = datetime(year, month, 1).date()
    last_day = monthrange(year, month)[1]
    end_date = datetime(year, month, last_day).date()
    
    # Query orders for the month
    orders_query = Order.objects.filter(
        created_at__date__gte=start_date,
        created_at__date__lte=end_date,
        status__in=['PROCESSING', 'SHIPPED', 'DELIVERED']
    )
    
    if warehouse:
        orders_query = orders_query.filter(warehouse=warehouse)
    
    # Calculate metrics
    total_orders = orders_query.count()
    total_items = orders_query.aggregate(items=Sum('items__quantity'))['items'] or 0
    total_revenue = orders_query.aggregate(revenue=Sum('total'))['revenue'] or Decimal('0')
    avg_order_value = (total_revenue / total_orders) if total_orders > 0 else Decimal('0')
    
    # Week-by-week breakdown
    weekly_breakdown = []
    current_date = start_date
    week_num = 1
    while current_date <= end_date:
        week_end = min(current_date + timedelta(days=6), end_date)
        week_orders = orders_query.filter(
            created_at__date__gte=current_date,
            created_at__date__lte=week_end
        )
        weekly_breakdown.append({
            'week': week_num,
            'start_date': current_date.isoformat(),
            'end_date': week_end.isoformat(),
            'orders': week_orders.count(),
            'revenue': float(week_orders.aggregate(r=Sum('total'))['r'] or 0)
        })
        current_date = week_end + timedelta(days=1)
        week_num += 1
    
    # Month-over-month comparison
    prev_month = month - 1 if month > 1 else 12
    prev_year = year if month > 1 else year - 1
    prev_start = datetime(prev_year, prev_month, 1).date()
    prev_last_day = monthrange(prev_year, prev_month)[1]
    prev_end = datetime(prev_year, prev_month, prev_last_day).date()
    
    prev_orders = Order.objects.filter(
        created_at__date__gte=prev_start,
        created_at__date__lte=prev_end,
        status__in=['PROCESSING', 'SHIPPED', 'DELIVERED']
    )
    if warehouse:
        prev_orders = prev_orders.filter(warehouse=warehouse)
    
    prev_revenue = prev_orders.aggregate(r=Sum('total'))['r'] or Decimal('0')
    revenue_change = float(((total_revenue - prev_revenue) / prev_revenue * 100) if prev_revenue > 0 else 0)
    
    # Category performance
    from orders.models import OrderItem
    category_performance = OrderItem.objects.filter(
        order__in=orders_query
    ).values(
        'variant__product__category__name'
    ).annotate(
        revenue=Sum(F('price') * F('quantity')),
        units=Sum('quantity')
    ).order_by('-revenue')
    
    # Brand performance
    brand_performance = OrderItem.objects.filter(
        order__in=orders_query
    ).values(
        'variant__product__brand__name'
    ).annotate(
        revenue=Sum(F('price') * F('quantity')),
        units=Sum('quantity')
    ).order_by('-revenue')
    
    report_data = {
        'report_type': 'MONTHLY',
        'year': year,
        'month': month,
        'start_date': start_date,
        'end_date': end_date,
        'total_orders': total_orders,
        'total_items_sold': total_items,
        'total_revenue': float(total_revenue),
        'average_order_value': float(avg_order_value),
        'revenue_change_percent': revenue_change,
        'weekly_breakdown': weekly_breakdown,
        'category_performance': list(category_performance),
        'brand_performance': list(brand_performance),
    }
    
    # Save to database
    SalesReport.objects.update_or_create(
        report_type='MONTHLY',
        report_date=start_date,
        warehouse=warehouse,
        defaults={
            'total_orders': total_orders,
            'total_items_sold': total_items,
            'total_revenue': total_revenue,
            'average_order_value': avg_order_value,
        }
    )
    
    logger.info(f"Monthly report generated for {year}-{month:02d}: {total_orders} orders, ${total_revenue} revenue")
    return report_data


def generate_yearly_report(year: int, warehouse: Optional[Warehouse] = None) -> Dict:
    """
    Generate comprehensive yearly sales report
    
    Args:
        year: Year for the report
        warehouse: Optional warehouse filter
    
    Returns:
        Dict with yearly metrics
    """
    start_date = datetime(year, 1, 1).date()
    end_date = datetime(year, 12, 31).date()
    
    # Query orders for the year
    orders_query = Order.objects.filter(
        created_at__date__gte=start_date,
        created_at__date__lte=end_date,
        status__in=['PROCESSING', 'SHIPPED', 'DELIVERED']
    )
    
    if warehouse:
        orders_query = orders_query.filter(warehouse=warehouse)
    
    # Calculate metrics
    total_orders = orders_query.count()
    total_items = orders_query.aggregate(items=Sum('items__quantity'))['items'] or 0
    total_revenue = orders_query.aggregate(revenue=Sum('total'))['revenue'] or Decimal('0')
    avg_order_value = (total_revenue / total_orders) if total_orders > 0 else Decimal('0')
    
    # Monthly breakdown
    monthly_breakdown = []
    for month in range(1, 13):
        month_start = datetime(year, month, 1).date()
        from calendar import monthrange
        last_day = monthrange(year, month)[1]
        month_end = datetime(year, month, last_day).date()
        
        month_orders = orders_query.filter(
            created_at__date__gte=month_start,
            created_at__date__lte=month_end
        )
        monthly_breakdown.append({
            'month': month,
            'month_name': datetime(year, month, 1).strftime('%B'),
            'orders': month_orders.count(),
            'revenue': float(month_orders.aggregate(r=Sum('total'))['r'] or 0)
        })
    
    # Year-over-year comparison
    prev_year = year - 1
    prev_start = datetime(prev_year, 1, 1).date()
    prev_end = datetime(prev_year, 12, 31).date()
    
    prev_orders = Order.objects.filter(
        created_at__date__gte=prev_start,
        created_at__date__lte=prev_end,
        status__in=['PROCESSING', 'SHIPPED', 'DELIVERED']
    )
    if warehouse:
        prev_orders = prev_orders.filter(warehouse=warehouse)
    
    prev_revenue = prev_orders.aggregate(r=Sum('total'))['r'] or Decimal('0')
    revenue_change = float(((total_revenue - prev_revenue) / prev_revenue * 100) if prev_revenue > 0 else 0)
    
    # Top products of the year
    from orders.models import OrderItem
    top_products = OrderItem.objects.filter(
        order__in=orders_query
    ).values(
        'variant__product__name',
        'variant__product__id'
    ).annotate(
        units_sold=Sum('quantity'),
        revenue=Sum(F('price') * F('quantity'))
    ).order_by('-revenue')[:20]
    
    report_data = {
        'report_type': 'YEARLY',
        'year': year,
        'total_orders': total_orders,
        'total_items_sold': total_items,
        'total_revenue': float(total_revenue),
        'average_order_value': float(avg_order_value),
        'revenue_change_percent': revenue_change,
        'monthly_breakdown': monthly_breakdown,
        'top_products': list(top_products),
    }
    
    # Save to database
    SalesReport.objects.update_or_create(
        report_type='YEARLY',
        report_date=start_date,
        warehouse=warehouse,
        defaults={
            'total_orders': total_orders,
            'total_items_sold': total_items,
            'total_revenue': total_revenue,
            'average_order_value': avg_order_value,
        }
    )
    
    logger.info(f"Yearly report generated for {year}: {total_orders} orders, ${total_revenue} revenue")
    return report_data


def generate_all_reports(date: Optional[datetime.date] = None):
    """
    Generate all report types for a given date
    Useful for scheduled tasks
    """
    if date is None:
        date = timezone.now().date()
    
    # Generate daily report
    daily = generate_daily_report(date)
    
    # Generate weekly report (if it's the last day of the week)
    if date.weekday() == 6:  # Sunday
        week_start = date - timedelta(days=6)
        weekly = generate_weekly_report(week_start)
    
    # Generate monthly report (if it's the last day of the month)
    from calendar import monthrange
    if date.day == monthrange(date.year, date.month)[1]:
        monthly = generate_monthly_report(date.year, date.month)
    
    # Generate yearly report (if it's Dec 31)
    if date.month == 12 and date.day == 31:
        yearly = generate_yearly_report(date.year)
    
    logger.info(f"All applicable reports generated for {date}")
