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
    
    print_color $GREEN "📦 DEVELOPMENT (localhost):"
    echo "  1)  dev:localhost          - Run both backend + frontend (localhost)"
    echo "  2)  dev:backend            - Run backend only (localhost)"
    echo "  3)  dev:frontend           - Run frontend only (localhost)"
    echo ""
    
    print_color $RED "🚀 PRODUCTION (116.118.49.243):"
    echo "  4)  prod                   - Run both backend + frontend (server)"
    echo "  5)  prod:backend           - Run backend only (server)"
    echo "  6)  prod:frontend          - Run frontend only (server)"
    echo ""
    
    print_color $CYAN "🗄️  DATABASE OPERATIONS:"
    echo "  7)  db:studio:dev          - Open Prisma Studio (localhost)"
    echo "  8)  db:studio:prod         - Open Prisma Studio (server)"
    echo "  9)  db:migrate             - Run database migrations"
    echo "  10) db:push                - Push schema changes to DB"
    echo ""
    
    print_color $RED "🐳 DOCKER OPERATIONS:"
    echo "  11) docker:start           - Start: PgAdmin, PostgreSQL, Redis, MinIO"
    echo "  12) docker:down            - Stop Docker (docker-compose down)"
    echo "  13) docker:rm:containers   - Remove Docker containers"
    echo "  14) docker:rm:builder      - Remove Docker build cache"
    echo "  15) docker:rm:images       - Remove Docker images"
    echo "  16) docker:logs            - View all container logs"
    echo "  17) docker:ps              - Show running containers"
    echo ""
    
    print_color $GREEN "🔧 UTILITIES:"
    echo "  18) lint                   - Run linters"
    echo "  19) format                 - Format code"
    echo "  20) test                   - Run tests"
    echo ""
    
    print_color $RED "⚡ KILL PORTS:"
    echo "  21) kill:15000             - Kill port 15000 (Frontend)"
    echo "  22) kill:15001             - Kill port 15001 (Backend)"
    echo "  23) kill:15003             - Kill port 15003 (PostgreSQL)"
    echo "  24) kill:15004             - Kill port 15004 (Redis)"
    echo "  25) kill:all               - Kill all dev ports"
    echo ""
    
    print_color $YELLOW "  0)  Exit"
    echo ""
    print_color $CYAN "💡 Quick start: Option 11 to start core services"
    print_color $CYAN "💡 Dev (localhost): http://localhost:150XX"
    print_color $CYAN "💡 Prod (server): http://116.118.49.243:150XX"
    echo ""
    
    read -p "$(print_color $CYAN 'Select option (0-25): ')" choice
    
    case $choice in
        1)
            print_color $GREEN "🚀 Starting development (localhost - backend + frontend)..."
            print_color $YELLOW "Press Ctrl+C to stop"
            bun run dev:localhost
            ;;
        2)
            print_color $GREEN "🚀 Starting backend (localhost)..."
            print_color $YELLOW "Press Ctrl+C to stop"
            bun run dev:backend
            ;;
        3)
            print_color $GREEN "🚀 Starting frontend (localhost)..."
            print_color $YELLOW "Press Ctrl+C to stop"
            bun run dev:frontend
            ;;
        4)
            print_color $RED "🚀 Starting production (server - backend + frontend)..."
            print_color $YELLOW "Press Ctrl+C to stop"
            bun run prod
            ;;
        5)
            print_color $RED "🚀 Starting backend (server)..."
            print_color $YELLOW "Press Ctrl+C to stop"
            bun run prod:backend
            ;;
        6)
            print_color $RED "🚀 Starting frontend (server)..."
            print_color $YELLOW "Press Ctrl+C to stop"
            bun run prod:frontend
            ;;
        7)
            print_color $CYAN "🗄️  Opening Prisma Studio (localhost)..."
            print_color $YELLOW "Press Ctrl+C to stop"
            cp .env.dev backend/.env && cd backend && npx prisma studio
            ;;
        8)
            print_color $CYAN "🗄️  Opening Prisma Studio (server)..."
            print_color $YELLOW "Press Ctrl+C to stop"
            cp .env.production backend/.env && cd backend && npx prisma studio
            ;;
        9)
            print_color $CYAN "🗄️  Running database migrations..."
            cd backend && npx prisma migrate dev
            ;;
        10)
            print_color $CYAN "🗄️  Pushing schema to database..."
            cd backend && npx prisma db push
            ;;
        11)
            print_color $RED "🐳 Starting Docker services (PgAdmin, PostgreSQL, Redis, MinIO)..."
            print_color $YELLOW "⚠️  Cleaning up existing containers..."
            docker rm -f timona-postgres timona-pgadmin timona-redis timona-minio 2>/dev/null || true
            echo ""
            print_color $CYAN "🚀 Starting services..."
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
            print_color $RED "🐳 Stopping Docker services (docker-compose down)..."
            docker compose -f docker-compose.hybrid.yml down
            print_color $GREEN "✅ All services stopped!"
            sleep 2
            ;;
        13)
            print_color $RED "🗑️  Removing Docker containers..."
            print_color $YELLOW "This will remove all Timona containers"
            echo ""
            print_color $CYAN "Current containers:"
            docker ps -a | grep timona || echo "No Timona containers found"
            echo ""
            read -p "$(print_color $YELLOW 'Continue? (y/N): ')" confirm
            if [ "$confirm" = "y" ] || [ "$confirm" = "Y" ]; then
                docker rm -f $(docker ps -a | grep timona | awk '{print $1}') 2>/dev/null || print_color $YELLOW "No containers to remove"
                print_color $GREEN "✅ Containers removed!"
            else
                print_color $YELLOW "Cancelled"
            fi
            sleep 2
            ;;
        14)
            print_color $RED "🧹 Removing Docker build cache..."
            print_color $YELLOW "This will free up disk space by removing build cache"
            echo ""
            docker builder prune -af
            print_color $GREEN "✅ Build cache removed!"
            sleep 2
            ;;
        15)
            print_color $RED "🧹 Removing Docker images..."
            print_color $YELLOW "This will remove unused and dangling images"
            echo ""
            print_color $CYAN "Current images:"
            docker images | grep -E "timona|REPOSITORY" || echo "No Timona images found"
            echo ""
            read -p "$(print_color $YELLOW 'Continue? (y/N): ')" confirm
            if [ "$confirm" = "y" ] || [ "$confirm" = "Y" ]; then
                docker image prune -af
                print_color $GREEN "✅ Images removed!"
            else
                print_color $YELLOW "Cancelled"
            fi
            sleep 2
            ;;
        16)
            print_color $RED "📋 Viewing all container logs..."
            docker compose -f docker-compose.hybrid.yml logs -f
            ;;
        17)
            print_color $RED "📊 Showing running containers..."
            echo ""
            docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep -E "NAMES|timona"
            echo ""
            sleep 3
            ;;
        18)
            print_color $GREEN "🔧 Running linters..."
            bun run lint
            ;;
        19)
            print_color $GREEN "🔧 Formatting code..."
            bun run format
            ;;
        20)
            print_color $GREEN "🔧 Running tests..."
            bun run test
            ;;
        21)
            print_color $RED "⚡ Killing process on port 15000..."
            $(pwd)/scripts/kill-ports.sh 15000
            sleep 1
            ;;
        22)
            print_color $RED "⚡ Killing process on port 15001..."
            $(pwd)/scripts/kill-ports.sh 15001
            sleep 1
            ;;
        23)
            print_color $RED "⚡ Killing process on port 15003..."
            $(pwd)/scripts/kill-ports.sh 15003
            sleep 1
            ;;
        24)
            print_color $RED "⚡ Killing process on port 15004..."
            $(pwd)/scripts/kill-ports.sh 15004
            sleep 1
            ;;
        25)
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
