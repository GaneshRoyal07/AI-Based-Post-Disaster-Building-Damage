"""
Model Loader Service - Production Ready
Handles loading and lifecycle management of YOLO and ResNet50 models
with comprehensive error handling, diagnostics, and detailed logging.
"""

import os
import sys
import tensorflow as tf
import logging
import traceback
from typing import Optional, Any, Dict
from pathlib import Path
import warnings

# Disable TensorFlow verbose output BEFORE importing tensorflow
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'  # 0=all, 1=info, 2=warning, 3=error
os.environ['TF_FORCE_GPU_ALLOW_GROWTH'] = 'true'
os.environ['TF_ENABLE_ONEDNN_OPTS'] = '0'

# Suppress all warnings
warnings.filterwarnings('ignore')

# Configure logging
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(levelname)s - %(name)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Suppress TensorFlow logging
logging.getLogger('tensorflow').setLevel(logging.ERROR)
logging.getLogger('keras').setLevel(logging.ERROR)

# Singleton instances
_yolo_model: Optional[Any] = None
_damage_model: Optional[Any] = None

# Model paths - Using pathlib for proper path handling
BASE_DIR = Path(__file__).resolve().parent.parent.parent
MODELS_DIR = BASE_DIR / "trained_models"
YOLO_MODEL_PATH = MODELS_DIR / "best.pt"
RESNET50_MODEL_PATH = MODELS_DIR / "resnet50_damage.keras"

# Model metadata
MODELS_METADATA = {
    "yolo": {"path": str(YOLO_MODEL_PATH), "loaded": False, "error": None},
    "resnet": {"path": str(RESNET50_MODEL_PATH), "loaded": False, "error": None}
}


def get_system_info() -> Dict[str, str]:
    """Get TensorFlow and Keras version information."""
    try:
        import tensorflow as tf
        import keras
        return {
            "tensorflow_version": tf.__version__,
            "keras_version": keras.__version__,
            "python_version": sys.version.split()[0]
        }
    except ImportError as e:
        error = f"Failed to import TensorFlow/Keras: {str(e)}"
        logger.error(error)
        return {"error": error}


def load_yolo_model() -> Any:
    """
    Load YOLO model from trained_models/best.pt
    Handles PyTorch 2.6+ weights_only security changes
    
    Returns:
        YOLO model instance
        
    Raises:
        FileNotFoundError: If model file doesn't exist
        Exception: If model loading fails
    """
    logger.info("="*80)
    logger.info("YOLO MODEL LOADING STARTED")
    logger.info("="*80)
    
    try:
        # Verify model file exists
        if not YOLO_MODEL_PATH.exists():
            error = f"YOLO model not found at {YOLO_MODEL_PATH}"
            logger.error(f"FILE NOT FOUND: {error}")
            MODELS_METADATA["yolo"]["error"] = error
            raise FileNotFoundError(error)
        
        logger.info(f"Model path: {YOLO_MODEL_PATH}")
        logger.info(f"File size: {YOLO_MODEL_PATH.stat().st_size / (1024*1024):.2f} MB")
        
        # Try to add safe globals for PyTorch 2.6+ compatibility
        try:
            import torch
            from ultralytics.nn.tasks import DetectionModel
            torch.serialization.add_safe_globals([DetectionModel])
            logger.info("✓ Added safe globals for PyTorch model loading")
        except Exception as e:
            logger.warning(f"Could not add safe globals: {e}")
        
        # Import YOLO
        logger.info("Importing ultralytics YOLO...")
        from ultralytics import YOLO
        
        # Load model
        logger.info("Loading YOLO model...")
        model = YOLO(str(YOLO_MODEL_PATH))
        
        logger.info("✓ YOLO model loaded successfully")
        MODELS_METADATA["yolo"]["loaded"] = True
        MODELS_METADATA["yolo"]["error"] = None
        logger.info("="*80)
        
        return model
        
    except FileNotFoundError as e:
        error_msg = f"YOLO Model File Error: {str(e)}"
        logger.error(error_msg)
        MODELS_METADATA["yolo"]["error"] = error_msg
        logger.error("="*80)
        raise
        
    except ImportError as e:
        error_msg = f"ImportError loading ultralytics: {str(e)}"
        logger.error(error_msg)
        logger.error(traceback.format_exc())
        MODELS_METADATA["yolo"]["error"] = error_msg
        logger.error("="*80)
        raise
        
    except Exception as e:
        error_type = type(e).__name__
        error_msg = str(e)
        logger.error(f"\nYOLO LOADING FAILED")
        logger.error(f"Exception Type: {error_type}")
        logger.error(f"Exception Message: {error_msg}")
        logger.error(f"Full traceback:\n{traceback.format_exc()}")
        logger.error("="*80)
        
        MODELS_METADATA["yolo"]["error"] = f"{error_type}: {error_msg}"
        raise




def load_damage_model() -> Any:
    """
    Load ResNet50 damage classification model from trained_models/resnet50_damage.keras
    Uses keras/tensorflow load_model with proper error handling.
    
    Returns:
        Keras/TensorFlow model instance
        
    Raises:
        FileNotFoundError: If model file doesn't exist
        Exception: If model loading fails
    """
    logger.info("="*80)
    logger.info("RESNET50 MODEL LOADING STARTED")
    logger.info("="*80)
    
    try:
        # Verify model file exists
        if not RESNET50_MODEL_PATH.exists():
            error = f"ResNet50 model not found at {RESNET50_MODEL_PATH}"
            logger.error(f"FILE NOT FOUND: {error}")
            MODELS_METADATA["resnet"]["error"] = error
            raise FileNotFoundError(error)
        
        model_size_mb = RESNET50_MODEL_PATH.stat().st_size / (1024*1024)
        logger.info(f"Model path: {RESNET50_MODEL_PATH}")
        logger.info(f"File size: {model_size_mb:.2f} MB")
        
        # Check TensorFlow/Keras versions
        sys_info = get_system_info()
        if "error" not in sys_info:
            logger.info(f"TensorFlow version: {sys_info.get('tensorflow_version')}")
            logger.info(f"Keras version: {sys_info.get('keras_version')}")
        
        # Load model
        logger.info("Loading ResNet50 model...")
        from tensorflow.keras.models import load_model
        
        logger.info("Attempting standard load_model()...")
        model = load_model(str(RESNET50_MODEL_PATH), compile=False)
        
        logger.info("✓ ResNet50 model loaded successfully")
        MODELS_METADATA["resnet"]["loaded"] = True
        MODELS_METADATA["resnet"]["error"] = None
        logger.info("="*80)
        
        return model
        
    except FileNotFoundError as e:
        error_msg = f"ResNet50 Model File Error: {str(e)}"
        logger.error(error_msg)
        MODELS_METADATA["resnet"]["error"] = error_msg
        logger.error("="*80)
        raise
        
    except ImportError as e:
        error_msg = f"ImportError importing TensorFlow/Keras: {str(e)}"
        logger.error(error_msg)
        logger.error(traceback.format_exc())
        MODELS_METADATA["resnet"]["error"] = error_msg
        logger.error("="*80)
        raise
        
    except Exception as e:
        error_type = type(e).__name__
        error_msg = str(e)
        
        logger.error(f"\nRESNET50 LOADING FAILED")
        logger.error(f"Exception Type: {error_type}")
        logger.error(f"Exception Message: {error_msg}")
        logger.error(f"Full traceback:\n{traceback.format_exc()}")
        logger.error(f"Model path: {RESNET50_MODEL_PATH}")
        logger.error(f"File exists: {RESNET50_MODEL_PATH.exists()}")
        
        # Check for common issues
        if "custom_objects" in error_msg.lower():
            logger.error("HINT: Model contains custom layers. Check model definition.")
        elif "unknown" in error_msg.lower() or "unsupported" in error_msg.lower():
            logger.error("HINT: Model contains unsupported layers for current TensorFlow version.")
            logger.error("ACTION: Try updating TensorFlow: pip install --upgrade tensorflow")
        
        logger.error("="*80)
        
        MODELS_METADATA["resnet"]["error"] = f"{error_type}: {error_msg}"
        raise


def get_yolo_model() -> Any:
    """
    Get or load YOLO model (singleton pattern)
    
    Returns:
        YOLO model instance
    """
    global _yolo_model
    
    if _yolo_model is None:
        _yolo_model = load_yolo_model()
    
    return _yolo_model


def get_damage_model() -> Any:
    """
    Get or load ResNet50 damage model (singleton pattern)
    
    Returns:
        Keras/TensorFlow model instance
    """
    global _damage_model
    
    if _damage_model is None:
        _damage_model = load_damage_model()
    
    return _damage_model


def reload_models() -> None:
    """Force reload both models (useful for testing or model updates)."""
    global _yolo_model, _damage_model
    logger.info("Reloading models...")
    _yolo_model = None
    _damage_model = None
    MODELS_METADATA["yolo"]["loaded"] = False
    MODELS_METADATA["resnet"]["loaded"] = False
    logger.info("✓ Models reset. They will be reloaded on next access.")


def get_models_status() -> Dict[str, Any]:
    """
    Get detailed status of both models without attempting to load them.
    
    Returns:
        Dict with model loading status and metadata
    """
    sys_info = get_system_info()
    
    return {
        "yolo": {
            "loaded": MODELS_METADATA["yolo"]["loaded"],
            "path": str(YOLO_MODEL_PATH),
            "exists": YOLO_MODEL_PATH.exists(),
            "size_mb": YOLO_MODEL_PATH.stat().st_size / (1024*1024) if YOLO_MODEL_PATH.exists() else None,
            "error": MODELS_METADATA["yolo"]["error"]
        },
        "resnet": {
            "loaded": MODELS_METADATA["resnet"]["loaded"],
            "path": str(RESNET50_MODEL_PATH),
            "exists": RESNET50_MODEL_PATH.exists(),
            "size_mb": RESNET50_MODEL_PATH.stat().st_size / (1024*1024) if RESNET50_MODEL_PATH.exists() else None,
            "error": MODELS_METADATA["resnet"]["error"]
        },
        "system": sys_info,
        "paths": {
            "yolo": str(YOLO_MODEL_PATH),
            "resnet": str(RESNET50_MODEL_PATH),
            "models_dir": str(MODELS_DIR)
        }
    }
