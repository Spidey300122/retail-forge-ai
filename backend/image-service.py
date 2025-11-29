from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
import uvicorn
from dotenv import load_dotenv
import os
from datetime import datetime
import shutil
import uuid
import time

# Import our processing functions
from image_processing.background_removal import remove_background, remove_background_simple
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
        "timestamp": datetime.utcnow().isoformat(),
        "endpoints": [
            "/process/remove-background",
            "/process/extract-colors",
            "/process/optimize"
        ]
    }

@app.post("/process/remove-background")
async def remove_bg_endpoint(
    file: UploadFile = File(...),
    method: str = "sam"  # "sam" or "simple"
):
    """
    Remove background from uploaded image
    
    Methods:
    - sam: Use Segment Anything Model (slower, better quality)
    - simple: Use GrabCut (faster, lower quality)
    """
    start_time = time.time()
    
    try:
        # Generate unique filename
        file_id = str(uuid.uuid4())
        input_ext = os.path.splitext(file.filename)[1] or '.jpg'
        input_path = f"temp/uploads/{file_id}{input_ext}"
        output_path = f"temp/processed/{file_id}_nobg.png"
        
        # Save uploaded file
        with open(input_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        file_size = os.path.getsize(input_path)
        print(f"📥 Received file: {file.filename} ({file_size} bytes)")
        
        # Check file size (max 10MB)
        if file_size > 10 * 1024 * 1024:
            os.remove(input_path)
            raise HTTPException(400, "File too large (max 10MB)")
        
        # Process based on method
        if method == "sam":
            print(f"🎨 Using SAM method for background removal...")
            result = remove_background(input_path, output_path)
        else:
            print(f"🎨 Using GrabCut method for background removal...")
            result = remove_background_simple(input_path, output_path)
        
        if not result["success"]:
            raise HTTPException(500, result["error"])
        
        processing_time = time.time() - start_time
        print(f"⏱️  Processing completed in {processing_time:.2f} seconds")
        
        # Return file info
        return {
            "success": True,
            "file_id": file_id,
            "output_filename": f"{file_id}_nobg.png",
            "download_url": f"/process/download/{file_id}_nobg.png",
            "metadata": {
                "mask_area": result.get("mask_area"),
                "total_masks": result.get("total_masks"),
                "dimensions": result.get("dimensions"),
                "method": method,
                "processing_time_seconds": round(processing_time, 2)
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error in remove_bg_endpoint: {str(e)}")
        raise HTTPException(500, str(e))
    finally:
        # Cleanup input file
        if os.path.exists(input_path):
            try:
                os.remove(input_path)
            except:
                pass

@app.get("/process/download/{filename}")
async def download_processed_file(filename: str):
    """Download processed file"""
    file_path = f"temp/processed/{filename}"
    
    if not os.path.exists(file_path):
        raise HTTPException(404, "File not found")
    
    return FileResponse(
        file_path,
        media_type="image/png",
        filename=filename,
        headers={"Cache-Control": "no-cache"}
    )

@app.post("/process/extract-colors")
async def extract_colors_endpoint(
    file: UploadFile = File(...), 
    count: int = 5
):
    """Extract dominant colors from image"""
    try:
        # Save uploaded file
        file_id = str(uuid.uuid4())
        input_ext = os.path.splitext(file.filename)[1] or '.jpg'
        input_path = f"temp/uploads/{file_id}{input_ext}"
        
        with open(input_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        print(f"🎨 Extracting {count} colors from {file.filename}")
        
        # Extract colors
        result = extract_colors(input_path, count)
        
        # Cleanup
        os.remove(input_path)
        
        if not result["success"]:
            raise HTTPException(500, result["error"])
        
        return result
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        raise HTTPException(500, str(e))

@app.post("/process/optimize")
async def optimize_endpoint(
    file: UploadFile = File(...),
    target_size_kb: int = 500,
    format: str = "JPEG"
):
    """Optimize image to target size"""
    try:
        # Save uploaded file
        file_id = str(uuid.uuid4())
        input_ext = os.path.splitext(file.filename)[1] or '.jpg'
        input_path = f"temp/uploads/{file_id}{input_ext}"
        
        with open(input_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Determine output format
        output_ext = ".jpg" if format.upper() == "JPEG" else ".png"
        output_path = f"temp/processed/{file_id}_opt{output_ext}"
        
        print(f"🗜️  Optimizing {file.filename} to {target_size_kb}KB")
        
        # Optimize
        result = optimize_image(input_path, output_path, target_size_kb, format.upper())
        
        # Cleanup input
        os.remove(input_path)
        
        if not result["success"]:
            raise HTTPException(500, result["error"])
        
        return {
            **result,
            "file_id": file_id,
            "download_url": f"/process/download/{file_id}_opt{output_ext}"
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        raise HTTPException(500, str(e))

# Cleanup old files on startup
@app.on_event("startup")
async def cleanup_temp_files():
    """Clean up old temp files"""
    print("🧹 Cleaning up old temporary files...")
    
    for folder in ["temp/uploads", "temp/processed"]:
        if os.path.exists(folder):
            for filename in os.listdir(folder):
                file_path = os.path.join(folder, filename)
                # Delete files older than 1 hour
                if os.path.isfile(file_path):
                    if time.time() - os.path.getmtime(file_path) > 3600:
                        try:
                            os.remove(file_path)
                            print(f"   🗑️  Cleaned up: {filename}")
                        except:
                            pass

if __name__ == "__main__":
    port = int(os.getenv("IMAGE_SERVICE_PORT", 8000))
    
    print("=" * 60)
    print("🚀 Starting Retail Forge AI - Image Processing Service")
    print("=" * 60)
    print(f"📍 Port: {port}")
    print(f"📁 Temp folders: temp/uploads, temp/processed")
    print(f"🔗 Health check: http://localhost:{port}/health")
    print("=" * 60)
    
    uvicorn.run(
        "image-service:app",
        host="0.0.0.0",
        port=port,
        reload=True,
        log_level="info"
    )