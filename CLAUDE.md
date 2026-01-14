# LocalLink Project - Claude Code Reference

## Deployment Information

### Backend (Render - Docker)
- **URL:** https://locallink-api-docker.onrender.com
- **Platform:** Render (Docker runtime)
- **Service ID:** srv-d5jhe9hr0fns73d3l8n0
- **Render API Key:** rnd_YL5IuYnCFYYkD1UuJhHjfqsOCSWR
- **Owner ID:** tea-d5evvmfpm1nc7381l2o0
- **Dashboard:** https://dashboard.render.com/web/srv-d5jhe9hr0fns73d3l8n0

**To trigger deploy:**
```bash
curl -X POST "https://api.render.com/v1/services/srv-d5jhe9hr0fns73d3l8n0/deploys" \
  -H "Authorization: Bearer rnd_YL5IuYnCFYYkD1UuJhHjfqsOCSWR" \
  -H "Content-Type: application/json" \
  -d '{}'
```

**Health check:**
```bash
curl https://locallink-api-docker.onrender.com/health
```

### Frontend Apps (Vercel)
- **Webapp:** https://webapp-taupe-one-46.vercel.app
- **Admin Panel:** https://admin-flax-five.vercel.app
- **Mobile Preview:** https://web-kappa-ashy-44.vercel.app
- **Deployment Method:** Auto-deploy from Vercel dashboard

### Legacy Services (Not Active)
- Railway: https://api-production-94ee0.up.railway.app (failing builds)
- Old Render Node service: srv-d5jg8m6mcj7s738aotlg (failing builds)

## Local Development

### Docker Services
```bash
docker-compose up -d  # Start PostgreSQL (port 5433) and Redis (port 6379)
```

### Database
- **Local PostgreSQL:** postgresql://postgres:postgres@127.0.0.1:5433/locallink
- **Apply schema:** Use `npx prisma db push` or apply via psql

### Environment Variables (backend/.env)
- DATABASE_URL, JWT_SECRET, JWT_REFRESH_SECRET
- FILE_STORAGE_TYPE=local
- SKIP_EXTERNAL_SERVICES=true (skips email sending in dev)

## Project Structure
- `/backend` - Express/TypeScript/Prisma API
- `/web` - React/Vite webapp (desktop)
- `/admin` - Admin panel
- `/mobile` - React Native mobile app
