# 🚀 Deployment Scripts

Optimized scripts để build, copy file và deploy project lên Docker server.

## ⚡ Quick Start

### Recommended (Daily Use)
```bash
./copy-and-deploy.sh
```
**Fastest way to deploy!** Only copies changed files, installs deps, restarts containers. Takes 1-3 minutes.

---

## 📋 Available Scripts

| Script | Purpose | Time | Use When |
|--------|---------|------|----------|
| `copy-and-deploy.sh` | Copy + Install + Restart | 1-3 min | 🎯 **Daily updates** |
| `93coppyserver.sh` | Full: Build + Copy + Install + Restart | 5-15 min | Fresh deploy / Major changes |
| `deploy-optimized.sh` | Interactive menu | Varies | Need flexibility |
| `DEPLOY_CHEATSHEET.sh` | View quick reference | - | Reference guide |

---

## 🎯 Which Script Should I Use?

### I want to deploy my latest code (RECOMMENDED)
```bash
./copy-and-deploy.sh
```
✨ **Fastest option** - takes 1-3 minutes

### First time setup or dependencies changed
```bash
./93coppyserver.sh
```
🔨 Full build + deployment - takes 5-15 minutes

### I just need to restart containers
```bash
./deploy-optimized.sh
# Select option 5
```
⚡ Quick restart - takes 1 minute

### I want step-by-step control
```bash
./deploy-optimized.sh
```
🎮 Interactive menu with 6 options

---

## 📖 Documentation

- **[DEPLOY_GUIDE.md](./DEPLOY_GUIDE.md)** - Full guide with all details
- **[DEPLOY_SUMMARY.md](./DEPLOY_SUMMARY.md)** - What was changed and why
- **DEPLOY_CHEATSHEET.sh** - One-liner commands and quick ref

```bash
# View quick reference
bash DEPLOY_CHEATSHEET.sh
```

---

## 🔍 What Gets Optimized?

**Excluded from deployment** (reinstalled on server):
- `node_modules/` → ~500MB
- `.next/cache/` → ~100MB  
- `.git/` → ~50MB
- `dist/cache/` → ~50MB
- IDE files, logs, coverage, etc.

**Result:** Upload size **~80% smaller** ✨

---

## 📊 Performance

| Operation | Time |
|-----------|------|
| First build | 2-5 min |
| Subsequent builds (cached) | 10-30 sec |
| Upload (first) | 2-10 min |
| Upload (changes only) | 10-30 sec |
| Install deps | 1 min |
| Docker restart | 1 min |
| **TOTAL first time** | **5-20 min** |
| **TOTAL subsequent** | **2-5 min** ⚡ |

---

## 🚀 One-Liner Commands

```bash
# Quick deploy (recommended)
./copy-and-deploy.sh

# Full deploy
./93coppyserver.sh

# Interactive menu
./deploy-optimized.sh

# Just check server status
ssh root@116.118.49.243 "cd /root/shoprausach && docker compose ps"

# View server logs
ssh root@116.118.49.243 "cd /root/shoprausach && docker compose logs -f"

# Just restart containers
ssh root@116.118.49.243 "cd /root/shoprausach && docker compose restart"
```

---

## 🆘 Troubleshooting

### Connection refused
```bash
ssh root@116.118.49.243 "echo OK"
```

### Permission denied
```bash
ssh-copy-id root@116.118.49.243
```

### Port already in use
```bash
ssh root@116.118.49.243 "docker compose down"
```

### View full guide
```bash
cat DEPLOY_GUIDE.md
```

---

## 📞 Server Info

```
IP: 116.118.49.243
User: root
Path: /root/shoprausach
Backend: port 3000
Frontend: port 3001
```

---

## ✅ Prerequisites

### Local
- Bun >= 1.1.0
- rsync
- SSH access to server
- Git (optional)

### Server
- Docker & Docker Compose
- Bun installed
- SSH enabled

---

## 🎯 Best Practice Workflow

1. **Make code changes locally**
2. **Test locally** - `bun run dev`
3. **Deploy to server** - `./copy-and-deploy.sh`
4. **Check status** - `ssh root@116.118.49.243 "docker compose ps"`
5. **View logs if needed** - `ssh root@116.118.49.243 "docker compose logs"`

---

## 📝 Script Features

### copy-and-deploy.sh
- ✅ Check server connectivity
- ✅ Create optimized exclude list
- ✅ Rsync with compression
- ✅ Remote install & restart
- ✅ Full error handling
- ✅ Progress display
- ✅ Detailed logging

### 93coppyserver.sh  
- ✅ Local build (backend + frontend)
- ✅ Optimized upload
- ✅ Remote install & restart
- ✅ Docker management
- ✅ Summary report

### deploy-optimized.sh
- ✅ Interactive menu
- ✅ Modular operations
- ✅ 6 deployment options
- ✅ Step-by-step control

---

## 🔧 Customize

Edit these files to change settings:

**Server IP/User:**
```bash
grep "SERVER" copy-and-deploy.sh
```

**Exclude list:**
```bash
grep -A 30 "EXCLUDE_LIST" copy-and-deploy.sh
```

**Ports:**
Check `docker-compose.yml` in project root

---

## 💡 Pro Tips

1. **Fast iteration:** Use `copy-and-deploy.sh` multiple times per day
2. **Dry run:** Test with `rsync --dry-run` before actual copy
3. **Parallel deployments:** Don't run multiple scripts simultaneously
4. **Monitor:** Keep `docker compose logs -f` open during deployment
5. **Backup:** Scripts have `--delete` flag - make sure to backup important data

---

## 📈 Expected Flow

```
┌─────────────────────────┐
│  Make Code Changes      │
└────────────┬────────────┘
             │
┌────────────▼───────────────┐
│  Run ./copy-and-deploy.sh  │
└────────────┬───────────────┘
             │
┌────────────▼───────────────┐
│  Wait 1-3 minutes         │
└────────────┬───────────────┘
             │
┌────────────▼───────────────┐
│  ✅ Ready on server!      │
└────────────────────────────┘
```

---

## 🎉 You're Ready!

All scripts are configured and ready to use.

**Start deploying:**
```bash
./copy-and-deploy.sh
```

---

Created: 2025-10-27
Last Updated: 2025-10-27
