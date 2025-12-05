from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ProductViewSet, ProductVariantViewSet, CategoryViewSet, BrandViewSet
from .upload import ProductImageUploadView

router = DefaultRouter()
router.register(r'products', ProductViewSet, basename='product')
router.register(r'variants', ProductVariantViewSet, basename='variant')
router.register(r'categories', CategoryViewSet, basename='category')
router.register(r'brands', BrandViewSet, basename='brand')

urlpatterns = [
    path('upload-image/', ProductImageUploadView.as_view(), name='product-image-upload'),
    path('', include(router.urls)),
]
