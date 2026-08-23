import { onMount, Show } from 'solid-js'
import Header from './components/Header'
import Sidebar from './components/Sidebar'
import RightSidebar from './components/RightSidebar'
import Editor from './components/Editor'
import SettingsPage from './components/SettingsPage'
import { showSettings, builtInThemes, customThemes, setCustomThemes, setCurrentTheme, setIsDarkMode } from './store/atoms'

export default function Home() {
  onMount(() => {
    const savedTheme = localStorage.getItem('luma-theme')
    const savedCustomThemes = localStorage.getItem('luma-custom-themes')

    if (savedCustomThemes) {
      try {
        setCustomThemes(JSON.parse(savedCustomThemes))
      } catch (e) {
        console.error('Failed to load custom themes:', e)
      }
    }

    if (savedTheme) {
      const allThemes = {
        ...builtInThemes,
        ...customThemes()
      }

      const themeData = allThemes[savedTheme]
      if (themeData) {
        setCurrentTheme(savedTheme)
        setIsDarkMode(themeData.isDark)

        const root = document.documentElement
        Object.entries(themeData.colors).forEach(([key, value]) => {
          const cssVar = '--' + key.replace(/([A-Z])/g, '-$1').toLowerCase()
          root.style.setProperty(cssVar, value)
        })
      }
    }
  })

  return (
    <div class="h-screen flex flex-col">
      <Header />
      <div class="flex-1 flex overflow-hidden">
        <Sidebar />
        <Editor />
        <RightSidebar />
      </div>
      <Show when={showSettings()}>
        <SettingsPage />
      </Show>
    </div>
  )
}
