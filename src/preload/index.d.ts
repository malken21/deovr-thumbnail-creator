declare global {
  interface Window {
    electron: {
      platform: NodeJS.Platform
      showSaveDialog: (defaultName: string) => Promise<{
        canceled: boolean
        filePath?: string
      }>
      saveFile: (filePath: string, base64Data: string) => Promise<{
        success: boolean
        error?: string
      }>
    }
  }
}

export {}
