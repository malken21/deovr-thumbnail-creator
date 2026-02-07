import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electron', {
  platform: process.platform,
  showSaveDialog: (defaultName: string) => ipcRenderer.invoke('show-save-dialog', defaultName),
  saveFile: (filePath: string, base64Data: string) => ipcRenderer.invoke('save-file', filePath, base64Data)
})
