"""
MINIMAL DEBUG VERSION - NO HEAVY DEPENDENCIES
Tests port binding only. Deploys in 2 minutes.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import os
from datetime import datetime

app = FastAPI(title="DEBUG - Image Service Port Test")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all for testing
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    """Root endpoint"""
    port = os.getenv("PORT", "NOT_SET")
    return {
        "status": "🎉 SERVICE IS RUNNING!",
        "message": "If you see this, port binding works!",
        "port_env": port,
        "timestamp": datetime.utcnow().isoformat()
    }


@app.get("/health")
async def health():
    """Health check for Render"""
    return {
        "status": "healthy",
        "service": "DEBUG Image Service",
        "port": os.getenv("PORT", "8000"),
        "render": os.getenv("RENDER", "false"),
        "timestamp": datetime.utcnow().isoformat()
    }


@app.get("/test")
async def test():
    """Test endpoint with all environment info"""
    return {
        "message": "Test successful!",
        "environment": {
            "PORT": os.getenv("PORT", "NOT_SET"),
            "RENDER": os.getenv("RENDER", "NOT_SET"),
            "RENDER_SERVICE_NAME": os.getenv("RENDER_SERVICE_NAME", "NOT_SET"),
            "PYTHON_VERSION": os.getenv("PYTHON_VERSION", "NOT_SET")
        },
        "cwd": os.getcwd(),
        "timestamp": datetime.utcnow().isoformat()
    }


# -----------------------------------------------------------
# MAIN - MULTIPLE DEBUG VERSIONS TO TEST
# -----------------------------------------------------------

if __name__ == "__main__":
    # Get port (Render sets this automatically)
    port = int(os.getenv("PORT", 8000))
    
    print("=" * 70)
    print("🔍 DEBUG MODE - Testing Port Binding")
    print("=" * 70)
    print(f"📍 PORT environment variable: {os.getenv('PORT', 'NOT SET')}")
    print(f"📍 Using port: {port}")
    print(f"🌍 RENDER env: {os.getenv('RENDER', 'NOT SET')}")
    print(f"🔗 Binding to: 0.0.0.0:{port}")
    print("=" * 70)
    print("")
    
    # METHOD 1: Direct app object (recommended)
    print("🚀 Starting with: uvicorn.run(app, ...)")
    print("")
    
    uvicorn.run(
        app,               # ✅ Direct object
        host="0.0.0.0",   # ✅ Required for Render
        port=port,
        log_level="info",
        access_log=True
    )
    
    # If above doesn't work, try these alternatives:
    
    # METHOD 2: String reference
    # uvicorn.run(
    #     "image-service:app",
    #     host="0.0.0.0",
    #     port=port,
    #     reload=False
    # )
    
    # METHOD 3: Manual server start
    # import asyncio
    # from uvicorn import Config, Server
    # config = Config(app, host="0.0.0.0", port=port, log_level="info")
    # server = Server(config)
    # asyncio.run(server.serve())