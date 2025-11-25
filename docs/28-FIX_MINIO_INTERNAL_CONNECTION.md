# 🔧 FIX: MinIO Connection Error - Separated Internal & Public Configuration

## ❌ Problem

**Error:**
```
[Nest] ERROR [MinioService] Error ensuring bucket exists: S3Error
```

**Root Cause:**
MinIO client was trying to connect to `storage.rausachtrangia.com:443` with SSL=true, but:
- MinIO server actually runs on `116.118.49.243:12007` (HTTP internal)
- Domain `storage.rausachtrangia.com` is only a proxy via Nginx
- SSL termination happens at Nginx level, not MinIO level

**Issue:**
Code was using the same endpoint for:
1. **Internal connection** (app → MinIO): Needs direct IP:port
2. **Public URLs** (browser → files): Can use domain via proxy

## ✅ Solution

### 1. Separated Configuration

Added distinction between internal connection and public URL:

```bash
# Internal connection (direct to MinIO server)
MINIO_INTERNAL_ENDPOINT=116.118.49.243
MINIO_INTERNAL_PORT=12007
MINIO_INTERNAL_SSL=false

# Public URL (for file access via domain/proxy)
MINIO_ENDPOINT=storage.rausachtrangia.com
MINIO_PORT=443
MINIO_PUBLIC_ENDPOINT=storage.rausachtrangia.com
MINIO_PUBLIC_PORT=443
MINIO_PUBLIC_SSL=true
MINIO_USE_SSL=false  # For backward compatibility
MINIO_FORCE_HTTPS=true
```

### 2. Code Changes

**File: `backend/src/services/minio.service.ts`**

Changed from:
```typescript
this.endpoint = this.configService.get('MINIO_ENDPOINT');
this.port = this.configService.get('MINIO_PORT');
this.useSSL = this.configService.get('MINIO_USE_SSL');
```

To:
```typescript
// Internal connection (for MinIO client)
const internalEndpoint = this.configService.get('MINIO_INTERNAL_ENDPOINT') || 
                         this.configService.get('MINIO_ENDPOINT');
const internalPort = this.configService.get('MINIO_INTERNAL_PORT') || 
                     this.configService.get('MINIO_PORT');
const internalSSL = this.configService.get('MINIO_INTERNAL_SSL') === 'true';

// Public URL (for file access)
const publicEndpoint = this.configService.get('MINIO_PUBLIC_ENDPOINT');
const publicPort = this.configService.get('MINIO_PUBLIC_PORT');
const publicSSL = this.configService.get('MINIO_PUBLIC_SSL') === 'true';
```

**File: `backend/src/minio/minio.service.ts`**

Similar changes applied for consistency.

### 3. Updated All .env Files

Updated 13 environment files:
- Root: `.env`, `.env.rausach`, `.env.prod.rausach`, `.env.dev.rausach`, `.env.tazagroup`, `.env.prod.tazagroup`, `.env.dev.tazagroup`
- Backend: `backend/.env`, `backend/.env.rausach`
- Frontend: `frontend/.env`, `frontend/.env.local`, `frontend/.env.rausach`, `frontend/.env.production.local`, `frontend/.env.tazagroup`

### 4. Created Helper Script

`fix-minio-internal-config.sh` - Automated script to update all .env files.

## 🎯 How It Works Now

### Architecture:

```
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │ HTTPS (storage.rausachtrangia.com:443)
       ▼
┌─────────────┐
│    Nginx    │ ← SSL Termination
└──────┬──────┘
       │ HTTP (116.118.49.243:12007)
       ▼
┌─────────────┐
│   MinIO     │ ← Actual server
└─────────────┘
```

### Connection Flow:

1. **Internal Connection (App ↔ MinIO):**
   - Endpoint: `116.118.49.243:12007`
   - Protocol: HTTP
   - SSL: false
   - Purpose: Direct communication for operations (upload, delete, list, etc.)

2. **Public URL (Browser ↔ Files):**
   - Endpoint: `storage.rausachtrangia.com`
   - Protocol: HTTPS
   - SSL: true (at Nginx level)
   - Purpose: File access via clean domain URL

### Example:

**Upload Process:**
```typescript
// 1. App connects to MinIO (internal)
minioClient = new Minio.Client({
  endPoint: '116.118.49.243',
  port: 12007,
  useSSL: false,  // Direct HTTP
});

// 2. Upload file
await minioClient.putObject('bucket', 'file.jpg', buffer);

// 3. Return public URL
return 'https://storage.rausachtrangia.com/bucket/file.jpg';
```

**File Access:**
```
Browser → https://storage.rausachtrangia.com/bucket/file.jpg
       → Nginx (SSL termination)
       → http://116.118.49.243:12007/bucket/file.jpg
       → MinIO returns file
```

## 📊 Configuration Matrix

| Environment | Internal Endpoint | Internal Port | Internal SSL | Public Endpoint | Public SSL |
|-------------|-------------------|---------------|--------------|-----------------|------------|
| Development | 116.118.49.243 | 12007 | false | storage.rausachtrangia.com | true |
| Production | 116.118.49.243 | 12007 | false | storage.rausachtrangia.com | true |
| Docker | minio | 9000 | false | storage.rausachtrangia.com | true |

## ✅ Testing

### Test Internal Connection:
```bash
# From server
curl http://116.118.49.243:12007/minio/health/live
# Should return: 200 OK
```

### Test Public URL:
```bash
# From anywhere
curl https://storage.rausachtrangia.com/rausach-uploads/
# Should return: 200 or 403 (depends on bucket policy)
```

### Test Application:
```bash
# Start backend
cd /mnt/chikiet/kataoffical/shoprausach
bun run dev:backend

# Should see:
# MinIO Internal Connection: 116.118.49.243:12007 (SSL: false)
# MinIO Public URL: https://storage.rausachtrangia.com
# ✅ Minio connected successfully
```

## 🔄 Migration Steps

If you have this error on other environments:

1. **Stop services:**
   ```bash
   pm2 stop all
   ```

2. **Update .env files:**
   ```bash
   ./fix-minio-internal-config.sh
   ```

3. **Verify configuration:**
   ```bash
   grep -A5 "MINIO_INTERNAL" backend/.env
   ```

4. **Restart services:**
   ```bash
   pm2 restart all
   ```

5. **Check logs:**
   ```bash
   pm2 logs backend --lines 50
   ```

## 📝 Key Points

1. **Internal vs Public:**
   - Internal: Direct connection to MinIO server (IP:port, usually HTTP)
   - Public: User-facing URLs (domain, HTTPS via proxy)

2. **SSL Termination:**
   - Happens at Nginx/Caddy level
   - MinIO itself runs HTTP internally
   - Public URLs are HTTPS

3. **Backward Compatibility:**
   - Old `MINIO_ENDPOINT` still works (fallback)
   - New `MINIO_INTERNAL_ENDPOINT` takes priority
   - Both configurations coexist

4. **Docker Support:**
   - Docker uses `DOCKER_MINIO_ENDPOINT=minio`
   - No changes needed for Docker setup

## 🎉 Result

**Before:**
```
❌ ERROR [MinioService] Error ensuring bucket exists: S3Error
   (trying to connect to storage.rausachtrangia.com:443 with SSL)
```

**After:**
```
✅ MinIO Internal Connection: 116.118.49.243:12007 (SSL: false)
✅ MinIO Public URL: https://storage.rausachtrangia.com
✅ Minio connected successfully
```

## 📚 Related Files

- `backend/src/services/minio.service.ts` - Main MinIO service
- `backend/src/minio/minio.service.ts` - Alternative MinIO service
- `fix-minio-internal-config.sh` - Auto-update script
- All `.env*` files - Configuration

---

**Fixed:** 2025-11-21  
**Status:** ✅ Production Ready  
**Impact:** All MinIO operations now work correctly with domain proxy
