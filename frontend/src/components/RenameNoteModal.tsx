import { createSignal, Show, createEffect } from 'solid-js'
import Modal from './Modal'
import { RenameNote } from '../../wailsjs/go/main/App'
import type { Note } from '../store/atoms'

interface Props {
  isOpen: boolean
  onClose: () => void
  note: Note | null
  onNoteRenamed: (updatedNote: Note, oldNoteId: string) => void
}

export default function RenameNoteModal(props: Props) {
  const [title, setTitle] = createSignal('')
  const [error, setError] = createSignal('')
  const [loading, setLoading] = createSignal(false)
  const [oldNoteId, setOldNoteId] = createSignal('')

  // Jab note change ho toh title aur old ID update karo
  createEffect(() => {
    if (props.note) {
      setTitle(props.note.title)
      setOldNoteId(props.note.id)
    }
  })

  const handleRename = async () => {
    if (!title().trim()) {
      setError('Title is required')
      return
    }

    if (!props.note) return

    if (title().trim() === props.note.title) {
      props.onClose()
      return
    }

    setLoading(true)
    setError('')

    try {
      const updatedNote = await RenameNote(props.note.path, title().trim())
      if (updatedNote) {
        props.onNoteRenamed(updatedNote, oldNoteId())
      }
      props.onClose()
    } catch (err) {
      setError('Failed to rename note')
      console.error('Rename error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal isOpen={props.isOpen} onClose={props.onClose} title="Rename Concept">
      <div class="space-y-4">
        <div>
          <label class="block text-sm text-text-secondary mb-1">Concept Title</label>
          <input
            type="text"
            value={title()}
            onInput={(e) => setTitle(e.currentTarget.value)}
            placeholder="Enter concept title..."
            class="w-full px-3 py-2 bg-bg-tertiary text-text-primary placeholder-text-muted rounded-lg border border-border-subtle focus:border-accent focus:outline-none transition-colors text-sm"
            autofocus
          />
          <Show when={error()}>
            <p class="text-xs text-red-400 mt-1">{error()}</p>
          </Show>
        </div>

        <div class="flex justify-end gap-2">
          <button
            onClick={props.onClose}
            class="px-4 py-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-tertiary transition-colors text-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleRename}
            disabled={loading()}
            class="px-4 py-2 rounded-lg bg-accent text-white hover:bg-accent-hover transition-colors text-sm disabled:opacity-50"
          >
            {loading() ? 'Renaming...' : 'Rename'}
          </button>
        </div>
      </div>
    </Modal>
  )
}
