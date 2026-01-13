# LocalLink Project - Claude Code Reference

## Deployment Information

### Backend (Render)
- **URL:** https://locallink.onrender.com
- **Platform:** Render
- **Deployment Method:** Auto-deploy from GitHub (main branch)
- **To trigger deploy:** Push to `main` branch on GitHub

### Frontend Apps (Vercel)
- **Webapp:** https://webapp-taupe-one-46.vercel.app
- **Admin Panel:** https://admin-flax-five.vercel.app
- **Mobile Preview:** https://web-kappa-ashy-44.vercel.app
- **Deployment Method:** Auto-deploy from Vercel dashboard

### API Keys (Render - Limited Access)
- **API Key:** rnd_YL5IuYnCFYYkD1UuJhHjfqsOCSWR
- **Owner ID:** tea-d5evvmfpm1nc7381l2o0
- **Note:** This API key cannot access the existing locallink service (may be under different account)

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
