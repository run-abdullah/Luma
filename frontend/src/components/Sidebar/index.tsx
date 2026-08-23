import { For, Show, createMemo, createSignal } from 'solid-js'
import { FiShield, FiFolderOpen } from '../Icons'
import CollectionItem from './CollectionItem'
import { vault, collections, sidebarOpen, setVault, setCollections } from '../../store/atoms'
import { ImportVault, GetCollections } from "../../../wailsjs/go/main/App";

export default function Sidebar() {
  const [width, setWidth] = createSignal(300)
  const [isResizing, setIsResizing] = createSignal(false)

  const rootCollections = createMemo(() =>
    collections.filter(c => !c.parentId || c.parentId === "")
  )

  const handleImportVault = async () => {
    try {
      const importedVault = await ImportVault()
      if (importedVault) {
        setVault(importedVault)
        const cols = await GetCollections(importedVault.path)
        setCollections(cols || [])
      }
    } catch (error) {
      console.error('Failed to import vault:', error)
    }
  }

  const startResize = (e: MouseEvent) => {
    e.preventDefault()
    setIsResizing(true)

    const onMouseMove = (e: MouseEvent) => {
      const newWidth = e.clientX
      if (newWidth >= 200 && newWidth <= 500) {
        setWidth(newWidth)
      }
    }

    const onMouseUp = () => {
      setIsResizing(false)
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
    }

    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
  }

  return (
    <Show when={sidebarOpen()}>
      <aside
        class="bg-bg-secondary border-r border-border-subtle flex flex-col h-full relative shrink-0"
        style={{ width: `${width()}px` }}
      >
        {/* Vault Header */}
        <div class="p-4 border-b border-border-subtle flex items-center gap-2 shrink-0">
          <div class="w-6 h-6 rounded bg-accent/20 flex items-center justify-center">
            <FiShield class="w-3.5 h-3.5 text-accent" />
          </div>
          <div class="flex-1 min-w-0">
            <h2 class="text-sm font-semibold text-text-primary truncate">{vault.name}</h2>
            <p class="text-xs text-text-muted">{collections.length} collections</p>
          </div>
        </div>

        {/* Collections Tree */}
        <div class="flex-1 overflow-y-auto py-2 px-2 space-y-0.5">
          <Show when={rootCollections().length > 0} fallback={
            <div class="text-center py-8 text-text-muted">
              <p class="text-3xl mb-2">📂</p>
              <p class="text-sm">No collections yet</p>
            </div>
          }>
            <For each={rootCollections()}>
              {(collection) => <CollectionItem collection={collection} level={0} />}
            </For>
          </Show>
        </div>

        {/* Open Vault Button */}
        <div class="p-3 border-t border-border-subtle shrink-0">
          <button
            onClick={handleImportVault}
            class="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-bg-tertiary text-text-secondary hover:text-text-primary hover:bg-bg-elevated transition-colors text-sm"
          >
            <FiFolderOpen class="w-4 h-4" />
            Open Vault
          </button>
        </div>

        {/* Resize Handle */}
        <div
          onMouseDown={startResize}
          class={`absolute right-0 top-0 w-1 h-full cursor-col-resize hover:bg-accent/50 transition-colors ${isResizing() ? 'bg-accent' : ''}`}
        />
      </aside>
    </Show>
  )
}
