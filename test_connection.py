from sqlalchemy import create_engine, text

DATABASE_URL = "postgresql://postgres:admin123@localhost:5432/postgres"

try:
    engine = create_engine(DATABASE_URL)
    with engine.connect() as conn:
        result = conn.execute(text("SELECT version();"))
        version = result.fetchone()
        print("PostgreSQL is connected!")
        print(f"Version: {version[0]}")
except Exception as e:
    print(f"Connection failed: {e}")
    print("PostgreSQL may not be running or credentials are incorrect.")
