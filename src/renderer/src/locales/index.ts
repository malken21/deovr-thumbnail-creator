import en from './en.json'
import ja from './ja.json'
import zh from './zh.json'
import ko from './ko.json'
import es from './es.json'

export type Language = 'en' | 'ja' | 'zh' | 'ko' | 'es'

export const translations: Record<Language, typeof en> = {
  en,
  ja,
  zh,
  ko,
  es
}

export const languageNames: Record<Language, string> = {
  en: 'English',
  ja: '日本語',
  zh: '中文',
  ko: '한국어',
  es: 'Español'
}

export const availableLanguages: Language[] = ['en', 'ja', 'zh', 'ko', 'es']
