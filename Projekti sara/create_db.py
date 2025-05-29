from models import Base
from database import engine

# This will create the tables in the database
if __name__ == "__main__":
    Base.metadata.create_all(bind=engine)
    print("Tables created.") 