# Security Policy

## Secret Management

All secrets are managed via environment variables. **Never commit secrets to source code.**

### Required Secrets

| Secret | Purpose | Rotation Frequency |
|--------|---------|-------------------|
| `JWT_SECRET` | Signs authentication tokens | Every 90 days |
| `HF_API_KEY` | Hugging Face Inference API access | Every 90 days |
| `GROQ_API_KEY` | Groq LLM API access | Every 90 days |
| `DATABASE_URL` | PostgreSQL connection (includes password) | On compromise |
| `REDIS_URL` | Redis connection (includes password) | On compromise |
| `SENTRY_DSN` | Error tracking | Rarely |

### Secret Rotation Procedure

1. Generate new secret value
2. Update in deployment platform (Render/Vercel) environment settings
3. Redeploy affected services
4. Verify health checks pass
5. Revoke old secret value at the provider

### GitHub Actions Secrets

Set in repository Settings → Secrets and variables → Actions:
- `RENDER_SERVICE_ID`, `RENDER_API_KEY` – for backend deploy
- `VERCEL_TOKEN` – for frontend deploy
- `HF_API_KEY`, `HF_SPACE_REPO_URL` – for HF Space sync

## Security Headers

The backend applies the following security headers:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Strict-Transport-Security: max-age=31536000; includeSubDomains`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`

## Authentication

- JWT-based authentication with bcrypt password hashing
- Tokens expire after 60 minutes (configurable via `ACCESS_TOKEN_EXPIRE_MINUTES`)
- Rate limiting via Redis sliding window (30 requests/minute default)

## CORS

- Configured via `CORS_ORIGINS` environment variable
- Default allows only localhost in development
- Set to your frontend domain in production

## Data Handling

- Input text is stored in PostgreSQL for audit purposes
- PII is automatically redacted from application logs
- Text content is hashed (SHA-256) for caching and deduplication

## Reporting Vulnerabilities

Please report security vulnerabilities by opening a private security advisory
in the GitHub repository. Do not open public issues for security concerns.

## IAM Recommendations

- Use dedicated service accounts for each deployment platform
- Apply principle of least privilege for API keys
- Enable MFA on all provider accounts (GitHub, Render, Vercel, HF, Groq)
- Review API key permissions quarterly
