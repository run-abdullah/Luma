import { For, Show, createSignal, createEffect } from 'solid-js'
import { FiFileText, FiPlus, FiMoreVertical, FiEdit2, FiTrash2, FiX, FiChevronRight } from './Icons'
import { selectedCollectionId, collections, selectedNoteId, setSelectedNoteId, setCollections, vault } from '../store/atoms'
import { GetNotes, GetCollections } from '../../wailsjs/go/main/App'
import type { Note } from '../store/atoms'
import ContextMenu from './ContextMenu'
import CreateNoteModal from './CreateNoteModal'
import RenameNoteModal from './RenameNoteModal'
import DeleteNoteModal from './DeleteNoteModal'
import Loader from './Loader'

export default function RightSidebar() {
  const [notes, setNotes] = createSignal<Note[]>([])
  const [isOpen, setIsOpen] = createSignal(true)
  const [width, setWidth] = createSignal(250)
  const [isResizing, setIsResizing] = createSignal(false)
  const [showCreateModal, setShowCreateModal] = createSignal(false)
  const [showRenameModal, setShowRenameModal] = createSignal(false)
  const [showDeleteModal, setShowDeleteModal] = createSignal(false)
  const [selectedNote, setSelectedNote] = createSignal<Note | null>(null)
  const [contextMenu, setContextMenu] = createSignal<{x: number, y: number, note: Note} | null>(null)
  const [loading, setLoading] = createSignal(false)

  const selectedCollection = () =>
    collections.find(c => c.id === selectedCollectionId())

  const hasSubCollections = () => {
    const collection = selectedCollection()
    if (!collection) return false
    return collections.some(c => c.parentId === collection.id)
  }

  createEffect(() => {
    const collection = selectedCollection()
    if (collection && collection.hasNotes && !hasSubCollections()) {
      loadNotes(collection.path)
    } else {
      setNotes([])
    }
  })

  const loadNotes = async (path: string) => {
    setLoading(true)
    try {
      const fetchedNotes = await GetNotes(path)
      const sortedNotes = (fetchedNotes || []).sort((a, b) => {
        return a.title.localeCompare(b.title, undefined, {
          numeric: true,
          sensitivity: 'base'
        })
      })
      setNotes(sortedNotes)
    } catch (error) {
      console.error('Failed to load notes:', error)
    } finally {
      setLoading(false)
    }
  }

  const refreshTree = async () => {
    try {
      const cols = await GetCollections(vault.path)
      setCollections(cols || [])
    } catch (error) {
      console.error('Failed to refresh collections:', error)
    }
  }

  const handleNoteClick = (note: Note) => {
    setSelectedNoteId(note.id)
  }

  const handleContextMenu = (e: MouseEvent, note: Note) => {
    e.preventDefault()
    e.stopPropagation()
    setContextMenu({ x: e.clientX, y: e.clientY, note })
  }

  const startResize = (e: MouseEvent) => {
    e.preventDefault()
    setIsResizing(true)

    const onMouseMove = (e: MouseEvent) => {
      const newWidth = window.innerWidth - e.clientX
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

  const menuItems = () => {
    const note = contextMenu()?.note
    if (!note) return []

    return [
      {
        label: 'Open',
        icon: <FiFileText class="w-4 h-4" />,
        action: () => handleNoteClick(note)
      },
      {
        label: 'Rename',
        icon: <FiEdit2 class="w-4 h-4" />,
        action: () => {
          setSelectedNote(note)
          setShowRenameModal(true)
        }
      },
      {
        label: 'Delete',
        icon: <FiTrash2 class="w-4 h-4" />,
        action: () => {
          setSelectedNote(note)
          setShowDeleteModal(true)
        },
        danger: true
      }
    ]
  }

  return (
    <>
      {/* Collapsed State */}
      <Show when={!isOpen()}>
        <div class="w-10 bg-bg-secondary border-l border-border-subtle flex items-start justify-center pt-4 shrink-0">
          <button
            onClick={() => setIsOpen(true)}
            class="p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-tertiary transition-colors"
            title="Open concepts panel"
          >
            <FiChevronRight class="w-4 h-4" />
          </button>
        </div>
      </Show>

      {/* Open State */}
      <Show when={isOpen() && selectedCollection() && !hasSubCollections()}>
        <aside
          class="bg-bg-secondary border-l border-border-subtle flex flex-col h-full relative shrink-0"
          style={{ width: `${width()}px` }}
        >
          {/* Header */}
          <div class="p-4 border-b border-border-subtle shrink-0">
            <div class="flex items-center justify-between gap-2">
              <div class="min-w-0">
                <h3 class="text-sm font-semibold text-text-primary truncate">
                  {selectedCollection()?.name}
                </h3>
                <p class="text-xs text-text-muted mt-0.5">
                  {notes().length} concepts
                </p>
              </div>
              <div class="flex items-center gap-1">
                <button
                  onClick={() => setShowCreateModal(true)}
                  class="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-tertiary transition-colors"
                  title="New Concept"
                >
                  <FiPlus class="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  class="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-tertiary transition-colors"
                  title="Close panel"
                >
                  <FiX class="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Notes List */}
          <div class="flex-1 overflow-y-auto p-3 space-y-2">
            <Show when={!loading()} fallback={<Loader />}>
              <Show when={notes().length > 0} fallback={
                <div class="text-center py-8 text-text-muted">
                  <FiFileText class="w-10 h-10 mx-auto mb-2 text-text-muted/30" />
                  <p class="text-xs">No concepts yet</p>
                </div>
              }>
                <For each={notes()}>
                  {(note) => (
                    <div
                      onClick={() => handleNoteClick(note)}
                      onContextMenu={(e) => handleContextMenu(e, note)}
                      class={`group rounded-xl border transition-all cursor-pointer
                        ${selectedNoteId() === note.id
                          ? 'border-accent bg-bg-elevated'
                          : 'border-border-subtle bg-bg-tertiary/50 hover:bg-bg-tertiary'
                        }`}
                    >
                      <div class="p-3">
                        <div class="flex items-start gap-2.5">
                          <div class={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0
                            ${selectedNoteId() === note.id ? 'bg-accent/20' : 'bg-accent/10'}`}
                          >
                            <FiFileText class={`w-4 h-4 ${selectedNoteId() === note.id ? 'text-accent' : 'text-text-muted'}`} />
                          </div>
                          <div class="flex-1 min-w-0">
                            <p class={`text-sm truncate mb-1
                              ${selectedNoteId() === note.id ? 'text-text-primary font-medium' : 'text-text-secondary'}`}
                            >
                              {note.title}
                            </p>
                            <p class="text-xs text-text-muted">
                              {new Date(note.updatedAt).toLocaleDateString()}
                            </p>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
                              setContextMenu({ x: rect.left, y: rect.bottom + 4, note })
                            }}
                            class="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-bg-elevated text-text-muted hover:text-text-primary transition-all shrink-0"
                          >
                            <FiMoreVertical class="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </For>
              </Show>
            </Show>
          </div>

          {/* Resize Handle */}
          <div
            onMouseDown={startResize}
            class={`absolute left-0 top-0 w-1 h-full cursor-col-resize hover:bg-accent/50 transition-colors ${isResizing() ? 'bg-accent' : ''}`}
          />
        </aside>
      </Show>

      <ContextMenu
        isOpen={!!contextMenu()}
        x={contextMenu()?.x || 0}
        y={contextMenu()?.y || 0}
        items={menuItems()}
        onClose={() => setContextMenu(null)}
      />

      <CreateNoteModal
        isOpen={showCreateModal()}
        onClose={() => setShowCreateModal(false)}
        collectionPath={selectedCollection()?.path || ''}
        onNoteCreated={async (note) => {
          setNotes([note, ...notes()])
          await refreshTree()
        }}
      />

      <RenameNoteModal
        isOpen={showRenameModal()}
        onClose={() => setShowRenameModal(false)}
        note={selectedNote()}
        onNoteRenamed={async (updatedNote, oldNoteId) => {
          setNotes(notes().map(n => n.id === oldNoteId ? updatedNote : n))
          if (selectedNoteId() === oldNoteId) {
            setSelectedNoteId(updatedNote.id)
          }
          await refreshTree()
        }}
      />

      <DeleteNoteModal
        isOpen={showDeleteModal()}
        onClose={() => setShowDeleteModal(false)}
        note={selectedNote()}
        onNoteDeleted={async (deletedNoteId) => {
          setNotes(notes().filter(n => n.id !== deletedNoteId))
          if (selectedNoteId() === deletedNoteId) {
            setSelectedNoteId(null)
          }
          await refreshTree()
          const collection = selectedCollection()
          if (collection) {
            await loadNotes(collection.path)
          }
        }}
      />
    </>
  )
}
