@echo off
setlocal enabledelayedexpansion
color 0A

:: =============================================================================
:: ROTA READER - WINDOWS AUTOMATIC INSTALLER AND LAUNCHER
:: =============================================================================
:: This script will:
:: 1. Check for and install Node.js v20.17.0 if needed
:: 2. Install TypeScript v5.5.2 globally
:: 3. Install Angular CLI v18.2.7 globally
:: 4. Install all backend dependencies
:: 5. Install all frontend dependencies
:: 6. Start both backend and frontend servers
:: 7. Open the application in your default browser
:: =============================================================================

echo ============================================================
echo   ROTA READER - Automatic Setup and Launch
echo ============================================================
echo.
echo This will install all necessary components and start the app.
echo Please wait, this may take several minutes on first run...
echo.
echo Project Structure:
echo   rota-reader/
echo   ├── install-and-run.bat       ^(this file^)
echo   ├── frontend/
echo   ├── backend/
echo   └── diagrams/
echo.
pause

:: =============================================================================
:: ADMIN RIGHTS CHECK
:: =============================================================================
echo ============================================================
echo Checking Administrator Privileges
echo ============================================================
echo.

net session >nul 2>&1
if %errorLevel% neq 0 (
    echo [ERROR] This installer requires Administrator privileges.
    echo.
    echo Please follow these steps:
    echo   1. Right-click on 'install-and-run.bat'
    echo   2. Select "Run as administrator"
    echo   3. Click "Yes" when Windows asks for permission
    echo.
    pause
    exit /b 1
)

echo [OK] Running with Administrator privileges
echo.

:: =============================================================================
:: CONFIGURATION - Versions to Install
:: =============================================================================
set "NODE_VERSION=20.17.0"
set "NODE_INSTALLER=node-v%NODE_VERSION%-x64.msi"
set "NODE_URL=https://nodejs.org/dist/v%NODE_VERSION%/%NODE_INSTALLER%"
set "TYPESCRIPT_VERSION=5.5.2"
set "ANGULAR_CLI_VERSION=18.2.7"
set "DOWNLOAD_DIR=%TEMP%\rota-reader-installer"

:: Create download directory
if not exist "%DOWNLOAD_DIR%" mkdir "%DOWNLOAD_DIR%"

echo Versions to be installed:
echo   Node.js:      %NODE_VERSION%
echo   TypeScript:   %TYPESCRIPT_VERSION%
echo   Angular CLI:  %ANGULAR_CLI_VERSION%
echo.

:: =============================================================================
:: STEP 1: CHECK AND INSTALL NODE.JS
:: =============================================================================
echo ============================================================
echo Step 1 of 7: Checking Node.js Installation
echo ============================================================
echo.

where node >nul 2>&1
if %errorLevel% equ 0 (
    echo [OK] Node.js is already installed
    for /f "tokens=*" %%i in ('node --version') do set INSTALLED_NODE=%%i
    echo Current version: !INSTALLED_NODE!
    echo.

    :: Check if version matches
    if "!INSTALLED_NODE!" == "v%NODE_VERSION%" (
        echo [OK] Correct Node.js version detected
    ) else (
        echo [WARNING] Different Node.js version detected
        echo Installed: !INSTALLED_NODE!
        echo Required:  v%NODE_VERSION%
        echo.
        echo The installer will continue, but you may want to update Node.js manually.
        echo Download from: https://nodejs.org/
        timeout /t 5
    )
) else (
    echo [INSTALL] Node.js not found. Installing Node.js v%NODE_VERSION%...
    echo.
    echo This will:
    echo   - Download Node.js installer (approximately 30 MB)
    echo   - Install Node.js to C:\Program Files\nodejs\
    echo   - Add Node.js to your system PATH
    echo.

    echo Downloading Node.js installer from nodejs.org...
    echo URL: %NODE_URL%
    echo.

    :: Download Node.js installer using PowerShell
    powershell -Command "& {Write-Host 'Downloading...'; [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; $ProgressPreference = 'SilentlyContinue'; Invoke-WebRequest -Uri '%NODE_URL%' -OutFile '%DOWNLOAD_DIR%\%NODE_INSTALLER%'; Write-Host 'Download complete!'}"

    if !errorLevel! neq 0 (
        echo.
        echo [ERROR] Failed to download Node.js installer
        echo.
        echo Please check your internet connection or download manually:
        echo   1. Visit: https://nodejs.org/
        echo   2. Download Node.js v%NODE_VERSION% LTS
        echo   3. Install it
        echo   4. Run this script again
        echo.
        pause
        exit /b 1
    )

    echo.
    echo Installing Node.js v%NODE_VERSION%...
    echo This will take 2-3 minutes. Please wait...
    echo.

    :: Install Node.js silently
    msiexec /i "%DOWNLOAD_DIR%\%NODE_INSTALLER%" /qn /norestart ADDLOCAL=ALL

    :: Wait for installation to complete
    echo Waiting for installation to complete...
    timeout /t 15 /nobreak >nul

    :: Refresh environment variables
    echo Refreshing environment variables...
    call :RefreshEnv

    :: Verify installation
    where node >nul 2>&1
    if !errorLevel! neq 0 (
        echo.
        echo [ERROR] Node.js installation failed
        echo.
        echo Please try installing manually:
        echo   1. Visit: https://nodejs.org/
        echo   2. Download the LTS version (v%NODE_VERSION%)
        echo   3. Run the installer
        echo   4. Restart your computer
        echo   5. Run this script again
        echo.
        pause
        exit /b 1
    )

    echo [OK] Node.js v%NODE_VERSION% installed successfully
    node --version
)

echo.

:: =============================================================================
:: STEP 2: CHECK NPM
:: =============================================================================
echo ============================================================
echo Step 2 of 7: Checking npm Installation
echo ============================================================
echo.

where npm >nul 2>&1
if %errorLevel% equ 0 (
    echo [OK] npm is installed
    for /f "tokens=*" %%i in ('npm --version') do echo Version: %%i
) else (
    echo [ERROR] npm not found
    echo npm should be installed automatically with Node.js
    echo.
    echo Please try:
    echo   1. Restart your computer
    echo   2. Run this script again
    echo.
    pause
    exit /b 1
)

echo.

:: =============================================================================
:: STEP 3: INSTALL TYPESCRIPT
:: =============================================================================
echo ============================================================
echo Step 3 of 7: Installing TypeScript Globally
echo ============================================================
echo.

where tsc >nul 2>&1
if %errorLevel% equ 0 (
    echo [OK] TypeScript is already installed
    for /f "tokens=*" %%i in ('tsc --version') do echo Current: %%i
    echo Required: Version %TYPESCRIPT_VERSION%
) else (
    echo [INSTALL] Installing TypeScript v%TYPESCRIPT_VERSION%...
    echo This will install TypeScript globally for all users.
    echo.

    call npm install -g typescript@%TYPESCRIPT_VERSION%

    if !errorLevel! neq 0 (
        echo.
        echo [ERROR] Failed to install TypeScript
        echo.
        echo Please check your internet connection and try again.
        pause
        exit /b 1
    )

    echo [OK] TypeScript v%TYPESCRIPT_VERSION% installed successfully
    tsc --version
)

echo.

:: =============================================================================
:: STEP 4: INSTALL ANGULAR CLI
:: =============================================================================
echo ============================================================
echo Step 4 of 7: Installing Angular CLI Globally
echo ============================================================
echo.

where ng >nul 2>&1
if %errorLevel% equ 0 (
    echo [OK] Angular CLI is already installed
    for /f "tokens=*" %%i in ('ng version 2^>nul ^| findstr /C:"Angular CLI"') do echo Current: %%i
    echo Required: Angular CLI: %ANGULAR_CLI_VERSION%
) else (
    echo [INSTALL] Installing Angular CLI v%ANGULAR_CLI_VERSION%...
    echo This will install Angular CLI globally for all users.
    echo This may take 2-3 minutes...
    echo.

    call npm install -g @angular/cli@%ANGULAR_CLI_VERSION%

    if !errorLevel! neq 0 (
        echo.
        echo [ERROR] Failed to install Angular CLI
        echo.
        echo Please check your internet connection and try again.
        pause
        exit /b 1
    )

    echo [OK] Angular CLI v%ANGULAR_CLI_VERSION% installed successfully
    ng version
)

echo.

:: =============================================================================
:: STEP 5: INSTALL BACKEND DEPENDENCIES
:: =============================================================================
echo ============================================================
echo Step 5 of 7: Installing Backend Dependencies
echo ============================================================
echo.

cd /d "%~dp0backend"

if not exist "package.json" (
    echo [ERROR] Backend package.json not found at:
    echo %CD%
    echo.
    echo Make sure you are running this script from the rota-reader folder!
    echo.
    echo Expected structure:
    echo   rota-reader/
    echo   ├── install-and-run.bat  ^(this file^)
    echo   ├── backend/
    echo   │   └── package.json
    echo   └── frontend/
    echo       └── package.json
    echo.
    pause
    exit /b 1
)

echo Installing backend packages from package.json...
echo Location: %CD%
echo This may take 2-3 minutes...
echo.

call npm install

if %errorLevel% neq 0 (
    echo.
    echo [ERROR] Failed to install backend dependencies
    echo.
    echo Possible solutions:
    echo   1. Check your internet connection
    echo   2. Delete the 'node_modules' folder in backend/
    echo   3. Run this script again
    echo.
    pause
    exit /b 1
)

echo [OK] Backend dependencies installed successfully
echo.

:: =============================================================================
:: STEP 6: INSTALL FRONTEND DEPENDENCIES
:: =============================================================================
echo ============================================================
echo Step 6 of 7: Installing Frontend Dependencies
echo ============================================================
echo.

cd /d "%~dp0frontend"

if not exist "package.json" (
    echo [ERROR] Frontend package.json not found at:
    echo %CD%
    echo.
    echo Make sure you are running this script from the rota-reader folder!
    echo.
    pause
    exit /b 1
)

echo Installing frontend packages from package.json...
echo Location: %CD%
echo This may take 3-5 minutes...
echo.

call npm install

if %errorLevel% neq 0 (
    echo.
    echo [ERROR] Failed to install frontend dependencies
    echo.
    echo Possible solutions:
    echo   1. Check your internet connection
    echo   2. Delete the 'node_modules' folder in frontend/
    echo   3. Run this script again
    echo.
    pause
    exit /b 1
)

echo [OK] Frontend dependencies installed successfully
echo.

:: =============================================================================
:: STEP 7: START APPLICATION
:: =============================================================================
echo ============================================================
echo Step 7 of 7: Starting Application
echo ============================================================
echo.

:: Return to root directory
cd /d "%~dp0"

echo Starting Backend Server...
echo Location: %~dp0backend
start "Rota Reader - Backend Server" cmd /k "cd /d "%~dp0backend" && echo ============================================================ && echo   BACKEND SERVER RUNNING && echo ============================================================ && echo. && echo Server is running. Keep this window open! && echo. && echo To stop: Press Ctrl+C or close this window && echo. && npm start"

:: Wait for backend to initialize
echo Waiting for backend to start...
timeout /t 5 /nobreak >nul

echo.
echo Starting Frontend Server...
echo Location: %~dp0frontend
start "Rota Reader - Frontend Server" cmd /k "cd /d "%~dp0frontend" && echo ============================================================ && echo   FRONTEND SERVER RUNNING && echo ============================================================ && echo. && echo Server is running. Keep this window open! && echo. && echo To stop: Press Ctrl+C or close this window && echo. && npm start"

:: Wait for frontend to initialize
echo Waiting for frontend to compile and start...
echo This may take 30-60 seconds on first run...
timeout /t 15 /nobreak >nul

:: Open browser
echo.
echo Opening browser...
start http://localhost:4200

echo.
echo ============================================================
echo   APPLICATION STARTED SUCCESSFULLY!
echo ============================================================
echo.
echo Frontend URL: http://localhost:4200
echo.
echo Two command windows have been opened:
echo   1. "Rota Reader - Backend Server"
echo   2. "Rota Reader - Frontend Server"
echo.
echo [IMPORTANT] Keep both windows open while using the application!
echo.
echo To STOP the application:
echo   - Close both command windows, or
echo   - Press Ctrl+C in each window
echo.
echo To START again later:
echo   - Simply double-click 'install-and-run.bat'
echo   - No administrator rights needed after first install
echo.
echo You can close this window now.
echo ============================================================
echo.
pause

:: Clean up downloaded files
if exist "%DOWNLOAD_DIR%" (
    echo Cleaning up temporary files...
    rmdir /s /q "%DOWNLOAD_DIR%" 2>nul
)

exit /b 0

:: =============================================================================
:: FUNCTION: Refresh Environment Variables
:: =============================================================================
:RefreshEnv
echo Refreshing system environment variables...
:: Refresh PATH from registry
for /f "skip=2 tokens=2*" %%a in ('reg query "HKLM\SYSTEM\CurrentControlSet\Control\Session Manager\Environment" /v PATH 2^>nul') do set "SYS_PATH=%%b"
for /f "skip=2 tokens=2*" %%a in ('reg query "HKCU\Environment" /v PATH 2^>nul') do set "USER_PATH=%%b"
set "PATH=%SYS_PATH%;%USER_PATH%;C:\Program Files\nodejs\"
goto :eof