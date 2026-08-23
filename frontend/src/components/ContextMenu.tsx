import { Show, For, createEffect, createSignal } from 'solid-js'

interface ContextMenuItem {
  label: string
  icon: any
  action: () => void
  danger?: boolean
  disabled?: boolean
}

interface ContextMenuProps {
  isOpen: boolean
  x: number
  y: number
  items: ContextMenuItem[]
  onClose: () => void
}

export default function ContextMenu(props: ContextMenuProps) {
  const [position, setPosition] = createSignal({ x: 0, y: 0 })
  const MENU_WIDTH = 180
  const MENU_ITEM_HEIGHT = 36
  const PADDING = 8

  createEffect(() => {
    if (props.isOpen) {
      let x = props.x
      let y = props.y

      // Menu height calculate karo
      const menuHeight = props.items.length * MENU_ITEM_HEIGHT + PADDING

      // Right edge se bahar na jaye
      if (x + MENU_WIDTH > window.innerWidth) {
        x = window.innerWidth - MENU_WIDTH - PADDING
      }

      // Bottom edge se bahar na jaye
      if (y + menuHeight > window.innerHeight) {
        y = window.innerHeight - menuHeight - PADDING
      }

      // Left edge se bahar na jaye
      if (x < PADDING) {
        x = PADDING
      }

      // Top edge se bahar na jaye
      if (y < PADDING) {
        y = PADDING
      }

      setPosition({ x, y })
    }
  })

  return (
    <Show when={props.isOpen}>
      <div class="fixed inset-0 z-40" onClick={props.onClose} />
      <div
        class="fixed z-50 bg-bg-secondary border border-border-subtle rounded-lg shadow-xl py-1"
        style={{
          left: `${position().x}px`,
          top: `${position().y}px`,
          'min-width': `${MENU_WIDTH}px`,
          'max-width': '200px'
        }}
      >
        <For each={props.items}>
          {(item) => (
            <button
              onClick={() => {
                if (!item.disabled) {
                  item.action()
                  props.onClose()
                }
              }}
              disabled={item.disabled}
              class={`w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors
                ${item.disabled
                  ? 'opacity-50 cursor-not-allowed'
                  : item.danger
                    ? 'text-red-400 hover:bg-red-500/10'
                    : 'text-text-secondary hover:bg-bg-tertiary hover:text-text-primary'
                }`}
            >
              {item.icon}
              {item.label}
            </button>
          )}
        </For>
      </div>
    </Show>
  )
}
