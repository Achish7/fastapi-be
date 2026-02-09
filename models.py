from sqlalchemy import Column, Integer, String, Float, ForeignKey
from database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    username = Column(String)
    password = Column(String)


class Admin(Base):
    __tablename__ = "admins"

    id = Column(Integer, primary_key=True)
    email = Column(String, unique=True)
    password = Column(String)
    name = Column(String)


class Guitar(Base):
    __tablename__ = "guitars"

    id = Column(Integer, primary_key=True)
    name = Column(String)
    category = Column(String)
    price = Column(Float)
    quantity = Column(Integer)
    image = Column(String)
    description = Column(String)
    brand = Column(String)
    year = Column(String)


class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    total = Column(Float)
    status = Column(String)
