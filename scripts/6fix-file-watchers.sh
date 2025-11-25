#!/bin/bash

# Fix ENOSPC: System limit for number of file watchers reached
# Common issue with Next.js/React development servers on Linux

echo "🔧 Fixing file watchers limit..."

# Check current limit
CURRENT_LIMIT=$(cat /proc/sys/fs/inotify/max_user_watches)
echo "📊 Current limit: $CURRENT_LIMIT"

# Recommended limit for large projects
RECOMMENDED_LIMIT=524288

if [ "$CURRENT_LIMIT" -lt "$RECOMMENDED_LIMIT" ]; then
    echo "⚠️  Current limit is too low. Increasing to $RECOMMENDED_LIMIT..."
    
    # Add to sysctl.conf if not already present
    if ! grep -q "fs.inotify.max_user_watches" /etc/sysctl.conf; then
        echo "fs.inotify.max_user_watches=$RECOMMENDED_LIMIT" | sudo tee -a /etc/sysctl.conf
        echo "fs.inotify.max_user_instances=256" | sudo tee -a /etc/sysctl.conf
        echo "fs.inotify.max_queued_events=16384" | sudo tee -a /etc/sysctl.conf
    else
        echo "⚠️  Entry already exists in /etc/sysctl.conf"
        echo "Updating values..."
        sudo sed -i "s/fs.inotify.max_user_watches=.*/fs.inotify.max_user_watches=$RECOMMENDED_LIMIT/g" /etc/sysctl.conf
    fi
    
    # Apply changes
    sudo sysctl -p
    
    # Verify
    NEW_LIMIT=$(cat /proc/sys/fs/inotify/max_user_watches)
    echo "✅ New limit: $NEW_LIMIT"
    
    if [ "$NEW_LIMIT" -eq "$RECOMMENDED_LIMIT" ]; then
        echo "✅ File watchers limit increased successfully!"
        echo "🚀 You can now restart your development server"
    else
        echo "❌ Failed to update limit. Please check permissions."
        exit 1
    fi
else
    echo "✅ Current limit ($CURRENT_LIMIT) is already sufficient"
fi

echo ""
echo "📝 To manually set the limit, run:"
echo "   echo fs.inotify.max_user_watches=$RECOMMENDED_LIMIT | sudo tee -a /etc/sysctl.conf"
echo "   sudo sysctl -p"
