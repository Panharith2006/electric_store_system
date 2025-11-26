from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    SalesReportViewSet, ProductPerformanceViewSet, ProductTrendViewSet,
    ProductRelationViewSet, CustomerSegmentViewSet, AnalyticsViewSet
)

router = DefaultRouter()
router.register(r'sales-reports', SalesReportViewSet, basename='sales-report')
router.register(r'product-performance', ProductPerformanceViewSet, basename='product-performance')
router.register(r'product-trends', ProductTrendViewSet, basename='product-trend')
router.register(r'product-relations', ProductRelationViewSet, basename='product-relation')
router.register(r'customer-segments', CustomerSegmentViewSet, basename='customer-segment')
router.register(r'analytics', AnalyticsViewSet, basename='analytics')

urlpatterns = [
    path('', include(router.urls)),
]
