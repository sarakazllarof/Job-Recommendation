# Job Search and Recommendation Platform

This is a full-stack application for job searching and recommendations, built with FastAPI (backend) and React (frontend).

## Prerequisites

Before you begin, ensure you have the following installed:
- Python 3.x
- Node.js and npm
- Git

## Project Structure
```
├── frontend/           # React frontend application
└── Projekti sara/     # FastAPI backend application
```

## Backend Setup

1. Create and activate a Python virtual environment:
```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On Unix/MacOS:
source venv/bin/activate
```

2. Install Python dependencies:
```bash
pip install fastapi
pip install uvicorn
pip install sqlalchemy
pip install python-multipart
pip install python-jose[cryptography]
pip install passlib[bcrypt]
pip install pydantic
pip install python-dotenv
pip install alembic
```

3. Set up environment variables:
Create a `.env` file in the backend directory with the following variables:
```
DATABASE_URL=your_database_connection_string
JWT_SECRET_KEY=your_jwt_secret_key
```

4. Initialize the database:
```bash
# Run database migrations
alembic upgrade head
```

## Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install Node.js dependencies:
```bash
npm install
```

## Running the Application

1. Start the backend server:
```bash
# From the root directory
cd "Projekti sara"
uvicorn main:app --reload
```
The backend server will run at http://localhost:8000

2. In a new terminal, start the frontend development server:
```bash
cd frontend
npm run dev
```
The frontend will be available at http://localhost:5173

## Features
- User authentication and authorization
- Job search functionality
- CV upload and management
- Job recommendations
- User profile management

## API Documentation
Once the backend server is running, you can access the API documentation at:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Development
- Backend: FastAPI, SQLAlchemy, Alembic
- Frontend: React, TypeScript, Material-UI, Vite

## Contributing
1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request
