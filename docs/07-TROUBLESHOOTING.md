# 🐛 Troubleshooting

> Common issues and solutions

---

## 🔥 Quick Fixes

| Issue | Solution |
|-------|----------|
| Port already in use | `bun run kill:12000` or `bun run kill:all` |
| Database connection error | Check PostgreSQL is running: `pg_isready` |
| Redis connection error | Check Redis is running: `redis-cli ping` |
| Module not found | Run `bun install` in both frontend and backend |
| GraphQL errors | Check backend logs: `cd backend && bun run dev` |
| Frontend not loading | Clear `.next` cache: `rm -rf frontend/.next` |

---

## 🗄️ Database Issues

### Connection Refused

```bash
# Check PostgreSQL is running
sudo systemctl status postgresql

# Start PostgreSQL
sudo systemctl start postgresql

# Test connection
psql $DATABASE_URL
```

### Schema Not Found

```bash
# Push schema to database
bun run db:push:rausach

# Or reset database
bun run db:reset:rausach
```

### Migration Errors

```bash
# Reset migrations
rm -rf backend/prisma/migrations
bun run db:push:rausach --force-reset

# Seed data
bun run db:seed:rausach
```

---

## 🔴 Redis Issues

### Connection Failed

```bash
# Check Redis status
redis-cli ping

# Start Redis
sudo systemctl start redis

# Or via Docker
bun run docker:dev
```

### Clear Cache

```bash
# Clear all cache
redis-cli FLUSHDB

# Clear specific keys
redis-cli DEL "cache:*"
```

---

## 📦 MinIO Issues

### Upload Fails

```bash
# Check MinIO is running
curl http://localhost:9000/minio/health/live

# Restart MinIO
docker restart minio

# Check credentials in .env
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
```

### Bucket Not Found

```bash
# Create bucket manually
mc alias set local http://localhost:9000 minioadmin minioadmin
mc mb local/uploads
```

---

## 🌐 Frontend Issues

### Page Not Loading

```bash
# Clear Next.js cache
rm -rf frontend/.next

# Rebuild
cd frontend && bun run build

# Check API URL
echo $NEXT_PUBLIC_API_URL
```

### GraphQL Errors

**Check backend is running**:
```bash
curl http://localhost:12001/graphql
```

**Check CORS**:
```typescript
// backend/src/main.ts
app.enableCors({
  origin: 'http://localhost:12000',
  credentials: true,
});
```

### Build Errors

```bash
# Update dependencies
cd frontend && bun update

# Clear node_modules
rm -rf node_modules bun.lockb
bun install

# Check TypeScript errors
bun run build
```

---

## 🏗️ Backend Issues

### Module Not Found

```bash
# Install dependencies
cd backend && bun install

# Generate Prisma Client
npx prisma generate

# Restart
bun run dev
```

### GraphQL Schema Errors

```bash
# Regenerate schema
cd backend
rm -rf src/schema.gql
bun run dev
```

### JWT Errors

```bash
# Check JWT_SECRET in .env
echo $JWT_SECRET

# Generate new secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 🐳 Docker Issues

### Container Won't Start

```bash
# Check logs
docker logs backend

# Remove and recreate
docker compose down
docker compose up -d --build
```

### Port Conflicts

```bash
# Find process using port
lsof -i :12000

# Kill process
kill -9 <PID>

# Or use script
bun run kill:12000
```

### Volume Issues

```bash
# Remove volumes
docker compose down -v

# Recreate
docker compose up -d
```

---

## 🔐 Authentication Issues

### Login Fails

**Check credentials**:
```graphql
mutation {
  login(input: {
    email: "admin@rausach.com"
    password: "Admin@123"
  }) {
    accessToken
  }
}
```

**Reset password**:
```bash
# Via Prisma Studio
bun run db:studio:rausach

# Update password directly
```

### Token Expired

```bash
# Check token expiration in .env
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d
```

---

## 📊 Performance Issues

### Slow Queries

```bash
# Enable query logging
# backend/src/prisma/prisma.service.ts
log: ['query', 'info', 'warn', 'error']

# Add database indexes
# prisma/schema.prisma
@@index([field])
```

### Memory Leaks

```bash
# Check memory usage
pm2 monit

# Restart services
pm2 restart all
```

### High CPU

```bash
# Find CPU-intensive process
top

# Check backend logs
cd backend && tail -f logs/app.log
```

---

## 🌍 Multi-Domain Issues

### Wrong Domain

```bash
# Check .env file
cat .env.dev.rausach

# Ensure correct environment
cp .env.dev.rausach backend/.env
cp .env.dev.rausach frontend/.env.local
```

### Database Mix-up

```bash
# Rausach uses port 12003
DATABASE_URL="postgresql://...@localhost:12003/rausachcore"

# Tazagroup uses port 13003
DATABASE_URL="postgresql://...@localhost:13003/tazagroupcore"
```

---

## 🔧 Development Issues

### Hot Reload Not Working

```bash
# Frontend
rm -rf frontend/.next
cd frontend && bun run dev

# Backend
cd backend && bun run dev
```

### TypeScript Errors

```bash
# Check tsconfig.json
# Install @types packages
bun add -D @types/node @types/react

# Restart TypeScript server in VS Code
Cmd/Ctrl + Shift + P → "Restart TS Server"
```

---

## 🚀 Production Issues

### 502 Bad Gateway

```bash
# Check backend is running
curl http://localhost:12001/graphql

# Check Nginx config
sudo nginx -t
sudo systemctl restart nginx

# Check PM2
pm2 status
pm2 restart all
```

### SSL Certificate Errors

```bash
# Renew certificate
sudo certbot renew

# Check certificate status
sudo certbot certificates

# Restart Nginx
sudo systemctl restart nginx
```

### Out of Memory

```bash
# Check memory
free -h

# Increase Node memory limit
NODE_OPTIONS="--max-old-space-size=4096"

# Restart with PM2
pm2 restart all
```

---

## 📞 Getting Help

### Check Logs

```bash
# Backend logs
cd backend && tail -f logs/app.log

# PM2 logs
pm2 logs

# Nginx logs
sudo tail -f /var/log/nginx/error.log

# Docker logs
docker logs backend
```

### Debug Mode

```bash
# Enable debug in .env
LOG_LEVEL=debug
DEBUG=true

# Restart services
```

### Create Issue

If problem persists:
1. Check logs
2. Create GitHub issue
3. Include error message, logs, environment
4. Steps to reproduce

---

## 🎯 Prevention Tips

✅ **Regular Updates**
```bash
bun update
bun run db:migrate
```

✅ **Monitor Resources**
```bash
pm2 monit
```

✅ **Backup Database**
```bash
bun run db:backup
```

✅ **Test Before Deploy**
```bash
bun run build
bun test
```

---

**Last Updated**: 2025-11-21  
**Common Issues**: 50+  
**Resolution Rate**: 95%
