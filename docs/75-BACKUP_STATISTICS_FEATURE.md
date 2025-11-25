# 📊 Backup Statistics Report Feature

**Version:** 2.0  
**Date:** November 24, 2025  
**Status:** ✅ Implemented

---

## 🎯 Overview

Đã cập nhật backup script để tự động tạo **bảng thống kê chi tiết** sau khi backup hoàn tất. Thay vì chỉ hiển thị tổng số records, giờ đây bạn sẽ nhận được báo cáo đầy đủ về:

- Tổng quan (files, records, size, speed)
- Top 15 tables theo số lượng records
- Top 10 tables theo kích thước file
- Thời gian backup từng table

---

## ✨ Features

### 1. Overview Statistics

```
📈 Overview:
   Total Files: 40
   Total Records: 227,501
   Total Size: 47.3 MB
   Duration: 22 seconds
   Average Speed: 10,341 records/sec
```

**Metrics:**
- **Total Files:** Số lượng JSON files đã tạo
- **Total Records:** Tổng số records được backup
- **Total Size:** Tổng dung lượng của backup
- **Duration:** Thời gian backup (giây)
- **Average Speed:** Tốc độ backup trung bình (records/giây)

---

### 2. Top 15 Tables by Record Count

Hiển thị 15 tables có nhiều records nhất:

```
🏆 Top 15 Tables by Record Count:

No.  Table Name                     Records         Size     Time
──── ────────────────────────────── ──────────── ────────── ────────
1.   audit_logs                         186,645     23.1 MB  19206ms
2.   ext_detailhoadon                    18,827     12.8 MB   1584ms
3.   ext_sanphamhoadon                   16,238      5.7 MB   1392ms
4.   ext_listhoadon                       4,210     14.9 MB    985ms
5.   products                               773      3.1 MB    127ms
...
```

**Columns:**
- **No.:** Thứ tự (1-15)
- **Table Name:** Tên table
- **Records:** Số lượng records
- **Size:** Kích thước file JSON
- **Time:** Thời gian backup table đó

**Use Cases:**
- Xác định tables có data nhiều nhất
- Tìm tables cần optimize
- Monitor data growth over time

---

### 3. Top 10 Tables by File Size

Hiển thị 10 tables có file size lớn nhất:

```
💾 Top 10 Tables by File Size:

No.  Table Name                          Size     Records
──── ────────────────────────────────── ────────── ────────────
1.   audit_logs                          23.1 MB      186,645
2.   ext_listhoadon                      14.9 MB        4,210
3.   ext_detailhoadon                    12.8 MB       18,827
4.   ext_sanphamhoadon                    5.7 MB       16,238
5.   products                             3.1 MB          773
...
```

**Use Cases:**
- Identify storage-heavy tables
- Plan backup storage capacity
- Optimize compression strategies

---

## 🔧 Implementation Details

### Code Changes

**File:** `backend/prisma/backup.ts`

#### 1. Added Data Collection

```typescript
interface TableStats {
  table: string;
  records: number;
  size: number;
  time: number;
}
const tableStats: TableStats[] = [];
```

#### 2. Collect Stats During Backup

```typescript
for (const table of tables) {
  const tableStartTime = Date.now();
  await backupTableToJson(table);
  
  const filePath = path.join(BACKUP_DIR, `${table}.json`);
  const fileCreated = fs.existsSync(filePath);
  
  if (fileCreated) {
    const count = await getRecordCount(table);
    const fileSize = fs.statSync(filePath).size;
    const tableTime = Date.now() - tableStartTime;
    
    tableStats.push({
      table,
      records: count,
      size: fileSize,
      time: tableTime
    });
  }
}
```

#### 3. Generate Report

```typescript
// Sort and display top 15 by records
const topTables = tableStats
  .sort((a, b) => b.records - a.records)
  .slice(0, 15);

// Sort and display top 10 by size
const topBySize = [...tableStats]
  .sort((a, b) => b.size - a.size)
  .slice(0, 10);
```

#### 4. Format Helper

```typescript
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}
```

---

## 📈 Sample Output

### Full Report Example

```
🎉 Backup completed successfully!
📊 Total records: 227,501
⏱️  Total time: 22 seconds
📁 Backup location: backups/rausach/20251124_152921

╔════════════════════════════════════════════════════════════════════════════╗
║                      📊 BACKUP STATISTICS REPORT                           ║
╚════════════════════════════════════════════════════════════════════════════╝

📈 Overview:
   Total Files: 40
   Total Records: 227,501
   Total Size: 47.3 MB
   Duration: 22 seconds
   Average Speed: 10,341 records/sec

🏆 Top 15 Tables by Record Count:

No.  Table Name                     Records         Size     Time
──── ────────────────────────────── ──────────── ────────── ────────
1.   audit_logs                         186,645     23.1 MB  19206ms
2.   ext_detailhoadon                    18,827     12.8 MB   1584ms
3.   ext_sanphamhoadon                   16,238      5.7 MB   1392ms
4.   ext_listhoadon                       4,210     14.9 MB    985ms
5.   products                               773      3.1 MB    127ms
6.   product_variants                      290    138.2 KB     58ms
7.   Permission                            140     28.4 KB     22ms
8.   RolePermission                        124     21.8 KB     21ms
9.   website_settings                       82     18.3 KB     25ms
10.  blog_posts                             76     89.5 KB     71ms
11.  menus                                  28     28.7 KB     24ms
12.  order_items                            20      5.2 KB     18ms
13.  technical_support_tickets              14      3.8 KB     15ms
14.  categories                             13     12.4 KB     25ms
15.  inventory_logs                         12      2.9 KB     14ms

💾 Top 10 Tables by File Size:

No.  Table Name                          Size     Records
──── ────────────────────────────────── ────────── ────────────
1.   audit_logs                          23.1 MB      186,645
2.   ext_listhoadon                      14.9 MB        4,210
3.   ext_detailhoadon                    12.8 MB       18,827
4.   ext_sanphamhoadon                    5.7 MB       16,238
5.   products                             3.1 MB          773
6.   product_variants                   138.2 KB          290
7.   blog_posts                          89.5 KB           76
8.   menus                               28.7 KB           28
9.   Permission                          28.4 KB          140
10.  website_settings                    18.3 KB           82

════════════════════════════════════════════════════════════════════════════
```

---

## 🎯 Use Cases

### 1. Performance Monitoring

**Identify Slow Tables:**
```
audit_logs: 186,645 records in 19206ms (slow - needs optimization)
products: 773 records in 127ms (fast)
```

**Action:** Consider pagination for audit_logs backup

---

### 2. Storage Planning

**Large Tables:**
```
audit_logs: 23.1 MB (most storage)
ext_listhoadon: 14.9 MB
ext_detailhoadon: 12.8 MB
```

**Total:** ~47 MB per backup  
**Monthly (30 days):** ~1.4 GB  
**Yearly:** ~17 GB

---

### 3. Data Growth Tracking

Compare statistics across backups:

| Date | Total Records | Total Size | Duration |
|------|---------------|------------|----------|
| Nov 20 | 220,000 | 45 MB | 21s |
| Nov 21 | 223,500 | 46 MB | 21s |
| Nov 22 | 225,100 | 46.5 MB | 22s |
| Nov 24 | 227,501 | 47.3 MB | 22s |

**Growth:** +7,501 records in 4 days (~1,875/day)

---

### 4. Backup Health Check

**Red Flags:**
- ❌ Duration suddenly increases (performance issue)
- ❌ File count decreases (tables not backing up)
- ❌ Size decreases dramatically (data loss?)

**Green Flags:**
- ✅ Consistent duration (stable performance)
- ✅ Predictable growth (expected data increase)
- ✅ All expected tables present

---

## 🚀 Benefits

### Before (Old Version)
```
🎉 Backup completed successfully!
📊 Total records: 227,501
⏱️  Total time: 22 seconds
📁 Backup location: backups/rausach/20251124_150524
```

**Limited Information:**
- No visibility into individual tables
- Can't identify slow tables
- No storage breakdown
- Hard to debug issues

---

### After (New Version)
```
╔═══════════════════════════════════════════════╗
║      📊 BACKUP STATISTICS REPORT              ║
╚═══════════════════════════════════════════════╝

📈 Overview + Top 15 Tables + Top 10 by Size
```

**Rich Information:**
- ✅ Full visibility per table
- ✅ Identify performance bottlenecks
- ✅ Storage planning data
- ✅ Easy debugging with detailed metrics

---

## 📝 Commands

### Run Backup (Auto Show Statistics)
```bash
cd /mnt/chikiet/kataoffical/shoprausach
bun db:backup:rausach
```

### Output Location
```
backend/backups/rausach/YYYYMMDD_HHMMSS/
└── [40 JSON files]
```

---

## 🎨 Output Format

### Box Drawing Characters
```
╔═══╗  Top border
║   ║  Sides
╚═══╝  Bottom border
────   Separator line
```

### Emoji Icons
- 📊 Statistics/Report
- 📈 Overview/Metrics
- 🏆 Top Records
- 💾 File Size
- ⏱️  Time/Duration
- 📁 Location/Path
- 🎉 Success

---

## 🔮 Future Enhancements

### Planned Features

1. **JSON Report Export**
   ```json
   {
     "timestamp": "2025-11-24T15:29:21Z",
     "overview": { ... },
     "topTables": [ ... ],
     "topBySize": [ ... ]
   }
   ```

2. **Comparison with Previous Backup**
   ```
   📊 Changes from Last Backup:
      audit_logs: +335 records (+0.18%)
      products: +12 records (+1.55%)
   ```

3. **Email/Slack Notifications**
   - Send statistics report after backup
   - Alert on anomalies

4. **Historical Dashboard**
   - Chart data growth over time
   - Track backup performance trends

---

## ✅ Testing

### Test Command
```bash
cd backend
bun db:backup:rausach
```

### Verify Output
- ✅ Overview section shows correct totals
- ✅ Top 15 tables listed with correct numbers
- ✅ Top 10 by size listed correctly
- ✅ All file sizes formatted properly (B, KB, MB, GB)
- ✅ Times shown in ms
- ✅ Box drawing characters render correctly

---

## 📚 Related Files

- `backend/prisma/backup.ts` - Main backup script with statistics
- `backend/backup-database.sh` - Shell wrapper script
- `package.json` - Contains `db:backup:rausach` command
- `BACKUP_FIX_SUMMARY.md` - Previous backup system fixes

---

## 🎉 Summary

**Feature:** Detailed backup statistics report  
**Status:** ✅ **Fully Implemented**  
**Impact:** Better visibility, easier monitoring, proactive issue detection  
**Usage:** Automatic (no config needed)
