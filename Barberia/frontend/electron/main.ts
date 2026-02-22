import { app, BrowserWindow } from 'electron';
import * as path from 'path';

const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1000,
    minHeight: 700,
    icon: path.join(__dirname, '../../../image/Logo.jpeg'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
      webSecurity: !isDev, // Habilitado en producción, deshabilitado en dev
      allowRunningInsecureContent: false,
    },
    titleBarStyle: 'default',
    show: false, // No mostrar hasta que esté listo
    resizable: true,
    center: true,
  });

  // Cargar la aplicación
  if (isDev) {
    // Abrir DevTools antes de cargar para ver errores
    mainWindow.webContents.openDevTools();
    
    // Esperar un poco para que el servidor esté listo
    setTimeout(() => {
      mainWindow.loadURL('http://localhost:5173').catch((err) => {
        console.error('Error loading URL:', err);
        mainWindow.webContents.executeJavaScript(`
          document.body.innerHTML = '<div style="padding: 20px; color: white;"><h1>Error cargando la aplicación</h1><p>Verifica que el servidor de desarrollo esté corriendo en http://localhost:5173</p><p>Error: ${err.message}</p></div>';
        `);
      });
    }, 2000);
  } else {
    mainWindow.loadFile(path.join(__dirname, '../../../dist/index.html'));
  }

  // Manejar errores de carga
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.error('Failed to load:', errorCode, errorDescription);
    if (isDev) {
      // Reintentar después de un delay
      setTimeout(() => {
        mainWindow.loadURL('http://localhost:5173').catch((err) => {
          console.error('Retry failed:', err);
        });
      }, 2000);
    }
  });

  // Mostrar ventana cuando esté lista
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Log cuando la página se carga correctamente
  mainWindow.webContents.on('did-finish-load', () => {
    console.log('Page loaded successfully');
  });

  // Manejar cierre de ventana
  mainWindow.on('closed', () => {
    // En macOS, las apps normalmente se mantienen activas
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });
}

// Este método se llamará cuando Electron haya terminado de inicializarse
app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    // En macOS, es común recrear una ventana cuando se hace clic en el icono del dock
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Salir cuando todas las ventanas estén cerradas, excepto en macOS
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
