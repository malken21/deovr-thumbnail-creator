import { AppShell } from './components/layout/AppShell'
import { SidebarLeft } from './components/layout/SidebarLeft'
import { SidebarRight } from './components/layout/SidebarRight'
import { SceneContainer } from './components/viewer/SceneContainer'
import { I18nProvider } from './hooks/useI18n'

/**
 * アプリケーションのルートコンポーネント
 * I18nProviderで多言語対応を適用し、AppShellでレイアウトを構築する
 */
function App() {
  return (
    <I18nProvider>
      <AppShell
        leftSidebar={<SidebarLeft />}
        mainContent={<SceneContainer />}
        rightSidebar={<SidebarRight />}
      />
    </I18nProvider>
  )
}

export default App
