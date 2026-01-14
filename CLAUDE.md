# LocalLink Project - Claude Code Reference

## Deployment Information

### Backend (Render)
- **URL:** https://locallink-api.onrender.com
- **Platform:** Render
- **Service ID:** srv-d5jg8m6mcj7s738aotlg
- **Render API Key:** rnd_YL5IuYnCFYYkD1UuJhHjfqsOCSWR
- **Owner ID:** tea-d5evvmfpm1nc7381l2o0
- **Dashboard:** https://dashboard.render.com/web/srv-d5jg8m6mcj7s738aotlg

**To trigger deploy:**
```bash
curl -X POST "https://api.render.com/v1/services/srv-d5jg8m6mcj7s738aotlg/deploys" \
  -H "Authorization: Bearer rnd_YL5IuYnCFYYkD1UuJhHjfqsOCSWR" \
  -H "Content-Type: application/json" \
  -d '{}'
```

### Legacy Backend (Railway) - Currently failing builds
- **URL:** https://api-production-94ee0.up.railway.app
- **Service ID:** c1faa9b4-e2b7-4ec9-83d3-72878ef6b278
- **Environment ID:** ff0b936e-b80c-42a2-a193-784cd8b936a1
- **Railway API Token:** 07f565af-9627-416e-b251-74ff9bd1e0e6

### Frontend Apps (Vercel)
- **Webapp:** https://webapp-taupe-one-46.vercel.app
- **Admin Panel:** https://admin-flax-five.vercel.app
- **Mobile Preview:** https://web-kappa-ashy-44.vercel.app
- **Deployment Method:** Auto-deploy from Vercel dashboard

### Legacy Backend (Render - Not Active)
- **URL:** https://locallink.onrender.com (OLD - not updated)
- **Note:** The Render backend is not actively used. Use Railway instead.

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
