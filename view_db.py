from models import SessionLocal, User, Admin, Guitar, Order, OrderItem

def view_database():
    session = SessionLocal()

    try:
        print("=== USERS ===")
        users = session.query(User).all()
        for user in users:
            print(f"ID: {user.id}, Email: {user.email}, Username: {user.username}")

        print("\n=== ADMINS ===")
        admins = session.query(Admin).all()
        for admin in admins:
            print(f"ID: {admin.id}, Email: {admin.email}, Name: {admin.name}")

        print("\n=== GUITARS ===")
        guitars = session.query(Guitar).all()
        for guitar in guitars:
            print(f"ID: {guitar.id}, Name: {guitar.name}, Category: {guitar.category}, Price: {guitar.price}, Quantity: {guitar.quantity}")

        print("\n=== ORDERS ===")
        orders = session.query(Order).all()
        for order in orders:
            print(f"ID: {order.id}, User ID: {order.user_id}, Total: {order.total}, Status: {order.status}")
            # Get order items
            items = session.query(OrderItem).filter(OrderItem.order_id == order.id).all()
            for item in items:
                print(f"  - {item.name} (x{item.quantity}) - {item.price} each, Subtotal: {item.subtotal}")

        print("\n=== SUMMARY ===")
        print(f"Total Users: {len(users)}")
        print(f"Total Admins: {len(admins)}")
        print(f"Total Guitars: {len(guitars)}")
        print(f"Total Orders: {len(orders)}")

    except Exception as e:
        print(f"Error viewing database: {e}")

    finally:
        session.close()

if __name__ == "__main__":
    view_database()
