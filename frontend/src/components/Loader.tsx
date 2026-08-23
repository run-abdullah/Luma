import { createSignal, onMount, onCleanup } from 'solid-js'

export default function Loader() {
  const [dots, setDots] = createSignal('')

  onMount(() => {
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.')
    }, 300)

    onCleanup(() => clearInterval(interval))
  })

  return (
    <div class="flex flex-col items-center justify-center py-12">
      <div class="relative">
        <div class="w-14 h-14 rounded-xl bg-accent/10 flex items-center justify-center">
          <svg class="w-7 h-7 text-accent animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <div class="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-accent animate-ping" />
      </div>
      <p class="mt-4 text-sm text-text-muted">
        Loading{dots()}
      </p>
    </div>
  )
}
