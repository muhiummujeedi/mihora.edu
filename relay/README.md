# MIHORA STUDY LIBRARY — Download Relay (`dl.study.mihora.tech`)

This serverless relay handles cryptographic two-stage resolution and direct file streaming without ever exposing Google Drive URLs, Drive IDs, or credentials to the client browser.

## Domain & Routing Architecture
- **Public Frontend**: `https://study.mihora.tech` (Hosted on GitHub Pages)
- **Download Relay**: `https://dl.study.mihora.tech` (Hosted on Cloudflare Workers)

## Deployment Instructions

### 1. Cloudflare DNS Setup
In Cloudflare Dashboard:
- Add custom domain `dl.study.mihora.tech` routed to the `mihora-download-relay` Worker.

### 2. Configure Secrets
Execute via Wrangler CLI:
```bash
npx wrangler secret put RESOURCE_MAP_ENCRYPTION_KEY
npx wrangler secret put DOWNLOAD_TOKEN_SECRET
npx wrangler secret put GOOGLE_SERVICE_ACCOUNT_JSON
```

### 3. Deploy
```bash
npx wrangler deploy
```

## Security Guarantee
- No debug endpoints exist (`/debug`, `/env`, `/mapping`).
- No arbitrary proxying (`?url=`, `?driveId=` strictly rejected).
- AES-256-GCM authenticated encryption for resource shards.
- 120-second short-lived HMAC signed tokens with one-time nonce tracking.
