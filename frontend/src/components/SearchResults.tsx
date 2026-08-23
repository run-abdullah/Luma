import { For, Show, createSignal, createEffect } from 'solid-js'
import { FiFileText, FiX, FiSearch } from './Icons'
import { searchQuery, setSearchQuery, vault, setSelectedNoteId, setSelectedCollectionId } from '../store/atoms'
import { SearchNotes } from '../../wailsjs/go/main/App'
import type { Note } from '../store/atoms'

export default function SearchResults() {
  const [results, setResults] = createSignal<Note[]>([])
  const [loading, setLoading] = createSignal(false)
  const [showResults, setShowResults] = createSignal(false)

  createEffect(async () => {
    const searchTerm = searchQuery().trim()

    if (!searchTerm || !vault.path) {
      setResults([])
      setShowResults(false)
      return
    }

    setLoading(true)
    setShowResults(true)

    try {
      const searchResults = await SearchNotes(vault.path, searchTerm)
      setResults(searchResults || [])
    } catch (error) {
      console.error('Search failed:', error)
      setResults([])
    } finally {
      setLoading(false)
    }
  })

  const handleNoteClick = (note: Note) => {
    setSelectedNoteId(note.id)
    setSelectedCollectionId(note.path.split('/').slice(0, -1).join('/'))
    setShowResults(false)
    setSearchQuery('')
  }

  return (
    <Show when={showResults() && searchQuery().trim()}>
      <div class="fixed inset-0 z-50 bg-black/50" onClick={() => setShowResults(false)} />
      <div class="fixed top-14 left-1/2 -translate-x-1/2 w-full max-w-2xl z-50">
        <div class="bg-bg-secondary border border-border-subtle rounded-xl shadow-2xl overflow-hidden mx-4">
          <div class="flex items-center justify-between px-4 py-3 border-b border-border-subtle">
            <div class="flex items-center gap-2">
              <FiSearch class="w-4 h-4 text-text-muted" />
              <span class="text-sm text-text-secondary">
                Search results for <span class="text-text-primary font-medium">"{searchQuery()}"</span>
              </span>
            </div>
            <button
              onClick={() => setShowResults(false)}
              class="p-1 rounded hover:bg-bg-tertiary text-text-muted hover:text-text-primary transition-colors"
            >
              <FiX class="w-4 h-4" />
            </button>
          </div>

          <div class="max-h-96 overflow-y-auto">
            <Show when={!loading()} fallback={
              <div class="text-center py-8 text-text-muted">
                <div class="w-6 h-6 border-2 border-text-muted border-t-accent rounded-full animate-spin mx-auto mb-3" />
                <p class="text-sm">Searching...</p>
              </div>
            }>
              <Show when={results().length > 0} fallback={
                <div class="text-center py-8 text-text-muted">
                  <FiSearch class="w-8 h-8 mx-auto mb-2 text-text-muted/30" />
                  <p class="text-sm">No results found</p>
                </div>
              }>
                <For each={results()}>
                  {(note) => (
                    <button
                      onClick={() => handleNoteClick(note)}
                      class="w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-bg-tertiary transition-colors border-b border-border-subtle last:border-b-0"
                    >
                      <div class="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center shrink-0 mt-0.5">
                        <FiFileText class="w-4 h-4 text-accent" />
                      </div>
                      <div class="flex-1 min-w-0">
                        <p class="text-sm font-medium text-text-primary truncate">
                          {note.title}
                        </p>
                        <p class="text-xs text-text-muted mt-0.5 truncate">
                          {note.path.split('/').slice(-2, -1)[0]}
                        </p>
                      </div>
                      <span class="text-xs text-text-muted shrink-0 mt-1">
                        {new Date(note.updatedAt).toLocaleDateString()}
                      </span>
                    </button>
                  )}
                </For>
              </Show>
            </Show>
          </div>

          <div class="px-4 py-2 border-t border-border-subtle bg-bg-tertiary/50">
            <p class="text-xs text-text-muted">
              {results().length} result{results().length !== 1 ? 's' : ''} found
            </p>
          </div>
        </div>
      </div>
    </Show>
  )
}
