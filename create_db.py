from sqlalchemy import create_engine, text

# Connect to the default postgres database to create the new one
DATABASE_URL = "postgresql://postgres:admin123@localhost:5432/postgres"

# Use autocommit for DDL operations
engine = create_engine(DATABASE_URL, isolation_level="AUTOCOMMIT")

try:
    with engine.connect() as conn:
        # Check if database exists
        result = conn.execute(text("SELECT 1 FROM pg_database WHERE datname = 'guitar_store'"))
        if result.fetchone():
            print("Database 'guitar_store' already exists!")
        else:
            # Create database if it doesn't exist
            conn.execute(text("CREATE DATABASE guitar_store"))
            print("Database 'guitar_store' created successfully!")
except Exception as e:
    print(f"Error creating database: {e}")
