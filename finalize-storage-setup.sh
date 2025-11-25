#!/bin/bash

# Script hoàn tất cấu hình sau khi Nginx và SSL đã setup

set -e

echo "=================================================="
echo "  Hoàn Tất Cấu Hình Storage Domain"
echo "=================================================="
echo ""

# Test HTTPS
echo "🧪 Testing HTTPS..."
if curl -Is https://storage.rausachtrangia.com | head -n 1; then
  echo "✅ HTTPS đang hoạt động!"
else
  echo "❌ HTTPS chưa hoạt động. Vui lòng kiểm tra lại cấu hình."
  exit 1
fi
echo ""

# Restart PM2 services
echo "🔄 Restarting services..."
pm2 restart all
echo "✅ Services restarted"
echo ""

# Run migration
echo "💾 Migrating database URLs..."
read -p "Bạn có muốn migrate URLs trong database không? (y/n): " migrate
if [ "$migrate" = "y" ] || [ "$migrate" = "Y" ]; then
  bun run scripts/migrate-storage-domain.ts
  echo "✅ Migration completed"
else
  echo "⏭️  Skipped migration"
fi
echo ""

# Run tests
echo "🧪 Running tests..."
./test-storage-domain.sh
echo ""

echo "=================================================="
echo "  ✨ Hoàn Tất!"
echo "=================================================="
echo ""
echo "📋 Kiểm tra cuối:"
echo "   1. Upload ảnh qua admin panel"
echo "   2. Xem HTML Source Code trong editor"
echo "   3. URL phải là: https://storage.rausachtrangia.com/..."
echo ""
echo "📊 Monitor logs:"
echo "   pm2 logs backend"
echo "   pm2 logs frontend"
echo "   sudo tail -f /var/log/nginx/storage.rausachtrangia.com.access.log"
echo ""
echo "🎉 Domain storage đã sẵn sàng!"
