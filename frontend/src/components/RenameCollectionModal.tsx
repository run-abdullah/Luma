import { createSignal, Show } from 'solid-js'
import Modal from './Modal'
import { setCollections, vault } from '../store/atoms'
import { RenameCollection, GetCollections } from '../../wailsjs/go/main/App'

interface Props {
  isOpen: boolean
  onClose: () => void
  collectionPath: string
  currentName: string
}

export default function RenameCollectionModal(props: Props) {
  const [name, setName] = createSignal(props.currentName)
  const [error, setError] = createSignal('')
  const [loading, setLoading] = createSignal(false)

  const handleRename = async () => {
    if (!name().trim()) {
      setError('Name is required')
      return
    }

    if (name().trim() === props.currentName) {
      props.onClose()
      return
    }

    setLoading(true)
    setError('')

    try {
      await RenameCollection(props.collectionPath, name().trim())
      const cols = await GetCollections(vault.path)
      setCollections(cols || [])
      props.onClose()
    } catch (err) {
      setError('Failed to rename collection')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal isOpen={props.isOpen} onClose={props.onClose} title="Rename Collection">
      <div class="space-y-4">
        <div>
          <label class="block text-sm text-text-secondary mb-1">Collection Name</label>
          <input
            type="text"
            value={name()}
            onInput={(e) => setName(e.currentTarget.value)}
            placeholder="Enter collection name..."
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
