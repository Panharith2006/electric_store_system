import os, json, base64
from decimal import Decimal
from django.test import Client
from django.core.files.uploadedfile import SimpleUploadedFile
from django.core.files.storage import default_storage
from django.conf import settings

# Ensure test client host is allowed
settings.ALLOWED_HOSTS = list(getattr(settings, 'ALLOWED_HOSTS', [])) + ['testserver']

# tiny 1x1 PNG (base64)
PNG1x1 = base64.b64decode(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwC' \
    'AAAAAXNSR0IArs4c6QAAAA1JREFUeJxjYAAAAAIAAeIhvDMAAAAASUVORK5CYII='
)

print('Starting test upload script')

# Ensure brand and category exist
from products.models import Brand, Category, Product
brand, _ = Brand.objects.get_or_create(name='TestBrand', defaults={'description':'Test brand'})
category, _ = Category.objects.get_or_create(name='TestCategory', defaults={'description':'Test category'})

# Create product if not exists
prod_id = 'test-product-for-upload'
product, created = Product.objects.get_or_create(
    id=prod_id,
    defaults={
        'name':'Test Product Upload',
        'brand': brand,
        'category': category,
        'base_price': Decimal('9.99'),
        'image': 'http://example.com/placeholder.png',
        'images': [],
        'description': 'Temp product for upload test',
        'specs': {},
        'features': []
    }
)
print('Product created', created, 'id=', product.id)

# Use Django test client to POST multipart
client = Client()
file = SimpleUploadedFile('test.png', PNG1x1, content_type='image/png')
resp = client.post('/api/products/upload-image/', {'image': file})
print('Upload response status:', resp.status_code)
try:
    data = resp.json()
except Exception as e:
    print('Failed to parse JSON:', e)
    print(resp.content)
    raise
print('Upload response JSON:', data)

url = data.get('url')
if not url:
    print('No url returned from upload; aborting')
else:
    # Update product to use this image
    product.image = url
    product.images = [url]
    product.save()
    print('Product updated with image URL')

    # Fetch product via API
    resp2 = client.get(f'/api/products/products/{product.id}/')
    print('Fetch product status:', resp2.status_code)
    try:
        prod_json = resp2.json()
    except Exception as e:
        print('Failed to parse product JSON:', e)
        print(resp2.content)
        raise
    print('Product JSON image field:', prod_json.get('image'))
    print('Product JSON images field:', prod_json.get('images'))

    # Check file exists in storage
    if '/media/' in url:
        rel = url.split('/media/')[-1]
        exists = default_storage.exists(rel)
        print('Storage exists:', exists, 'rel=', rel)
        try:
            path = default_storage.path(rel)
        except Exception:
            path = 'N/A'
        print('Storage path:', path)
        if exists and path != 'N/A':
            try:
                size = os.path.getsize(path)
            except Exception:
                size = None
            print('File size on disk:', size)
print('Done')
