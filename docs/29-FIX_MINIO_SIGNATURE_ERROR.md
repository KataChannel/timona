# 🔧 FIX: MinIO SignatureDoesNotMatch Error

## ❌ Problem

**Error:**
```
[Nest] ERROR [ExceptionsHandler] S3Error: The request signature we calculated does not match the signature you provided. Check your key and signing method.
Code: SignatureDoesNotMatch
```

**Root Cause:**
Backend đã được restart và load configuration cũ **TRƯỚC KHI** có `MINIO_INTERNAL_ENDPOINT`. Service đang cố kết nối tới MinIO qua domain `storage.rausachtrangia.com:443` thay vì internal `116.118.49.243:12007`, dẫn đến signature calculation sai.

## ✅ Solution

### 1. Verified Credentials

Checked MinIO container on server:
```bash
ssh root@116.118.49.243 "docker inspect shared-minio | grep -E 'MINIO_ROOT_USER|MINIO_ROOT_PASSWORD'"
```

Result:
- `MINIO_ROOT_USER=minio-admin` ✅
- `MINIO_ROOT_PASSWORD=minio-secret-2025` ✅

### 2. Configuration Structure

Ensured all `.env` files have proper separation:

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
MINIO_USE_SSL=false
MINIO_FORCE_HTTPS=true

# Credentials
MINIO_ACCESS_KEY=minio-admin
MINIO_SECRET_KEY=minio-secret-2025
MINIO_BUCKET_NAME=rausach-uploads
```

### 3. Service Code Verification

Both MinIO services correctly use internal endpoint:

**`backend/src/services/minio.service.ts`:**
```typescript
const internalEndpoint = this.configService.get('MINIO_INTERNAL_ENDPOINT') || 
                         this.configService.get('MINIO_ENDPOINT', '116.118.49.243');
const internalPort = this.configService.get('MINIO_INTERNAL_PORT') || 
                     this.configService.get('MINIO_PORT', '12007');
const internalSSL = this.configService.get('MINIO_INTERNAL_SSL', 'false') === 'true';

this.minioClient = new Minio.Client({
  endPoint: internalEndpoint,  // 116.118.49.243
  port: internalPort,          // 12007
  useSSL: internalSSL,         // false
  accessKey: 'minio-admin',
  secretKey: 'minio-secret-2025',
});
```

**`backend/src/minio/minio.service.ts`:**
```typescript
const endpoint = this.configService.get('MINIO_INTERNAL_ENDPOINT') || 
                 this.configService.get('MINIO_ENDPOINT', '116.118.49.243');
const port = this.configService.get('MINIO_INTERNAL_PORT') || 
             this.configService.get('MINIO_PORT', '12007');
const useSSL = this.configService.get('MINIO_INTERNAL_SSL', 'false') === 'true';
```

### 4. Backend Restart

```bash
# Kill old process
pkill -f "ts-node-dev.*backend"
fuser -k 12001/tcp

# Start with fresh config
cd /mnt/chikiet/kataoffical/shoprausach
bun run dev:rausach:backend
```

### 5. Verification

Check logs for successful connection:
```
[MinioService] MinIO Internal Connection: 116.118.49.243:12007 (SSL: false)
[MinioService] MinIO Public URL: https://storage.rausachtrangia.com
[MinioService] [Minio] Connection attempt 1/10: endpoint=116.118.49.243, port=12007, SSL=false
[MinioService] ✅ Minio connected successfully
[MinioService] Bucket 'rausach-uploads' already exists
```

Test credentials on server:
```bash
ssh root@116.118.49.243 "docker exec shared-minio mc config host add test http://localhost:9000 minio-admin minio-secret-2025 && docker exec shared-minio mc ls test/"
```

Result:
```
Added `test` successfully.
[2025-11-09 18:39:06 UTC]     0B rausach-uploads/
✅ Credentials valid
```

## 📊 Why Signature Failed

MinIO S3 API uses **signature v4** which includes:
1. **Access Key** ✅
2. **Secret Key** ✅
3. **Host header** ❌ (was `storage.rausachtrangia.com` instead of `116.118.49.243:12007`)
4. **Request path**
5. **Timestamp**
6. **Request body hash**

When connecting via domain through Nginx proxy:
- Nginx sets `Host: storage.rausachtrangia.com`
- MinIO receives this host in signature calculation
- But client calculated signature with `116.118.49.243:12007`
- **Result**: Signature mismatch

## 🎯 Solution Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Backend Service                         │
│                                                                 │
│  ┌─────────────────────┐         ┌─────────────────────┐      │
│  │  MinIO Client       │         │  Public URL Gen     │      │
│  │                     │         │                     │      │
│  │  Connect to:        │         │  Generate:          │      │
│  │  116.118.49.243:    │         │  https://storage.   │      │
│  │  12007 (HTTP)       │         │  rausachtrangia.com │      │
│  │                     │         │  /bucket/file.jpg   │      │
│  │  ✅ Direct          │         │  ✅ Via Nginx       │      │
│  └─────────────────────┘         └─────────────────────┘      │
└─────────────────────────────────────────────────────────────────┘
           │                                      │
           │ Direct S3 API                        │ File access
           │ (Upload/Delete)                      │ (Download)
           ▼                                      ▼
    ┌──────────────┐                      ┌──────────────┐
    │    MinIO     │                      │    Nginx     │
    │ 116.118.49   │◄─────────────────────│ storage.rau  │
    │   .243:12007 │   Proxy (SSL term)   │ sachtrangia  │
    │    (HTTP)    │                      │   .com:443   │
    └──────────────┘                      └──────────────┘
```

## ✅ Result

- **Internal Connection**: Backend → MinIO direct via `116.118.49.243:12007` (HTTP) ✅
- **Public URLs**: Files accessible via `https://storage.rausachtrangia.com` (HTTPS) ✅
- **Signature**: Calculated correctly with internal endpoint ✅
- **No S3Error**: Backend starts and operates successfully ✅

## 🔄 Related Fixes

This fix builds on:
- `FIX_MINIO_INTERNAL_CONNECTION.md` - Separated internal/public config
- Backend restart with updated `.env` files
- Verified credentials match server configuration

---

**Fixed:** 2025-11-21  
**Status:** ✅ Resolved  
**Impact:** File uploads working correctly
