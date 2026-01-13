# LocalLink Project - Claude Code Reference

## Deployment Information

### Backend (Railway)
- **URL:** https://api-production-94ee0.up.railway.app
- **Platform:** Railway
- **Project ID:** 6fc3a248-022b-415e-aec5-d21b3bb5c08a
- **Service ID:** 32c73cc9-b17e-4008-b1b4-e9aa17c7f798
- **Environment ID:** ff0b936e-b80c-42a2-a193-784cd8b936a1
- **Railway API Token:** 07f565af-9627-416e-b251-74ff9bd1e0e6

**To trigger deploy:**
```bash
curl -s -X POST "https://backboard.railway.app/graphql/v2" \
  -H "Authorization: Bearer 07f565af-9627-416e-b251-74ff9bd1e0e6" \
  -H "Content-Type: application/json" \
  -d '{"query": "mutation { serviceInstanceRedeploy(serviceId: \"32c73cc9-b17e-4008-b1b4-e9aa17c7f798\", environmentId: \"ff0b936e-b80c-42a2-a193-784cd8b936a1\") }"}'
```

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
