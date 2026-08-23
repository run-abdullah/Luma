  // Collection (folder) type
  export interface Collection {
    id: string
    name: string
    parentId: string | null
    hasNotes: boolean
    createdAt: string
    updatedAt: string
  }

  // Note type
  export interface Note {
    id: string
    collectionId: string
    title: string
    content: string
    createdAt: string
    updatedAt: string
  }

  // Vault type (top level)
  export interface Vault {
    id: string
    name: string
    path: string
    collections: Collection[]
    createdAt: string
    updatedAt: string
  }
