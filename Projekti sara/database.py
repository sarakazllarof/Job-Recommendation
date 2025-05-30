from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# Update with your actual MySQL credentials and database name
MYSQL_USER = 'root'
MYSQL_PASSWORD = 'root'  # Make sure this matches your MySQL root password
MYSQL_HOST = 'localhost'
MYSQL_DB = 'job_recommendation_db'

SQLALCHEMY_DATABASE_URL = f"mysql+mysqlconnector://{MYSQL_USER}:{MYSQL_PASSWORD}@{MYSQL_HOST}/{MYSQL_DB}"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    echo=True,
    pool_recycle=3600
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# ✅ Add this line to fix the ImportError
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# NOTE: After adding the 'bio' field to the User model, run a migration to update the database schema.
# For SQLite, you may need to manually alter the table or recreate it if not using Alembic. 

