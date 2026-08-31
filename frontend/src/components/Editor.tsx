import { createSignal, createEffect, Show, onCleanup, onMount } from 'solid-js'
import { Editor as TiptapEditor } from '@tiptap/core'
import { StarterKit } from '@tiptap/starter-kit'
import { Underline } from '@tiptap/extension-underline'
import { TextAlign } from '@tiptap/extension-text-align'
import { Placeholder } from '@tiptap/extension-placeholder'
import { Link } from '@tiptap/extension-link'
import { Image } from '@tiptap/extension-image'
import { Table } from '@tiptap/extension-table'
import { TableRow } from '@tiptap/extension-table-row'
import { TableCell } from '@tiptap/extension-table-cell'
import { TableHeader } from '@tiptap/extension-table-header'
import { Highlight } from '@tiptap/extension-highlight'
import { TaskList } from '@tiptap/extension-task-list'
import { TaskItem } from '@tiptap/extension-task-item'
import { CodeBlockLowlight } from '@tiptap/extension-code-block-lowlight'
import { createLowlight, all } from 'lowlight'
import { selectedNoteId } from '../store/atoms'
import { ReadNote, SaveNote } from '../../wailsjs/go/main/App'
import { setSelectedNoteId } from '../store/atoms'

import {
  FiBold, FiItalic, FiUnderline, FiStrikethrough, FiCode,
  FiHighlighter, FiList, FiListOrdered, FiCheckSquare,
  FiMessageSquare, FiAlignLeft, FiAlignCenter, FiAlignRight,
  FiMinus, FiTable, FiUndo, FiRedo, FiLink, FiImage, FiX,
  FiEdit2, FiEye
} from './Icons'

const lowlight = createLowlight(all)

export default function Editor() {
  const [currentNote, setCurrentNote] = createSignal<any>(null)
  const [loading, setLoading] = createSignal(false)
  const [saved, setSaved] = createSignal(true)
  const [isEditing, setIsEditing] = createSignal(false)
  let editorInstance: TiptapEditor | null = null

  const initEditor = (note: any, element: HTMLElement, editable: boolean) => {
    if (editorInstance) {
      editorInstance.destroy()
      editorInstance = null
    }

    element.innerHTML = ''

    editorInstance = new TiptapEditor({
      element: element,
      extensions: [
        StarterKit.configure({
          codeBlock: false,
        }),
        CodeBlockLowlight.configure({
          lowlight,
          defaultLanguage: 'javascript',
        }),
        Underline,
        TextAlign.configure({
          types: ['heading', 'paragraph'],
        }),
        Placeholder.configure({
          placeholder: 'Start writing your concept...',
        }),
        Link.configure({
          openOnClick: false,
          autolink: true,
        }),
        Image.configure({
          allowBase64: true,
        }),
        Table.configure({
          resizable: true,
        }),
        TableRow,
        TableCell,
        TableHeader,
        Highlight.configure({
          multicolor: true,
        }),
        TaskList,
        TaskItem.configure({
          nested: true,
        }),
      ],
      content: note?.content || '',
      editable: editable,
      editorProps: {
        attributes: {
          class: 'prose prose-invert max-w-none',
        },
      },
      onUpdate: async ({ editor }) => {
        if (!isEditing()) return

        setSaved(false)
        const json = editor.getJSON()
        try {
          await SaveNote(note.path, note.title, json)
          setSaved(true)
        } catch (error) {
          console.error('Save failed:', error)
        }
      },
    })
  }

  const handleToolbar = (action: string) => {
    const editor = editorInstance
    if (!editor || !isEditing()) return

    const chain = editor.chain().focus()

    switch (action) {
      case 'bold': chain.toggleBold().run(); break
      case 'italic': chain.toggleItalic().run(); break
      case 'underline': chain.toggleUnderline().run(); break
      case 'strike': chain.toggleStrike().run(); break
      case 'code': chain.toggleCode().run(); break
      case 'h1': chain.toggleHeading({ level: 1 }).run(); break
      case 'h2': chain.toggleHeading({ level: 2 }).run(); break
      case 'h3': chain.toggleHeading({ level: 3 }).run(); break
      case 'bullet': chain.toggleBulletList().run(); break
      case 'ordered': chain.toggleOrderedList().run(); break
      case 'task': chain.toggleTaskList().run(); break
      case 'blockquote': chain.toggleBlockquote().run(); break
      case 'codeblock': chain.toggleCodeBlock().run(); break
      case 'align-left': chain.setTextAlign('left').run(); break
      case 'align-center': chain.setTextAlign('center').run(); break
      case 'align-right': chain.setTextAlign('right').run(); break
      case 'highlight': chain.toggleHighlight().run(); break
      case 'hr': chain.setHorizontalRule().run(); break
      case 'undo': chain.undo().run(); break
      case 'redo': chain.redo().run(); break
      case 'table':
        chain.insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
        break
      case 'link':
        const url = prompt('Enter URL:')
        if (url) chain.setLink({ href: url }).run()
        break
      case 'image':
        const imgUrl = prompt('Enter image URL:')
        if (imgUrl) chain.setImage({ src: imgUrl }).run()
        break
    }
  }

  const isActive = (action: string) => {
    const editor = editorInstance
    if (!editor) return false

    switch (action) {
      case 'bold': return editor.isActive('bold')
      case 'italic': return editor.isActive('italic')
      case 'underline': return editor.isActive('underline')
      case 'strike': return editor.isActive('strike')
      case 'code': return editor.isActive('code')
      case 'h1': return editor.isActive('heading', { level: 1 })
      case 'h2': return editor.isActive('heading', { level: 2 })
      case 'h3': return editor.isActive('heading', { level: 3 })
      case 'bullet': return editor.isActive('bulletList')
      case 'ordered': return editor.isActive('orderedList')
      case 'task': return editor.isActive('taskList')
      case 'blockquote': return editor.isActive('blockquote')
      case 'codeblock': return editor.isActive('codeBlock')
      case 'align-left': return editor.isActive({ textAlign: 'left' })
      case 'align-center': return editor.isActive({ textAlign: 'center' })
      case 'align-right': return editor.isActive({ textAlign: 'right' })
      case 'highlight': return editor.isActive('highlight')
      default: return false
    }
  }

  const toggleEditMode = async () => {
    const note = currentNote()
    if (!note) return

    const newMode = !isEditing()

    if (!newMode && editorInstance) {
      const json = editorInstance.getJSON()
      await SaveNote(note.path, note.title, json)
      setSaved(true)
    }

    setIsEditing(newMode)

    setTimeout(async () => {
      const element = document.querySelector('[data-editor-container]') as HTMLElement
      if (element) {
        const freshNote = await ReadNote(note.id)
        if (freshNote) {
          setCurrentNote(freshNote)
          initEditor(freshNote, element, newMode)
        }
      }
    }, 100)
  }

  onMount(() => {
    console.log('Editor mounted')
  })

  createEffect(async () => {
    const id = selectedNoteId()
    if (!id) {
      setCurrentNote(null)
      setIsEditing(false)
      return
    }

    setLoading(true)
    const note = await ReadNote(id)
    setCurrentNote(note)
    setIsEditing(false) // Default read mode
    setLoading(false)
  })

  createEffect(() => {
    const note = currentNote()
    if (note) {
      setTimeout(() => {
        const element = document.querySelector('[data-editor-container]') as HTMLElement
        if (element) {
          initEditor(note, element, isEditing())
        }
      }, 200)
    }
  })

  onCleanup(() => {
    if (editorInstance) {
      editorInstance.destroy()
      editorInstance = null
    }
  })

  const ToolbarButton = (props: { action: string; label: string; icon: any }) => {
    return (
      <button
        onClick={() => handleToolbar(props.action)}
        disabled={!isEditing()}
        class={`p-2 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${
          isActive(props.action) && isEditing()
            ? 'bg-accent/20 text-accent'
            : 'text-text-muted hover:text-text-primary hover:bg-bg-tertiary'
        }`}
        title={props.label}
      >
        {props.icon}
      </button>
    )
  }

  return (
    <div class="flex-1 flex flex-col bg-bg-primary overflow-hidden">
      <Show when={currentNote()} fallback={
        <div class="h-full flex items-center justify-center text-text-muted">
          <div class="text-center">
            <p class="text-4xl mb-2">✍️</p>
            <p class="text-lg">Select a concept</p>
          </div>
        </div>
      }>
        <Show when={!loading()} fallback={
          <div class="h-full flex items-center justify-center text-text-muted">
            Loading...
          </div>
        }>
          <>
            {/* Toolbar - sirf edit mode mein */}
            <Show when={isEditing()}>
              <div class="bg-bg-secondary border-b border-border-subtle p-2 flex items-center gap-1 overflow-x-auto shrink-0">
                <ToolbarButton action="undo" label="Undo" icon={<FiUndo class="w-4 h-4" />} />
                <ToolbarButton action="redo" label="Redo" icon={<FiRedo class="w-4 h-4" />} />
                <div class="w-px h-6 bg-border-subtle mx-1" />

                <ToolbarButton action="h1" label="Heading 1" icon={<span class="text-xs font-bold">H1</span>} />
                <ToolbarButton action="h2" label="Heading 2" icon={<span class="text-xs font-bold">H2</span>} />
                <ToolbarButton action="h3" label="Heading 3" icon={<span class="text-xs font-bold">H3</span>} />
                <div class="w-px h-6 bg-border-subtle mx-1" />

                <ToolbarButton action="bold" label="Bold" icon={<FiBold class="w-4 h-4" />} />
                <ToolbarButton action="italic" label="Italic" icon={<FiItalic class="w-4 h-4" />} />
                <ToolbarButton action="underline" label="Underline" icon={<FiUnderline class="w-4 h-4" />} />
                <ToolbarButton action="strike" label="Strikethrough" icon={<FiStrikethrough class="w-4 h-4" />} />
                <ToolbarButton action="code" label="Code" icon={<FiCode class="w-4 h-4" />} />
                <ToolbarButton action="highlight" label="Highlight" icon={<FiHighlighter class="w-4 h-4" />} />
                <div class="w-px h-6 bg-border-subtle mx-1" />

                <ToolbarButton action="bullet" label="Bullet List" icon={<FiList class="w-4 h-4" />} />
                <ToolbarButton action="ordered" label="Ordered List" icon={<FiListOrdered class="w-4 h-4" />} />
                <ToolbarButton action="task" label="Task List" icon={<FiCheckSquare class="w-4 h-4" />} />
                <ToolbarButton action="blockquote" label="Blockquote" icon={<FiMessageSquare class="w-4 h-4" />} />
                <ToolbarButton action="codeblock" label="Code Block" icon={<FiCode class="w-4 h-4" />} />
                <div class="w-px h-6 bg-border-subtle mx-1" />

                <ToolbarButton action="align-left" label="Align Left" icon={<FiAlignLeft class="w-4 h-4" />} />
                <ToolbarButton action="align-center" label="Align Center" icon={<FiAlignCenter class="w-4 h-4" />} />
                <ToolbarButton action="align-right" label="Align Right" icon={<FiAlignRight class="w-4 h-4" />} />
                <div class="w-px h-6 bg-border-subtle mx-1" />

                <ToolbarButton action="hr" label="Horizontal Rule" icon={<FiMinus class="w-4 h-4" />} />
                <ToolbarButton action="table" label="Insert Table" icon={<FiTable class="w-4 h-4" />} />
                <ToolbarButton action="link" label="Link" icon={<FiLink class="w-4 h-4" />} />
                <ToolbarButton action="image" label="Image" icon={<FiImage class="w-4 h-4" />} />
              </div>
            </Show>

            {/* Top bar - Edit/Read toggle + Save indicator */}
            <div class="bg-bg-secondary border-b border-border-subtle px-4 py-2 flex items-center justify-between shrink-0">
              <button
                onClick={toggleEditMode}
                class={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors
                  ${isEditing()
                    ? 'bg-accent/20 text-accent'
                    : 'text-text-secondary hover:text-text-primary hover:bg-bg-tertiary'}`}
              >
                <Show when={isEditing()} fallback={<FiEdit2 class="w-4 h-4" />}>
                  <FiEye class="w-4 h-4" />
                </Show>
                {isEditing() ? 'Reading Mode' : 'Edit Mode'}
              </button>

              <Show when={isEditing()}>
                <div class="flex items-center gap-1.5 text-xs">
                  <Show when={saved()} fallback={
                    <div class="w-3 h-3 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                  }>
                    <svg class="w-3.5 h-3.5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </Show>
                  <span class="text-text-primary">
                    {saved() ? 'Saved' : 'Saving...'}
                  </span>
                </div>
              </Show>
            </div>

            {/* Editor area */}
            <div class="flex-1 overflow-y-auto">
              <div class="max-w-5xl mx-auto px-8 py-6">
                <div class="flex items-center justify-between mb-6">
                  <h1 class="text-3xl font-bold text-text-primary">
                    {currentNote()?.title}
                  </h1>
                  <button
                    onClick={() => setSelectedNoteId(null)}
                    class="p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-tertiary transition-colors shrink-0"
                    title="Close editor"
                  >
                    <FiX class="w-5 h-5" />
                  </button>
                </div>
                <div
                  data-editor-container
                  class={`bg-bg-secondary rounded-lg p-4 transition-all
                    ${!isEditing() ? 'opacity-90' : ''}`}
                  style={{ "min-height": "400px" }}
                />
              </div>
            </div>
          </>
        </Show>
      </Show>
    </div>
  )
}
