from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
from dotenv import load_dotenv
import os
from datetime import datetime
import shutil

# Import our processing functions
from image_processing.background_removal import remove_background
from image_processing.color_extraction import extract_colors
from image_processing.optimization import optimize_image

load_dotenv()

app = FastAPI(title="Retail Forge AI - Image Service")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create temp directories
os.makedirs("temp/uploads", exist_ok=True)
os.makedirs("temp/processed", exist_ok=True)

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "Image Processing Service",
        "timestamp": datetime.utcnow().isoformat()
    }

@app.post("/process/remove-background")
async def remove_bg_endpoint(file: UploadFile = File(...)):
    """Remove background from uploaded image"""
    try:
        # Save uploaded file
        input_path = f"temp/uploads/{file.filename}"
        with open(input_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Process
        output_path = f"temp/processed/{file.filename.rsplit('.', 1)[0]}_nobg.png"
        result = remove_background(input_path, output_path)
        
        if not result["success"]:
            raise HTTPException(500, result["error"])
        
        return {
            "success": True,
            "output_path": output_path,
            "message": "Background removed successfully"
        }
    except Exception as e:
        raise HTTPException(500, str(e))

@app.post("/process/extract-colors")
async def extract_colors_endpoint(file: UploadFile = File(...), count: int = 5):
    """Extract dominant colors from image"""
    try:
        # Save uploaded file
        input_path = f"temp/uploads/{file.filename}"
        with open(input_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Extract colors
        result = extract_colors(input_path, count)
        
        if not result["success"]:
            raise HTTPException(500, result["error"])
        
        return result
    except Exception as e:
        raise HTTPException(500, str(e))

@app.post("/process/optimize")
async def optimize_endpoint(file: UploadFile = File(...), target_size_kb: int = 500):
    """Optimize image to target size"""
    try:
        # Save uploaded file
        input_path = f"temp/uploads/{file.filename}"
        with open(input_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Optimize
        output_path = f"temp/processed/{file.filename.rsplit('.', 1)[0]}_opt.jpg"
        result = optimize_image(input_path, output_path, target_size_kb)
        
        if not result["success"]:
            raise HTTPException(500, result["error"])
        
        return result
    except Exception as e:
        raise HTTPException(500, str(e))

if __name__ == "__main__":
    port = int(os.getenv("IMAGE_SERVICE_PORT", 8000))
    uvicorn.run(
        "image-service:app",
        host="0.0.0.0",
        port=port,
        reload=True
    )