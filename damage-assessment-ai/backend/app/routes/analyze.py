"""
Analysis Routes
POST /api/analyze endpoint for building damage assessment
"""

import os
import shutil
from fastapi import APIRouter, UploadFile, File, HTTPException
from ..services.image_analysis_real import analyze_image

router = APIRouter(prefix="/api", tags=["analysis"])

# Temp directory for storing uploaded files during processing
TEMP_DIR = os.path.join(os.path.dirname(__file__), "../../uploads")


@router.post("/analyze")
async def analyze_building_damage(file: UploadFile = File(...)):
    """
    Analyze building damage from uploaded image.
    
    Expected input: multipart/form-data with image file
    
    Returns:
        {
            "success": true,
            "damage_level": "Major Damage",
            "confidence": 94.3,
            "recommendation": "Structural inspection required",
            "annotated_image": "/results/image.jpg",
            "buildings_detected": 1
        }
    """
    
    if not file:
        raise HTTPException(status_code=400, detail="No file provided")
    
    # Validate file type
    allowed_extensions = {"jpg", "jpeg", "png", "bmp"}
    if file.filename:
        file_ext = file.filename.split(".")[-1].lower()
        if file_ext not in allowed_extensions:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid file type. Allowed: {', '.join(allowed_extensions)}"
            )
    
    # Save uploaded file
    try:
        import tempfile
        temp_path = os.path.join(TEMP_DIR, file.filename or "temp.jpg")
        
        with open(temp_path, "wb") as f:
            content = await file.read()
            f.write(content)
        
        # Analyze image
        result = analyze_image(temp_path)
        
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing image: {str(e)}")
    finally:
        # Optional: Clean up temp file if not needed
        try:
            if os.path.exists(temp_path):
                pass  # Keep for reference, or delete with os.remove(temp_path)
        except:
            pass
