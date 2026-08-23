import { createSignal } from 'solid-js'
import { createStore } from 'solid-js/store'

// Types
export interface Collection {
  id: string
  name: string
  parentId?: string
  path: string
  hasNotes: boolean
  createdAt: string
  updatedAt: string
}

export interface Note {
  id: string
  title: string
  content: any
  path: string
  createdAt: string
  updatedAt: string
}

export interface Vault {
  id: string
  name: string
  path: string
  createdAt: string
  updatedAt: string
}

// Theme Types
export interface ThemeColors {
  bgPrimary: string
  bgSecondary: string
  bgTertiary: string
  bgElevated: string
  borderSubtle: string
  borderStrong: string
  textPrimary: string
  textSecondary: string
  textMuted: string
  accent: string
  accentHover: string
}

export interface Theme {
  name: string
  colors: ThemeColors
  isDark: boolean
}

// UI state
export const [searchQuery, setSearchQuery] = createSignal<string>('')
export const [sidebarOpen, setSidebarOpen] = createSignal<boolean>(true)
export const [selectedNoteId, setSelectedNoteId] = createSignal<string | null>(null)
export const [notesList, setNotesList] = createSignal<Note[]>([])
export const [selectedCollectionId, setSelectedCollectionId] = createSignal<string | null>(null)

// Theme state
export const [currentTheme, setCurrentTheme] = createSignal<string>('purple')
export const [isDarkMode, setIsDarkMode] = createSignal<boolean>(true)
export const [showSettings, setShowSettings] = createSignal<boolean>(false)
export const [customThemes, setCustomThemes] = createSignal<Record<string, Theme>>({})

export const builtInThemes: Record<string, Theme> = {
  purple: {
    name: 'Purple Night',
    isDark: true,
    colors: {
      bgPrimary: '#0a0a0a',
      bgSecondary: '#111111',
      bgTertiary: '#1a1a1a',
      bgElevated: '#242424',
      borderSubtle: '#2a2a2a',
      borderStrong: '#333333',
      textPrimary: '#e4e4e4',
      textSecondary: '#a0a0a0',
      textMuted: '#666666',
      accent: '#7c3aed',
      accentHover: '#8b5cf6',
    }
  },
  ocean: {
    name: 'Ocean Blue',
    isDark: true,
    colors: {
      bgPrimary: '#0a0e14',
      bgSecondary: '#0f1520',
      bgTertiary: '#1a2230',
      bgElevated: '#242e40',
      borderSubtle: '#1e2a3a',
      borderStrong: '#2a3a50',
      textPrimary: '#dbeafe',
      textSecondary: '#93a4b8',
      textMuted: '#5a6a7a',
      accent: '#3b82f6',
      accentHover: '#60a5fa',
    }
  },
  forest: {
    name: 'Forest Green',
    isDark: true,
    colors: {
      bgPrimary: '#0a0f0a',
      bgSecondary: '#0f150f',
      bgTertiary: '#1a221a',
      bgElevated: '#242e24',
      borderSubtle: '#1e2a1e',
      borderStrong: '#2a3a2a',
      textPrimary: '#d1e7d1',
      textSecondary: '#8fa88f',
      textMuted: '#5a705a',
      accent: '#10b981',
      accentHover: '#34d399',
    }
  },
  sunset: {
    name: 'Sunset Orange',
    isDark: true,
    colors: {
      bgPrimary: '#0f0a0a',
      bgSecondary: '#150f0f',
      bgTertiary: '#221a1a',
      bgElevated: '#2e2424',
      borderSubtle: '#2a1e1e',
      borderStrong: '#3a2a2a',
      textPrimary: '#f5e6e0',
      textSecondary: '#b8a098',
      textMuted: '#705a55',
      accent: '#f97316',
      accentHover: '#fb923c',
    }
  },
  rose: {
    name: 'Rose Pink',
    isDark: true,
    colors: {
      bgPrimary: '#0f0a0e',
      bgSecondary: '#150f14',
      bgTertiary: '#221a20',
      bgElevated: '#2e242b',
      borderSubtle: '#2a1e26',
      borderStrong: '#3a2a35',
      textPrimary: '#f5e0ec',
      textSecondary: '#b898a8',
      textMuted: '#705a65',
      accent: '#ec4899',
      accentHover: '#f472b6',
    }
  },
  light: {
    name: 'Light',
    isDark: false,
    colors: {
      bgPrimary: '#ffffff',
      bgSecondary: '#f5f5f5',
      bgTertiary: '#e5e5e5',
      bgElevated: '#d4d4d4',
      borderSubtle: '#d4d4d4',
      borderStrong: '#a3a3a3',
      textPrimary: '#171717',
      textSecondary: '#525252',
      textMuted: '#737373',
      accent: '#7c3aed',
      accentHover: '#8b5cf6',
    }
  }
}

// Initial states
const initialVault: Vault = {
  id: '',
  name: '',
  path: '',
  createdAt: '',
  updatedAt: ''
}

// Store
export const [vault, setVault] = createStore<Vault>(initialVault)
export const [collections, setCollections] = createStore<Collection[]>([])
