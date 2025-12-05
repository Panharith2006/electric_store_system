from django.core.management.base import BaseCommand
from django.core.management import call_command


class Command(BaseCommand):
    help = 'Flush the database and seed with sample dynamic data (admin + user + products/variants/stock)'

    def handle(self, *args, **options):
        self.stdout.write(self.style.WARNING('Flushing database (this will remove ALL data)...'))
        call_command('flush', '--noinput')

        self.stdout.write(self.style.SUCCESS('Creating sample data...'))

        # Import models here to ensure Django is fully loaded
        from users.models import User
        from products.models import Category, Brand, Product, ProductVariant
        from inventory.models import Warehouse, Stock
        from django.utils import timezone

        # Create users
        admin_user = User.objects.create_user(
            username='admin',
            email='admin@example.com',
            password='AdminPass123!',
            first_name='Site',
            last_name='Admin',
        )
        admin_user.role = User.Role.ADMIN
        admin_user.is_staff = True
        admin_user.is_superuser = True
        admin_user.email_verified = True
        admin_user.save()

        regular_user = User.objects.create_user(
            username='johndoe',
            email='johndoe@example.com',
            password='UserPass123!',
            first_name='John',
            last_name='Doe',
        )
        regular_user.role = User.Role.USER
        regular_user.email_verified = True
        regular_user.save()

        # Create categories and brands
        smartphones = Category.objects.create(name='Smartphones', description='Mobile phones')
        laptops = Category.objects.create(name='Laptops', description='Laptop computers')
        accessories = Category.objects.create(name='Accessories', description='Phone and laptop accessories')

        apple = Brand.objects.create(name='Apple')
        samsung = Brand.objects.create(name='Samsung')
        dell = Brand.objects.create(name='Dell')

        # Create warehouse
        main_wh = Warehouse.objects.create(
            name='Main Warehouse',
            code='MAIN',
            address_line1='123 Supply St',
            address_line2='',
            city='City',
            state='State',
            postal_code='00000',
            country='USA',
            phone='+10000000000',
            email='warehouse@example.com',
            manager_name='Warehouse Manager',
        )

        # Helper to create product + variant + stock
        def add_product(pid, name, brand, category, base_price, image, variants):
            product = Product.objects.create(
                id=pid,
                name=name,
                brand=brand,
                category=category,
                base_price=base_price,
                image=image,
                images=[image],
                description=f'Description for {name}',
                specs={"example": "spec"},
                features=["Feature 1", "Feature 2"],
            )

            for v in variants:
                vid = f"{pid}-{v['storage']}-{v['color'].lower().replace(' ', '-') }"
                variant = ProductVariant.objects.create(
                    id=vid,
                    product=product,
                    storage=v['storage'],
                    color=v['color'],
                    price=v['price'],
                    original_price=v.get('original_price', None),
                    stock=v.get('stock', 0),
                    images=v.get('images', []),
                )

                # Create Stock row in warehouse
                Stock.objects.create(
                    warehouse=main_wh,
                    variant=variant,
                    quantity=v.get('stock', 0),
                    reserved_quantity=0,
                    low_stock_threshold=5,
                    last_restocked_at=timezone.now(),
                )

            return product

        # Add sample products
        add_product(
            'iphone-15-pro',
            'iPhone 15 Pro',
            apple,
            smartphones,
            999.00,
            'https://example.com/iphone.jpg',
            [
                {'storage': '256GB', 'color': 'Blue', 'price': 1099.00, 'stock': 50},
                {'storage': '512GB', 'color': 'Silver', 'price': 1299.00, 'stock': 30},
            ],
        )

        add_product(
            'galaxy-s24',
            'Galaxy S24',
            samsung,
            smartphones,
            799.00,
            'https://example.com/galaxy.jpg',
            [
                {'storage': '128GB', 'color': 'Black', 'price': 799.00, 'stock': 40},
                {'storage': '256GB', 'color': 'Green', 'price': 899.00, 'stock': 25},
            ],
        )

        add_product(
            'xps-15',
            'Dell XPS 15',
            dell,
            laptops,
            1499.00,
            'https://example.com/xps15.jpg',
            [
                {'storage': '512GB', 'color': 'Silver', 'price': 1549.00, 'stock': 15},
                {'storage': '1TB', 'color': 'Black', 'price': 1799.00, 'stock': 8},
            ],
        )

        # Confirm
        self.stdout.write(self.style.SUCCESS('Seeding complete.'))
        self.stdout.write('Admin credentials: username=admin password=AdminPass123!')
        self.stdout.write('User credentials: username=johndoe password=UserPass123!')
