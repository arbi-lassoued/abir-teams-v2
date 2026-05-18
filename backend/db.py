from sqlalchemy import create_engine, MetaData
from sqlalchemy.orm import sessionmaker
import os


# Database configuration
# MySQL (commented out temporarily)
# DATABASE_URL = "mysql+pymysql://root:Fa2023word@localhost/tenams"

# SQLite (temporary database)
DATABASE_URL = "sqlite:///./tenams.db"

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {}
)
pool_pre_ping = True
meta = MetaData() 
connect = engine.connect()
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
db_session = SessionLocal() 

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def reset_database():
    """Drop all tables and recreate them"""
    from models.user import Base
    print("🔄 Resetting database...")
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    print("✅ Database reset complete")