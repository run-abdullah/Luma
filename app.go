package main

import (
	"context"
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"sort"
	"strings"
	"time"

	"github.com/wailsapp/wails/v2/pkg/runtime"
)

// App struct
type App struct {
	ctx context.Context
}

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{}
}

// startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
}

// Types
type Collection struct {
	ID        string  `json:"id"`
	Name      string  `json:"name"`
	ParentID  *string `json:"parentId"`
	Path      string  `json:"path"`
	HasNotes  bool    `json:"hasNotes"`
	CreatedAt string  `json:"createdAt"`
	UpdatedAt string  `json:"updatedAt"`
}

type Note struct {
	ID        string          `json:"id"`
	Title     string          `json:"title"`
	Content   json.RawMessage `json:"content"`
	Path      string          `json:"path"`
	CreatedAt string          `json:"createdAt"`
	UpdatedAt string          `json:"updatedAt"`
}

type Vault struct {
	ID        string `json:"id"`
	Name      string `json:"name"`
	Path      string `json:"path"`
	CreatedAt string `json:"createdAt"`
	UpdatedAt string `json:"updatedAt"`
}

// Greet returns a greeting for the given name
func (a *App) Greet(name string) string {
	return fmt.Sprintf("Hello %s, It's show time!", name)
}

// ImportVault opens folder picker and imports folder as vault
func (a *App) ImportVault() (*Vault, error) {
	path, err := runtime.OpenDirectoryDialog(a.ctx, runtime.OpenDialogOptions{
		Title: "Select Vault Folder",
	})

	if err != nil {
		return nil, err
	}

	if path == "" {
		return nil, nil
	}

	info, err := os.Stat(path)
	if err != nil {
		return nil, fmt.Errorf("folder does not exist: %w", err)
	}

	if !info.IsDir() {
		return nil, fmt.Errorf("not a folder")
	}

	// Save vault path
	if err := a.SaveVaultPath(path); err != nil {
		fmt.Printf("Warning: Could not save vault path: %v\n", err)
	}

	vault := &Vault{
		ID:        filepath.Base(path),
		Name:      filepath.Base(path),
		Path:      path,
		CreatedAt: info.ModTime().Format(time.RFC3339),
		UpdatedAt: info.ModTime().Format(time.RFC3339),
	}

	return vault, nil
}

// GetCollections scans vault and returns all collections (folders)
func (a *App) GetCollections(vaultPath string) ([]Collection, error) {
	var collections []Collection

	err := filepath.Walk(vaultPath, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}

		// Skip root vault folder
		if path == vaultPath {
			return nil
		}

		// Skip hidden files/folders
		if filepath.Base(path)[0] == '.' {
			if info.IsDir() {
				return filepath.SkipDir
			}
			return nil
		}

		if info.IsDir() {
			var parentID *string
			parentPath := filepath.Dir(path)
			if parentPath != vaultPath {
				parentID = &parentPath
			}

			// Check if folder has notes (json files directly inside)
			hasNotes := false
			files, _ := os.ReadDir(path)
			for _, file := range files {
				if !file.IsDir() && filepath.Ext(file.Name()) == ".json" {
					hasNotes = true
					break
				}
			}

			collections = append(collections, Collection{
				ID:        path,
				Name:      filepath.Base(path),
				ParentID:  parentID,
				Path:      path,
				HasNotes:  hasNotes,
				CreatedAt: info.ModTime().Format(time.RFC3339),
				UpdatedAt: info.ModTime().Format(time.RFC3339),
			})
		}

		return nil
	})

	if err != nil {
		return nil, err
	}

	// Sort by name
	sort.Slice(collections, func(i, j int) bool {
		return collections[i].Name < collections[j].Name
	})

	return collections, nil
}

// GetNotes returns all notes in a collection
func (a *App) GetNotes(collectionPath string) ([]Note, error) {
	var notes []Note

	files, err := os.ReadDir(collectionPath)
	if err != nil {
		return nil, err
	}

	for _, file := range files {
		if !file.IsDir() && filepath.Ext(file.Name()) == ".json" {
			filePath := filepath.Join(collectionPath, file.Name())

			data, err := os.ReadFile(filePath)
			if err != nil {
				continue
			}

			var noteData struct {
				Title   string          `json:"title"`
				Content json.RawMessage `json:"content"`
			}

			if err := json.Unmarshal(data, &noteData); err != nil {
				continue
			}

			info, _ := file.Info()
			notes = append(notes, Note{
				ID:        filePath,
				Title:     noteData.Title,
				Content:   noteData.Content,
				Path:      filePath,
				CreatedAt: info.ModTime().Format(time.RFC3339),
				UpdatedAt: info.ModTime().Format(time.RFC3339),
			})
		}
	}

	// Sort by updated time (most recent first)
	sort.Slice(notes, func(i, j int) bool {
		return notes[i].UpdatedAt > notes[j].UpdatedAt
	})

	return notes, nil
}

// ReadNote reads a single note file
func (a *App) ReadNote(notePath string) (*Note, error) {
	data, err := os.ReadFile(notePath)
	if err != nil {
		return nil, err
	}

	var noteData struct {
		Title   string          `json:"title"`
		Content json.RawMessage `json:"content"`
	}

	if err := json.Unmarshal(data, &noteData); err != nil {
		return nil, err
	}

	info, _ := os.Stat(notePath)

	return &Note{
		ID:        notePath,
		Title:     noteData.Title,
		Content:   noteData.Content,
		Path:      notePath,
		CreatedAt: info.ModTime().Format(time.RFC3339),
		UpdatedAt: info.ModTime().Format(time.RFC3339),
	}, nil
}

// CreateCollection creates a new folder
func (a *App) CreateCollection(parentPath string, name string) (*Collection, error) {
	newPath := filepath.Join(parentPath, name)

	if err := os.MkdirAll(newPath, 0755); err != nil {
		return nil, err
	}

	info, _ := os.Stat(newPath)

	var parentID *string
	if parentPath != "" {
		parentID = &parentPath
	}

	return &Collection{
		ID:        newPath,
		Name:      name,
		ParentID:  parentID,
		Path:      newPath,
		HasNotes:  false,
		CreatedAt: info.ModTime().Format(time.RFC3339),
		UpdatedAt: info.ModTime().Format(time.RFC3339),
	}, nil
}

// CreateNote creates a new note file
func (a *App) CreateNote(collectionPath string, title string) (*Note, error) {
	noteData := struct {
		Title   string          `json:"title"`
		Content json.RawMessage `json:"content"`
	}{
		Title:   title,
		Content: json.RawMessage(`{"type":"doc","content":[{"type":"paragraph","content":[]}]}`),
	}

	data, _ := json.MarshalIndent(noteData, "", "  ")
	notePath := filepath.Join(collectionPath, title+".json")

	if err := os.WriteFile(notePath, data, 0644); err != nil {
		return nil, err
	}

	info, _ := os.Stat(notePath)

	return &Note{
		ID:        notePath,
		Title:     title,
		Content:   noteData.Content,
		Path:      notePath,
		CreatedAt: info.ModTime().Format(time.RFC3339),
		UpdatedAt: info.ModTime().Format(time.RFC3339),
	}, nil
}

// SaveNote saves note content to file
func (a *App) SaveNote(notePath string, title string, content json.RawMessage) error {
	noteData := struct {
		Title   string          `json:"title"`
		Content json.RawMessage `json:"content"`
	}{
		Title:   title,
		Content: content,
	}

	data, err := json.MarshalIndent(noteData, "", "  ")
	if err != nil {
		return err
	}

	return os.WriteFile(notePath, data, 0644)
}

// DeleteCollection removes a folder
func (a *App) DeleteCollection(path string) error {
	return os.RemoveAll(path)
}

// DeleteNote removes a note file
func (a *App) DeleteNote(path string) error {
	return os.Remove(path)
}

// RenameCollection renames a folder
func (a *App) RenameCollection(path string, newName string) error {
	newPath := filepath.Join(filepath.Dir(path), newName)
	return os.Rename(path, newPath)
}

// RenameNote renames a note file
func (a *App) RenameNote(notePath string, newTitle string) (*Note, error) {

	data, err := os.ReadFile(notePath)
	if err != nil {
		return nil, err
	}

	var noteData struct {
		Title   string          `json:"title"`
		Content json.RawMessage `json:"content"`
	}

	if err := json.Unmarshal(data, &noteData); err != nil {
		return nil, err
	}

	noteData.Title = newTitle

	updatedData, err := json.MarshalIndent(noteData, "", "  ")
	if err != nil {
		return nil, err
	}

	newPath := filepath.Join(filepath.Dir(notePath), newTitle+".json")
	if err := os.Rename(notePath, newPath); err != nil {
		return nil, err
	}

	if err := os.WriteFile(newPath, updatedData, 0644); err != nil {
		return nil, err
	}

	return a.ReadNote(newPath)
}

// SearchNotes searches notes by title and content
func (a *App) SearchNotes(vaultPath string, query string) ([]Note, error) {
	var results []Note

	if query == "" {
		return results, nil
	}

	query = strings.ToLower(query)

	err := filepath.Walk(vaultPath, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}

		// Skip hidden files/folders
		if filepath.Base(path)[0] == '.' {
			if info.IsDir() {
				return filepath.SkipDir
			}
			return nil
		}

		// Only search JSON files
		if !info.IsDir() && filepath.Ext(path) == ".json" {
			data, err := os.ReadFile(path)
			if err != nil {
				return nil
			}

			var noteData struct {
				Title   string          `json:"title"`
				Content json.RawMessage `json:"content"`
			}

			if err := json.Unmarshal(data, &noteData); err != nil {
				return nil
			}

			// Search in title
			titleMatch := strings.Contains(strings.ToLower(noteData.Title), query)

			// Search in content
			contentStr := string(noteData.Content)
			contentMatch := strings.Contains(strings.ToLower(contentStr), query)

			if titleMatch || contentMatch {
				results = append(results, Note{
					ID:        path,
					Title:     noteData.Title,
					Content:   noteData.Content,
					Path:      path,
					CreatedAt: info.ModTime().Format(time.RFC3339),
					UpdatedAt: info.ModTime().Format(time.RFC3339),
				})
			}
		}

		return nil
	})

	if err != nil {
		return nil, err
	}

	// Sort by updated time
	sort.Slice(results, func(i, j int) bool {
		return results[i].UpdatedAt > results[j].UpdatedAt
	})

	return results, nil
}

// Config file path
func (a *App) getConfigPath() string {
	homeDir, _ := os.UserHomeDir()
	return filepath.Join(homeDir, ".luma", "config.json")
}

// SaveVaultPath saves vault path to config
func (a *App) SaveVaultPath(vaultPath string) error {
	configDir := filepath.Dir(a.getConfigPath())
	if err := os.MkdirAll(configDir, 0755); err != nil {
		return err
	}

	config := struct {
		VaultPath string `json:"vaultPath"`
	}{
		VaultPath: vaultPath,
	}

	data, err := json.MarshalIndent(config, "", "  ")
	if err != nil {
		return err
	}

	return os.WriteFile(a.getConfigPath(), data, 0644)
}

// LoadVaultPath loads vault path from config
func (a *App) LoadVaultPath() (string, error) {
	data, err := os.ReadFile(a.getConfigPath())
	if err != nil {
		return "", nil // No config file yet
	}

	var config struct {
		VaultPath string `json:"vaultPath"`
	}

	if err := json.Unmarshal(data, &config); err != nil {
		return "", err
	}

	return config.VaultPath, nil
}

// GetVault loads vault info from saved path
func (a *App) GetVault() (*Vault, error) {
	vaultPath, err := a.LoadVaultPath()
	if err != nil || vaultPath == "" {
		return nil, nil
	}

	// Check if folder exists
	info, err := os.Stat(vaultPath)
	if err != nil {
		return nil, nil // Folder not found, ignore
	}

	if !info.IsDir() {
		return nil, nil
	}

	vault := &Vault{
		ID:        filepath.Base(vaultPath),
		Name:      filepath.Base(vaultPath),
		Path:      vaultPath,
		CreatedAt: info.ModTime().Format(time.RFC3339),
		UpdatedAt: info.ModTime().Format(time.RFC3339),
	}

	return vault, nil
}
