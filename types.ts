
export enum VideoStatus {
  UNWATCHED = 'unwatched',
  WATCHING = 'watching',
  WATCHED = 'watched'
}

export interface VideoMetadata {
  title: string;
  channelName: string;
  thumbnailUrl: string;
  duration?: string;
  publishedAt?: string;
}

export interface Video {
  id: string; // Internal unique ID
  youtubeId: string; // The v=... ID
  url: string;
  metadata: VideoMetadata;
  status: VideoStatus;
  addedAt: number;
  // Extensible for future features like folders, tags, notes
  customData?: Record<string, any>;
}

export interface AppState {
  videos: Video[];
  isLoading: boolean;
  error: string | null;
}
