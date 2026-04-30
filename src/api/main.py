from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import torch
from transformers import DistilBertForSequenceClassification, DistilBertTokenizerFast
from pathlib import Path
import time
import sys
import os

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

try:
    from config import ALLOWED_ORIGINS, MODEL_DIR, DEBUG
except ImportError:
    # Fallback if config doesn't exist
    ALLOWED_ORIGINS = ["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000", "http://localhost:8080"]
    MODEL_DIR = Path(__file__).resolve().parent.parent / "model" / "model_train_1"
    DEBUG = False

# --- API Models ---
class SentimentRequest(BaseModel):
    text: str

class SentimentResponse(BaseModel):
    sentiment: str
    confidence: float
    inference_time_ms: float

# --- Initialize FastAPI ---
app = FastAPI(
    title="Sentira-3D Inference API",
    description="Real-time sentiment analysis engine powered by Quantized DistilBERT",
    version="1.0.0"
)

# Enable CORS for the React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global variables to hold model and tokenizer
model = None
tokenizer = None

@app.on_event("startup")
async def load_model():
    """Loads and quantizes the model when the server starts."""
    global model, tokenizer
    print(f"Loading model from {MODEL_DIR}...")
    
    if not MODEL_DIR.exists():
        raise RuntimeError(f"Model directory not found at {MODEL_DIR}. Did the training script finish?")

    try:
        # 1. Load the standard model to CPU
        raw_model = DistilBertForSequenceClassification.from_pretrained(MODEL_DIR)
        
        # 2. Apply Dynamic Quantization
        try:
            # Fix for Apple Silicon (M1/M2/M3) - Set the correct quantization engine for ARM architectures
            if "qnnpack" in torch.backends.quantized.supported_engines:
                torch.backends.quantized.engine = "qnnpack"
                
            print("Applying Dynamic Quantization (FP32 -> INT8)...")
            quantized_model = torch.quantization.quantize_dynamic(
                raw_model, 
                {torch.nn.Linear}, # Only quantize the linear layers
                dtype=torch.qint8
            )
            model = quantized_model
            print("✅ Quantized Model loaded successfully!")
        except Exception as q_err:
            print(f"⚠️ Quantization failed: {q_err}")
            print("⚠️ Falling back to standard FP32 model. Inference will still be very fast on M1!")
            model = raw_model
            
        model.eval() # Set to evaluation mode
        
        # 3. Load Tokenizer
        tokenizer = DistilBertTokenizerFast.from_pretrained(MODEL_DIR)
        print("✅ Tokenizer loaded successfully!")
        
    except Exception as e:
        print(f"❌ Error loading model: {e}")
        raise e

@app.post("/predict", response_model=SentimentResponse)
async def predict_sentiment(request: SentimentRequest):
    """Takes a string and returns the sentiment (Positive/Negative/Neutral) with confidence."""
    if not request.text.strip():
        raise HTTPException(status_code=400, detail="Text cannot be empty.")

    start_time = time.time()
    NEUTRAL_THRESHOLD = 0.62  # If confidence is below this, classify as neutral

    try:
        # 1. Tokenize input
        inputs = tokenizer(
            request.text,
            return_tensors="pt",
            truncation=True,
            max_length=35, # The optimized length we found in EDA
            padding=True
        )

        # 2. Run Inference
        with torch.no_grad():
            outputs = model(**inputs)
            logits = outputs.logits
            
            # Convert logits to probabilities using Softmax
            probabilities = torch.nn.functional.softmax(logits, dim=1)
            
            # Get the highest probability and its corresponding class index
            confidence, predicted_class = torch.max(probabilities, dim=1)
            
            confidence_val = confidence.item()
            class_idx = predicted_class.item()

        # 3. Format Output - Classify as Neutral if confidence is too low
        if confidence_val < NEUTRAL_THRESHOLD:
            sentiment_label = "Neutral"
        else:
            sentiment_label = "Positive" if class_idx == 1 else "Negative"
        
        inference_time = (time.time() - start_time) * 1000 # Convert to milliseconds

        return {
            "sentiment": sentiment_label,
            "confidence": round(confidence_val, 4),
            "inference_time_ms": round(inference_time, 2)
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health_check():
    return {"status": "healthy", "model_loaded": model is not None}