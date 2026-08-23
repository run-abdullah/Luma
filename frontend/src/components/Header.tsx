import { searchQuery, setSearchQuery, sidebarOpen, setSidebarOpen, setShowSettings } from '../store/atoms'
import { FiSearch, FiMenu, FiSettings } from './Icons'
import SearchResults from './SearchResults'

export default function Header() {
  return (
    <>
      <header class="h-14 bg-bg-secondary border-b border-border-subtle flex items-center px-4 gap-3 shrink-0 relative z-50">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen())}
          class="p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-tertiary transition-colors"
          aria-label="Toggle sidebar"
        >
          <FiMenu class="w-5 h-5" />
        </button>

        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
            <span class="text-white font-bold text-lg">L</span>
          </div>
          <span class="text-text-primary font-semibold text-lg tracking-tight">Luma</span>
        </div>

        <div class="flex-1 max-w-xl mx-auto">
          <div class="relative">
            <FiSearch class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              value={searchQuery()}
              onInput={(e) => setSearchQuery(e.currentTarget.value)}
              placeholder="Search concepts..."
              class="w-full pl-9 pr-4 py-2 bg-bg-tertiary text-text-primary placeholder-text-muted rounded-lg border border-transparent focus:border-accent focus:outline-none transition-colors text-sm"
            />
          </div>
        </div>

        <button
          onClick={() => setShowSettings(true)}
          class="p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-tertiary transition-colors"
          title="Settings"
        >
          <FiSettings class="w-5 h-5" />
        </button>
      </header>

      <SearchResults />
    </>
  )
}
