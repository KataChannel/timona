#!/bin/bash

# Simple Interactive Menu for VS Code Terminal
# Runs commands in current terminal session

# Colors for better UX
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Function to print colored text
print_color() {
    color=$1
    shift
    echo -e "${color}$@${NC}"
}

# Clear screen
clear

# Main menu
while true; do
    print_color $CYAN "╔════════════════════════════════════════════════════════════╗"
    print_color $CYAN "║          🚀 TIMONA DEVELOPMENT MENU 🚀                    ║"
    print_color $CYAN "║      (Each command opens in new VS Code terminal)        ║"
    print_color $CYAN "╚════════════════════════════════════════════════════════════╝"
    echo ""
    
    print_color $GREEN "📦 GENERAL DEVELOPMENT:"
    echo "  1)  dev                    - Run both backend + frontend"
    echo "  2)  dev:backend            - Run backend only"
    echo "  3)  dev:frontend           - Run frontend only"
    echo ""
    
    print_color $BLUE "🌐 TIMONA DOMAIN (Port 15000/15001):"
    echo "  4)  dev:timona             - Run Timona (backend + frontend)"
    echo "  5)  dev:timona:backend     - Run Timona backend only"
    echo "  6)  dev:timona:frontend    - Run Timona frontend only"
    echo ""
    
    print_color $CYAN "🗄️  DATABASE OPERATIONS:"
    echo "  7)  db:studio              - Open Prisma Studio"
    echo "  8)  db:studio:timona       - Open Prisma Studio (Timona DB)"
    echo "  9)  db:migrate:timona      - Run database migrations"
    echo "  10) db:push:timona         - Push schema changes to DB"
    echo ""
    
    print_color $RED "🐳 DOCKER OPERATIONS:"
    echo "  11) docker:start           - Start: PgAdmin, PostgreSQL, Redis, MinIO"
    echo "  12) docker:down            - Stop all Docker services"
    echo "  13) docker:prune:builder   - Remove Docker build cache"
    echo "  14) docker:prune:images    - Remove unused Docker images"
    echo "  15) docker:logs            - View all container logs"
    echo "  16) docker:ps              - Show running containers"
    echo ""
    
    print_color $GREEN "🔧 UTILITIES:"
    echo "  17) lint                   - Run linters"
    echo "  18) format                 - Format code"
    echo "  19) test                   - Run tests"
    echo ""
    
    print_color $RED "⚡ KILL PORTS:"
    echo "  20) kill:15000             - Kill port 15000 (Frontend)"
    echo "  21) kill:15001             - Kill port 15001 (Backend)"
    echo "  22) kill:15003             - Kill port 15003 (PostgreSQL)"
    echo "  23) kill:15004             - Kill port 15004 (Redis)"
    echo "  24) kill:all               - Kill all dev ports"
    echo ""
    
    print_color $YELLOW "  0)  Exit"
    echo ""
    print_color $CYAN "💡 Quick start: Option 11 to start core services"
    print_color $CYAN "💡 Access URLs: http://116.118.49.243:150XX"
    echo ""
    
    read -p "$(print_color $CYAN 'Select option (0-24): ')" choice
    
    case $choice in
        1)
            print_color $GREEN "🚀 Starting development (backend + frontend)..."
            print_color $YELLOW "Press Ctrl+C to stop"
            bun run dev:timona
            ;;
        2)
            print_color $GREEN "🚀 Starting backend..."
            print_color $YELLOW "Press Ctrl+C to stop"
            bun run dev:timona:backend
            ;;
        3)
            print_color $GREEN "🚀 Starting frontend..."
            print_color $YELLOW "Press Ctrl+C to stop"
            bun run dev:timona:frontend
            ;;
        4)
            print_color $BLUE "🌐 Starting Timona (backend + frontend)..."
            print_color $YELLOW "Press Ctrl+C to stop"
            bun run dev:timona
            ;;
        5)
            print_color $BLUE "🌐 Starting Timona backend..."
            print_color $YELLOW "Press Ctrl+C to stop"
            bun run dev:timona:backend
            ;;
        6)
            print_color $BLUE "🌐 Starting Timona frontend..."
            print_color $YELLOW "Press Ctrl+C to stop"
            bun run dev:timona:frontend
            ;;
        7)
            print_color $CYAN "🗄️  Opening Prisma Studio..."
            print_color $YELLOW "Press Ctrl+C to stop"
            bun run db:studio
            ;;
        8)
            print_color $CYAN "🗄️  Opening Prisma Studio (Timona)..."
            print_color $YELLOW "Press Ctrl+C to stop"
            bun run db:studio:timona
            ;;
        9)
            print_color $CYAN "🗄️  Running database migrations..."
            bun run db:migrate:timona
            ;;
        10)
            print_color $CYAN "🗄️  Pushing schema to database..."
            bun run db:push:timona
            ;;
        11)
            print_color $RED "🐳 Starting Docker services (PgAdmin, PostgreSQL, Redis, MinIO)..."
            docker compose -f docker-compose.hybrid.yml up -d postgres pgadmin redis minio
            echo ""
            print_color $GREEN "✅ Services started successfully!"
            echo ""
            print_color $CYAN "📦 PostgreSQL:  http://116.118.49.243:15003"
            print_color $YELLOW "   Connection: postgresql://postgres:postgres@116.118.49.243:15003/timonacore"
            echo ""
            print_color $CYAN "🔧 PgAdmin:     http://116.118.49.243:15002"
            print_color $YELLOW "   Login: admin@timona.com / admin123"
            echo ""
            print_color $CYAN "⚡ Redis:       116.118.49.243:15004"
            echo ""
            print_color $CYAN "📦 MinIO API:   http://116.118.49.243:15007"
            print_color $CYAN "🎨 MinIO UI:    http://116.118.49.243:15008"
            print_color $YELLOW "   Login: minio-admin / minio-secret-2025"
            sleep 3
            ;;
        12)
            print_color $RED "🐳 Stopping all Docker services (docker-compose.hybrid.yml)..."
            docker compose -f docker-compose.hybrid.yml down
            print_color $GREEN "✅ All services stopped!"
            sleep 2
            ;;
        13)
            print_color $RED "🧹 Removing Docker build cache..."
            print_color $YELLOW "This will free up disk space by removing build cache"
            docker builder prune -af
            print_color $GREEN "✅ Build cache removed!"
            sleep 2
            ;;
        14)
            print_color $RED "🧹 Removing unused Docker images..."
            print_color $YELLOW "This will remove dangling and unused images"
            docker image prune -af
            print_color $GREEN "✅ Unused images removed!"
            sleep 2
            ;;
        15)
            print_color $RED "� Viewing all container logs..."
            docker compose -f docker-compose.hybrid.yml logs -f
            ;;
        16)
            print_color $RED "📊 Showing running containers..."
            echo ""
            docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep -E "NAMES|timona"
            echo ""
            sleep 3
            ;;
        17)
            print_color $GREEN "🔧 Running linters..."
            bun run lint
            ;;
        18)
            print_color $GREEN "🔧 Formatting code..."
            bun run format
            ;;
        19)
            print_color $GREEN "🔧 Running tests..."
            bun run test
            ;;
        20)
            print_color $RED "⚡ Killing process on port 15000..."
            $(pwd)/scripts/kill-ports.sh 15000
            sleep 1
            ;;
        21)
            print_color $RED "⚡ Killing process on port 15001..."
            $(pwd)/scripts/kill-ports.sh 15001
            sleep 1
            ;;
        22)
            print_color $RED "⚡ Killing process on port 15003..."
            $(pwd)/scripts/kill-ports.sh 15003
            sleep 1
            ;;
        23)
            print_color $RED "⚡ Killing process on port 15004..."
            $(pwd)/scripts/kill-ports.sh 15004
            sleep 1
            ;;
        24)
            print_color $RED "⚡ Killing all dev ports and processes..."
            $(pwd)/scripts/kill-ports.sh
            sleep 1
            ;;
        0)
            print_color $YELLOW "👋 Goodbye!"
            exit 0
            ;;
        *)
            print_color $RED "❌ Invalid option. Please try again."
            sleep 2
            ;;
    esac
    
    echo ""
    read -p "$(print_color $CYAN 'Press Enter to return to menu...')"
    clear
done
