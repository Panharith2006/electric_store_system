from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, OTP


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ['username', 'email', 'first_name', 'last_name', 'role', 'email_verified', 'is_active', 'is_staff', 'created_at']
    list_filter = ['role', 'email_verified', 'is_active', 'is_staff', 'is_superuser', 'created_at']
    search_fields = ['username', 'email', 'first_name', 'last_name', 'phone_number']
    ordering = ['-created_at']
    
    fieldsets = (
        (None, {
            'fields': ('username', 'password')
        }),
        ('Personal Info', {
            'fields': ('first_name', 'last_name', 'email', 'phone_number', 'date_of_birth', 'profile_picture')
        }),
        ('Address', {
            'fields': ('address_line1', 'address_line2', 'city', 'state', 'postal_code', 'country'),
            'classes': ('collapse',)
        }),
        ('Permissions & Role', {
            'fields': ('role', 'email_verified', 'is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')
        }),
        ('Preferences', {
            'fields': ('newsletter_subscribed',),
            'classes': ('collapse',)
        }),
        ('Important Dates', {
            'fields': ('last_login', 'date_joined', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('username', 'email', 'password1', 'password2', 'role'),
        }),
    )
    
    readonly_fields = ['created_at', 'updated_at', 'last_login', 'date_joined']
    
    def get_queryset(self, request):
        qs = super().get_queryset(request)
        return qs
    
    actions = ['make_admin', 'make_user', 'activate_users', 'deactivate_users', 'verify_email']
    
    def make_admin(self, request, queryset):
        updated = queryset.update(role=User.Role.ADMIN, is_staff=True)
        self.message_user(request, f'{updated} user(s) promoted to admin.')
    make_admin.short_description = "Promote selected users to Admin"
    
    def make_user(self, request, queryset):
        updated = queryset.update(role=User.Role.USER, is_staff=False)
        self.message_user(request, f'{updated} user(s) demoted to User.')
    make_user.short_description = "Demote selected users to User"
    
    def activate_users(self, request, queryset):
        updated = queryset.update(is_active=True)
        self.message_user(request, f'{updated} user(s) activated.')
    activate_users.short_description = "Activate selected users"
    
    def deactivate_users(self, request, queryset):
        updated = queryset.update(is_active=False)
        self.message_user(request, f'{updated} user(s) deactivated.')
    deactivate_users.short_description = "Deactivate selected users"
    
    def verify_email(self, request, queryset):
        updated = queryset.update(email_verified=True)
        self.message_user(request, f'{updated} user(s) email verified.')
    verify_email.short_description = "Verify email for selected users"


@admin.register(OTP)
class OTPAdmin(admin.ModelAdmin):
    list_display = ['email', 'otp_code', 'is_verified', 'attempts', 'created_at', 'expires_at', 'is_valid_display']
    list_filter = ['is_verified', 'created_at']
    search_fields = ['email', 'otp_code']
    ordering = ['-created_at']
    readonly_fields = ['created_at']
    
    def is_valid_display(self, obj):
        return obj.is_valid()
    is_valid_display.short_description = 'Is Valid'
    is_valid_display.boolean = True
