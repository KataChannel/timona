#!/bin/bash

# Kill Ports Script - Triệt để
# Kill tất cả processes đang chạy trên các dev ports

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_color() {
    color=$1
    shift
    echo -e "${color}$@${NC}"
}

# Function to kill port thoroughly
kill_port_thorough() {
    local port=$1
    local name=$2
    
    print_color $YELLOW "🔍 Checking port $port ($name)..."
    
    # Method 1: fuser
    if command -v fuser &> /dev/null; then
        fuser -k ${port}/tcp 2>/dev/null
        if [ $? -eq 0 ]; then
            print_color $GREEN "  ✅ Killed via fuser"
        fi
    fi
    
    # Method 2: lsof
    if command -v lsof &> /dev/null; then
        local pids=$(lsof -ti :${port} 2>/dev/null)
        if [ ! -z "$pids" ]; then
            echo "$pids" | xargs -r kill -9 2>/dev/null
            print_color $GREEN "  ✅ Killed via lsof (PIDs: $pids)"
        fi
    fi
    
    # Method 3: netstat
    if command -v netstat &> /dev/null; then
        local pids=$(netstat -tulpn 2>/dev/null | grep ":${port}" | awk '{print $7}' | cut -d'/' -f1 | grep -v '-')
        if [ ! -z "$pids" ]; then
            echo "$pids" | xargs -r kill -9 2>/dev/null
            print_color $GREEN "  ✅ Killed via netstat (PIDs: $pids)"
        fi
    fi
    
    # Method 4: ss
    if command -v ss &> /dev/null; then
        local pids=$(ss -tulpn 2>/dev/null | grep ":${port}" | grep -oP 'pid=\K[0-9]+')
        if [ ! -z "$pids" ]; then
            echo "$pids" | xargs -r kill -9 2>/dev/null
            print_color $GREEN "  ✅ Killed via ss (PIDs: $pids)"
        fi
    fi
    
    # Verify
    sleep 0.5
    if lsof -ti :${port} &>/dev/null || netstat -tulpn 2>/dev/null | grep -q ":${port}"; then
        print_color $RED "  ⚠️  Port $port may still be in use"
    else
        print_color $GREEN "  ✅ Port $port is FREE"
    fi
}

# Function to kill by process name
kill_by_name() {
    local process_name=$1
    print_color $YELLOW "🔍 Killing processes matching: $process_name..."
    
    local pids=$(pgrep -f "$process_name" 2>/dev/null)
    if [ ! -z "$pids" ]; then
        echo "$pids" | xargs -r kill -9 2>/dev/null
        print_color $GREEN "  ✅ Killed processes: $pids"
    else
        print_color $BLUE "  ℹ️  No processes found"
    fi
}

# Main execution
main() {
    print_color $CYAN "╔════════════════════════════════════════════════════════════╗"
    print_color $CYAN "║         🔥 KILL ALL DEV PORTS - TRIỆT ĐỂ 🔥               ║"
    print_color $CYAN "╚════════════════════════════════════════════════════════════╝"
    echo ""
    
    # Kill specific ports
    print_color $BLUE "📍 KILLING SPECIFIC PORTS:"
    echo ""
    kill_port_thorough 12000 "Rausach Frontend"
    kill_port_thorough 12001 "Rausach Backend"
    kill_port_thorough 13000 "Tazagroup Frontend"
    kill_port_thorough 13001 "Tazagroup Backend"
    kill_port_thorough 3000 "Default Frontend"
    kill_port_thorough 3001 "Default Backend"
    kill_port_thorough 5555 "Prisma Studio"
    
    echo ""
    print_color $BLUE "📍 KILLING BY PROCESS NAME:"
    echo ""
    
    # Kill Node.js dev processes
    kill_by_name "next dev"
    kill_by_name "ts-node-dev.*main.ts"
    kill_by_name "nest start.*dev"
    kill_by_name "bun run dev"
    kill_by_name "prisma studio"
    
    echo ""
    print_color $GREEN "✅ ALL DEV PROCESSES KILLED!"
    echo ""
    
    # Show remaining processes
    print_color $YELLOW "📊 REMAINING DEV PROCESSES:"
    ps aux | grep -E "(next dev|ts-node-dev|nest start|prisma studio|:1200[01]|:1300[01])" | grep -v grep || echo "None"
}

# Check if specific port argument provided
if [ ! -z "$1" ]; then
    kill_port_thorough $1 "Port $1"
else
    main
fi
