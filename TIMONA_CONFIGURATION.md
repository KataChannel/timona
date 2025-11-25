# 🎯 TIMONA - Cấu Hình Dự Án Đã Cập Nhật

## 📋 Tổng Quan

Dự án đã được cập nhật hoàn toàn để sử dụng **duy nhất 1 domain TIMONA** với cấu hình Docker ports chuẩn.

---

## 🔧 Cấu Hình Ports Docker (150XX)

| Service | Port | Container Name | Description |
|---------|------|----------------|-------------|
| **Frontend** | 15000 | timona-frontend | Next.js App |
| **Backend** | 15001 | timona-backend | NestJS API + GraphQL |
| **PgAdmin** | 15002 | timona-pgadmin | Database Management UI |
| **PostgreSQL** | 15003 | timona-postgres | Primary Database |
| **Redis** | 15004 | timona-redis | Cache & Sessions |
| **MinIO API** | 15007 | timona-minio | Object Storage API |
| **MinIO Console** | 15008 | timona-minio | Storage Management UI |

---

## 📁 Files Đã Cập Nhật

### 1. ✅ `docker-compose.hybrid.yml`
- Đổi tên tất cả services sang `timona-*`
- Cập nhật ports sang dải `150XX`
- Database: `timonacore`
- Network: `timona-network`
- Thêm PgAdmin service
- Redis key prefix: `timona:`
- MinIO bucket: `timona-uploads`

### 2. ✅ `.env.timona`
```bash
# Key Configuration
DATABASE_URL="postgresql://postgres:postgres@116.118.49.243:15003/timonacore"
PORT=15001
FRONTEND_URL=http://116.118.49.243:15000
REDIS_PORT=15004
MINIO_INTERNAL_PORT=15007
PGADMIN_PORT=15002

# Domain
DOMAIN=timona.com
MINIO_ENDPOINT=storage.timona.com
NEXT_PUBLIC_APP_URL=http://116.118.49.243:15000
NEXT_PUBLIC_GRAPHQL_ENDPOINT=https://api.timona.com/graphql
```

### 3. ✅ `package.json`
**Updated Scripts:**
```json
{
  "name": "timona-starter",
  "scripts": {
    "dev:timona": "cp .env.timona backend/.env && ...",
    "dev:timona:backend": "... PORT=15001 bun run dev",
    "dev:timona:frontend": "... bun run dev -- -p 15000",
    "db:studio:timona": "...",
    "db:migrate:timona": "...",
    "db:push:timona": "...",
    "kill:15000": "./scripts/kill-ports.sh 15000",
    "kill:15001": "./scripts/kill-ports.sh 15001",
    ...
  }
}
```

### 4. ✅ `nginx-storage.conf`
```nginx
upstream minio_backend {
    server 116.118.49.243:15007;
}

server {
    server_name storage.timona.com;
    # SSL certificates for storage.timona.com
}
```

### 5. ✅ `vscode-menu.sh`
- Đổi title sang "TIMONA DEVELOPMENT MENU"
- Cập nhật tất cả port references sang `150XX`
- Menu options cho Timona domain
- Simplified từ 22 options xuống 20 options

---

## 🚀 Hướng Dẫn Sử Dụng

### Development (Local)

```bash
# 1. Setup môi trường
cp .env.timona backend/.env
cp .env.timona frontend/.env.local

# 2. Chạy full stack
bun run dev:timona

# 3. Hoặc chạy riêng lẻ
bun run dev:timona:backend    # Port 15001
bun run dev:timona:frontend   # Port 15000

# 4. Database operations
bun run db:migrate:timona     # Chạy migrations
bun run db:studio:timona      # Mở Prisma Studio
bun run db:push:timona        # Push schema changes
```

### Production (Docker)

```bash
# 1. Ensure .env.timona exists và đã cấu hình đúng

# 2. Build và start tất cả services
docker compose -f docker-compose.hybrid.yml up -d --build

# 3. Check logs
docker compose -f docker-compose.hybrid.yml logs -f

# 4. Stop services
docker compose -f docker-compose.hybrid.yml down

# 5. Using npm scripts
bun run docker:dev      # Start
bun run docker:down     # Stop
```

### Interactive Menu

```bash
# Chạy menu tương tác
./vscode-menu.sh

# Hoặc
bun run dev
```

---

## 🌐 Access URLs

### Development
- Frontend: http://116.118.49.243:15000
- Backend API: http://116.118.49.243:15001
- GraphQL Playground: http://116.118.49.243:15001/graphql
- PgAdmin: http://116.118.49.243:15002
- MinIO Console: http://116.118.49.243:15008

### Production (Domain)
- Frontend: https://timona.com
- Backend API: https://api.timona.com
- GraphQL: https://api.timona.com/graphql
- Storage: https://storage.timona.com

---

## 🗄️ Database

### Connection Info
```
Host: 116.118.49.243
Port: 15003
Database: timonacore
Username: postgres
Password: postgres
```

### PgAdmin Access
```
URL: http://116.118.49.243:15002
Email: admin@timona.com
Password: admin123
```

---

## 🔄 Migration từ Rausach/Tazagroup

### Files Cũ (Không còn dùng)
```
❌ .env.rausach
❌ .env.tazagroup
❌ .env.dev.rausach
❌ .env.dev.tazagroup
❌ frontend/Dockerfile.rausach
❌ frontend/Dockerfile.tazagroup
```

### Files Mới (Timona)
```
✅ .env.timona
✅ docker-compose.hybrid.yml (updated)
✅ frontend/Dockerfile (generic)
✅ backend/Dockerfile (generic)
```

### Data Migration
```bash
# 1. Backup dữ liệu cũ (nếu cần)
bun run db:backup:rausach    # Hoặc tazagroup

# 2. Setup database mới
cp .env.timona backend/.env
bun run db:migrate:timona

# 3. Restore data (nếu cần)
# Edit restore script để point tới backup file
bun run db:restore:timona
```

---

## 🛠️ Utilities

### Kill Ports
```bash
# Specific port
bun run kill:15000
bun run kill:15001
bun run kill:15003
bun run kill:15004

# All ports
bun run kill:all
```

### Docker Management
```bash
# View running containers
docker ps | grep timona

# Restart specific service
docker restart timona-backend
docker restart timona-frontend

# View logs
docker logs -f timona-backend
docker logs -f timona-frontend

# Execute commands in container
docker exec -it timona-backend sh
docker exec -it timona-postgres psql -U postgres -d timonacore
```

---

## 🔍 Troubleshooting

### Port Already in Use
```bash
# Kill specific port
./scripts/kill-ports.sh 15000

# Check what's using port
lsof -i :15000
netstat -tulpn | grep 15000
```

### Docker Issues
```bash
# Remove all Timona containers
docker rm -f $(docker ps -a | grep timona | awk '{print $1}')

# Remove volumes (⚠️ Sẽ xóa data)
docker volume rm timona_postgres_data

# Rebuild from scratch
docker compose -f docker-compose.hybrid.yml down -v
docker compose -f docker-compose.hybrid.yml up -d --build
```

### Database Connection Issues
```bash
# Check if PostgreSQL is running
docker ps | grep timona-postgres

# Check logs
docker logs timona-postgres

# Test connection
docker exec -it timona-postgres psql -U postgres -d timonacore -c "SELECT version();"
```

---

## 📊 Resource Usage (Optimized)

### Container Limits
```yaml
PostgreSQL: 256MB (limit) / 128MB (reserved)
Redis: 128MB (limit) / 64MB (reserved)
MinIO: 128MB (limit) / 64MB (reserved)
PgAdmin: 256MB (limit) / 128MB (reserved)
Backend: 512MB (limit) / 256MB (reserved)
Frontend: 256MB (limit) / 128MB (reserved)

Total: ~1.5GB RAM (suitable for 2GB+ VPS)
```

---

## 🎯 Next Steps

1. ✅ Cập nhật DNS records cho `timona.com`, `api.timona.com`, `storage.timona.com`
2. ✅ Setup SSL certificates với Let's Encrypt
3. ✅ Configure nginx reverse proxy cho production
4. ✅ Test full stack trong Docker environment
5. ✅ Migration data từ old domains (nếu cần)
6. ✅ Update CI/CD pipelines
7. ✅ Documentation cho team

---

## 📝 Notes

- Tất cả files cấu hình đã được update
- Dockerfiles là generic, không cần thay đổi
- Environment variables được quản lý qua `.env.timona`
- Network isolation với `timona-network`
- Health checks enabled cho tất cả services
- Ready for production deployment

---

**Ngày cập nhật:** 25/11/2025
**Version:** Timona v1.0.0
**Port Range:** 15000-15008
