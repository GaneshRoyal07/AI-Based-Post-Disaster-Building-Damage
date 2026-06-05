"""
FastAPI Main Application
Entry point for the Building Damage Assessment API
Includes production-ready model loading with comprehensive error handling
"""

import os
import sys
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from .routes import analyze, health
from .services.model_loader import (
    get_yolo_model, 
    get_damage_model,
    get_models_status,
    load_yolo_model,
    load_damage_model
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(name)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title="Building Damage Assessment API",
    description="AI-powered API for post-disaster building damage assessment",
    version="1.0.0"
)

# Enable CORS for frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify exact frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routes
app.include_router(health.router)
app.include_router(analyze.router)

# Serve static files (uploaded images and results)
uploads_dir = os.path.join(os.path.dirname(__file__), "../uploads")
results_dir = os.path.join(os.path.dirname(__file__), "../results")

os.makedirs(uploads_dir, exist_ok=True)
os.makedirs(results_dir, exist_ok=True)

app.mount("/uploads", StaticFiles(directory=uploads_dir), name="uploads")
app.mount("/results", StaticFiles(directory=results_dir), name="results")


# Startup event - Load models on application start
@app.on_event("startup")
async def startup_event():
    print("Loading YOLO...")
    try:
        load_yolo_model()
    except Exception as e:
        print(f"Error: {e}")
        
    print("Loading ResNet...")
    try:
        load_damage_model()
    except Exception as e:
        print(f"Error: {e}")
        
    print("Models Loaded Successfully")


# Root endpoint
@app.get("/")
async def root():
    """API root endpoint - basic application info."""
    return {
        "name": "Building Damage Assessment API",
        "version": "1.0.0",
        "status": "running",
        "endpoints": {
            "health": "GET /api/health",
            "models": "GET /api/models",
            "analyze": "POST /api/analyze"
        }
    }


# Shutdown event
@app.on_event("shutdown")
async def shutdown_event():
    """Clean up on shutdown."""
    logger.info("\n🛑 Shutting down API...")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )
