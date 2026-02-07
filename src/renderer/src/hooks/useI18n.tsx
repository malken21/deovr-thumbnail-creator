import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import { translations, languageNames, availableLanguages, type Language } from '../locales'

const LANGUAGE_KEY = 'deovr-thumbnail-language'

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
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
  languageNames: typeof languageNames
  availableLanguages: typeof availableLanguages
}

const I18nContext = createContext<I18nContextValue | null>(null)

function getInitialLanguage(): Language {
  try {
    const stored = localStorage.getItem(LANGUAGE_KEY)
    if (stored && availableLanguages.includes(stored as Language)) {
      return stored as Language
    }
  } catch {
    // localStorage not available
  }
  return 'en'
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(getInitialLanguage)

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang)
    try {
      localStorage.setItem(LANGUAGE_KEY, lang)
    } catch {
      // localStorage not available
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

export function useI18n() {
  const context = useContext(I18nContext)
  if (!context) {
    throw new Error('useI18n must be used within I18nProvider')
  }
  return context
}
