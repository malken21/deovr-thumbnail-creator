import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import { translations, languageNames, availableLanguages, type Language } from '../locales'

const LANGUAGE_KEY = 'deovr-thumbnail-language'

/**
 * ネストされたオブジェクトからキー（例: "app.title"）を使用して値を取得する
 */
function getNestedValue(obj: Record<string, unknown>, path: string): string {
  const keys = path.split('.')
  let result: unknown = obj

  for (const key of keys) {
    if (result && typeof result === 'object' && key in result) {
      result = (result as Record<string, unknown>)[key]
    } else {
      return path
    }
  }

  return typeof result === 'string' ? result : path
}

interface I18nContextValue {
  /** 現在選択されている言語コード */
  language: Language
  /** 言語を切り替える */
  setLanguage: (lang: Language) => void
  /** 翻訳キーに対応するテキストを取得する */
  t: (key: string) => string
  /** 各言語の表示名マップ */
  languageNames: typeof languageNames
  /** 利用可能な言語の一覧 */
  availableLanguages: typeof availableLanguages
}

const I18nContext = createContext<I18nContextValue | null>(null)

/** 初期表示時の言語を決定する（localStorageから取得、なければデフォルト 'en'） */
function getInitialLanguage(): Language {
  try {
    const stored = localStorage.getItem(LANGUAGE_KEY)
    if (stored && availableLanguages.includes(stored as Language)) {
      return stored as Language
    }
  } catch {
    // localStorageが使えない場合（ブラウザ設定等）
  }
  return 'en'
}

/**
 * 翻訳機能を提供するコンテキストプロバイダー
 */
export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(getInitialLanguage)

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang)
    try {
      localStorage.setItem(LANGUAGE_KEY, lang)
    } catch {
      // localStorageが使えない場合
    }
  }, [])

  const t = useCallback(
    (key: string): string => {
      return getNestedValue(translations[language] as unknown as Record<string, unknown>, key)
    },
    [language]
  )

  return (
    <I18nContext.Provider value={{ language, setLanguage, t, languageNames, availableLanguages }}>
      {children}
    </I18nContext.Provider>
  )
}

/**
 * 翻訳ツールを使用するためのカスタムフック
 */
export function useI18n() {
  const context = useContext(I18nContext)
  if (!context) {
    throw new Error('useI18n must be used within I18nProvider')
  }
  return context
}
