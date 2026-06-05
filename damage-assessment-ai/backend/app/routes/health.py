"""
Health Check Routes
GET /api/health - Application health status
GET /api/models - Model loading status with detailed diagnostics
"""

from fastapi import APIRouter, HTTPException
import logging
from ..services.model_loader import (
    get_yolo_model, 
    get_damage_model, 
    get_models_status,
    MODELS_METADATA
)

router = APIRouter(prefix="/api", tags=["health"])
logger = logging.getLogger(__name__)


@router.get("/health")
async def health_check():
    """
    Check if application is running and healthy.
    
    Returns:
        {
            "status": "healthy",
            "version": "1.0.0"
        }
    """
    return {
        "status": "healthy",
        "version": "1.0.0"
    }


@router.get("/models")
async def models_status():
    try:
        if not MODELS_METADATA["yolo"]["loaded"]:
            get_yolo_model()
            
        if not MODELS_METADATA["resnet"]["loaded"]:
            get_damage_model()
            
        status = get_models_status()
        
        return {
            "yolo_loaded": bool(status["yolo"]["loaded"]),
            "resnet_loaded": bool(status["resnet"]["loaded"]),
            "mode": "real",
            "yolo_path": str(status["paths"]["yolo"]),
            "resnet_path": str(status["paths"]["resnet"])
        }
    except Exception as e:
        logger.error(f"Error getting model status: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )
