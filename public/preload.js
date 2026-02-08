import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  openFile: () => ipcRenderer.invoke('open-file-dialog'),
  exportReport: (data) => ipcRenderer.invoke('export-report', data),
  getAppVersion: () => '1.0.0',
});
