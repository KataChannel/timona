// Demo output của backup statistics report

const tableStats = [
  { table: 'audit_logs', records: 186645, size: 24234567, time: 19206 },
  { table: 'ext_detailhoadon', records: 18827, size: 13421772, time: 1584 },
  { table: 'ext_sanphamhoadon', records: 16238, size: 5971456, time: 1392 },
  { table: 'ext_listhoadon', records: 4210, size: 15728640, time: 985 },
  { table: 'products', records: 773, size: 3248128, time: 127 },
  { table: 'product_variants', records: 290, size: 141516, time: 58 },
  { table: 'Permission', records: 140, size: 29081, time: 22 },
  { table: 'RolePermission', records: 124, size: 22330, time: 21 },
  { table: 'website_settings', records: 82, size: 18739, time: 25 },
  { table: 'blog_posts', records: 76, size: 91648, time: 71 },
  { table: 'menus', records: 28, size: 29388, time: 24 },
  { table: 'order_items', records: 20, size: 5324, time: 18 },
  { table: 'technical_support_tickets', records: 14, size: 3892, time: 15 },
  { table: 'categories', records: 13, size: 12698, time: 25 },
  { table: 'inventory_logs', records: 12, size: 2968, time: 14 },
];

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

const totalRecords = tableStats.reduce((sum, s) => sum + s.records, 0);
const totalSize = tableStats.reduce((sum, s) => sum + s.size, 0);
const totalTime = 22; // seconds

console.log(`\n╔════════════════════════════════════════════════════════════════════════════╗`);
console.log(`║                      📊 BACKUP STATISTICS REPORT                           ║`);
console.log(`╚════════════════════════════════════════════════════════════════════════════╝\n`);

console.log(`📈 Overview:`);
console.log(`   Total Files: ${tableStats.length}`);
console.log(`   Total Records: ${totalRecords.toLocaleString()}`);
console.log(`   Total Size: ${formatBytes(totalSize)}`);
console.log(`   Duration: ${totalTime} seconds`);
console.log(`   Average Speed: ${Math.round(totalRecords / totalTime).toLocaleString()} records/sec\n`);

const topTables = [...tableStats].sort((a, b) => b.records - a.records).slice(0, 15);

console.log(`🏆 Top 15 Tables by Record Count:\n`);
console.log(`${'No.'.padEnd(4)} ${'Table Name'.padEnd(30)} ${'Records'.padStart(12)} ${'Size'.padStart(10)} ${'Time'.padStart(8)}`);
console.log(`${'─'.repeat(4)} ${'─'.repeat(30)} ${'─'.repeat(12)} ${'─'.repeat(10)} ${'─'.repeat(8)}`);

topTables.forEach((stat, index) => {
  const num = `${index + 1}.`.padEnd(4);
  const table = stat.table.padEnd(30);
  const records = stat.records.toLocaleString().padStart(12);
  const size = formatBytes(stat.size).padStart(10);
  const time = `${stat.time}ms`.padStart(8);
  console.log(`${num} ${table} ${records} ${size} ${time}`);
});

const topBySize = [...tableStats].sort((a, b) => b.size - a.size).slice(0, 10);
console.log(`\n💾 Top 10 Tables by File Size:\n`);
console.log(`${'No.'.padEnd(4)} ${'Table Name'.padEnd(30)} ${'Size'.padStart(10)} ${'Records'.padStart(12)}`);
console.log(`${'─'.repeat(4)} ${'─'.repeat(30)} ${'─'.repeat(10)} ${'─'.repeat(12)}`);

topBySize.forEach((stat, index) => {
  const num = `${index + 1}.`.padEnd(4);
  const table = stat.table.padEnd(30);
  const size = formatBytes(stat.size).padStart(10);
  const records = stat.records.toLocaleString().padStart(12);
  console.log(`${num} ${table} ${size} ${records}`);
});

console.log(`\n${'═'.repeat(80)}\n`);
