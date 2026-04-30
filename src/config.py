"""Configuration for Sentira-3D Backend"""
import os
from pathlib import Path

# Server Configuration
SERVER_HOST = os.getenv("SERVER_HOST", "127.0.0.1")
SERVER_PORT = int(os.getenv("SERVER_PORT", "8000"))

# CORS Configuration
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000").split(",")

# Model Configuration
BASE_DIR = Path(__file__).resolve().parent.parent
MODEL_DIR = BASE_DIR / "src" / "model" / "model_train_1"

# Logging
DEBUG = os.getenv("DEBUG", "False").lower() == "true"
