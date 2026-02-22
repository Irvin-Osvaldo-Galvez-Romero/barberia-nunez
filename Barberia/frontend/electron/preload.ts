import { contextBridge } from 'electron';

// Exponer APIs seguras al renderer process
contextBridge.exposeInMainWorld('electronAPI', {
  // Aquí puedes agregar APIs específicas de Electron si las necesitas
  platform: process.platform,
});
