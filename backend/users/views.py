from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate, login, logout
from django.core.mail import send_mail
from django.conf import settings
from django.utils import timezone
from django.db import transaction
from .models import User, OTP
from .serializers import (
    UserSerializer, UserRegistrationSerializer, EmailLoginSerializer,
    OTPVerificationSerializer, UserProfileSerializer, ChangePasswordSerializer,
    AdminUserSerializer, SendOTPSerializer
)
from .permissions import IsAdminUser, IsOwnerOrAdmin


class SendOTPView(APIView):
    """Send OTP to email for registration or login"""
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        serializer = SendOTPSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            purpose = serializer.validated_data.get('purpose', 'login')
            
            # For registration, check if email already exists
            if purpose == 'register':
                if User.objects.filter(email=email).exists():
                    return Response(
                        {'error': 'Email already registered'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
            
            # For login, check if email exists
            if purpose == 'login':
                if not User.objects.filter(email=email).exists():
                    return Response(
                        {'error': 'Email not found. Please register first.'},
                        status=status.HTTP_404_NOT_FOUND
                    )
            
            # Create OTP
            otp = OTP.create_otp(email)
            
            # Send email (configure your email settings)
            try:
                send_mail(
                    subject='Your Verification Code',
                    message=f'Your OTP code is: {otp.otp_code}\n\nThis code will expire in 10 minutes.',
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[email],
                    fail_silently=False,
                )
                
                return Response({
                    'message': 'OTP sent successfully to your email',
                    'email': email,
                    'expires_in': '10 minutes'
                }, status=status.HTTP_200_OK)
            except Exception as e:
                # For development, return OTP in response (REMOVE IN PRODUCTION)
                return Response({
                    'message': 'OTP generated (email not configured)',
                    'email': email,
                    'otp_code': otp.otp_code,  # REMOVE IN PRODUCTION
                    'expires_in': '10 minutes'
                }, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class RegisterView(APIView):
    """User registration with OTP verification"""
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            otp_code = serializer.validated_data['otp_code']
            
            # Verify OTP
            try:
                otp = OTP.objects.get(email=email, otp_code=otp_code)
                
                if not otp.is_valid():
                    return Response(
                        {'error': 'Invalid or expired OTP'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                
                # Increment attempts
                otp.attempts += 1
                otp.save()
                
                # Create user
                user = serializer.save()
                user.email_verified = True
                user.save()
                
                # Mark OTP as verified
                otp.is_verified = True
                otp.save()
                
                # Create token
                token, created = Token.objects.get_or_create(user=user)
                
                return Response({
                    'user': UserSerializer(user).data,
                    'token': token.key,
                    'message': 'Registration successful'
                }, status=status.HTTP_201_CREATED)
                
            except OTP.DoesNotExist:
                return Response(
                    {'error': 'Invalid OTP'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    """User login with OTP verification"""
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        serializer = OTPVerificationSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            otp_code = serializer.validated_data['otp_code']
            
            # Verify OTP
            try:
                otp = OTP.objects.get(email=email, otp_code=otp_code)
                
                if not otp.is_valid():
                    return Response(
                        {'error': 'Invalid or expired OTP'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                
                # Increment attempts
                otp.attempts += 1
                otp.save()
                
                # Get user
                try:
                    user = User.objects.get(email=email)
                    
                    # Mark OTP as verified
                    otp.is_verified = True
                    otp.save()
                    
                    # Login user
                    login(request, user)
                    token, created = Token.objects.get_or_create(user=user)
                    
                    return Response({
                        'user': UserSerializer(user).data,
                        'token': token.key,
                        'message': 'Login successful'
                    }, status=status.HTTP_200_OK)
                    
                except User.DoesNotExist:
                    return Response(
                        {'error': 'User not found'},
                        status=status.HTTP_404_NOT_FOUND
                    )
                
            except OTP.DoesNotExist:
                return Response(
                    {'error': 'Invalid OTP'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LogoutView(APIView):
    """User logout endpoint"""
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        try:
            # Delete the user's token
            request.user.auth_token.delete()
            logout(request)
            return Response(
                {'message': 'Logout successful'},
                status=status.HTTP_200_OK
            )
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class UserProfileView(APIView):
    """Get and update user profile"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        """Get current user profile"""
        serializer = UserProfileSerializer(request.user)
        return Response(serializer.data)
    
    def patch(self, request):
        """Update current user profile"""
        serializer = UserProfileSerializer(
            request.user,
            data=request.data,
            partial=True
        )
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ChangePasswordView(APIView):
    """Change user password"""
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data)
        if serializer.is_valid():
            user = request.user
            
            # Check old password
            if not user.check_password(serializer.validated_data['old_password']):
                return Response(
                    {'error': 'Invalid old password'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Set new password
            user.set_password(serializer.validated_data['new_password'])
            user.save()
            
            return Response(
                {'message': 'Password changed successfully'},
                status=status.HTTP_200_OK
            )
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserViewSet(viewsets.ModelViewSet):
    """Admin endpoint for managing users"""
    queryset = User.objects.all()
    permission_classes = [IsAdminUser]
    
    def get_serializer_class(self):
        if self.action in ['list', 'retrieve']:
            return AdminUserSerializer
        return UserSerializer
    
    @action(detail=True, methods=['post'])
    def promote_to_admin(self, request, pk=None):
        """Promote user to admin role"""
        user = self.get_object()
        user.role = User.Role.ADMIN
        user.is_staff = True
        user.save()
        return Response(
            {'message': f'{user.username} promoted to admin'},
            status=status.HTTP_200_OK
        )
    
    @action(detail=True, methods=['post'])
    def demote_to_user(self, request, pk=None):
        """Demote admin to regular user"""
        user = self.get_object()
        if user == request.user:
            return Response(
                {'error': 'You cannot demote yourself'},
                status=status.HTTP_400_BAD_REQUEST
            )
        user.role = User.Role.USER
        user.is_staff = False
        user.save()
        return Response(
            {'message': f'{user.username} demoted to user'},
            status=status.HTTP_200_OK
        )
    
    @action(detail=False, methods=['get'])
    def admins(self, request):
        """Get all admin users"""
        admins = User.objects.filter(role=User.Role.ADMIN)
        serializer = AdminUserSerializer(admins, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def customers(self, request):
        """Get all regular users"""
        customers = User.objects.filter(role=User.Role.USER)
        serializer = AdminUserSerializer(customers, many=True)
        return Response(serializer.data)
