import { Video, Collection } from '../types.ts';

const STORAGE_KEY = 'llumina_vault_v2';
const COLLECTIONS_KEY = 'llumina_collections_v2';

const DEFAULT_COLLECTIONS: Collection[] = [
  { id: 'default', name: 'General Intelligence', icon: 'brain' },
  { id: 'research', name: 'Technical Research', icon: 'microscope' },
  { id: 'aesthetic', name: 'Aesthetic Inspiration', icon: 'sparkles' },
  { id: 'archive', name: 'Deep Archive', icon: 'archive' }
];

export const storageService = {
  getVideos: (): Video[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      return [];
    }
  },

  saveVideos: (videos: Video[]): void => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(videos));
  },

  getCollections: (): Collection[] => {
    try {
      const data = localStorage.getItem(COLLECTIONS_KEY);
      return data ? JSON.parse(data) : DEFAULT_COLLECTIONS;
    } catch (error) {
      return DEFAULT_COLLECTIONS;
    }
  },

  saveCollections: (cols: Collection[]): void => {
    localStorage.setItem(COLLECTIONS_KEY, JSON.stringify(cols));
  },

  exportData: () => {
    const data = {
      videos: storageService.getVideos(),
      collections: storageService.getCollections(),
      version: '2.0',
      timestamp: Date.now()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `llumina-vault-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  },

  importData: async (file: File): Promise<boolean> => {
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      if (data.videos) storageService.saveVideos(data.videos);
      if (data.collections) storageService.saveCollections(data.collections);
      return true;
    } catch (e) {
      console.error('Import failed', e);
      return false;
    }
  }
};