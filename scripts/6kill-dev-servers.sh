#!/bin/bash

# Script để kill tất cả dev servers đang chạy ẩn
# Sử dụng khi Ctrl+C không kill được processes

echo "🔍 Đang tìm các dev servers đang chạy..."
echo ""

# Find all related processes
PIDS=$(ps aux | grep -E "concurrently|ts-node-dev.*main\.ts|next dev.*12000|postcss\.js" | grep -v grep | awk '{print $2}')

if [ -z "$PIDS" ]; then
    echo "✅ Không có dev server nào đang chạy"
    exit 0
fi

echo "📋 Tìm thấy các processes sau:"
echo "----------------------------------------"
ps aux | grep -E "concurrently|ts-node-dev.*main\.ts|next dev.*12000|postcss\.js" | grep -v grep | awk '{printf "PID: %s - %s\n", $2, $11}'
echo "----------------------------------------"
echo ""

# Count processes
COUNT=$(echo "$PIDS" | wc -w)
echo "Tổng cộng: $COUNT processes"
echo ""

read -p "⚠️  Bạn có muốn kill tất cả? (y/N): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🔪 Đang kill processes..."
    
    # Kill gracefully first (SIGTERM)
    echo "$PIDS" | xargs kill 2>/dev/null
    
    sleep 2
    
    # Check if any still alive
    REMAINING=$(ps aux | grep -E "concurrently|ts-node-dev.*main\.ts|next dev.*12000|postcss\.js" | grep -v grep | awk '{print $2}')
    
    if [ -n "$REMAINING" ]; then
        echo "⚠️  Một số processes vẫn còn, sử dụng kill -9..."
        echo "$REMAINING" | xargs kill -9 2>/dev/null
        sleep 1
    fi
    
    # Verify
    STILL_ALIVE=$(ps aux | grep -E "concurrently|ts-node-dev.*main\.ts|next dev.*12000|postcss\.js" | grep -v grep | awk '{print $2}')
    
    if [ -z "$STILL_ALIVE" ]; then
        echo "✅ Đã kill thành công tất cả dev servers!"
    else
        echo "❌ Vẫn còn một số processes chạy:"
        ps aux | grep -E "concurrently|ts-node-dev.*main\.ts|next dev.*12000|postcss\.js" | grep -v grep
    fi
else
    echo "❌ Hủy bỏ"
fi

echo ""
echo "💡 Tip: Để tránh vấn đề này, hãy dùng './menu.sh' chọn script 5 (killport.sh)"
