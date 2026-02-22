import { app, shell, BrowserWindow, ipcMain, dialog } from 'electron'
import { join } from 'path'
import { writeFile } from 'fs/promises'

/**
 * メインウィンドウを作成・構成する関数
 */
function createWindow(): void {
  const mainWindow = new BrowserWindow({
    width: 1600,
    height: 900,
    minWidth: 1200,
    minHeight: 720,
    show: false,
    autoHideMenuBar: true,
    backgroundColor: '#09090b',
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      webSecurity: false,
      nodeIntegration: false,
      contextIsolation: true
    }
  })

  // ウィンドウの準備ができたら表示
  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  // 外部URLをブラウザで開くように設定
  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // 開発環境と製品版で読み込み元を切り替え
  if (process.env['VITE_DEV_SERVER_URL']) {
    mainWindow.loadURL(process.env['VITE_DEV_SERVER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../../dist/index.html'))
  }
}

// アプリの準備が完了した際の初期化
app.whenReady().then(() => {
  createWindow()

  // macOSでのアクティブ化処理
  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// 全てのウィンドウが閉じられた際の処理
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

/**
 * IPCハンドラ: 保存ダイアログを表示する
 */
ipcMain.handle('show-save-dialog', async (_event, defaultName: string) => {
  const result = await dialog.showSaveDialog({
    defaultPath: defaultName,
    filters: [{ name: 'PNG Image', extensions: ['png'] }]
  })
  return result
})

/**
 * IPCハンドラ: ファイルを非同期で保存する
 */
ipcMain.handle('save-file', async (_event, filePath: string, base64Data: string) => {
  try {
    // Base64データをデコードしてバッファに変換
    const data = Buffer.from(base64Data.replace(/^data:image\/png;base64,/, ''), 'base64')
    await writeFile(filePath, data)
    return { success: true }
  } catch (error) {
    return { success: false, error: String(error) }
  }
})
