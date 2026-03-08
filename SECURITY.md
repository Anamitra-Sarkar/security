# Security Policy

## Secret Management

All secrets are managed via environment variables. **Never commit secrets to source code.**

### Required Secrets

| Secret | Purpose | Rotation Frequency |
|--------|---------|-------------------|
| `HF_API_KEY` | Hugging Face Inference API access | Every 90 days |
| `GROQ_API_KEY` | Groq LLM API access | Every 90 days |
| `REDIS_URL` | Redis connection (includes password) | On compromise |
| `SENTRY_DSN` | Error tracking | Rarely |

### Secret Rotation Procedure

1. Generate new secret value
2. Update in deployment platform (Hugging Face Spaces/Vercel) environment settings
3. Redeploy affected services
4. Verify health checks pass
5. Revoke old secret value at the provider

### GitHub Actions Secrets

Set in repository Settings → Secrets and variables → Actions:
- `VERCEL_TOKEN` – for frontend deploy
- `HF_API_KEY` – for HF Space deploy

## Security Headers

The backend applies the following security headers:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Strict-Transport-Security: max-age=31536000; includeSubDomains`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`

## Authentication

- Public API endpoints do not require login/signup
- Rate limiting via Redis sliding window (30 requests/minute default)

## CORS

- Configured via `CORS_ORIGINS` environment variable
- Default allows only localhost in development
- Set to your frontend domain in production

## Data Handling

- Recent analysis results are stored in process memory for retrieval by result ID
- PII is automatically redacted from application logs
- Text content is hashed (SHA-256) for caching and deduplication

## Reporting Vulnerabilities

Please report security vulnerabilities by opening a private security advisory
in the GitHub repository. Do not open public issues for security concerns.

## IAM Recommendations

- Use dedicated service accounts for each deployment platform
- Apply principle of least privilege for API keys
- Enable MFA on all provider accounts (GitHub, Hugging Face, Vercel, Groq)
- Review API key permissions quarterly
