#!/bin/bash

# Find and kill ALL processes running on specified ports
# AGGRESSIVE MODE - Multiple methods with retries

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BLUE='\033[0;34m'
NC='\033[0m'

# Get ports from command line arguments or prompt user
PORTS=()

if [ $# -gt 0 ]; then
    # Ports provided as command line arguments
    PORTS=("$@")
else
    # Prompt user for ports
    echo -e "${CYAN}╔════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║     🔥 KILL PORTS - AGGRESSIVE MODE 🔥    ║${NC}"
    echo -e "${CYAN}╚════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${BLUE}Enter port numbers (separated by spaces):${NC}"
    echo -e "${YELLOW}Example: 3000 3001 5000 8080${NC}"
    read -p "> " input_ports
    
    if [ -z "$input_ports" ]; then
        echo -e "${RED}No ports specified. Exiting.${NC}"
        exit 1
    fi
    
    # Convert input to array
    read -ra PORTS <<< "$input_ports"
fi

echo ""
echo -e "${CYAN}═══════════════════════════════════════════${NC}"
echo -e "${GREEN}Ports to kill: ${PORTS[*]}${NC}"
echo -e "${CYAN}═══════════════════════════════════════════${NC}"
echo ""

# Function to kill all processes on a specific port - AGGRESSIVE
kill_port() {
    local PORT=$1
    local MAX_RETRIES=5
    local retry=0
    
    while [ $retry -lt $MAX_RETRIES ]; do
        echo -e "${YELLOW}🔍 Attempt $((retry + 1))/$MAX_RETRIES to kill port $PORT...${NC}"
        
        local PIDS=""
        local killed_any=false
        
        # Method 1: lsof (no sudo first)
        echo "  Method 1: lsof..."
        PIDS=$(lsof -ti:$PORT 2>/dev/null)
        if [ ! -z "$PIDS" ]; then
            echo "    Found PIDs: $PIDS"
            for PID in $PIDS; do
                ps -p $PID -o pid,comm,args 2>/dev/null | tail -n +2
                kill -9 $PID 2>/dev/null && echo -e "    ${GREEN}✓ Killed $PID${NC}" && killed_any=true
            done
        fi
        
        # Method 2: lsof with sudo
        echo "  Method 2: lsof (sudo)..."
        PIDS=$(sudo lsof -ti:$PORT 2>/dev/null)
        if [ ! -z "$PIDS" ]; then
            echo "    Found PIDs: $PIDS"
            for PID in $PIDS; do
                sudo kill -9 $PID 2>/dev/null && echo -e "    ${GREEN}✓ Killed $PID (sudo)${NC}" && killed_any=true
            done
        fi
        
        # Method 3: ss
        echo "  Method 3: ss..."
        PIDS=$(ss -tulpn 2>/dev/null | grep ":$PORT " | grep -oP 'pid=\K[0-9]+' | sort -u)
        if [ ! -z "$PIDS" ]; then
            echo "    Found PIDs: $PIDS"
            for PID in $PIDS; do
                kill -9 $PID 2>/dev/null && echo -e "    ${GREEN}✓ Killed $PID${NC}" && killed_any=true
            done
        fi
        
        # Method 4: ss with sudo
        echo "  Method 4: ss (sudo)..."
        PIDS=$(sudo ss -tulpn 2>/dev/null | grep ":$PORT " | grep -oP 'pid=\K[0-9]+' | sort -u)
        if [ ! -z "$PIDS" ]; then
            echo "    Found PIDs: $PIDS"
            for PID in $PIDS; do
                sudo kill -9 $PID 2>/dev/null && echo -e "    ${GREEN}✓ Killed $PID (sudo)${NC}" && killed_any=true
            done
        fi
        
        # Method 5: netstat
        echo "  Method 5: netstat..."
        PIDS=$(netstat -tulpn 2>/dev/null | grep ":$PORT " | awk '{print $7}' | cut -d'/' -f1 | grep -E '^[0-9]+$')
        if [ ! -z "$PIDS" ]; then
            echo "    Found PIDs: $PIDS"
            for PID in $PIDS; do
                sudo kill -9 $PID 2>/dev/null && echo -e "    ${GREEN}✓ Killed $PID${NC}" && killed_any=true
            done
        fi
        
        # Method 6: fuser (SIGKILL)
        echo "  Method 6: fuser..."
        sudo fuser -k -9 $PORT/tcp 2>/dev/null && echo -e "    ${GREEN}✓ fuser killed processes${NC}" && killed_any=true
        
        # Method 7: pkill by pattern
        echo "  Method 7: pkill by pattern..."
        pkill -9 -f ".*:$PORT" 2>/dev/null && echo -e "    ${GREEN}✓ pkill killed processes${NC}" && killed_any=true
        pkill -9 -f "localhost:$PORT" 2>/dev/null && killed_any=true
        
        sleep 1
        
        # Check if port is free
        if ! (lsof -ti:$PORT &>/dev/null || sudo lsof -ti:$PORT &>/dev/null || \
              netstat -tulpn 2>/dev/null | grep -q ":$PORT " || \
              ss -tulpn 2>/dev/null | grep -q ":$PORT "); then
            echo -e "${GREEN}✅ Port $PORT is FREE!${NC}"
            return 0
        fi
        
        retry=$((retry + 1))
        if [ $retry -lt $MAX_RETRIES ]; then
            echo -e "${YELLOW}⚠️  Port still in use, retrying...${NC}"
            sleep 1
        fi
    done
    
    echo -e "${RED}❌ Failed to free port $PORT after $MAX_RETRIES attempts${NC}"
    return 1
}

# Kill each port
FAILED_PORTS=()
for PORT in "${PORTS[@]}"; do
    # Validate port number
    if ! [[ "$PORT" =~ ^[0-9]+$ ]] || [ "$PORT" -lt 1 ] || [ "$PORT" -gt 65535 ]; then
        echo -e "${RED}Invalid port number: $PORT (must be 1-65535)${NC}"
        FAILED_PORTS+=("$PORT")
        continue
    fi
    
    echo ""
    echo -e "${CYAN}╔════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║  Processing Port: $PORT${NC}"
    echo -e "${CYAN}╚════════════════════════════════════════════╝${NC}"
    echo ""
    
    if ! kill_port "$PORT"; then
        FAILED_PORTS+=("$PORT")
    fi
done

# Final verification with multiple methods
echo ""
echo -e "${CYAN}═══════════════════════════════════════════${NC}"
echo -e "${YELLOW}📊 FINAL VERIFICATION FOR ALL PORTS${NC}"
echo -e "${CYAN}═══════════════════════════════════════════${NC}"

sleep 1

STILL_IN_USE=()

for PORT in "${PORTS[@]}"; do
    # Skip invalid ports
    if ! [[ "$PORT" =~ ^[0-9]+$ ]] || [ "$PORT" -lt 1 ] || [ "$PORT" -gt 65535 ]; then
        continue
    fi
    
    PORT_IN_USE=false
    
    echo ""
    echo -e "${BLUE}Checking port $PORT...${NC}"
    
    # Check 1: lsof
    if lsof -ti:$PORT &>/dev/null; then
        echo -e "${RED}  ❌ lsof: Port $PORT STILL IN USE${NC}"
        lsof -i:$PORT
        PORT_IN_USE=true
    fi
    
    # Check 2: lsof with sudo
    if sudo lsof -ti:$PORT &>/dev/null; then
        echo -e "${RED}  ❌ lsof (sudo): Port $PORT STILL IN USE${NC}"
        sudo lsof -i:$PORT
        PORT_IN_USE=true
    fi
    
    # Check 3: netstat
    if netstat -tulpn 2>/dev/null | grep -q ":$PORT "; then
        echo -e "${RED}  ❌ netstat: Port $PORT STILL IN USE${NC}"
        netstat -tulpn 2>/dev/null | grep ":$PORT "
        PORT_IN_USE=true
    fi
    
    # Check 4: ss
    if ss -tulpn 2>/dev/null | grep -q ":$PORT "; then
        echo -e "${RED}  ❌ ss: Port $PORT STILL IN USE${NC}"
        ss -tulpn 2>/dev/null | grep ":$PORT "
        PORT_IN_USE=true
    fi
    
    if [ "$PORT_IN_USE" = true ]; then
        STILL_IN_USE+=("$PORT")
    else
        echo -e "${GREEN}  ✅ Port $PORT is FREE${NC}"
    fi
done

echo ""
if [ ${#STILL_IN_USE[@]} -gt 0 ]; then
    echo -e "${RED}╔════════════════════════════════════════════╗${NC}"
    echo -e "${RED}║     ⚠️  SOME PORTS STILL IN USE ⚠️        ║${NC}"
    echo -e "${RED}╚════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${RED}Ports still in use: ${STILL_IN_USE[*]}${NC}"
    echo ""
    echo -e "${YELLOW}Suggestions:${NC}"
    echo "  1. Try running with sudo: sudo $0 ${PORTS[*]}"
    echo "  2. Reboot the system"
    echo "  3. Check Docker containers: docker ps"
    echo ""
    exit 1
else
    echo ""
    echo -e "${GREEN}╔════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║   ✅ ALL PORTS ARE COMPLETELY FREE ✅     ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${GREEN}Freed ports: ${PORTS[*]}${NC}"
    echo ""
    exit 0
fi