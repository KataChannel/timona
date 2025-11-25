#!/bin/bash

# 🔑 Tazav1 SSH Key Generation & Setup Script
# Automated SSH key generation and configuration for remote deployment

set -euo pipefail

# Configuration
DEFAULT_SSH_KEY_NAME="default"
SSH_KEY_PATH="$HOME/.ssh"
SSH_KEY_TYPE="ed25519"
SSH_KEY_BITS="4096"
DEFAULT_USER="root"
DEFAULT_SERVER="116.118.49.243"
DOMAIN="localhost"
CONFIG_FILE="$HOME/.ssh/config"

# Color codes
readonly RED='\033[0;31m'
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[1;33m'
readonly BLUE='\033[0;34m'
readonly PURPLE='\033[0;35m'
readonly CYAN='\033[0;36m'
readonly NC='\033[0m'

# Logging functions
log() { echo -e "${GREEN}[$(date +'%H:%M:%S')]${NC} $1"; }
info() { echo -e "${BLUE}ℹ️  $1${NC}"; }
success() { echo -e "${GREEN}✅ $1${NC}"; }
warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
error() { echo -e "${RED}❌ $1${NC}"; exit 1; }

# Show banner
show_banner() {
    echo -e "${BLUE}"
    cat << 'EOF'
╔══════════════════════════════════════════════════════════════════════════════╗
║                     🔑 Tazav1 SSH Key Setup                               ║
║                                                                              ║
║    Generate and configure SSH keys for secure remote deployment            ║
║    Supports ED25519 and RSA key types with automated configuration         ║
╚══════════════════════════════════════════════════════════════════════════════╝
EOF
    echo -e "${NC}"
}

# Get user input for SSH key name
get_ssh_key_name() {
    echo -e "${CYAN}🔑 SSH Key Configuration${NC}"
    echo
    
    # Get SSH key name
    while true; do
        read -p "Enter SSH key name (default: $DEFAULT_SSH_KEY_NAME): " input_key_name
        SSH_KEY_NAME="${input_key_name:-$DEFAULT_SSH_KEY_NAME}"
        
        # Validate key name (no spaces, special characters)
        if [[ "$SSH_KEY_NAME" =~ ^[a-zA-Z0-9_-]+$ ]]; then
            break
        else
            echo -e "${RED}❌ Invalid key name. Use only letters, numbers, hyphens, and underscores.${NC}"
        fi
    done
    
    info "SSH key name: $SSH_KEY_NAME"
    echo
}

# Get user input for connection details
get_connection_details() {
    echo -e "${CYAN}🔗 SSH Connection Setup${NC}"
    echo
    
    # Get server IP
    while true; do
        read -p "Enter server IP (default: $DEFAULT_SERVER): " input_server
        SERVER_IP="${input_server:-$DEFAULT_SERVER}"
        
        # Validate IP format
        if [[ $SERVER_IP =~ ^[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}$ ]]; then
            break
        else
            echo -e "${RED}❌ Invalid IP format. Please enter a valid IP address.${NC}"
        fi
    done
    
    # Get username
    read -p "Enter SSH username (default: $DEFAULT_USER): " input_user
    SSH_USER="${input_user:-$DEFAULT_USER}"
    
    # Get password for initial connection
    while true; do
        read -s -p "Enter SSH password for $SSH_USER@$SERVER_IP: " SSH_PASSWORD
        echo
        if [[ -n "$SSH_PASSWORD" ]]; then
            break
        else
            echo -e "${RED}❌ Password cannot be empty.${NC}"
        fi
    done
    
    echo
    info "Connection details:"
    info "  Server: $SERVER_IP"
    info "  User: $SSH_USER"
    info "  SSH Key: $SSH_KEY_NAME"
    info "  Password: [HIDDEN]"
    echo
}

# Check if sshpass is installed
check_sshpass() {
    if ! command -v sshpass &> /dev/null; then
        warning "sshpass is not installed. Installing..."
        
        # Try to install sshpass
        if command -v apt-get &> /dev/null; then
            sudo apt-get update && sudo apt-get install -y sshpass
        elif command -v yum &> /dev/null; then
            sudo yum install -y sshpass
        elif command -v brew &> /dev/null; then
            brew install sshpass
        else
            error "Cannot install sshpass. Please install it manually."
        fi
        
        if ! command -v sshpass &> /dev/null; then
            error "Failed to install sshpass. Please install it manually."
        fi
        
        success "sshpass installed successfully"
    fi
}

# Test SSH connection
test_ssh_connection() {
    log "🔍 Testing SSH connection to $SSH_USER@$SERVER_IP..."
    
    # Test connection with password
    if sshpass -p "$SSH_PASSWORD" ssh -o StrictHostKeyChecking=no -o ConnectTimeout=10 \
       "$SSH_USER@$SERVER_IP" "echo 'Connection successful'" &> /dev/null; then
        success "SSH connection test successful"
    else
        error "SSH connection failed. Please check your credentials and server availability."
    fi
}

# Copy public key to server
copy_key_to_server() {
    local public_key="$SSH_KEY_PATH/$SSH_KEY_NAME.pub"
    
    if [[ ! -f "$public_key" ]]; then
        error "Public key not found: $public_key"
    fi
    
    log "📤 Copying public key to server..."
    
    # Copy key using sshpass
    if sshpass -p "$SSH_PASSWORD" ssh-copy-id -o StrictHostKeyChecking=no \
       -i "$public_key" "$SSH_USER@$SERVER_IP"; then
        success "Public key copied to server successfully"
    else
        error "Failed to copy public key to server"
    fi
}

# Test passwordless SSH
test_passwordless_ssh() {
    log "🔐 Testing passwordless SSH connection..."
    
    local private_key="$SSH_KEY_PATH/$SSH_KEY_NAME"
    
    if ssh -o StrictHostKeyChecking=no -o ConnectTimeout=10 \
       -i "$private_key" "$SSH_USER@$SERVER_IP" "echo 'Passwordless SSH successful'" &> /dev/null; then
        success "Passwordless SSH connection successful"
        return 0
    else
        error "Passwordless SSH connection failed"
        return 1
    fi
}

# Show help
show_help() {
    cat << 'EOF'
🔑 Tazav1 SSH Key Generation & Setup Script

USAGE:
    ./ssh-keygen-setup.sh [OPTIONS]

OPTIONS:
    --name NAME           SSH key name (default: default)
    --type TYPE           Key type: ed25519 or rsa (default: ed25519)
    --bits BITS           Key bits for RSA (default: 4096)
    --path PATH           SSH directory path (default: ~/.ssh)
    --domain DOMAIN       Server domain (default: tazaoffical.online)
    --user USER           SSH user (default: root)
    --force               Force overwrite existing keys
    --no-config           Skip SSH config file creation
    --copy-key            Copy public key to clipboard
    --auto-deploy         Automatically deploy key to server
    --help                Show this help

EXAMPLES:
    # Interactive setup with prompts
    ./ssh-keygen-setup.sh

    # Generate key and auto-deploy to server
    ./ssh-keygen-setup.sh --auto-deploy

    # Generate RSA key with custom name
    ./ssh-keygen-setup.sh --type rsa --name myproject-key

    # Force overwrite existing key
    ./ssh-keygen-setup.sh --force --name existing-key

EOF
}

# Parse command line arguments
parse_arguments() {
    while [[ $# -gt 0 ]]; do
        case $1 in
            --name)
                SSH_KEY_NAME="$2"
                shift 2
                ;;
            --type)
                SSH_KEY_TYPE="$2"
                shift 2
                ;;
            --bits)
                SSH_KEY_BITS="$2"
                shift 2
                ;;
            --path)
                SSH_KEY_PATH="$2"
                shift 2
                ;;
            --server)
                SERVER_IP="$2"
                shift 2
                ;;
            --domain)
                DOMAIN="$2"
                shift 2
                ;;
            --user)
                SSH_USER="$2"
                shift 2
                ;;
            --force)
                FORCE_OVERWRITE=true
                shift
                ;;
            --no-config)
                NO_CONFIG=true
                shift
                ;;
            --copy-key)
                COPY_KEY=true
                shift
                ;;
            --auto-deploy)
                AUTO_DEPLOY=true
                shift
                ;;
            --help)
                show_help
                exit 0
                ;;
            *)
                error "Unknown option: $1. Use --help for usage."
                ;;
        esac
    done
}

# Validate inputs
validate_inputs() {
    # Validate key type
    if [[ "$SSH_KEY_TYPE" != "ed25519" && "$SSH_KEY_TYPE" != "rsa" ]]; then
        error "Invalid key type: $SSH_KEY_TYPE. Use 'ed25519' or 'rsa'"
    fi
    
    # Validate RSA key bits
    if [[ "$SSH_KEY_TYPE" == "rsa" ]]; then
        if [[ ! "$SSH_KEY_BITS" =~ ^[0-9]+$ ]] || [[ "$SSH_KEY_BITS" -lt 2048 ]]; then
            error "Invalid RSA key bits: $SSH_KEY_BITS. Minimum 2048 bits required"
        fi
    fi
    
    # Validate SSH key name
    if [[ ! "$SSH_KEY_NAME" =~ ^[a-zA-Z0-9_-]+$ ]]; then
        error "Invalid SSH key name: $SSH_KEY_NAME. Use only letters, numbers, hyphens, and underscores."
    fi
    
    # Validate SSH directory
    if [[ ! -d "$SSH_KEY_PATH" ]]; then
        log "Creating SSH directory: $SSH_KEY_PATH"
        mkdir -p "$SSH_KEY_PATH"
        chmod 700 "$SSH_KEY_PATH"
    fi
}

# Check if SSH key already exists
check_existing_key() {
    local private_key="$SSH_KEY_PATH/$SSH_KEY_NAME"
    local public_key="$SSH_KEY_PATH/$SSH_KEY_NAME.pub"
    
    if [[ -f "$private_key" || -f "$public_key" ]]; then
        if [[ "${FORCE_OVERWRITE:-false}" == "true" ]]; then
            warning "Overwriting existing SSH key: $SSH_KEY_NAME"
            rm -f "$private_key" "$public_key"
        else
            error "SSH key already exists: $SSH_KEY_NAME. Use --force to overwrite"
        fi
    fi
}

# Generate SSH key
generate_ssh_key() {
    log "🔑 Generating SSH key..."
    
    local private_key="$SSH_KEY_PATH/$SSH_KEY_NAME"
    local comment="${SSH_KEY_NAME}@$(hostname)-$(date +%Y%m%d)"
    
    case "$SSH_KEY_TYPE" in
        ed25519)
            ssh-keygen -t ed25519 -f "$private_key" -N "" -C "$comment"
            ;;
        rsa)
            ssh-keygen -t rsa -b "$SSH_KEY_BITS" -f "$private_key" -N "" -C "$comment"
            ;;
    esac
    
    # Set proper permissions
    chmod 600 "$private_key"
    chmod 644 "$private_key.pub"
    
    success "SSH key generated successfully:"
    info "  Private key: $private_key"
    info "  Public key: $private_key.pub"
    info "  Key type: $SSH_KEY_TYPE"
    if [[ "$SSH_KEY_TYPE" == "rsa" ]]; then
        info "  Key bits: $SSH_KEY_BITS"
    fi
}

# Create SSH config entry
create_ssh_config() {
    if [[ "${NO_CONFIG:-false}" == "true" ]]; then
        return
    fi
    
    if [[ -z "${SERVER_IP:-}" ]]; then
        log "⚠️  No server IP provided, skipping SSH config creation"
        return
    fi
    
    log "📝 Creating SSH config entry..."
    
    local config_entry="
# Tazav1 Deployment Server - Generated $(date)
Host ${SSH_KEY_NAME}-${SERVER_IP}
    HostName ${SERVER_IP}
    User ${SSH_USER:-$DEFAULT_USER}
    IdentityFile $SSH_KEY_PATH/$SSH_KEY_NAME
    IdentitiesOnly yes
    StrictHostKeyChecking no
    UserKnownHostsFile /dev/null
    LogLevel ERROR
"
    
    # Create config file if it doesn't exist
    if [[ ! -f "$CONFIG_FILE" ]]; then
        touch "$CONFIG_FILE"
        chmod 600 "$CONFIG_FILE"
    fi
    
    # Check if entry already exists
    if grep -q "Host ${SSH_KEY_NAME}-${SERVER_IP}" "$CONFIG_FILE"; then
        warning "SSH config entry already exists for ${SSH_KEY_NAME}-${SERVER_IP}"
    else
        echo "$config_entry" >> "$CONFIG_FILE"
        success "SSH config entry created for ${SSH_KEY_NAME}-${SERVER_IP}"
    fi
}

# Copy public key to clipboard
copy_key_to_clipboard() {
    if [[ "${COPY_KEY:-false}" != "true" ]]; then
        return
    fi
    
    local public_key="$SSH_KEY_PATH/$SSH_KEY_NAME.pub"
    
    # Try different clipboard commands
    if command -v xclip &> /dev/null; then
        xclip -selection clipboard < "$public_key"
        success "Public key copied to clipboard (xclip)"
    elif command -v pbcopy &> /dev/null; then
        pbcopy < "$public_key"
        success "Public key copied to clipboard (pbcopy)"
    elif command -v clip &> /dev/null; then
        clip < "$public_key"
        success "Public key copied to clipboard (clip)"
    else
        warning "No clipboard utility found. Public key not copied."
    fi
}

# Display key information
display_key_info() {
    log "🔍 SSH Key Information:"
    
    local private_key="$SSH_KEY_PATH/$SSH_KEY_NAME"
    local public_key="$SSH_KEY_PATH/$SSH_KEY_NAME.pub"
    
    # Display key fingerprint
    if command -v ssh-keygen &> /dev/null; then
        echo -e "${CYAN}Fingerprint (SHA256):${NC}"
        ssh-keygen -lf "$public_key"
        echo
        
        echo -e "${CYAN}Fingerprint (MD5):${NC}"
        ssh-keygen -lf "$public_key" -E md5
        echo
    fi
    
    # Display public key
    echo -e "${CYAN}Public Key:${NC}"
    cat "$public_key"
    echo
    
    # Display key size info
    if [[ "$SSH_KEY_TYPE" == "rsa" ]]; then
        info "RSA Key Size: $SSH_KEY_BITS bits"
    else
        info "ED25519 Key (256-bit equivalent security)"
    fi
}

# Show usage instructions
show_usage_instructions() {
    echo -e "${PURPLE}📋 Connection Ready:${NC}"
    echo
    
    local private_key="$SSH_KEY_PATH/$SSH_KEY_NAME"
    
    echo -e "${YELLOW}Connect to your server:${NC}"
    echo "   ssh -i $private_key ${SSH_USER}@${SERVER_IP}"
    echo "   # Or using config alias:"
    echo "   ssh ${SSH_KEY_NAME}-${SERVER_IP}"
    echo
    
    echo -e "${YELLOW}Use with Tazav1 deployment:${NC}"
    echo "   ./deploy-remote.sh --key $private_key --user ${SSH_USER} ${SERVER_IP} ${DOMAIN}"
    echo
}

# Create deployment helper
create_deployment_helper() {
    local helper_script="deploy-with-${SSH_KEY_NAME}.sh"
    
    cat > "$helper_script" << EOF
#!/bin/bash

# 🚀 Tazav1 Deployment Helper with Generated SSH Key
# Auto-generated helper script for deployment with key: $SSH_KEY_NAME

SSH_KEY="$SSH_KEY_PATH/$SSH_KEY_NAME"
SSH_USER="${SSH_USER:-$DEFAULT_USER}"
SERVER_IP="${SERVER_IP}"

# Check if key exists
if [[ ! -f "\$SSH_KEY" ]]; then
    echo "❌ SSH key not found: \$SSH_KEY"
    exit 1
fi

# Run deployment with generated key
exec ./deploy-remote.sh --key "\$SSH_KEY" --user "\$SSH_USER" "\$SERVER_IP" "\$@"
EOF
    
    chmod +x "$helper_script"
    success "Created deployment helper: $helper_script"
}

# Main function
main() {
    show_banner
    
    # Set defaults
    FORCE_OVERWRITE=${FORCE_OVERWRITE:-true}
    NO_CONFIG=${NO_CONFIG:-false}
    COPY_KEY=${COPY_KEY:-false}
    AUTO_DEPLOY=${AUTO_DEPLOY:-false}
    SSH_USER=${SSH_USER:-$DEFAULT_USER}
    SERVER_IP=${SERVER_IP:-}
    SSH_KEY_NAME=${SSH_KEY_NAME:-}
    
    # Parse arguments
    parse_arguments "$@"
    
    # Get SSH key name if not provided via command line
    if [[ -z "$SSH_KEY_NAME" ]]; then
        get_ssh_key_name
    fi
    
    # Get connection details if not provided
    if [[ -z "$SERVER_IP" ]] || [[ "$AUTO_DEPLOY" == "true" ]]; then
        get_connection_details
    fi
    
    # Validate inputs
    validate_inputs
    
    # Check existing keys
    check_existing_key
    
    # Generate SSH key
    generate_ssh_key
    
    # Create SSH config
    create_ssh_config
    
    # Copy key to clipboard
    copy_key_to_clipboard
    
    # Auto-deploy key to server if requested
    if [[ "$AUTO_DEPLOY" == "true" ]] || [[ -n "$SSH_PASSWORD" ]]; then
        check_sshpass
        test_ssh_connection
        copy_key_to_server
        test_passwordless_ssh
    fi
    
    # Display key information
    display_key_info
    
    # Create deployment helper
    create_deployment_helper
    
    # Show usage instructions
    show_usage_instructions
    
    success "🎉 SSH key setup completed successfully!"
    info "Use the generated key for secure remote deployment with Tazav1"
}

# Run main function
main "$@"
