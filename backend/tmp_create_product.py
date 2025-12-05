import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE','core.settings')
django.setup()
from products.serializers import ProductSerializer

data={'name':'Dell XPS 15','description':'Test XPS 15','base_price':'1499.00','category':'Laptops','brand':'Dell','initial_stock':5,'id':'dell-xps-15-test'}
ser=ProductSerializer(data=data)
if ser.is_valid():
    prod=ser.save()
    print('created',prod.id)
else:
    print('errors',ser.errors)
