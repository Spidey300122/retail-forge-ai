from fastapi import FastAPI, File, UploadFile, HTTPException, Form
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

# New imports for background generation
from image_processing.background_generation import generate_background, save_generated_background

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
            "/process/optimize",
            "/process/generate-background"
        ]
    }


# -----------------------------------------------------------
# BACKGROUND REMOVAL
# -----------------------------------------------------------

@app.post("/process/remove-background")
async def remove_bg_endpoint(
    file: UploadFile = File(...),
    method: str = "sam"  # "sam" or "simple"
):
    """Remove background from uploaded image."""
    start_time = time.time()

    try:
        file_id = str(uuid.uuid4())
        input_ext = os.path.splitext(file.filename)[1] or ".jpg"
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

        # Process
        if method == "sam":
            print("🎨 Using SAM background removal…")
            result = remove_background(input_path, output_path)
        else:
            print("🎨 Using GrabCut background removal…")
            result = remove_background_simple(input_path, output_path)

        if not result["success"]:
            raise HTTPException(500, result["error"])

        processing_time = time.time() - start_time

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
        print(f"❌ Error in remove_bg_endpoint: {e}")
        raise HTTPException(500, str(e))
    finally:
        if os.path.exists(input_path):
            try:
                os.remove(input_path)
            except:
                pass


# -----------------------------------------------------------
# DOWNLOAD PROCESSED FILE
# -----------------------------------------------------------

@app.get("/process/download/{filename}")
async def download_processed_file(filename: str):
    file_path = f"temp/processed/{filename}"

    if not os.path.exists(file_path):
        raise HTTPException(404, "File not found")

    return FileResponse(
        file_path,
        media_type="image/png",
        filename=filename,
        headers={"Cache-Control": "no-cache"}
    )


# -----------------------------------------------------------
# COLOR EXTRACTION
# -----------------------------------------------------------

@app.post("/process/extract-colors")
async def extract_colors_endpoint(
    file: UploadFile = File(...),
    count: int = 5
):
    """Extract dominant colors from an image."""
    try:
        file_id = str(uuid.uuid4())
        input_ext = os.path.splitext(file.filename)[1] or ".jpg"
        input_path = f"temp/uploads/{file_id}{input_ext}"

        with open(input_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        print(f"🎨 Extracting {count} colors from {file.filename}")

        result = extract_colors(input_path, count)

        os.remove(input_path)

        if not result["success"]:
            raise HTTPException(500, result["error"])

        return result

    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error: {e}")
        raise HTTPException(500, str(e))


# -----------------------------------------------------------
# IMAGE OPTIMIZATION
# -----------------------------------------------------------

@app.post("/process/optimize")
async def optimize_endpoint(
    file: UploadFile = File(...),
    target_size_kb: int = 500,
    format: str = "JPEG"
):
    """Optimize image to target size."""
    try:
        file_id = str(uuid.uuid4())
        input_ext = os.path.splitext(file.filename)[1] or ".jpg"
        input_path = f"temp/uploads/{file_id}{input_ext}"

        with open(input_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        output_ext = ".jpg" if format.upper() == "JPEG" else ".png"
        output_path = f"temp/processed/{file_id}_opt{output_ext}"

        print(f"🗜️ Optimizing {file.filename} to {target_size_kb}KB")

        result = optimize_image(input_path, output_path, target_size_kb, format.upper())

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
        print(f"❌ Error: {e}")
        raise HTTPException(500, str(e))


# -----------------------------------------------------------
# BACKGROUND GENERATION (NEW ENDPOINT)
# -----------------------------------------------------------

@app.post("/process/generate-background")
async def generate_background_endpoint(
    prompt: str = Form(...),
    style: str = Form("professional"),
    width: int = Form(1024),
    height: int = Form(1024)
):
    """
    Generate background using Stable Diffusion
    Styles: professional, modern, minimal, vibrant, abstract, gradient, textured
    """
    start_time = time.time()

    try:
        file_id = str(uuid.uuid4())
        output_path = f"temp/processed/{file_id}_background.jpg"

        print("🎨 Generating background…")
        print(f"   Prompt: {prompt}")
        print(f"   Style:  {style}")
        print(f"   Size:   {width}x{height}")

        result = generate_background(
            prompt=prompt,
            style=style,
            width=width,
            height=height
        )

        if not result["success"]:
            raise HTTPException(500, result["error"])

        save_generated_background(
            image=result["image"],
            output_path=output_path,
            optimize=True,
            max_size_kb=500
        )

        processing_time = time.time() - start_time
        file_size_kb = os.path.getsize(output_path) / 1024

        print(f"⏱️ Completed in {processing_time:.2f} seconds")
        print(f"📦 File size: {file_size_kb:.1f} KB")

        return {
            "success": True,
            "file_id": file_id,
            "output_filename": f"{file_id}_background.jpg",
            "download_url": f"/process/download/{file_id}_background.jpg",
            "metadata": {
                "prompt": prompt,
                "enhanced_prompt": result.get("enhanced_prompt"),
                "style": style,
                "dimensions": result.get("dimensions"),
                "processing_time_seconds": round(processing_time, 2),
                "file_size_kb": round(file_size_kb, 1)
            }
        }

    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error in generate_background_endpoint: {e}")
        raise HTTPException(500, str(e))


# -----------------------------------------------------------
# CLEANUP OLD TEMP FILES
# -----------------------------------------------------------

@app.on_event("startup")
async def cleanup_temp_files():
    print("🧹 Cleaning up temp files…")

    for folder in ["temp/uploads", "temp/processed"]:
        if os.path.exists(folder):
            for filename in os.listdir(folder):
                file_path = os.path.join(folder, filename)

                if os.path.isfile(file_path):
                    if time.time() - os.path.getmtime(file_path) > 3600:
                        try:
                            os.remove(file_path)
                            print(f"   🗑️ Deleted: {filename}")
                        except:
                            pass


# -----------------------------------------------------------
# UVICORN SERVER
# -----------------------------------------------------------

if __name__ == "__main__":
    port = int(os.getenv("IMAGE_SERVICE_PORT", 8000))

    print("=" * 60)
    print("🚀 Starting Retail Forge AI - Image Processing Service")
    print("=" * 60)
    print(f"📍 Port: {port}")
    print(f"📁 Temp folders: temp/uploads, temp/processed")
    print(f"🔗 Health: http://localhost:{port}/health")
    print("=" * 60)

    uvicorn.run(
        "image-service:app",
        host="0.0.0.0",
        port=port,
        reload=True,
        log_level="info"
    )
