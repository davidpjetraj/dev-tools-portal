# Public Repository Checklist

Use this checklist before publishing or sharing this repository.

## ✅ Safe to commit
- Source code and infrastructure manifests
- `.env.example` with placeholder values only
- `deploy/k8s/secrets.example.yaml` template (no real values)
- CI workflow definitions (`.github/workflows/*.yml`)

## ❌ Never commit
- Real `.env` files (`.env`, `.env.local`, `.env.production`, etc.)
- Access tokens, API keys, DB passwords, private certificates
- Kubernetes Secret manifests with real base64-encoded credentials
- Production usernames/passwords used outside local development

## If a secret was committed accidentally
1. Rotate/revoke the secret immediately.
2. Remove from history (e.g., `git filter-repo` or BFG), then force-push.
3. Invalidate old deployments that used the leaked secret.
4. Add/update ignore rules and templates to prevent recurrence.

## Recommended for public repos
- Enable branch protection and required CI checks.
- Enable secret scanning / push protection on your Git hosting provider.
- Store real runtime secrets only in deployment secret stores (GitHub/GitLab/Kubernetes/cloud secret managers).
