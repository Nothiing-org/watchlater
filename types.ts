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
  isMusic?: boolean;
  category?: string;
  summary?: string;
  tags?: string[];
}

export interface Collection {
  id: string;
  name: string;
  icon: string;
}

export interface Video {
  id: string;
  youtubeId: string;
  url: string;
  metadata: VideoMetadata;
  status: VideoStatus;
  addedAt: number;
  collectionId?: string;
}

export interface AppState {
  videos: Video[];
  collections: Collection[];
  isLoading: boolean;
  error: string | null;
  activeView: 'library' | 'dashboard' | 'discover';
  activeCollectionId: string | null;
  searchQuery: string;
}