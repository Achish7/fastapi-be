from sqlalchemy import create_engine, Column, Integer, String, Float, Text, ForeignKey, DateTime
from sqlalchemy.orm import sessionmaker, relationship, declarative_base
from datetime import datetime
import os
import logging

logger = logging.getLogger(__name__)

# Use PostgreSQL database
# DATABASE_URL can be set via environment variable
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://postgres:admin123@localhost:5432/guitar_store"  # PostgreSQL connection
)

# Create engine
engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,        # Test connections before using them
    pool_recycle=300,          # Recycle connections every 5 minutes
    connect_args={"connect_timeout": 5}  # Fail fast if DB is unreachable
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


# --------------------
# Models
# --------------------

class User(Base):
    __tablename__ = "users"

    id       = Column(Integer, primary_key=True, index=True)
    email    = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, nullable=False)
    password = Column(String, nullable=False)   # Store hashed passwords in production

    orders   = relationship("Order", back_populates="user")


class Admin(Base):
    __tablename__ = "admins"

    id       = Column(Integer, primary_key=True, index=True)
    email    = Column(String, unique=True, index=True, nullable=False)
    password = Column(String, nullable=False)   # Store hashed passwords in production
    name     = Column(String, nullable=False)


class Guitar(Base):
    __tablename__ = "guitars"

    id          = Column(Integer, primary_key=True, index=True)
    name        = Column(String, nullable=False)
    category    = Column(String, nullable=False)
    price       = Column(Float, nullable=False)
    quantity    = Column(Integer, nullable=False, default=0)
    image       = Column(String, default="🎸")
    description = Column(Text, default="")
    brand       = Column(String, default="")
    year        = Column(String, default="2024")


class Order(Base):
    __tablename__ = "orders"

    id         = Column(Integer, primary_key=True, index=True)
    user_id    = Column(Integer, ForeignKey("users.id"), nullable=False)
    total      = Column(Float, nullable=False, default=0.0)
    status     = Column(String, default="pending")
    created_at = Column(DateTime, default=datetime.utcnow)

    user       = relationship("User", back_populates="orders")
    items      = relationship("OrderItem", back_populates="order")


class OrderItem(Base):
    __tablename__ = "order_items"

    id         = Column(Integer, primary_key=True, index=True)
    order_id   = Column(Integer, ForeignKey("orders.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("guitars.id"), nullable=False)
    name       = Column(String, nullable=False)
    price      = Column(Float, nullable=False)
    quantity   = Column(Integer, nullable=False)
    subtotal   = Column(Float, nullable=False)

    order      = relationship("Order", back_populates="items")


# --------------------
# Safe table creation
# --------------------

def init_db():
    """Create all tables safely. Called explicitly — not at import time."""
    try:
        Base.metadata.create_all(bind=engine)
        logger.info("✅ Database tables created/verified successfully.")
    except Exception as e:
        logger.error(f"❌ Failed to initialize database tables: {e}")
        raise