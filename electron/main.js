const { app, BrowserWindow } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const isDev = process.env.NODE_ENV === 'development';

let mainWindow;
let nextServer;

// Copy directory recursively
function copyDirSync(src, dest) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirSync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// Check if server is ready
function checkServer(url, timeout = 30000) {
  return new Promise((resolve) => {
    const startTime = Date.now();
    const check = () => {
      http.get(url, (res) => {
        if (res.statusCode === 200) {
          console.log('✅ Server is ready!');
          resolve(true);
        } else {
          retry();
        }
      }).on('error', retry);
    };
    
    const retry = () => {
      if (Date.now() - startTime < timeout) {
        setTimeout(check, 500);
      } else {
        console.log('❌ Server timeout');
        resolve(false);
      }
    };
    
    check();
  });
}

async function startNextServer() {
  return new Promise((resolve) => {
    const appPath = app.getAppPath();
    const isPackaged = app.isPackaged;
    
    console.log('🚀 Starting Next.js server...');
    console.log('   Packaged:', isPackaged);
    console.log('   App path:', appPath);
    
    if (isPackaged) {
      // In production, use standalone server (no asar, direct access)
      const appRoot = path.join(process.resourcesPath, 'app');
      const standalonePath = path.join(appRoot, '.next', 'standalone');
      const serverPath = path.join(standalonePath, 'server.js');
      
      console.log('   App Root:', appRoot);
      console.log('   Server:', serverPath);
      console.log('   CWD:', standalonePath);
      
      // Copy required files for Next.js standalone
      const staticSource = path.join(appRoot, '.next', 'static');
      const staticDest = path.join(standalonePath, '.next', 'static');
      const publicSource = path.join(appRoot, 'public');
      const publicDest = path.join(standalonePath, 'public');
      
      console.log('   📂 Checking files...');
      console.log('   Static source exists?', fs.existsSync(staticSource));
      console.log('   Static dest exists?', fs.existsSync(staticDest));
      console.log('   Public source exists?', fs.existsSync(publicSource));
      console.log('   Public dest exists?', fs.existsSync(publicDest));
      
      console.log('   Copying static files...');
      if (!fs.existsSync(staticDest) && fs.existsSync(staticSource)) {
        copyDirSync(staticSource, staticDest);
        console.log('   ✓ Static files copied');
      } else if (!fs.existsSync(staticSource)) {
        console.error('   ❌ Static source not found!');
      } else {
        console.log('   ℹ️ Static files already exist');
      }
      
      console.log('   Copying public files...');
      if (!fs.existsSync(publicDest) && fs.existsSync(publicSource)) {
        copyDirSync(publicSource, publicDest);
        console.log('   ✓ Public files copied');
      } else if (!fs.existsSync(publicSource)) {
        console.error('   ❌ Public source not found!');
      } else {
        console.log('   ℹ️ Public files already exist');
      }
      
      // Use Node.js from standalone's own node_modules or system node
      nextServer = spawn('node', [serverPath], {
        cwd: standalonePath,
        env: {
          ...process.env,
          NODE_ENV: 'production',
          PORT: '3000',
          HOSTNAME: '0.0.0.0'
        },
        shell: false
      });
    } else {
      // Development - Next.js dev server should already be running
      resolve();
      return;
    }

    nextServer.stdout.on('data', (data) => {
      console.log(`[Next.js] ${data}`);
    });

    nextServer.stderr.on('data', (data) => {
      console.error(`[Next.js Error] ${data}`);
    });

    nextServer.on('error', (error) => {
      console.error('❌ Failed to start server:', error);
      resolve();
    });

    nextServer.on('exit', (code) => {
      console.log(`Server exited with code ${code}`);
    });

    // Wait a bit then resolve
    setTimeout(resolve, 3000);
  });
}

async function createWindow() {
  if (!isDev) {
    await startNextServer();
    const serverReady = await checkServer('http://localhost:3000');
    if (!serverReady) {
      console.error('Server failed to start!');
    }
  }

  mainWindow = new BrowserWindow({
    width: 1600,
    height: 1000,
    backgroundColor: '#000000',
    show: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
      webSecurity: false,
    },
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  const url = 'http://localhost:3000';
  console.log('📱 Loading:', url);
  
  mainWindow.loadURL(url).catch(err => {
    console.error('Failed to load:', err);
    mainWindow.loadURL(`data:text/html,<html><body style="background:#000;color:#fff;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh"><div style="text-align:center"><h1>Failed to start Editor AI</h1><p>Server connection error</p><p style="color:#666;font-size:12px">${err.message}</p></div></body></html>`);
  });

  // DevTools only in development
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (nextServer) {
    nextServer.kill();
  }
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.on('quit', () => {
  if (nextServer) {
    nextServer.kill();
  }
});
