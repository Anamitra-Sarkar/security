# Sentinel – LLM Misuse Detection System

A production-ready system for detecting and mitigating misuse of Large Language Models (LLMs) in malign information operations. Uses **only pretrained models** via Hugging Face Inference Endpoints and Groq Llama API — no training required.

## Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                         FRONTEND (Vercel)                        │
│  Next.js 16 + Tailwind CSS                                       │
│  Landing Page → "Try Now" CTA → Analyzer App                    │
│  Dark/Light toggle, Animations, Explainability panels            │
└───────────────────────────┬──────────────────────────────────────┘
                            │ HTTPS (REST API)
┌───────────────────────────▼──────────────────────────────────────┐
│                       BACKEND (Render)                            │
│  FastAPI + Uvicorn                                               │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────────────┐    │
│  │  /api/analyze│  │ /api/auth/*  │  │ /health  /metrics    │    │
│  └──────┬──────┘  └──────────────┘  └──────────────────────┘    │
│         │                                                        │
│  ┌──────▼──────────────────────────────────────────────────┐    │
│  │              Analysis Pipeline                           │    │
│  │  1. AI Detection (HF) ──────────────────────┐           │    │
│  │  2. Perplexity (Groq Llama) ────────────────┤           │    │
│  │  3. Embeddings + Clustering (HF + Qdrant) ──┤ Ensemble  │    │
│  │  4. Harm/Extremism (HF) ────────────────────┤ Scoring   │    │
│  │  5. Stylometry (local CPU) ─────────────────┘           │    │
│  └─────────────────────────────────────────────────────────┘    │
│         │                                                        │
│  ┌──────▼──────┐  ┌────────────┐  ┌──────────────────────┐     │
│  │  PostgreSQL  │  │   Redis    │  │  Worker (Redis Queue)│     │
│  │  (Render DB) │  │ (Upstash)  │  │  Async inference     │     │
│  └─────────────┘  └────────────┘  └──────────────────────┘     │
└──────────────────────────────────────────────────────────────────┘
         │                              │
   ┌─────▼─────┐                 ┌──────▼───────┐
   │  Qdrant   │                 │ HF Inference  │
   │ (hosted)  │                 │  Endpoints    │
   └───────────┘                 └───────────────┘
```

## Models Used (Pretrained Only)

| Signal | Model | Provider |
|--------|-------|----------|
| AI Text Detection (primary) | `desklib/ai-text-detector-v1.01` (DeBERTa-v3-large) | HF Inference |
| AI Text Detection (secondary) | `fakespot-ai/roberta-base-ai-text-detection-v1` | HF Inference |
| Embeddings (quality) | `sentence-transformers/all-mpnet-base-v2` | HF Inference |
| Embeddings (fast) | `sentence-transformers/all-MiniLM-L6-v2` | HF Inference |
| Harm/Extremism | `facebook/roberta-hate-speech-dynabench-r4-target` | HF Inference |
| Perplexity LM | Llama 3.3 70B (via Groq) | Groq API |
| Stylometry | Local CPU (n-grams, function words, readability) | Built-in |

## Ensemble Scoring

Signals are combined with configurable weights:
- `p_ai` (0.30) – AI-generation probability
- `s_perp` (0.20) – Perplexity anomaly
- `s_embed_cluster` (0.15) – Semantic cluster density
- `p_ext` (0.20) – Extremism/harm probability
- `s_styl` (0.10) – Stylometry anomaly
- `p_watermark` (0.05) – Watermark (negative signal)

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/analyze` | Analyze single text, returns threat_score + signals |
| POST | `/api/analyze/bulk` | Analyze up to 20 texts |
| GET | `/api/results/{id}` | Get stored analysis result |
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login, get JWT token |
| GET | `/health` | Health check |
| GET | `/metrics` | Prometheus metrics |

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `REDIS_URL` | Redis URL (Upstash/RedisCloud) | Yes |
| `HF_API_KEY` | Hugging Face API token | Yes |
| `GROQ_API_KEY` | Groq API key | Yes |
| `JWT_SECRET` | Secret for JWT signing | Yes |
| `SENTRY_DSN` | Sentry DSN for error tracking | No |
| `CORS_ORIGINS` | Comma-separated allowed origins | No |
| `QDRANT_URL` | Qdrant vector DB URL | No |
| `QDRANT_API_KEY` | Qdrant API key | No |
| `NEXT_PUBLIC_API_URL` | Backend API URL for frontend | Frontend |
| `RENDER_SERVICE_ID` | Render service ID for deploys | CI/CD |
| `VERCEL_TOKEN` | Vercel deploy token | CI/CD |
| `HF_SPACE_REPO_URL` | HF Space repo (user/space) | CI/CD |

## Quick Start (Local Development)

```bash
# Backend
cd backend
pip install -r requirements.txt
cp ../.env.example .env  # Configure env vars
uvicorn backend.app.main:app --reload --port 8000

# Frontend
cd frontend
npm install
NEXT_PUBLIC_API_URL=http://localhost:8000 npm run dev

# Run tests
python -m pytest backend/tests/ -v
```

## Deploy Steps

### Backend (Render)
1. Connect repo to Render
2. Render auto-detects `render.yaml`
3. Set environment variables in Render dashboard
4. Deploy triggers automatically on push to `main`

### Frontend (Vercel)
1. Import repo in Vercel
2. Set root directory to `frontend`
3. Set `NEXT_PUBLIC_API_URL` to your Render backend URL
4. Deploy triggers automatically on push to `main`

### HF Space Sync
1. Create a Hugging Face Space
2. Set `HF_API_KEY` and `HF_SPACE_REPO_URL` in GitHub secrets
3. The `hf_space_sync.yml` workflow pushes to HF on every push to `main`

## Smoke Tests

```bash
# After deployment, run:
bash scripts/smoke_test.sh https://your-backend-url.onrender.com
```

## Testing

```bash
# All tests
python -m pytest backend/tests/ -v

# With coverage
python -m pytest backend/tests/ -v --cov=backend --cov-report=html

# Load test
python -m backend.tests.test_load --url http://localhost:8000 --concurrency 10 --requests 50
```

## Acceptance Criteria

- [x] POST `/api/analyze` → returns per-signal scores, ensemble threat_score, and explainability array
- [x] Frontend loads landing page with "Try Now" CTA
- [x] CTA transitions to main analyzer app
- [x] Text submission displays results with signal scores
- [x] GitHub Actions CI runs tests and builds
- [x] HF Space sync workflow included

## License

Apache 2.0 – See [LICENSE](LICENSE)
