"""
FastAPI service for BERT-based text classification
Runs on port 8001
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn
import sys
import os

# Add ai-engine to path
sys.path.append(os.path.join(os.path.dirname(__file__), 'ai-engine/compliance'))

from bert_classifier import ComplianceTextClassifier

app = FastAPI(title="BERT Compliance Service")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize classifier
print("🔧 Loading BERT classifier...")
classifier = ComplianceTextClassifier()
print("✅ BERT service ready")


class ClassifyRequest(BaseModel):
    text: str
    threshold: float = 0.7


class ClassifyResponse(BaseModel):
    label: str
    label_id: int
    confidence: float
    compliant: bool
    all_probabilities: dict


@app.get("/health")
async def health():
    return {"status": "healthy", "service": "BERT Compliance Classifier"}


@app.post("/classify", response_model=ClassifyResponse)
async def classify_text(request: ClassifyRequest):
    """Classify text for compliance violations"""
    try:
        result = classifier.classify_text(request.text, request.threshold)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/classify-batch")
async def classify_batch(texts: list[str], threshold: float = 0.7):
    """Classify multiple texts"""
    try:
        results = classifier.classify_batch(texts, threshold)
        return {"results": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    uvicorn.run(
        "bert-service:app",
        host="0.0.0.0",
        port=8001,
        reload=True
    )