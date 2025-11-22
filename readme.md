# 🎯 Rota Reader - Complete Setup Guide

Welcome! This guide will help you install and run the Rota Reader application on your computer.

**No technical knowledge required** - just follow the simple steps below for your operating system.

---

## 📁 Project Structure

After downloading, your `rota-reader` folder should look like this:

```
rota-reader/
├── windows-installer.bat     ← Windows: Double-click this file
├── linux-installer.sh        ← Linux/Mac: Run this script
├── stop-app.sh               ← Created after first run (Linux/Mac only)
├── README-FOR-USERS.md       ← This file
├── VERSIONS.md               ← Technical version info
├── frontend/                 ← Frontend application files
│   ├── package.json
│   ├── src/
│   └── (other Angular files)
├── backend/                  ← Backend server files
│   ├── package.json
│   ├── src/
│   └── (other TypeScript files)
└── diagrams/                 ← Documentation diagrams
```

---

## 🪟 WINDOWS USERS - Complete Instructions

### Prerequisites
- Windows 7 or newer
- Internet connection (for downloading Node.js)
- Administrator access (required for first-time installation)

### Step 1: Locate the Installer

1. Open the `rota-reader` folder
2. Find the file named `windows-installer.bat`

### Step 2: Run as Administrator (FIRST TIME ONLY)

1. **Right-click** on `windows-installer.bat`
2. Select **"Run as administrator"** from the menu
3. If you see "Windows protected your PC" popup:
   - Click **"More info"**
   - Click **"Run anyway"**
4. If User Account Control asks "Do you want to allow this app to make changes?":
   - Click **"Yes"**

### Step 3: Installation Process

A black window (Command Prompt) will open showing progress:

```
============================================================
  ROTA READER - Automatic Setup and Launch
============================================================

Step 1: Checking Node.js installation
[INSTALL] Node.js not found. Installing Node.js v20.17.0...
Downloading Node.js installer...
Installing Node.js (this may take a few minutes)...

Step 2: Checking npm installation
[OK] npm is installed

Step 3: Installing TypeScript globally
[INSTALL] Installing TypeScript v5.5.2...

Step 4: Installing Angular CLI globally
[INSTALL] Installing Angular CLI v18.2.7...

Step 5: Installing Backend Dependencies
Installing backend packages...

Step 6: Installing Frontend Dependencies
Installing frontend packages...

Step 7: Starting Application
Starting Backend Server...
Starting Frontend Server...
Opening browser...
```

**⏱️ Time Required:**
- **First run**: 5-10 minutes (downloads and installs everything)
- **Subsequent runs**: 10-30 seconds (just starts the app)

### Step 4: Using the Application

When installation completes:

1. **Two black windows will open**:
   - "Rota Reader - Backend" (runs the server)
   - "Rota Reader - Frontend" (runs the web interface)

2. **Your default web browser will automatically open** to:
   ```
   http://localhost:4200
   ```

3. **You're ready!** Start using Rota Reader

⚠️ **IMPORTANT**: Keep both black windows open while using the application!

### Step 5: Stopping the Application

When you're done:
1. Close the browser tab/window
2. Close **both** black Command Prompt windows:
   - "Rota Reader - Backend"
   - "Rota Reader - Frontend"

Or press `Ctrl + C` in each window, then close them.

### Starting the Application Again

After the first installation:
1. Simply **double-click** `windows-installer.bat` (no admin rights needed)
2. The app will start in 10-30 seconds
3. Browser will open automatically

---

## 🍎 MAC USERS - Complete Instructions

### Prerequisites
- macOS 10.13 (High Sierra) or newer
- Internet connection
- Administrator password

### Step 1: Open Terminal

**Option A - Using Spotlight:**
1. Press `Cmd + Space` (Command and Spacebar together)
2. Type `Terminal`
3. Press `Enter`

**Option B - Using Finder:**
1. Open **Finder**
2. Go to **Applications** → **Utilities**
3. Double-click **Terminal**

### Step 2: Navigate to the Project Folder

In Terminal, type (replace the path with where you saved the folder):

```bash
cd ~/Downloads/rota-reader
```

Or if it's on your Desktop:

```bash
cd ~/Desktop/rota-reader
```

**💡 Tip**: You can drag the folder from Finder into Terminal to auto-fill the path!

### Step 3: Make the Script Executable

Copy and paste this command, then press Enter:

```bash
chmod +x mac-installer.sh
```

This is a one-time step to give the script permission to run.

### Step 4: Run the Installer

Copy and paste this command, then press Enter:

```bash
./mac-installer.sh
```

### Step 5: Enter Your Password

When prompted:
```
Password:
```

1. Type your Mac password
2. **You won't see anything as you type** - this is normal for security!
3. Press `Enter`

### Step 6: Installation Process

The Terminal will show progress messages:

```
============================================================
  ROTA READER - Automatic Setup and Launch
============================================================

Detected platform: mac

============================================================
Step 1: Checking Node.js installation
============================================================
[INSTALL] Node.js not found. Installing Node.js v20.17.0...
Using Homebrew to install Node.js...

(or if Homebrew isn't installed:)
Homebrew not found. Installing Homebrew first...

============================================================
Step 2: Checking npm installation
============================================================
[OK] npm is installed

============================================================
Step 3: Installing TypeScript globally
============================================================
[INSTALL] Installing TypeScript v5.5.2...

============================================================
Step 4: Installing Angular CLI globally
============================================================
[INSTALL] Installing Angular CLI v18.2.7...

============================================================
Step 5: Installing Backend Dependencies
============================================================
Installing backend packages...

============================================================
Step 6: Installing Frontend Dependencies
============================================================
Installing frontend packages...

============================================================
Step 7: Starting Application
============================================================
Starting Backend Server...
Backend PID: 12345
Starting Frontend Server...
Frontend PID: 12346
Opening browser...

============================================================
  APPLICATION STARTED SUCCESSFULLY!
============================================================
```

**⏱️ Time Required:**
- **First run**: 10-15 minutes (installs Homebrew if needed, Node.js, and all packages)
- **Subsequent runs**: 10-30 seconds

### Step 7: Using the Application

When installation completes:

1. **Safari (or your default browser) will open** to:
   ```
   http://localhost:4200
   ```

2. The Terminal window stays open and shows:
   - Backend PID (Process ID)
   - Frontend PID
   - Log file locations

3. **You're ready!** Start using Rota Reader

⚠️ **IMPORTANT**: Keep the Terminal window open while using the application!

### Step 8: Stopping the Application

**Option A - Using the stop script (RECOMMENDED):**

1. Open a new Terminal window
2. Navigate to the folder:
   ```bash
   cd ~/Downloads/rota-reader
   ```
3. Run:
   ```bash
   bash stop-app.sh
   ```

**Option B - Manual stop:**

In the Terminal window where the app is running:
1. Press `Ctrl + C`
2. Type the kill commands shown in the terminal
3. Close the Terminal window

### Starting the Application Again

After first installation:

1. Open Terminal
2. Navigate to the folder:
   ```bash
   cd ~/Downloads/rota-reader
   ```
3. Run:
   ```bash
   ./mac-installer.sh
   ```
4. The app will start in 10-30 seconds

---

## 🐧 LINUX USERS - Complete Instructions

### Prerequisites
- Ubuntu 18.04+ / Debian 9+ / Fedora 28+ or similar
- Internet connection
- sudo privileges

### Step 1: Open Terminal

Press `Ctrl + Alt + T`

Or search for "Terminal" in your application menu.

### Step 2: Navigate to the Project Folder

```bash
cd ~/Downloads/rota-reader
```

Or wherever you extracted the folder.

### Step 3: Make the Script Executable

```bash
chmod +x mac-installer.sh
```

### Step 4: Run the Installer with sudo

```bash
sudo bash mac-installer.sh
```

### Step 5: Enter Your Password

When prompted, type your Linux password and press Enter.

### Step 6: Installation Process

You'll see similar output to macOS:

```
============================================================
  ROTA READER - Automatic Setup and Launch
============================================================

Detected platform: linux

============================================================
Step 1: Checking Node.js installation
============================================================
[INSTALL] Node.js not found. Installing Node.js v20.17.0...
Installing Node.js via NodeSource repository...

(Installation continues through all 7 steps...)
```

**⏱️ Time Required:**
- **First run**: 5-10 minutes
- **Subsequent runs**: 10-30 seconds

### Step 7: Using the Application

The browser will open to `http://localhost:4200` automatically.

### Step 8: Stopping the Application

```bash
cd ~/Downloads/rota-reader
bash stop-app.sh
```

### Starting Again

```bash
cd ~/Downloads/rota-reader
sudo bash mac-installer.sh
```

---

## ✅ What Gets Installed

The installer will automatically install:

| Software | Version | Purpose |
|----------|---------|---------|
| **Node.js** | 20.17.0 | JavaScript runtime |
| **npm** | ~10.8.x | Package manager (bundled with Node.js) |
| **TypeScript** | 5.5.2 | Programming language |
| **Angular CLI** | 18.2.7 | Frontend build tool |
| **Project dependencies** | Various | Application requirements |

All software is installed to standard system locations and can be uninstalled later if needed.

---

## 🌐 Accessing the Application

Once started, the application is available at:

```
http://localhost:4200
```

**What is localhost?**
- This means the application runs on YOUR computer only
- Not accessible from other devices
- No internet connection needed after installation
- All data stays on your computer

---

## ❓ Troubleshooting

### Windows: "Access is denied" or "Permission denied"

**Solution**: Right-click `windows-installer.bat` and select "Run as administrator"

### Windows: "Windows protected your PC" message

**Solution**:
1. Click "More info"
2. Click "Run anyway"

### Mac: "Permission denied" error

**Solution**: Make sure you ran:
```bash
chmod +x mac-installer.sh
```

### Mac: "Homebrew installation failed"

**Solution**: Install Homebrew manually first:
1. Go to https://brew.sh/
2. Copy the installation command
3. Paste in Terminal and run
4. Run the installer script again

### Linux: "sudo: command not found"

**Solution**: Log in as root or contact your system administrator

### "Port 4200 is already in use"

**Solution**:
1. Another application is using port 4200
2. Stop that application
3. Or restart your computer
4. Run the installer again

### Browser doesn't open automatically

**Solution**: Manually open your browser and go to:
```
http://localhost:4200
```

### Application won't start after installation

**Solution**:
1. Restart your computer
2. Run the installer again
3. Check the troubleshooting steps for your OS above

### Installation is very slow

**Solution**:
- First installation can take 10-15 minutes depending on internet speed
- Make sure you have a stable internet connection
- Don't close the terminal/command window during installation

### "Node.js installation failed"

**Manual Installation**:
1. Go to https://nodejs.org/
2. Download the **LTS version** (20.x)
3. Install it
4. Run the Rota Reader installer script again

### Application crashes or shows errors

**Solution**:
1. Stop the application completely
2. Delete these folders (if they exist):
   - `rota-reader/frontend/node_modules`
   - `rota-reader/backend/node_modules`
3. Run the installer again (it will reinstall everything)

---

## 🔍 Checking Installation Success

After installation, you can verify everything is installed correctly:

### Windows (Command Prompt):
```cmd
node --version
npm --version
tsc --version
ng version
```

### Mac/Linux (Terminal):
```bash
node --version
npm --version
tsc --version
ng version
```

**Expected Output:**
```
v20.17.0              (Node.js)
10.8.x                (npm - version may vary slightly)
Version 5.5.2         (TypeScript)
Angular CLI: 18.2.7   (Angular)
```

---

## 🗑️ Uninstalling

If you want to remove the application:

### Remove the Application
Simply delete the `rota-reader` folder.

### Remove Installed Software (Optional)

**Windows:**
1. Go to Settings → Apps
2. Find and uninstall:
   - Node.js
3. TypeScript and Angular CLI will be removed with Node.js

**Mac:**
```bash
brew uninstall node
npm uninstall -g typescript @angular/cli
```

**Linux:**
```bash
sudo apt remove nodejs
npm uninstall -g typescript @angular/cli
```

---

## 📞 Getting Help

If you encounter problems not covered here:

1. ✅ Check the troubleshooting section above
2. ✅ Make sure you followed all steps for your operating system
3. ✅ Try restarting your computer and running the installer again
4. ✅ Check the `VERSIONS.md` file for technical details

When reporting issues, please include:
- Your operating system (Windows/Mac/Linux)
- Which step you're stuck on
- Any error messages you see (take screenshots!)
- Output from the version check commands above

---

## 📝 Important Notes

- ✅ **First run takes longer** - Be patient during initial setup
- ✅ **Keep terminal/command windows open** - They must stay open while using the app
- ✅ **Internet required** - Only for the initial installation
- ✅ **Subsequent starts are fast** - After first setup, starting takes seconds
- ✅ **Safe to use** - All software is from official sources
- ✅ **Your data stays private** - Everything runs locally on your computer

---

## 🎉 Success Checklist

You'll know everything is working when:

- ✅ Installation completes without errors
- ✅ Two windows/processes are running (Backend and Frontend)
- ✅ Browser opens to `http://localhost:4200`
- ✅ You see the Rota Reader interface
- ✅ No error messages in the terminal/command windows

**Congratulations! You're ready to use Rota Reader!** 🚀

---

## 📚 Additional Resources

- `VERSIONS.md` - Technical details about installed software versions
- `frontend/` - Frontend application source code
- `backend/` - Backend server source code
- `diagrams/` - Project documentation and diagrams

---
