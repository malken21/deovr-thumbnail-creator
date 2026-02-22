declare global {
  interface Window {
    /** Electronメインプロセスとの通信ブリッジ */
    electron: {
      /** 実行中のOSプラットフォーム */
      platform: NodeJS.Platform
      /**
       * ファイル保存ダイアログを表示する
       * @param defaultName デフォルトのファイル名
       */
      showSaveDialog: (defaultName: string) => Promise<{
        canceled: boolean
        filePath?: string
      }>
      /**
       * 指定されたパスにファイルを保存する
       * @param filePath 保存先のフルパス
       * @param base64Data 保存する画像のBase64データ
       */
      saveFile: (filePath: string, base64Data: string) => Promise<{
        success: boolean
        error?: string
      }>
    }
  }
}

export {}
