export interface WarpcastPost {
  content: string;
  media?: {
    url: string;
    type: 'image' | 'video';
  }[];
  scheduledTime: Date;
  status: 'draft' | 'scheduled' | 'published' | 'failed';
}

export interface WarpcastConfig {
  enabled: boolean;
  username?: string;
}
