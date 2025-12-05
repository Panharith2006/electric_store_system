from django.core.management.base import BaseCommand
from products.models import Brand, Category, Product, ProductVariant


class Command(BaseCommand):
    help = 'Populate products with real images from Frontend/public folder'

    def handle(self, *args, **options):
        self.stdout.write('Populating products with real images...')

        # Brands
        apple, _ = Brand.objects.get_or_create(name='Apple', defaults={'description': 'Apple Inc.'})
        samsung, _ = Brand.objects.get_or_create(name='Samsung', defaults={'description': 'Samsung Electronics'})
        sony, _ = Brand.objects.get_or_create(name='Sony', defaults={'description': 'Sony Corporation'})
        dell, _ = Brand.objects.get_or_create(name='Dell', defaults={'description': 'Dell Technologies'})
        canon, _ = Brand.objects.get_or_create(name='Canon', defaults={'description': 'Canon Inc.'})

        # Categories
        phones, _ = Category.objects.get_or_create(name='Smartphones', defaults={'description': 'Mobile phones'})
        laptops, _ = Category.objects.get_or_create(name='Laptops', defaults={'description': 'Laptop computers'})
        tablets, _ = Category.objects.get_or_create(name='Tablets', defaults={'description': 'Tablet devices'})
        headphones, _ = Category.objects.get_or_create(name='Headphones', defaults={'description': 'Audio devices'})
        cameras, _ = Category.objects.get_or_create(name='Cameras', defaults={'description': 'Digital cameras'})
        accessories, _ = Category.objects.get_or_create(name='Accessories', defaults={'description': 'Tech accessories'})

        # iPhone 15 Pro Max
        p1, _ = Product.objects.update_or_create(
            id='iphone-15-pro-max',
            defaults={
                'name': 'iPhone 15 Pro Max',
                'brand': apple,
                'category': phones,
                'base_price': '1199.00',
                'image': '/iphone-15-pro-max-natural-titanium.png',
                'images': ['/iPhone_15_Pro_Max_Natural_Titanium.webp', '/iphone-15-pro-max-camera-detail.jpg'],
                'description': 'Most powerful iPhone with A17 Pro chip and titanium design.',
                'specs': {'Display': '6.7" Super Retina XDR', 'Processor': 'A17 Pro', 'Camera': '48MP Pro'},
                'features': ['Titanium design', 'Pro camera', 'Action button', 'USB-C'],
                'average_rating': 4.8,
                'total_reviews': 324,
                'is_active': True,
            }
        )
        ProductVariant.objects.update_or_create(id='iphone-15-pro-max-256gb-natural', defaults={'product': p1, 'storage': '256GB', 'color': 'Natural Titanium', 'price': '1199.00', 'original_price': '1299.00', 'stock': 50, 'images': ['/iPhone_15_Pro_Max_Natural_Titanium.webp'], 'is_active': True})
        ProductVariant.objects.update_or_create(id='iphone-15-pro-max-512gb-blue', defaults={'product': p1, 'storage': '512GB', 'color': 'Blue Titanium', 'price': '1399.00', 'original_price': '1499.00', 'stock': 30, 'images': ['/iPhone_15_Pro_Blue_Titanium.webp'], 'is_active': True})
        ProductVariant.objects.update_or_create(id='iphone-15-pro-max-256gb-black', defaults={'product': p1, 'storage': '256GB', 'color': 'Black Titanium', 'price': '1199.00', 'stock': 45, 'images': ['/iPhone_15_Pro_Max_Black_Titanium.webp'], 'is_active': True})

        # Samsung Galaxy S24 Ultra
        p2, _ = Product.objects.update_or_create(
            id='samsung-galaxy-s24-ultra',
            defaults={
                'name': 'Samsung Galaxy S24 Ultra',
                'brand': samsung,
                'category': phones,
                'base_price': '1199.00',
                'image': '/samsung-galaxy-s24-ultra-black.jpg',
                'images': ['/s24_ultra_black_ecommerce_3223.webp', '/samsung-galaxy-s24-ultra-display.jpg', '/samsung-galaxy-s24-ultra-camera-array.jpg'],
                'description': 'Premium flagship with S Pen and powerful AI features.',
                'specs': {'Display': '6.8" AMOLED', 'Processor': 'Snapdragon 8 Gen 3', 'Camera': '200MP'},
                'features': ['S Pen', '200MP camera', 'Galaxy AI', '5000mAh battery'],
                'average_rating': 4.7,
                'total_reviews': 218,
                'is_active': True,
            }
        )
        ProductVariant.objects.update_or_create(id='samsung-s24-ultra-256gb-black', defaults={'product': p2, 'storage': '256GB', 'color': 'Black', 'price': '1199.00', 'original_price': '1299.00', 'stock': 40, 'images': ['/s24_ultra_black_ecommerce_3223.webp'], 'is_active': True})

        # MacBook Pro 16
        p3, _ = Product.objects.update_or_create(
            id='macbook-pro-16-m4',
            defaults={
                'name': 'MacBook Pro 16-inch (M4)',
                'brand': apple,
                'category': laptops,
                'base_price': '2499.00',
                'image': '/macbook-pro-16-inch-space-black.jpg',
                'images': ['/M4-MacBook-Pro-Thumb-2.jpg', '/macbook-pro-16-open-front-view.jpg', '/macbook-pro-16-keyboard-detail.jpg'],
                'description': 'Ultimate pro laptop with M4 chip and Liquid Retina XDR.',
                'specs': {'Display': '16.2" XDR', 'Processor': 'M4', 'Memory': '128GB max', 'Battery': '22 hours'},
                'features': ['M4 chip', 'XDR display', 'MagSafe 3', '6-speaker sound'],
                'average_rating': 4.9,
                'total_reviews': 156,
                'is_active': True,
            }
        )
        ProductVariant.objects.update_or_create(id='macbook-pro-16-512gb', defaults={'product': p3, 'storage': '512GB SSD', 'color': 'Space Black', 'price': '2499.00', 'original_price': '2699.00', 'stock': 20, 'images': ['/macbook-pro-16-inch-space-black.jpg'], 'is_active': True})

        # Dell XPS 15
        p4, _ = Product.objects.update_or_create(
            id='dell-xps-15',
            defaults={
                'name': 'Dell XPS 15',
                'brand': dell,
                'category': laptops,
                'base_price': '1599.00',
                'image': '/dell-xps-15-laptop-silver.jpg',
                'images': ['/dell-xps-15-open-laptop.jpg', '/dell-xps-15-display.jpg', '/dell-xps-15-side-view.jpg'],
                'description': 'Premium Windows laptop with stunning OLED display.',
                'specs': {'Display': '15.6" 4K OLED', 'Processor': 'Intel i7', 'Graphics': 'RTX 4050'},
                'features': ['4K OLED', 'NVIDIA RTX', 'Thunderbolt 4', 'Premium build'],
                'average_rating': 4.6,
                'total_reviews': 142,
                'is_active': True,
            }
        )
        ProductVariant.objects.update_or_create(id='dell-xps-15-512gb', defaults={'product': p4, 'storage': '512GB SSD', 'color': 'Silver', 'price': '1599.00', 'original_price': '1799.00', 'stock': 25, 'images': ['/dell-xps-15-laptop-silver.jpg'], 'is_active': True})

        # Sony WH-1000XM5
        p5, _ = Product.objects.update_or_create(
            id='sony-wh-1000xm5',
            defaults={
                'name': 'Sony WH-1000XM5 Headphones',
                'brand': sony,
                'category': headphones,
                'base_price': '399.00',
                'image': '/sony-wh-1000xm5-headphones-black.jpg',
                'images': ['/Sony WH-1000XM5.jpg', '/sony-wh-1000xm5-front-view.jpg'],
                'description': 'Industry-leading noise canceling with exceptional sound.',
                'specs': {'Type': 'Over-ear wireless', 'Battery': '30 hours', 'Connectivity': 'Bluetooth 5.2'},
                'features': ['Industry-leading ANC', 'LDAC audio', 'Multipoint', '30h battery'],
                'average_rating': 4.8,
                'total_reviews': 412,
                'is_active': True,
            }
        )
        ProductVariant.objects.update_or_create(id='sony-wh-1000xm5-black', defaults={'product': p5, 'storage': 'N/A', 'color': 'Black', 'price': '399.00', 'original_price': '449.00', 'stock': 60, 'images': ['/sony-wh-1000xm5-headphones-black.jpg'], 'is_active': True})

        # iPad Pro
        p6, _ = Product.objects.update_or_create(
            id='ipad-pro-129',
            defaults={
                'name': 'iPad Pro 12.9-inch (M2)',
                'brand': apple,
                'category': tablets,
                'base_price': '1099.00',
                'image': '/iPad Pro 12.9-inch M2.jpg',
                'images': ['/silver-ipad-on-wooden-desk.png'],
                'description': 'Ultimate iPad with M2 chip and XDR display.',
                'specs': {'Display': '12.9" XDR', 'Processor': 'M2', 'Camera': '12MP Wide'},
                'features': ['M2 chip', '120Hz ProMotion', 'Face ID', 'Apple Pencil'],
                'average_rating': 4.7,
                'total_reviews': 289,
                'is_active': True,
            }
        )
        ProductVariant.objects.update_or_create(id='ipad-pro-129-256gb', defaults={'product': p6, 'storage': '256GB', 'color': 'Silver', 'price': '1099.00', 'original_price': '1199.00', 'stock': 30, 'images': ['/iPad Pro 12.9-inch M2.jpg'], 'is_active': True})

        # Canon EOS R6
        p7, _ = Product.objects.update_or_create(
            id='canon-eos-r6-ii',
            defaults={
                'name': 'Canon EOS R6 Mark II',
                'brand': canon,
                'category': cameras,
                'base_price': '2499.00',
                'image': '/Canon EOS R6 Mark II.jpg',
                'images': ['/Canon EOS R6 Mark II.jpg'],
                'description': 'Professional mirrorless with 24MP and 4K 60p.',
                'specs': {'Sensor': '24.2MP Full-Frame', 'Video': '4K 60p', 'ISO': '100-102400'},
                'features': ['IBIS', 'Animal AF', 'Dual cards', 'Weather-sealed'],
                'average_rating': 4.9,
                'total_reviews': 87,
                'is_active': True,
            }
        )
        ProductVariant.objects.update_or_create(id='canon-r6-ii-body', defaults={'product': p7, 'storage': 'N/A', 'color': 'Black', 'price': '2499.00', 'stock': 15, 'images': ['/Canon EOS R6 Mark II.jpg'], 'is_active': True})

        # AirPods Pro 2
        p8, _ = Product.objects.update_or_create(
            id='airpods-pro-2',
            defaults={
                'name': 'AirPods Pro (2nd gen)',
                'brand': apple,
                'category': headphones,
                'base_price': '249.00',
                'image': '/AirPods Pro (2nd generation).jpg',
                'images': ['/AirPods Pro (2nd generation).jpg'],
                'description': 'Advanced ANC and Adaptive Audio for immersive sound.',
                'specs': {'Type': 'In-ear', 'Battery': '6 hours', 'Chip': 'H2'},
                'features': ['Active ANC', 'Adaptive Audio', 'Spatial Audio', 'MagSafe'],
                'average_rating': 4.7,
                'total_reviews': 521,
                'is_active': True,
            }
        )
        ProductVariant.objects.update_or_create(id='airpods-pro-2-white', defaults={'product': p8, 'storage': 'N/A', 'color': 'White', 'price': '249.00', 'stock': 100, 'images': ['/AirPods Pro (2nd generation).jpg'], 'is_active': True})

        self.stdout.write(self.style.SUCCESS('✓ Populated 8 products with real images from /public'))
