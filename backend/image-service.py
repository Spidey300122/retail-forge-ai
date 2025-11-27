from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
from dotenv import load_dotenv
import os
from datetime import datetime

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

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "Image Processing Service",
        "timestamp": datetime.utcnow().isoformat()
    }

@app.post("/process/test")
async def test_endpoint():
    return {
        "message": "Image service is working!",
        "version": "1.0.0"
    }

@app.post("/process/upload")
async def upload_image(file: UploadFile = File(...)):
    """Test image upload"""
    if not file.content_type.startswith("image/"):
        raise HTTPException(400, "File must be an image")
    
    contents = await file.read()
    
    return {
        "success": True,
        "filename": file.filename,
        "size": len(contents),
        "type": file.content_type
    }

if __name__ == "__main__":
    port = int(os.getenv("IMAGE_SERVICE_PORT", 8000))
    uvicorn.run(
        "image-service:app",
        host="0.0.0.0",
        port=port,
        reload=True
    )