from sqlalchemy import create_engine, Column, Integer, String, Float, Text, ForeignKey, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
import datetime

DATABASE_URL = "postgresql://postgres:admin123@localhost:5432/guitar_store"

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    username = Column(String)
    password = Column(String)

class Admin(Base):
    __tablename__ = "admins"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    password = Column(String)
    name = Column(String)

class Guitar(Base):
    __tablename__ = "guitars"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    category = Column(String)
    price = Column(Float)
    quantity = Column(Integer)
    image = Column(String)
    description = Column(Text)
    brand = Column(String)
    year = Column(String)

class Order(Base):
    __tablename__ = "orders"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    total = Column(Float)
    status = Column(String, default="completed")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class OrderItem(Base):
    __tablename__ = "order_items"
    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"))
    product_id = Column(Integer, ForeignKey("guitars.id"))
    name = Column(String)
    price = Column(Float)
    quantity = Column(Integer)
    subtotal = Column(Float)

# Create tables
Base.metadata.create_all(bind=engine)
