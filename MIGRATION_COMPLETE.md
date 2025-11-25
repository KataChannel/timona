# 🎯 TIMONA - Dự Án Đã Được Cập Nhật Hoàn Toàn

## ✅ Tổng Quan

Dự án đã được cập nhật hoàn toàn để sử dụng **DUY NHẤT 1 DOMAIN TIMONA**. 
Tất cả các cấu hình cũ liên quan đến Rausach và Tazagroup đã được xóa.

---

## 🗑️ Các File Đã Xóa

### Environment Files
- ❌ `.env.rausach`
- ❌ `.env.tazagroup`
- ❌ `.env.dev.rausach`
- ❌ `.env.dev.tazagroup`
- ❌ `.env.prod.rausach`
- ❌ `.env.prod.tazagroup`
- ❌ `frontend/.env.rausach`
- ❌ `frontend/.env.tazagroup`

### Dockerfile Files
- ❌ `frontend/Dockerfile.rausach`
- ❌ `frontend/Dockerfile.tazagroup`

### Build Directories
- ❌ `frontend/.next-rausach/`
- ❌ `frontend/.next-tazagroup/`

### Nginx Configs
- ❌ `nginx/final.rausachtrangia.com/`
- ❌ `nginx/appapi.tazagroup.vn/`

### Scripts
- ❌ `setup-ssl-tazagroup.sh`
- ❌ `setup-storage-domain.sh`

---

## ✅ Các File Mới/Đã Cập Nhật

### 1. **Environment Configuration**
```
✅ .env                      # Cấu hình chính cho Timona
✅ .env.timona              # Backup configuration
```

### 2. **Docker Configuration**
```
✅ docker-compose.hybrid.yml    # Unified Docker setup
✅ frontend/Dockerfile          # Generic frontend build
✅ backend/Dockerfile           # Generic backend build
```

### 3. **Scripts**
```
✅ vscode-menu.sh              # Interactive development menu
✅ setup-ssl-timona.sh         # SSL setup cho Timona domains
✅ cleanup-timona.sh           # Cleanup script mới
```

### 4. **Documentation**
```
✅ README.md                   # Updated với Timona
✅ TIMONA_CONFIGURATION.md     # Full configuration guide
✅ QUICK_REFERENCE.txt         # Quick reference card
✅ MIGRATION_COMPLETE.md       # This file
```

---

## 🔧 Cấu Hình Mới - Timona (Port 150XX)

### Docker Services & Ports

| Service | Port | Container Name | URL |
|---------|------|----------------|-----|
| Frontend | 15000 | timona-frontend | http://116.118.49.243:15000 |
| Backend | 15001 | timona-backend | http://116.118.49.243:15001 |
| PgAdmin | 15002 | timona-pgadmin | http://116.118.49.243:15002 |
| PostgreSQL | 15003 | timona-postgres | postgresql://116.118.49.243:15003 |
| Redis | 15004 | timona-redis | redis://116.118.49.243:15004 |
| MinIO API | 15007 | timona-minio | http://116.118.49.243:15007 |
| MinIO Console | 15008 | timona-minio | http://116.118.49.243:15008 |

### Database
- **Name**: `timonacore`
- **User**: `postgres`
- **Password**: `postgres`
- **Connection**: `postgresql://postgres:postgres@116.118.49.243:15003/timonacore`

### Redis
- **Host**: `116.118.49.243`
- **Port**: `15004`
- **Prefix**: `timona:`

### MinIO
- **Bucket**: `timona-uploads`
- **Access Key**: `minio-admin`
- **Secret Key**: `minio-secret-2025`
- **Domain**: `storage.timona.com`

---

## 🚀 Hướng Dẫn Sử Dụng

### 1. Development (Local)

```bash
# Copy environment file
cp .env.timona backend/.env
cp .env.timona frontend/.env.local

# Start development
bun run dev:timona              # Full stack
bun run dev:timona:backend      # Backend only
bun run dev:timona:frontend     # Frontend only

# Database operations
bun run db:migrate:timona       # Run migrations
bun run db:studio:timona        # Open Prisma Studio
bun run db:push:timona          # Push schema
```

### 2. Docker (Production)

```bash
# Start all services
docker compose -f docker-compose.hybrid.yml up -d

# Start specific services
docker compose -f docker-compose.hybrid.yml up -d postgres redis minio pgadmin

# View logs
docker compose -f docker-compose.hybrid.yml logs -f

# Stop all services
docker compose -f docker-compose.hybrid.yml down
```

### 3. Interactive Menu

```bash
# Run interactive menu
./vscode-menu.sh

# Available options:
#  1-6:   Development commands
#  7-10:  Database operations
#  11-16: Docker operations
#  17-19: Utilities
#  20-24: Kill ports
```

---

## 🌐 Domain Setup

### DNS Records (Cần cấu hình)

```
A     timona.com              → 116.118.49.243
A     api.timona.com          → 116.118.49.243
A     storage.timona.com      → 116.118.49.243
```

### SSL Certificates

```bash
# Run SSL setup script
sudo ./setup-ssl-timona.sh

# This will configure:
# - timona.com (Frontend)
# - api.timona.com (Backend)
# - storage.timona.com (MinIO)
```

---

## 🔄 Migration từ Rausach/Tazagroup

### Nếu cần backup data

```bash
# 1. Backup database cũ (nếu có)
# Connect to old database and export
pg_dump -h 116.118.49.243 -p 12003 -U postgres rausachcore > backup_rausach.sql
pg_dump -h 116.118.49.243 -p 13003 -U postgres tazagroupcore > backup_tazagroup.sql

# 2. Import vào database mới
psql -h 116.118.49.243 -p 15003 -U postgres timonacore < backup_rausach.sql
```

### Cập nhật code base

```bash
# 1. Pull latest changes
git pull origin main

# 2. Install dependencies
bun install
cd frontend && bun install
cd ../backend && bun install

# 3. Run migrations
cp .env.timona backend/.env
cd backend && npx prisma migrate dev

# 4. Start services
cd ..
docker compose -f docker-compose.hybrid.yml up -d
```

---

## 🛠️ Maintenance Commands

### Cleanup

```bash
# Run cleanup script
./cleanup-timona.sh

# Manual cleanup
rm -rf frontend/.next
rm -rf backend/dist
docker system prune -af
```

### Port Management

```bash
# Kill specific port
bun run kill:15000
bun run kill:15001

# Kill all dev ports
bun run kill:all

# Manual kill
./scripts/kill-ports.sh 15000
```

### Docker Management

```bash
# View running containers
docker ps | grep timona

# Restart service
docker restart timona-backend

# View logs
docker logs -f timona-backend

# Execute command in container
docker exec -it timona-backend sh
docker exec -it timona-postgres psql -U postgres -d timonacore

# Remove all containers and volumes
docker compose -f docker-compose.hybrid.yml down -v
```

---

## 📊 System Requirements

### Development
- Node.js 22+
- Bun 1.1+
- PostgreSQL 16
- Redis 7
- Docker & Docker Compose

### Production
- 2+ CPU cores
- 2GB+ RAM (4GB recommended)
- 10GB+ disk space
- Ubuntu 22.04+ or similar

---

## ✅ Verification Checklist

### Development Setup
- [ ] Environment files copied (`.env.timona`)
- [ ] Dependencies installed (`bun install`)
- [ ] Docker services running
- [ ] Database migrations applied
- [ ] Frontend accessible on port 15000
- [ ] Backend accessible on port 15001
- [ ] GraphQL playground working

### Production Setup
- [ ] DNS records configured
- [ ] SSL certificates obtained
- [ ] Nginx configured
- [ ] Docker services running
- [ ] Database backed up
- [ ] Monitoring setup

---

## 📞 Support

### Access Information

**PgAdmin**
- URL: http://116.118.49.243:15002
- Email: admin@timona.com
- Password: admin123

**MinIO Console**
- URL: http://116.118.49.243:15008
- Username: minio-admin
- Password: minio-secret-2025

**Database**
- Host: 116.118.49.243
- Port: 15003
- Database: timonacore
- Username: postgres
- Password: postgres

---

## 📝 Notes

1. Tất cả references đến `rausach` và `tazagroup` đã được xóa
2. Port range đã thay đổi: 12XXX/13XXX → 15XXX
3. Database name: `rausachcore`/`tazagroupcore` → `timonacore`
4. Network name: `hybrid-multi-domain-network` → `timona-network`
5. Container prefix: `shop*/tazagroup-*` → `timona-*`
6. Environment file: `.env.rausach`/`.env.tazagroup` → `.env.timona`

---

**Migration Date**: November 25, 2025
**Version**: Timona v1.0.0
**Status**: ✅ Complete
**Port Range**: 15000-15008
