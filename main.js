const { app, BrowserWindow, dialog, shell } = require('electron');
const path = require('path');
const { autoUpdater } = require('electron-updater');
const { execFile } = require('child_process');
const fs = require('fs');
app.commandLine.appendSwitch("enable-media-stream");

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    icon: path.join(__dirname, 'build', 'icon.ico'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true,
      media: true,
    }
  });

  //  Tu pantalla principal
  win.loadFile(path.join(__dirname, 'index.html'));

  // Intercepta "window.open" (por ejemplo, enlaces con target="_blank")
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http')) {
      shell.openExternal(url); // abre en Chrome/navegador predeterminado
      return { action: 'deny' };
    }
    return { action: 'allow' };
  });

  //  Intercepta también clics o redirecciones internas
  win.webContents.on('will-navigate', (event, url) => {
    if (url.startsWith('http')) {
      event.preventDefault();
      shell.openExternal(url);
    }
  });
}

// Crear ventana y revisar actualizaciones
app.whenReady().then(() => {
  createWindow();

  // Verifica actualizaciones al iniciar
  autoUpdater.checkForUpdatesAndNotify();
});

// Eventos del autoUpdater
autoUpdater.on('update-available', () => {
  dialog.showMessageBox({
    type: 'info',
    title: 'Actualización disponible',
    message: 'Se encontró una nueva versión de Menutech. Se descargará automáticamente.'
  });
});

autoUpdater.on('update-downloaded', () => {
  dialog.showMessageBox({
    type: 'info',
    title: 'Actualización lista',
    message: 'La actualización se descargó. La aplicación se reiniciará para instalarla.'
  }).then(() => {
    autoUpdater.quitAndInstall();
  });
});

// macOS: volver a abrir si no hay ventanas
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

// Cerrar la app completamente (excepto en macOS)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
// Escuchar las solicitudes del frontend
ipcMain.on('abrir-programa', (event, nombreApp) => {
  console.log(`Intentando abrir: ${nombreApp}`);
  abrirPrograma(nombreApp);
});

// Función que busca y ejecuta el programa
function abrirPrograma(nombre) {
  const rutas = {
    '3cx': [
      'C:\\Program Files\\3CXPhone\\3CXPhone.exe',
      'C:\\Program Files (x86)\\3CXPhone\\3CXPhone.exe',
      'C:\\Program Files\\3CX\\Bin\\3CXWin8Phone.exe',
      'C:\\Program Files (x86)\\3CX\\Bin\\3CXWin8Phone.exe'
    ],
    'word': [
      'C:\\Program Files\\Microsoft Office\\root\\Office16\\WINWORD.EXE',
      'C:\\Program Files (x86)\\Microsoft Office\\Office16\\WINWORD.EXE'
    ],
    'excel': [
      'C:\\Program Files\\Microsoft Office\\root\\Office16\\EXCEL.EXE',
      'C:\\Program Files (x86)\\Microsoft Office\\Office16\\EXCEL.EXE'
    ]
  };

  const posibles = rutas[nombre.toLowerCase()];
  if (!posibles) {
    console.error(' No hay rutas configuradas para:', nombre);
    dialog.showErrorBox('No encontrado', `No hay rutas definidas para la aplicación "${nombre}".`);
    return;
  }

  let encontrado = null;
  for (const ruta of posibles) {
    if (fs.existsSync(ruta)) {
      encontrado = ruta;
      break;
    }
  }

  if (encontrado) {
    console.log(' Ejecutando:', encontrado);
    execFile(encontrado, (err) => {
      if (err) console.error('Error al abrir:', err);
    });
  } else {
    console.error(` No se encontró "${nombre}" en ninguna ruta`);
    dialog.showErrorBox('No encontrado', `No se encontró la aplicación "${nombre}" en esta PC.`);
  }
}
