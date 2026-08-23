# Luma 📝

A beautiful, fast, and minimal note-taking app built with Wails (Go) and SolidJS.

![Luma](build/appicon.png)

## ✨ Features

- 📂 **Vault System** - Import any folder as your notes vault
- 📁 **Collections** - Organize notes in nested folders
- 📝 **Rich Text Editor** - Full-featured TipTap editor with tables, code blocks, images, and more
- 🔍 **Instant Search** - Search across all your notes by title or content
- 🎨 **Themes** - 5+ built-in themes with custom theme creator
- 🌙 **Dark/Light Mode** - Toggle between dark and light appearance
- 📐 **Resizable Panels** - Customize your workspace layout
- 💾 **Auto-Save** - Your notes save automatically as you type
- ⚡ **Blazing Fast** - Built with SolidJS and Go for instant performance
- 📦 **Lightweight** - Only 10MB binary, unlike Electron apps

## 🚀 Tech Stack

- **Backend:** Go with Wails framework
- **Frontend:** SolidJS + Vite
- **Editor:** TipTap
- **Styling:** Tailwind CSS v4

## 📦 Installation

### From Source

```bash
# Clone the repository
git clone git@github.com:run-abdullah/Luma.git
cd Luma

# Install dependencies
cd frontend
pnpm install
cd ..

# Run in development
wails dev -tags webkit2_41

# Build for production
wails build -tags webkit2_41
