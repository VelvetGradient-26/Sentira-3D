# Frontend & Backend Connection Setup

## Quick Start Guide

### Prerequisites

- Python 3.11+
- Node.js 18+
- The trained model at `src/model/saved_model/`

### Backend Setup (FastAPI)

1. **Install Python dependencies** (if not already done):

   ```bash
   pip install -r requirements.txt
   ```

2. **Start the FastAPI server**:

   ```bash
   uvicorn src.api.main:app --reload --host 127.0.0.1 --port 8000
   ```

   The API will be available at: `http://127.0.0.1:8000`

3. **Check health endpoint**:

   ```bash
   curl http://127.0.0.1:8000/health
   ```

4. **API Documentation** (auto-generated):
   - Swagger UI: `http://127.0.0.1:8000/docs`
   - ReDoc: `http://127.0.0.1:8000/redoc`

---

### Frontend Setup (React + Vite)

1. **Install dependencies**:

   ```bash
   cd frontend
   npm install
   ```

2. **Configure API URL** (already done in `.env.local`):
   - Default: `http://127.0.0.1:8000`
   - To change: Edit `frontend/.env.local`

3. **Start development server**:

   ```bash
   npm run dev
   ```

   The frontend will be available at: `http://localhost:5173`

---

## Backend Endpoints

### `/predict` (POST)

Analyzes sentiment of input text.

**Request**:

```json
{
  "text": "I love this product! It's amazing!"
}
```

**Response**:

```json
{
  "sentiment": "Positive",
  "confidence": 0.9523,
  "inference_time_ms": 24.56
}
```

### `/health` (GET)

Check if backend and model are ready.

**Response**:

```json
{
  "status": "healthy",
  "model_loaded": true
}
```

---

## Troubleshooting

### Backend won't start

- **Check model exists**: `src/model/saved_model/` should have model files
- **Check ports**: Ensure port 8000 is available
- **Check dependencies**: Run `pip install -r requirements.txt`

### Frontend can't connect

- **Ensure backend is running**: Check `http://127.0.0.1:8000/health`
- **Check CORS**: Backend allows `http://localhost:5173` by default
- **Check browser console**: Look for error messages in DevTools

### "Backend unavailable" fallback message

- Frontend falls back to mock predictions if backend isn't responding
- Check backend logs for detailed errors

---

## Production Deployment

### Backend

```bash
uvicorn src.api.main:app --host 0.0.0.0 --port 8000
```

### Frontend

```bash
npm run build
npm run preview
```

Update `frontend/.env.local` with production API URL.

---

## Configuration Files

- **Frontend**: `frontend/.env.local` - API URL configuration
- **Backend**: `src/config.py` - Server, CORS, and model paths
