import { contextBridge, ipcRenderer } from 'electron'

// レンダラープロセスに公開するAPI（electron-bridge）
contextBridge.exposeInMainWorld('electron', {
  /** 実行プラットフォーム (win32, darwin, linux) */
  platform: process.platform,
  /** 保存ダイアログを表示する */
  showSaveDialog: (defaultName: string) => ipcRenderer.invoke('show-save-dialog', defaultName),
  /** ファイルを書き出す */
  saveFile: (filePath: string, base64Data: string) => ipcRenderer.invoke('save-file', filePath, base64Data)
})
