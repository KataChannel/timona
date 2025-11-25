#!/bin/bash

# Interactive Menu for Development Scripts
# Each command runs in a separate terminal

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

# Function to run command in new terminal
run_in_terminal() {
    local title=$1
    local command=$2
    
    # Check if running in VS Code integrated terminal
    if [[ -n "$TERM_PROGRAM" && "$TERM_PROGRAM" == "vscode" ]]; then
        # Running in VS Code - use tmux or screen for split terminals
        if command -v tmux &> /dev/null; then
            # Use tmux to create new pane
            tmux split-window -h "bash -c '$command; echo; echo Press Enter to close...; read'"
        else
            # Fallback: run in background and show output
            print_color $CYAN "Starting: $title"
            eval "$command &"
            echo "PID: $!"
        fi
    elif command -v gnome-terminal &> /dev/null; then
        gnome-terminal --title="$title" -- bash -c "$command; exec bash"
    elif command -v xterm &> /dev/null; then
        xterm -title "$title" -hold -e "$command" &
    elif command -v konsole &> /dev/null; then
        konsole --title "$title" -e bash -c "$command; exec bash" &
    elif command -v terminator &> /dev/null; then
        terminator --title="$title" -e "bash -c '$command; exec bash'" &
    else
        # Fallback: run in current terminal
        print_color $YELLOW "No compatible terminal found. Running in current terminal..."
        eval "$command"
    fi
}

# Clear screen
clear

# Main menu
while true; do
    print_color $CYAN "╔════════════════════════════════════════════════════════════╗"
    print_color $CYAN "║          🚀 DEVELOPMENT SCRIPTS MENU 🚀                   ║"
    print_color $CYAN "╚════════════════════════════════════════════════════════════╝"
    echo ""
    
    print_color $GREEN "📦 GENERAL DEVELOPMENT:"
    echo "  1)  dev                    - Run both backend + frontend"
    echo "  2)  dev:backend            - Run backend only"
    echo "  3)  dev:frontend           - Run frontend only"
    echo ""
    
    print_color $BLUE "🌐 RAUSACH DOMAIN (Port 12000/12001):"
    echo "  4)  dev:rausach            - Run Rausach (backend + frontend)"
    echo "  5)  dev:rausach:backend    - Run Rausach backend only"
    echo "  6)  dev:rausach:frontend   - Run Rausach frontend only"
    echo ""
    
    print_color $PURPLE "🌐 TAZAGROUP DOMAIN (Port 13000/13001):"
    echo "  7)  dev:tazagroup          - Run Tazagroup (backend + frontend)"
    echo "  8)  dev:tazagroup:backend  - Run Tazagroup backend only"
    echo "  9)  dev:tazagroup:frontend - Run Tazagroup frontend only"
    echo ""
    
    print_color $YELLOW "🏗️  BUILD & DEPLOYMENT:"
    echo "  10) build                  - Build both backend + frontend"
    echo "  11) build:backend          - Build backend only"
    echo "  12) build:frontend         - Build frontend only"
    echo ""
    
    print_color $CYAN "🗄️  DATABASE OPERATIONS:"
    echo "  13) db:studio              - Open Prisma Studio"
    echo "  14) db:studio:rausach      - Open Prisma Studio (Rausach DB)"
    echo "  15) db:studio:tazagroup    - Open Prisma Studio (Tazagroup DB)"
    echo "  16) db:migrate             - Run database migration"
    echo "  17) db:push                - Push schema to database"
    echo "  18) db:seed                - Seed database"
    echo "  19) db:backup              - Backup database"
    echo "  20) db:restore             - Restore database"
    echo ""
    
    print_color $RED "🐳 DOCKER OPERATIONS:"
    echo "  21) docker:dev             - Start Docker services (Postgres, Redis, Minio)"
    echo "  22) docker:devfull         - Start all Docker services"
    echo "  23) docker:prod:rausach    - Deploy Rausach to Docker"
    echo "  24) docker:prod:tazagroup  - Deploy Tazagroup to Docker"
    echo "  25) docker:down            - Stop Docker services"
    echo ""
    
    print_color $GREEN "🔧 UTILITIES:"
    echo "  26) setup                  - Install all dependencies"
    echo "  27) clean                  - Clean node_modules and lockfiles"
    echo "  28) lint                   - Run linters"
    echo "  29) format                 - Format code with Prettier"
    echo "  30) test                   - Run all tests"
    echo ""
    
    print_color $RED "⚡ KILL PORTS:"
    echo "  31) kill:12000             - Kill process on port 12000 (Rausach frontend)"
    echo "  32) kill:12001             - Kill process on port 12001 (Rausach backend)"
    echo "  33) kill:13000             - Kill process on port 13000 (Tazagroup frontend)"
    echo "  34) kill:13001             - Kill process on port 13001 (Tazagroup backend)"
    echo "  35) kill:all               - Kill all dev ports (12000, 12001, 13000, 13001)"
    echo ""
    
    print_color $YELLOW "  0)  Exit"
    echo ""
    
    read -p "$(print_color $CYAN 'Select option (0-35): ')" choice
    
    case $choice in
        1)
            print_color $GREEN "🚀 Starting development (backend + frontend)..."
            run_in_terminal "Dev - Backend + Frontend" "cd $(pwd) && bun run dev"
            ;;
        2)
            print_color $GREEN "🚀 Starting backend..."
            run_in_terminal "Dev - Backend" "cd $(pwd) && bun run dev:backend"
            ;;
        3)
            print_color $GREEN "🚀 Starting frontend..."
            run_in_terminal "Dev - Frontend" "cd $(pwd) && bun run dev:frontend"
            ;;
        4)
            print_color $BLUE "🌐 Starting Rausach (backend + frontend)..."
            run_in_terminal "Rausach - Full" "cd $(pwd) && bun run dev:rausach"
            ;;
        5)
            print_color $BLUE "🌐 Starting Rausach backend..."
            run_in_terminal "Rausach - Backend" "cd $(pwd) && bun run dev:rausach:backend"
            ;;
        6)
            print_color $BLUE "🌐 Starting Rausach frontend..."
            run_in_terminal "Rausach - Frontend" "cd $(pwd) && bun run dev:rausach:frontend"
            ;;
        7)
            print_color $PURPLE "🌐 Starting Tazagroup (backend + frontend)..."
            run_in_terminal "Tazagroup - Full" "cd $(pwd) && bun run dev:tazagroup"
            ;;
        8)
            print_color $PURPLE "🌐 Starting Tazagroup backend..."
            run_in_terminal "Tazagroup - Backend" "cd $(pwd) && bun run dev:tazagroup:backend"
            ;;
        9)
            print_color $PURPLE "🌐 Starting Tazagroup frontend..."
            run_in_terminal "Tazagroup - Frontend" "cd $(pwd) && bun run dev:tazagroup:frontend"
            ;;
        10)
            print_color $YELLOW "🏗️  Building project..."
            run_in_terminal "Build - Full" "cd $(pwd) && bun run build"
            ;;
        11)
            print_color $YELLOW "🏗️  Building backend..."
            run_in_terminal "Build - Backend" "cd $(pwd) && bun run build:backend"
            ;;
        12)
            print_color $YELLOW "🏗️  Building frontend..."
            run_in_terminal "Build - Frontend" "cd $(pwd) && bun run build:frontend"
            ;;
        13)
            print_color $CYAN "🗄️  Opening Prisma Studio..."
            run_in_terminal "Prisma Studio" "cd $(pwd) && bun run db:studio"
            ;;
        14)
            print_color $CYAN "🗄️  Opening Prisma Studio (Rausach)..."
            run_in_terminal "Prisma Studio - Rausach" "cd $(pwd) && bun run db:studio:rausach"
            ;;
        15)
            print_color $CYAN "🗄️  Opening Prisma Studio (Tazagroup)..."
            run_in_terminal "Prisma Studio - Tazagroup" "cd $(pwd) && bun run db:studio:tazagroup"
            ;;
        16)
            print_color $CYAN "🗄️  Running database migration..."
            run_in_terminal "DB Migrate" "cd $(pwd) && bun run db:migrate"
            ;;
        17)
            print_color $CYAN "🗄️  Pushing schema to database..."
            run_in_terminal "DB Push" "cd $(pwd) && bun run db:push"
            ;;
        18)
            print_color $CYAN "🗄️  Seeding database..."
            run_in_terminal "DB Seed" "cd $(pwd) && bun run db:seed"
            ;;
        19)
            print_color $CYAN "🗄️  Backing up database..."
            run_in_terminal "DB Backup" "cd $(pwd) && bun run db:backup"
            ;;
        20)
            print_color $CYAN "🗄️  Restoring database..."
            run_in_terminal "DB Restore" "cd $(pwd) && bun run db:restore"
            ;;
        21)
            print_color $RED "🐳 Starting Docker dev services..."
            run_in_terminal "Docker Dev" "cd $(pwd) && bun run docker:dev"
            ;;
        22)
            print_color $RED "🐳 Starting all Docker services..."
            run_in_terminal "Docker Full" "cd $(pwd) && bun run docker:devfull"
            ;;
        23)
            print_color $RED "🐳 Deploying Rausach to Docker..."
            run_in_terminal "Docker - Rausach" "cd $(pwd) && bun run docker:prod:rausach"
            ;;
        24)
            print_color $RED "🐳 Deploying Tazagroup to Docker..."
            run_in_terminal "Docker - Tazagroup" "cd $(pwd) && bun run docker:prod:tazagroup"
            ;;
        25)
            print_color $RED "🐳 Stopping Docker services..."
            run_in_terminal "Docker Down" "cd $(pwd) && bun run docker:down"
            ;;
        26)
            print_color $GREEN "🔧 Installing dependencies..."
            run_in_terminal "Setup" "cd $(pwd) && bun run setup"
            ;;
        27)
            print_color $GREEN "🔧 Cleaning project..."
            run_in_terminal "Clean" "cd $(pwd) && bun run clean"
            ;;
        28)
            print_color $GREEN "🔧 Running linters..."
            run_in_terminal "Lint" "cd $(pwd) && bun run lint"
            ;;
        29)
            print_color $GREEN "🔧 Formatting code..."
            run_in_terminal "Format" "cd $(pwd) && bun run format"
            ;;
        30)
            print_color $GREEN "🔧 Running tests..."
            run_in_terminal "Test" "cd $(pwd) && bun run test"
            ;;
        31)
            print_color $RED "⚡ Killing process on port 12000..."
            $(pwd)/scripts/kill-ports.sh 12000
            sleep 1
            ;;
        32)
            print_color $RED "⚡ Killing process on port 12001..."
            $(pwd)/scripts/kill-ports.sh 12001
            sleep 1
            ;;
        33)
            print_color $RED "⚡ Killing process on port 13000..."
            $(pwd)/scripts/kill-ports.sh 13000
            sleep 1
            ;;
        34)
            print_color $RED "⚡ Killing process on port 13001..."
            $(pwd)/scripts/kill-ports.sh 13001
            sleep 1
            ;;
        35)
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
    read -p "$(print_color $CYAN 'Press Enter to continue...')"
    clear
done
