from fastapi import FastAPI, Depends, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import uvicorn
import logging
from sqlalchemy import func
from sqlalchemy.orm import Session
from typing import List, Optional

# Configure logging FIRST (before any try/except that uses logger)
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger(__name__)

# --------------------
# Safe bcrypt import
# --------------------
try:
    import bcrypt
    BCRYPT_AVAILABLE = True
except Exception as e:
    logger.warning(f"⚠️ Bcrypt not loaded, using plain text passwords: {e}")
    BCRYPT_AVAILABLE = False

# --------------------
# Safe DB import
# --------------------
try:
    from models import SessionLocal, User, Admin, Guitar, Order, OrderItem, init_db
    DB_AVAILABLE = True
except Exception as e:
    logger.error(f"❌ Database not loaded: {e}")
    DB_AVAILABLE = False

# --------------------
# Safe chatbot import
# --------------------
try:
    from chatbot.Chatbot import get_response
    CHATBOT_AVAILABLE = True
    logger.info("✅ Chatbot loaded successfully.")
except Exception as e:
    logger.warning(f"⚠️ Chatbot not loaded: {e}")
    CHATBOT_AVAILABLE = False


# --------------------
# Lifespan Context Manager
# --------------------

from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize DB tables on startup
    if DB_AVAILABLE:
        try:
            init_db()
            logger.info("✅ Database initialized on startup.")
            # Seed default admin if none exists
            db = SessionLocal()
            try:
                if not db.query(Admin).first():
                    default_admin = Admin(
                        email="admin@guitar.com",
                        password=hash_password("admin123"),
                        name="Admin"
                    )
                    db.add(default_admin)
                    db.commit()
                    logger.info("✅ Default admin created: admin@guitar.com / admin123")
            except Exception as seed_err:
                db.rollback()
                logger.error(f"❌ Admin seeding failed: {seed_err}")
            finally:
                db.close()
        except Exception as e:
            logger.error(f"❌ DB initialization failed on startup: {e}")
    else:
        logger.error("❌ Skipping DB init — models failed to load.")
    yield

# --------------------
# App Setup
# --------------------

app = FastAPI(
    title="Guitar Store API",
    description="Backend API for Guitar Store application",
    version="1.0.0",
    lifespan=lifespan
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["*"],
)

# Manual OPTIONS preflight handler as backup
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



# --------------------
# DB Dependency
# --------------------

def get_db():
    if not DB_AVAILABLE:
        raise HTTPException(status_code=503, detail="Database unavailable")
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# --------------------
# Pydantic Schemas
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


# --------------------
# Helper: serialize models
# --------------------

def guitar_dict(g):
    return {
        "id": g.id, "name": g.name, "category": g.category,
        "price": g.price, "quantity": g.quantity, "image": g.image,
        "description": g.description, "brand": g.brand, "year": g.year
    }

def order_dict(order, items):
    return {
        "id": order.id,
        "user_id": order.user_id,
        "items": [
            {
                "product_id": i.product_id, "name": i.name,
                "price": i.price, "quantity": i.quantity, "subtotal": i.subtotal
            } for i in items
        ],
        "total": order.total,
        "status": order.status
    }


# --------------------
# Password Helpers
# --------------------

def hash_password(password: str) -> str:
    """Hash a password using bcrypt."""
    if BCRYPT_AVAILABLE:
        # Encode password to bytes (bcrypt requires bytes)
        password_bytes = password.encode('utf-8')
        salt = bcrypt.gensalt()
        hashed = bcrypt.hashpw(password_bytes, salt)
        return hashed.decode('utf-8')
    return password

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against a hash.

    The database may contain unhashed passwords (e.g. legacy or manually
    inserted records). If verification fails with bcrypt, we fall back to 
    a direct comparison. This keeps existing data working while the application 
    can slowly migrate to proper bcrypt hashes.
    """
    if BCRYPT_AVAILABLE:
        try:
            password_bytes = plain_password.encode('utf-8')
            hashed_bytes = hashed_password.encode('utf-8')
            return bcrypt.checkpw(password_bytes, hashed_bytes)
        except Exception:
            # unknown format -> assume stored value is plain text
            logger.warning("Password hash unrecognized, falling back to plain text comparison")
            return plain_password == hashed_password
    return plain_password == hashed_password


# --------------------
# Routes
# --------------------

@app.get("/", tags=["Health"])
def root():
    return {
        "message": "Guitar Store API is running 🎸",
        "db_available": DB_AVAILABLE,
        "chatbot_available": CHATBOT_AVAILABLE
    }


# --------------------
# Chatbot
# --------------------

@app.post("/chat", tags=["Chatbot"])
def chat(request: ChatRequest):
    if not CHATBOT_AVAILABLE:
        raise HTTPException(status_code=503, detail="Chatbot is currently unavailable.")
    try:
        response = get_response(request.message)
        return {"response": response}
    except Exception as e:
        logger.error(f"Chatbot error: {e}")
        raise HTTPException(status_code=500, detail="Chatbot error occurred.")


# --------------------
# Auth
# --------------------

@app.post("/signup", tags=["Auth"])
def signup(user: CreateUser, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == user.email).first():
        raise HTTPException(status_code=409, detail="Email already registered")

    hashed_pwd = hash_password(user.password)
    new_user = User(
        email=user.email,
        username=user.username,
        password=hashed_pwd
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    logger.info(f"New user registered: {new_user.email}")
    return {
        "message": "User created successfully",
        "success": True,
        "user": {"id": new_user.id, "email": new_user.email, "username": new_user.username}
    }


@app.post("/login", tags=["Auth"])
def login(user: LoginUser, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.email == user.email).first()
    if not existing_user or not verify_password(user.password, existing_user.password):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    return {
        "message": "Login successful",
        "success": True,
        "user": {"id": existing_user.id, "email": existing_user.email, "username": existing_user.username}
    }


# --------------------
# Admin
# --------------------

@app.post("/admin/login", tags=["Admin"])
def admin_login(admin: AdminLogin, db: Session = Depends(get_db)):
    existing_admin = db.query(Admin).filter(Admin.email == admin.email).first()
    if not existing_admin or not verify_password(admin.password, existing_admin.password):
        raise HTTPException(status_code=401, detail="Invalid admin credentials")
    return {
        "message": "Admin login successful",
        "success": True,
        "admin": {"id": existing_admin.id, "email": existing_admin.email, "name": existing_admin.name}
    }


@app.get("/admin/stats", tags=["Admin"])
def get_admin_stats(db: Session = Depends(get_db)):
    total_orders   = db.query(Order).count()
    total_revenue  = db.query(func.sum(Order.total)).scalar() or 0.0
    total_products = db.query(Guitar).count()
    total_users    = db.query(User).count()
    orders = db.query(Order).all()
    users  = db.query(User).all()
    return {
        "total_orders": total_orders,
        "total_revenue": round(total_revenue, 2),
        "total_products": total_products,
        "total_users": total_users,
        "orders": [{"id": o.id, "user_id": o.user_id, "total": o.total, "status": o.status} for o in orders],
        "users":  [{"id": u.id, "email": u.email, "username": u.username} for u in users]
    }


@app.get("/admin/products", tags=["Admin"])
def admin_get_products(db: Session = Depends(get_db)):
    return [guitar_dict(g) for g in db.query(Guitar).all()]


@app.post("/admin/products", tags=["Admin"])
def admin_create_product(product: CreateProduct, db: Session = Depends(get_db)):
    new_product = Guitar(
        name=product.name, price=product.price, quantity=product.quantity,
        category=product.category, description=product.description,
        brand=product.brand, image=product.image, year=product.year
    )
    db.add(new_product)
    db.commit()
    db.refresh(new_product)
    logger.info(f"Product created: {new_product.name} (id={new_product.id})")
    return {"message": "Product created successfully", "success": True, "product": guitar_dict(new_product)}


@app.put("/admin/products/{product_id}", tags=["Admin"])
def admin_update_product(product_id: int, product: UpdateProduct, db: Session = Depends(get_db)):
    guitar = db.query(Guitar).filter(Guitar.id == product_id).first()
    if not guitar:
        raise HTTPException(status_code=404, detail="Product not found")

    if product.name        is not None: guitar.name        = product.name
    if product.price       is not None: guitar.price       = product.price
    if product.quantity    is not None: guitar.quantity    = product.quantity
    if product.category    is not None: guitar.category    = product.category
    if product.description is not None: guitar.description = product.description
    if product.brand       is not None: guitar.brand       = product.brand

    db.commit()
    db.refresh(guitar)
    return {"message": "Product updated successfully", "success": True, "product": guitar_dict(guitar)}


@app.delete("/admin/products/{product_id}", tags=["Admin"])
def admin_delete_product(product_id: int, db: Session = Depends(get_db)):
    guitar = db.query(Guitar).filter(Guitar.id == product_id).first()
    if not guitar:
        raise HTTPException(status_code=404, detail="Product not found")
    db.delete(guitar)
    db.commit()
    logger.info(f"Product deleted: id={product_id}")
    return {"message": "Product deleted successfully", "success": True}


@app.put("/admin/products/{product_id}/soldout", tags=["Admin"])
def mark_soldout(product_id: int, db: Session = Depends(get_db)):
    guitar = db.query(Guitar).filter(Guitar.id == product_id).first()
    if not guitar:
        raise HTTPException(status_code=404, detail="Product not found")
    guitar.quantity = 0
    db.commit()
    db.refresh(guitar)
    return {"message": "Product marked as sold out", "success": True, "product": guitar_dict(guitar)}


# --------------------
# Products
# --------------------

@app.get("/products", tags=["Products"])
def get_products(db: Session = Depends(get_db)):
    return [guitar_dict(g) for g in db.query(Guitar).all()]


@app.get("/products/{product_id}", tags=["Products"])
def get_product(product_id: int, db: Session = Depends(get_db)):
    guitar = db.query(Guitar).filter(Guitar.id == product_id).first()
    if not guitar:
        raise HTTPException(status_code=404, detail="Product not found")
    return guitar_dict(guitar)


@app.get("/products/category/{category}", tags=["Products"])
def get_products_by_category(category: str, db: Session = Depends(get_db)):
    guitars = db.query(Guitar).filter(Guitar.category.ilike(f"%{category}%")).all()
    return [guitar_dict(g) for g in guitars]


# --------------------
# Checkout
# --------------------

@app.post("/checkout", tags=["Orders"])
def checkout(checkout_data: Checkout, db: Session = Depends(get_db)):
    if not checkout_data.cart_items:
        raise HTTPException(status_code=400, detail="Cart is empty")

    try:
        # Validate stock first (before any mutations)
        for cart_item in checkout_data.cart_items:
            guitar = db.query(Guitar).filter(Guitar.id == cart_item.product_id).first()
            if not guitar:
                raise HTTPException(status_code=404, detail=f"Product id={cart_item.product_id} not found")
            if cart_item.quantity <= 0:
                raise HTTPException(status_code=400, detail=f"Invalid quantity for product id={cart_item.product_id}")
            if guitar.quantity < cart_item.quantity:
                raise HTTPException(status_code=400, detail=f"Insufficient stock for '{guitar.name}' (available: {guitar.quantity})")

        # Process order
        total_price = 0.0
        order_items = []

        for cart_item in checkout_data.cart_items:
            guitar = db.query(Guitar).filter(Guitar.id == cart_item.product_id).first()
            guitar.quantity -= cart_item.quantity
            subtotal = round(guitar.price * cart_item.quantity, 2)
            total_price += subtotal
            order_items.append({
                "product_id": cart_item.product_id,
                "name": guitar.name,
                "price": guitar.price,
                "quantity": cart_item.quantity,
                "subtotal": subtotal
            })

        order = Order(user_id=checkout_data.user_id, total=round(total_price, 2))
        db.add(order)
        db.flush()

        for item in order_items:
            db.add(OrderItem(
                order_id=order.id,
                product_id=item["product_id"],
                name=item["name"],
                price=item["price"],
                quantity=item["quantity"],
                subtotal=item["subtotal"]
            ))

        db.commit()
        db.refresh(order)
        logger.info(f"Order placed: id={order.id}, user_id={order.user_id}, total={order.total}")

        return {
            "message": "Order placed successfully",
            "success": True,
            "order": {
                "id": order.id,
                "user_id": order.user_id,
                "items": order_items,
                "total": order.total,
                "status": order.status
            }
        }

    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Checkout error: {e}")
        raise HTTPException(status_code=500, detail=f"Checkout failed: {str(e)}")


# --------------------
# Orders
# --------------------

@app.get("/orders/{user_id}", tags=["Orders"])
def get_user_orders(user_id: int, db: Session = Depends(get_db)):
    orders = db.query(Order).filter(Order.user_id == user_id).all()
    result = []
    for order in orders:
        items = db.query(OrderItem).filter(OrderItem.order_id == order.id).all()
        result.append(order_dict(order, items))
    return result


# --------------------
# Legacy Item Routes
# --------------------

@app.get("/list-items", tags=["Legacy"])
def list_items(db: Session = Depends(get_db)):
    return [guitar_dict(g) for g in db.query(Guitar).all()]


@app.post("/create-item", tags=["Legacy"])
def create_item(item: CreateItem, db: Session = Depends(get_db)):
    new_item = Guitar(
        name=item.name, price=item.price, quantity=item.quantity,
        category="Custom", image="🎸", description="Custom guitar",
        brand="Custom", year="2024"
    )
    db.add(new_item)
    db.commit()
    db.refresh(new_item)
    return guitar_dict(new_item)


@app.put("/update-item/{item_id}", tags=["Legacy"])
def update_item(item_id: int, item: UpdateItem, db: Session = Depends(get_db)):
    guitar = db.query(Guitar).filter(Guitar.id == item_id).first()
    if not guitar:
        raise HTTPException(status_code=404, detail=f"Item with id={item_id} not found")
    if item.name     is not None: guitar.name     = item.name
    if item.price    is not None: guitar.price    = item.price
    if item.quantity is not None: guitar.quantity = item.quantity
    db.commit()
    db.refresh(guitar)
    return {"message": "Item updated successfully", "item": guitar_dict(guitar)}


@app.delete("/delete-item/{item_id}", tags=["Legacy"])
def delete_item(item_id: int, db: Session = Depends(get_db)):
    guitar = db.query(Guitar).filter(Guitar.id == item_id).first()
    if not guitar:
        raise HTTPException(status_code=404, detail=f"Item with id={item_id} not found")
    db.delete(guitar)
    db.commit()
    return {"message": "Item deleted successfully"}


# --------------------
# Run server
# --------------------

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)