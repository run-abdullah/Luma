import { For, Show, createSignal } from 'solid-js'
import { FiFolder, FiFolderPlus, FiMoreVertical, FiChevronRight, FiEdit2, FiTrash2 } from '../Icons'
import { collections, selectedCollectionId, setSelectedCollectionId } from '../../store/atoms'
import type { Collection } from '../../store/atoms'
import ContextMenu from '../ContextMenu'
import CreateCollectionModal from '../CreateCollectionModal'
import RenameCollectionModal from '../RenameCollectionModal'
import DeleteCollectionModal from '../DeleteCollectionModal'

interface Props {
  collection: Collection
  level: number
}

export default function CollectionItem(props: Props) {
  const [isExpanded, setIsExpanded] = createSignal(true)
  const [contextMenu, setContextMenu] = createSignal<{x: number, y: number} | null>(null)
  const [showCreateModal, setShowCreateModal] = createSignal(false)
  const [showRenameModal, setShowRenameModal] = createSignal(false)
  const [showDeleteModal, setShowDeleteModal] = createSignal(false)

  const children = () => {
    return collections
      .filter(c => c.parentId === props.collection.id)
      .sort((a, b) => {
        return a.name.localeCompare(b.name, undefined, {
          numeric: true,
          sensitivity: 'base'
        })
      })
  }
  const menuItems = () => {
    if (props.collection.hasNotes) {
      return [
        {
          label: 'Rename',
          icon: <FiEdit2 class="w-4 h-4" />,
          action: () => setShowRenameModal(true)
        },
        {
          label: 'Delete',
          icon: <FiTrash2 class="w-4 h-4" />,
          action: () => setShowDeleteModal(true),
          danger: true
        }
      ]
    }

    return [
      {
        label: 'New Sub-collection',
        icon: <FiFolderPlus class="w-4 h-4" />,
        action: () => setShowCreateModal(true)
      },
      {
        label: 'Rename',
        icon: <FiEdit2 class="w-4 h-4" />,
        action: () => setShowRenameModal(true)
      },
      {
        label: 'Delete',
        icon: <FiTrash2 class="w-4 h-4" />,
        action: () => setShowDeleteModal(true),
        danger: true
      }
    ]
  }

  return (
    <div>
      <div class={`group flex items-center rounded-lg ${selectedCollectionId() === props.collection.id ? 'bg-bg-elevated' : 'hover:bg-bg-tertiary'}`}
        style={`padding-left: ${props.level * 12}px`}>

        <button onClick={() => setIsExpanded(!isExpanded())}
          class={`p-1 rounded hover:bg-bg-elevated transition-transform ${children().length ? '' : 'opacity-0 pointer-events-none'} ${isExpanded() ? 'rotate-90' : ''}`}>
          <FiChevronRight class="w-3 h-3 text-text-muted" />
        </button>

        <button onClick={() => setSelectedCollectionId(props.collection.id)} class="flex-1 flex items-center gap-2 py-2 pr-2 text-left">
          <FiFolder class={`w-4 h-4 shrink-0 ${props.collection.hasNotes ? 'text-accent' : 'text-text-muted'}`} />
          <span class={`text-sm truncate ${selectedCollectionId() === props.collection.id ? 'text-text-primary font-medium' : 'text-text-secondary'}`}>
            {props.collection.name}
          </span>
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation()
            const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
            setContextMenu({ x: rect.left, y: rect.bottom + 4 })
          }}
          class="hidden group-hover:block p-1 rounded hover:bg-bg-elevated text-text-muted hover:text-text-primary"
        >
          <FiMoreVertical class="w-3.5 h-3.5" />
        </button>
      </div>

      <Show when={isExpanded() && children().length > 0}>
        <For each={children()}>
          {(child) => <CollectionItem collection={child} level={props.level + 1} />}
        </For>
      </Show>

      <ContextMenu
        isOpen={!!contextMenu()}
        x={contextMenu()?.x || 0}
        y={contextMenu()?.y || 0}
        items={menuItems()}
        onClose={() => setContextMenu(null)}
      />

      <CreateCollectionModal
        isOpen={showCreateModal()}
        onClose={() => setShowCreateModal(false)}
        parentPath={props.collection.path}
      />

      <RenameCollectionModal
        isOpen={showRenameModal()}
        onClose={() => setShowRenameModal(false)}
        collectionPath={props.collection.path}
        currentName={props.collection.name}
      />

      <DeleteCollectionModal
        isOpen={showDeleteModal()}
        onClose={() => setShowDeleteModal(false)}
        collectionPath={props.collection.path}
        collectionName={props.collection.name}
      />
    </div>
  )
}
