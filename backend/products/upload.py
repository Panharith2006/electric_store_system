"""
Image upload handler for products
"""
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
import os
import uuid


@method_decorator(csrf_exempt, name='dispatch')
class ProductImageUploadView(APIView):
    """
    Handle product image uploads
    POST /api/products/upload-image/
    """
    permission_classes = [permissions.AllowAny]
    authentication_classes = []
    
    def post(self, request):
        """Upload a product image and return the URL"""
        
        # Check if image file is present
        if 'image' not in request.FILES:
            return Response(
                {'error': 'No image file provided'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        image_file = request.FILES['image']
        
        # Validate file type
        allowed_types = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/avif']
        if image_file.content_type not in allowed_types:
            return Response(
                {'error': f'Invalid file type. Allowed: {", ".join(allowed_types)}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Validate file size (max 5MB)
        max_size = 5 * 1024 * 1024  # 5MB
        if image_file.size > max_size:
            return Response(
                {'error': 'File size exceeds 5MB limit'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # Generate unique filename
            ext = os.path.splitext(image_file.name)[1].lower()
            filename = f'products/{uuid.uuid4()}{ext}'
            
            # Save file
            path = default_storage.save(filename, ContentFile(image_file.read()))
            
            # Get URL
            url = request.build_absolute_uri(default_storage.url(path))
            
            return Response({
                'url': url,
                'filename': os.path.basename(path),
                'message': 'Image uploaded successfully'
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            return Response(
                {'error': f'Upload failed: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def delete(self, request):
        """Delete a product image by filename or URL"""
        # Get filename or URL from request
        image_url = request.data.get('url') or request.query_params.get('url')
        filename = request.data.get('filename') or request.query_params.get('filename')
        
        if not image_url and not filename:
            return Response(
                {'error': 'No image URL or filename provided'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # Extract filename from URL if URL was provided
            if image_url and not filename:
                # Parse URL to get the media path
                if '/media/' in image_url:
                    filename = image_url.split('/media/')[-1]
                else:
                    return Response(
                        {'error': 'Invalid image URL'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
            
            # Check if file exists
            if not default_storage.exists(filename):
                return Response(
                    {'error': 'Image file not found'},
                    status=status.HTTP_404_NOT_FOUND
                )
            
            # Delete the file
            default_storage.delete(filename)
            
            return Response({
                'message': 'Image deleted successfully',
                'filename': filename
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response(
                {'error': f'Delete failed: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
