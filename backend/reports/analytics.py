"""
Product relations, recommendations, and 3-year trend analysis
"""
from django.db.models import Count, Sum, Avg, F, Q
from django.utils import timezone
from datetime import datetime, timedelta
from collections import defaultdict
from typing import List, Dict, Tuple
from products.models import Product, ProductVariant
from orders.models import Order, OrderItem
from reports.models import ProductTrend, ProductPerformance
import logging

logger = logging.getLogger(__name__)


def analyze_product_relations(product: Product, min_occurrences: int = 5) -> List[Dict]:
    """
    Analyze "frequently bought together" relationships for a product
    
    Args:
        product: Product to analyze
        min_occurrences: Minimum times products must be bought together
    
    Returns:
        List of related products with co-purchase count
    """
    # Find all orders containing this product
    orders_with_product = OrderItem.objects.filter(
        variant__product=product
    ).values_list('order_id', flat=True).distinct()
    
    # Find other products in those orders
    related_products = OrderItem.objects.filter(
        order_id__in=orders_with_product
    ).exclude(
        variant__product=product
    ).values(
        'variant__product__id',
        'variant__product__name'
    ).annotate(
        co_purchase_count=Count('order_id', distinct=True)
    ).filter(
        co_purchase_count__gte=min_occurrences
    ).order_by('-co_purchase_count')[:10]
    
    relations = list(related_products)
    
    # Calculate confidence (what % of orders with product A also have product B)
    total_orders_with_product = len(set(orders_with_product))
    
    for relation in relations:
        relation['confidence'] = round(
            (relation['co_purchase_count'] / total_orders_with_product * 100), 2
        ) if total_orders_with_product > 0 else 0
    
    logger.info(f"Analyzed relations for {product.name}: found {len(relations)} frequently bought together products")
    return relations


def generate_product_recommendations(product: Product, limit: int = 5) -> List[Product]:
    """
    Generate product recommendations based on purchase history and relations
    
    Args:
        product: Product to generate recommendations for
        limit: Maximum number of recommendations
    
    Returns:
        List of recommended Product instances
    """
    # Get related products from analysis
    relations = analyze_product_relations(product)
    
    # Get product IDs sorted by relevance
    recommended_ids = [r['variant__product__id'] for r in relations[:limit]]
    
    # Fetch product instances (preserve order)
    recommended_products = []
    for product_id in recommended_ids:
        try:
            p = Product.objects.get(pk=product_id, is_active=True)
            recommended_products.append(p)
        except Product.DoesNotExist:
            continue
    
    # If we don't have enough, fill with products from same category
    if len(recommended_products) < limit:
        similar_products = Product.objects.filter(
            category=product.category,
            is_active=True
        ).exclude(
            id__in=[p.id for p in recommended_products] + [product.id]
        ).order_by('-average_rating', '-total_reviews')[:limit - len(recommended_products)]
        
        recommended_products.extend(list(similar_products))
    
    return recommended_products[:limit]


def get_top_selling_products(
    days: int = 30,
    category=None,
    brand=None,
    limit: int = 10
) -> List[Dict]:
    """
    Get top selling products by various criteria
    
    Args:
        days: Number of days to analyze
        category: Optional category filter
        brand: Optional brand filter
        limit: Number of products to return
    
    Returns:
        List of top selling products with metrics
    """
    start_date = timezone.now() - timedelta(days=days)
    
    # Base query
    query = OrderItem.objects.filter(
        order__created_at__gte=start_date,
        order__status__in=['PROCESSING', 'SHIPPED', 'DELIVERED']
    )
    
    # Apply filters
    if category:
        query = query.filter(variant__product__category=category)
    if brand:
        query = query.filter(variant__product__brand=brand)
    
    # Aggregate by product
    top_products = query.values(
        'variant__product__id',
        'variant__product__name',
        'variant__product__brand__name',
        'variant__product__category__name',
    ).annotate(
        units_sold=Sum('quantity'),
        revenue=Sum(F('price') * F('quantity')),
        orders=Count('order_id', distinct=True),
        avg_price=Avg('price')
    ).order_by('-units_sold')[:limit]
    
    return list(top_products)


def get_low_selling_products(
    days: int = 90,
    category=None,
    brand=None,
    limit: int = 10
) -> List[Dict]:
    """
    Get products with lowest sales (potential clearance candidates)
    
    Args:
        days: Number of days to analyze
        category: Optional category filter
        brand: Optional brand filter
        limit: Number of products to return
    
    Returns:
        List of low selling products
    """
    start_date = timezone.now() - timedelta(days=days)
    
    # Get all active products
    products_query = Product.objects.filter(is_active=True)
    
    if category:
        products_query = products_query.filter(category=category)
    if brand:
        products_query = products_query.filter(brand=brand)
    
    # Annotate with sales data
    low_sellers = products_query.annotate(
        units_sold=Sum(
            'variants__orderitem__quantity',
            filter=Q(
                variants__orderitem__order__created_at__gte=start_date,
                variants__orderitem__order__status__in=['PROCESSING', 'SHIPPED', 'DELIVERED']
            )
        ),
        revenue=Sum(
            F('variants__orderitem__price') * F('variants__orderitem__quantity'),
            filter=Q(
                variants__orderitem__order__created_at__gte=start_date,
                variants__orderitem__order__status__in=['PROCESSING', 'SHIPPED', 'DELIVERED']
            )
        )
    ).filter(
        Q(units_sold__isnull=True) | Q(units_sold__lte=5)
    ).order_by('units_sold')[:limit]
    
    result = []
    for product in low_sellers:
        result.append({
            'id': product.id,
            'name': product.name,
            'brand': product.brand.name,
            'category': product.category.name,
            'units_sold': product.units_sold or 0,
            'revenue': float(product.revenue or 0),
            'base_price': float(product.base_price),
        })
    
    return result


def analyze_three_year_trends(product: Product) -> Dict:
    """
    Analyze 3+ year trends for a product including seasonality and growth patterns
    
    Args:
        product: Product to analyze
    
    Returns:
        Dict with trend analysis
    """
    end_date = timezone.now()
    start_date = end_date - timedelta(days=3*365)  # 3 years ago
    
    # Get historical sales data
    historical_sales = OrderItem.objects.filter(
        variant__product=product,
        order__created_at__gte=start_date,
        order__status__in=['PROCESSING', 'SHIPPED', 'DELIVERED']
    ).values(
        'order__created_at__year',
        'order__created_at__month'
    ).annotate(
        units_sold=Sum('quantity'),
        revenue=Sum(F('price') * F('quantity'))
    ).order_by('order__created_at__year', 'order__created_at__month')
    
    # Organize by year and month
    yearly_data = defaultdict(lambda: defaultdict(lambda: {'units': 0, 'revenue': 0}))
    
    for record in historical_sales:
        year = record['order__created_at__year']
        month = record['order__created_at__month']
        yearly_data[year][month] = {
            'units': record['units_sold'],
            'revenue': float(record['revenue'])
        }
    
    # Calculate yearly totals and growth
    yearly_totals = []
    previous_year_revenue = None
    
    for year in sorted(yearly_data.keys()):
        total_units = sum(m['units'] for m in yearly_data[year].values())
        total_revenue = sum(m['revenue'] for m in yearly_data[year].values())
        
        growth_rate = 0
        if previous_year_revenue and previous_year_revenue > 0:
            growth_rate = ((total_revenue - previous_year_revenue) / previous_year_revenue) * 100
        
        yearly_totals.append({
            'year': year,
            'units_sold': total_units,
            'revenue': total_revenue,
            'growth_rate': round(growth_rate, 2),
            'monthly_data': dict(yearly_data[year])
        })
        
        previous_year_revenue = total_revenue
    
    # Identify seasonal trends (which months typically have high sales)
    monthly_averages = defaultdict(lambda: {'units': [], 'revenue': []})
    
    for year_data in yearly_data.values():
        for month, data in year_data.items():
            monthly_averages[month]['units'].append(data['units'])
            monthly_averages[month]['revenue'].append(data['revenue'])
    
    seasonal_pattern = []
    for month in range(1, 13):
        units_list = monthly_averages[month]['units']
        revenue_list = monthly_averages[month]['revenue']
        
        seasonal_pattern.append({
            'month': month,
            'month_name': datetime(2000, month, 1).strftime('%B'),
            'avg_units': round(sum(units_list) / len(units_list), 2) if units_list else 0,
            'avg_revenue': round(sum(revenue_list) / len(revenue_list), 2) if revenue_list else 0,
        })
    
    # Identify peak and low seasons
    sorted_by_units = sorted(seasonal_pattern, key=lambda x: x['avg_units'], reverse=True)
    peak_months = [m['month_name'] for m in sorted_by_units[:3]]
    low_months = [m['month_name'] for m in sorted_by_units[-3:]]
    
    # Overall trend direction
    if len(yearly_totals) >= 2:
        recent_growth = yearly_totals[-1]['growth_rate']
        if recent_growth > 10:
            trend_direction = 'GROWING'
        elif recent_growth < -10:
            trend_direction = 'DECLINING'
        else:
            trend_direction = 'STABLE'
    else:
        trend_direction = 'INSUFFICIENT_DATA'
    
    # Calculate average annual growth rate
    if len(yearly_totals) >= 2:
        first_year_revenue = yearly_totals[0]['revenue']
        last_year_revenue = yearly_totals[-1]['revenue']
        years_span = len(yearly_totals) - 1
        
        if first_year_revenue > 0:
            cagr = (((last_year_revenue / first_year_revenue) ** (1/years_span)) - 1) * 100
        else:
            cagr = 0
    else:
        cagr = 0
    
    analysis = {
        'product_id': product.id,
        'product_name': product.name,
        'analysis_period': {
            'start_date': start_date.strftime('%Y-%m-%d'),
            'end_date': end_date.strftime('%Y-%m-%d'),
            'years': len(yearly_data)
        },
        'yearly_performance': yearly_totals,
        'seasonal_pattern': seasonal_pattern,
        'insights': {
            'trend_direction': trend_direction,
            'peak_months': peak_months,
            'low_months': low_months,
            'compound_annual_growth_rate': round(cagr, 2),
            'recent_year_growth': yearly_totals[-1]['growth_rate'] if yearly_totals else 0
        }
    }
    
    # Save trend data to database
    if yearly_totals:
        latest_year = yearly_totals[-1]
        ProductTrend.objects.update_or_create(
            product=product,
            year=latest_year['year'],
            month=None,
            quarter=None,
            defaults={
                'total_units_sold': latest_year['units_sold'],
                'total_revenue': latest_year['revenue'],
                'growth_rate': latest_year['growth_rate'],
                'trend_direction': trend_direction,
            }
        )
    
    logger.info(f"3-year trend analysis complete for {product.name}: {trend_direction} trend, {cagr:.2f}% CAGR")
    return analysis


def get_trending_products(days: int = 30, limit: int = 10) -> List[Dict]:
    """
    Get products that are currently trending (growing sales)
    
    Args:
        days: Period to analyze
        limit: Number of products to return
    
    Returns:
        List of trending products with growth metrics
    """
    end_date = timezone.now()
    current_period_start = end_date - timedelta(days=days)
    previous_period_start = current_period_start - timedelta(days=days)
    
    # Get current period sales
    current_sales = OrderItem.objects.filter(
        order__created_at__gte=current_period_start,
        order__status__in=['PROCESSING', 'SHIPPED', 'DELIVERED']
    ).values(
        'variant__product__id',
        'variant__product__name'
    ).annotate(
        current_units=Sum('quantity'),
        current_revenue=Sum(F('price') * F('quantity'))
    )
    
    # Get previous period sales
    previous_sales = OrderItem.objects.filter(
        order__created_at__gte=previous_period_start,
        order__created_at__lt=current_period_start,
        order__status__in=['PROCESSING', 'SHIPPED', 'DELIVERED']
    ).values(
        'variant__product__id'
    ).annotate(
        previous_units=Sum('quantity')
    )
    
    # Create lookup dict for previous sales
    previous_dict = {p['variant__product__id']: p['previous_units'] for p in previous_sales}
    
    # Calculate growth rates
    trending = []
    for product in current_sales:
        product_id = product['variant__product__id']
        current_units = product['current_units']
        previous_units = previous_dict.get(product_id, 0)
        
        # Calculate growth
        if previous_units > 0:
            growth_rate = ((current_units - previous_units) / previous_units) * 100
        elif current_units > 0:
            growth_rate = 100  # New product with sales
        else:
            growth_rate = 0
        
        # Only include products with significant growth
        if growth_rate >= 20:
            trending.append({
                'product_id': product_id,
                'product_name': product['variant__product__name'],
                'current_units': current_units,
                'previous_units': previous_units,
                'growth_rate': round(growth_rate, 2),
                'current_revenue': float(product['current_revenue'])
            })
    
    # Sort by growth rate
    trending.sort(key=lambda x: x['growth_rate'], reverse=True)
    
    return trending[:limit]
