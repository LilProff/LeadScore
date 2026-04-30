import sys
import os

# Add the backend directory to the path so we can import from 'app'
backend_path = os.path.join(os.path.dirname(__file__), "..", "backend")
sys.path.append(backend_path)

# This allows 'from app.config import settings' to work
from app.main import app
