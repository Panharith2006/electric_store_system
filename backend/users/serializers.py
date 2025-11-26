from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from .models import User, OTP


class UserSerializer(serializers.ModelSerializer):
    """Basic user serializer"""
    full_name = serializers.ReadOnlyField()
    is_admin = serializers.ReadOnlyField()
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name', 'full_name',
            'role', 'is_admin', 'email_verified', 'phone_number', 'profile_picture',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class SendOTPSerializer(serializers.Serializer):
    """Serializer for sending OTP"""
    email = serializers.EmailField(required=True)
    purpose = serializers.ChoiceField(choices=['login', 'register'], default='login')


class OTPVerificationSerializer(serializers.Serializer):
    """Serializer for OTP verification"""
    email = serializers.EmailField(required=True)
    otp_code = serializers.CharField(required=True, max_length=6, min_length=6)


class UserRegistrationSerializer(serializers.Serializer):
    """Serializer for user registration with OTP"""
    email = serializers.EmailField(required=True)
    username = serializers.CharField(required=True, max_length=150)
    password = serializers.CharField(
        write_only=True,
        required=True,
        validators=[validate_password],
        style={'input_type': 'password'}
    )
    first_name = serializers.CharField(required=False, max_length=150, allow_blank=True)
    last_name = serializers.CharField(required=False, max_length=150, allow_blank=True)
    phone_number = serializers.CharField(required=False, max_length=15, allow_blank=True)
    otp_code = serializers.CharField(required=True, max_length=6, min_length=6)
    
    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email already exists.")
        return value
    
    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("Username already exists.")
        return value
    
    def create(self, validated_data):
        otp_code = validated_data.pop('otp_code')
        password = validated_data.pop('password')
        
        # Create user with USER role by default
        user = User.objects.create(**validated_data, role=User.Role.USER)
        user.set_password(password)
        user.save()
        
        return user


class EmailLoginSerializer(serializers.Serializer):
    """Serializer for email-based login"""
    email = serializers.EmailField(required=True)


class UserProfileSerializer(serializers.ModelSerializer):
    """Serializer for user profile with full details"""
    full_name = serializers.ReadOnlyField()
    is_admin = serializers.ReadOnlyField()
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name', 'full_name',
            'role', 'is_admin', 'email_verified', 'phone_number', 'profile_picture', 'date_of_birth',
            'address_line1', 'address_line2', 'city', 'state', 'postal_code', 'country',
            'newsletter_subscribed', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'username', 'email', 'role', 'email_verified', 'created_at', 'updated_at']


class ChangePasswordSerializer(serializers.Serializer):
    """Serializer for changing password"""
    old_password = serializers.CharField(
        required=True,
        write_only=True,
        style={'input_type': 'password'}
    )
    new_password = serializers.CharField(
        required=True,
        write_only=True,
        validators=[validate_password],
        style={'input_type': 'password'}
    )
    new_password_confirm = serializers.CharField(
        required=True,
        write_only=True,
        style={'input_type': 'password'}
    )
    
    def validate(self, attrs):
        if attrs['new_password'] != attrs['new_password_confirm']:
            raise serializers.ValidationError({
                "new_password": "Password fields didn't match."
            })
        return attrs


class AdminUserSerializer(serializers.ModelSerializer):
    """Detailed serializer for admin to view all user information"""
    full_name = serializers.ReadOnlyField()
    is_admin = serializers.ReadOnlyField()
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name', 'full_name',
            'role', 'is_admin', 'is_active', 'is_staff', 'is_superuser', 'email_verified',
            'phone_number', 'profile_picture', 'date_of_birth',
            'address_line1', 'address_line2', 'city', 'state', 'postal_code', 'country',
            'newsletter_subscribed', 'last_login', 'date_joined', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'last_login', 'date_joined', 'created_at', 'updated_at']
