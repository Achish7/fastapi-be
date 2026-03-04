from fastapi import FastAPI, Depends, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import uvicorn
from sqlalchemy.orm import Session
from models import SessionLocal, User, Admin, Guitar, Order, OrderItem
from typing import List, Optional

# Safe chatbot import — won't crash server if chatbot fails
try:
    from chatbot.Chatbot import get_response
    CHATBOT_AVAILABLE = True
except Exception as e:
    print(f"⚠️ Chatbot not loaded: {e}")
    CHATBOT_AVAILABLE = False


app = FastAPI()

# ✅ CORS — allow all origins to fix OPTIONS 400
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["*"],
)

# ✅ Manual OPTIONS handler as backup
@app.options("/{rest_of_path:path}")
async def preflight(request: Request, rest_of_path: str):
    return JSONResponse(
        content={},
        headers={
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
            "Access-Control-Allow-Headers": "*",
        }
    )

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --------------------
# Pydantic Models
# --------------------

class ChatRequest(BaseModel):
    message: str

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
    name: Optional[str] = None
    price: Optional[float] = None
    quantity: Optional[int] = None

class CartItem(BaseModel):
    product_id: int
    quantity: int

class Checkout(BaseModel):
    user_id: int
    cart_items: List[CartItem]

class AdminLogin(BaseModel):
    email: str
    password: str

class UpdateProduct(BaseModel):
    name: Optional[str] = None
    price: Optional[float] = None
    quantity: Optional[int] = None
    category: Optional[str] = None
    description: Optional[str] = None
    brand: Optional[str] = None

class CreateProduct(BaseModel):
    name: str
    price: float
    quantity: int
    category: str
    description: str
    brand: str
    image: str = "🎸"
    year: str = "2024"

class UserResponse(BaseModel):
    id: int
    email: str
    username: str

class AdminResponse(BaseModel):
    id: int
    email: str
    name: str

class GuitarResponse(BaseModel):
    id: int
    name: str
    category: str
    price: float
    quantity: int
    image: str
    description: str
    brand: str
    year: str

class OrderItemResponse(BaseModel):
    product_id: int
    name: str
    price: float
    quantity: int
    subtotal: float

class OrderResponse(BaseModel):
    id: int
    user_id: int
    items: List[OrderItemResponse]
    total: float
    status: str


# --------------------
# Routes
# --------------------

@app.get("/")
def root():
    return {"message": "Hello World!"}


# CHATBOT
@app.post("/chat")
def chat(request: ChatRequest):
    if not CHATBOT_AVAILABLE:
        return {"response": "Chatbot is currently unavailable."}
    response = get_response(request.message)
    return {"response": response}


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
    return {"message": "User created successfully", "success": True, "user": {"id": new_user.id, "email": new_user.email, "username": new_user.username}}


# AUTH - LOGIN
@app.post("/login")
def login(user: LoginUser, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.email == user.email, User.password == user.password).first()
    if existing_user:
        return {"message": "Login successful", "success": True, "user": {"id": existing_user.id, "email": existing_user.email, "username": existing_user.username}}
    return {"message": "Invalid email or password", "success": False}


# ADMIN - LOGIN
@app.post("/admin/login")
def admin_login(admin: AdminLogin, db: Session = Depends(get_db)):
    existing_admin = db.query(Admin).filter(Admin.email == admin.email, Admin.password == admin.password).first()
    if existing_admin:
        return {"message": "Admin login successful", "success": True, "admin": {"id": existing_admin.id, "email": existing_admin.email, "name": existing_admin.name}}
    return {"message": "Invalid admin credentials", "success": False}


# ADMIN - DASHBOARD STATS
@app.get("/admin/stats")
def get_admin_stats(db: Session = Depends(get_db)):
    total_orders = db.query(Order).count()
    total_revenue = db.query(Order).with_entities(db.func.sum(Order.total)).scalar() or 0
    total_products = db.query(Guitar).count()
    total_users = db.query(User).count()
    orders = db.query(Order).all()
    users = db.query(User).all()
    return {
        "total_orders": total_orders,
        "total_revenue": total_revenue,
        "total_products": total_products,
        "total_users": total_users,
        "orders": [{"id": o.id, "user_id": o.user_id, "total": o.total, "status": o.status} for o in orders],
        "users": [{"id": u.id, "email": u.email, "username": u.username} for u in users]
    }


# ADMIN - GET ALL PRODUCTS
@app.get("/admin/products")
def admin_get_products(db: Session = Depends(get_db)):
    guitars = db.query(Guitar).all()
    return [{"id": g.id, "name": g.name, "category": g.category, "price": g.price, "quantity": g.quantity, "image": g.image, "description": g.description, "brand": g.brand, "year": g.year} for g in guitars]


# ADMIN - DELETE PRODUCT
@app.delete("/admin/products/{product_id}")
def admin_delete_product(product_id: int, db: Session = Depends(get_db)):
    guitar = db.query(Guitar).filter(Guitar.id == product_id).first()
    if guitar:
        db.delete(guitar)
        db.commit()
        return {"message": "Product deleted successfully", "success": True}
    return {"message": "Product not found", "success": False}


# ADMIN - UPDATE PRODUCT
@app.put("/admin/products/{product_id}")
def admin_update_product(product_id: int, product: UpdateProduct, db: Session = Depends(get_db)):
    guitar = db.query(Guitar).filter(Guitar.id == product_id).first()
    if guitar:
        if product.name is not None: guitar.name = product.name
        if product.price is not None: guitar.price = product.price
        if product.quantity is not None: guitar.quantity = product.quantity
        if product.category is not None: guitar.category = product.category
        if product.description is not None: guitar.description = product.description
        if product.brand is not None: guitar.brand = product.brand
        db.commit()
        db.refresh(guitar)
        return {"message": "Product updated successfully", "success": True, "product": {"id": guitar.id, "name": guitar.name, "category": guitar.category, "price": guitar.price, "quantity": guitar.quantity, "image": guitar.image, "description": guitar.description, "brand": guitar.brand, "year": guitar.year}}
    return {"message": "Product not found", "success": False}


# ADMIN - ADD NEW PRODUCT
@app.post("/admin/products")
def admin_create_product(product: CreateProduct, db: Session = Depends(get_db)):
    new_product = Guitar(
        name=product.name, price=product.price, quantity=product.quantity,
        category=product.category, description=product.description,
        brand=product.brand, image=product.image, year=product.year
    )
    db.add(new_product)
    db.commit()
    db.refresh(new_product)
    return {"message": "Product created successfully", "success": True, "product": {"id": new_product.id, "name": new_product.name, "category": new_product.category, "price": new_product.price, "quantity": new_product.quantity, "image": new_product.image, "description": new_product.description, "brand": new_product.brand, "year": new_product.year}}


# ADMIN - MARK AS SOLD OUT
@app.put("/admin/products/{product_id}/soldout")
def mark_soldout(product_id: int, db: Session = Depends(get_db)):
    guitar = db.query(Guitar).filter(Guitar.id == product_id).first()
    if guitar:
        guitar.quantity = 0
        db.commit()
        db.refresh(guitar)
        return {"message": "Product marked as sold out", "success": True, "product": {"id": guitar.id, "name": guitar.name, "category": guitar.category, "price": guitar.price, "quantity": guitar.quantity, "image": guitar.image, "description": guitar.description, "brand": guitar.brand, "year": guitar.year}}
    return {"message": "Product not found", "success": False}


# PRODUCTS
@app.get("/products")
def get_products(db: Session = Depends(get_db)):
    guitars = db.query(Guitar).all()
    return [{"id": g.id, "name": g.name, "category": g.category, "price": g.price, "quantity": g.quantity, "image": g.image, "description": g.description, "brand": g.brand, "year": g.year} for g in guitars]


@app.get("/products/{product_id}")
def get_product(product_id: int, db: Session = Depends(get_db)):
    guitar = db.query(Guitar).filter(Guitar.id == product_id).first()
    if guitar:
        return {"id": guitar.id, "name": guitar.name, "category": guitar.category, "price": guitar.price, "quantity": guitar.quantity, "image": guitar.image, "description": guitar.description, "brand": guitar.brand, "year": guitar.year}
    return {"message": "Product not found"}


@app.get("/products/category/{category}")
def get_products_by_category(category: str, db: Session = Depends(get_db)):
    guitars = db.query(Guitar).filter(Guitar.category.ilike(category)).all()
    return [{"id": g.id, "name": g.name, "category": g.category, "price": g.price, "quantity": g.quantity, "image": g.image, "description": g.description, "brand": g.brand, "year": g.year} for g in guitars]


# CHECKOUT
@app.post("/checkout")
def checkout(checkout_data: Checkout, db: Session = Depends(get_db)):
    total_price = 0
    order_items = []
    try:
        for cart_item in checkout_data.cart_items:
            guitar = db.query(Guitar).filter(Guitar.id == cart_item.product_id).first()
            if not guitar:
                raise HTTPException(status_code=404, detail=f"Product {cart_item.product_id} not found")
            if guitar.quantity < cart_item.quantity:
                raise HTTPException(status_code=400, detail=f"Insufficient stock for {guitar.name}")

        for cart_item in checkout_data.cart_items:
            guitar = db.query(Guitar).filter(Guitar.id == cart_item.product_id).first()
            guitar.quantity -= cart_item.quantity
            total_price += guitar.price * cart_item.quantity
            order_items.append({
                "product_id": cart_item.product_id,
                "name": guitar.name,
                "price": guitar.price,
                "quantity": cart_item.quantity,
                "subtotal": guitar.price * cart_item.quantity
            })

        order = Order(user_id=checkout_data.user_id, total=total_price)
        db.add(order)
        db.flush()

        for item in order_items:
            order_item = OrderItem(
                order_id=order.id, product_id=item["product_id"],
                name=item["name"], price=item["price"],
                quantity=item["quantity"], subtotal=item["subtotal"]
            )
            db.add(order_item)

        db.commit()
        db.refresh(order)

        return {
            "message": "Order placed successfully",
            "success": True,
            "order": {"id": order.id, "user_id": order.user_id, "items": order_items, "total": order.total, "status": order.status}
        }

    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Checkout failed: {str(e)}")


# ORDERS
@app.get("/orders/{user_id}")
def get_user_orders(user_id: int, db: Session = Depends(get_db)):
    orders = db.query(Order).filter(Order.user_id == user_id).all()
    result = []
    for order in orders:
        items = db.query(OrderItem).filter(OrderItem.order_id == order.id).all()
        result.append({
            "id": order.id,
            "user_id": order.user_id,
            "items": [{"product_id": i.product_id, "name": i.name, "price": i.price, "quantity": i.quantity, "subtotal": i.subtotal} for i in items],
            "total": order.total,
            "status": order.status
        })
    return result


# ITEMS (legacy)
@app.get("/list-items")
def list_items(db: Session = Depends(get_db)):
    guitars = db.query(Guitar).all()
    return [{"id": g.id, "name": g.name, "category": g.category, "price": g.price, "quantity": g.quantity, "image": g.image, "description": g.description, "brand": g.brand, "year": g.year} for g in guitars]


@app.post("/create-item")
def create_item(item: CreateItem, db: Session = Depends(get_db)):
    new_item = Guitar(
        name=item.name, price=item.price, quantity=item.quantity,
        category="Custom", image="🎸", description="Custom guitar", brand="Custom", year="2024"
    )
    db.add(new_item)
    db.commit()
    db.refresh(new_item)
    return {"id": new_item.id, "name": new_item.name, "category": new_item.category, "price": new_item.price, "quantity": new_item.quantity, "image": new_item.image, "description": new_item.description, "brand": new_item.brand, "year": new_item.year}


@app.put("/update-item/{item_id}")
def update_item(item_id: int, item: UpdateItem, db: Session = Depends(get_db)):
    guitar = db.query(Guitar).filter(Guitar.id == item_id).first()
    if guitar:
        if item.name is not None: guitar.name = item.name
        if item.price is not None: guitar.price = item.price
        if item.quantity is not None: guitar.quantity = item.quantity
        db.commit()
        db.refresh(guitar)
        return {"message": "Item updated successfully", "item": {"id": guitar.id, "name": guitar.name, "category": guitar.category, "price": guitar.price, "quantity": guitar.quantity, "image": guitar.image, "description": guitar.description, "brand": guitar.brand, "year": guitar.year}}
    raise HTTPException(status_code=404, detail=f"Item with id {item_id} not found")


@app.delete("/delete-item/{item_id}")
def delete_item(item_id: int, db: Session = Depends(get_db)):
    guitar = db.query(Guitar).filter(Guitar.id == item_id).first()
    if guitar:
        db.delete(guitar)
        db.commit()
        return {"message": "Item deleted successfully", "item": {"id": guitar.id, "name": guitar.name, "category": guitar.category, "price": guitar.price, "quantity": guitar.quantity, "image": guitar.image, "description": guitar.description, "brand": guitar.brand, "year": guitar.year}}
    return {"message": "Item not found"}


# --------------------
# Run server
# --------------------

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)