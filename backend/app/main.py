"""
FastAPI main application entry point.
Configures CORS, secure headers, routes, and observability.

Auth: Firebase Auth (frontend issues ID tokens; backend verifies via firebase-admin)
DB:   Firestore (via firebase-admin SDK)

Env vars: All from core/config.py
Run: uvicorn backend.app.main:app --host 0.0.0.0 --port 7860
"""
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse
from prometheus_client import Counter, Histogram, generate_latest, CONTENT_TYPE_LATEST

from backend.app.core.config import settings
from backend.app.core.logging import setup_logging, get_logger
from backend.app.api.routes import router as analysis_router
from backend.app.api.models import HealthResponse
from backend.app.db.firestore import init_firebase

# Sentry (optional)
if settings.SENTRY_DSN:
    import sentry_sdk
    from sentry_sdk.integrations.fastapi import FastApiIntegration
    sentry_sdk.init(dsn=settings.SENTRY_DSN, integrations=[FastApiIntegration()])

setup_logging(settings.LOG_LEVEL)
logger = get_logger(__name__)

# Prometheus metrics
REQUEST_COUNT = Counter("http_requests_total", "Total HTTP requests", ["method", "endpoint", "status"])
REQUEST_LATENCY = Histogram("http_request_duration_seconds", "Request latency", ["method", "endpoint"])


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting Zynera API")
    if settings.FIRESTORE_AUTO_INIT:
        init_firebase()
    else:
        logger.info("Firestore auto-init disabled (FIRESTORE_AUTO_INIT=false) – skipping")
    yield
    logger.info("Shutting down")


app = FastAPI(
    title=settings.APP_NAME,
    version="1.0.0",
    description="Zynera – AI-powered detection of LLM misuse in information operations",
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response: Response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()"
    return response


@app.middleware("http")
async def metrics_middleware(request: Request, call_next):
    import time
    start = time.time()
    response = await call_next(request)
    duration = time.time() - start
    REQUEST_COUNT.labels(request.method, request.url.path, response.status_code).inc()
    REQUEST_LATENCY.labels(request.method, request.url.path).observe(duration)
    return response


app.include_router(analysis_router)


@app.get("/", include_in_schema=False)
async def root():
    """Root redirect – keeps HF Space health checker happy."""
    return RedirectResponse(url="/health")


@app.get("/health", response_model=HealthResponse)
async def health():
    return HealthResponse()


@app.get("/metrics")
async def metrics():
    return Response(content=generate_latest(), media_type=CONTENT_TYPE_LATEST)
