#!/bin/bash

# =============================================================================
# ROTA READER - MAC/LINUX AUTOMATIC INSTALLER AND LAUNCHER
# =============================================================================
# This script will:
# 1. Detect your operating system (macOS or Linux)
# 2. Check for and install Node.js v20.17.0 if needed
# 3. Install TypeScript v5.5.2 globally
# 4. Install Angular CLI v18.2.7 globally
# 5. Install all backend dependencies
# 6. Install all frontend dependencies
# 7. Start both backend and frontend servers
# 8. Open the application in your default browser
# =============================================================================

# ANSI Color Codes for pretty output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# =============================================================================
# CONFIGURATION - Versions to Install
# =============================================================================
NODE_VERSION="20.17.0"
TYPESCRIPT_VERSION="5.5.2"
ANGULAR_CLI_VERSION="18.2.7"

# =============================================================================
# INTRODUCTION
# =============================================================================
echo "============================================================"
echo -e "${BOLD}${CYAN}  ROTA READER - Automatic Setup and Launch${NC}"
echo "============================================================"
echo ""
echo "This will install all necessary components and start the app."
echo "Please wait, this may take several minutes on first run..."
echo ""
echo "Project Structure:"
echo "  rota-reader/"
echo "  ├── install-and-run.sh        (this file)"
echo "  ├── frontend/"
echo "  ├── backend/"
echo "  └── diagrams/"
echo ""
echo "Versions to be installed:"
echo "  Node.js:      ${NODE_VERSION}"
echo "  TypeScript:   ${TYPESCRIPT_VERSION}"
echo "  Angular CLI:  ${ANGULAR_CLI_VERSION}"
echo ""

# =============================================================================
# DETECT OPERATING SYSTEM
# =============================================================================
OS="$(uname -s)"
case "${OS}" in
    Linux*)     PLATFORM=linux;;
    Darwin*)    PLATFORM=mac;;
    *)          PLATFORM="UNKNOWN:${OS}"
esac

if [ "$PLATFORM" == "UNKNOWN:${OS}" ]; then
    echo -e "${RED}[ERROR] Unsupported operating system: ${OS}${NC}"
    echo ""
    echo "This script supports:"
    echo "  - macOS (Darwin)"
    echo "  - Linux (Ubuntu, Debian, Fedora, etc.)"
    echo ""
    exit 1
fi

echo -e "${CYAN}Detected platform: ${PLATFORM}${NC}"
echo ""

# =============================================================================
# CHECK FOR SUDO/ROOT PRIVILEGES (Linux only)
# =============================================================================
if [ "$PLATFORM" == "linux" ]; then
    if [ "$EUID" -ne 0 ]; then
        echo -e "${RED}[ERROR] This installer requires sudo privileges on Linux${NC}"
        echo ""
        echo "Please run with sudo:"
        echo "  ${YELLOW}sudo bash install-and-run.sh${NC}"
        echo ""
        exit 1
    fi
    echo -e "${GREEN}[OK] Running with sudo privileges${NC}"
    echo ""
fi

# =============================================================================
# HELPER FUNCTIONS
# =============================================================================

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to print section headers
print_section() {
    echo ""
    echo "============================================================"
    echo -e "${BOLD}$1${NC}"
    echo "============================================================"
    echo ""
}

# Function to print success messages
print_success() {
    echo -e "${GREEN}[OK] $1${NC}"
}

# Function to print error messages
print_error() {
    echo -e "${RED}[ERROR] $1${NC}"
}

# Function to print warning messages
print_warning() {
    echo -e "${YELLOW}[WARNING] $1${NC}"
}

# Function to print info messages
print_info() {
    echo -e "${CYAN}[INFO] $1${NC}"
}

# Function to print install messages
print_install() {
    echo -e "${YELLOW}[INSTALL] $1${NC}"
}

# =============================================================================
# STEP 1: CHECK AND INSTALL NODE.JS
# =============================================================================
print_section "Step 1 of 7: Checking Node.js Installation"

if command_exists node; then
    INSTALLED_NODE_VERSION=$(node --version)
    print_success "Node.js is already installed"
    echo "Current version: $INSTALLED_NODE_VERSION"

    # Check if version matches
    if [ "$INSTALLED_NODE_VERSION" == "v${NODE_VERSION}" ]; then
        print_success "Correct Node.js version detected"
    else
        print_warning "Different Node.js version detected"
        echo "Installed: $INSTALLED_NODE_VERSION"
        echo "Required:  v${NODE_VERSION}"
        echo ""
        echo "The installer will continue, but you may want to update Node.js."
        sleep 3
    fi
else
    print_install "Node.js not found. Installing Node.js v${NODE_VERSION}..."
    echo ""

    if [ "$PLATFORM" == "mac" ]; then
        # macOS Installation
        echo "Installing on macOS..."
        echo ""

        # Check if Homebrew is installed
        if command_exists brew; then
            print_success "Homebrew is installed"
            echo "Using Homebrew to install Node.js..."
            echo ""

            # Install Node.js 20
            brew install node@20

            # Add to PATH
            echo ""
            echo "Adding Node.js to PATH..."
            export PATH="/usr/local/opt/node@20/bin:$PATH"

            # Add to shell profiles
            if [ -f ~/.zshrc ]; then
                grep -q 'node@20/bin' ~/.zshrc || echo 'export PATH="/usr/local/opt/node@20/bin:$PATH"' >> ~/.zshrc
            fi
            if [ -f ~/.bash_profile ]; then
                grep -q 'node@20/bin' ~/.bash_profile || echo 'export PATH="/usr/local/opt/node@20/bin:$PATH"' >> ~/.bash_profile
            fi

        else
            print_warning "Homebrew not found. Installing Homebrew first..."
            echo ""
            echo "Homebrew is a package manager for macOS."
            echo "This is safe and recommended by Apple developers."
            echo ""
            echo "Installing Homebrew..."

            # Install Homebrew
            /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

            if [ $? -ne 0 ]; then
                print_error "Homebrew installation failed"
                echo ""
                echo "Please install Homebrew manually:"
                echo "  1. Visit: https://brew.sh/"
                echo "  2. Follow the installation instructions"
                echo "  3. Run this script again"
                exit 1
            fi

            print_success "Homebrew installed"
            echo ""
            echo "Installing Node.js via Homebrew..."
            brew install node@20
        fi

    elif [ "$PLATFORM" == "linux" ]; then
        # Linux Installation
        echo "Installing on Linux..."
        echo ""

        # Install curl if not present
        if ! command_exists curl; then
            print_info "Installing curl..."
            apt-get update
            apt-get install -y curl
        fi

        # Download and run NodeSource setup script
        print_info "Adding NodeSource repository..."
        curl -fsSL https://deb.nodesource.com/setup_20.x | bash -

        if [ $? -ne 0 ]; then
            print_error "Failed to add NodeSource repository"
            echo ""
            echo "Please check your internet connection or install Node.js manually:"
            echo "  1. Visit: https://nodejs.org/"
            echo "  2. Download Node.js v${NODE_VERSION}"
            echo "  3. Install it"
            echo "  4. Run this script again"
            exit 1
        fi

        # Install Node.js
        print_info "Installing Node.js..."
        apt-get install -y nodejs
    fi

    # Verify installation
    if command_exists node; then
        print_success "Node.js v${NODE_VERSION} installed successfully"
        node --version
    else
        print_error "Node.js installation failed"
        echo ""
        echo "Please install Node.js manually:"
        echo "  1. Visit: https://nodejs.org/"
        echo "  2. Download the LTS version (v${NODE_VERSION})"
        echo "  3. Install it"
        echo "  4. Run this script again"
        exit 1
    fi
fi

# =============================================================================
# STEP 2: CHECK NPM
# =============================================================================
print_section "Step 2 of 7: Checking npm Installation"

if command_exists npm; then
    NPM_VERSION=$(npm --version)
    print_success "npm is installed"
    echo "Version: $NPM_VERSION"
else
    print_error "npm not found"
    echo ""
    echo "npm should be installed automatically with Node.js."
    echo ""
    echo "Please try:"
    echo "  1. Restart your terminal"
    echo "  2. Run this script again"
    echo ""
    echo "If the problem persists, reinstall Node.js from:"
    echo "  https://nodejs.org/"
    exit 1
fi

# =============================================================================
# STEP 3: INSTALL TYPESCRIPT
# =============================================================================
print_section "Step 3 of 7: Installing TypeScript Globally"

if command_exists tsc; then
    TSC_VERSION=$(tsc --version)
    print_success "TypeScript is already installed"
    echo "Current: $TSC_VERSION"
    echo "Required: Version ${TYPESCRIPT_VERSION}"
else
    print_install "Installing TypeScript v${TYPESCRIPT_VERSION}..."
    echo "This will install TypeScript globally for all users."
    echo ""

    npm install -g typescript@${TYPESCRIPT_VERSION}

    if [ $? -ne 0 ]; then
        print_error "Failed to install TypeScript"
        echo ""
        echo "Please check your internet connection and try again."
        exit 1
    fi

    print_success "TypeScript v${TYPESCRIPT_VERSION} installed successfully"
    tsc --version
fi

# =============================================================================
# STEP 4: INSTALL ANGULAR CLI
# =============================================================================
print_section "Step 4 of 7: Installing Angular CLI Globally"

if command_exists ng; then
    print_success "Angular CLI is already installed"
    ng version 2>/dev/null | grep "Angular CLI" || echo "Angular CLI detected"
    echo "Required: Angular CLI: ${ANGULAR_CLI_VERSION}"
else
    print_install "Installing Angular CLI v${ANGULAR_CLI_VERSION}..."
    echo "This will install Angular CLI globally for all users."
    echo "This may take 2-3 minutes..."
    echo ""

    npm install -g @angular/cli@${ANGULAR_CLI_VERSION}

    if [ $? -ne 0 ]; then
        print_error "Failed to install Angular CLI"
        echo ""
        echo "Please check your internet connection and try again."
        exit 1
    fi

    print_success "Angular CLI v${ANGULAR_CLI_VERSION} installed successfully"
    ng version
fi

# =============================================================================
# STEP 5: INSTALL BACKEND DEPENDENCIES
# =============================================================================
print_section "Step 5 of 7: Installing Backend Dependencies"

# Get the directory where the script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

cd "$SCRIPT_DIR/backend"

if [ ! -f "package.json" ]; then
    print_error "Backend package.json not found at:"
    echo "$PWD"
    echo ""
    echo "Make sure you are running this script from the rota-reader folder!"
    echo ""
    echo "Expected structure:"
    echo "  rota-reader/"
    echo "  ├── install-and-run.sh  (this file)"
    echo "  ├── backend/"
    echo "  │   └── package.json"
    echo "  └── frontend/"
    echo "      └── package.json"
    exit 1
fi

echo "Installing backend packages from package.json..."
echo "Location: $PWD"
echo "This may take 2-3 minutes..."
echo ""

npm install

if [ $? -ne 0 ]; then
    print_error "Failed to install backend dependencies"
    echo ""
    echo "Possible solutions:"
    echo "  1. Check your internet connection"
    echo "  2. Delete the 'node_modules' folder in backend/"
    echo "  3. Run: rm -rf node_modules package-lock.json"
    echo "  4. Run this script again"
    exit 1
fi

print_success "Backend dependencies installed successfully"

# =============================================================================
# STEP 6: INSTALL FRONTEND DEPENDENCIES
# =============================================================================
print_section "Step 6 of 7: Installing Frontend Dependencies"

cd "$SCRIPT_DIR/frontend"

if [ ! -f "package.json" ]; then
    print_error "Frontend package.json not found at:"
    echo "$PWD"
    echo ""
    echo "Make sure you are running this script from the rota-reader folder!"
    exit 1
fi

echo "Installing frontend packages from package.json..."
echo "Location: $PWD"
echo "This may take 3-5 minutes..."
echo ""

npm install

if [ $? -ne 0 ]; then
    print_error "Failed to install frontend dependencies"
    echo ""
    echo "Possible solutions:"
    echo "  1. Check your internet connection"
    echo "  2. Delete the 'node_modules' folder in frontend/"
    echo "  3. Run: rm -rf node_modules package-lock.json"
    echo "  4. Run this script again"
    exit 1
fi

print_success "Frontend dependencies installed successfully"

# =============================================================================
# STEP 7: START APPLICATION
# =============================================================================
print_section "Step 7 of 7: Starting Application"

# Return to root directory
cd "$SCRIPT_DIR"

# Start backend in background
echo "Starting Backend Server..."
echo "Location: $SCRIPT_DIR/backend"
cd "$SCRIPT_DIR/backend"
npm start > /tmp/rota-reader-backend.log 2>&1 &
BACKEND_PID=$!
print_info "Backend PID: $BACKEND_PID"

# Wait for backend to start
echo "Waiting for backend to initialize..."
sleep 5

# Start frontend in background
echo ""
echo "Starting Frontend Server..."
echo "Location: $SCRIPT_DIR/frontend"
cd "$SCRIPT_DIR/frontend"
npm start > /tmp/rota-reader-frontend.log 2>&1 &
FRONTEND_PID=$!
print_info "Frontend PID: $FRONTEND_PID"

# Wait for frontend to compile and start
echo "Waiting for frontend to compile and start..."
echo "This may take 30-60 seconds on first run..."
sleep 15

# Open browser
echo ""
echo "Opening browser..."
if [ "$PLATFORM" == "mac" ]; then
    open http://localhost:4200 2>/dev/null || print_warning "Could not open browser automatically"
else
    xdg-open http://localhost:4200 2>/dev/null || print_warning "Could not open browser automatically"
fi

# =============================================================================
# SUCCESS MESSAGE
# =============================================================================
echo ""
echo "============================================================"
echo -e "${BOLD}${GREEN}  APPLICATION STARTED SUCCESSFULLY!${NC}"
echo "============================================================"
echo ""
echo -e "${CYAN}Frontend URL: http://localhost:4200${NC}"
echo ""
echo "Server Process IDs:"
echo "  Backend PID:  $BACKEND_PID"
echo "  Frontend PID: $FRONTEND_PID"
echo ""
echo "Log Files:"
echo "  Backend:  /tmp/rota-reader-backend.log"
echo "  Frontend: /tmp/rota-reader-frontend.log"
echo ""
echo "To view logs in real-time:"
echo "  Backend:  ${YELLOW}tail -f /tmp/rota-reader-backend.log${NC}"
echo "  Frontend: ${YELLOW}tail -f /tmp/rota-reader-frontend.log${NC}"
echo ""
echo "To STOP the application:"
echo "  ${YELLOW}bash $SCRIPT_DIR/stop-app.sh${NC}"
echo ""
echo "Or manually:"
echo "  ${YELLOW}kill $BACKEND_PID $FRONTEND_PID${NC}"
echo ""
echo "To START again later:"
echo "  ${YELLOW}bash $SCRIPT_DIR/install-and-run.sh${NC}"
echo ""
echo "============================================================"

# =============================================================================
# CREATE STOP SCRIPT
# =============================================================================
cat > "$SCRIPT_DIR/stop-app.sh" << EOF
#!/bin/bash

# Stop script for Rota Reader
echo "============================================================"
echo "  Stopping Rota Reader..."
echo "============================================================"
echo ""

# Kill backend
if kill $BACKEND_PID 2>/dev/null; then
    echo "[OK] Backend stopped (PID: $BACKEND_PID)"
else
    echo "[INFO] Backend process not found (PID: $BACKEND_PID)"
fi

# Kill frontend
if kill $FRONTEND_PID 2>/dev/null; then
    echo "[OK] Frontend stopped (PID: $FRONTEND_PID)"
else
    echo "[INFO] Frontend process not found (PID: $FRONTEND_PID)"
fi

echo ""
echo "Application stopped successfully."
echo ""
echo "To start again, run:"
echo "  bash $SCRIPT_DIR/install-and-run.sh"
echo ""
EOF

chmod +x "$SCRIPT_DIR/stop-app.sh"

echo ""
print_success "Stop script created: $SCRIPT_DIR/stop-app.sh"
echo ""
echo "This terminal will now wait. You can:"
echo "  - Press Ctrl+C to return to terminal (app continues running)"
echo "  - Use stop-app.sh to stop the application when done"
echo "  - Close this terminal (app continues running)"
echo ""

# Keep script running so output is visible
wait