import json
from models import SessionLocal, User, Admin, Guitar, Order, OrderItem

def migrate_data():
    # Load data from database.json
    with open('database.json', 'r') as f:
        data = json.load(f)

    session = SessionLocal()

    try:
        print("Starting migration from database.json to PostgreSQL...")

        # Migrate users first
        print(f"Migrating {len(data['users'])} users...")
        for user_data in data['users']:
            user = User(
                id=user_data['id'],
                email=user_data['email'],
                username=user_data['username'],
                password=user_data['password']
            )
            session.add(user)
            print(f"  - User: {user_data['email']}")

        # Migrate admins
        print(f"Migrating {len(data['admins'])} admins...")
        for admin_data in data['admins']:
            admin = Admin(
                id=admin_data['id'],
                email=admin_data['email'],
                password=admin_data['password'],
                name=admin_data['name']
            )
            session.add(admin)
            print(f"  - Admin: {admin_data['email']}")

        # Migrate guitars
        print(f"Migrating {len(data['guitars'])} guitars...")
        for guitar_data in data['guitars']:
            guitar = Guitar(
                id=guitar_data['id'],
                name=guitar_data['name'],
                category=guitar_data['category'],
                price=guitar_data['price'],
                quantity=guitar_data['quantity'],
                image=guitar_data['image'],
                description=guitar_data['description'],
                brand=guitar_data['brand'],
                year=guitar_data['year']
            )
            session.add(guitar)
            print(f"  - Guitar: {guitar_data['name']}")

        # Commit users, admins, and guitars first
        session.commit()
        print("Committed users, admins, and guitars.")

        # Now migrate orders and order items (after users exist)
        print(f"Migrating {len(data['orders'])} orders...")
        for order_data in data['orders']:
            order = Order(
                id=order_data['id'],
                user_id=order_data['user_id'],
                total=order_data['total'],
                status=order_data['status']
            )
            session.add(order)
            session.flush()  # To get order.id
            print(f"  - Order ID {order_data['id']}: User {order_data['user_id']}, Total: {order_data['total']}")

            for item_data in order_data['items']:
                order_item = OrderItem(
                    order_id=order.id,
                    product_id=item_data['product_id'],
                    name=item_data['name'],
                    price=item_data['price'],
                    quantity=item_data['quantity'],
                    subtotal=item_data['subtotal']
                )
                session.add(order_item)
                print(f"    - Item: {item_data['name']} (x{item_data['quantity']})")

        session.commit()
        print("Migration completed successfully!")
        print(f"Total migrated: {len(data['users'])} users, {len(data['admins'])} admins, {len(data['guitars'])} guitars, {len(data['orders'])} orders")

    except Exception as e:
        session.rollback()
        print(f"Migration failed: {e}")

    finally:
        session.close()

if __name__ == "__main__":
    migrate_data()
