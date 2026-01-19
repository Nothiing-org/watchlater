import { Video } from '../types.ts';

const STORAGE_KEY = 'watchlater_videos_v1';

export const storageService = {
  getVideos: (): Video[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Failed to load videos from storage', error);
      return [];
    }
  },

  saveVideos: (videos: Video[]): void => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(videos));
    } catch (error) {
      console.error('Failed to save videos to storage', error);
    }
  }
};