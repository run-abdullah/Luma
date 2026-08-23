import { createSignal, Show } from 'solid-js'
import Modal from './Modal'
import { DeleteNote } from '../../wailsjs/go/main/App'
import type { Note } from '../store/atoms'

interface Props {
  isOpen: boolean
  onClose: () => void
  note: Note | null
  onNoteDeleted: (noteId: string) => void
}

export default function DeleteNoteModal(props: Props) {
  const [error, setError] = createSignal('')
  const [loading, setLoading] = createSignal(false)

  const handleDelete = async () => {
    if (!props.note) return

    setLoading(true)
    setError('')

    try {
      await DeleteNote(props.note.path)
      props.onNoteDeleted(props.note.id)
      props.onClose()
    } catch (err) {
      setError('Failed to delete note')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal isOpen={props.isOpen} onClose={props.onClose} title="Delete Concept">
      <div class="space-y-4">
        <div class="flex items-start gap-3">
          <div class="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center shrink-0">
            <svg class="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </div>
          <div>
            <p class="text-sm text-text-primary">
              Are you sure you want to delete <span class="font-semibold">"{props.note?.title}"</span>?
            </p>
            <p class="text-xs text-text-muted mt-1">
              This will permanently delete this concept file.
            </p>
          </div>
        </div>

        <Show when={error()}>
          <p class="text-xs text-red-400">{error()}</p>
        </Show>

        <div class="flex justify-end gap-2">
          <button
            onClick={props.onClose}
            class="px-4 py-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-tertiary transition-colors text-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={loading()}
            class="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors text-sm disabled:opacity-50"
          >
            {loading() ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </Modal>
  )
}
