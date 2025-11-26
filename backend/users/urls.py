from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    SendOTPView, RegisterView, LoginView, LogoutView, UserProfileView,
    ChangePasswordView, UserViewSet
)

router = DefaultRouter()
router.register(r'manage', UserViewSet, basename='user-management')

urlpatterns = [
    # OTP endpoints
    path('send-otp/', SendOTPView.as_view(), name='send-otp'),
    
    # Authentication endpoints
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    
    # Profile endpoints
    path('profile/', UserProfileView.as_view(), name='profile'),
    path('change-password/', ChangePasswordView.as_view(), name='change-password'),
    
    # Admin user management endpoints
    path('', include(router.urls)),
]
