const { app, BrowserWindow } = require('electron');
const path = require('path');
const { autoUpdater } = require('electron-updater');

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    icon: path.join(__dirname, 'build', 'icon.ico'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  win.loadFile('./index.html'); // tu archivo principal
}

app.whenReady().then(createWindow);
// Verificar si hay actualizaciones disponibles
  autoUpdater.checkForUpdatesAndNotify();
  // 🔹 En macOS: vuelve a crear ventana si no hay ninguna abierta
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
