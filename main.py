from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi import Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel

from models import User
from database import get_db

import uvicorn
import json
import os

app = FastAPI()

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database file path
DB_FILE = "database.json"

# Default data structure
DEFAULT_DATA = {
    "users": [],
    "admins": [
        {"id": 1, "email": "admin@guitar.com", "password": "admin123", "name": "Admin"}
    ],
    "guitars": [
        {
            "id": 1,
            "name": "Fender Stratocaster Classic",
            "category": "Electric",
            "price": 168999,
            "quantity": 5,
            "image": "/images/guitar1.jpg",
            "description": "Iconic electric guitar with timeless design",
            "brand": "Fender",
            "year": "1965",
        },
        {
            "id": 2,
            "name": "Gibson Les Paul Standard",
            "category": "Electric",
            "price": 259999,
            "quantity": 3,
            "image": "/images/guitar2.jpg",
            "description": "Premium electric guitar with warm tone",
            "brand": "Gibson",
            "year": "1959",
        },
        {
            "id": 3,
            "name": "Taylor 814ce",
            "category": "Acoustic",
            "price": 415999,
            "quantity": 2,
            "image": "/images/guitar3.jpg",
            "description": "High-end acoustic guitar with exceptional clarity",
            "brand": "Taylor",
            "year": "2023",
        },
        {
            "id": 4,
            "name": "Martin D-45",
            "category": "Acoustic",
            "price": 389999,
            "quantity": 4,
            "image": "/images/guitar4.jpg",
            "description": "Legendary dreadnought acoustic guitar",
            "brand": "Martin",
            "year": "1933",
        },
        {
            "id": 5,
            "name": "Ibanez JEM77P",
            "category": "Electric",
            "price": 207999,
            "quantity": 6,
            "image": "/images/guitar5.jpg",
            "description": "Signature model with unique design",
            "brand": "Ibanez",
            "year": "1990",
        },
        {
            "id": 6,
            "name": "PRS Custom 24",
            "category": "Electric",
            "price": 584999,
            "quantity": 2,
            "image": "/images/guitar6.jpg",
            "description": "Handcrafted excellence in every detail",
            "brand": "PRS",
            "year": "1985",
        },
        {
            "id": 7,
            "name": "Epiphone SG",
            "category": "Electric",
            "price": 58499,
            "quantity": 8,
            "image": "/images/guitar7.jpg",
            "description": "Affordable solid-body electric guitar",
            "brand": "Epiphone",
            "year": "1961",
        },
        {
            "id": 8,
            "name": "Yamaha LL16",
            "category": "Acoustic",
            "price": 259999,
            "quantity": 3,
            "image": "/images/guitar8.jpg",
            "description": "Reliable acoustic guitar for professionals",
            "brand": "Yamaha",
            "year": "2000",
        },
        {
            "id": 9,
            "name": "Fender Jazzmaster Vintage",
            "category": "Electric",
            "price": 233999,
            "quantity": 2,
            "image": "/images/guitar9.jpg",
            "description": "Vintage-style offset electric guitar",
            "brand": "Fender",
            "year": "1958",
        },
        {
            "id": 10,
            "name": "Guild D-40 Traditional",
            "category": "Acoustic",
            "price": 376999,
            "quantity": 1,
            "image": "/images/guitar10.jpg",
            "description": "Premium crafted acoustic masterpiece",
            "brand": "Guild",
            "year": "1953",
        },
    ],
    "orders": [],
}


# Load or create database
def load_database():
    """Load database from JSON file, create if doesn't exist"""
    if os.path.exists(DB_FILE):
        try:
            with open(DB_FILE, "r") as f:
                return json.load(f)
        except:
            return DEFAULT_DATA.copy()
    return DEFAULT_DATA.copy()


def save_database(data):
    """Save database to JSON file"""
    with open(DB_FILE, "w") as f:
        json.dump(data, f, indent=2)


# Initialize database
db = load_database()
users = db["users"]
admins = db["admins"]
guitars = db["guitars"]
orders = db["orders"]

# --------------------
# Models
# --------------------


class CreateUser(BaseModel):
    email: str
    username: str
    password: str


class LoginUser(BaseModel):
    email: str
    password: str


class CreateItem(BaseModel):
    name: str
    price: float
    quantity: int


class UpdateItem(BaseModel):
    name: str | None = None
    price: float | None = None
    quantity: int | None = None


class CartItem(BaseModel):
    product_id: int
    quantity: int


class Checkout(BaseModel):
    user_id: int
    cart_items: list[CartItem]


class AdminLogin(BaseModel):
    email: str
    password: str


class UpdateProduct(BaseModel):
    name: str | None = None
    price: float | None = None
    quantity: int | None = None
    category: str | None = None
    description: str | None = None
    brand: str | None = None


class CreateProduct(BaseModel):
    name: str
    price: float
    quantity: int
    category: str
    description: str
    brand: str
    image: str = "🎸"
    year: str = "2024"


# --------------------
# Routes
# --------------------


def get_next_id() -> int:
    return max(item["id"] for item in guitars) + 1 if guitars else 1


def get_next_user_id() -> int:
    return max(user["id"] for user in users) + 1 if users else 1


def get_next_order_id() -> int:
    return max(order["id"] for order in orders) + 1 if orders else 1


def save_all_data():
    """Save all data to JSON file"""
    save_database(
        {"users": users, "admins": admins, "guitars": guitars, "orders": orders}
    )


@app.get("/")
def root():
    return {"message": "Hello World!"}


# AUTH - SIGN UP
@app.post("/signup")
def signup(user: CreateUser, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.email == user.email).first()

    if existing_user:
        return {"message": "Email already registered", "success": False}

    new_user = User(email=user.email, username=user.username, password=user.password)

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {
        "message": "User created successfully",
        "success": True,
        "user": {
            "id": new_user.id,
            "email": new_user.email,
            "username": new_user.username,
        },
    }


def verify_password(frontend_password: str, database_password: str) -> bool:
    return frontend_password == database_password


# AUTH - LOGIN
@app.post("/login")
def login(user: LoginUser, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.email == user.email).first()

    if not existing_user:
        return {"message": "User not found", "success": False}

    if not verify_password(user.password, existing_user.password):
        return {"message": "Invalid password", "success": False}

    return {
        "message": "Login successful",
        "success": True,
        "user": existing_user,
    }


# ADMIN - LOGIN
@app.post("/admin/login")
def admin_login(admin: AdminLogin):
    for existing_admin in admins:
        if (
            existing_admin["email"] == admin.email
            and existing_admin["password"] == admin.password
        ):
            return {
                "message": "Admin login successful",
                "success": True,
                "admin": {
                    "id": existing_admin["id"],
                    "email": existing_admin["email"],
                    "name": existing_admin["name"],
                },
            }

    return {"message": "Invalid admin credentials", "success": False}


# ADMIN - DASHBOARD STATS
@app.get("/admin/stats")
def get_admin_stats():
    total_orders = len(orders)
    total_revenue = sum(order["total"] for order in orders)
    total_products = len(guitars)
    total_users = len(users)

    return {
        "total_orders": total_orders,
        "total_revenue": total_revenue,
        "total_products": total_products,
        "total_users": total_users,
        "orders": orders,
        "users": users,
    }


# ADMIN - GET ALL PRODUCTS
@app.get("/admin/products")
def admin_get_products():
    return guitars


# ADMIN - DELETE PRODUCT (For sold out)
@app.delete("/admin/products/{product_id}")
def admin_delete_product(product_id: int):
    for guitar in guitars:
        if guitar["id"] == product_id:
            guitars.remove(guitar)
            save_all_data()
            return {
                "message": "Product deleted successfully",
                "success": True,
                "deleted_product": guitar,
            }

    return {"message": "Product not found", "success": False}


# ADMIN - UPDATE PRODUCT
@app.put("/admin/products/{product_id}")
def admin_update_product(product_id: int, product: UpdateProduct):
    for guitar in guitars:
        if guitar["id"] == product_id:
            if product.name is not None:
                guitar["name"] = product.name
            if product.price is not None:
                guitar["price"] = product.price
            if product.quantity is not None:
                guitar["quantity"] = product.quantity
            if product.category is not None:
                guitar["category"] = product.category
            if product.description is not None:
                guitar["description"] = product.description
            if product.brand is not None:
                guitar["brand"] = product.brand

            save_all_data()
            return {
                "message": "Product updated successfully",
                "success": True,
                "product": guitar,
            }

    return {"message": "Product not found", "success": False}


# ADMIN - ADD NEW PRODUCT
@app.post("/admin/products")
def admin_create_product(product: CreateProduct):
    new_product = {
        "id": get_next_id(),
        "name": product.name,
        "price": product.price,
        "quantity": product.quantity,
        "category": product.category,
        "description": product.description,
        "brand": product.brand,
        "image": product.image,
        "year": product.year,
    }

    guitars.append(new_product)
    save_all_data()
    return {
        "message": "Product created successfully",
        "success": True,
        "product": new_product,
    }


# ADMIN - MARK AS SOLD OUT (Set quantity to 0)
@app.put("/admin/products/{product_id}/soldout")
def mark_soldout(product_id: int):
    for guitar in guitars:
        if guitar["id"] == product_id:
            guitar["quantity"] = 0
            save_all_data()
            return {
                "message": "Product marked as sold out",
                "success": True,
                "product": guitar,
            }

    return {"message": "Product not found", "success": False}


# PRODUCTS
@app.get("/products")
def get_products():
    return guitars


@app.get("/products/{product_id}")
def get_product(product_id: int):
    for guitar in guitars:
        if guitar["id"] == product_id:
            return guitar
    return {"message": "Product not found"}


@app.get("/products/category/{category}")
def get_products_by_category(category: str):
    return [
        guitar for guitar in guitars if guitar["category"].lower() == category.lower()
    ]


# ORDERS
@app.post("/checkout")
def checkout(checkout_data: Checkout):
    total_price = 0
    order_items = []

    for cart_item in checkout_data.cart_items:
        for guitar in guitars:
            if guitar["id"] == cart_item.product_id:
                if guitar["quantity"] >= cart_item.quantity:
                    guitar["quantity"] -= cart_item.quantity
                    total_price += guitar["price"] * cart_item.quantity
                    order_items.append(
                        {
                            "product_id": cart_item.product_id,
                            "name": guitar["name"],
                            "price": guitar["price"],
                            "quantity": cart_item.quantity,
                            "subtotal": guitar["price"] * cart_item.quantity,
                        }
                    )
                else:
                    return {
                        "message": f"Insufficient stock for {guitar['name']}",
                        "success": False,
                    }
                break

    order = {
        "id": get_next_order_id(),
        "user_id": checkout_data.user_id,
        "items": order_items,
        "total": total_price,
        "status": "completed",
    }

    orders.append(order)
    save_all_data()
    return {"message": "Order placed successfully", "success": True, "order": order}


@app.get("/orders/{user_id}")
def get_user_orders(user_id: int):
    return [order for order in orders if order["user_id"] == user_id]


# READ
@app.get("/list-items")
def list_items():
    return guitars


# CREATE
@app.post("/create-item")
def create_item(item: CreateItem):
    new_item = {
        "id": get_next_id(),
        "name": item.name,
        "price": item.price,
        "quantity": item.quantity,
        "category": "Custom",
        "image": "🎸",
        "description": "Custom guitar",
        "brand": "Custom",
        "year": "2024",
    }

    guitars.append(new_item)
    save_all_data()
    return new_item


# UPDATE
@app.put("/update-item/{item_id}")
def update_item(item_id: int, item: UpdateItem):
    for guitar in guitars:
        if guitar["id"] == item_id:
            if item.name is not None:
                guitar["name"] = item.name
            if item.price is not None:
                guitar["price"] = item.price
            if item.quantity is not None:
                guitar["quantity"] = item.quantity

            save_all_data()
            return {
                "message": "Item updated successfully",
                "item": guitar,
            }

    return {"message": "Item not found"}


# DELETE
@app.delete("/delete-item/{item_id}")
def delete_item(item_id: int):
    for guitar in guitars:
        if guitar["id"] == item_id:
            guitars.remove(guitar)
            save_all_data()
            return {
                "message": "Item deleted successfully",
                "item": guitar,
            }

    return {"message": "Item not found"}


# This is a test comment (for github demonstration purpose)
# --------------------
# Run server
# --------------------

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
