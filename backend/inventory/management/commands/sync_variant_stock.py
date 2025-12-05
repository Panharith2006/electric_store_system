from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = 'Create Stock rows for ProductVariant entries that lack explicit Stock records.'

    def handle(self, *args, **options):
        from products.models import ProductVariant
        from inventory.models import Stock, Warehouse

        self.stdout.write('Scanning variants for missing Stock rows...')

        # Choose a default warehouse: prefer one named 'Main Warehouse' or the first active warehouse
        warehouse = Warehouse.objects.filter(name__icontains='main').first()
        if not warehouse:
            warehouse = Warehouse.objects.first()

        if not warehouse:
            self.stdout.write(self.style.ERROR('No warehouse found. Create a Warehouse first or run reset_and_seed.'))
            return

        created = 0
        variants = ProductVariant.objects.filter(is_active=True).select_related('product')
        for variant in variants:
            exists = Stock.objects.filter(variant=variant, warehouse=warehouse).exists()
            if not exists:
                qty = int(variant.stock or 0)
                Stock.objects.create(
                    warehouse=warehouse,
                    variant=variant,
                    quantity=qty,
                    reserved_quantity=0,
                    low_stock_threshold=5,
                )
                created += 1

        self.stdout.write(self.style.SUCCESS(f'Created {created} Stock rows in warehouse: {warehouse.name}'))
