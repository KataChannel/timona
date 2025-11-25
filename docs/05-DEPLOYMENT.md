# 🚢 Deployment Guide

> Deploy rausachcore to production

---

## 🎯 Quick Deploy

```bash
# Production deploy to server
./deploy.sh
```

---

## 🔧 Prerequisites

- **Server**: Ubuntu 22.04+ (2 Core, 4GB RAM)
- **Domain**: Configured DNS A records
- **SSL**: Let's Encrypt certificates
- **Ports**: 80, 443, 12000-12007, 13000-13007

---

## 🐳 Docker Deployment (Recommended)

### 1. Setup Environment

**Rausach**:
```bash
cp .env.rausach.example .env.rausach
```

**Tazagroup**:
```bash
cp .env.tazagroup.example .env.tazagroup
```

Edit with production values:
```env
DATABASE_URL="postgresql://user:pass@host:12003/rausachcore"
JWT_SECRET="your-secure-secret-here"
NEXT_PUBLIC_API_URL="https://api.rausach.com/graphql"
```

### 2. Build Images

```bash
# Rausach
bun run docker:prod:rausach

# Tazagroup
bun run docker:prod:tazagroup

# Multi-domain (both)
bun run docker:prod:multi
```

### 3. Start Services

```bash
# Services will start automatically
docker ps  # Check running containers
```

### 4. Verify

```bash
# Test Rausach
curl http://localhost:12000
curl http://localhost:12001/graphql

# Test Tazagroup
curl http://localhost:13000
curl http://localhost:13001/graphql
```

---

## 🔨 Manual Deployment

### 1. Build

```bash
# Build backend
cd backend
bun install
bun run build

# Build frontend
cd ../frontend
bun install
bun run build
```

### 2. Start with PM2

```bash
# Install PM2
bun add -g pm2

# Start backend
cd backend
pm2 start dist/main.js --name rausach-backend

# Start frontend
cd ../frontend
pm2 start bun --name rausach-frontend -- start -p 12000

# Save PM2 config
pm2 save
pm2 startup
```

### 3. Nginx Configuration

```nginx
# /etc/nginx/sites-available/rausach.com
server {
    listen 80;
    server_name rausach.com www.rausach.com;

    # Frontend
    location / {
        proxy_pass http://localhost:12000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /graphql {
        proxy_pass http://localhost:12001/graphql;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
    }
}
```

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/rausach.com /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 4. SSL Certificate

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d rausach.com -d www.rausach.com

# Auto-renewal (cron)
sudo certbot renew --dry-run
```

---

## 🔄 Deployment Checklist

### Pre-Deployment

- [ ] Review code changes
- [ ] Run tests: `bun test`
- [ ] Run linter: `bun run lint`
- [ ] Update .env with production values
- [ ] Backup database: `bun run db:backup`
- [ ] Test build locally: `bun run build`

### Deployment

- [ ] Pull latest code: `git pull origin main`
- [ ] Install dependencies: `bun install`
- [ ] Build application: `bun run build`
- [ ] Database migration: `bun run db:migrate`
- [ ] Restart services: `pm2 restart all`
- [ ] Clear cache: `redis-cli FLUSHDB`

### Post-Deployment

- [ ] Check logs: `pm2 logs`
- [ ] Test endpoints: `curl http://domain.com`
- [ ] Monitor errors: Check Sentry
- [ ] Performance check: Lighthouse audit
- [ ] Notify team

---

## 📊 Monitoring

### PM2 Monitoring

```bash
pm2 list                    # List all processes
pm2 logs rausach-backend    # View logs
pm2 monit                   # Real-time monitoring
pm2 restart all             # Restart all
```

### Health Checks

```bash
# Backend health
curl http://localhost:12001/test/ping

# Database connection
curl -X POST http://localhost:12001/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "{ __typename }"}'
```

---

## 🔥 Rollback

```bash
# 1. Stop services
pm2 stop all

# 2. Checkout previous version
git checkout <previous-commit>

# 3. Restore database (if needed)
bun run db:restore

# 4. Rebuild
bun run build

# 5. Restart
pm2 restart all
```

---

## 💾 Backup Strategy

### Automated Backups

```bash
# Cron job (daily at 2 AM)
0 2 * * * cd /path/to/shoprausach && bun run db:backup:rausach
```

### Manual Backup

```bash
# Database backup
bun run db:backup:rausach

# Full backup (code + db + files)
tar -czf backup-$(date +%Y%m%d).tar.gz \
  backend/ frontend/ .env.rausach backups/
```

---

## 🚀 Performance Tips

### Frontend
- Enable Next.js cache
- Use CDN for static assets
- Optimize images (WebP)
- Lazy load components
- Enable compression

### Backend
- Enable Redis caching
- Optimize database queries
- Use connection pooling
- Enable response compression
- Set proper cache headers

### Database
- Add indexes
- Regular VACUUM
- Connection pooling
- Read replicas (if needed)

---

## 🔒 Security

### Essential Steps

- [ ] Change default passwords
- [ ] Use environment variables
- [ ] Enable HTTPS
- [ ] Set secure HTTP headers
- [ ] Enable rate limiting
- [ ] Regular security updates
- [ ] Firewall configuration
- [ ] Database access restrictions

### Nginx Security Headers

```nginx
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "no-referrer-when-downgrade" always;
add_header Content-Security-Policy "default-src 'self';" always;
```

---

## 📞 Support

- **Logs**: `/var/log/nginx/` and `pm2 logs`
- **Monitoring**: PM2 dashboard
- **Alerts**: Set up email/Slack notifications
- **Backup**: Daily automated backups

---

**Deployment Time**: ~30 minutes  
**Downtime**: < 5 minutes  
**Last Updated**: 2025-11-21
