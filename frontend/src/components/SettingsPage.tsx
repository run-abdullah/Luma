import { For, Show, createSignal, onMount, createMemo } from 'solid-js'
import {
  currentTheme, setCurrentTheme, isDarkMode, setIsDarkMode,
  builtInThemes, customThemes, setCustomThemes,
  setShowSettings
} from '../store/atoms'
import type { Theme } from '../store/atoms'
import { FiX, FiPlus, FiTrash2, FiCheck, FiMoon, FiSun, FiChevronDown, FiChevronUp } from './Icons'

export default function SettingsPage() {
  const [showAddTheme, setShowAddTheme] = createSignal(false)
  const [newThemeName, setNewThemeName] = createSignal('')
  const [newThemeMode, setNewThemeMode] = createSignal<'dark' | 'light'>('dark')

  // Multiple color choices
  const [newAccentColor, setNewAccentColor] = createSignal('#7c3aed')
  const [newBgPrimary, setNewBgPrimary] = createSignal('#0a0a0a')
  const [newBgSecondary, setNewBgSecondary] = createSignal('#111111')
  const [newBgTertiary, setNewBgTertiary] = createSignal('#1a1a1a')
  const [newTextPrimary, setNewTextPrimary] = createSignal('#e4e4e4')

  const [showAdvancedColors, setShowAdvancedColors] = createSignal(false)

  const allThemes = createMemo(() => {
    const themes: Record<string, Theme> = {}
    Object.assign(themes, builtInThemes)
    Object.assign(themes, customThemes())
    return themes
  })

  const themeEntries = createMemo(() => {
    return Object.entries(allThemes())
  })

  const applyTheme = (themeName: string) => {
    const themeData = allThemes()[themeName]
    if (!themeData) return

    setCurrentTheme(themeName)
    setIsDarkMode(themeData.isDark)

    const root = document.documentElement
    const colors = themeData.colors

    Object.entries(colors).forEach(([key, value]) => {
      const cssVar = '--' + key.replace(/([A-Z])/g, '-$1').toLowerCase()
      root.style.setProperty(cssVar, value)
    })

    localStorage.setItem('luma-theme', themeName)
  }

  const addCustomTheme = () => {
    const name = newThemeName().trim()
    if (!name) return

    const themeKey = name.toLowerCase().replace(/\s+/g, '-')
    const isDark = newThemeMode() === 'dark'

    const newTheme: Theme = {
      name: name,
      isDark: isDark,
      colors: {
        bgPrimary: newBgPrimary(),
        bgSecondary: newBgSecondary(),
        bgTertiary: newBgTertiary(),
        bgElevated: isDark ? '#242424' : '#d4d4d4',
        borderSubtle: isDark ? '#2a2a2a' : '#d4d4d4',
        borderStrong: isDark ? '#333333' : '#a3a3a3',
        textPrimary: newTextPrimary(),
        textSecondary: isDark ? '#a0a0a0' : '#525252',
        textMuted: isDark ? '#666666' : '#737373',
        accent: newAccentColor(),
        accentHover: newAccentColor(),
      }
    }

    const updated = {
      ...customThemes(),
      [themeKey]: newTheme
    }

    setCustomThemes(updated)
    localStorage.setItem('luma-custom-themes', JSON.stringify(updated))

    setNewThemeName('')
    setShowAddTheme(false)
    setShowAdvancedColors(false)
  }

  const removeCustomTheme = (themeKey: string) => {
    const updated = { ...customThemes() }
    delete updated[themeKey]
    setCustomThemes(updated)
    localStorage.setItem('luma-custom-themes', JSON.stringify(updated))
  }

  onMount(() => {
    const savedTheme = localStorage.getItem('luma-theme')
    if (savedTheme) {
      applyTheme(savedTheme)
    }

    const savedCustomThemes = localStorage.getItem('luma-custom-themes')
    if (savedCustomThemes) {
      try {
        setCustomThemes(JSON.parse(savedCustomThemes))
      } catch (e) {
        console.error('Failed to load custom themes:', e)
      }
    }
  })

  return (
    <div class="fixed inset-0 z-50 bg-bg-primary overflow-y-auto">
      <div class="sticky top-0 bg-bg-secondary border-b border-border-subtle px-6 py-4 flex items-center justify-between">
        <h1 class="text-xl font-semibold text-text-primary">Settings</h1>
        <button
          onClick={() => setShowSettings(false)}
          class="p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-tertiary transition-colors"
        >
          <FiX class="w-5 h-5" />
        </button>
      </div>

      <div class="max-w-4xl mx-auto px-6 py-8 space-y-8">
        {/* Dark/Light Toggle */}
        <section>
          <h2 class="text-lg font-semibold text-text-primary mb-4">Appearance</h2>
          <div class="flex items-center justify-between bg-bg-secondary rounded-xl p-4 border border-border-subtle">
            <div class="flex items-center gap-3">
              <Show when={isDarkMode()} fallback={<FiSun class="w-5 h-5 text-accent" />}>
                <FiMoon class="w-5 h-5 text-accent" />
              </Show>
              <div>
                <p class="text-sm font-medium text-text-primary">Dark Mode</p>
                <p class="text-xs text-text-muted">Toggle dark/light appearance</p>
              </div>
            </div>
            <button
              onClick={() => {
                const newMode = !isDarkMode()
                setIsDarkMode(newMode)
                if (newMode) {
                  applyTheme('purple')
                } else {
                  applyTheme('light')
                }
              }}
              class={`w-12 h-6 rounded-full transition-colors relative
                ${isDarkMode() ? 'bg-accent' : 'bg-bg-tertiary'}`}
            >
              <div class={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform
                ${isDarkMode() ? 'translate-x-6' : 'translate-x-0.5'}`}
              />
            </button>
          </div>
        </section>

        {/* Themes Section */}
        <section>
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg font-semibold text-text-primary">Themes</h2>
            <button
              onClick={() => setShowAddTheme(!showAddTheme())}
              class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent text-white text-sm hover:bg-accent-hover transition-colors"
            >
              <Show when={showAddTheme()} fallback={<FiPlus class="w-4 h-4" />}>
                <FiX class="w-4 h-4" />
              </Show>
              {showAddTheme() ? 'Cancel' : 'Add Theme'}
            </button>
          </div>

          {/* Add Theme Form */}
          <Show when={showAddTheme()}>
            <div class="bg-bg-secondary rounded-xl p-5 border border-border-subtle mb-4 space-y-4">
              {/* Theme Name */}
              <div>
                <label class="block text-sm text-text-secondary mb-1.5">Theme Name</label>
                <input
                  type="text"
                  value={newThemeName()}
                  onInput={(e) => setNewThemeName(e.currentTarget.value)}
                  placeholder="My Custom Theme..."
                  class="w-full px-3 py-2 bg-bg-tertiary text-text-primary placeholder-text-muted rounded-lg border border-border-subtle focus:border-accent focus:outline-none text-sm"
                />
              </div>

              {/* Theme Mode */}
              <div>
                <label class="block text-sm text-text-secondary mb-1.5">Theme Mode</label>
                <div class="flex gap-2">
                  <button
                    onClick={() => setNewThemeMode('dark')}
                    class={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors
                      ${newThemeMode() === 'dark'
                        ? 'bg-accent text-white'
                        : 'bg-bg-tertiary text-text-secondary hover:bg-bg-elevated'}`}
                  >
                    <FiMoon class="w-4 h-4" />
                    Dark
                  </button>
                  <button
                    onClick={() => setNewThemeMode('light')}
                    class={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors
                      ${newThemeMode() === 'light'
                        ? 'bg-accent text-white'
                        : 'bg-bg-tertiary text-text-secondary hover:bg-bg-elevated'}`}
                  >
                    <FiSun class="w-4 h-4" />
                    Light
                  </button>
                </div>
              </div>

              {/* Basic Colors */}
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-sm text-text-secondary mb-1.5">Accent Color</label>
                  <div class="flex items-center gap-2">
                    <input
                      type="color"
                      value={newAccentColor()}
                      onInput={(e) => setNewAccentColor(e.currentTarget.value)}
                      class="w-10 h-10 rounded-lg cursor-pointer bg-transparent border border-border-subtle"
                    />
                    <span class="text-xs text-text-muted">{newAccentColor()}</span>
                  </div>
                </div>
                <div>
                  <label class="block text-sm text-text-secondary mb-1.5">Text Color</label>
                  <div class="flex items-center gap-2">
                    <input
                      type="color"
                      value={newTextPrimary()}
                      onInput={(e) => setNewTextPrimary(e.currentTarget.value)}
                      class="w-10 h-10 rounded-lg cursor-pointer bg-transparent border border-border-subtle"
                    />
                    <span class="text-xs text-text-muted">{newTextPrimary()}</span>
                  </div>
                </div>
              </div>

              {/* Advanced Colors Toggle */}
              <button
                onClick={() => setShowAdvancedColors(!showAdvancedColors())}
                class="flex items-center gap-1.5 text-sm text-text-secondary hover:text-text-primary transition-colors"
              >
                <Show when={showAdvancedColors()} fallback={<FiChevronDown class="w-4 h-4" />}>
                  <FiChevronUp class="w-4 h-4" />
                </Show>
                Advanced Colors
              </button>

              {/* Advanced Colors */}
              <Show when={showAdvancedColors()}>
                <div class="grid grid-cols-2 gap-3 pt-2 border-t border-border-subtle">
                  <div>
                    <label class="block text-sm text-text-secondary mb-1.5">Background Primary</label>
                    <div class="flex items-center gap-2">
                      <input
                        type="color"
                        value={newBgPrimary()}
                        onInput={(e) => setNewBgPrimary(e.currentTarget.value)}
                        class="w-10 h-10 rounded-lg cursor-pointer bg-transparent border border-border-subtle"
                      />
                      <span class="text-xs text-text-muted">{newBgPrimary()}</span>
                    </div>
                  </div>
                  <div>
                    <label class="block text-sm text-text-secondary mb-1.5">Background Secondary</label>
                    <div class="flex items-center gap-2">
                      <input
                        type="color"
                        value={newBgSecondary()}
                        onInput={(e) => setNewBgSecondary(e.currentTarget.value)}
                        class="w-10 h-10 rounded-lg cursor-pointer bg-transparent border border-border-subtle"
                      />
                      <span class="text-xs text-text-muted">{newBgSecondary()}</span>
                    </div>
                  </div>
                  <div>
                    <label class="block text-sm text-text-secondary mb-1.5">Background Tertiary</label>
                    <div class="flex items-center gap-2">
                      <input
                        type="color"
                        value={newBgTertiary()}
                        onInput={(e) => setNewBgTertiary(e.currentTarget.value)}
                        class="w-10 h-10 rounded-lg cursor-pointer bg-transparent border border-border-subtle"
                      />
                      <span class="text-xs text-text-muted">{newBgTertiary()}</span>
                    </div>
                  </div>
                </div>
              </Show>

              {/* Save Button */}
              <button
                onClick={addCustomTheme}
                disabled={!newThemeName().trim()}
                class="w-full px-4 py-2.5 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save Theme
              </button>
            </div>
          </Show>

          {/* Themes Grid */}
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <For each={themeEntries()}>
              {([key, themeData]) => (
                <div
                  class={`rounded-xl border p-4 transition-all cursor-pointer
                    ${currentTheme() === key
                      ? 'border-accent bg-bg-secondary'
                      : 'border-border-subtle bg-bg-secondary/50 hover:bg-bg-secondary'
                    }`}
                >
                  <div onClick={() => applyTheme(key)}>
                    <div class="flex gap-2 mb-3">
                      <div class="w-8 h-8 rounded-lg border border-border-subtle" style={{ background: themeData.colors.bgPrimary }} />
                      <div class="w-8 h-8 rounded-lg border border-border-subtle" style={{ background: themeData.colors.bgSecondary }} />
                      <div class="w-8 h-8 rounded-lg" style={{ background: themeData.colors.accent }} />
                      <div class="w-8 h-8 rounded-lg border border-border-subtle" style={{ background: themeData.colors.textPrimary }} />
                    </div>
                    <p class={`text-sm font-medium mb-1
                      ${currentTheme() === key ? 'text-text-primary' : 'text-text-secondary'}`}
                    >
                      {themeData.name}
                    </p>
                    <p class="text-xs text-text-muted">
                      {themeData.isDark ? 'Dark' : 'Light'} theme
                    </p>
                  </div>

                  <div class="flex items-center justify-between mt-3">
                    <Show when={currentTheme() === key}>
                      <FiCheck class="w-4 h-4 text-accent" />
                    </Show>

                    <Show when={!builtInThemes[key]}>
                      <button
                        onClick={() => removeCustomTheme(key)}
                        class="p-1 rounded hover:bg-bg-tertiary text-text-muted hover:text-red-400 transition-colors"
                      >
                        <FiTrash2 class="w-4 h-4" />
                      </button>
                    </Show>
                  </div>
                </div>
              )}
            </For>
          </div>
        </section>
      </div>
    </div>
  )
}
