import { createSignal, Show } from 'solid-js'
import Modal from './Modal'
import { CreateNote } from '../../wailsjs/go/main/App'
import type { Note } from '../store/atoms'

interface Props {
  isOpen: boolean
  onClose: () => void
  collectionPath: string
  onNoteCreated: (note: Note) => void
}

export default function CreateNoteModal(props: Props) {
  const [title, setTitle] = createSignal('')
  const [error, setError] = createSignal('')
  const [loading, setLoading] = createSignal(false)

  const handleCreate = async (e?: Event) => {
    e?.preventDefault()

    if (!title().trim()) {
      setError('Title is required')
      return
    }

    setLoading(true)
    setError('')

    try {
      const newNote = await CreateNote(props.collectionPath, title().trim())
      if (newNote) {
        props.onNoteCreated(newNote)
      }
      setTitle('')
      props.onClose()
    } catch (err) {
      setError('Failed to create note')
      console.error('Create note error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal isOpen={props.isOpen} onClose={props.onClose} title="New Concept">
      <form onSubmit={handleCreate} class="space-y-4">
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
            type="button"
            onClick={props.onClose}
            class="px-4 py-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-tertiary transition-colors text-sm"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading()}
            class="px-4 py-2 rounded-lg bg-accent text-white hover:bg-accent-hover transition-colors text-sm disabled:opacity-50"
          >
            {loading() ? 'Creating...' : 'Create'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
