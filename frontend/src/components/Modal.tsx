import { Show} from 'solid-js'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: any
}

export default function Modal(props: ModalProps) {
  return (
    <Show when={props.isOpen}>
      <div class="fixed inset-0 z-50 flex items-center justify-center">
        {/* Backdrop */}
        <div
          class="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={props.onClose}
        />

        {/* Modal Content */}
        <div class="relative bg-bg-secondary border border-border-subtle rounded-xl shadow-2xl w-full max-w-md p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-text-primary">{props.title}</h3>
            <button
              onClick={props.onClose}
              class="p-1 rounded hover:bg-bg-tertiary text-text-muted hover:text-text-primary transition-colors"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          {props.children}
        </div>
      </div>
    </Show>
  )
}
