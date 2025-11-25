# Database Export

**Export Date:** 2025-11-05T08:24:57.613Z
**Database:** tazaspac_chikiet
**Total Tables:** 27
**Total Records:** 21023

## Files

- `complete-database.json` - All tables in one file
- `export-metadata.json` - Export statistics and metadata
- `[table-name].json` - Individual table files

## Statistics

- **baiviet**: 74 records
- **banggia**: 6 records
- **cauhinh**: 3 records
- **chuongtrinhkhuyenmai**: 4 records
- **danhmuc**: 21 records
- **danhmucbaiviet**: 6 records
- **donhang**: 13 records
- **donncc**: 0 records
- **email**: 0 records
- **giohang**: 514 records
- **khachhang**: 501 records
- **lienhe**: 23 records
- **menu**: 4 records
- **nhacungcap**: 0 records
- **nhapkho**: 0 records
- **permission**: 0 records
- **phieugiaodich**: 0 records
- **phieukho**: 0 records
- **quanlykho**: 0 records
- **role**: 0 records
- **sanpham**: 780 records
- **slide**: 6 records
- **tonkho**: 164 records
- **upload**: 906 records
- **usergroup**: 5 records
- **users**: 7 records
- **visitor**: 17986 records

## Usage

You can import individual tables or use the complete database file depending on your needs.

### Individual Table
```javascript
const data = require('./baiviet.json');
```

### Complete Database
```javascript
const database = require('./complete-database.json');
const baiviet = database.baiviet;
```
