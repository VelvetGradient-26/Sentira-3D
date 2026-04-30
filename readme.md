# Sentira-3D: Real-Time 3D Sentiment Analysis Engine

![Python](https://img.shields.io/badge/Python-3.11+-blue)
![PyTorch](https://img.shields.io/badge/PyTorch-2.0+-red)
![React](https://img.shields.io/badge/React-19+-61DAFB)
![License](https://img.shields.io/badge/License-MIT-green)

A cutting-edge sentiment analysis system combining **quantized DistilBERT** for real-time inference with an **interactive 3D visualization interface**. Features support for both NVIDIA GPUs (CUDA) and Apple Silicon (MPS), delivering low-latency sentiment predictions with particle-based 3D animations.

---

## 🎯 Features

- **🚀 High-Performance Inference**: Quantized DistilBERT with FP32→INT8 dynamic quantization for 2-3x speedup
- **🎨 Interactive 3D Visualization**: Real-time particle animations using Three.js responding to sentiment
- **💻 Multi-Device Support**: CUDA (NVIDIA GPU), MPS (Apple Silicon), and CPU fallback
- **📊 Sentiment Classification**: Three-class output (Positive, Negative, Neutral) with confidence scores
- **⚡ Low Latency**: <50ms inference on M1/M2/M3, <10ms on NVIDIA GPUs
- **🔌 REST API**: FastAPI backend with auto-generated Swagger documentation
- **🎭 Beautiful UI**: Modern glassmorphism design with real-time feedback

---

## 📈 Model Performance

Trained on **Sentiment140 dataset** (1.6M tweets) with comprehensive evaluation on 320K test samples:

### Core Metrics

- **Accuracy**: 88.49%
- **Precision**: 88.49% (macro & weighted)
- **Recall**: 88.49% (macro & weighted)
- **F1-Score**: 88.49% (macro & weighted)

### Advanced Metrics

- **ROC AUC**: 0.9546 (excellent discrimination)
- **Cohen's Kappa**: 0.7697 (strong agreement)
- **Log Loss**: 0.2729 (well-calibrated predictions)

### Class-wise Performance

```
              precision    recall  f1-score   support
    Negative     0.8829    0.8875    0.8852    160001
    Positive     0.8869    0.8822    0.8846    160000
```

### Visualizations

- **Confusion Matrix**: 142K true negatives, 141K true positives, minimal misclassification
- **ROC Curve**: AUC = 0.9546 demonstrates strong predictive power

See [evaluation results](src/model/evaluation_results/) for detailed plots and metrics.

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     User Interface (React)                   │
│              • Three.js 3D Particle Visualization            │
│              • Glassmorphism Design                          │
│              • Real-time Sentiment Display                   │
└────────────────────┬────────────────────────────────────────┘
                     │ HTTP/REST
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                    FastAPI Backend                           │
│              • CORS-enabled for frontend                     │
│              • Health check & prediction endpoints           │
│              • Model loading & quantization                  │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│            Quantized DistilBERT Model                        │
│  • FP32→INT8 Dynamic Quantization (PyTorch)                 │
│  • 6 transformer layers, 66M parameters → ~33M effective     │
│  • Multi-device support (CUDA/MPS/CPU)                      │
│  • Trained on Sentiment140 (1.6M tweets)                    │
└─────────────────────────────────────────────────────────────┘
```

---

## 📦 Installation

### Prerequisites

- **Python**: 3.11+
- **Node.js**: 18+
- **GPU** (optional): NVIDIA GPU with CUDA support or Apple Silicon M1/M2/M3+

### 1. Clone & Environment Setup

```bash
# Clone repository
git clone https://github.com/yourusername/Sentira-3D.git
cd Sentira-3D

# Create conda environment
conda create -n sentiraenv python=3.11
conda activate sentiraenv

# Install Python dependencies
pip install -r requirements.txt
```

### 2. Verify GPU Support

```bash
# Check PyTorch GPU availability
python -c "import torch; print('CUDA available:', torch.cuda.is_available()); print('MPS available:', torch.backends.mps.is_available())"
```

### 3. Frontend Setup

```bash
cd frontend
npm install
```

---

## 🚀 Quick Start

### Option 1: Full Stack (Recommended)

**Terminal 1 - Start Backend**:

```bash
conda activate sentiraenv
uvicorn src.api.main:app --reload --host 127.0.0.1 --port 8000
```

**Terminal 2 - Start Frontend**:

```bash
cd frontend
npm run dev
```

Then open: `http://localhost:5173`

### Option 2: Backend Only (API Testing)

```bash
conda activate sentiraenv
uvicorn src.api.main:app --reload --host 127.0.0.1 --port 8000
```

Visit `http://127.0.0.1:8000/docs` for interactive API documentation.

---

## 💡 Usage

### Frontend Application

1. **Type or paste text** into the textarea (supports up to 140 characters)
2. **Click "Predict Sentiment"** button
3. **Watch 3D particles respond**:
   - 🟢 **Green + Expansion** = Positive sentiment
   - 🔴 **Red + Contraction** = Negative sentiment
   - 🟡 **Yellow + Maximum Expansion** = Neutral sentiment
4. **View confidence score** and inference time

### API Endpoints

#### POST `/predict` - Sentiment Analysis

```bash
curl -X POST "http://127.0.0.1:8000/predict" \
  -H "Content-Type: application/json" \
  -d '{"text": "I absolutely love this product!"}'
```

**Response**:

```json
{
  "sentiment": "Positive",
  "confidence": 0.9567,
  "inference_time_ms": 24.32
}
```

#### GET `/health` - Health Check

```bash
curl "http://127.0.0.1:8000/health"
```

**Response**:

```json
{
  "status": "healthy",
  "model_loaded": true
}
```

---

## 📂 Project Structure

```
Sentira-3D/
├── data/
│   ├── raw/              # Original Sentiment140 dataset
│   └── processed/        # Cleaned, preprocessed data
│
├── src/
│   ├── api/
│   │   └── main.py       # FastAPI server & inference endpoints
│   ├── data/
│   │   └── cleaner.py    # Data preprocessing pipeline
│   ├── model/
│   │   ├── model_train_1/        # Trained DistilBERT (quantized weights)
│   │   ├── saved_model/          # Alternative model checkpoint
│   │   ├── CUDA/
│   │   │   ├── cuda_trainer.py   # CUDA training script (FP16 AMP)
│   │   │   └── cuda_dataset_loader.py
│   │   ├── MPS/
│   │   │   ├── train_mps.py      # Apple Silicon training script
│   │   │   └── dataset.py        # Dataset utilities
│   │   ├── evaluate.py           # Comprehensive evaluation & metrics
│   │   └── evaluation_results/   # Plots & reports (300 DPI PNG)
│   └── config.py         # Configuration (model paths, API settings)
│
├── frontend/             # React + Vite + Tailwind
│   ├── src/
│   │   ├── App.jsx       # Main 3D sentiment visualization
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
├── notebooks/
│   ├── 01-eda.ipynb      # Exploratory data analysis
│   ├── 02-cleaning.ipynb # Data cleaning workflow
│   └── test.py
│
├── requirements.txt      # Python dependencies
├── SETUP.md             # Setup guide
├── readme.md            # This file
└── .env.local           # Environment variables (API URL)
```

---

## 🧠 Model Training

### Training on CUDA (NVIDIA GPU)

```bash
python src/model/CUDA/cuda_trainer.py
```

**Features**:

- Mixed Precision (FP16) with autocast
- Gradient accumulation support
- Dynamic quantization after training

### Training on MPS (Apple Silicon)

```bash
python src/model/MPS/train_mps.py
```

**Features**:

- Optimized for M1/M2/M3 architecture
- torch.compile backend for additional speedup
- Memory-efficient batch processing

### Hyperparameters

Default configuration:

- **Model**: DistilBERT (uncased, 6 layers)
- **Batch Size**: 32-64 (CUDA uses larger batches)
- **Epochs**: 3
- **Learning Rate**: 2e-5 (AdamW)
- **Max Sequence Length**: 35 tokens
- **Warmup Steps**: 10% of training steps
- **Quantization**: Dynamic INT8

---

## 📊 Evaluation

Run comprehensive evaluation on 320K test samples:

```bash
python src/model/evaluate.py
```

**Generates**:

- ✅ Core metrics (accuracy, precision, recall, F1)
- ✅ Classification report (per-class breakdown)
- ✅ Confusion matrix with visualization
- ✅ ROC curve (AUC score)
- ✅ Log loss (probability calibration)
- ✅ Cohen's Kappa (inter-rater agreement)
- ✅ High-quality plots (300 DPI PNG)

**Output**: `src/model/evaluation_results/`

---

## 💻 Device Support

### NVIDIA GPU (CUDA)

```python
# Automatic detection
device = torch.device("cuda")
print(f"GPU: {torch.cuda.get_device_name(0)}")

# Inference: ~10-15ms per sample
```

**Optimizations**:

- Mixed Precision (FP16) training
- Dynamic Quantization (INT8)
- Gradient clipping & checkpointing

### Apple Silicon (MPS)

```python
# Automatic detection
device = torch.device("mps" if torch.backends.mps.is_available() else "cpu")

# Inference: ~40-50ms per sample
```

**Optimizations**:

- QNNPACK quantization engine
- torch.compile backend
- Optimized batch processing

### CPU (Fallback)

```python
# Automatic detection if GPU unavailable
device = torch.device("cpu")

# Inference: ~100-200ms per sample (slower)
```

---

## 📈 Performance Benchmarks

| Device          | Model Size | Inference Time | Throughput    | Memory |
| --------------- | ---------- | -------------- | ------------- | ------ |
| M1 Max (MPS)    | 33M (INT8) | 45ms           | 22 samples/s  | ~1.2GB |
| RTX 3080 (CUDA) | 33M (INT8) | 8ms            | 125 samples/s | ~2GB   |
| CPU (Intel i9)  | 33M (INT8) | 150ms          | 6.7 samples/s | ~1.5GB |

**Speedup from Quantization**: 2-3x faster, minimal accuracy loss

---

## 🔧 Configuration

### Backend Configuration

Edit `src/config.py`:

```python
# Server
SERVER_HOST = "127.0.0.1"
SERVER_PORT = 8000

# CORS
ALLOWED_ORIGINS = ["http://localhost:5173", "http://localhost:3000"]

# Model
MODEL_DIR = BASE_DIR / "src" / "model" / "model_train_1"

# Logging
DEBUG = False
```

### Frontend Configuration

Edit `frontend/.env.local`:

```
VITE_API_URL=http://127.0.0.1:8000
```

---

## 🐛 Troubleshooting

### Issue: "ModuleNotFoundError: No module named 'torch'"

**Solution**: Activate conda environment

```bash
conda activate sentiraenv
```

### Issue: "Model directory not found"

**Solution**: Ensure model exists at `src/model/model_train_1/`

```bash
ls -la src/model/model_train_1/
```

### Issue: "CUDA out of memory"

**Solution**: Reduce batch size in training scripts

```python
BATCH_SIZE = 16  # From 64
```

### Issue: MPS "operation not supported"

**Solution**: Uses CPU fallback automatically (slower but works)

### Issue: Frontend can't reach backend

**Solution**: Verify backend is running and check `VITE_API_URL` in `.env.local`

---

## 📚 Dataset

**Sentiment140**: 1.6M+ Twitter tweets (Stanford corpus)

- **Classes**: Negative (0), Positive (4)
- **Split**: 70% train, 10% validation, 20% test
- **Preprocessing**:
  - URL removal
  - Username removal
  - Lowercasing
  - Tokenization (max 35 tokens)

**Data Location**: `data/processed/cleaned_sentiment140.csv`

---

## 🎓 Training & Fine-tuning

### Resume Training from Checkpoint

```python
# Load pretrained weights
model = DistilBertForSequenceClassification.from_pretrained(
    'src/model/model_train_1'
)

# Continue training with new data
# ... training code ...
```

### Fine-tune on Custom Dataset

1. **Prepare CSV** with columns: `text`, `target` (0 or 1)
2. **Update** `PROCESSED_DATA_FILE` in training script
3. **Adjust hyperparameters** as needed
4. **Run trainer**: `python src/model/[CUDA|MPS]/train_*.py`

---

## 🚀 Deployment

### Docker (Coming Soon)

```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY src/ src/
CMD ["uvicorn", "src.api.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Cloud Deployment

- **AWS SageMaker**: Compatible with FastAPI endpoint
- **Google Cloud Run**: Serverless deployment ready
- **Hugging Face Spaces**: Full stack demo

---

## 📝 Citation

If you use Sentira-3D in your research, please cite:

```bibtex
@software{sentira3d2026,
  title = {Sentira-3D: Real-Time 3D Sentiment Analysis Engine},
  author = {Deepak},
  year = {2026},
  url = {https://github.com/yourusername/Sentira-3D}
}
```

---

## 📄 License

This project is licensed under the MIT License - see [LICENSE](LICENSE) file for details.

---

## 🤝 Contributing

We welcome contributions! Here's how:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Development Setup

```bash
# Clone your fork
git clone https://github.com/yourusername/Sentira-3D.git
cd Sentira-3D

# Create development branch
git checkout -b development

# Install dev dependencies
pip install -r requirements.txt
pip install black flake8 pytest

# Run tests
pytest
```

---

## 📞 Support & Contact

- 📧 **Email**: deepak@example.com
- 🐛 **Issues**: [GitHub Issues](https://github.com/yourusername/Sentira-3D/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/yourusername/Sentira-3D/discussions)

---

## 🎉 Acknowledgments

- **DistilBERT**: Hugging Face Transformers
- **PyTorch**: Meta AI
- **Three.js**: Dynamic 3D visualization
- **Sentiment140**: Stanford NLP Group
- **FastAPI**: Sebastián Ramírez
- **React**: Meta Frameworks Team

---

## 📊 Roadmap

- [ ] Support for 5+ sentiment labels (very positive to very negative)
- [ ] Multi-language support (Spanish, French, German, etc.)
- [ ] Batch inference API endpoints
- [ ] WebSocket support for real-time streaming
- [ ] Advanced explainability (attention visualization)
- [ ] Mobile app (React Native)
- [ ] Cloud deployment templates
- [ ] Grafana dashboard for monitoring

---

**Made with ❤️ for the NLP & ML community**
